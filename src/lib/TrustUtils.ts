/**
 * Has-Needs: Trust Utility Functions
 * ----------------------------------
 * Contains logic for calculating trust levels, trust hops, visualization color codes,
 * and other peer-evaluation utilities. Extend with more nuanced calculation as new models are introduced.
 */

import { Peer, TrustOverlayColor } from './types';

/**
 * Returns a color and label for trust overlay based on trust metrics.
 * - trustLevel: 0-1 (computed trust for direct path)
 * - trustHops: int (# of hops from user in trust network)
 */
export function getTrustOverlayColor(peer: Peer, minTrust = 0.7): TrustOverlayColor {
  if (peer.trustLevel >= minTrust) return { color: 'green', label: 'trusted' };
  if (peer.trustHops === 1) return { color: 'yellow', label: 'friend' };
  if (peer.trustHops === 2) return { color: 'orange', label: 'friend-of-friend' };
  return { color: 'red', label: 'unknown' };
}

/**
 * Sort peers for resource matching by trust first, then distance (if available).
 */
export function sortPeersByTrust(peers: Peer[]): Peer[] {
  return peers.slice().sort((a, b) => {
    if (a.trustLevel !== b.trustLevel) return b.trustLevel - a.trustLevel;
    return a.trustHops - b.trustHops;
  });
}

/**
 * Example utility to get max trust level in a group (for trust visualization scaling).
 */
export function getMaxTrustLevel(peers: Peer[]): number {
  return Math.max(...peers.map(p => p.trustLevel));
}
