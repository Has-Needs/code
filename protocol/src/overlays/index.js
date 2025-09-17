/**
 * Overlays Manager
 * Handles compartmentalized knowledge overlays and sovereignty
 */

import { EventEmitter } from 'eventemitter3';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('Overlays');

/**
 * Overlay types for different kinds of knowledge and data
 */
const OVERLAY_TYPES = {
  KNOWLEDGE: 'knowledge',       // Wisdom, protocols, expertise
  REPUTATION: 'reputation',     // Trust, validation history
  CREDENTIALS: 'credentials',   // Proofs, certifications
  CONTEXT: 'context',          // Environmental, situational data
  CULTURAL: 'cultural',        // Indigenous knowledge, traditions
  TEMPORAL: 'temporal'         // Time-bound information
};

/**
 * Access levels for overlay visibility
 */
const ACCESS_LEVELS = {
  PUBLIC: 'public',           // Visible to all
  COMMUNITY: 'community',     // Visible to community members
  PRIVATE: 'private',         // Visible only to owner
  RESTRICTED: 'restricted'    // Visible to specific entities only
};

export class OverlaysManager extends EventEmitter {
  constructor(config = {}) {
    super();
    this.config = config;
    this.identity = config.identity;
    this.protocol = config.protocol;
    this.network = config.network;
    
    // Overlay storage
    this.overlays = new Map(); // overlayId -> Overlay
    this.myOverlays = new Map(); // overlayId -> MyOverlay
    this.subscriptions = new Map(); // overlayId -> Subscription
    
    // Access control
    this.accessControls = new Map(); // overlayId -> AccessControl
    this.permissions = new Map(); // entityId -> Permissions
    
    // Synchronization state
    this.syncState = new Map(); // peerId -> SyncState
    
    // Configuration
    this.maxOverlays = config.maxOverlays || 1000;
    this.syncInterval = config.syncInterval || 30000; // 30 seconds
    
    // Metrics
    this.metrics = {
      overlaysCreated: 0,
      overlaysReceived: 0,
      syncRequests: 0,
      accessDenials: 0,
      knowledgeShared: 0
    };

    logger.info('Overlays Manager initialized');
  }

  async initialize() {
    try {
      logger.info('Initializing overlays manager...');
      
      // Initialize default overlays
      await this._createDefaultOverlays();
      
      // Initialize access control
      await this._initializeAccessControl();
      
      logger.info('Overlays manager initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize overlays manager:', error);
      throw error;
    }
  }

  async start() {
    logger.info('Starting overlays manager...');
    
    // Start synchronization
    this._startSynchronization();
    
    logger.info('Overlays manager started');
  }

  async stop() {
    logger.info('Stopping overlays manager...');
    
    // Stop synchronization
    this._stopSynchronization();
    
    logger.info('Overlays manager stopped');
  }

  /**
   * Create a new overlay
   */
  async createOverlay(type, data, options = {}) {
    try {
      const overlay = {
        id: this._generateOverlayId(),
        type,
        data,
        creator: this.identity.nodeId,
        created: Date.now(),
        version: 1,
        accessLevel: options.accessLevel || ACCESS_LEVELS.PRIVATE,
        context: options.context || {},
        permissions: options.permissions || {},
        signature: null // Will be signed
      };

      // Sign the overlay
      await this._signOverlay(overlay);
      
      // Store locally
      this.myOverlays.set(overlay.id, overlay);
      this.overlays.set(overlay.id, overlay);
      
      // Set up access control
      await this._setupOverlayAccess(overlay, options);
      
      this.metrics.overlaysCreated++;
      this.emit('overlay:created', overlay);
      
      logger.debug(`Created overlay: ${overlay.id} (${type})`);
      return overlay;
    } catch (error) {
      logger.error('Error creating overlay:', error);
      throw error;
    }
  }

  /**
   * Update an existing overlay
   */
  async updateOverlay(overlayId, data, options = {}) {
    const overlay = this.myOverlays.get(overlayId);
    if (!overlay) {
      throw new Error(`Overlay not found or not owned: ${overlayId}`);
    }

    // Create updated version
    const updatedOverlay = {
      ...overlay,
      data,
      version: overlay.version + 1,
      updated: Date.now(),
      context: { ...overlay.context, ...options.context }
    };

    // Re-sign
    await this._signOverlay(updatedOverlay);
    
    // Update storage
    this.myOverlays.set(overlayId, updatedOverlay);
    this.overlays.set(overlayId, updatedOverlay);
    
    this.emit('overlay:updated', updatedOverlay);
    
    logger.debug(`Updated overlay: ${overlayId} to version ${updatedOverlay.version}`);
    return updatedOverlay;
  }

