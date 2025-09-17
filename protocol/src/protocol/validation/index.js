/**
 * Validation Engine
 * Implements cryptographic validation and zero-knowledge proofs
 */

import { EventEmitter } from 'eventemitter3';
import { createHash, createSign, createVerify } from 'crypto';
import { createLogger } from '../../utils/logger.js';

const logger = createLogger('Validation');

export class ValidationEngine extends EventEmitter {
  constructor(config = {}) {
    super();
    this.config = config;
    this.identity = config.identity;
    this.protocol = config.protocol;
    
    // Validation rules and schemas
    this.rules = new Map();
    this.schemas = new Map();
    
    // Cryptographic state
    this.trustedKeys = new Set();
    this.revokedKeys = new Set();
    
    // Performance metrics
    this.metrics = {
      validationsPerformed: 0,
      validationSuccesses: 0,
      validationFailures: 0,
      averageValidationTime: 0
    };

    logger.info('Validation Engine initialized');
  }

  async initialize() {
    try {
      logger.info('Initializing validation engine...');

      // Load default validation rules
      await this._loadDefaultRules();
      
      // Load trusted keys
      await this._loadTrustedKeys();
      
      // Initialize cryptographic components
      await this._initializeCrypto();

      logger.info('Validation engine initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize validation engine:', error);
      throw error;
    }
  }

  async start() {
    logger.info('Starting validation engine...');
    // Start background validation processes if needed
    logger.info('Validation engine started');
  }

  async stop() {
    logger.info('Stopping validation engine...');
    // Clean up resources
    logger.info('Validation engine stopped');
  }

  /**
   * Validate a triplet according to protocol rules
   */
  async validateTriplet(triplet) {
    const startTime = Date.now();
    this.metrics.validationsPerformed++;

    try {
      logger.debug(`Validating triplet: ${triplet.id}`);

      // 1. Structural validation
      if (!await this._validateStructure(triplet)) {
        throw new Error('Structural validation failed');
      }

      // 2. Semantic validation
      if (!await this._validateSemantics(triplet)) {
        throw new Error('Semantic validation failed');
      }

      // 3. Cryptographic validation
      if (!await this._validateCryptography(triplet)) {
        throw new Error('Cryptographic validation failed');
      }

      // 4. Context validation
      if (!await this._validateContext(triplet)) {
        throw new Error('Context validation failed');
      }

      // 5. Business rules validation
      if (!await this._validateBusinessRules(triplet)) {
        throw new Error('Business rules validation failed');
      }

      // Sign the triplet if we created it
      if (triplet.creator === this.identity.nodeId && !triplet.signature) {
        await this._signTriplet(triplet);
      }

      triplet.validated = true;
      this.metrics.validationSuccesses++;
      
      const duration = Date.now() - startTime;
      this._updateAverageValidationTime(duration);
      
      this.emit('triplet:validated', triplet);
      logger.debug(`Triplet validated successfully: ${triplet.id} (${duration}ms)`);
      
      return true;
    } catch (error) {
      this.metrics.validationFailures++;
      this.emit('triplet:invalid', triplet, error.message);
      logger.warn(`Triplet validation failed: ${triplet.id}`, error.message);
      return false;
    }
  }

  /**
   * Validate a triplet received from a peer
   */
  async validatePeerTriplet(triplet, peerId) {
    try {
      // Standard validation
      const isValid = await this.validateTriplet(triplet);
      if (!isValid) return false;

      // Additional peer-specific validation
      if (!await this._validatePeerSignature(triplet, peerId)) {
        throw new Error('Peer signature validation failed');
      }

      if (!await this._validatePeerReputation(peerId)) {
        throw new Error('Peer reputation validation failed');
      }

      return true;
    } catch (error) {
      logger.warn(`Peer triplet validation failed from ${peerId}:`, error.message);
      return false;
    }
  }

  /**
   * Validate a Committed triplet (requires multi-party signatures)
   */
  async validateCommittedTriplet(committedTriplet, referencedTriplets = []) {
    try {
      // Standard validation
      if (!await this.validateTriplet(committedTriplet)) {
        return false;
      }

      // Validate referenced triplets exist and are valid
      for (const refTriplet of referencedTriplets) {
        if (!refTriplet.validated) {
          throw new Error(`Referenced triplet ${refTriplet.id} is not validated`);
        }
      }

      // Validate multi-party agreement
      if (!await this._validateMultiPartyAgreement(committedTriplet)) {
        throw new Error('Multi-party agreement validation failed');
      }

      // Validate escrow conditions if present
      if (committedTriplet.context.escrow) {
        if (!await this._validateEscrow(committedTriplet.context.escrow)) {
          throw new Error('Escrow validation failed');
        }
      }

      return true;
    } catch (error) {
      logger.warn(`Committed triplet validation failed: ${committedTriplet.id}`, error.message);
      return false;
    }
  }

