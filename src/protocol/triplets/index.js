/**
 * Triplet Data Structure
 * Core data model: [Entity, Relation, Context]
 * Triple-function: Ontology production, Value records, AI-readable data
 */

import { nanoid } from 'nanoid';
import { createHash } from 'crypto';

/**
 * Universal Protocol States (Relations)
 */
export const RELATIONS = {
  HAS: 'has',           // Entity possesses/controls and offers something
  NEEDS: 'needs',       // Entity expresses a requirement/request  
  COMMITTED: 'committed' // Mutual entry into a contract
};

/**
 * Triplet class representing the core data structure
 * Every action, resource, or relationship is captured as [Entity, Relation, Context]
 */
export class Triplet {
  constructor(data = {}) {
    // Core triplet components
    this.id = data.id || nanoid();
    this.entity = data.entity;           // The participant, resource, group, organization
    this.relation = data.relation;       // Must be one of: 'has', 'needs', 'committed'
    this.object = data.object;           // The resource, requirement, or agreement
    this.context = data.context || {};   // Time, location, governance, protocol version, consent
    
    // Metadata
    this.creator = data.creator;         // NodeId of creator
    this.timestamp = data.timestamp || Date.now();
    this.version = data.version || '1.0.0';
    
    // Cryptographic properties
    this.signature = data.signature || null;
    this.hash = data.hash || this._calculateHash();
    
    // Validation state
    this.validated = data.validated || false;
    this.consensus = data.consensus || false;
    
    this._validateRelation();
  }

  /**
   * Validate that relation is one of the three allowed states
   */
  _validateRelation() {
    const validRelations = Object.values(RELATIONS);
    if (!validRelations.includes(this.relation)) {
      throw new Error(`Invalid relation: ${this.relation}. Must be one of: ${validRelations.join(', ')}`);
    }
  }

  /**
   * Calculate cryptographic hash of the triplet
   */
  _calculateHash() {
    const data = {
      entity: this.entity,
      relation: this.relation,
      object: this.object,
      context: this.context,
      creator: this.creator,
      timestamp: this.timestamp,
      version: this.version
    };
    
    const jsonString = JSON.stringify(data, Object.keys(data).sort());
    return createHash('sha256').update(jsonString).digest('hex');
  }

  /**
   * Update the hash after modifications
   */
  updateHash() {
    this.hash = this._calculateHash();
  }

  /**
   * Check if this triplet is a Need
   */
  isNeed() {
    return this.relation === RELATIONS.NEEDS;
  }

  /**
   * Check if this triplet is a Has
   */
  isHas() {
    return this.relation === RELATIONS.HAS;
  }

  /**
   * Check if this triplet is a Committed state
   */
  isCommitted() {
    return this.relation === RELATIONS.COMMITTED;
  }

  /**
   * Get geographic context if available
   */
  getLocation() {
    return this.context.location || null;
  }

  /**
   * Get temporal context
   */
  getTimeContext() {
    return {
      created: this.timestamp,
      expires: this.context.expires,
      validUntil: this.context.validUntil
    };
  }

  /**
   * Check if the triplet has expired
   */
  isExpired() {
    const now = Date.now();
    if (this.context.expires && this.context.expires < now) {
      return true;
    }
    if (this.context.validUntil && this.context.validUntil < now) {
      return true;
    }
    return false;
  }

  /**
   * Get the priority/urgency level
   */
  getPriority() {
    return this.context.urgency || this.context.priority || 'normal';
  }

  /**
   * Convert to minimal representation for network transmission
   */
  toNetwork() {
    return {
      id: this.id,
      entity: this.entity,
      relation: this.relation,
      object: this.object,
      context: this.context,
      creator: this.creator,
      timestamp: this.timestamp,
      hash: this.hash,
      signature: this.signature
    };
  }

  /**
   * Convert to full object for storage
   */
  toStorage() {
    return {
      id: this.id,
      entity: this.entity,
      relation: this.relation,
      object: this.object,
      context: this.context,
      creator: this.creator,
      timestamp: this.timestamp,
      version: this.version,
      hash: this.hash,
      signature: this.signature,
      validated: this.validated,
      consensus: this.consensus
    };
  }

  /**
   * Convert to JSON string
   */
  toString() {
    return JSON.stringify(this.toStorage(), null, 2);
  }

  /**
   * Create a triplet from network data
   */
  static fromNetwork(data) {
    return new Triplet(data);
  }

  /**
   * Create a triplet from storage data
   */
  static fromStorage(data) {
    return new Triplet(data);
  }

  /**
   * Verify the hash integrity
   */
  verifyHash() {
    const calculatedHash = this._calculateHash();
    return this.hash === calculatedHash;
  }

