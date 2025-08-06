/**
 * Mesh Router
 * Handles intelligent routing through the jitterbug topology
 */

import { EventEmitter } from 'eventemitter3';
import { createLogger } from '../../utils/logger.js';

const logger = createLogger('Router');

export class MeshRouter extends EventEmitter {
  constructor(config = {}) {
    super();
    this.config = config;
    this.network = config.network;
    this.topology = config.topology;
    
    // Routing state
    this.routingTable = new Map(); // destination -> route
    this.routingCache = new Map(); // messageId -> route (for tracking)
    this.pendingRoutes = new Map(); // messageId -> routeRequest
    
    // Configuration
    this.maxHops = config.maxHops || 10;
    this.routeCacheTimeout = config.routeCacheTimeout || 300000; // 5 minutes
    this.routingTableRefreshInterval = config.routingTableRefreshInterval || 60000; // 1 minute
    
    // Metrics
    this.metrics = {
      messagesRouted: 0,
      routingSuccess: 0,
      routingFailures: 0,
      averageHops: 0,
      cacheHits: 0,
      cacheMisses: 0
    };

    logger.info('Mesh Router initialized');
  }

  async initialize() {
    logger.info('Initializing mesh router...');
    
    // Build initial routing table
    await this._buildRoutingTable();
    
    logger.info('Mesh router initialized successfully');
  }

  async start() {
    logger.info('Starting mesh router...');
    
    // Start routing table maintenance
    this._startRoutingTableMaintenance();
    
    // Start cache cleanup
    this._startCacheCleanup();
    
    logger.info('Mesh router started');
  }

  async stop() {
    logger.info('Stopping mesh router...');
    
    // Stop maintenance processes
    this._stopRoutingTableMaintenance();
    this._stopCacheCleanup();
    
    // Clear state
    this.routingTable.clear();
    this.routingCache.clear();
    this.pendingRoutes.clear();
    
    logger.info('Mesh router stopped');
  }

  /**
   * Route a message to a destination
   */
  async routeMessage(message, destination, options = {}) {
    try {
      this.metrics.messagesRouted++;
      
      // Check if destination is directly connected
      if (this.network.isConnected(destination)) {
        await this.network.sendToPeer(destination, message.topic, message.data);
        this.metrics.routingSuccess++;
        this.emit('message:routed', message, { hops: 1, direct: true });
        return true;
      }
      
      // Find route to destination
      const route = await this._findRoute(destination, options);
      if (!route) {
        logger.warn(`No route found to destination: ${destination}`);
        this.metrics.routingFailures++;
        return false;
      }
      
      // Route the message
      const success = await this._executeRoute(message, route);
      
      if (success) {
        this.metrics.routingSuccess++;
        this._updateAverageHops(route.hops);
        this.emit('message:routed', message, route);
      } else {
        this.metrics.routingFailures++;
      }
      
      return success;
    } catch (error) {
      logger.error(`Error routing message to ${destination}:`, error);
      this.metrics.routingFailures++;
      return false;
    }
  }

  /**
   * Find route to destination
   */
  async _findRoute(destination, options = {}) {
    // Check routing cache first
    const cachedRoute = this.routingTable.get(destination);
    if (cachedRoute && await this._validateRoute(cachedRoute)) {
      this.metrics.cacheHits++;
      return cachedRoute;
    }
    
    this.metrics.cacheMisses++;
    
    // Compute new route
    const route = await this._computeRoute(destination, options);
    
    if (route) {
      // Cache the route
      this.routingTable.set(destination, {
        ...route,
        timestamp: Date.now()
      });
    }
    
    return route;
  }

  /**
   * Compute route to destination using topology
   */
  async _computeRoute(destination, options = {}) {
    const algorithm = options.algorithm || 'shortest-path';
    
    switch (algorithm) {
      case 'shortest-path':
        return this._computeShortestPath(destination);
      case 'load-balanced':
        return this._computeLoadBalancedPath(destination);
      case 'redundant':
        return this._computeRedundantPath(destination);
      default:
        return this._computeShortestPath(destination);
    }
  }

