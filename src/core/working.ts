import { createTriplet } from './triplet.js';
import type { Acceptance, Candidate, Triplet, WorkingValue } from './types.js';

export function createWorking(
  candidate: Candidate,
  need: Triplet,
  has: Triplet,
  acceptance: Acceptance[]
): Triplet<WorkingValue> {
  if (need.relation !== 'NEED') throw new Error('candidate need must be NEED');
  if (has.relation !== 'HAS') throw new Error('candidate has must be HAS');
  if (candidate.needId !== need.id || candidate.hasId !== has.id) {
    throw new Error('candidate does not reference supplied objects');
  }

  const participants = [...new Set([need.entity, has.entity])];
  const accepted = new Set(acceptance.map(a => a.participant));

  for (const participant of participants) {
    if (!accepted.has(participant)) {
      throw new Error('mutual acceptance is required before WORKING');
    }
  }

  return createTriplet(
    participants.join('|'),
    'WORKING',
    {
      needId: need.id,
      hasId: has.id,
      participants,
      acceptance
    },
    { candidateId: candidate.id }
  );
}