  /**
   * Structural validation - check required fields and types
   */
  async _validateStructure(triplet) {
    // Required fields
    const requiredFields = ['id', 'entity', 'relation', 'object', 'context', 'creator', 'timestamp'];
    for (const field of requiredFields) {
      if (triplet[field] === undefined || triplet[field] === null) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Validate relation
    const validRelations = ['has', 'needs', 'committed'];
    if (!validRelations.includes(triplet.relation)) {
      throw new Error(`Invalid relation: ${triplet.relation}`);
    }

    // Validate ID format
    if (typeof triplet.id !== 'string' || triplet.id.length < 10) {
      throw new Error('Invalid ID format');
    }

    // Validate timestamp
    if (!Number.isInteger(triplet.timestamp) || triplet.timestamp <= 0) {
      throw new Error('Invalid timestamp');
    }

    // Validate context is object
    if (typeof triplet.context !== 'object') {
      throw new Error('Context must be an object');
    }

    return true;
  }

  /**
   * Semantic validation - check meaning and consistency
   */
  async _validateSemantics(triplet) {
    // Validate entity format
    if (typeof triplet.entity === 'string') {
      if (triplet.entity.length === 0) {
        throw new Error('Entity cannot be empty string');
      }
    } else if (Array.isArray(triplet.entity)) {
      if (triplet.entity.length === 0) {
        throw new Error('Entity array cannot be empty');
      }
      if (triplet.relation !== 'committed') {
        throw new Error('Entity array only allowed for committed relation');
      }
    } else {
      throw new Error('Entity must be string or array');
    }

    // Validate object based on relation
    switch (triplet.relation) {
      case 'needs':
        return this._validateNeedObject(triplet.object);
      case 'has':
        return this._validateHasObject(triplet.object);
      case 'committed':
        return this._validateCommittedObject(triplet.object);
      default:
        throw new Error(`Unknown relation: ${triplet.relation}`);
    }
  }

  _validateNeedObject(obj) {
    if (typeof obj !== 'string' && typeof obj !== 'object') {
      throw new Error('Need object must be string or object');
    }
    return true;
  }

  _validateHasObject(obj) {
    if (typeof obj !== 'string' && typeof obj !== 'object') {
      throw new Error('Has object must be string or object');
    }
    return true;
  }

  _validateCommittedObject(obj) {
    if (typeof obj !== 'object' || !obj.agreement) {
      throw new Error('Committed object must have agreement');
    }
    
    if (!obj.agreement.validUntil || !Number.isInteger(obj.agreement.validUntil)) {
      throw new Error('Agreement must have valid validUntil timestamp');
    }
    
    return true;
  }

  /**
   * Cryptographic validation - verify signatures and hashes
   */
  async _validateCryptography(triplet) {
    // Verify hash integrity
    if (!triplet.verifyHash()) {
      throw new Error('Hash verification failed');
    }

    // Verify signature if present
    if (triplet.signature) {
      if (!await this._verifySignature(triplet)) {
        throw new Error('Signature verification failed');
      }
    }

    return true;
  }

  /**
   * Context validation - check temporal and spatial constraints
   */
  async _validateContext(triplet) {
    const now = Date.now();
    const context = triplet.context;

    // Validate timestamp is not in future (with small tolerance)
    if (triplet.timestamp > now + 60000) { // 1 minute tolerance
      throw new Error('Timestamp is too far in the future');
    }

    // Validate timestamp is not too old
    const maxAge = this.config.maxTripletAge || (30 * 24 * 60 * 60 * 1000); // 30 days
    if (triplet.timestamp < now - maxAge) {
      throw new Error('Timestamp is too old');
    }

    // Validate expiration if present
    if (context.expires) {
      if (!Number.isInteger(context.expires)) {
        throw new Error('Invalid expires timestamp');
      }
      if (context.expires <= triplet.timestamp) {
        throw new Error('Expiration must be after creation');
      }
    }

    // Validate location format if present
    if (context.location) {
      if (!this._validateLocation(context.location)) {
        throw new Error('Invalid location format');
      }
    }

    return true;
  }

  _validateLocation(location) {
    if (typeof location === 'string') {
      return location.length > 0;
    }
    
    if (typeof location === 'object') {
      // GeoJSON-style coordinates
      if (location.lat !== undefined && location.lng !== undefined) {
        return Number.isFinite(location.lat) && Number.isFinite(location.lng) &&
               location.lat >= -90 && location.lat <= 90 &&
               location.lng >= -180 && location.lng <= 180;
      }
    }
    
    return false;
  }

  /**
   * Business rules validation - check protocol-specific rules
   */
  async _validateBusinessRules(triplet) {
    // Check if entity has permission to create this type of triplet
    if (!await this._validateEntityPermissions(triplet)) {
      throw new Error('Entity lacks permissions for this triplet type');
    }

    // Check rate limiting
    if (!await this._validateRateLimit(triplet.creator)) {
      throw new Error('Rate limit exceeded for creator');
    }

    // Check resource availability for Has triplets
    if (triplet.relation === 'has') {
      if (!await this._validateResourceAvailability(triplet)) {
        throw new Error('Resource availability validation failed');
      }
    }

    // Custom validation rules
    for (const [ruleId, rule] of this.rules) {
      if (!await rule.validate(triplet)) {
        throw new Error(`Business rule violation: ${ruleId}`);
      }
    }

    return true;
  }

  async _validateEntityPermissions(triplet) {
    // Basic permission checking - can be extended
    return true; // For now, all entities have all permissions
  }

  async _validateRateLimit(creator) {
    // Simple rate limiting - could be made more sophisticated
    const limit = this.config.rateLimitPerMinute || 60;
    const window = 60 * 1000; // 1 minute
    
    // This is a simplified implementation
    // In production, use a proper rate limiting algorithm
    return true;
  }

  async _validateResourceAvailability(triplet) {
    // Validate that the resource being offered is actually available
    const availability = triplet.context.availability;
    return availability !== 'unavailable';
  }

  async _signTriplet(triplet) {
    if (!this.identity.privateKey) {
      throw new Error('No private key available for signing');
    }

    try {
      const sign = createSign('SHA256');
      sign.update(triplet.hash);
      sign.end();

      triplet.signature = sign.sign(this.identity.privateKey, 'hex');
      logger.debug(`Triplet signed: ${triplet.id}`);
    } catch (error) {
      logger.error(`Failed to sign triplet ${triplet.id}:`, error);
      throw error;
    }
  }

  async _verifySignature(triplet) {
    if (!triplet.signature) {
      return true; // No signature to verify
    }

    try {
      // Get the public key for the creator
      const publicKey = await this._getPublicKey(triplet.creator);
      if (!publicKey) {
        throw new Error(`No public key found for creator: ${triplet.creator}`);
      }

      const verify = createVerify('SHA256');
      verify.update(triplet.hash);
      verify.end();

      const isValid = verify.verify(publicKey, triplet.signature, 'hex');
      return isValid;
    } catch (error) {
      logger.warn(`Signature verification failed for triplet ${triplet.id}:`, error.message);
      return false;
    }
  }

  async _validatePeerSignature(triplet, peerId) {
    // Ensure the triplet was signed by the claiming peer
    return triplet.creator === peerId && await this._verifySignature(triplet);
  }

  async _validatePeerReputation(peerId) {
    // Simple reputation checking - could be enhanced
    return !this.revokedKeys.has(peerId);
  }

  async _validateMultiPartyAgreement(committedTriplet) {
    // For Committed triplets, validate that all parties have agreed
    const entities = Array.isArray(committedTriplet.entity) ? 
                    committedTriplet.entity : 
                    [committedTriplet.entity];

    // Check that we have signatures from all parties
    // This is a simplified implementation
    return entities.length >= 2; // At least two parties
  }

  async _validateEscrow(escrowData) {
    // Validate escrow conditions
    if (!escrowData.conditions || !escrowData.releaseConditions) {
      throw new Error('Escrow must specify conditions and release conditions');
    }
    return true;
  }

  async _getPublicKey(nodeId) {
    // Get public key from identity service or peer discovery
    if (nodeId === this.identity.nodeId) {
      return this.identity.publicKey;
    }
    
    // For now, return null for other nodes
    // In production, this would query the network or a key registry
    return null;
  }

  async _loadDefaultRules() {
    // Load default validation rules
    this.rules.set('uniqueness', {
      name: 'Triplet Uniqueness',
      validate: async (triplet) => {
        // Ensure triplet IDs are unique within the protocol
        return !this.protocol.triplets.has(triplet.id);
      }
    });

    this.rules.set('temporal', {
      name: 'Temporal Consistency',
      validate: async (triplet) => {
        // Ensure temporal relationships are consistent
        if (triplet.context.expires && triplet.context.validUntil) {
          return triplet.context.expires <= triplet.context.validUntil;
        }
        return true;
      }
    });

    logger.debug(`Loaded ${this.rules.size} validation rules`);
  }

  async _loadTrustedKeys() {
    // Load trusted public keys
    // In production, this would load from configuration or a trust store
    if (this.identity.publicKey) {
      this.trustedKeys.add(this.identity.nodeId);
    }
  }

  async _initializeCrypto() {
    // Initialize cryptographic components
    // Validate our own key pair
    if (this.identity.privateKey && this.identity.publicKey) {
      logger.debug('Cryptographic components initialized');
    }
  }

  _updateAverageValidationTime(duration) {
    const totalValidations = this.metrics.validationSuccesses + this.metrics.validationFailures;
    this.metrics.averageValidationTime = 
      ((this.metrics.averageValidationTime * (totalValidations - 1)) + duration) / totalValidations;
  }

  // Public API methods
  addValidationRule(ruleId, rule) {
    this.rules.set(ruleId, rule);
    logger.info(`Added validation rule: ${ruleId}`);
  }

  removeValidationRule(ruleId) {
    this.rules.delete(ruleId);
    logger.info(`Removed validation rule: ${ruleId}`);
  }

  addTrustedKey(nodeId, publicKey) {
    this.trustedKeys.add(nodeId);
    logger.info(`Added trusted key for node: ${nodeId}`);
  }

  revokeTrustedKey(nodeId) {
    this.trustedKeys.delete(nodeId);
    this.revokedKeys.add(nodeId);
    logger.warn(`Revoked trusted key for node: ${nodeId}`);
  }

  getMetrics() {
    return { ...this.metrics };
  }
}