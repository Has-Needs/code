import { TypedObject } from '@dxos/echo-schema';
import { Schema } from 'effect';

// Persona Schema
export const PersonaSchema = Schema.Struct({
  name: Schema.String,
  publicKey: Schema.String, // For verifiable identity and chain hopping
  // Add other persona-related fields here
});

export class Persona extends TypedObject({
  typename: 'has.needs.Persona',
  version: '0.1.0',
})({
  name: Schema.String,
  publicKey: Schema.String,
}) {}

// Has Schema
export const HasSchema = Schema.Struct({
  title: Schema.String,
  description: Schema.String,
  locationContext: Schema.String, // Abstracted location (e.g., Community ID)
  contentCid: Schema.String, // IPFS CID for associated content (e.g., image, document)
  // Add other Has-related fields here
});

export class Has extends TypedObject({
  typename: 'has.needs.Has',
  version: '0.1.0',
})({
  title: Schema.String,
  description: Schema.String,
  locationContext: Schema.String,
  contentCid: Schema.String,
}) {}

// Need Schema
export const NeedSchema = Schema.Struct({
  title: Schema.String,
  description: Schema.String,
  locationContext: Schema.String, // Abstracted location (e.g., Community ID)
  // Add other Need-related fields here
});

export class Need extends TypedObject({
  typename: 'has.needs.Need',
  version: '0.1.0',
})({
  title: Schema.String,
  description: Schema.String,
  locationContext: Schema.String,
}) {}

// Match Schema
export const MatchSchema = Schema.Struct({
  hasId: Schema.String,
  needId: Schema.String,
  timestamp: Schema.String, // ISO string for simplicity
  status: Schema.String, // e.g., 'pending', 'accepted', 'completed', 'disputed'
  encryptedReceipt: Schema.String, // Encrypted proof of financial transaction
  // Add other Match-related fields here
});

export class Match extends TypedObject({
  typename: 'has.needs.Match',
  version: '0.1.0',
})({
  hasId: Schema.String,
  needId: Schema.String,
  timestamp: Schema.String,
  status: Schema.String,
  encryptedReceipt: Schema.String,
}) {}