  /**
   * Create a semantic representation for AI processing
   */
  toSemantic() {
    return {
      subject: this.entity,
      predicate: this.relation,
      object: this.object,
      context: {
        spatial: this.context.location,
        temporal: {
          created: new Date(this.timestamp).toISOString(),
          expires: this.context.expires ? new Date(this.context.expires).toISOString() : null
        },
        metadata: {
          creator: this.creator,
          priority: this.getPriority(),
          conditions: this.context.conditions || {}
        }
      },
      provenance: {
        hash: this.hash,
        signature: this.signature,
        validated: this.validated,
        consensus: this.consensus
      }
    };
  }

  /**
   * Extract semantic features for matching algorithms
   */
  getSemanticFeatures() {
    const features = {
      relation: this.relation,
      entityType: this._inferEntityType(),
      resourceType: this._inferResourceType(),
      location: this.getLocation(),
      timeframe: this._getTimeframe(),
      urgency: this.getPriority(),
      conditions: this.context.conditions || {}
    };

    // Add relation-specific features
    if (this.isNeed()) {
      features.needType = this.context.needType || 'general';
      features.quantity = this.context.quantity;
      features.deadline = this.context.expires;
    } else if (this.isHas()) {
      features.availability = this.context.availability || 'available';
      features.capacity = this.context.capacity || this.context.quantity;
      features.conditions = this.context.conditions || {};
    } else if (this.isCommitted()) {
      features.agreement = this.object.agreement;
      features.parties = Array.isArray(this.entity) ? this.entity : [this.entity];
      features.witnesses = this.context.witnesses || [];
    }

    return features;
  }

  _inferEntityType() {
    if (typeof this.entity === 'string') {
      // Simple heuristics for entity type detection
      if (this.entity.includes('@')) return 'user';
      if (this.entity.startsWith('org:')) return 'organization';
      if (this.entity.startsWith('dev:')) return 'device';
      if (this.entity.startsWith('com:')) return 'community';
    }
    if (Array.isArray(this.entity)) {
      return 'group';
    }
    return 'unknown';
  }

  _inferResourceType() {
    if (typeof this.object === 'string') {
      // Simple resource categorization
      const resource = this.object.toLowerCase();
      if (resource.includes('food') || resource.includes('meal')) return 'food';
      if (resource.includes('shelter') || resource.includes('housing')) return 'shelter';
      if (resource.includes('transport') || resource.includes('ride')) return 'transport';
      if (resource.includes('medical') || resource.includes('health')) return 'medical';
      if (resource.includes('tool') || resource.includes('equipment')) return 'equipment';
      if (resource.includes('skill') || resource.includes('service')) return 'service';
      if (resource.includes('information') || resource.includes('data')) return 'information';
    }
    return 'general';
  }

  _getTimeframe() {
    const now = Date.now();
    const created = this.timestamp;
    const expires = this.context.expires;
    
    return {
      age: now - created,
      lifetime: expires ? expires - created : null,
      remaining: expires ? expires - now : null
    };
  }
}

/**
 * Factory functions for creating specific types of triplets
 */
export class TripletFactory {
  /**
   * Create a Need triplet
   */
  static createNeed(entity, resource, context = {}) {
    return new Triplet({
      entity,
      relation: RELATIONS.NEEDS,
      object: resource,
      context: {
        timestamp: Date.now(),
        urgency: context.urgency || 'normal',
        expires: context.expires,
        location: context.location,
        quantity: context.quantity,
        conditions: context.conditions,
        ...context
      }
    });
  }

  /**
   * Create a Has triplet
   */
  static createHas(entity, resource, context = {}) {
    return new Triplet({
      entity,
      relation: RELATIONS.HAS,
      object: resource,
      context: {
        timestamp: Date.now(),
        availability: context.availability || 'available',
        location: context.location,
        capacity: context.capacity,
        conditions: context.conditions,
        expires: context.expires,
        ...context
      }
    });
  }

  /**
   * Create a Committed triplet
   */
  static createCommitted(entities, agreement, context = {}) {
    return new Triplet({
      entity: Array.isArray(entities) ? entities : [entities],
      relation: RELATIONS.COMMITTED,
      object: {
        agreement: {
          terms: agreement.terms || {},
          validUntil: agreement.validUntil || (Date.now() + 24 * 60 * 60 * 1000),
          ...agreement
        }
      },
      context: {
        timestamp: Date.now(),
        witnesses: context.witnesses || [],
        escrow: context.escrow,
        ...context
      }
    });
  }
}

export default { Triplet, TripletFactory, RELATIONS };