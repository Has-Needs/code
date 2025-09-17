#!/usr/bin/env node
/**
 * Has-Needs Protocol - Main Entry Point
 * World-First Protocol for Emergent Coordination, Circular Economy, and Digital Self-Determination
 */

import { HasNeedsProtocol } from './protocol/index.js';
import { MeshNetwork } from './network/index.js';
import { OverlaysManager } from './overlays/index.js';
import { Identity } from './identity/index.js';
import { createLogger } from './utils/logger.js';

const logger = createLogger('HasNeeds:Main');

class HasNeedsNode {
  constructor(config = {}) {
    this.config = {
      nodeId: config.nodeId || null,
      port: config.port || 3000,
      meshPort: config.meshPort || 4001,
      enableUI: config.enableUI !== false,
      dataDir: config.dataDir || './data',
      ...config
    };

    this.identity = null;
    this.protocol = null;
    this.network = null;
    this.overlays = null;
    this.isRunning = false;

    logger.info('Has-Needs node initialized with config:', this.config);
  }

  async initialize() {
    try {
      logger.info('Initializing Has-Needs node...');

      // Initialize identity management
      this.identity = new Identity(this.config);
      await this.identity.initialize();

      // Initialize protocol layer
      this.protocol = new HasNeedsProtocol({
        identity: this.identity,
        ...this.config
      });
      await this.protocol.initialize();

      // Initialize mesh network
      this.network = new MeshNetwork({
        identity: this.identity,
        protocol: this.protocol,
        port: this.config.meshPort,
        ...this.config
      });
      await this.network.initialize();

      // Initialize overlays manager
      this.overlays = new OverlaysManager({
        identity: this.identity,
        protocol: this.protocol,
        network: this.network,
        ...this.config
      });
      await this.overlays.initialize();

      // Wire up cross-component communication
      await this._wireComponents();

      logger.info('Has-Needs node initialization complete');
      return true;
    } catch (error) {
      logger.error('Failed to initialize Has-Needs node:', error);
      throw error;
    }
  }

  async start() {
    if (this.isRunning) {
      logger.warn('Node is already running');
      return;
    }

    try {
      logger.info('Starting Has-Needs node...');

      // Start mesh network
      await this.network.start();
      
      // Start protocol services
      await this.protocol.start();
      
      // Start overlays manager
      await this.overlays.start();

      this.isRunning = true;
      logger.info(`Has-Needs node started successfully on mesh port ${this.config.meshPort}`);

      // Log node information
      const nodeInfo = await this.getNodeInfo();
      logger.info('Node info:', nodeInfo);

    } catch (error) {
      logger.error('Failed to start Has-Needs node:', error);
      throw error;
    }
  }

  async stop() {
    if (!this.isRunning) {
      return;
    }

    try {
      logger.info('Stopping Has-Needs node...');

      if (this.overlays) await this.overlays.stop();
      if (this.protocol) await this.protocol.stop();
      if (this.network) await this.network.stop();

      this.isRunning = false;
      logger.info('Has-Needs node stopped successfully');
    } catch (error) {
      logger.error('Error stopping Has-Needs node:', error);
      throw error;
    }
  }

  async getNodeInfo() {
    return {
      nodeId: this.identity?.nodeId,
      peerId: this.identity?.peerId?.toString(),
      isRunning: this.isRunning,
      network: await this.network?.getNetworkInfo(),
      protocol: await this.protocol?.getProtocolInfo(),
      overlays: await this.overlays?.getOverlaysInfo()
    };
  }

  async _wireComponents() {
    // Protocol -> Network communication
    this.protocol.on('triplet:broadcast', (triplet) => {
      this.network.broadcast('protocol:triplet', triplet);
    });

    this.protocol.on('need:created', (need) => {
      this.network.broadcast('protocol:need', need);
      this.overlays.processNeed(need);
    });

    this.protocol.on('has:created', (has) => {
      this.network.broadcast('protocol:has', has);
      this.overlays.processHas(has);
    });

    // Network -> Protocol communication
    this.network.on('peer:triplet', (triplet, peerId) => {
      this.protocol.processPeerTriplet(triplet, peerId);
    });

    this.network.on('peer:need', (need, peerId) => {
      this.protocol.processPeerNeed(need, peerId);
    });

    this.network.on('peer:has', (has, peerId) => {
      this.protocol.processPeerHas(has, peerId);
    });

    // Overlays -> Network communication
    this.overlays.on('overlay:sync', (overlay) => {
      this.network.broadcast('overlay:sync', overlay);
    });

    // Network -> Overlays communication
    this.network.on('peer:overlay', (overlay, peerId) => {
      this.overlays.processPeerOverlay(overlay, peerId);
    });

    logger.debug('Component wiring completed');
  }
}

// CLI support when run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const config = {
    port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
    meshPort: process.env.MESH_PORT ? parseInt(process.env.MESH_PORT) : 4001,
    dataDir: process.env.DATA_DIR || './data',
    logLevel: process.env.LOG_LEVEL || 'info'
  };

  const node = new HasNeedsNode(config);

  // Handle graceful shutdown
  const shutdown = async (signal) => {
    logger.info(`Received ${signal}, shutting down gracefully...`);
    try {
      await node.stop();
      process.exit(0);
    } catch (error) {
      logger.error('Error during shutdown:', error);
      process.exit(1);
    }
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // Start the node
  (async () => {
    try {
      await node.initialize();
      await node.start();
      
      logger.info('Has-Needs node is running. Press Ctrl+C to stop.');
    } catch (error) {
      logger.error('Failed to start node:', error);
      process.exit(1);
    }
  })();
}

export { HasNeedsNode };