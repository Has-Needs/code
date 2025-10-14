/**
 * Has-Needs: Globe Component (Simplified Leaflet Implementation)
 * -----------------------------------------------------------
 * Simplified Leaflet implementation for testing.
 */

import React, { useEffect, useRef } from 'react';

interface GlobeProps {
  center: { lat: number; lng: number };
  entries: any[];
  peers: any[];
  initialZoomRadiusKm?: number;
  onEntryClick?: (entry: any) => void;
  onPeerClick?: (peer: any) => void;
  width?: number;
  height?: number;
  homeLocation?: { lat: number; lng: number };
  onHomeClick?: () => void;
}

export const Globe: React.FC<GlobeProps> = ({
  center,
  entries,
  peers,
  width = 740,
  height = 540,
  homeLocation,
  onHomeClick,
  onEntryClick
}) => {
  const mapRef = useRef<any>(null);

  useEffect(() => {
    // Dynamically load Leaflet CSS if not already loaded
    if (!document.querySelector('link[href*="leaflet"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
      link.crossOrigin = '';
      document.head.appendChild(link);
    }

    // Dynamically load Leaflet JS
    const loadLeaflet = async () => {
      if (typeof window !== 'undefined' && !(window as any).L) {
        // Load Leaflet from CDN
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
        script.crossOrigin = '';
        document.head.appendChild(script);

        script.onload = () => {
          initializeMap();
        };
      } else {
        initializeMap();
      }
    };

    const initializeMap = () => {
      if (typeof window !== 'undefined' && (window as any).L) {
        const L = (window as any).L;

        const mapElement = document.getElementById('leaflet-map');
        if (mapElement) {
          // Remove existing map if it exists
          if (mapRef.current) {
            mapRef.current.remove();
            mapRef.current = null;
          }

          // Clear existing map content
          while (mapElement.firstChild) {
            mapElement.removeChild(mapElement.firstChild);
          }

          // Ensure element has dimensions before creating map
          if (mapElement.offsetWidth > 0 && mapElement.offsetHeight > 0) {
            const map = L.map('leaflet-map').setView([center.lat, center.lng], 13);
            mapRef.current = map;

            // Use Agregore's P2P tile loading if available, otherwise fallback to standard tiles
            const tileUrl = typeof window !== 'undefined' && (window as any).agregore?.p2p?.getTileUrl
              ? (window as any).agregore.p2p.getTileUrl('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
              : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

            L.tileLayer(tileUrl, {
              attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
              maxZoom: 18,
              // Enable caching for offline use in Agregore
              useCache: typeof window !== 'undefined' && (window as any).agregore !== undefined
            }).addTo(map);

            // Add entry markers
            entries.forEach((entry) => {
              const markerColor = entry.type === 'has' ? '#28a745' : '#dc3545'; // Green for has, red for need
              const markerIcon = L.divIcon({
                className: 'custom-entry-marker',
                html: `<div style="
                  width: 20px;
                  height: 20px;
                  background-color: ${markerColor};
                  border: 3px solid white;
                  border-radius: 50%;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 10px;
                  color: white;
                  font-weight: bold;
                ">${entry.type === 'has' ? 'H' : 'N'}</div>`,
                iconSize: [20, 20],
                iconAnchor: [10, 10]
              });

              const marker = L.marker([entry.coordinates.lat, entry.coordinates.lng], { icon: markerIcon })
                .addTo(map)
                .bindPopup(`
                  <div style="font-family: sans-serif;">
                    <h4 style="margin: 0 0 8px 0; color: ${markerColor};">${entry.type === 'has' ? '🟢 HAS' : '🔴 NEEDS'}</h4>
                    <p style="margin: 4px 0;"><strong>Type:</strong> ${entry.resourceType}</p>
                    <p style="margin: 4px 0;"><strong>Description:</strong> ${entry.description}</p>
                    <p style="margin: 4px 0; font-size: 12px; color: #666;">
                      Click to view details
                    </p>
                  </div>
                `);

              marker.on('click', () => {
                onEntryClick?.(entry);
              });
            });

            // Add home button if homeLocation and onHomeClick are provided
            if (homeLocation && onHomeClick) {
              // Create custom home button control
              const HomeControl = L.Control.extend({
                options: {
                  position: 'topleft'
                },

                onAdd: function(map: any) {
                  const container = L.DomUtil.create('div', 'leaflet-control-home');
                  container.style.backgroundColor = '#2e90fa';
                  container.style.color = 'white';
                  container.style.border = '2px solid rgba(255,255,255,0.2)';
                  container.style.backgroundClip = 'padding-box';
                  container.style.width = '30px';
                  container.style.height = '30px';
                  container.style.borderRadius = '4px';
                  container.style.cursor = 'pointer';
                  container.style.display = 'flex';
                  container.style.alignItems = 'center';
                  container.style.justifyContent = 'center';
                  container.style.fontSize = '14px';
                  container.style.fontWeight = 'bold';
                  container.style.boxShadow = '0 1px 3px rgba(0,0,0,0.2)';
                  container.style.marginTop = '10px';
                  container.style.marginLeft = '10px';
                  container.innerHTML = '🏠';

                  container.onclick = function() {
                    onHomeClick();
                  };

                  // Add hover effect
                  container.onmouseover = function() {
                    container.style.backgroundColor = '#1e7ae6';
                  };
                  container.onmouseout = function() {
                    container.style.backgroundColor = '#2e90fa';
                  };

                  return container;
                }
              });

              map.addControl(new HomeControl());
            }
          } else {
            // Retry after a short delay if element doesn't have dimensions yet
            setTimeout(initializeMap, 100);
          }
        }
      }
    };

    loadLeaflet();

    // Cleanup function
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [center, homeLocation, onHomeClick, entries, onEntryClick]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div
        id="leaflet-map"
        style={{
          width: '100%',
          height: '100%',
          background: '#f0f8ff',
          borderRadius: '8px',
          position: 'relative'
        }}
      />
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        zIndex: 1000,
        background: 'rgba(255,255,255,0.9)',
        padding: '8px',
        borderRadius: '4px',
        fontSize: '12px'
      }}>
        Leaflet Map Loading...
      </div>

      {/* Crosshair at center */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 999,
        pointerEvents: 'none',
        width: '20px',
        height: '20px'
      }}>
        {/* Horizontal line */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: 0,
          right: 0,
          height: '1px',
          backgroundColor: '#ff4444',
          transform: 'translateY(-50%)'
        }} />
        {/* Vertical line */}
        <div style={{
          position: 'absolute',
          left: '50%',
          top: 0,
          bottom: 0,
          width: '1px',
          backgroundColor: '#ff4444',
          transform: 'translateX(-50%)'
        }} />
        {/* Center dot */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '6px',
          height: '6px',
          backgroundColor: '#ff4444',
          borderRadius: '50%',
          transform: 'translate(-50%, -50%)',
          border: '1px solid white',
          boxShadow: '0 0 2px rgba(0,0,0,0.3)'
        }} />
      </div>
    </div>
  );
};

export default Globe;
