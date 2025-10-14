/**
 * Has-Needs: HasButton Component
 * ------------------------------
 * UI button for a user to add a "has" resource entry to their sovereign store.
 * Opens a simple input/modal to describe the resource and confirm addition.
 */

import React, { useState } from 'react';
import { Entry } from '../lib/types';

// Accepts addEntry callback
interface HasButtonProps {
  onAdd: (entry: Entry) => void;
  userDID: string;
  coordinates: { lat: number; lng: number };
}

export const HasButton: React.FC<HasButtonProps> = ({ onAdd, userDID, coordinates }) => {
  const [show, setShow] = useState(false);
  const [entity, setEntity] = useState('');
  const [context, setContext] = useState('');
  const [showLatLon, setShowLatLon] = useState(false);
  const [location, setLocation] = useState(coordinates);

  function handleAdd() {
    if (!entity) return;
    onAdd({
      id: Math.random().toString(36).slice(2),
      type: 'has',
      resourceType: entity,
      description: context,
      userDID,
      coordinates: location,
      timestamp: Date.now(),
    });
    setEntity('');
    setContext('');
    setLocation(coordinates);
    setShow(false);
  }

  function handleCurrentLocation() {
    setLocation(coordinates);
  }

  function handleHomeLocation() {
    setLocation(coordinates);
  }

  return (
    <>
      <button
        style={{ position: 'absolute', bottom: 24, left: 24, background: '#2e90fa', color: '#fff', borderRadius: 8, padding: '10px 24px', border: 'none', fontSize: '14px', cursor: 'pointer', minWidth: '120px' }}
        onClick={() => setShow(!show)}
        aria-label="I have a resource to share"
        title="I have a resource to share"
      >
        I HAVE
      </button>
      {show && (
        <div style={{ position: 'absolute', left: 24, bottom: 80, background: '#fff', border: '1px solid #2e90fa', borderRadius: 10, padding: 22, minWidth: 320, maxWidth: 'calc(100vw - 80px)', zIndex: 100, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', maxHeight: 'calc(100vh - 120px)', overflow: 'auto' }}>
          <h4>I Have</h4>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>What:</label>
            <input
              placeholder="e.g. Water, Tools, Food"
              value={entity}
              onChange={e => setEntity(e.target.value)}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Details:</label>
            <input
              placeholder="e.g. How many, When, Urgency"
              value={context}
              onChange={e => setContext(e.target.value)}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Where:</label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch' }}>
              {/* Wireframe Globe Button - Small Square */}
              <button
                onClick={() => setShowLatLon(!showLatLon)}
                style={{
                  width: '40px',
                  height: '40px',
                  background: showLatLon ? '#e8f4fd' : '#f8f9fa',
                  border: `2px solid ${showLatLon ? '#2e90fa' : '#dee2e6'}`,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px'
                }}
                title="Enter coordinates manually"
                aria-label="Toggle manual coordinate entry"
              >
                🌐
              </button>

              {/* Current Location Button - Wide */}
              <button
                onClick={handleCurrentLocation}
                style={{
                  flex: 1,
                  background: '#f8f9fa',
                  border: '2px solid #dee2e6',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  padding: '8px 12px'
                }}
                title="Use your current location"
              >
                📍 Current Location
              </button>

              {/* Home Button */}
              <button
                onClick={handleHomeLocation}
                style={{
                  padding: '8px 12px',
                  background: '#f0f0f0',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
                title="Set to your home location"
              >
                🏠
              </button>
            </div>

            {/* Lat/Lon Inputs - Show when wireframe globe is clicked */}
            {showLatLon && (
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <input
                  type="number"
                  step="any"
                  placeholder="Latitude"
                  value={location.lat}
                  onChange={e => setLocation({ ...location, lat: parseFloat(e.target.value) || 0 })}
                  style={{ flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
                />
                <input
                  type="number"
                  step="any"
                  placeholder="Longitude"
                  value={location.lng}
                  onChange={e => setLocation({ ...location, lng: parseFloat(e.target.value) || 0 })}
                  style={{ flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
                />
              </div>
            )}
          </div>
          <div style={{ marginTop: 18, display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button onClick={handleAdd} style={{ background: '#2e90fa', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 6, cursor: 'pointer', flex: 1, minWidth: '80px' }}>Add</button>
            <button onClick={() => setShow(false)} style={{ background: '#eee', border: 'none', padding: '8px 16px', borderRadius: 6, cursor: 'pointer', flex: 1, minWidth: '80px' }}>Cancel</button>
          </div>
        </div>
      )}
    </>
  );
};

export default HasButton;
