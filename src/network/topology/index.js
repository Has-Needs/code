/**
 * Jitterbug Topology Implementation
 * Based on Buckminster Fuller's tensegrity concepts
 * Dynamic expansion/contraction network topology
 */

import { EventEmitter } from 'eventemitter3';
import { createLogger } from '../../utils/logger.js';

const logger = createLogger('Topology');

/**
 * Geometric states for the jitterbug transformation
 */
const TOPOLOGY_STATES = {
  CONTRACTED: 'contracted',     // Cuboctahedron - tight, efficient
  EXPANDED: 'expanded',         // Icosahedron - maximum connectivity
  TRANSITIONING: 'transitioning' // Moving between states
};

/**
 * Jitterbug Topology Manager
 * Implements Fuller's jitterbug geometry for network resilience
 */
export class JitterbugTopology extends EventEmitter {
  constructor(config = {}) {
    super();
    this.config = config;
    this.network = config.network;
    this.identity = config.identity;
    
    // Topology state
    this.currentState = TOPOLOGY_STATES.CONTRACTED;
    this.targetState = TOPOLOGY_STATES.CONTRACTED;
    this.transitionProgress = 0;
    
    // Network clusters and connections
    this.clusters = new Map(); // clusterId -> ClusterInfo
    this.connections = new Map(); // connectionId -> ConnectionInfo
    this.localCluster = null;
    
    // Configuration parameters
    this.baseClusterSize = config.baseClusterSize || 6; // Cuboctahedral base
    this.expansionThreshold = config.expansionThreshold || 0.8; // Load threshold for expansion
    this.contractionThreshold = config.contractionThreshold || 0.3; // Load threshold for contraction
    this.maxConnections = config.maxConnections || 20;
    this.redundancyFactor = config.redundancyFactor || 3; // k=3 for triple redundancy
    
    // Performance metrics
    this.metrics = {
      expansions: 0,
      contractions: 0,
      clustersFormed: 0,
      connectionsEstablished: 0,
      routingEfficiency: 0
    };

    logger.info('Jitterbug Topology initialized');
  }

  async initialize() {
    try {
      logger.info('Initializing jitterbug topology...');
      
      // Create local cluster
      this.localCluster = this._createLocalCluster();
      this.clusters.set(this.localCluster.id, this.localCluster);
      
      // Initialize topology monitoring
      this._startTopologyMonitoring();
      
      logger.info('Jitterbug topology initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize jitterbug topology:', error);
      throw error;
    }
  }

  async start() {
    logger.info('Starting jitterbug topology...');
    
    // Start topology adaptation
    this._startAdaptation();
    
    logger.info('Jitterbug topology started');
  }

  async stop() {
    logger.info('Stopping jitterbug topology...');
    
    // Stop adaptation processes
    this._stopAdaptation();
    this._stopTopologyMonitoring();
    
    // Clear state
    this.clusters.clear();
    this.connections.clear();
    
    logger.info('Jitterbug topology stopped');
  }

  /**
   * Handle peer connection - integrate into topology
   */
  async handlePeerConnect(peerId) {
    try {
      logger.debug(`Integrating peer into topology: ${peerId.toString()}`);
      
      // Find best cluster for the peer
      const targetCluster = await this._findOptimalCluster(peerId);
      
      if (targetCluster && targetCluster.peers.size < this.baseClusterSize) {
        // Add to existing cluster
        await this._addPeerToCluster(peerId, targetCluster);
      } else {
        // Create new cluster or trigger expansion
        await this._handleClusterFormation(peerId);
      }
      
      // Update topology connections
      await this._updateTopologyConnections();
      
      this.emit('topology:changed', await this.getTopologyInfo());
      
    } catch (error) {
      logger.error(`Error integrating peer ${peerId}:`, error);
    }
  }

  /**
   * Handle peer disconnection - adapt topology
   */
  async handlePeerDisconnect(peerId) {
    try {
      logger.debug(`Removing peer from topology: ${peerId.toString()}`);
      
      const peerIdStr = peerId.toString();
      
      // Find and remove peer from cluster
      for (const [clusterId, cluster] of this.clusters) {
        if (cluster.peers.has(peerIdStr)) {
          cluster.peers.delete(peerIdStr);
          
          // If cluster becomes too small, merge or dissolve
          if (cluster.peers.size < 2 && cluster.id !== this.localCluster.id) {
            await this._handleClusterReorganization(cluster);
          }
          break;
        }
      }
      
      // Remove connections involving this peer
      for (const [connectionId, connection] of this.connections) {
        if (connection.peers.includes(peerIdStr)) {
          this.connections.delete(connectionId);
        }
      }
      
      // Update topology
      await this._updateTopologyConnections();
      
      this.emit('topology:changed', await this.getTopologyInfo());
      
    } catch (error) {
      logger.error(`Error removing peer ${peerId}:`, error);
    }
  }

