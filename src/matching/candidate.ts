import { makeId } from '../core/id.js';
import type { Candidate, Triplet } from '../core/types.js';

export type Matcher = (need: Triplet, has: Triplet) => string[];

export const exactValueMatcher: Matcher = (need, has) => {
  if (need.relation !== 'NEED' || has.relation !== 'HAS') return [];
  return JSON.stringify(need.value) === JSON.stringify(has.value)
    ? ['semantic value match']
    : [];
};

export function proposeCandidate(
  need: Triplet,
  has: Triplet,
  matcher: Matcher = exactValueMatcher
): Candidate | null {
  const reasons = matcher(need, has);
  if (reasons.length === 0) return null;

  return {
    id: makeId('candidate'),
    needId: need.id,
    hasId: has.id,
    reasons,
    createdAt: Date.now()
  };
}
