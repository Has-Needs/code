#!/usr/bin/env node
/**
 * Basic Usage Example
 * Demonstrates core Has-Needs protocol functionality
 */

import { HasNeedsNode } from '../src/index.js';

async function basicUsageExample() {
  console.log('🌟 Has-Needs Protocol - Basic Usage Example\n');

  try {
    // Create and start a Has-Needs node
    console.log('📡 Creating Has-Needs node...');
    const node = new HasNeedsNode({
      port: 3000,
      meshPort: 4001,
      logLevel: 'info',
      profile: {
        name: 'Demo Node',
        description: 'Demonstrating Has-Needs protocol'
      }
    });

    await node.initialize();
    await node.start();
    console.log('✅ Node started successfully!\n');

    // Get node information
    const nodeInfo = await node.getNodeInfo();
    console.log('🔍 Node Information:');
    console.log(`  Node ID: ${nodeInfo.nodeId}`);
    console.log(`  Peer ID: ${nodeInfo.peerId}`);
    console.log(`  Running: ${nodeInfo.isRunning}\n`);

    // Example 1: Create a Need
    console.log('📢 Example 1: Creating a Need');
    const need = await node.protocol.createNeed(
      'community-center',
      'Emergency blankets',
      {
        urgency: 'high',
        quantity: 50,
        location: { 
          lat: 37.7749, 
          lng: -122.4194,
          description: 'San Francisco Community Center'
        },
        expires: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
      }
    );
    console.log(`  ✨ Need created: ${need.id}`);
    console.log(`  📍 Location: ${need.context.location.description}`);
    console.log(`  ⏰ Expires: ${new Date(need.context.expires).toLocaleString()}\n`);

    // Example 2: Create a Has (offering)
    console.log('🎁 Example 2: Creating a Has (offering)');
    const has = await node.protocol.createHas(
      'relief-organization',
      'Thermal blankets',
      {
        availability: 'available',
        quantity: 100,
        location: {
          lat: 37.7849,
          lng: -122.4094,
          description: 'Relief Warehouse'
        },
        conditions: {
          deliveryRadius: '10km',
          contactInfo: 'relief@example.org'
        }
      }
    );
    console.log(`  ✨ Has created: ${has.id}`);
    console.log(`  📦 Quantity: ${has.context.quantity}`);
    console.log(`  🚛 Delivery radius: ${has.context.conditions.deliveryRadius}\n`);

    // Example 3: Listen for matches
    console.log('🔍 Example 3: Listening for matches...');
    node.protocol.on('match:found', ({ need, has }) => {
      console.log(`  🎯 Match found!`);
      console.log(`    Need: ${need.object} (${need.entity})`);
      console.log(`    Has: ${has.object} (${has.entity})`);
      console.log(`    Match score: High (compatible resources)\n`);
    });

    // Wait a moment for match processing
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Example 4: Create overlays (knowledge sharing)
    console.log('📚 Example 4: Creating knowledge overlays');
    const knowledgeOverlay = await node.overlays.createOverlay(
      'knowledge',
      {
        title: 'Emergency Response Best Practices',
        content: 'Step-by-step guide for coordinating emergency supplies',
        tags: ['emergency', 'coordination', 'best-practices'],
        expertise: 'disaster-response'
      },
      {
        accessLevel: 'community',
        context: {
          domain: 'emergency-management',
          validated: true
        }
      }
    );
    console.log(`  📖 Knowledge overlay created: ${knowledgeOverlay.id}`);
    console.log(`  🔒 Access level: ${knowledgeOverlay.accessLevel}\n`);

    // Example 5: Query the system
    console.log('🔎 Example 5: Querying the system');
    
    const allNeeds = node.protocol.getAllNeeds();
    const allHas = node.protocol.getAllHas();
    const protocolInfo = await node.protocol.getProtocolInfo();
    
    console.log(`  📋 Current state:`);
    console.log(`    Needs: ${allNeeds.length}`);
    console.log(`    Has: ${allHas.length}`);
    console.log(`    Total triplets: ${protocolInfo.triplets}`);
    console.log(`    Matches made: ${protocolInfo.metrics.matchesMade}\n`);

    // Example 6: Demonstrate location-based filtering
    console.log('📍 Example 6: Location-based queries');
    const nearbyTriplets = node.protocol.queryTriplets({
      location: { lat: 37.7749, lng: -122.4194 },
      maxDistance: 5 // 5km radius
    });
    console.log(`  🗺️  Found ${nearbyTriplets.length} triplets within 5km\n`);

    // Example 7: Show network topology
    console.log('🕸️ Example 7: Network topology');
    const networkInfo = await node.network.getNetworkInfo();
    const topologyInfo = networkInfo.topology;
    
    if (topologyInfo) {
      console.log(`  🔗 Network state: ${topologyInfo.state}`);
      console.log(`  🏘️  Clusters: ${topologyInfo.clusters}`);
      console.log(`  👥 Total peers: ${topologyInfo.totalPeers}`);
      console.log(`  🔄 Connections: ${topologyInfo.connections}\n`);
    } else {
      console.log('  🔗 Single node - no network topology yet\n');
    }

    // Example 8: Demonstrate event-driven architecture
    console.log('⚡ Example 8: Event-driven updates');
    
    let eventCount = 0;
    const eventListener = (data) => {
      eventCount++;
      console.log(`  📡 Event ${eventCount}: ${data.relation} triplet processed`);
    };
    
    node.protocol.on('triplet:created', eventListener);
    
    // Create a few more triplets to demonstrate events
    await node.protocol.createNeed('mobile-clinic', 'Medical supplies');
    await node.protocol.createHas('pharmacy', 'Basic medications');
    
    // Clean up event listener
    node.protocol.off('triplet:created', eventListener);
    console.log();

    // Show final statistics
    console.log('📊 Final Statistics:');
    const finalInfo = await node.getNodeInfo();
    console.log(`  Protocol: ${JSON.stringify(finalInfo.protocol, null, 2)}`);
    console.log(`  Network: Connected peers: ${finalInfo.network?.connectedPeers || 0}`);
    
    const overlaysInfo = await node.overlays.getOverlaysInfo();
    console.log(`  Overlays: ${overlaysInfo.totalOverlays} total, ${overlaysInfo.myOverlays} mine`);

    console.log('\n🎉 Basic usage example completed successfully!');
    console.log('💡 This demonstrates the core Has-Needs protocol functionality:');
    console.log('   • Sovereign triplet creation and validation');
    console.log('   • Automated matching between Needs and Has');
    console.log('   • Knowledge overlays for wisdom sharing');
    console.log('   • Event-driven architecture for real-time updates');
    console.log('   • Network topology for resilient coordination\n');

    // Clean shutdown
    console.log('🛑 Shutting down...');
    await node.stop();
    console.log('✅ Node stopped cleanly');

  } catch (error) {
    console.error('❌ Error in basic usage example:', error);
    process.exit(1);
  }
}

// Run example if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  basicUsageExample();
}

export { basicUsageExample };