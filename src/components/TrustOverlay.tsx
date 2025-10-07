/**
 * Has-Needs: TrustOverlay Component
 * ---------------------------------
 * UI overlay for displaying trust information for peers/resources on top of the globe.
 * Visualizes trust level, trust hops, and highlights relationship.
 * Plug into the Globe (or render as an absolutely positioned layer for MVP).
 */

import React from 'react';
import { Peer } from '../lib/types';
import { getTrustOverlayColor } from '../lib/TrustUtils';

interface TrustOverlayProps {
  peers: Peer[];
}

export const TrustOverlay: React.FC<TrustOverlayProps> = ({ peers }) => {
  return (
    <div style={{
      position: 'absolute',
      left: 0,
      top: 0,
      right: 0,
      bottom: 0,
      pointerEvents: 'none'
    }}>
      {peers.map((peer, idx) => {
        const overlay = getTrustOverlayColor(peer);
        return (
          <div key={peer.peerId}
            style={{
              position: 'absolute',
              left: `calc(50% + ${(idx * 22) % 200 - 100}px)`,
              top: `calc(50% + ${(idx * 17) % 200 - 100}px)`,
              width: 62, minHeight: 18,
              background: overlay.color,
              color: '#fff',
              borderRadius: 9,
              opacity: 0.7,
              padding: '2px 8px',
              fontSize: '0.85rem',
              textAlign: 'center',
              pointerEvents: 'none'
            }}
            title={`Trust: ${overlay.label}`}
          >
            {overlay.label}
          </div>
        );
      })}
    </div>
  );
};

export default TrustOverlay;