  /**
   * Delete an overlay
   */
  async deleteOverlay(overlayId) {
    const overlay = this.myOverlays.get(overlayId);
    if (!overlay) {
      throw new Error(`Overlay not found or not owned: ${overlayId}`);
    }

    // Remove from storage
    this.myOverlays.delete(overlayId);
    this.overlays.delete(overlayId);
    this.accessControls.delete(overlayId);
    
    this.emit('overlay:deleted', overlay);
    
    logger.debug(`Deleted overlay: ${overlayId}`);
    return true;
  }

  /**
   * Get overlay by ID
   */
  async getOverlay(overlayId, requesterId = null) {
    const overlay = this.overlays.get(overlayId);
    if (!overlay) {
      return null;
    }

    // Check access permissions
    const hasAccess = await this._checkAccess(overlay, requesterId || this.identity.nodeId);
    if (!hasAccess) {
      this.metrics.accessDenials++;
      logger.warn(`Access denied to overlay ${overlayId} for requester ${requesterId}`);
      return null;
    }

    return overlay;
  }

  /**
   * Query overlays by criteria
   */
  async queryOverlays(criteria = {}, requesterId = null) {
    const results = [];
    
    for (const [overlayId, overlay] of this.overlays) {
      // Check access first
      const hasAccess = await this._checkAccess(overlay, requesterId || this.identity.nodeId);
      if (!hasAccess) continue;
      
      // Apply criteria filters
      if (this._matchesCriteria(overlay, criteria)) {
        results.push(overlay);
      }
    }
    
    // Sort by relevance/recency
    results.sort((a, b) => {
      if (criteria.sortBy === 'created') {
        return b.created - a.created;
      }
      return b.version - a.version; // Default to version
    });
    
    return results.slice(0, criteria.limit || 50);
  }

  /**
   * Share overlay with specific entities
   */
  async shareOverlay(overlayId, entities, permissions = {}) {
    const overlay = this.myOverlays.get(overlayId);
    if (!overlay) {
      throw new Error(`Overlay not found or not owned: ${overlayId}`);
    }

    const accessControl = this.accessControls.get(overlayId) || {
      owner: this.identity.nodeId,
      shared: new Map(),
      restrictions: {}
    };

    // Add entities to access list
    for (const entity of entities) {
      accessControl.shared.set(entity, {
        permissions: {
          read: true,
          write: false,
          share: false,
          ...permissions
        },
        grantedAt: Date.now(),
        grantedBy: this.identity.nodeId
      });
    }

    this.accessControls.set(overlayId, accessControl);
    
    this.metrics.knowledgeShared++;
    this.emit('overlay:shared', { overlayId, entities, permissions });
    
    logger.debug(`Shared overlay ${overlayId} with ${entities.length} entities`);
    return true;
  }

  /**
   * Revoke access to overlay
   */
  async revokeAccess(overlayId, entities) {
    const overlay = this.myOverlays.get(overlayId);
    if (!overlay) {
      throw new Error(`Overlay not found or not owned: ${overlayId}`);
    }

    const accessControl = this.accessControls.get(overlayId);
    if (!accessControl) {
      return false;
    }

    // Remove entities from access list
    for (const entity of entities) {
      accessControl.shared.delete(entity);
    }

    this.emit('overlay:access-revoked', { overlayId, entities });
    
    logger.debug(`Revoked access to overlay ${overlayId} for ${entities.length} entities`);
    return true;
  }

  /**
   * Process Need triplet for overlay matching
   */
  async processNeed(needTriplet) {
    try {
      // Find overlays that might satisfy this need
      const matchingOverlays = await this._findMatchingOverlays(needTriplet);
      
      for (const overlay of matchingOverlays) {
        // Check if we can share this overlay
        if (await this._canShareOverlay(overlay, needTriplet.entity)) {
          this.emit('overlay:match', { need: needTriplet, overlay });
        }
      }
    } catch (error) {
      logger.error('Error processing need for overlays:', error);
    }
  }