  /**
   * Handle topology update from peer
   */
  async handleTopologyUpdate(topologyData, fromPeerId) {
    try {
      logger.debug(`Received topology update from ${fromPeerId}`);
      
      // Process peer's topology information
      if (topologyData.clusters) {
        await this._processPeerClusters(topologyData.clusters, fromPeerId);
      }
      
      if (topologyData.state && topologyData.state !== this.currentState) {
        await this._considerStateTransition(topologyData.state);
      }
      
    } catch (error) {
      logger.error(`Error processing topology update from ${fromPeerId}:`, error);
    }
  }

  /**
   * Get current topology information
   */
  async getTopologyInfo() {
    return {
      state: this.currentState,
      targetState: this.targetState,
      transitionProgress: this.transitionProgress,
      clusters: this.clusters.size,
      totalPeers: this._getTotalPeers(),
      connections: this.connections.size,
      redundancy: this._calculateRedundancy(),
      efficiency: this.metrics.routingEfficiency,
      localCluster: {
        id: this.localCluster.id,
        peers: this.localCluster.peers.size,
        load: this.localCluster.load
      },
      metrics: { ...this.metrics }
    };
  }

  /**
   * Create local cluster for this node
   */
  _createLocalCluster() {
    return {
      id: `cluster_${this.identity.nodeId}`,
      peers: new Set([this.identity.nodeId]),
      center: this.identity.nodeId,
      load: 0,
      connections: new Set(),
      createdAt: Date.now(),
      state: TOPOLOGY_STATES.CONTRACTED
    };
  }

  /**
   * Find optimal cluster for a new peer
   */
  async _findOptimalCluster(peerId) {
    let bestCluster = null;
    let bestScore = -1;
    
    for (const [clusterId, cluster] of this.clusters) {
      // Skip full clusters
      if (cluster.peers.size >= this.baseClusterSize) {
        continue;
      }
      
      // Calculate cluster score based on load, proximity, etc.
      const score = this._calculateClusterScore(cluster, peerId);
      
      if (score > bestScore) {
        bestScore = score;
        bestCluster = cluster;
      }
    }
    
    return bestCluster;
  }

  /**
   * Calculate cluster suitability score for a peer
   */
  _calculateClusterScore(cluster, peerId) {
    let score = 0;
    
    // Prefer less loaded clusters
    const loadFactor = Math.max(0, 1 - cluster.load);
    score += loadFactor * 40;
    
    // Prefer smaller clusters (not yet full)
    const sizeFactor = (this.baseClusterSize - cluster.peers.size) / this.baseClusterSize;
    score += sizeFactor * 30;
    
    // Geographic/latency proximity would be calculated here
    // For now, use random factor
    score += Math.random() * 30;
    
    return score;
  }

  /**
   * Add peer to a cluster
   */
  async _addPeerToCluster(peerId, cluster) {
    const peerIdStr = peerId.toString();
    cluster.peers.add(peerIdStr);
    
    logger.debug(`Added peer ${peerIdStr} to cluster ${cluster.id}`);
    
    // Create connections within cluster
    for (const existingPeer of cluster.peers) {
      if (existingPeer !== peerIdStr) {
        this._createConnection(peerIdStr, existingPeer, 'cluster');
      }
    }
  }

  /**
   * Handle cluster formation when no suitable cluster exists
   */
  async _handleClusterFormation(peerId) {
    const peerIdStr = peerId.toString();
    
    // Create new cluster with this peer
    const newCluster = {
      id: `cluster_${peerIdStr}_${Date.now()}`,
      peers: new Set([peerIdStr]),
      center: peerIdStr,
      load: 0,
      connections: new Set(),
      createdAt: Date.now(),
      state: TOPOLOGY_STATES.CONTRACTED
    };
    
    this.clusters.set(newCluster.id, newCluster);
    this.metrics.clustersFormed++;
    
    logger.info(`Created new cluster: ${newCluster.id}`);
    
    // Connect new cluster to existing topology
    await this._connectClusterToTopology(newCluster);
  }

