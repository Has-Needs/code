/**
 * Identity Management
 * Handles sovereign identity and cryptographic keys
 */

import { generateKeyPair } from 'crypto';
import { nanoid } from 'nanoid';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('Identity');

export class Identity {
  constructor(config = {}) {
    this.config = config;
    this.nodeId = config.nodeId || null;
    this.peerId = null;
    this.publicKey = null;
    this.privateKey = null;
    this.keyPair = null;
    
    // Identity metadata
    this.createdAt = null;
    this.profile = config.profile || {};
    
    logger.info('Identity manager initialized');
  }

  async initialize() {
    try {
      logger.info('Initializing identity...');
      
      // Generate or load node ID
      if (!this.nodeId) {
        this.nodeId = this._generateNodeId();
      }
      
      // Generate or load key pair
      await this._initializeKeyPair();
      
      // Set creation timestamp
      this.createdAt = this.createdAt || Date.now();
      
      logger.info(`Identity initialized for node: ${this.nodeId}`);
    } catch (error) {
      logger.error('Failed to initialize identity:', error);
      throw error;
    }
  }

  /**
   * Generate a unique node ID
   */
  _generateNodeId() {
    return `node_${nanoid(16)}`;
  }

  /**
   * Initialize cryptographic key pair
   */
  async _initializeKeyPair() {
    return new Promise((resolve, reject) => {
      generateKeyPair('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: {
          type: 'spki',
          format: 'pem'
        },
        privateKeyEncoding: {
          type: 'pkcs8',
          format: 'pem'
        }
      }, (err, publicKey, privateKey) => {
        if (err) {
          reject(err);
        } else {
          this.publicKey = publicKey;
          this.privateKey = privateKey;
          logger.debug('Key pair generated successfully');
          resolve();
        }
      });
    });
  }

  /**
   * Get identity information (public only)
   */
  getPublicIdentity() {
    return {
      nodeId: this.nodeId,
      publicKey: this.publicKey,
      createdAt: this.createdAt,
      profile: this.profile
    };
  }

  /**
   * Get full identity information (including private data)
   */
  getFullIdentity() {
    return {
      nodeId: this.nodeId,
      publicKey: this.publicKey,
      privateKey: this.privateKey,
      createdAt: this.createdAt,
      profile: this.profile
    };
  }

  /**
   * Update profile information
   */
  updateProfile(profileData) {
    this.profile = { ...this.profile, ...profileData };
    logger.debug('Profile updated');
  }

  /**
   * Export identity for backup/storage
   */
  export() {
    return {
      nodeId: this.nodeId,
      publicKey: this.publicKey,
      privateKey: this.privateKey,
      createdAt: this.createdAt,
      profile: this.profile
    };
  }

  /**
   * Import identity from backup/storage
   */
  import(identityData) {
    this.nodeId = identityData.nodeId;
    this.publicKey = identityData.publicKey;
    this.privateKey = identityData.privateKey;
    this.createdAt = identityData.createdAt;
    this.profile = identityData.profile || {};
    
    logger.info(`Identity imported for node: ${this.nodeId}`);
  }
}