  /**
   * Process Has triplet for overlay creation
   */
  async processHas(hasTriplet) {
    try {
      // Check if this has represents knowledge/expertise that should become an overlay
      if (this._isKnowledgeResource(hasTriplet.object)) {
        const overlay = await this.createOverlay(
          OVERLAY_TYPES.KNOWLEDGE,
          {
            resource: hasTriplet.object,
            entity: hasTriplet.entity,
            context: hasTriplet.context
          },
          {
            accessLevel: ACCESS_LEVELS.COMMUNITY,
            context: { 
              source: 'has-triplet',
              tripletId: hasTriplet.id
            }
          }
        );
        
        logger.debug(`Created knowledge overlay from has triplet: ${overlay.id}`);
      }
    } catch (error) {
      logger.error('Error processing has for overlays:', error);
    }
  }

  /**
   * Process overlay received from peer
   */
  async processPeerOverlay(overlayData, fromPeerId) {
    try {
      logger.debug(`Processing overlay from peer ${fromPeerId}: ${overlayData.id}`);
      
      // Validate overlay
      if (!await this._validatePeerOverlay(overlayData, fromPeerId)) {
        logger.warn(`Invalid overlay from peer ${fromPeerId}: ${overlayData.id}`);
        return false;
      }
      
      // Check if we already have this overlay
      if (this.overlays.has(overlayData.id)) {
        // Check version and update if newer
        const existing = this.overlays.get(overlayData.id);
        if (overlayData.version > existing.version) {
          this.overlays.set(overlayData.id, overlayData);
          this.emit('overlay:updated', overlayData);
        }
        return true;
      }
      
      // Store new overlay
      this.overlays.set(overlayData.id, overlayData);
      this.metrics.overlaysReceived++;
      
      this.emit('overlay:received', overlayData, fromPeerId);
      return true;
    } catch (error) {
      logger.error(`Error processing overlay from peer ${fromPeerId}:`, error);
      return false;
    }
  }

  /**
   * Get overlays information
   */
  async getOverlaysInfo() {
    return {
      totalOverlays: this.overlays.size,
      myOverlays: this.myOverlays.size,
      subscriptions: this.subscriptions.size,
      types: this._getOverlayTypeBreakdown(),
      accessLevels: this._getAccessLevelBreakdown(),
      metrics: { ...this.metrics }
    };
  }

  // Private methods

