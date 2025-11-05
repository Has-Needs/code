// Common types
export interface Location {
  lat: number;
  lng: number;
  accuracy?: number; // in meters
  timestamp?: number;
}

export interface Metadata {
  [key: string]: any;
}

// User Chain Types
export interface UserChainEntry {
  id: string;
  timestamp: number;
  type: 'user';
  userId: string;
  publicKey: string; // In a real implementation, this would be part of the user's identity
  metadata?: Metadata;
}

export interface UserChain {
  version: string;
  lastUpdated: number;
  entries: Record<string, UserChainEntry>; // id -> entry
}

// Has Types
export interface HasEntry {
  id: string;
  timestamp: number;
  ownerId: string; // References a user in the user chain
  location: Location;
  description: string;
  quantity: number;
  expiryDate?: number; // Unix timestamp
  metadata?: Metadata;
  status: 'available' | 'reserved' | 'fulfilled';
  reservedBy?: string; // userId who reserved this has
  fulfilledBy?: string; // needId that this has fulfilled
}

export interface HasList {
  version: string;
  lastUpdated: number;
  entries: Record<string, HasEntry>; // id -> entry
}

// Need Types
export interface NeedEntry {
  id: string;
  timestamp: number;
  ownerId: string; // References a user in the user chain
  location: Location;
  description: string;
  quantity: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'reserved' | 'fulfilled' | 'expired';
  fulfilledBy?: string; // hasId that fulfilled this need
  metadata?: Metadata;
}

export interface NeedList {
  version: string;
  lastUpdated: number;
  entries: Record<string, NeedEntry>; // id -> entry
}

// Combined types for convenience
export type AnyEntry = UserChainEntry | HasEntry | NeedEntry;

export interface DataStore {
  userChain: UserChain;
  hasList: HasList;
  needList: NeedList;
}
