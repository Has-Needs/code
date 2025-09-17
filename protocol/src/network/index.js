/**
 * Mesh Network Layer
 * Implements the jitterbug topology and resilient mesh networking
 */

import { EventEmitter } from 'eventemitter3';
import { createLibp2p } from 'libp2p';
import { webSockets } from '@libp2p/websockets';
import { noise } from '@libp2p/noise';
import { mplex } from '@libp2p/mplex';
import { kadDHT } from '@libp2p/kad-dht';
import { mdns } from '@libp2p/mdns';
import { JitterbugTopology } from './topology/index.js';
import { MeshRouter } from './routing/index.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('Network');

export class MeshNetwork extends EventEmitter {
  constructor(config = {}) {
    super();
    this.config = config;
    this.identity = config.identity;
    this.protocol = config.protocol;
    
    // Network components
    this.libp2p = null;
    this.topology = null;
    this.router = null;
    
    // Network state
    this.peers = new Map(); // peerId -> peerInfo
    this.connections = new Map(); // peerId -> connection
    this.isStarted = false;
    
    // Configuration
    this.port = config.port || 4001;
    this.bootstrapPeers = config.bootstrapPeers || [];
    this.enableMDNS = config.enableMDNS !== false;
    this.maxPeers = config.maxPeers || 50;
    
    // Metrics
    this.metrics = {
      messagesReceived: 0,
      messagesSent: 0,
      bytesReceived: 0,
      bytesSent: 0,
      peersConnected: 0,
      peersDisconnected: 0,
      connectionErrors: 0
    };

    logger.info('Mesh Network initialized');
  }

  async initialize() {
    try {
      logger.info('Initializing mesh network...');

      // Initialize libp2p
      await this._initializeLibp2p();
      
      // Initialize jitterbug topology
      this.topology = new JitterbugTopology({
        network: this,
        identity: this.identity,
        ...this.config
      });
      await this.topology.initialize();
      
      // Initialize mesh router
      this.router = new MeshRouter({
        network: this,
        topology: this.topology,
        ...this.config
      });
      await this.router.initialize();

      // Set up event handlers
      this._setupEventHandlers();

      logger.info('Mesh network initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize mesh network:', error);
      throw error;
    }
  }

  async start() {
    if (this.isStarted) {
      logger.warn('Network is already started');
      return;
    }

    try {
      logger.info('Starting mesh network...');

      // Start libp2p
      await this.libp2p.start();
      
      // Start topology manager
      await this.topology.start();
      
      // Start router
      await this.router.start();

      // Connect to bootstrap peers
      await this._connectToBootstrapPeers();

      this.isStarted = true;
      const multiaddrs = this.libp2p.getMultiaddrs();
      logger.info(`Mesh network started on: ${multiaddrs.map(ma => ma.toString()).join(', ')}`);

      this.emit('network:started');
    } catch (error) {
      logger.error('Failed to start mesh network:', error);
      throw error;
    }
  }

  async stop() {
    if (!this.isStarted) {
      return;
    }

    try {
      logger.info('Stopping mesh network...');

      // Stop components
      if (this.router) await this.router.stop();
      if (this.topology) await this.topology.stop();
      if (this.libp2p) await this.libp2p.stop();

      // Clear state
      this.peers.clear();
      this.connections.clear();
      this.isStarted = false;

      logger.info('Mesh network stopped successfully');
      this.emit('network:stopped');
    } catch (error) {
      logger.error('Error stopping mesh network:', error);
      throw error;
    }
  }

  /**
   * Broadcast a message to all connected peers
   */
  async broadcast(topic, data) {
    try {
      const message = {
        id: this._generateMessageId(),
        topic,
        data,
        sender: this.identity.nodeId,
        timestamp: Date.now()
      };

      const serialized = JSON.stringify(message);
      let successCount = 0;

      // Send to all connected peers
      for (const [peerId, connection] of this.connections) {
        try {
          await this._sendMessage(connection, serialized);
          successCount++;
        } catch (error) {
          logger.warn(`Failed to send message to peer ${peerId}:`, error.message);
        }
      }

      this.metrics.messagesSent++;
      this.metrics.bytesSent += serialized.length;

      logger.debug(`Broadcasted ${topic} to ${successCount}/${this.connections.size} peers`);
      return successCount;
    } catch (error) {
      logger.error('Error broadcasting message:', error);
      throw error;
    }
  }

