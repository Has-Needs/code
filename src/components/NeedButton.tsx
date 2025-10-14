/**
 * Has-Needs: NeedButton Component
 * -------------------------------
 * UI button for a user to add a "need" resource entry to their sovereign store.
 * Opens a dialog with Entity, Context, and Location fields.
 */

import React, { useState } from 'react';
import { Entry, SmartContract, ContractType } from '../lib/types';

// Simplified Exchange Types
const EXCHANGE_TYPES = [
  'payment',
  'services',
  'swap'
] as const;

type ExchangeType = typeof EXCHANGE_TYPES[number];

// Exchange Templates
const EXCHANGE_TEMPLATES = {
  'payment': {
    name: 'I want payment',
    fields: ['amount', 'currency'],
    placeholder: 'e.g. $50, USD'
  },
  'services': {
    name: 'I want Services',
    fields: ['serviceType', 'providerName'],
    placeholder: 'e.g. Emergency response, Red Cross'
  },
  'swap': {
    name: 'I want to swap',
    fields: ['acceptedItems'],
    placeholder: 'e.g. Food, Tools, Services'
  }
};

interface NeedButtonProps {
  onAdd: (entry: Entry) => void;
  onContractCreate?: (contract: SmartContract) => void;
  userDID: string;
  coordinates: { lat: number; lng: number };
}

