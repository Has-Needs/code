#!/usr/bin/env node
/**
 * Development script for Has-Needs protocol
 * Sets up development environment with multiple nodes
 */

import { HasNeedsNode } from '../src/index.js';

async function startDevelopmentNetwork() {
  console.log('🚀 Starting Has-Needs Development Network\n');

  // Create multiple nodes for testing
  const nodes = [];
  const basePort = 4000;
  const baseMeshPort = 5000;

  // Node configurations
  const nodeConfigs = [
    {
      name: 'Alice',
      port: basePort,
      meshPort: baseMeshPort,
      profile: { name: 'Alice', role: 'coordinator' }
    },
    {
      name: 'Bob',
      port: basePort + 1,
      meshPort: baseMeshPort + 1,
      bootstrapPeers: [`/ip4/127.0.0.1/tcp/${baseMeshPort}/ws`],
      profile: { name: 'Bob', role: 'provider' }
    },
    {
      name: 'Charlie',
      port: basePort + 2,
      meshPort: baseMeshPort + 2,
      bootstrapPeers: [`/ip4/127.0.0.1/tcp/${baseMeshPort}/ws`],
      profile: { name: 'Charlie', role: 'requester' }
    }
  ];

  try {
    // Start nodes
    for (const config of nodeConfigs) {
      console.log(`Starting node: ${config.name}`);
      
      const node = new HasNeedsNode({
        ...config,
        logLevel: 'debug',
        dataDir: `./data/${config.name.toLowerCase()}`
      });

      await node.initialize();
      await node.start();

      nodes.push({ name: config.name, node });
      console.log(`✅ ${config.name} started on mesh port ${config.meshPort}\n`);
    }

    // Wait a bit for network formation
    console.log('⏳ Waiting for network formation...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Create some sample interactions
    console.log('🎭 Creating sample interactions...\n');
    
    // Alice creates a Need
    await nodes[0].node.protocol.createNeed(
      'Alice',
      'Emergency shelter',
      {
        location: { lat: 37.7749, lng: -122.4194 },
        urgency: 'high',
        expires: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
      }
    );
    console.log('📢 Alice created a Need for emergency shelter');

    // Bob creates a Has
    await nodes[1].node.protocol.createHas(
      'Bob',
      'Temporary shelter',
      {
        location: { lat: 37.7849, lng: -122.4094 },
        availability: 'available',
        capacity: 5
      }
    );
    console.log('🏠 Bob created a Has for temporary shelter');

    // Charlie creates another Need
    await nodes[2].node.protocol.createNeed(
      'Charlie',
      'Medical supplies',
      {
        location: { lat: 37.7649, lng: -122.4294 },
        urgency: 'medium'
      }
    );
    console.log('🏥 Charlie created a Need for medical supplies');

    // Print network status
    setTimeout(async () => {
      console.log('\n📊 Network Status:');
      for (const { name, node } of nodes) {
        const info = await node.getNodeInfo();
        const protocolInfo = info.protocol;
        console.log(`${name}: ${protocolInfo.needs} needs, ${protocolInfo.has} has, ${protocolInfo.triplets} triplets`);
      }
    }, 2000);

    console.log('\n🎉 Development network is running!');
    console.log('Use Ctrl+C to stop all nodes.\n');

    // Handle graceful shutdown
    const shutdown = async () => {
      console.log('\n🛑 Shutting down development network...');
      
      for (const { name, node } of nodes) {
        console.log(`Stopping ${name}...`);
        await node.stop();
      }
      
      console.log('✅ All nodes stopped');
      process.exit(0);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

  } catch (error) {
    console.error('❌ Failed to start development network:', error);
    
    // Cleanup on error
    for (const { node } of nodes) {
      try {
        await node.stop();
      } catch (err) {
        // Ignore cleanup errors
      }
    }
    
    process.exit(1);
  }
}

// Start development network if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  startDevelopmentNetwork();
}