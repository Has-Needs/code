/**
 * Has-Needs: Core Data Types (Typescript Interfaces)
 * ---------------------------------
 * This file defines all primary data structures used throughout the app.
 * - Resource entries, receipts, peers, contract types, etc.
 * Extend here as your schema evolves!
 */

export interface Coordinates {
    lat: number;
    lng: number;
  }
  
  export type EntryType = 'has' | 'need';
  
  export interface Entry {
    id: string;
    type: EntryType; // 'has' or 'need'
    resourceType: string;
    description: string;
    userDID: string;
    coordinates: Coordinates;
    timestamp: number;
    context?: Record<string, any>;
  }
  
  export interface Receipt {
    id: string;
    from: string;
    to: string;
    entryId: string;
    timestamp: number;
    hash: string;
    signature: string;
    completed: boolean;
  }
  
  export interface Peer {
    peerId: string;
    location: Coordinates;
    trustLevel: number;     // 0-1 (computed, not static)
    trustHops: number;      // Hops from local user in trust graph
    lastActive: number;
  }
  
  export interface SmartContract {
    contractId: string;
    feedEntryId: string;      // Entry or feed being purchased/shared
    ownerDID: string;
    buyerId: string;          // County or org DID
    terms: string;            // Text template or pointer to terms
    signature: string;
    active: boolean;
    started: number;
    ended?: number;
  }
  
  /**
   * Useful for UI: color code mapping for trust visualization
   */
  export interface TrustOverlayColor {
    color: string;   // '#FF0000', 'green', etc.
    label: string;   // trusted, friend, stranger, etc.
  }
  