  _generateOverlayId() {
    return `overlay_${this.identity.nodeId}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  }

  async _signOverlay(overlay) {
    // Simple signature for now - would use proper cryptography in production
    overlay.signature = `sig_${this.identity.nodeId}_${overlay.id}_${overlay.version}`;
  }

  async _createDefaultOverlays() {
    // Create node info overlay
    await this.createOverlay(
      OVERLAY_TYPES.CONTEXT,
      {
        nodeInfo: this.identity.getPublicIdentity(),
        capabilities: ['has-needs-protocol'],
        location: this.config.location || null
      },
      {
        accessLevel: ACCESS_LEVELS.PUBLIC,
        context: { type: 'node-info' }
      }
    );
  }

  async _initializeAccessControl() {
    // Set up default permissions for this node
    this.permissions.set(this.identity.nodeId, {
      createOverlays: true,
      readPublic: true,
      readCommunity: true,
      readPrivate: true,
      shareKnowledge: true
    });
  }

  async _setupOverlayAccess(overlay, options) {
    const accessControl = {
      owner: this.identity.nodeId,
      shared: new Map(),
      restrictions: options.restrictions || {}
    };
    
    // Add initial shared entities if specified
    if (options.sharedWith) {
      for (const entity of options.sharedWith) {
        accessControl.shared.set(entity, {
          permissions: { read: true, write: false, share: false },
          grantedAt: Date.now(),
          grantedBy: this.identity.nodeId
        });
      }
    }
    
    this.accessControls.set(overlay.id, accessControl);
  }

  async _checkAccess(overlay, requesterId) {
    // Owner always has access
    if (overlay.creator === requesterId) {
      return true;
    }
    
    // Check access level
    switch (overlay.accessLevel) {
      case ACCESS_LEVELS.PUBLIC:
        return true;
      
      case ACCESS_LEVELS.COMMUNITY:
        // For now, all nodes are considered community members
        return true;
      
      case ACCESS_LEVELS.PRIVATE:
        return overlay.creator === requesterId;
      
      case ACCESS_LEVELS.RESTRICTED:
        const accessControl = this.accessControls.get(overlay.id);
        if (!accessControl) return false;
        return accessControl.shared.has(requesterId);
      
      default:
        return false;
    }
  }

  _matchesCriteria(overlay, criteria) {
    if (criteria.type && overlay.type !== criteria.type) {
      return false;
    }
    
    if (criteria.creator && overlay.creator !== criteria.creator) {
      return false;
    }
    
    if (criteria.accessLevel && overlay.accessLevel !== criteria.accessLevel) {
      return false;
    }
    
    if (criteria.keywords) {
      const content = JSON.stringify(overlay.data).toLowerCase();
      for (const keyword of criteria.keywords) {
        if (!content.includes(keyword.toLowerCase())) {
          return false;
        }
      }
    }
    
    if (criteria.context) {
      for (const [key, value] of Object.entries(criteria.context)) {
        if (overlay.context[key] !== value) {
          return false;
        }
      }
    }
    
    return true;
  }

  async _findMatchingOverlays(needTriplet) {
    const matches = [];
    const needResource = needTriplet.object;
    
    for (const [overlayId, overlay] of this.overlays) {
      if (overlay.type === OVERLAY_TYPES.KNOWLEDGE) {
        // Simple keyword matching for now
        const overlayContent = JSON.stringify(overlay.data).toLowerCase();
        const needContent = needResource.toLowerCase();
        
        if (overlayContent.includes(needContent) || 
            needContent.includes(overlayContent)) {
          matches.push(overlay);
        }
      }
    }
    
    return matches;
  }

  async _canShareOverlay(overlay, requesterEntity) {
    // Check if overlay can be shared with the requesting entity
    const hasAccess = await this._checkAccess(overlay, requesterEntity);
    if (!hasAccess) return false;
    
    // Check if overlay has sharing restrictions
    const accessControl = this.accessControls.get(overlay.id);
    if (accessControl && accessControl.restrictions.noShare) {
      return false;
    }
    
    return true;
  }

  _isKnowledgeResource(resource) {
    if (typeof resource !== 'string') return false;
    
    const knowledgeKeywords = [
      'expertise', 'skill', 'knowledge', 'wisdom', 'protocol',
      'method', 'technique', 'experience', 'guidance', 'advice'
    ];
    
    const resourceLower = resource.toLowerCase();
    return knowledgeKeywords.some(keyword => resourceLower.includes(keyword));
  }

  async _validatePeerOverlay(overlayData, fromPeerId) {
    // Validate structure
    const requiredFields = ['id', 'type', 'data', 'creator', 'created', 'version'];
    for (const field of requiredFields) {
      if (!overlayData[field]) {
        return false;
      }
    }
    
    // Validate signature (simplified)
    if (overlayData.signature && !overlayData.signature.includes(overlayData.creator)) {
      return false;
    }
    
    return true;
  }

  _getOverlayTypeBreakdown() {
    const breakdown = {};
    for (const overlay of this.overlays.values()) {
      breakdown[overlay.type] = (breakdown[overlay.type] || 0) + 1;
    }
    return breakdown;
  }

  _getAccessLevelBreakdown() {
    const breakdown = {};
    for (const overlay of this.overlays.values()) {
      breakdown[overlay.accessLevel] = (breakdown[overlay.accessLevel] || 0) + 1;
    }
    return breakdown;
  }

  _startSynchronization() {
    this.syncInterval = setInterval(async () => {
      await this._synchronizeOverlays();
    }, this.syncInterval);
  }

  _stopSynchronization() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  async _synchronizeOverlays() {
    // Simple synchronization - broadcast our public overlays
    const publicOverlays = [];
    
    for (const [overlayId, overlay] of this.myOverlays) {
      if (overlay.accessLevel === ACCESS_LEVELS.PUBLIC) {
        publicOverlays.push(overlay);
      }
    }
    
    if (publicOverlays.length > 0) {
      this.emit('overlay:sync', publicOverlays);
      this.metrics.syncRequests++;
    }
  }
}

export { OVERLAY_TYPES, ACCESS_LEVELS };