  /**
   * Send a message to a specific peer
   */
  async sendToPeer(peerId, topic, data) {
    try {
      const connection = this.connections.get(peerId);
      if (!connection) {
        throw new Error(`No connection to peer: ${peerId}`);
      }

      const message = {
        id: this._generateMessageId(),
        topic,
        data,
        sender: this.identity.nodeId,
        timestamp: Date.now()
      };

      const serialized = JSON.stringify(message);
      await this._sendMessage(connection, serialized);

      this.metrics.messagesSent++;
      this.metrics.bytesSent += serialized.length;

      logger.debug(`Sent ${topic} to peer ${peerId}`);
      return true;
    } catch (error) {
      logger.error(`Error sending message to peer ${peerId}:`, error);
      throw error;
    }
  }

  /**
   * Get network information
   */
  async getNetworkInfo() {
    const multiaddrs = this.libp2p ? this.libp2p.getMultiaddrs() : [];
    
    return {
      isStarted: this.isStarted,
      peerId: this.libp2p ? this.libp2p.peerId.toString() : null,
      multiaddrs: multiaddrs.map(ma => ma.toString()),
      connectedPeers: this.connections.size,
      knownPeers: this.peers.size,
      topology: await this.topology?.getTopologyInfo(),
      metrics: { ...this.metrics }
    };
  }

  /**
   * Get connected peers information
   */
  getPeersInfo() {
    const peers = [];
    for (const [peerId, peerInfo] of this.peers) {
      peers.push({
        peerId,
        connected: this.connections.has(peerId),
        multiaddrs: peerInfo.multiaddrs,
        protocols: peerInfo.protocols,
        lastSeen: peerInfo.lastSeen,
        ...peerInfo
      });
    }
    return peers;
  }

  /**
   * Initialize libp2p networking
   */
  async _initializeLibp2p() {
    const libp2pConfig = {
      addresses: {
        listen: [`/ip4/0.0.0.0/tcp/${this.port}/ws`]
      },
      transports: [webSockets()],
      connectionEncryption: [noise()],
      streamMuxers: [mplex()],
      services: {
        dht: kadDHT(),
        ...(this.enableMDNS ? { mdns: mdns() } : {})
      },
      connectionManager: {
        maxConnections: this.maxPeers,
        minConnections: 1
      }
    };

    this.libp2p = await createLibp2p(libp2pConfig);
    logger.debug('libp2p initialized');
  }

  /**
   * Set up event handlers
   */
  _setupEventHandlers() {
    // Peer connection events
    this.libp2p.addEventListener('peer:connect', (event) => {
      this._handlePeerConnect(event.detail);
    });

    this.libp2p.addEventListener('peer:disconnect', (event) => {
      this._handlePeerDisconnect(event.detail);
    });

    // Handle incoming streams
    this.libp2p.handle('/has-needs/1.0.0', (data) => {
      this._handleIncomingStream(data);
    });

    // Topology events
    this.topology.on('topology:changed', (topologyInfo) => {
      this.emit('topology:changed', topologyInfo);
    });

    this.topology.on('peer:discovered', (peerInfo) => {
      this.emit('peer:discovered', peerInfo);
    });

    // Router events
    this.router.on('message:routed', (message, route) => {
      this.emit('message:routed', message, route);
    });
  }

  /**
   * Handle peer connection
   */
  async _handlePeerConnect(peerId) {
    try {
      logger.info(`Peer connected: ${peerId.toString()}`);
      
      // Open a stream for Has-Needs protocol
      const connection = await this.libp2p.dial(peerId, {
        signal: AbortSignal.timeout(10000)
      });
      
      this.connections.set(peerId.toString(), connection);
      
      // Update peer info
      const peerInfo = this.peers.get(peerId.toString()) || {};
      peerInfo.connected = true;
      peerInfo.connectedAt = Date.now();
      peerInfo.lastSeen = Date.now();
      this.peers.set(peerId.toString(), peerInfo);

      // Notify topology
      await this.topology.handlePeerConnect(peerId);
      
      this.metrics.peersConnected++;
      this.emit('peer:connected', peerId.toString());
    } catch (error) {
      logger.error(`Error handling peer connect ${peerId}:`, error);
      this.metrics.connectionErrors++;
    }
  }