  /**
   * Connect a cluster to the existing topology
   */
  async _connectClusterToTopology(newCluster) {
    // Find nearby clusters to connect to
    const nearbyClusterIds = Array.from(this.clusters.keys())
      .filter(id => id !== newCluster.id)
      .slice(0, this.redundancyFactor);
    
    for (const clusterId of nearbyClusterIds) {
      const cluster = this.clusters.get(clusterId);
      if (cluster) {
        this._createClusterConnection(newCluster, cluster);
      }
    }
  }

  /**
   * Create connection between clusters
   */
  _createClusterConnection(cluster1, cluster2) {
    const connectionId = `conn_${cluster1.id}_${cluster2.id}`;
    
    if (this.connections.has(connectionId)) {
      return; // Connection already exists
    }
    
    const connection = {
      id: connectionId,
      type: 'inter-cluster',
      clusters: [cluster1.id, cluster2.id],
      peers: [cluster1.center, cluster2.center],
      weight: 1,
      createdAt: Date.now()
    };
    
    this.connections.set(connectionId, connection);
    cluster1.connections.add(connectionId);
    cluster2.connections.add(connectionId);
    
    this.metrics.connectionsEstablished++;
    logger.debug(`Created inter-cluster connection: ${connectionId}`);
  }

  /**
   * Create connection between peers
   */
  _createConnection(peer1, peer2, type = 'direct') {
    const connectionId = `conn_${peer1}_${peer2}`;
    
    if (this.connections.has(connectionId)) {
      return; // Connection already exists
    }
    
    const connection = {
      id: connectionId,
      type,
      peers: [peer1, peer2],
      weight: 1,
      createdAt: Date.now()
    };
    
    this.connections.set(connectionId, connection);
    logger.debug(`Created ${type} connection: ${connectionId}`);
  }

  /**
   * Handle cluster reorganization when cluster becomes too small
   */
  async _handleClusterReorganization(cluster) {
    logger.info(`Reorganizing small cluster: ${cluster.id}`);
    
    if (cluster.peers.size === 0) {
      // Delete empty cluster
      this.clusters.delete(cluster.id);
      return;
    }
    
    // Find target cluster for merger
    const targetCluster = await this._findMergerTarget(cluster);
    
    if (targetCluster) {
      // Merge clusters
      for (const peer of cluster.peers) {
        targetCluster.peers.add(peer);
      }
      
      // Transfer connections
      for (const connectionId of cluster.connections) {
        const connection = this.connections.get(connectionId);
        if (connection) {
          targetCluster.connections.add(connectionId);
          // Update connection cluster references
          const clusterIndex = connection.clusters?.indexOf(cluster.id);
          if (clusterIndex >= 0) {
            connection.clusters[clusterIndex] = targetCluster.id;
          }
        }
      }
      
      // Delete old cluster
      this.clusters.delete(cluster.id);
      
      logger.info(`Merged cluster ${cluster.id} into ${targetCluster.id}`);
    }
  }

  /**
   * Find target cluster for merging
   */
  async _findMergerTarget(cluster) {
    let bestTarget = null;
    let bestScore = -1;
    
    for (const [clusterId, targetCluster] of this.clusters) {
      if (clusterId === cluster.id) continue;
      
      // Check if merger would exceed size limits
      const combinedSize = cluster.peers.size + targetCluster.peers.size;
      if (combinedSize > this.baseClusterSize * 2) {
        continue;
      }
      
      // Calculate merger score
      const score = this._calculateMergerScore(cluster, targetCluster);
      if (score > bestScore) {
        bestScore = score;
        bestTarget = targetCluster;
      }
    }
    
    return bestTarget;
  }

  /**
   * Calculate merger compatibility score
   */
  _calculateMergerScore(cluster1, cluster2) {
    let score = 0;
    
    // Prefer clusters with similar load
    const loadDiff = Math.abs(cluster1.load - cluster2.load);
    score += Math.max(0, 50 - loadDiff * 10);
    
    // Prefer geographically close clusters (placeholder)
    score += Math.random() * 50;
    
    return score;
  }

  /**
   * Update topology connections based on current state
   */
  async _updateTopologyConnections() {
    const currentLoad = this._calculateNetworkLoad();
    
    // Determine if we need to expand or contract
    if (currentLoad > this.expansionThreshold && this.currentState === TOPOLOGY_STATES.CONTRACTED) {
      await this._initiateExpansion();
    } else if (currentLoad < this.contractionThreshold && this.currentState === TOPOLOGY_STATES.EXPANDED) {
      await this._initiateContraction();
    }
    
    // Update routing efficiency
    this.metrics.routingEfficiency = this._calculateRoutingEfficiency();
  }

