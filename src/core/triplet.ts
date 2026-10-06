import { makeId } from './id.js';
import type { Relation, SemanticContext, Triplet } from './types.js';

export function createTriplet<T>(
  entity: string,
  relation: Relation,
  value: T,
  context: SemanticContext = {}
): Triplet<T> {
  if (!entity.trim()) throw new Error('entity is required');

  return {
    id: makeId(relation.toLowerCase()),
    entity,
    relation,
    value,
    context,
    createdAt: Date.now()
  };
}

export const createNeed = <T>(entity: string, value: T, context: SemanticContext = {}) =>
  createTriplet(entity, 'NEED', value, context);

export const createHas = <T>(entity: string, value: T, context: SemanticContext = {}) =>
  createTriplet(entity, 'HAS', value, context);
