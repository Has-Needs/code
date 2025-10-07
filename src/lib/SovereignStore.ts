/**
 * Has-Needs: SovereignDataStore
 * -----------------------------
 * Local, user-sovereign data access object for Has-Needs "entries" (has/need), receipts,
 * and, optionally, cached peers. No external dependencies.
 *
 * Extend with persistence (IndexedDB, localStorage, File System API, etc.) or connect to
 * P2P sharing and personal blockchain as needed.
 */

import { Entry, Receipt, Peer } from './types';

/**
 * Local sovereign data store - simple in-memory (add persistence for prod use).
 */
export class SovereignDataStore {
  private entries: Entry[] = [];
  private receipts: Receipt[] = [];
  private peers: Peer[] = [];

  // Entry CRUD
  addEntry(entry: Entry): void {
    this.entries.push(entry);
  }
  getEntries(type?: 'has' | 'need'): Entry[] {
    return type ? this.entries.filter(e => e.type === type) : this.entries;
  }
  getEntriesInRadius(center: { lat: number; lng: number }, radiusKm: number, type?: 'has' | 'need'): Entry[] {
    return this.getEntries(type).filter(e => 
      distance(center, e.coordinates) <= radiusKm
    );
  }

  // Receipt CRUD
  addReceipt(receipt: Receipt): void {
    this.receipts.push(receipt);
  }
  getReceiptsForUser(userDID: string): Receipt[] {
    return this.receipts.filter(r => r.from === userDID || r.to === userDID);
  }

  // Peer cache (could come from P2P or discovery)
  setPeers(peers: Peer[]): void {
    this.peers = peers;
  }
  getPeers(): Peer[] {
    return this.peers;
  }
}

// Utility: Haversine distance (in km)
function distance(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLng = (b.lng - a.lng) * Math.PI / 180;
  const la = a.lat * Math.PI / 180;
  const lb = b.lat * Math.PI / 180;
  const x = dLat / 2;
  const y = dLng / 2;

  return 2 * R * Math.asin(
    Math.sqrt(
      Math.sin(x) ** 2 +
      Math.cos(la) * Math.cos(lb) * Math.sin(y) ** 2
    )
  );
}
