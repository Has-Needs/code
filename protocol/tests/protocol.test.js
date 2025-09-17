/**
 * Tests for Has-Needs Protocol Core
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { HasNeedsProtocol } from '../src/protocol/index.js';
import { Triplet, TripletFactory } from '../src/protocol/triplets/index.js';
import { Identity } from '../src/identity/index.js';

describe('Has-Needs Protocol', () => {
  let protocol;
  let identity;

  beforeEach(async () => {
    identity = new Identity({ nodeId: 'test-node-1' });
    await identity.initialize();
    
    protocol = new HasNeedsProtocol({ identity });
    await protocol.initialize();
    await protocol.start();
  });

  afterEach(async () => {
    await protocol.stop();
  });

  describe('Triplet Creation', () => {
    it('should create a Need triplet', async () => {
      const need = await protocol.createNeed(
        'test-entity',
        'test-resource',
        { urgency: 'high' }
      );

      expect(need).toBeDefined();
      expect(need.relation).toBe('needs');
      expect(need.entity).toBe('test-entity');
      expect(need.object).toBe('test-resource');
      expect(need.context.urgency).toBe('high');
      expect(need.validated).toBe(true);
    });

    it('should create a Has triplet', async () => {
      const has = await protocol.createHas(
        'test-entity',
        'test-resource',
        { availability: 'available' }
      );

      expect(has).toBeDefined();
      expect(has.relation).toBe('has');
      expect(has.entity).toBe('test-entity');
      expect(has.object).toBe('test-resource');
      expect(has.context.availability).toBe('available');
      expect(has.validated).toBe(true);
    });

    it('should create a Committed triplet', async () => {
      const need = await protocol.createNeed('alice', 'shelter');
      const has = await protocol.createHas('bob', 'tent');

      const committed = await protocol.createCommitted(
        need,
        has,
        { terms: { duration: '24h' } }
      );

      expect(committed).toBeDefined();
      expect(committed.relation).toBe('committed');
      expect(committed.entity).toEqual(['alice', 'bob']);
      expect(committed.object.need).toBe(need.id);
      expect(committed.object.has).toBe(has.id);
    });
  });

  describe('Matching System', () => {
    it('should find matches between Need and Has', (done) => {
      protocol.on('match:found', ({ need, has }) => {
        expect(need.object).toBe('food');
        expect(has.object).toBe('food');
        done();
      });

      // Create matching need and has
      Promise.all([
        protocol.createNeed('alice', 'food', { urgency: 'medium' }),
        protocol.createHas('bob', 'food', { availability: 'available' })
      ]);
    });

    it('should not match incompatible resources', async () => {
      let matchFound = false;
      
      protocol.on('match:found', () => {
        matchFound = true;
      });

      await protocol.createNeed('alice', 'medical supplies');
      await protocol.createHas('bob', 'construction tools');

      // Wait a bit to see if any matches are found
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(matchFound).toBe(false);
    });
  });

  describe('Protocol State', () => {
    it('should track protocol metrics', async () => {
      await protocol.createNeed('alice', 'water');
      await protocol.createHas('bob', 'water bottles');

      const info = await protocol.getProtocolInfo();
      
      expect(info.triplets).toBeGreaterThan(0);
      expect(info.needs).toBeGreaterThan(0);
      expect(info.has).toBeGreaterThan(0);
      expect(info.metrics.needsCreated).toBeGreaterThan(0);
      expect(info.metrics.hasCreated).toBeGreaterThan(0);
    });

    it('should query triplets by criteria', async () => {
      await protocol.createNeed('alice', 'shelter', { urgency: 'high' });
      await protocol.createHas('bob', 'tent', { availability: 'available' });

      const needTriplets = protocol.queryTriplets({ relation: 'needs' });
      const hasTriplets = protocol.queryTriplets({ relation: 'has' });

      expect(needTriplets.length).toBe(1);
      expect(hasTriplets.length).toBe(1);
      expect(needTriplets[0].relation).toBe('needs');
      expect(hasTriplets[0].relation).toBe('has');
    });
  });

  describe('Peer Integration', () => {
    it('should process peer triplets', async () => {
      const peerTriplet = new Triplet({
        entity: 'peer-entity',
        relation: 'needs',
        object: 'peer-resource',
        context: { timestamp: Date.now() },
        creator: 'peer-node-1'
      });

      const success = await protocol.processPeerTriplet(peerTriplet, 'peer-node-1');
      
      expect(success).toBe(true);
      expect(protocol.getTriplet(peerTriplet.id)).toBeDefined();
    });
  });
});

describe('Triplet Data Structure', () => {
  describe('Basic Triplet', () => {
    it('should create a valid triplet', () => {
      const triplet = new Triplet({
        entity: 'test-entity',
        relation: 'needs',
        object: 'test-resource',
        context: { location: 'test-location' },
        creator: 'test-creator'
      });

      expect(triplet.entity).toBe('test-entity');
      expect(triplet.relation).toBe('needs');
      expect(triplet.object).toBe('test-resource');
      expect(triplet.context.location).toBe('test-location');
      expect(triplet.creator).toBe('test-creator');
      expect(triplet.id).toBeDefined();
      expect(triplet.timestamp).toBeDefined();
      expect(triplet.hash).toBeDefined();
    });

    it('should validate relation types', () => {
      expect(() => {
        new Triplet({
          entity: 'test',
          relation: 'invalid-relation',
          object: 'test',
          creator: 'test'
        });
      }).toThrow('Invalid relation');
    });

    it('should verify hash integrity', () => {
      const triplet = new Triplet({
        entity: 'test-entity',
        relation: 'has',
        object: 'test-resource',
        creator: 'test-creator'
      });

      expect(triplet.verifyHash()).toBe(true);

      // Modify triplet and check hash becomes invalid
      triplet.entity = 'modified-entity';
      expect(triplet.verifyHash()).toBe(false);

      // Update hash and verify again
      triplet.updateHash();
      expect(triplet.verifyHash()).toBe(true);
    });
  });

  describe('Triplet Factory', () => {
    it('should create Need triplets', () => {
      const need = TripletFactory.createNeed(
        'alice',
        'medical supplies',
        { urgency: 'high', location: 'hospital' }
      );

      expect(need.relation).toBe('needs');
      expect(need.entity).toBe('alice');
      expect(need.object).toBe('medical supplies');
      expect(need.context.urgency).toBe('high');
      expect(need.context.location).toBe('hospital');
    });

    it('should create Has triplets', () => {
      const has = TripletFactory.createHas(
        'bob',
        'first aid kit',
        { availability: 'available', capacity: 10 }
      );

      expect(has.relation).toBe('has');
      expect(has.entity).toBe('bob');
      expect(has.object).toBe('first aid kit');
      expect(has.context.availability).toBe('available');
      expect(has.context.capacity).toBe(10);
    });

    it('should create Committed triplets', () => {
      const committed = TripletFactory.createCommitted(
        ['alice', 'bob'],
        { terms: { duration: '24h' }, validUntil: Date.now() + 86400000 }
      );

      expect(committed.relation).toBe('committed');
      expect(committed.entity).toEqual(['alice', 'bob']);
      expect(committed.object.agreement.terms.duration).toBe('24h');
    });
  });

  describe('Semantic Features', () => {
    it('should extract semantic features', () => {
      const triplet = new Triplet({
        entity: 'alice@example.com',
        relation: 'needs',
        object: 'emergency food supplies',
        context: { 
          urgency: 'high',
          location: { lat: 37.7749, lng: -122.4194 }
        },
        creator: 'node-1'
      });

      const features = triplet.getSemanticFeatures();
      
      expect(features.relation).toBe('needs');
      expect(features.entityType).toBe('user');
      expect(features.resourceType).toBe('food');
      expect(features.urgency).toBe('high');
      expect(features.location).toEqual({ lat: 37.7749, lng: -122.4194 });
    });

    it('should convert to semantic representation', () => {
      const triplet = new Triplet({
        entity: 'org:red-cross',
        relation: 'has',
        object: 'disaster relief supplies',
        creator: 'node-1'
      });

      const semantic = triplet.toSemantic();
      
      expect(semantic.subject).toBe('org:red-cross');
      expect(semantic.predicate).toBe('has');
      expect(semantic.object).toBe('disaster relief supplies');
      expect(semantic.context.temporal.created).toBeDefined();
      expect(semantic.provenance.hash).toBe(triplet.hash);
    });
  });
});