  /**
   * Calculate current network load
   */
  _calculateNetworkLoad() {
    if (this.clusters.size === 0) return 0;
    
    let totalLoad = 0;
    for (const [clusterId, cluster] of this.clusters) {
      totalLoad += cluster.load;
    }
    
    return totalLoad / this.clusters.size;
  }

  /**
   * Initiate topology expansion
   */
  async _initiateExpansion() {
    if (this.currentState === TOPOLOGY_STATES.EXPANDED || 
        this.currentState === TOPOLOGY_STATES.TRANSITIONING) {
      return;
    }
    
    logger.info('Initiating topology expansion to icosahedral state');
    
    this.currentState = TOPOLOGY_STATES.TRANSITIONING;
    this.targetState = TOPOLOGY_STATES.EXPANDED;
    this.transitionProgress = 0;
    
    // Create additional connections for expanded topology
    await this._createExpansionConnections();
    
    this.currentState = TOPOLOGY_STATES.EXPANDED;
    this.transitionProgress = 1;
    this.metrics.expansions++;
    
    logger.info('Topology expansion completed');
    this.emit('topology:expanded');
  }

  /**
   * Initiate topology contraction
   */
  async _initiateContraction() {
    if (this.currentState === TOPOLOGY_STATES.CONTRACTED || 
        this.currentState === TOPOLOGY_STATES.TRANSITIONING) {
      return;
    }
    
    logger.info('Initiating topology contraction to cuboctahedral state');
    
    this.currentState = TOPOLOGY_STATES.TRANSITIONING;
    this.targetState = TOPOLOGY_STATES.CONTRACTED;
    this.transitionProgress = 0;
    
    // Remove excess connections for contracted topology
    await this._removeExcessConnections();
    
    this.currentState = TOPOLOGY_STATES.CONTRACTED;
    this.transitionProgress = 1;
    this.metrics.contractions++;
    
    logger.info('Topology contraction completed');
    this.emit('topology:contracted');
  }

  /**
   * Create additional connections for expansion
   */
  async _createExpansionConnections() {
    const clusters = Array.from(this.clusters.values());
    
    // Create more inter-cluster connections for icosahedral topology
    for (let i = 0; i < clusters.length; i++) {
      for (let j = i + 1; j < clusters.length; j++) {
        const cluster1 = clusters[i];
        const cluster2 = clusters[j];
        
        // Create connection if it doesn't exist and we're not over-connected
        const connectionId = `conn_${cluster1.id}_${cluster2.id}`;
        if (!this.connections.has(connectionId) && 
            cluster1.connections.size < this.maxConnections) {
          this._createClusterConnection(cluster1, cluster2);
        }
      }
    }
  }

  /**
   * Remove excess connections for contraction
   */
  async _removeExcessConnections() {
    // Keep only essential connections for cuboctahedral topology
    const connectionsToRemove = [];
    
    for (const [connectionId, connection] of this.connections) {
      if (connection.type === 'inter-cluster') {
        // Check if this connection is redundant
        if (await this._isConnectionRedundant(connection)) {
          connectionsToRemove.push(connectionId);
        }
      }
    }
    
    // Remove redundant connections
    for (const connectionId of connectionsToRemove) {
      const connection = this.connections.get(connectionId);
      if (connection && connection.clusters) {
        for (const clusterId of connection.clusters) {
          const cluster = this.clusters.get(clusterId);
          if (cluster) {
            cluster.connections.delete(connectionId);
          }
        }
      }
      this.connections.delete(connectionId);
    }
    
    logger.debug(`Removed ${connectionsToRemove.length} redundant connections`);
  }

  /**
   * Check if a connection is redundant
   */
  async _isConnectionRedundant(connection) {
    // Simple redundancy check - keep at least k connections per cluster
    if (connection.clusters && connection.clusters.length >= 2) {
      const cluster1 = this.clusters.get(connection.clusters[0]);
      const cluster2 = this.clusters.get(connection.clusters[1]);
      
      if (cluster1 && cluster2) {
        return cluster1.connections.size > this.redundancyFactor && 
               cluster2.connections.size > this.redundancyFactor;
      }
    }
    
    return false;
  }

