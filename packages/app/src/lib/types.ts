// src/lib/types.ts

/**
 * Represents any participant, object, or concept within the Has-Needs ecosystem.
 * Can be a Persona, a resource, a service, or an abstract idea.
 */
export type Entity = string; // Using string for simplicity, could be a more complex ID type

/**
 * Defines the type of relationship in a Triplet.
 * As per the protocol, these are Has, Need, or Working.
 */
export enum RelationType {
    Has = "Has",
    Need = "Need",
    Working = "Working"
}

/**
 * Represents the context of an interaction or data point.
 * This is a flexible, user-defined field that allows for cultural and linguistic nuance.
 */
export type Context = string | Record<string, any>; // Can be a simple string or a structured object

/**
 * The fundamental data primitive of the Has-Needs protocol.
 * [entity-relation-context]
 */
export interface Triplet {
    entity: Entity;
    relation: RelationType;
    context: Context;
}

/**
 * Represents a user's sovereign identity within the Has-Needs network.
 * Managed by the Persona Manager.
 */
export interface Persona {
    id: string; // Unique identifier for the Persona
    publicKey: string; // Cryptographic public key
    // Add other relevant Persona attributes as needed (e.g., display name, profile hash)
}

/**
 * Represents a resource, capability, or service an Entity possesses.
 * This is a verifiable 'Has' in the value exchange.
 */
export interface Has {
    id: string; // Unique identifier for this specific Has instance
    ownerId: string; // ID of the Persona who owns this Has
    description: string; // Human-readable description of the Has
    // Add other relevant Has attributes (e.g., quantity, location, availability)
    context: Context; // The context of this Has, using the Triplet's Context type
}

/**
 * Represents a requirement, desire, or request from an Entity.
 * This is a verifiable 'Need' in the value exchange.
 */
export interface Need {
    id: string; // Unique identifier for this specific Need instance
    requesterId: string; // ID of the Persona who has this Need
    description: string; // Human-readable description of the Need
    // Add other relevant Need attributes (e.g., quantity, urgency, location)
    context: Context; // The context of this Need
}

/**
 * Represents the immutable record of a completed value exchange.
 * Stored on the Personal Receipt Chains of all participating parties.
 */
export interface Receipt {
    id: string; // Unique identifier for this Receipt
    timestamp: number; // Unix timestamp of the exchange
    parties: string[]; // Array of Persona IDs involved in the exchange
    hasId: string; // ID of the Has involved in the exchange
    needId: string; // ID of the Need involved in the exchange
    // Add other relevant Receipt attributes (e.g., agreed terms, financial passthrough confirmation hash)
    context: Context; // The context of the entire exchange
    signature: string; // Cryptographic signature of the transaction
}