  /**
   * Compute shortest path using topology information
   */
  async _computeShortestPath(destination) {
    const topology = await this.topology.getTopologyInfo();
    
    // Simple breadth-first search through topology
    const queue = [{ peer: this.network.identity.nodeId, path: [], hops: 0 }];
    const visited = new Set();
    
    while (queue.length > 0) {
      const current = queue.shift();
      
      if (current.peer === destination) {
        return {
          destination,
          path: current.path,
          hops: current.hops,
          algorithm: 'shortest-path',
          nextHop: current.path[0] || destination
        };
      }
      
      if (current.hops >= this.maxHops || visited.has(current.peer)) {
        continue;
      }
      
      visited.add(current.peer);
      
      // Get connected peers
      const connectedPeers = await this._getConnectedPeers(current.peer);
      
      for (const peer of connectedPeers) {
        if (!visited.has(peer)) {
          queue.push({
            peer,
            path: [...current.path, peer],
            hops: current.hops + 1
          });
        }
      }
    }
    
    return null; // No route found
  }

  /**
   * Compute load-balanced path
   */
  async _computeLoadBalancedPath(destination) {
    // Start with shortest path and then consider load
    const shortestPath = await this._computeShortestPath(destination);
    if (!shortestPath) return null;
    
    // TODO: Implement load-aware routing
    // For now, return shortest path
    return {
      ...shortestPath,
      algorithm: 'load-balanced'
    };
  }

  /**
   * Compute redundant path (multiple paths)
   */
  async _computeRedundantPath(destination) {
    const primaryPath = await this._computeShortestPath(destination);
    if (!primaryPath) return null;
    
    // TODO: Implement redundant path computation
    // For now, return primary path
    return {
      ...primaryPath,
      algorithm: 'redundant',
      redundantPaths: []
    };
  }

  /**
   * Get connected peers for a given peer
   */
  async _getConnectedPeers(peerId) {
    if (peerId === this.network.identity.nodeId) {
      // Return our directly connected peers
      return Array.from(this.network.connections.keys());
    }
    
    // For other peers, we'd need to query topology or maintain peer state
    // For now, return empty array
    return [];
  }

  /**
   * Execute a route by sending message to next hop
   */
  async _executeRoute(message, route) {
    try {
      const routedMessage = {
        ...message,
        _route: {
          destination: route.destination,
          path: route.path,
          currentHop: 0,
          totalHops: route.hops
        }
      };
      
      // Send to next hop
      const success = await this.network.sendToPeer(
        route.nextHop, 
        'route:forward', 
        routedMessage
      );
      
      if (success) {
        // Cache this routing attempt
        this.routingCache.set(message.id, {
          route,
          timestamp: Date.now()
        });
      }
      
      return success;
    } catch (error) {
      logger.error(`Error executing route:`, error);
      return false;
    }
  }

  /**
   * Handle forwarded message
   */
  async handleForwardedMessage(message, fromPeerId) {
    try {
      const route = message._route;
      if (!route) {
        logger.warn('Received forwarded message without route information');
        return false;
      }
      
      route.currentHop++;
      
      // Check if we are the destination
      if (route.destination === this.network.identity.nodeId) {
        // Message reached destination
        delete message._route;
        this.emit('message:delivered', message, route);
        return true;
      }
      
      // Check hop limit
      if (route.currentHop >= route.totalHops) {
        logger.warn(`Message exceeded hop limit: ${message.id}`);
        return false;
      }
      
      // Forward to next hop
      const nextHopIndex = route.currentHop;
      if (nextHopIndex >= route.path.length) {
        logger.warn(`Route path exhausted: ${message.id}`);
        return false;
      }
      
      const nextHop = route.path[nextHopIndex];
      return await this.network.sendToPeer(nextHop, 'route:forward', message);
      
    } catch (error) {
      logger.error('Error handling forwarded message:', error);
      return false;
    }
  }

  /**
   * Validate that a route is still valid
   */
  async _validateRoute(route) {
    // Check if route is not too old
    const age = Date.now() - route.timestamp;
    if (age > this.routeCacheTimeout) {
      return false;
    }
    
    // Check if next hop is still connected
    if (!this.network.isConnected(route.nextHop)) {
      return false;
    }
    
    return true;
  }

  /**
   * Build routing table based on current topology
   */
  async _buildRoutingTable() {
    logger.debug('Building routing table...');
    
    // Clear existing table
    this.routingTable.clear();
    
    // Get topology information
    const topology = await this.topology.getTopologyInfo();
    
    // For each known peer, compute route
    const allPeers = this._getAllKnownPeers();
    
    for (const peer of allPeers) {
      if (peer !== this.network.identity.nodeId) {
        const route = await this._computeShortestPath(peer);
        if (route) {
          this.routingTable.set(peer, {
            ...route,
            timestamp: Date.now()
          });
        }
      }
    }
    
    logger.debug(`Built routing table with ${this.routingTable.size} routes`);
  }