  /**
   * Handle peer disconnection
   */
  async _handlePeerDisconnect(peerId) {
    try {
      logger.info(`Peer disconnected: ${peerId.toString()}`);
      
      const peerIdStr = peerId.toString();
      
      // Remove connection
      this.connections.delete(peerIdStr);
      
      // Update peer info
      const peerInfo = this.peers.get(peerIdStr);
      if (peerInfo) {
        peerInfo.connected = false;
        peerInfo.disconnectedAt = Date.now();
      }

      // Notify topology
      await this.topology.handlePeerDisconnect(peerId);
      
      this.metrics.peersDisconnected++;
      this.emit('peer:disconnected', peerIdStr);
    } catch (error) {
      logger.error(`Error handling peer disconnect ${peerId}:`, error);
    }
  }

  /**
   * Handle incoming stream
   */
  async _handleIncomingStream({ stream, connection }) {
    try {
      const peerId = connection.remotePeer.toString();
      logger.debug(`Incoming stream from ${peerId}`);
      
      // Read messages from the stream
      for await (const data of stream.source) {
        try {
          const message = JSON.parse(data.toString());
          await this._handleMessage(message, peerId);
          
          this.metrics.messagesReceived++;
          this.metrics.bytesReceived += data.length;
        } catch (error) {
          logger.warn(`Error processing message from ${peerId}:`, error.message);
        }
      }
    } catch (error) {
      logger.error('Error handling incoming stream:', error);
    }
  }

  /**
   * Handle received message
   */
  async _handleMessage(message, fromPeerId) {
    try {
      logger.debug(`Received ${message.topic} from ${fromPeerId}`);
      
      // Update peer last seen
      const peerInfo = this.peers.get(fromPeerId) || {};
      peerInfo.lastSeen = Date.now();
      this.peers.set(fromPeerId, peerInfo);

      // Route message based on topic
      switch (message.topic) {
        case 'protocol:triplet':
          this.emit('peer:triplet', message.data, fromPeerId);
          break;
        case 'protocol:need':
          this.emit('peer:need', message.data, fromPeerId);
          break;
        case 'protocol:has':
          this.emit('peer:has', message.data, fromPeerId);
          break;
        case 'overlay:sync':
          this.emit('peer:overlay', message.data, fromPeerId);
          break;
        case 'topology:update':
          await this.topology.handleTopologyUpdate(message.data, fromPeerId);
          break;
        default:
          logger.warn(`Unknown message topic: ${message.topic}`);
      }
      
      this.emit('message:received', message, fromPeerId);
    } catch (error) {
      logger.error(`Error handling message from ${fromPeerId}:`, error);
    }
  }

  /**
   * Send a message through a connection
   */
  async _sendMessage(connection, message) {
    try {
      const stream = await connection.newStream('/has-needs/1.0.0');
      await stream.sink([Buffer.from(message)]);
      await stream.close();
    } catch (error) {
      logger.warn('Error sending message:', error.message);
      throw error;
    }
  }

  /**
   * Connect to bootstrap peers
   */
  async _connectToBootstrapPeers() {
    if (this.bootstrapPeers.length === 0) {
      logger.info('No bootstrap peers configured');
      return;
    }

    logger.info(`Connecting to ${this.bootstrapPeers.length} bootstrap peers...`);
    
    const connectionPromises = this.bootstrapPeers.map(async (multiaddr) => {
      try {
        await this.libp2p.dial(multiaddr);
        logger.info(`Connected to bootstrap peer: ${multiaddr}`);
      } catch (error) {
        logger.warn(`Failed to connect to bootstrap peer ${multiaddr}:`, error.message);
      }
    });

    await Promise.allSettled(connectionPromises);
  }

  /**
   * Generate unique message ID
   */
  _generateMessageId() {
    return `${this.identity.nodeId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Add a peer to the known peers list
   */
  addPeer(peerId, multiaddrs = [], protocols = []) {
    const peerInfo = {
      peerId,
      multiaddrs,
      protocols,
      discoveredAt: Date.now(),
      lastSeen: Date.now(),
      connected: this.connections.has(peerId)
    };
    
    this.peers.set(peerId, peerInfo);
    this.emit('peer:added', peerInfo);
    
    return peerInfo;
  }

  /**
   * Remove a peer from the known peers list
   */
  removePeer(peerId) {
    const peerInfo = this.peers.get(peerId);
    if (peerInfo) {
      this.peers.delete(peerId);
      this.emit('peer:removed', peerInfo);
    }
    return peerInfo;
  }

  /**
   * Get connection status
   */
  isConnected(peerId) {
    return this.connections.has(peerId);
  }

  /**
   * Get network metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      connectedPeers: this.connections.size,
      knownPeers: this.peers.size,
      uptime: this.isStarted ? Date.now() - this._startTime : 0
    };
  }
}