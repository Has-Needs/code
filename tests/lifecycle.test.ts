import { describe, expect, it } from 'vitest';
import {
  SovereignStore,
  completeWorking,
  createHas,
  createNeed,
  createWorking,
  proposeCandidate
} from '../src/core/lifecycle.js';

describe('Has-Needs V1 minimal lifecycle', () => {
  it('moves from sovereign NEED and HAS to WORKING only after mutual acceptance', () => {
    const need = createNeed('alice', 'potable water', { quantity: 4 });
    const has = createHas('bob', 'potable water', { quantity: 8 });

    const candidate = proposeCandidate(need, has);
    expect(candidate).not.toBeNull();

    expect(() =>
      createWorking(candidate!, need, has, [
        { participant: 'alice', acceptedAt: Date.now() }
      ])
    ).toThrow(/mutual acceptance/);

    const working = createWorking(candidate!, need, has, [
      { participant: 'alice', acceptedAt: Date.now() },
      { participant: 'bob', acceptedAt: Date.now() }
    ]);

    expect(working.relation).toBe('WORKING');
    expect(working.value.needId).toBe(need.id);
    expect(working.value.hasId).toBe(has.id);
  });

  it('gives both participants the same canonical completed receipt', () => {
    const need = createNeed('alice', 'potable water');
    const has = createHas('bob', 'potable water');
    const candidate = proposeCandidate(need, has)!;
    const working = createWorking(candidate, need, has, [
      { participant: 'alice', acceptedAt: 1 },
      { participant: 'bob', acceptedAt: 2 }
    ]);

    const receipt = completeWorking(working, { transferred: '4 containers' }, 3);

    const alice = new SovereignStore('alice');
    const bob = new SovereignStore('bob');

    alice.addReceipt(receipt);
    bob.addReceipt(receipt);

    expect(alice.getReceipts()[0].canonical).toBe(bob.getReceipts()[0].canonical);
    expect(receipt.needId).toBe(need.id);
    expect(receipt.hasId).toBe(has.id);
  });

  it('allows owner-local enumeration without defining a global inventory', () => {
    const alice = new SovereignStore('alice');
    alice.addTriplet(createNeed('alice', 'ride'));
    alice.addTriplet(createNeed('alice', 'water'));
    alice.addTriplet(createHas('alice', 'blanket'));

    expect(alice.getAll('NEED')).toHaveLength(2);
    expect(alice.getAll('HAS')).toHaveLength(1);
  });
});
