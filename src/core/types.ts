export type Relation = 'HAS' | 'NEED' | 'WORKING';

export interface SemanticContext {
  [key: string]: unknown;
}

export interface Triplet<T = unknown> {
  id: string;
  entity: string;
  relation: Relation;
  context: SemanticContext;
  value: T;
  createdAt: number;
}

export interface Candidate {
  id: string;
  needId: string;
  hasId: string;
  reasons: string[];
  createdAt: number;
}

export interface Acceptance {
  participant: string;
  acceptedAt: number;
}

export interface WorkingValue {
  needId: string;
  hasId: string;
  participants: string[];
  acceptance: Acceptance[];
}

export interface Receipt {
  id: string;
  workingId: string;
  needId: string;
  hasId: string;
  participants: string[];
  completedAt: number;
  outcome: Record<string, unknown>;
  canonical: string;
}
