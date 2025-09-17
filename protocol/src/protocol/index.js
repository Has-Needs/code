/**
 * Has-Needs Protocol Core
 * Implements the triple-function data model [Entity, Relation, Context]
 */

import { EventEmitter } from 'eventemitter3';
import { Triplet } from './triplets/index.js';
import { ValidationEngine } from './validation/index.js';
import { ConsensusManager } from './consensus/index.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('Protocol');

export class HasNeedsProtocol extends EventEmitter {
  constructor(config = {}) {
    super();
    this.config = config;
    this.identity = config.identity;
    
    // Protocol state
    this.triplets = new Map(); // tripletId -> Triplet
    this.needs = new Map();    // needId -> Need triplet
    this.has = new Map();      // hasId -> Has triplet
    this.committed = new Map(); // commitId -> Committed triplet
    
    // Core engines
    this.validation = null;
    this.consensus = null;
    
    // Protocol metrics
    this.metrics = {
      tripletsProcessed: 0,
      needsCreated: 0,
      hasCreated: 0,
      matchesMade: 0,
      validationSuccesses: 0,
      validationFailures: 0
    };

    logger.info('Has-Needs Protocol initialized');
  }

  async initialize() {
    try {
      logger.info('Initializing protocol engines...');

      // Initialize validation engine
      this.validation = new ValidationEngine({
        identity: this.identity,
        protocol: this,
        ...this.config
      });
      await this.validation.initialize();

      // Initialize consensus manager
      this.consensus = new ConsensusManager({
        identity: this.identity,
        protocol: this,
        validation: this.validation,
        ...this.config
      });
      await this.consensus.initialize();

      // Wire up validation events
      this.validation.on('triplet:validated', (triplet) => {
        this._handleValidatedTriplet(triplet);
      });

      this.validation.on('triplet:invalid', (triplet, reason) => {
        this._handleInvalidTriplet(triplet, reason);
      });

      // Wire up consensus events
      this.consensus.on('consensus:reached', (triplet) => {
        this._handleConsensusReached(triplet);
      });

      logger.info('Protocol engines initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize protocol:', error);
      throw error;
    }
  }

  async start() {
    logger.info('Starting protocol services...');
    
    if (this.validation) await this.validation.start();
    if (this.consensus) await this.consensus.start();
    
    // Start periodic maintenance
    this._startMaintenance();
    
    logger.info('Protocol services started');
  }

  async stop() {
    logger.info('Stopping protocol services...');
    
    if (this.consensus) await this.consensus.stop();
    if (this.validation) await this.validation.stop();
    
    // Stop maintenance
    this._stopMaintenance();
    
    logger.info('Protocol services stopped');
  }

  /**
   * Create a new Need triplet
   * Format: [Entity, needs, Resource | Context]
   */
  async createNeed(entity, resource, context = {}) {
    try {
      const triplet = new Triplet({
        entity,
        relation: 'needs',
        object: resource,
        context: {
          timestamp: Date.now(),
          location: context.location,
          urgency: context.urgency || 'normal',
          expires: context.expires,
          ...context
        },
        creator: this.identity.nodeId,
        signature: null // Will be signed during validation
      });

      // Validate the triplet
      const isValid = await this.validation.validateTriplet(triplet);
      if (!isValid) {
        throw new Error('Invalid Need triplet');
      }

      // Store and broadcast
      this.needs.set(triplet.id, triplet);
      this.triplets.set(triplet.id, triplet);
      this.metrics.needsCreated++;

      this.emit('need:created', triplet);
      this.emit('triplet:created', triplet);

      // Check for potential matches
      await this._checkForMatches(triplet);

      logger.debug(`Need created: ${triplet.id}`, { entity, resource, context });
      return triplet;
    } catch (error) {
      logger.error('Failed to create Need:', error);
      throw error;
    }
  }

  /**
   * Create a new Has triplet
   * Format: [Entity, has, Resource | Context]
   */
  async createHas(entity, resource, context = {}) {
    try {
      const triplet = new Triplet({
        entity,
        relation: 'has',
        object: resource,
        context: {
          timestamp: Date.now(),
          location: context.location,
          availability: context.availability || 'available',
          quantity: context.quantity,
          conditions: context.conditions,
          ...context
        },
        creator: this.identity.nodeId,
        signature: null // Will be signed during validation
      });

      // Validate the triplet
      const isValid = await this.validation.validateTriplet(triplet);
      if (!isValid) {
        throw new Error('Invalid Has triplet');
      }

      // Store and broadcast
      this.has.set(triplet.id, triplet);
      this.triplets.set(triplet.id, triplet);
      this.metrics.hasCreated++;

      this.emit('has:created', triplet);
      this.emit('triplet:created', triplet);

      // Check for potential matches
      await this._checkForMatches(triplet);

      logger.debug(`Has created: ${triplet.id}`, { entity, resource, context });
      return triplet;
    } catch (error) {
      logger.error('Failed to create Has:', error);
      throw error;
    }
  }