  /**
   * Get all known peers from network and topology
   */
  _getAllKnownPeers() {
    const peers = new Set();
    
    // Add directly connected peers
    for (const peerId of this.network.connections.keys()) {
      peers.add(peerId);
    }
    
    // Add peers from network peer list
    for (const peer of this.network.getPeersInfo()) {
      peers.add(peer.peerId);
    }
    
    return Array.from(peers);
  }

  /**
   * Start routing table maintenance
   */
  _startRoutingTableMaintenance() {
    this.routingTableInterval = setInterval(async () => {
      await this._maintainRoutingTable();
    }, this.routingTableRefreshInterval);
  }

  /**
   * Stop routing table maintenance
   */
  _stopRoutingTableMaintenance() {
    if (this.routingTableInterval) {
      clearInterval(this.routingTableInterval);
      this.routingTableInterval = null;
    }
  }

  /**
   * Maintain routing table by removing stale routes and adding new ones
   */
  async _maintainRoutingTable() {
    try {
      const now = Date.now();
      const stalRoutes = [];
      
      // Find stale routes
      for (const [destination, route] of this.routingTable) {
        if (now - route.timestamp > this.routeCacheTimeout ||
            !await this._validateRoute(route)) {
          stalRoutes.push(destination);
        }
      }
      
      // Remove stale routes
      for (const destination of stalRoutes) {
        this.routingTable.delete(destination);
      }
      
      if (stalRoutes.length > 0) {
        logger.debug(`Removed ${stalRoutes.length} stale routes`);
      }
      
      // Add routes for newly discovered peers
      const knownPeers = this._getAllKnownPeers();
      for (const peer of knownPeers) {
        if (peer !== this.network.identity.nodeId && 
            !this.routingTable.has(peer)) {
          const route = await this._computeShortestPath(peer);
          if (route) {
            this.routingTable.set(peer, {
              ...route,
              timestamp: now
            });
          }
        }
      }
      
    } catch (error) {
      logger.error('Error maintaining routing table:', error);
    }
  }

  /**
   * Start cache cleanup
   */
  _startCacheCleanup() {
    this.cacheCleanupInterval = setInterval(() => {
      this._cleanupCache();
    }, 60000); // Every minute
  }

  /**
   * Stop cache cleanup
   */
  _stopCacheCleanup() {
    if (this.cacheCleanupInterval) {
      clearInterval(this.cacheCleanupInterval);
      this.cacheCleanupInterval = null;
    }
  }

  /**
   * Clean up expired cache entries
   */
  _cleanupCache() {
    const now = Date.now();
    const expiredEntries = [];
    
    for (const [messageId, cacheEntry] of this.routingCache) {
      if (now - cacheEntry.timestamp > this.routeCacheTimeout) {
        expiredEntries.push(messageId);
      }
    }
    
    for (const messageId of expiredEntries) {
      this.routingCache.delete(messageId);
    }
    
    if (expiredEntries.length > 0) {
      logger.debug(`Cleaned up ${expiredEntries.length} expired cache entries`);
    }
  }

  /**
   * Update average hops metric
   */
  _updateAverageHops(hops) {
    const totalRoutingSuccess = this.metrics.routingSuccess;
    this.metrics.averageHops = 
      ((this.metrics.averageHops * (totalRoutingSuccess - 1)) + hops) / totalRoutingSuccess;
  }

  /**
   * Get routing statistics
   */
  getRoutingStats() {
    return {
      ...this.metrics,
      routingTableSize: this.routingTable.size,
      cacheSize: this.routingCache.size,
      successRate: this.metrics.messagesRouted > 0 ? 
        this.metrics.routingSuccess / this.metrics.messagesRouted : 0
    };
  }

  /**
   * Get routing table information
   */
  getRoutingTable() {
    const table = {};
    for (const [destination, route] of this.routingTable) {
      table[destination] = {
        nextHop: route.nextHop,
        hops: route.hops,
        algorithm: route.algorithm,
        age: Date.now() - route.timestamp
      };
    }
    return table;
  }

  /**
   * Force route recalculation for a destination
   */
  async invalidateRoute(destination) {
    this.routingTable.delete(destination);
    const newRoute = await this._findRoute(destination);
    logger.debug(`Recalculated route to ${destination}:`, newRoute);
    return newRoute;
  }
}