export const NeedButton: React.FC<NeedButtonProps> = ({ onAdd, onContractCreate, userDID, coordinates }) => {
  const [show, setShow] = useState(false);
  const [exchangeType, setExchangeType] = useState<ExchangeType>(EXCHANGE_TYPES[0]);
  const [what, setWhat] = useState('');
  const [details, setDetails] = useState('');
  const [exchangeDetails, setExchangeDetails] = useState('');
  const [terms, setTerms] = useState<string[]>(['']);
  const [showLatLon, setShowLatLon] = useState(false);
  const [location, setLocation] = useState(coordinates);

  // Payment fields
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');

  // Services fields
  const [serviceType, setServiceType] = useState('emergency');
  const [providerName, setProviderName] = useState('');

  // Swap fields
  const [acceptedItems, setAcceptedItems] = useState<string[]>(['']);

  function handleAdd() {
    if (!exchangeType || !what || !details) return;

    // Create Smart Contract with execution terms
    const smartContract: SmartContract = {
      id: `contract-${Math.random().toString(36).slice(2)}`,
      type: exchangeType as ContractType, // Cast for compatibility
      needEntryId: '', // Will be set when entry is created
      state: 'created',
      createdAt: Date.now(),
      exchangeDetails,
      location,
      creatorDID: userDID,
      metadata: {
        exchangeTemplate: EXCHANGE_TEMPLATES[exchangeType],
        dataTriplet: { what, details, location },
        terms: terms.filter(term => term.trim()),
        // Exchange-specific data
        ...(exchangeType === 'payment' && { amount, currency }),
        ...(exchangeType === 'services' && { serviceType, providerName }),
        ...(exchangeType === 'swap' && { acceptedItems: acceptedItems.filter(item => item.trim()) })
      }
    };

    // Notify parent of contract creation
    onContractCreate?.(smartContract);

    console.log(`${EXCHANGE_TEMPLATES[exchangeType].name} Contract Created:`, smartContract);

    // Create entry for display (data triplet representation)
    const entry: Entry = {
      id: Math.random().toString(36).slice(2),
      type: 'need',
      resourceType: exchangeType,
      description: `${what} - ${details}${exchangeDetails ? ` (${exchangeDetails})` : ''}`,
      userDID,
      coordinates: location,
      timestamp: Date.now(),
      context: {
        exchangeType,
        exchangeDetails
      }
    };

    onAdd(entry);
    setExchangeType(EXCHANGE_TYPES[0]);
    setWhat('');
    setDetails('');
    setExchangeDetails('');
    setTerms(['']);
    setAmount('');
    setCurrency('USD');
    setServiceType('emergency');
    setProviderName('');
    setAcceptedItems(['']);
    setLocation(coordinates);
    setShow(false);
  }

  function addTerm() {
    setTerms([...terms, '']);
  }

  function updateTerm(index: number, value: string) {
    const newTerms = [...terms];
    newTerms[index] = value;
    setTerms(newTerms);
  }

  function removeTerm(index: number) {
    if (terms.length > 1) {
      setTerms(terms.filter((_, i) => i !== index));
    }
  }

  function addAcceptedItem() {
    setAcceptedItems([...acceptedItems, '']);
  }

  function updateAcceptedItem(index: number, value: string) {
    const newItems = [...acceptedItems];
    newItems[index] = value;
    setAcceptedItems(newItems);
  }

  function removeAcceptedItem(index: number) {
    if (acceptedItems.length > 1) {
      setAcceptedItems(acceptedItems.filter((_, i) => i !== index));
    }
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
        style={{ position: 'absolute', bottom: 24, right: 24, background: '#e74c3c', color: '#fff', borderRadius: 8, padding: '10px 24px', border: 'none', fontSize: '14px', cursor: 'pointer', minWidth: '120px' }}
        onClick={() => setShow(!show)}
        aria-label="I need a resource"
        title="I need a resource"
      >
        I NEED
      </button>
      {show && (
        <div style={{ position: 'absolute', right: 24, bottom: 80, background: '#fff', border: '1px solid #e74c3c', borderRadius: 10, padding: 22, minWidth: 320, maxWidth: 'calc(100vw - 80px)', zIndex: 100, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', maxHeight: 'calc(100vh - 120px)', overflow: 'auto' }}>
          {/* Data Triplet Section - What they need */}
          <div style={{ marginBottom: '20px', padding: '12px', background: '#f8f9fa', borderRadius: '8px' }}>
            <h5 style={{ margin: '0 0 12px 0', color: '#495057', fontSize: '14px' }}>What I Need</h5>
            <div style={{ marginBottom: '12px' }}>
              <input
                placeholder="e.g. Water, Medical Supplies, Tools"
                value={what}
                onChange={e => setWhat(e.target.value)}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Details:</label>
              <input
                placeholder="e.g. How many, When, Urgency"
                value={details}
                onChange={e => setDetails(e.target.value)}
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
                    border: `2px solid ${showLatLon ? '#e74c3c' : '#dee2e6'}`,
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
          </div>

          {/* Contract Section - How to exchange */}
          <div style={{ marginBottom: '20px', padding: '12px', background: '#fff3cd', borderRadius: '8px', border: '1px solid #ffc107' }}>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>What type of exchange?</label>
              <select value={exchangeType} onChange={e => setExchangeType(e.target.value as ExchangeType)} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}>
                {EXCHANGE_TYPES.map(type => {
                  const template = EXCHANGE_TEMPLATES[type];
                  return (
                    <option key={type} value={type}>
                      {template.name}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Payment Fields */}
            {exchangeType === 'payment' && (
              <div style={{ marginBottom: '8px' }}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Amount"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    style={{ flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                  <select
                    value={currency}
                    onChange={e => setCurrency(e.target.value)}
                    style={{ width: '80px', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="BTC">BTC</option>
                    <option value="ETH">ETH</option>
                  </select>
                </div>
              </div>
            )}

            {/* Services Fields */}
            {exchangeType === 'services' && (
              <div style={{ marginBottom: '8px' }}>
                <div style={{ marginBottom: '8px' }}>
                  <select
                    value={serviceType}
                    onChange={e => setServiceType(e.target.value)}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  >
                    <option value="emergency">Emergency Services</option>
                    <option value="official">Official/Government</option>
                    <option value="ngo">NGO/Non-Profit</option>
                  </select>
                </div>
                <input
                  placeholder="Provider/Organization Name"
                  value={providerName}
                  onChange={e => setProviderName(e.target.value)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
                />
              </div>
            )}

            {/* Swap Fields */}
            {exchangeType === 'swap' && (
              <div style={{ marginBottom: '8px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Will accept:</label>
                {acceptedItems.map((item, index) => (
                  <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '4px', alignItems: 'center' }}>
                    <input
                      placeholder="Item or service"
                      value={item}
                      onChange={e => updateAcceptedItem(index, e.target.value)}
                      style={{ flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                    {acceptedItems.length > 1 && (
                      <button
                        onClick={() => removeAcceptedItem(index)}
                        style={{ background: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer' }}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addAcceptedItem}
                  style={{ background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', padding: '6px 12px', cursor: 'pointer', fontSize: '12px' }}
                >
                  + Add Item
                </button>
              </div>
            )}

            {/* Terms/Conditions - Show for Payment and Swap, but not Services */}
            {(exchangeType === 'payment' || exchangeType === 'swap') && (
              <div style={{ marginBottom: '8px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Terms & Conditions:</label>
                {terms.map((term, index) => (
                  <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '4px', alignItems: 'center' }}>
                    <input
                      placeholder="Condition that must be met"
                      value={term}
                      onChange={e => updateTerm(index, e.target.value)}
                      style={{ flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                    {terms.length > 1 && (
                      <button
                        onClick={() => removeTerm(index)}
                        style={{ background: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer' }}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addTerm}
                  style={{ background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', padding: '6px 12px', cursor: 'pointer', fontSize: '12px', marginTop: '4px' }}
                >
                  + Add Term
                </button>
              </div>
            )}
          </div>

          <div style={{ marginTop: 18, display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button onClick={handleAdd} style={{ background: '#e74c3c', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 6, cursor: 'pointer', flex: 1, minWidth: '80px' }}>Add</button>
            <button onClick={() => setShow(false)} style={{ background: '#eee', border: 'none', padding: '8px 16px', borderRadius: 6, cursor: 'pointer', flex: 1, minWidth: '80px' }}>Cancel</button>
          </div>
        </div>
      )}
    </>
  );
};

export default NeedButton;
