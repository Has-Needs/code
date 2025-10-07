/**
 * Has-Needs: FeedPurchaseDialog Component
 * ---------------------------------------
 * UI dialog/modal for simulating the purchase/contracting of a data feed (Has/Need entry)
 * with explicit consent, terms, and a 'sign/confirm' step.
 * Connects to smart contract or logs a signed feed access receipt.
 */

import React, { useState } from 'react';
import { Entry, SmartContract } from '../lib/types';

interface FeedPurchaseDialogProps {
  entry: Entry | null;           // The resource/feed being purchased
  buyerId: string;               // Egov org or county DID
  onConfirm: (contract: SmartContract) => void;
  onClose: () => void;
}

export const FeedPurchaseDialog: React.FC<FeedPurchaseDialogProps> = ({
  entry, buyerId, onConfirm, onClose
}) => {
  const [accepted, setAccepted] = useState(false);

  if (!entry) return null;

  function handleConfirm() {
    if (!accepted || !entry) return;
    // In a real dApp, sign with private key
    onConfirm({
      contractId: Math.random().toString(36).slice(2),
      feedEntryId: entry.id,
      ownerDID: entry.userDID,
      buyerId,
      terms: 'Standard Data Stream Access Terms, renewable monthly.',
      signature: 'FAKE_SIGNATURE_FOR_MVP',
      active: true,
      started: Date.now(),
    });
    onClose();
  }

  return (
    <div style={{
      position: 'fixed', left: 0, top: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.3)',
      zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        background: 'white', borderRadius: 14, minWidth: 380, padding: 24, boxShadow: '0 4px 34px #aaa'
      }}>
        <h3>Purchase Data Feed</h3>
        <p>Buyer: {buyerId}</p>
        <p>Feed: <b>{entry.resourceType}</b></p>
        <p>User: <b>{entry.userDID}</b></p>
        <p>
          <label>
            <input type="checkbox" checked={accepted} onChange={e => setAccepted(e.target.checked)} />
            I accept the Terms and permit access to this data feed.
          </label>
        </p>
        <button disabled={!accepted} style={{background:'#2451b2',color:'#fff',borderRadius:7,padding:'8px 24px',border:'none'}} onClick={handleConfirm}>Confirm &amp; Sign</button>
        <button style={{marginLeft: 8, background:'#eee',border:'none',borderRadius:7,padding:'8px 24px'}} onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

export default FeedPurchaseDialog;
