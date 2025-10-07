/**
 * Has-Needs: App Root
 * -------------------
 * Composes Globe, TrustOverlay, HasButton, NeedButton, FeedPurchaseDialog, and manages local state/resources.
 * For MVP, uses in-memory state; in production, sync with SovereignDataStore.
 */

import React, { useState } from 'react';
import { Globe } from './components/Globe';
import { TrustOverlay } from './components/TrustOverlay';
import { HasButton } from './components/HasButton';
import { NeedButton } from './components/NeedButton';
import { FeedPurchaseDialog } from './components/FeedPurchaseDialog';

import { SovereignDataStore } from './lib/SovereignStore';
import { Entry, Peer, SmartContract } from './lib/types';

// Demo user/location (would use geolocation/personal chain in prod)
const userDID = 'did:user:demo1';
const center = { lat: 37.7749, lng: -122.4194 }; // San Francisco

// Sample data with realistic coordinates for testing zoom functionality
const sampleEntries: Entry[] = [
  {
    id: 'entry-1',
    type: 'has',
    resourceType: 'Fresh Water',
    description: 'Clean drinking water source',
    userDID: 'did:user:provider1',
    coordinates: { lat: 37.7849, lng: -122.4094 }, // ~1km north
    timestamp: Date.now(),
    context: { quality: 'potable', quantity: 'unlimited' }
  },
  {
    id: 'entry-2',
    type: 'need',
    resourceType: 'Medical Supplies',
    description: 'Bandages and antiseptics needed',
    userDID: 'did:user:requester1',
    coordinates: { lat: 37.7649, lng: -122.4294 }, // ~1km south
    timestamp: Date.now(),
    context: { urgency: 'high', quantity: '50 units' }
  },
  {
    id: 'entry-3',
    type: 'has',
    resourceType: 'Solar Panels',
    description: 'Portable solar charging station',
    userDID: 'did:user:tech1',
    coordinates: { lat: 37.7749, lng: -122.3994 }, // ~2km east
    timestamp: Date.now(),
    context: { capacity: '500W', condition: 'new' }
  }
];

const samplePeers: Peer[] = [
  {
    peerId: 'peer-1',
    location: { lat: 37.7949, lng: -122.4194 }, // ~2km north
    trustLevel: 0.8,
    trustHops: 1,
    lastActive: Date.now()
  },
  {
    peerId: 'peer-2',
    location: { lat: 37.7549, lng: -122.4194 }, // ~2km south
    trustLevel: 0.6,
    trustHops: 2,
    lastActive: Date.now()
  },
  {
    peerId: 'peer-3',
    location: { lat: 37.7749, lng: -122.4394 }, // ~2km west
    trustLevel: 0.9,
    trustHops: 1,
    lastActive: Date.now()
  }
];

// Re-usable store for MVP; in prod, use React Context or state mgmt
const store = new SovereignDataStore();

export const App: React.FC = () => {
  const [entries, setEntries] = useState<Entry[]>(sampleEntries);
  const [peers, setPeers] = useState<Peer[]>(samplePeers);
  const [feedModal, setFeedModal] = useState<{ entry: Entry | null, buyerId: string }>({ entry: null, buyerId: '' });
  const [contracts, setContracts] = useState<SmartContract[]>([]);

  function addEntry(entry: Entry) {
    store.addEntry(entry);
    setEntries([...store.getEntries()]);
  }

  function openFeedPurchase(entry: Entry, buyerId = 'did:county:001') {
    setFeedModal({ entry, buyerId });
  }

  function handleContractConfirm(contract: SmartContract) {
    setContracts([...contracts, contract]);
    // Would broadcast to P2P/blockchain in prod. 
    alert('Feed Contract Signed!');
  }

  return (
    <div style={{ background: '#f8fafb', minHeight: '100vh', fontFamily: 'sans-serif', position: 'relative' }}>
      <h1 style={{textAlign: 'center',color:'#2451b2'}}>Has-Needs Globe MVP</h1>
      <div style={{ position: 'relative', width: 740, margin: '36px auto', minHeight: 540 }}>
        <Globe
          center={center}
          entries={entries}
          peers={peers}
          initialZoomRadiusKm={25}
          onEntryClick={entry => openFeedPurchase(entry)}
        />
        <TrustOverlay peers={peers} />
        <HasButton
          userDID={userDID}
          coordinates={center}
          onAdd={addEntry}
        />
        <NeedButton
          userDID={userDID}
          coordinates={center}
          onAdd={addEntry}
        />
      </div>
      {feedModal.entry && (
        <FeedPurchaseDialog
          entry={feedModal.entry}
          buyerId={feedModal.buyerId}
          onConfirm={handleContractConfirm}
          onClose={() => setFeedModal({ entry: null, buyerId: '' })}
        />
      )}
    </div>
  );
};

export default App;
