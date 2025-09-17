/**
 * Consensus Manager
 * Implements distributed consensus for triplet validation
 */

import { EventEmitter } from 'eventemitter3';
import { createLogger } from '../../utils/logger.js';

const logger = createLogger('Consensus');

export class ConsensusManager extends EventEmitter {
  constructor(config = {}) {
    super();
    this.config = config;
    this.identity = config.identity;
    this.protocol = config.protocol;
    this.validation = config.validation;
    
    // Consensus state
    this.pendingConsensus = new Map(); // tripletId -> ConsensusState
    this.votes = new Map(); // tripletId -> Map(nodeId -> vote)
    
    // Configuration
    this.consensusThreshold = config.consensusThreshold || 0.67; // 67% agreement needed
    this.consensusTimeout = config.consensusTimeout || 30000; // 30 seconds
    this.minValidators = config.minValidators || 3;
    
    logger.info('Consensus Manager initialized');
  }

  async initialize() {
    logger.info('Initializing consensus manager...');
    // Initialize consensus mechanisms
    logger.info('Consensus manager initialized successfully');
  }

  async start() {
    logger.info('Starting consensus manager...');
    logger.info('Consensus manager started');
  }

  async stop() {
    logger.info('Stopping consensus manager...');
    // Clean up pending consensus
    this.pendingConsensus.clear();
    this.votes.clear();
    logger.info('Consensus manager stopped');
  }

  /**
   * Request consensus for a triplet
   */
  async requestConsensus(triplet) {
    try {
      logger.debug(`Requesting consensus for triplet: ${triplet.id}`);
      
      // Create consensus state
      const consensusState = {
        triplet,
        startTime: Date.now(),
        validators: new Set(),
        votes: new Map(),
        status: 'pending'
      };
      
      this.pendingConsensus.set(triplet.id, consensusState);
      this.votes.set(triplet.id, new Map());
      
      // Start consensus timeout
      setTimeout(() => {
        this._handleConsensusTimeout(triplet.id);
      }, this.consensusTimeout);
      
      // Broadcast consensus request
      this.emit('consensus:request', triplet);
      
      return consensusState;
    } catch (error) {
      logger.error(`Failed to request consensus for triplet ${triplet.id}:`, error);
      throw error;
    }
  }

  /**
   * Handle a vote from a validator
   */
  async handleVote(tripletId, validatorId, vote, signature) {
    try {
      const consensusState = this.pendingConsensus.get(tripletId);
      if (!consensusState) {
        logger.warn(`Received vote for unknown consensus: ${tripletId}`);
        return false;
      }

      if (consensusState.status !== 'pending') {
        logger.warn(`Received vote for non-pending consensus: ${tripletId}`);
        return false;
      }

      // Validate the vote signature
      if (!await this._validateVoteSignature(tripletId, validatorId, vote, signature)) {
        logger.warn(`Invalid vote signature from ${validatorId} for ${tripletId}`);
        return false;
      }

      // Record the vote
      consensusState.votes.set(validatorId, {
        vote,
        timestamp: Date.now(),
        signature
      });
      
      consensusState.validators.add(validatorId);
      
      logger.debug(`Vote recorded from ${validatorId} for ${tripletId}: ${vote}`);
      
      // Check if consensus has been reached
      await this._checkConsensusReached(tripletId);
      
      return true;
    } catch (error) {
      logger.error(`Error handling vote from ${validatorId}:`, error);
      return false;
    }
  }

  /**
   * Cast our vote for a triplet
   */
  async castVote(tripletId, triplet) {
    try {
      // Validate the triplet independently
      const isValid = await this.validation.validateTriplet(triplet);
      
      const vote = {
        valid: isValid,
        nodeId: this.identity.nodeId,
        timestamp: Date.now(),
        reason: isValid ? 'valid' : 'validation_failed'
      };
      
      // Sign the vote
      const signature = await this._signVote(tripletId, vote);
      
      // Broadcast our vote
      this.emit('consensus:vote', tripletId, this.identity.nodeId, vote, signature);
      
      logger.debug(`Cast vote for ${tripletId}: ${vote.valid}`);
      return vote;
    } catch (error) {
      logger.error(`Error casting vote for ${tripletId}:`, error);
      throw error;
    }
  }