  /**
   * Create a Committed state between matching Need and Has
   * Format: [Entities, committed, Agreement | Context]
   */
  async createCommitted(needTriplet, hasTriplet, agreement = {}) {
    try {
      const entities = [needTriplet.entity, hasTriplet.entity];
      const triplet = new Triplet({
        entity: entities,
        relation: 'committed',
        object: {
          need: needTriplet.id,
          has: hasTriplet.id,
          agreement: {
            terms: agreement.terms || {},
            validUntil: agreement.validUntil || (Date.now() + 24 * 60 * 60 * 1000), // 24h default
            ...agreement
          }
        },
        context: {
          timestamp: Date.now(),
          matchScore: this._calculateMatchScore(needTriplet, hasTriplet),
          witnesses: agreement.witnesses || [],
          escrow: agreement.escrow || null
        },
        creator: this.identity.nodeId,
        signature: null // Multi-party signature required
      });

      // Multi-party validation required for Committed state
      const isValid = await this.validation.validateCommittedTriplet(triplet, [needTriplet, hasTriplet]);
      if (!isValid) {
        throw new Error('Invalid Committed triplet');
      }

      // Store and broadcast
      this.committed.set(triplet.id, triplet);
      this.triplets.set(triplet.id, triplet);
      this.metrics.matchesMade++;

      this.emit('committed:created', triplet);
      this.emit('triplet:created', triplet);

      logger.info(`Committed state created: ${triplet.id}`, { 
        need: needTriplet.id, 
        has: hasTriplet.id 
      });
      return triplet;
    } catch (error) {
      logger.error('Failed to create Committed state:', error);
      throw error;
    }
  }

  /**
   * Process a triplet received from a peer
   */
  async processPeerTriplet(triplet, peerId) {
    try {
      logger.debug(`Processing peer triplet from ${peerId}:`, triplet.id);

      // Validate the triplet
      const isValid = await this.validation.validatePeerTriplet(triplet, peerId);
      if (!isValid) {
        logger.warn(`Invalid triplet from peer ${peerId}:`, triplet.id);
        return false;
      }

      // Check if we already have this triplet
      if (this.triplets.has(triplet.id)) {
        logger.debug(`Duplicate triplet from peer ${peerId}:`, triplet.id);
        return false;
      }

      // Store the triplet
      this.triplets.set(triplet.id, triplet);
      
      // Route to appropriate collection
      switch (triplet.relation) {
        case 'needs':
          this.needs.set(triplet.id, triplet);
          await this._checkForMatches(triplet);
          break;
        case 'has':
          this.has.set(triplet.id, triplet);
          await this._checkForMatches(triplet);
          break;
        case 'committed':
          this.committed.set(triplet.id, triplet);
          break;
      }

      this.metrics.tripletsProcessed++;
      this.emit('peer:triplet:processed', triplet, peerId);

      return true;
    } catch (error) {
      logger.error(`Error processing peer triplet from ${peerId}:`, error);
      return false;
    }
  }

  // Convenience methods for peer-specific processing
  async processPeerNeed(need, peerId) {
    return this.processPeerTriplet(need, peerId);
  }

  async processPeerHas(has, peerId) {
    return this.processPeerTriplet(has, peerId);
  }

  /**
   * Check for potential matches between Needs and Has
   */
  async _checkForMatches(triplet) {
    try {
      if (triplet.relation === 'needs') {
        // Check against all Has triplets
        for (const [hasId, hasTriplet] of this.has) {
          if (await this._isMatch(triplet, hasTriplet)) {
            this.emit('match:found', { need: triplet, has: hasTriplet });
          }
        }
      } else if (triplet.relation === 'has') {
        // Check against all Need triplets
        for (const [needId, needTriplet] of this.needs) {
          if (await this._isMatch(needTriplet, triplet)) {
            this.emit('match:found', { need: needTriplet, has: triplet });
          }
        }
      }
    } catch (error) {
      logger.error('Error checking for matches:', error);
    }
  }

  /**
   * Determine if a Need and Has triplet match
   */
  async _isMatch(needTriplet, hasTriplet) {
    // Basic semantic matching
    const resourceMatch = this._compareResources(needTriplet.object, hasTriplet.object);
    
    // Location compatibility
    const locationMatch = this._compareLocations(
      needTriplet.context.location, 
      hasTriplet.context.location
    );
    
    // Time compatibility
    const timeMatch = this._compareAvailability(needTriplet, hasTriplet);
    
    // Calculate overall match score
    const matchScore = (resourceMatch + locationMatch + timeMatch) / 3;
    
    return matchScore > 0.7; // 70% threshold for matches
  }

  _compareResources(needResource, hasResource) {
    // Simple string similarity for now
    // TODO: Implement semantic matching using embeddings
    if (typeof needResource === 'string' && typeof hasResource === 'string') {
      const needLower = needResource.toLowerCase();
      const hasLower = hasResource.toLowerCase();
      
      if (needLower === hasLower) return 1.0;
      if (needLower.includes(hasLower) || hasLower.includes(needLower)) return 0.8;
      
      // Basic keyword overlap
      const needWords = needLower.split(/\s+/);
      const hasWords = hasLower.split(/\s+/);
      const commonWords = needWords.filter(word => hasWords.includes(word));
      
      return commonWords.length / Math.max(needWords.length, hasWords.length);
    }
    
    return 0;
  }

