/**
 * Has-Needs: Globe Component (UI)
 * -------------------------------
 * Interactive globe with zoom and pan functionality.
 * Shows user's location, entries, and peers with proper geographic positioning.
 */

import React, { useState } from 'react';
import { Entry, Peer, Coordinates } from '../lib/types';

interface GlobeProps {
  center: Coordinates;
  entries: Entry[];
  peers: Peer[];
  initialZoomRadiusKm?: number;
  onEntryClick?: (entry: Entry) => void;
  onPeerClick?: (peer: Peer) => void;
}

// Convert km to pixels (adjust scale as needed)
const KM_TO_PX = 50; // Increased for better visibility
const MIN_ZOOM = 1; // 1km
const MAX_ZOOM = 100; // 100km

export const Globe: React.FC<GlobeProps> = ({
  center,
  entries,
  peers,
  initialZoomRadiusKm = 25,
  onEntryClick,
  onPeerClick
}) => {
  const [zoomLevel, setZoomLevel] = useState(initialZoomRadiusKm);

  // Convert geographic coordinates to screen coordinates
  const geoToScreen = (lat: number, lng: number, centerLat: number, centerLng: number): { x: number; y: number } => {
    // Simple equirectangular projection for this demo
    // 1 degree latitude ≈ 111 km, 1 degree longitude varies by latitude
    const kmPerDegreeLat = 111;
    const kmPerDegreeLng = 111 * Math.cos(centerLat * Math.PI / 180);

    const latDiff = (lat - centerLat) * kmPerDegreeLat;
    const lngDiff = (lng - centerLng) * kmPerDegreeLng;

    // Scale by zoom level (pixels per km)
    const scale = KM_TO_PX * (25 / zoomLevel); // Base scale for 25km zoom
    return {
      x: latDiff * scale,
      y: -lngDiff * scale // Negative because screen Y increases downward
    };
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev * 1.5, MAX_ZOOM));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev / 1.5, MIN_ZOOM));
  };

  const handleReset = () => {
    setZoomLevel(initialZoomRadiusKm);
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '500px' }}>
      {/* Zoom Controls */}
      <div style={{
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
      }}>
        <button
          onClick={handleZoomIn}
          style={{
            width: '32px',
            height: '32px',
            border: 'none',
            borderRadius: '4px',
            background: '#2e90fa',
            color: 'white',
            cursor: 'pointer',
            fontSize: '16px'
          }}
          title="Zoom In"
        >
          +
        </button>
        <button
          onClick={handleZoomOut}
          style={{
            width: '32px',
            height: '32px',
            border: 'none',
            borderRadius: '4px',
            background: '#2e90fa',
            color: 'white',
            cursor: 'pointer',
            fontSize: '16px'
          }}
          title="Zoom Out"
        >
          −
        </button>
        <button
          onClick={handleReset}
          style={{
            width: '32px',
            height: '32px',
            border: 'none',
            borderRadius: '4px',
            background: '#666',
            color: 'white',
            cursor: 'pointer',
            fontSize: '12px'
          }}
          title="Reset View"
        >
          ↺
        </button>
        <div style={{
          background: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          textAlign: 'center'
        }}>
          {Math.round(zoomLevel)}km
        </div>
      </div>

      {/* Globe Container */}
      <div style={{
        width: '100%',
        height: '100%',
        background: '#f0f7fa',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Grid background for reference */}
        <div style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          backgroundImage: `
            linear-gradient(90deg, #ddd 1px, transparent 1px),
            linear-gradient(0deg, #ddd 1px, transparent 1px)
          `,
          backgroundSize: `${50}px ${50}px`,
          opacity: 0.3
        }} />

        {/* Center point (user location) */}
        <div style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: 12,
          height: 12,
          background: '#3cb371',
          borderRadius: '50%',
          border: '2px solid #fff',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          zIndex: 10,
          transform: 'translate(-50%, -50%)'
        }} title="You (center)" />

        {/* Has/Need entries */}
        {entries.map((entry) => {
          const screenPos = geoToScreen(entry.coordinates.lat, entry.coordinates.lng, center.lat, center.lng);
          console.log(`Entry ${entry.id}:`, entry.coordinates, '->', screenPos); // Debug log
          return (
            <div
              key={entry.id}
              style={{
                position: 'absolute',
                left: `calc(50% + ${screenPos.x}px)`,
                top: `calc(50% + ${screenPos.y}px)`,
                width: Math.max(8, 16 / Math.sqrt(zoomLevel / 25)),
                height: Math.max(8, 16 / Math.sqrt(zoomLevel / 25)),
                background: entry.type === 'has' ? '#2e90fa' : '#e74c3c',
                borderRadius: '50%',
                border: '2px solid #fff',
                cursor: 'pointer',
                opacity: 0.85,
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                transform: 'translate(-50%, -50%)',
                transition: 'all 0.2s ease'
              }}
              title={`${entry.type.toUpperCase()}: ${entry.description}`}
              onClick={() => onEntryClick?.(entry)}
            />
          );
        })}

        {/* Peers */}
        {peers.map((peer) => {
          const screenPos = geoToScreen(peer.location.lat, peer.location.lng, center.lat, center.lng);
          return (
            <div
              key={peer.peerId}
              style={{
                position: 'absolute',
                left: `calc(50% + ${screenPos.x}px)`,
                top: `calc(50% + ${screenPos.y}px)`,
                width: Math.max(10, 20 / Math.sqrt(zoomLevel / 25)),
                height: Math.max(10, 20 / Math.sqrt(zoomLevel / 25)),
                background: '#9b59b6',
                borderRadius: '50%',
                border: '2px solid #fff',
                cursor: 'pointer',
                opacity: 0.7,
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                transform: 'translate(-50%, -50%)',
                transition: 'all 0.2s ease'
              }}
              title={`Peer: ${peer.peerId} (${Math.round(peer.location.lat * 1000) / 1000}°, ${Math.round(peer.location.lng * 1000) / 1000}°)`}
              onClick={() => onPeerClick?.(peer)}
            />
          );
        })}

        {/* Zoom radius indicator */}
        <div style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: (zoomLevel * KM_TO_PX * 2),
          height: (zoomLevel * KM_TO_PX * 2),
          border: '2px dashed #666',
          borderRadius: '50%',
          pointerEvents: 'none',
          opacity: 0.3,
          transform: 'translate(-50%, -50%)'
        }} title={`${zoomLevel}km radius`} />
      </div>
    </div>
  );
};

export default Globe;