  /**
   * Check if consensus has been reached for a triplet
   */
  async _checkConsensusReached(tripletId) {
    const consensusState = this.pendingConsensus.get(tripletId);
    if (!consensusState || consensusState.status !== 'pending') {
      return;
    }

    const votes = consensusState.votes;
    const totalVotes = votes.size;
    
    // Need minimum number of validators
    if (totalVotes < this.minValidators) {
      return;
    }

    // Count positive votes
    let positiveVotes = 0;
    for (const [validatorId, voteData] of votes) {
      if (voteData.vote.valid) {
        positiveVotes++;
      }
    }

    const agreement = positiveVotes / totalVotes;
    
    if (agreement >= this.consensusThreshold) {
      // Consensus reached - triplet is accepted
      consensusState.status = 'accepted';
      consensusState.endTime = Date.now();
      consensusState.agreement = agreement;
      
      // Mark triplet as having consensus
      consensusState.triplet.consensus = true;
      
      this.emit('consensus:reached', consensusState.triplet);
      logger.info(`Consensus reached for triplet ${tripletId}: ${agreement * 100}% agreement`);
      
      // Clean up
      this._cleanupConsensus(tripletId);
      
    } else if (agreement < (1 - this.consensusThreshold)) {
      // Consensus reached - triplet is rejected
      consensusState.status = 'rejected';
      consensusState.endTime = Date.now();
      consensusState.agreement = agreement;
      
      this.emit('consensus:rejected', consensusState.triplet, agreement);
      logger.info(`Consensus rejected triplet ${tripletId}: ${agreement * 100}% agreement`);
      
      // Clean up
      this._cleanupConsensus(tripletId);
    }
    
    // If neither threshold is met, continue waiting for more votes
  }

  /**
   * Handle consensus timeout
   */
  _handleConsensusTimeout(tripletId) {
    const consensusState = this.pendingConsensus.get(tripletId);
    if (!consensusState || consensusState.status !== 'pending') {
      return;
    }

    const votes = consensusState.votes;
    const totalVotes = votes.size;
    
    if (totalVotes === 0) {
      // No votes received - treat as timeout
      consensusState.status = 'timeout';
      this.emit('consensus:timeout', consensusState.triplet);
      logger.warn(`Consensus timeout for triplet ${tripletId}: no votes received`);
    } else {
      // Some votes received - make best effort decision
      let positiveVotes = 0;
      for (const [validatorId, voteData] of votes) {
        if (voteData.vote.valid) {
          positiveVotes++;
        }
      }

      const agreement = positiveVotes / totalVotes;
      
      if (agreement > 0.5) {
        // Majority positive - accept
        consensusState.status = 'accepted_partial';
        consensusState.triplet.consensus = true;
        this.emit('consensus:reached', consensusState.triplet);
        logger.info(`Partial consensus reached for triplet ${tripletId}: ${agreement * 100}% agreement`);
      } else {
        // Majority negative or tied - reject
        consensusState.status = 'rejected_partial';
        this.emit('consensus:rejected', consensusState.triplet, agreement);
        logger.info(`Partial consensus rejected triplet ${tripletId}: ${agreement * 100}% agreement`);
      }
    }

    consensusState.endTime = Date.now();
    this._cleanupConsensus(tripletId);
  }

  /**
   * Clean up consensus state
   */
  _cleanupConsensus(tripletId) {
    this.pendingConsensus.delete(tripletId);
    this.votes.delete(tripletId);
  }

  /**
   * Sign a vote
   */
  async _signVote(tripletId, vote) {
    // Simple signature for now - could be enhanced with proper cryptography
    const data = JSON.stringify({ tripletId, vote });
    return `signature_${this.identity.nodeId}_${Date.now()}`;
  }

  /**
   * Validate a vote signature
   */
  async _validateVoteSignature(tripletId, validatorId, vote, signature) {
    // Simple validation for now - should implement proper cryptographic verification
    return signature && signature.includes(validatorId);
  }

  /**
   * Get consensus statistics
   */
  getConsensusStats() {
    const stats = {
      pending: 0,
      accepted: 0,
      rejected: 0,
      timeout: 0,
      totalVotes: 0
    };

    for (const [tripletId, state] of this.pendingConsensus) {
      stats.pending++;
      stats.totalVotes += state.votes.size;
    }

    return stats;
  }

  /**
   * Get pending consensus items
   */
  getPendingConsensus() {
    return Array.from(this.pendingConsensus.entries()).map(([tripletId, state]) => ({
      tripletId,
      status: state.status,
      validators: state.validators.size,
      votes: state.votes.size,
      startTime: state.startTime,
      age: Date.now() - state.startTime
    }));
  }
}