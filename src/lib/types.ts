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

export type ContractType = 'sale' | 'service-exchange' | 'barter';
  
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
  
  export type ContractState = 'created' | 'working' | 'executed' | 'abandoned';

export interface SmartContract {
  id: string;
  type: ContractType;
  needEntryId: string;
  hasEntryId?: string;        // Set when matched
  state: ContractState;
  createdAt: number;
  startedAt?: number;         // When enters working state
  completedAt?: number;       // When executed
  abandonedAt?: number;       // If abandoned (no completedAt)
  exchangeDetails: string;
  location: Coordinates;
  creatorDID: string;
  participantDID?: string;    // The other party
  communications?: Communication[];
  metadata?: Record<string, any>;
}

export interface Communication {
  id: string;
  fromDID: string;
  toDID: string;
  content: string;
  timestamp: number;
  type: 'text' | 'image' | 'voice' | 'location' | 'verification';
}

  export interface Peer {
    peerId: string;
    location: Coordinates;
    lastActive: number;
  }

  export interface Message {
    id: string;
    sender: string;
    content: string;
    timestamp: number;
    type: 'text' | 'has' | 'need';
    entryId?: string;
  }

  export interface Community {
    id: string;
    name: string;
    description?: string;
    messages: Message[];
    createdBy: string;
    createdAt: number;
    members: string[];
    isActive: boolean;
    memberCount: number;
  }

  export interface Persona {
    id: string;
    name: string;
    communities: Community[];
    hasEntries: Entry[];
    needEntries: Entry[];
  }