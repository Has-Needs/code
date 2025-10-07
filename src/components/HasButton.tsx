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
  const [resourceType, setResourceType] = useState('');
  const [desc, setDesc] = useState('');

  function handleAdd() {
    if (!resourceType) return;
    onAdd({
      id: Math.random().toString(36).slice(2),
      type: 'has',
      resourceType,
      description: desc,
      userDID,
      coordinates,
      timestamp: Date.now(),
    });
    setResourceType('');
    setDesc('');
    setShow(false);
  }

  return (
    <>
      <button style={{ position: 'absolute', bottom: 24, left: 24, background: '#2e90fa', color: '#fff', borderRadius: 8, padding: '10px 24px', border: 'none' }} onClick={() => setShow(true)}>+ HAS</button>
      {show && (
        <div style={{
          position: 'absolute', left: 40, bottom: 60, background: '#fff', border: '1px solid #2e90fa',
          borderRadius: 10, padding: 22, minWidth: 320, zIndex: 100,
        }}>
          <h4>Add Has Resource</h4>
          <input placeholder="Type (e.g. Water, Tools)" value={resourceType} onChange={e => setResourceType(e.target.value)} />
          <input placeholder="Description" value={desc} onChange={e => setDesc(e.target.value)} />
          <div style={{ marginTop: 18 }}>
            <button onClick={handleAdd} style={{ marginRight: 8, background: '#2e90fa', color: '#fff', border: 'none', padding: '5px 18px', borderRadius: 6 }}>Add</button>
            <button onClick={() => setShow(false)} style={{ background: '#eee', border: 'none', padding: '5px 18px', borderRadius: 6 }}>Cancel</button>
          </div>
        </div>
      )}
    </>
  );
};

export default HasButton;
