/**
 * Has-Needs: NeedButton Component
 * -------------------------------
 * UI button for a user to add a "need" resource entry to their sovereign store.
 * Opens a basic modal to select/request the type of exchange ("immediate-help", "scheduled-service", etc.)
 * with a brief description, then confirms addition.
 */

import React, { useState } from 'react';
import { Entry } from '../lib/types';

const EXCHANGE_TYPES = [
  'immediate-help',
  'scheduled-service',
  'skill-sharing',
  'resource-trade',
  'community-sharing'
];

interface NeedButtonProps {
  onAdd: (entry: Entry) => void;
  userDID: string;
  coordinates: { lat: number; lng: number };
}

export const NeedButton: React.FC<NeedButtonProps> = ({ onAdd, userDID, coordinates }) => {
  const [show, setShow] = useState(false);
  const [type, setType] = useState(EXCHANGE_TYPES[0]);
  const [desc, setDesc] = useState('');

  function handleAdd() {
    if (!type) return;
    onAdd({
      id: Math.random().toString(36).slice(2),
      type: 'need',
      resourceType: type,
      description: desc,
      userDID,
      coordinates,
      timestamp: Date.now(),
    });
    setType(EXCHANGE_TYPES[0]);
    setDesc('');
    setShow(false);
  }

  return (
    <>
      <button style={{ position: 'absolute', bottom: 24, right: 24, background: '#e74c3c', color: '#fff', borderRadius: 8, padding: '10px 24px', border: 'none' }} onClick={() => setShow(true)}>- NEED</button>
      {show && (
        <div style={{
          position: 'absolute', right: 40, bottom: 60, background: '#fff', border: '1px solid #e74c3c',
          borderRadius: 10, padding: 22, minWidth: 320, zIndex: 100,
        }}>
          <h4>Add Need/Request</h4>
          <select value={type} onChange={e => setType(e.target.value)}>
            {EXCHANGE_TYPES.map(et => <option key={et}>{et}</option>)}
          </select>
          <input placeholder="Description" value={desc} onChange={e => setDesc(e.target.value)} />
          <div style={{ marginTop: 18 }}>
            <button onClick={handleAdd} style={{ marginRight: 8, background: '#e74c3c', color: '#fff', border: 'none', padding: '5px 18px', borderRadius: 6 }}>Add</button>
            <button onClick={() => setShow(false)} style={{ background: '#eee', border: 'none', padding: '5px 18px', borderRadius: 6 }}>Cancel</button>
          </div>
        </div>
      )}
    </>
  );
};

export default NeedButton;