  _compareLocations(needLocation, hasLocation) {
    // Simple location matching
    // TODO: Implement proper geospatial matching
    if (!needLocation || !hasLocation) return 0.5; // Neutral if no location
    
    if (needLocation === hasLocation) return 1.0;
    
    // If both have coordinates, calculate distance
    if (needLocation.lat && hasLocation.lat) {
      const distance = this._calculateDistance(needLocation, hasLocation);
      // Within 10km gets full score, linear decay to 100km
      return Math.max(0, 1 - (distance - 10) / 90);
    }
    
    return 0.3; // Low score for non-matching locations
  }

  _compareAvailability(needTriplet, hasTriplet) {
    const now = Date.now();
    
    // Check if Need has expired
    if (needTriplet.context.expires && needTriplet.context.expires < now) {
      return 0;
    }
    
    // Check Has availability
    if (hasTriplet.context.availability === 'unavailable') {
      return 0;
    }
    
    return 1.0; // Available
  }

  _calculateDistance(loc1, loc2) {
    // Simple Haversine distance calculation
    const R = 6371; // Earth's radius in km
    const dLat = (loc2.lat - loc1.lat) * Math.PI / 180;
    const dLon = (loc2.lng - loc1.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(loc1.lat * Math.PI / 180) * Math.cos(loc2.lat * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  _calculateMatchScore(needTriplet, hasTriplet) {
    // Calculate comprehensive match score
    const resourceScore = this._compareResources(needTriplet.object, hasTriplet.object);
    const locationScore = this._compareLocations(needTriplet.context.location, hasTriplet.context.location);
    const timeScore = this._compareAvailability(needTriplet, hasTriplet);
    
    return {
      overall: (resourceScore + locationScore + timeScore) / 3,
      resource: resourceScore,
      location: locationScore,
      time: timeScore
    };
  }

  _handleValidatedTriplet(triplet) {
    this.metrics.validationSuccesses++;
    logger.debug(`Triplet validated: ${triplet.id}`);
  }

  _handleInvalidTriplet(triplet, reason) {
    this.metrics.validationFailures++;
    logger.warn(`Triplet validation failed: ${triplet.id}`, reason);
  }

  _handleConsensusReached(triplet) {
    logger.info(`Consensus reached for triplet: ${triplet.id}`);
    this.emit('triplet:consensus', triplet);
  }

  _startMaintenance() {
    // Periodic cleanup of expired triplets
    this.maintenanceInterval = setInterval(() => {
      this._cleanupExpiredTriplets();
    }, 60000); // Every minute
  }

  _stopMaintenance() {
    if (this.maintenanceInterval) {
      clearInterval(this.maintenanceInterval);
      this.maintenanceInterval = null;
    }
  }

  _cleanupExpiredTriplets() {
    const now = Date.now();
    let cleaned = 0;

    // Clean up expired needs
    for (const [id, triplet] of this.needs) {
      if (triplet.context.expires && triplet.context.expires < now) {
        this.needs.delete(id);
        this.triplets.delete(id);
        cleaned++;
      }
    }

    // Clean up expired committed states
    for (const [id, triplet] of this.committed) {
      if (triplet.object.agreement.validUntil < now) {
        this.committed.delete(id);
        this.triplets.delete(id);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.debug(`Cleaned up ${cleaned} expired triplets`);
    }
  }

  async getProtocolInfo() {
    return {
      triplets: this.triplets.size,
      needs: this.needs.size,
      has: this.has.size,
      committed: this.committed.size,
      metrics: { ...this.metrics }
    };
  }

  // Query methods
  getAllNeeds() {
    return Array.from(this.needs.values());
  }

  getAllHas() {
    return Array.from(this.has.values());
  }

  getAllCommitted() {
    return Array.from(this.committed.values());
  }

  getTriplet(id) {
    return this.triplets.get(id);
  }

  queryTriplets(filter) {
    const results = [];
    for (const triplet of this.triplets.values()) {
      if (this._matchesFilter(triplet, filter)) {
        results.push(triplet);
      }
    }
    return results;
  }

  _matchesFilter(triplet, filter) {
    if (filter.relation && triplet.relation !== filter.relation) return false;
    if (filter.entity && triplet.entity !== filter.entity) return false;
    if (filter.creator && triplet.creator !== filter.creator) return false;
    
    // Context filters
    if (filter.location && triplet.context.location) {
      const distance = this._calculateDistance(filter.location, triplet.context.location);
      if (distance > (filter.maxDistance || 50)) return false;
    }
    
    if (filter.timeRange) {
      const timestamp = triplet.context.timestamp;
      if (timestamp < filter.timeRange.start || timestamp > filter.timeRange.end) {
        return false;
      }
    }
    
    return true;
  }
}