  /**
   * Calculate routing efficiency
   */
  _calculateRoutingEfficiency() {
    const totalPeers = this._getTotalPeers();
    if (totalPeers <= 1) return 1;
    
    // Simple efficiency metric based on connection density
    const totalConnections = this.connections.size;
    const maxPossibleConnections = (totalPeers * (totalPeers - 1)) / 2;
    const minRequiredConnections = totalPeers - 1; // Minimum for connectivity
    
    if (maxPossibleConnections === minRequiredConnections) return 1;
    
    const efficiency = (totalConnections - minRequiredConnections) / 
                      (maxPossibleConnections - minRequiredConnections);
    
    return Math.max(0, Math.min(1, efficiency));
  }

  /**
   * Calculate network redundancy
   */
  _calculateRedundancy() {
    let totalRedundancy = 0;
    let clusterCount = 0;
    
    for (const [clusterId, cluster] of this.clusters) {
      if (cluster.connections.size > 0) {
        totalRedundancy += cluster.connections.size;
        clusterCount++;
      }
    }
    
    return clusterCount > 0 ? totalRedundancy / clusterCount : 0;
  }

  /**
   * Get total number of peers in topology
   */
  _getTotalPeers() {
    const allPeers = new Set();
    for (const [clusterId, cluster] of this.clusters) {
      for (const peer of cluster.peers) {
        allPeers.add(peer);
      }
    }
    return allPeers.size;
  }

  /**
   * Process cluster information from peers
   */
  async _processPeerClusters(peerClusters, fromPeerId) {
    // Update our knowledge of the network topology
    for (const clusterInfo of peerClusters) {
      if (!this.clusters.has(clusterInfo.id)) {
        // Discovered new cluster
        this.emit('cluster:discovered', clusterInfo);
      }
    }
  }

  /**
   * Consider transitioning to a different topology state
   */
  async _considerStateTransition(peerState) {
    // Simple consensus mechanism - if enough peers are in different state, consider transition
    // This is a placeholder for more sophisticated consensus logic
    if (peerState !== this.currentState && peerState !== this.targetState) {
      logger.debug(`Peer suggests topology state: ${peerState}`);
    }
  }

  /**
   * Start topology monitoring
   */
  _startTopologyMonitoring() {
    this.monitoringInterval = setInterval(() => {
      this._updateClusterLoads();
      this._checkTopologyHealth();
    }, 5000); // Every 5 seconds
  }

  /**
   * Stop topology monitoring
   */
  _stopTopologyMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  /**
   * Start adaptation processes
   */
  _startAdaptation() {
    this.adaptationInterval = setInterval(async () => {
      await this._updateTopologyConnections();
    }, 10000); // Every 10 seconds
  }

  /**
   * Stop adaptation processes
   */
  _stopAdaptation() {
    if (this.adaptationInterval) {
      clearInterval(this.adaptationInterval);
      this.adaptationInterval = null;
    }
  }

  /**
   * Update cluster load metrics
   */
  _updateClusterLoads() {
    for (const [clusterId, cluster] of this.clusters) {
      // Simple load calculation based on peer count and connection count
      const peerLoad = cluster.peers.size / this.baseClusterSize;
      const connectionLoad = cluster.connections.size / this.maxConnections;
      cluster.load = Math.max(peerLoad, connectionLoad);
    }
  }

  /**
   * Check topology health and trigger adaptations
   */
  _checkTopologyHealth() {
    // Check for isolated clusters
    for (const [clusterId, cluster] of this.clusters) {
      if (cluster.connections.size === 0 && this.clusters.size > 1) {
        logger.warn(`Isolated cluster detected: ${clusterId}`);
        this._reconnectIsolatedCluster(cluster);
      }
    }
    
    // Check for overloaded clusters
    for (const [clusterId, cluster] of this.clusters) {
      if (cluster.peers.size > this.baseClusterSize * 2) {
        logger.warn(`Overloaded cluster detected: ${clusterId}`);
        // Could trigger cluster splitting logic here
      }
    }
  }

  /**
   * Reconnect an isolated cluster
   */
  async _reconnectIsolatedCluster(isolatedCluster) {
    // Find nearest clusters and create connections
    const otherClusters = Array.from(this.clusters.values())
      .filter(c => c.id !== isolatedCluster.id);
    
    if (otherClusters.length > 0) {
      // Connect to the first few clusters for redundancy
      const connectionsToCreate = Math.min(this.redundancyFactor, otherClusters.length);
      for (let i = 0; i < connectionsToCreate; i++) {
        this._createClusterConnection(isolatedCluster, otherClusters[i]);
      }
      logger.info(`Reconnected isolated cluster: ${isolatedCluster.id}`);
    }
  }
}