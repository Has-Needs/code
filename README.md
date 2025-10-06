# Has-Needs Protocol

## Overview

The Has-Needs Protocol is a system for managing and coordinating resources through a **completely** decentralized network. This project includes a 3D globe interface for visualizing and interacting with resource data.

[![License](https://img.shields.io/badge/License-Proprietary-blue.svg)](LICENSE)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)

## Access Control

- **Status**: Early days
- **Contributions**: Currently limited access for external contributions
- **Issues**: Limited to discussion
- **Code Review**: Conducted internally by the core team

## Getting Started

For authorized contributors, see [GETTING_STARTED.md](GETTING_STARTED.md) for development setup instructions.

## Security

Please report any security issues to security@has-needs.org. Do not create public issues for security vulnerabilities.

### Basic Usage

```javascript
import { HasNeedsNode } from 'has-needs-protocol';

// Create and start a node
const node = new HasNeedsNode({
  port: 3000,
  meshPort: 4001
});

await node.initialize();
await node.start();

// Create a Need
const need = await node.protocol.createNeed(
  'community-center',
  'Emergency blankets',
  {
    urgency: 'high',
    location: { lat: 37.7749, lng: -122.4194 },
    expires: Date.now() + 24 * 60 * 60 * 1000
  }
);

// Create a Has (offering)
const has = await node.protocol.createHas(
  'relief-org',
  'Thermal blankets',
  {
    availability: 'available',
    quantity: 100
  }
);

// Listen for matches
node.protocol.on('match:found', ({ need, has }) => {
  console.log('Match found!', { need: need.object, has: has.object });
});
```

## 🏗️ Architecture

### Core Components

- **Protocol Layer**: Triplet data model, validation, consensus
- **Network Layer**: Jitterbug topology, mesh routing, peer discovery
- **Overlays Layer**: Knowledge sharing, access control, sovereignty
- **Identity Layer**: Cryptographic keys, sovereign identity management

### Data Model: [Entity, Relation, Context]

Every interaction is captured as a triplet with three core relations:

- **`has`**: Entity possesses/controls and offers something
- **`needs`**: Entity expresses a requirement/request
- **`committed`**: Mutual entry into a contract/agreement

```javascript
// Example triplet
{
  id: "triplet_12345",
  entity: "alice@community.org",
  relation: "needs",
  object: "emergency shelter",
  context: {
    location: { lat: 37.7749, lng: -122.4194 },
    urgency: "high",
    expires: 1640995200000
  },
  creator: "node_alice_1",
  timestamp: 1640908800000,
  validated: true
}
```

## License

This project is proprietary and confidential. All rights reserved. See [LICENSE](LICENSE) for more information.

### API Reference

#### Protocol Methods

```javascript
// Create triplets
await protocol.createNeed(entity, resource, context)
await protocol.createHas(entity, resource, context)
await protocol.createCommitted(needTriplet, hasTriplet, agreement)

// Query system
const needs = protocol.getAllNeeds()
const has = protocol.getAllHas()
const triplets = protocol.queryTriplets(filter)

// Get information
const info = await protocol.getProtocolInfo()
```

#### Network Methods

```javascript
// Messaging
await network.broadcast(topic, data)
await network.sendToPeer(peerId, topic, data)

// Network state
const info = await network.getNetworkInfo()
const peers = network.getPeersInfo()
```

#### Overlays Methods

```javascript
// Create overlays
const overlay = await overlays.createOverlay(type, data, options)

// Query overlays
const results = await overlays.queryOverlays(criteria)

// Share knowledge
await overlays.shareOverlay(overlayId, entities, permissions)
```

## 🛠️ Development

### Setup Development Environment

```bash
# Install dependencies
npm install

# Start development network (3 nodes)
npm run dev

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint

# Format code
npm run format
```

### Project Structure

```
src/
├── protocol/           # Core protocol implementation
│   ├── triplets/       # Triplet data structures
│   ├── validation/     # Validation engine
│   └── consensus/      # Consensus mechanisms
├── network/            # Mesh networking layer
│   ├── topology/       # Jitterbug topology
│   └── routing/        # Mesh routing
├── overlays/           # Knowledge overlays
├── identity/           # Identity management
└── utils/              # Shared utilities

tests/                  # Test suite
examples/               # Usage examples
scripts/                # Development scripts
docs/                   # Documentation
```

### Running Examples

```bash
# Basic protocol usage
node examples/basic-usage.js

# Development network (3 nodes)
node scripts/dev.js

# Emergency response scenario
node examples/emergency-response.js
```

## 🌍 Use Cases

### Emergency Response

```javascript
// Disaster coordination
const need = await protocol.createNeed(
  'evacuation-center',
  'Medical supplies',
  {
    urgency: 'critical',
    location: { lat: 34.0522, lng: -118.2437 },
    requiredBy: Date.now() + 2 * 60 * 60 * 1000 // 2 hours
  }
);
```

### Circular Economy

```javascript
// Resource sharing
const has = await protocol.createHas(
  'community-workshop',
  'Power tools',
  {
    availability: 'available',
    conditions: {
      returnBy: 'end-of-day',
      skillLevel: 'basic-training-required'
    }
  }
);
```

### Knowledge Networks

```javascript
// Share expertise
const knowledgeOverlay = await overlays.createOverlay(
  'knowledge',
  {
    expertise: 'permaculture-design',
    content: 'Water harvesting techniques for arid climates',
    validatedBy: 'indigenous-council'
  },
  {
    accessLevel: 'community',
    shareableWith: ['water-management-groups']
  }
);
```

## 🔒 Security & Privacy

- **Zero-Knowledge Proofs**: Validate without revealing private data
- **Cryptographic Signatures**: All triplets are cryptographically signed
- **Granular Access Control**: Fine-grained permissions for knowledge sharing
- **Sovereign Data**: No central authority can access private information
- **Ephemeral Validation**: Context-bound verification without persistent scoring

## 📊 Performance

- **Scalability**: Handles thousands of nodes with jitterbug topology
- **Latency**: Sub-second triplet validation and matching
- **Resilience**: Self-healing network adapts to 50%+ node failures
- **Efficiency**: Minimal resource usage with purpose-built architecture

## Contact

For access requests or questions, please contact: contact@has-needs.org

### Development Setup

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Run the test suite
6. Submit a pull request

### Code Style

- ES modules (import/export)
- Modern JavaScript (ES2022+)
- Functional programming patterns
- Comprehensive error handling
- Extensive logging and debugging

## Privacy

This project is private and confidential. See [PRIVACY.md](PRIVACY.md) for more information about access controls and data handling.
