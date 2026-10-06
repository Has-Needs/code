import { makeId } from './id.js';
import type { Receipt, Triplet, WorkingValue } from './types.js';

function canonicalize(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(',')}]`;
  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    return `{${Object.keys(obj).sort().map(k => `${JSON.stringify(k)}:${canonicalize(obj[k])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

export function completeWorking(
  working: Triplet<WorkingValue>,
  outcome: Record<string, unknown>,
  completedAt = Date.now()
): Receipt {
  if (working.relation !== 'WORKING') throw new Error('only WORKING can complete');

  const base = {
    workingId: working.id,
    needId: working.value.needId,
    hasId: working.value.hasId,
    participants: [...working.value.participants].sort(),
    completedAt,
    outcome
  };

  const canonical = canonicalize(base);

  return {
    id: makeId('receipt'),
    ...base,
    canonical
  };
}
