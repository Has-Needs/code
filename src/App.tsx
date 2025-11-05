/**
 * Has-Needs: App Root with DXOS Integration
 * -----------------------------------------
 * Composes Globe, HasButton, NeedButton, and manages personal chain state via DXOS.
 * For MVP, uses DXOS for personal data stores; will evolve to full personal chain architecture.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { PersonaBar } from './components/PersonaBar';
import PersonaModal from './components/PersonaModal';
import { Globe } from './components/Globe';
import { HasButton } from './components/HasButton';
import { NeedButton } from './components/NeedButton';
import BootstrapHandler from './components/BootstrapHandler';
import CommunityInterface from './components/CommunityManager';
import PersonaSelectionModal from './components/PersonaSelectionModal';
import { Entry, Peer, SmartContract, Persona, Community, Message } from './lib/types';

// Demo user/location (would use geolocation/personal chain in prod)
const userDID = 'did:user:demo1';
const initialHomeLocation = { lat: 37.7749, lng: -122.4194 }; // San Francisco (initial home)

// Data persistence utilities
const STORAGE_KEYS = {
  PERSONAS: 'has-needs-personas',
  SELECTED_PERSONA: 'has-needs-selected-persona',
  CURRENT_COMMUNITY: 'has-needs-current-community',
  HOME_LOCATION: 'has-needs-home-location',
  FILTER_SETTINGS: 'has-needs-filter-settings',
  ENTRIES: 'has-needs-entries'
};

function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to save to localStorage:', error);
  }
}

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (error) {
    console.warn('Failed to load from localStorage:', error);
    return defaultValue;
  }
}

// Sample data with realistic coordinates for testing zoom functionality
const sampleEntries: Entry[] = [
  {
    id: 'entry-1',
    type: 'has',
    resourceType: 'Fresh Water',
    description: 'Clean drinking water source',
    userDID: 'did:user:provider1',
    coordinates: { lat: 37.7849, lng: -122.4094 }, // ~1km north of SF center
    timestamp: Date.now(),
    context: { quality: 'potable', quantity: 'unlimited' }
  },
  {
    id: 'entry-2',
    type: 'need',
    resourceType: 'Medical Supplies',
    description: 'Bandages and antiseptics needed',
    userDID: 'did:user:requester1',
    coordinates: { lat: 37.7649, lng: -122.4294 }, // ~1km south of SF center
    timestamp: Date.now(),
    context: { urgency: 'high', quantity: '50 units' }
  },
  {
    id: 'entry-3',
    type: 'has',
    resourceType: 'Solar Panels',
    description: 'Portable solar charging station',
    userDID: 'did:user:tech1',
    coordinates: { lat: 37.7849, lng: -122.3994 }, // ~2km east of SF center
    timestamp: Date.now(),
    context: { capacity: '500W', condition: 'new' }
  }
];

const samplePeers: Peer[] = [
  {
    peerId: 'peer-1',
    location: { lat: 37.7949, lng: -122.4194 }, // ~2km north of SF center
    lastActive: Date.now()
  },
  {
    peerId: 'peer-2',
    location: { lat: 37.7549, lng: -122.4194 }, // ~2km south of SF center
    lastActive: Date.now()
  },
  {
    peerId: 'peer-3',
    location: { lat: 37.7749, lng: -122.4394 }, // ~2km west of SF center
    lastActive: Date.now()
  }
];

const samplePersonas: Persona[] = [
  {
    id: 'persona-1',
    name: 'Emergency Responder',
    communities: [
      {
        id: 'community-1',
        name: 'SF Emergency Network',
        description: 'Emergency response coordination for San Francisco',
        messages: [
          {
            id: 'msg-1',
            sender: 'Coordinator',
            content: 'Water distribution point established at Mission District',
            timestamp: Date.now() - 3600000,
            type: 'text'
          },
          {
            id: 'msg-2',
            sender: 'Volunteer',
            content: 'Need medical supplies at downtown location',
            timestamp: Date.now() - 1800000,
            type: 'need',
            entryId: 'entry-2'
          }
        ],
        createdBy: 'user-1',
        createdAt: Date.now() - 86400000,
        members: ['user-1', 'user-2'],
        isActive: true,
        memberCount: 2
      },
      {
        id: 'community-2',
        name: 'Medical Professionals',
        description: 'Medical coordination network',
        messages: [
          {
            id: 'msg-3',
            sender: 'Dr. Smith',
            content: 'Hospital needs additional ventilators',
            timestamp: Date.now() - 7200000,
            type: 'need'
          }
        ],
        createdBy: 'user-3',
        createdAt: Date.now() - 172800000,
        members: ['user-3'],
        isActive: true,
        memberCount: 1
      }
    ],
    hasEntries: [],
    needEntries: []
  },
  {
    id: 'persona-2',
    name: 'Community Organizer',
    communities: [
      {
        id: 'community-3',
        name: 'Neighborhood Watch',
        description: 'Community safety and security coordination',
        messages: [
          {
            id: 'msg-4',
            sender: 'Neighbor',
            content: 'Block party planning for next weekend',
            timestamp: Date.now() - 86400000,
            type: 'text'
          }
        ],
        createdBy: 'user-4',
        createdAt: Date.now() - 259200000,
        members: ['user-4'],
        isActive: true,
        memberCount: 1
      }
    ],
    hasEntries: [],
    needEntries: []
  },
  {
    id: 'persona-3',
    name: 'Resource Provider',
    communities: [
      {
        id: 'community-4',
        name: 'Supply Chain Network',
        description: 'Resource distribution and logistics',
        messages: [
          {
            id: 'msg-5',
            sender: 'Supplier',
            content: 'Fresh produce available for distribution',
            timestamp: Date.now() - 43200000,
            type: 'has',
            entryId: 'entry-1'
          }
        ],
        createdBy: 'user-5',
        createdAt: Date.now() - 345600000,
        members: ['user-5'],
        isActive: true,
        memberCount: 1
      }
    ],
    hasEntries: [],
    needEntries: []
  },
  {
    id: 'persona-4',
    name: 'Tech Coordinator',
    communities: [
      {
        id: 'community-5',
        name: 'Digital Infrastructure',
        description: 'Emergency communication and network coordination',
        messages: [
          {
            id: 'msg-6',
            sender: 'Network Admin',
            content: 'Emergency communication network online',
            timestamp: Date.now() - 21600000,
            type: 'text'
          }
        ],
        createdBy: 'user-6',
        createdAt: Date.now() - 432000000,
        members: ['user-6'],
        isActive: true,
        memberCount: 1
      }
    ],
    hasEntries: [],
    needEntries: []
  },
  {
    id: 'persona-5',
    name: 'Transportation Lead',
    communities: [
      {
        id: 'community-6',
        name: 'Logistics Network',
        description: 'Transportation and delivery coordination',
        messages: [
          {
            id: 'msg-7',
            sender: 'Driver',
            content: 'Need fuel for emergency vehicles',
            timestamp: Date.now() - 10800000,
            type: 'need'
          }
        ],
        createdBy: 'user-7',
        createdAt: Date.now() - 518400000,
        members: ['user-7'],
        isActive: true,
        memberCount: 1
      }
    ],
    hasEntries: [],
    needEntries: []
  }
];

// Load persisted data or use defaults
const persistedPersonas = loadFromStorage(STORAGE_KEYS.PERSONAS, samplePersonas);
const persistedEntries = loadFromStorage(STORAGE_KEYS.ENTRIES, sampleEntries);
const persistedHomeLocation = loadFromStorage(STORAGE_KEYS.HOME_LOCATION, initialHomeLocation);
const persistedFilterSettings = loadFromStorage(STORAGE_KEYS.FILTER_SETTINGS, {
  unreliableThreshold: 3,
  unreliableWeeks: 4,
  greyListEnabled: true
});

export const App: React.FC = () => {
  const [entries, setEntries] = useState<Entry[]>(persistedEntries);
  const [peers, setPeers] = useState<Peer[]>(samplePeers);
  const [center, setCenter] = useState(initialHomeLocation);
  const [homeLocation, setHomeLocation] = useState(initialHomeLocation);
  const [personas, setPersonas] = useState<Persona[]>(persistedPersonas);

  // Agregore-specific state
  const [isAgregore, setIsAgregore] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [p2pStatus, setP2pStatus] = useState<'online' | 'offline' | 'p2p'>('online');

  // Filter settings state
  const [showFilters, setShowFilters] = useState(false);
  const [unreliableThreshold, setUnreliableThreshold] = useState(persistedFilterSettings.unreliableThreshold);
  const [unreliableWeeks, setUnreliableWeeks] = useState(persistedFilterSettings.unreliableWeeks);
  const [greyListEnabled, setGreyListEnabled] = useState(persistedFilterSettings.greyListEnabled);

  // Entry details dialog state
  const [showEntryDetails, setShowEntryDetails] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<Entry | null>(null);

  // Community state
  const [currentCommunity, setCurrentCommunity] = useState<Community | null>(null);

  // Persona modal state (no longer used)
  // const [showPersonaModal, setShowPersonaModal] = useState(false);
  // const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);

  // Communities modal state
  const [showCommunitiesModal, setShowCommunitiesModal] = useState(false);
  const [activePersona, setActivePersona] = useState<Persona | null>(null);

  // Community invitation state
  const [showPersonaSelection, setShowPersonaSelection] = useState(false);
  const [pendingInvitation, setPendingInvitation] = useState<any>(null);

  const [viewportSize, setViewportSize] = useState({ width: 400, height: 400, margin: 0 });

  useEffect(() => {
    const updateLayout = () => {
      const minDimension = Math.min(window.innerWidth, window.innerHeight);
      const maxMargin = 100;

      // Calculate margin based on smallest dimension growth beyond 600px
      const margin = minDimension <= 600 ? 0 : Math.min(maxMargin, (minDimension - 600) / 2);

      setViewportSize({
        width: Math.max(400, window.innerWidth - 2 * margin),
        height: window.innerHeight,
        margin: margin
      });
    };

    updateLayout();
    window.addEventListener('resize', updateLayout);
    return () => window.removeEventListener('resize', updateLayout);
  }, []);

  // Smart Contracts state management
  const [contracts, setContracts] = useState<SmartContract[]>([]);

  // DXOS client (placeholder for future integration)
  const [dxosClient, setDxosClient] = useState<any>(null);

  // Initialize DXOS client (placeholder)
  useEffect(() => {
    console.log('DXOS integration placeholder - ready for implementation');
  }, []);

  // Agregore detection and P2P setup
  useEffect(() => {
    // Detect if running in Agregore
    const agregoreDetected = typeof window !== 'undefined' &&
                           (window as any).agregore !== undefined;

    setIsAgregore(agregoreDetected);

    if (agregoreDetected) {
      console.log('🕸️ Running in Agregore browser - P2P features enabled');

      // Initialize Agregore-specific features
      const agregore = (window as any).agregore;

      // Set up P2P status monitoring
      if (agregore.p2p) {
        const updateP2pStatus = () => {
          if (!navigator.onLine) {
            setP2pStatus('offline');
          } else if (agregore.p2p.isConnected && agregore.p2p.isConnected()) {
            setP2pStatus('p2p');
          } else {
            setP2pStatus('online');
          }
        };

        updateP2pStatus();
        agregore.p2p.onConnectionChange?.(updateP2pStatus);
      }
    } else {
      console.log('🌐 Running in standard browser');
      setP2pStatus(isOnline ? 'online' : 'offline');
    }
  }, []);

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setP2pStatus(isAgregore ? 'p2p' : 'online');
    };

    const handleOffline = () => {
      setIsOnline(false);
      setP2pStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isAgregore]);

  // Data persistence - save personas when they change
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.PERSONAS, personas);
  }, [personas]);

  // Data persistence - save entries when they change
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.ENTRIES, entries);
  }, [entries]);

  // Data persistence - save home location when it changes
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.HOME_LOCATION, homeLocation);
  }, [homeLocation]);

  // Data persistence - save filter settings when they change
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.FILTER_SETTINGS, {
      unreliableThreshold,
      unreliableWeeks,
      greyListEnabled
    });
  }, [unreliableThreshold, unreliableWeeks, greyListEnabled]);

  function handleContractCreate(contract: SmartContract) {
    // Update contract with the entry ID when entry is created
    const updatedContract = {
      ...contract,
      needEntryId: `entry-${Math.random().toString(36).slice(2)}` // Placeholder for actual entry ID
    };

    setContracts((prev: SmartContract[]) => [...prev, updatedContract]);
    console.log('Contract added to state:', updatedContract);
  }

  function addEntry(entry: Entry) {
    console.log('addEntry called with:', entry);
    const newEntry = {
      ...entry,
      id: Math.random().toString(36).slice(2),
      timestamp: Date.now(),
    };

    // Update local state
    // store.addEntry(newEntry);
    setEntries(prev => [...prev, newEntry]);

    // TODO: Update DXOS personal chain when API is properly integrated
    console.log('Entry added:', newEntry);
  }

  const handleEntryClick = useCallback((entry: Entry) => {
    setSelectedEntry(entry);
    setSelectedCandidate(null); // Reset candidate selection
    setShowEntryDetails(true);
  }, []);

  // Generate mock match candidates for demonstration
  function getMatchCandidates(entry: Entry): Entry[] {
    return entries
      .filter(e => e.id !== entry.id) // Exclude the clicked entry itself
      .filter(e => {
        // Simple matching logic - in real app this would use the ontology system
        if (entry.type === 'has' && e.type === 'need') return true;
        if (entry.type === 'need' && e.type === 'has') return true;
        return false;
      })
      .slice(0, 5); // Limit to 5 candidates for demo
  }

  function handlePersonaSelect(persona: Persona) {
    // If clicking the same persona, clear the filter
    if (activePersona?.id === persona.id) {
      setActivePersona(null);
    } else {
      setActivePersona(persona);
    }
  }

  function handlePersonaUpdate(updatedPersona: Persona) {
    setPersonas(prev => prev.map(p => p.id === updatedPersona.id ? updatedPersona : p));
    // Removed selectedPersona state management
  }

  // Dropdown menu state
  const [showDropdown, setShowDropdown] = useState(false);

  // Persona scrolling state
  const [personaScrollIndex, setPersonaScrollIndex] = useState(0);

  // Archive state - track which personas are "deleted" (hidden from view but recoverable)
  const [archivedPersonas, setArchivedPersonas] = useState<Set<string>>(new Set());

  // Archive view state
  const [showArchiveView, setShowArchiveView] = useState(false);

  function handleDropdownToggle() {
    // Then toggle the dropdown
    setShowDropdown(!showDropdown);
  }

  function handleDropdownSelect(option: string) {
    console.log('Dropdown option selected:', option);
    setShowDropdown(false);

    switch(option) {
      case 'addPersona':
        console.log('Calling handleAddPersona');
        handleAddPersona();
        break;
      case 'setFilters':
        console.log('Setting showFilters to true');
        setShowFilters(true);
        break;
      case 'setHome':
        console.log('Calling handleHomeLocation');
        handleHomeLocation();
        break;
      case 'archiveView':
        console.log('Opening archive view');
        setShowArchiveView(true);
        break;
    }
  }

  // Persona navigation functions
  function handlePrevPersonas() {
    if (personaScrollIndex > 0) {
      setPersonaScrollIndex(personaScrollIndex - 1);
      console.log('Scrolled to personas:', personaScrollIndex - 1, 'to', personaScrollIndex + 4);
    }
  }

  function handleNextPersonas() {
    const visiblePersonas = getVisiblePersonas();
    if (personaScrollIndex + 5 < visiblePersonas.length) {
      setPersonaScrollIndex(personaScrollIndex + 1);
      console.log('Scrolled to personas:', personaScrollIndex + 1, 'to', personaScrollIndex + 6);
    }
  }

  // Smart delete persona function - archive if has activity, delete if no activity
  function handleDeletePersona(personaId: string) {
    const persona = personas.find(p => p.id === personaId);
    if (!persona) return;

    const hasActivity = persona.hasEntries.length > 0 || persona.needEntries.length > 0;

    if (hasActivity) {
      // Archive persona (hide from view but keep in personal chain)
      console.log('Archiving persona with activity:', personaId);
      setArchivedPersonas(prev => new Set([...Array.from(prev), personaId]));
    } else {
      // Permanently delete persona (no activity to preserve)
      console.log('Permanently deleting persona with no activity:', personaId);
      setPersonas(prev => prev.filter(p => p.id !== personaId));
    }

    // If the deleted/archived persona was selected, clear selection and close modal
    // Removed modal state management - personas now filter entries directly

    // Adjust scroll position if needed
    const visiblePersonas = getVisiblePersonas();
    if (visiblePersonas.length === 0 && personaScrollIndex > 0) {
      setPersonaScrollIndex(Math.max(0, personaScrollIndex - 1));
    }

    // If we're showing more personas than available after deletion, adjust scroll
    if (personaScrollIndex + 5 > visiblePersonas.length) {
      setPersonaScrollIndex(Math.max(0, visiblePersonas.length - 5));
    }
  }

  // Get visible (non-deleted) personas
  function getVisiblePersonas() {
    return personas.filter(persona => !archivedPersonas.has(persona.id));
  }

  // Get deleted personas (for recovery)
  function getArchivedPersonas() {
    return personas.filter(persona => archivedPersonas.has(persona.id));
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (showDropdown && !(event.target as Element).closest('.dropdown-container')) {
        setShowDropdown(false);
      }
    }

    // Use click instead of mousedown to avoid conflicts with dropdown option clicks
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showDropdown]);

  function handleAddPersona() {
    console.log('handleAddPersona called - creating new persona');
    // Create a new persona with a unique ID and default properties
    const newPersona: Persona = {
      id: `persona-${Date.now()}`,
      name: `New Persona ${personas.length + 1}`,
      communities: [],
      hasEntries: [],
      needEntries: []
    };

    // Add the new persona to the state
    setPersonas(prev => [...prev, newPersona]);

    // If we're at the end of the current view, scroll to show the new persona
    const visiblePersonas = getVisiblePersonas();
    if (personaScrollIndex + 5 >= visiblePersonas.length + 1) {
      const newScrollIndex = Math.max(0, visiblePersonas.length + 1 - 5);
      setPersonaScrollIndex(newScrollIndex);
      console.log('Scrolled to show new persona at index:', newScrollIndex);
    }

    // Set selected persona first, then show modal
    // Removed modal state management - personas now filter entries directly

    console.log('New persona added:', newPersona);
  }

  function handleHomeLocation() {
    console.log('handleHomeLocation called - setting home location');
    // Set current center as the new home location
    setHomeLocation(center);
    console.log('Home location set to:', center);
    // Show visual feedback (optional)
    alert(`Home location set to: ${Math.round(center.lat * 1000) / 1000}°, ${Math.round(center.lng * 1000) / 1000}°`);
  }

  return (
    <div style={{ 
      background: '#525A3A', 
      height: '100vh', 
      fontFamily: 'sans-serif', 
      position: 'relative',
      padding: `${viewportSize.margin}px`,
      boxSizing: 'border-box',
      overflow: 'hidden'
      }}>
      {/* Top Toolbar - Natural flow above map */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        marginBottom: '4px',
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        width: '100%',
        boxSizing: 'border-box',
        position: 'relative'
      }}>
        {/* Top Row: Expandable Indicator Squares */}
        <div style={{
          display: 'flex',
          gap: '2px',
          alignItems: 'center',
          justifyContent: 'flex-start',
          padding: '4px 8px',
          borderBottom: '1px solid rgba(0,0,0,0.1)'
        }}>
          {getVisiblePersonas().map((_, index) => (
            <div
              key={`square-${index}`}
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '2px',
                background: index >= personaScrollIndex && index < personaScrollIndex + 5
                  ? '#2e90fa'  // Filled for visible personas
                  : 'rgba(0,0,0,0.2)', // Empty for hidden personas
                border: '1px solid rgba(0,0,0,0.1)'
              }}
              title={`Persona ${index + 1} ${index >= personaScrollIndex && index < personaScrollIndex + 5 ? '(visible)' : '(hidden)'}`}
            />
          ))}
        </div>

        {/* Bottom Row: Main Toolbar Content */}
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px',
          gap: '2px'
        }}>
          {/* Left Section: Network + Left Arrow */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            {/* P2P Status Indicator */}
            <div style={{
              background: p2pStatus === 'p2p' ? '#28a745' : p2pStatus === 'offline' ? '#dc3545' : '#6c757d',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '12px',
              fontSize: '10px',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              minWidth: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {isAgregore ? (
                p2pStatus === 'p2p' ? 'P2P' : p2pStatus === 'offline' ? 'OFF' : 'ON'
              ) : (
                p2pStatus === 'offline' ? 'OFF' : 'ON'
              )}
            </div>

            {/* Left Arrow */}
            <button
              onClick={handlePrevPersonas}
              disabled={personaScrollIndex === 0}
              style={{
                width: '24px',
                height: '24px',
                border: 'none',
                borderRadius: '50%',
                background: personaScrollIndex === 0 ? '#ccc' : '#2e90fa',
                color: 'white',
                cursor: personaScrollIndex === 0 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px'
              }}
              title="Previous personas"
              aria-label="Previous personas"
            >
              ←
            </button>
          </div>

          {/* Persona Tabs - directly after left arrow */}
          {getVisiblePersonas().slice(personaScrollIndex, personaScrollIndex + 5).map((persona, index) => (
            <div key={persona.id} style={{ position: 'relative' }}>
              <button
                onClick={() => handlePersonaSelect(persona)}
                style={{
                  height: '40px',
                  border: activePersona?.id === persona.id ? '2px solid #2e90fa' : '1px solid #ddd',
                  borderRadius: '8px',
                  background: activePersona?.id === persona.id ? '#e3f2fd' : '#fff',
                  color: activePersona?.id === persona.id ? '#1976d2' : '#333',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: activePersona?.id === persona.id ? '600' : '500',
                  padding: '0 8px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  minWidth: '70px',
                  boxShadow: activePersona?.id === persona.id ? '0 2px 8px rgba(46, 144, 250, 0.3)' : '0 2px 4px rgba(0,0,0,0.1)',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 1px',
                  flex: 1
                }}
                aria-label={`View ${persona.name} entries${activePersona?.id === persona.id ? ' (active)' : ''}`}
                onMouseEnter={(e) => {
                  if (activePersona?.id !== persona.id) {
                    e.currentTarget.style.background = '#f8f9fa';
                    e.currentTarget.style.borderColor = '#2e90fa';
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activePersona?.id !== persona.id) {
                    e.currentTarget.style.background = '#fff';
                    e.currentTarget.style.borderColor = '#ddd';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                  }
                }}
              >
                {persona.name}
              </button>

              {/* Communities Button - shows beneath the active persona */}
              {activePersona?.id === persona.id && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  marginTop: '4px',
                  zIndex: 1001
                }}>
                  <button
                    onClick={() => setShowCommunitiesModal(true)}
                    style={{
                      background: 'linear-gradient(135deg, #17a2b8, #138496)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      fontWeight: '500',
                      boxShadow: '0 2px 4px rgba(23, 162, 184, 0.3)',
                      transition: 'all 0.2s ease',
                      whiteSpace: 'nowrap'
                    }}
                    title={`Manage communities for ${persona.name}`}
                    aria-label={`Manage communities for ${persona.name}`}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #138496, #117a8b)';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 4px 8px rgba(23, 162, 184, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #17a2b8, #138496)';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 4px rgba(23, 162, 184, 0.3)';
                    }}
                  >
                    🏘️ Communities ({persona.communities.length})
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* Right Section: Right Arrow + Unified Action Button */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            {/* Right Arrow */}
            <button
              onClick={handleNextPersonas}
              disabled={personaScrollIndex + 5 >= getVisiblePersonas().length}
              style={{
                width: '24px',
                height: '24px',
                border: 'none',
                borderRadius: '50%',
                background: personaScrollIndex + 5 >= getVisiblePersonas().length ? '#ccc' : '#2e90fa',
                color: 'white',
                cursor: personaScrollIndex + 5 >= getVisiblePersonas().length ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px'
              }}
              title="Next personas"
              aria-label="Next personas"
            >
              →
            </button>

            {/* Unified Action Button - combines Add, Filter, and Home */}
            <div className="dropdown-container" style={{ position: 'relative' }}>
              <button
                onClick={handleDropdownToggle}
                style={{
                  background: 'linear-gradient(135deg, #28a745, #6c757d)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  height: '40px',
                  minWidth: '120px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '600',
                  gap: '6px',
                  transition: 'all 0.2s ease'
                }}
                title="Add Persona, Set Filters, or Set Home"
                aria-label="Unified action button"
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #218838, #5a6268)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #28a745, #6c757d)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
                }}
              >
                <span style={{ fontSize: '16px', fontWeight: 'bold' }}>+</span>
                <span style={{ fontSize: '14px' }}>≡|⋯</span>
                <span style={{ fontSize: '14px' }}>🏠</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dropdown Menu - positioned outside toolbar container */}
        {showDropdown && (
          <div className="dropdown-container" style={{
            position: 'absolute',
            top: '100%',
            right: '8px',
            background: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            border: '1px solid #ddd',
            minWidth: '180px',
            zIndex: 1003,
            marginTop: '4px'
          }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                console.log('Add Persona button clicked');
                handleDropdownSelect('addPersona');
              }}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: 'none',
                background: 'transparent',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#333',
                borderBottom: '1px solid #eee',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f8f9fa';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <span style={{ fontSize: '16px' }}>+</span>
              Add Persona
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                console.log('Set Filters button clicked');
                handleDropdownSelect('setFilters');
              }}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: 'none',
                background: 'transparent',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#333',
                borderBottom: '1px solid #eee',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f8f9fa';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <span>≡|⋯</span>
              Set Filters
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                console.log('Set Home button clicked');
                handleDropdownSelect('setHome');
              }}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: 'none',
                background: 'transparent',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#333',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f8f9fa';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <span>🏠</span>
              Set Home
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                console.log('Archive View button clicked');
                handleDropdownSelect('archiveView');
              }}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: 'none',
                background: 'transparent',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#333',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f8f9fa';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <span>📦</span>
              Archive View
            </button>
          </div>
        )}
      </div>

      {/* Communities Modal */}
      {showCommunitiesModal && activePersona && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            width: '90vw',
            height: '80vh',
            maxWidth: '1000px',
            minWidth: '600px',
            minHeight: '500px',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            overflow: 'hidden'
          }}>
            {/* Communities Modal Content */}
            <div style={{
              padding: '20px',
              borderBottom: '1px solid #eee',
              background: 'linear-gradient(135deg, #17a2b8, #138496)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{
                  margin: 0,
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  🏘️ Communities for {activePersona?.name}
                </h3>
                <button onClick={() => setShowCommunitiesModal(false)}>
                  ✕ Close
                </button>
              </div>
            </div>
            <div style={{ flex: 1, padding: '20px', overflow: 'auto' }}>
              {/* Community Management Buttons */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '12px',
                marginBottom: '24px'
              }}>
                <button style={{/* Create Community button styles */}}>
                  ➕ Create Community
                </button>
                <button style={{/* QR Invite button styles */}}>
                  📱 Show QR Invite
                </button>
                <button style={{/* Subcommunity button styles */}}>
                  🔗 Create Subcommunity
                </button>
                <button style={{/* Archive button styles */}}>
                  📦 Archive Community
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Map Container */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: `calc(100vh - ${viewportSize.margin * 2}px - 80px)`,
        background: '#f0f8ff',
        borderRadius: '8px'
      }}>
        {/* Bootstrap Handler - Processes community invitations and app installation */}
        <BootstrapHandler
          onCommunityInvitation={(invitationData) => {
            console.log('🏘️ Community invitation:', invitationData);
            setPendingInvitation(invitationData);
            setShowPersonaSelection(true);
          }}
          onAppInstallPrompt={() => {
            console.log('📱 Prompting app installation...');
            // TODO: Show app installation modal
          }}
          hasAppInstalled={true} // TODO: Detect if app is installed
        />

        {/* Community Interface - Shows current community with invitation sharing */}
        <CommunityInterface
          currentCommunity={currentCommunity}
          currentUserId={userDID}
          currentUserName="Current User" // TODO: Get from current persona
          onLeaveCommunity={() => setCurrentCommunity(null)}
        />

        {/* Globe Map Component */}
        <Globe
          center={center}
          entries={entries.filter(entry => {
            // If no active persona, show all user's entries
            if (!activePersona) return entry.userDID === userDID;
            // If active persona, show only entries from that persona
            return entry.userDID === userDID && (
              activePersona.hasEntries.some(he => he.id === entry.id) ||
              activePersona.needEntries.some(ne => ne.id === entry.id)
            );
          })}
          peers={peers}
          initialZoomRadiusKm={25}
          onEntryClick={handleEntryClick}
          height={viewportSize.height}
        />

        <div style={{ position: 'absolute', bottom: '24px', right: '24px', zIndex: 1000 }}>
          <NeedButton
            userDID={userDID}
            coordinates={center}
            onAdd={addEntry}
            onContractCreate={handleContractCreate}
          />
        </div>
        <div style={{ position: 'absolute', bottom: '24px', left: '24px', zIndex: 1000 }}>
          <HasButton
            userDID={userDID}
            coordinates={center}
            onAdd={addEntry}
          />
        </div>

        {/* Persona Modal - contained within map view */}
        {/* Modal removed - personas now filter entries directly */}

        {/* Archive View Modal */}
        {showArchiveView && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 1001,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}>
            <div style={{
              background: '#fff',
              borderRadius: '12px',
              width: '80vw',
              height: '70vh',
              maxWidth: '1000px',
              minWidth: '500px',
              minHeight: '300px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              overflow: 'hidden'
            }}>
              {/* Archive Header */}
              <div style={{
                padding: '20px',
                borderBottom: '1px solid #eee',
                background: '#f8f9fa'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h3 style={{ margin: 0, color: '#333' }}>
                    📦 Archive ({getArchivedPersonas().length})
                  </h3>
                  <button
                    onClick={() => setShowArchiveView(false)}
                    style={{
                      padding: '8px 16px',
                      background: '#6c757d',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    Close
                  </button>
                </div>
                <p style={{ margin: '8px 0 0 0', color: '#666', fontSize: '14px' }}>
                  Personas that have been archived or deleted. You can recover them here.
                </p>
              </div>

              {/* Archive Content */}
              <div style={{ flex: 1, padding: '20px', overflow: 'auto' }}>
                {getArchivedPersonas().length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#666', padding: '40px' }}>
                    <p>No archived personas yet.</p>
                    <p>Archived and deleted personas will appear here for recovery.</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                    {getArchivedPersonas().map((persona) => (
                      <div
                        key={persona.id}
                        style={{
                          padding: '16px',
                          border: '1px solid #ddd',
                          borderRadius: '8px',
                          background: '#f8f9fa',
                          textAlign: 'center'
                        }}
                      >
                        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                          {persona.name}
                        </div>
                        <div style={{ fontSize: '12px', color: '#666', marginBottom: '12px' }}>
                          Communities: {persona.communities.length} |
                          Has: {persona.hasEntries.length} |
                          Needs: {persona.needEntries.length}
                        </div>
                        <button
                          onClick={() => {
                            // Remove from archive (make visible again)
                            setArchivedPersonas(prev => {
                              const newSet = new Set(prev);
                              newSet.delete(persona.id);
                              return newSet;
                            });
                            console.log('Restored persona from archive:', persona.name);
                          }}
                          style={{
                            padding: '6px 12px',
                            background: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          Recover
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Entry Details Modal */}
        {showEntryDetails && selectedEntry && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 1001,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}>
            <div style={{
              background: '#fff',
              borderRadius: '12px',
              width: '90vw',
              height: '70vh',
              maxWidth: '800px',
              minWidth: '400px',
              minHeight: '300px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              overflow: 'hidden'
            }}>
              {/* Entry Details Header */}
              <div style={{
                padding: '20px',
                borderBottom: '1px solid #eee',
                background: selectedEntry.type === 'has' ? 'linear-gradient(135deg, #28a745, #20c997)' : 'linear-gradient(135deg, #dc3545, #fd7e14)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h3 style={{
                    margin: 0,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <span style={{
                      width: '32px',
                      height: '32px',
                      background: 'rgba(255,255,255,0.2)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px',
                      fontWeight: 'bold'
                    }}>
                      {selectedEntry.type === 'has' ? '🟢' : '🔴'}
                    </span>
                    {selectedEntry.type === 'has' ? 'HAS' : 'NEEDS'}: {selectedEntry.resourceType}
                  </h3>
                  <button
                    onClick={() => {
                      setShowEntryDetails(false);
                      setSelectedEntry(null);
                    }}
                    style={{
                      background: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '8px 16px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    ✕ Close
                  </button>
                </div>
                <p style={{ margin: '8px 0 0 0', color: 'rgba(255,255,255,0.9)', fontSize: '16px' }}>
                  {selectedEntry.description}
                </p>
              </div>

              {/* Entry Details Content */}
              <div style={{ flex: 1, padding: '20px', overflow: 'auto' }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '20px'
                }}>
                  {/* Entry Information */}
                  <div style={{
                    background: '#f8f9fa',
                    borderRadius: '8px',
                    padding: '16px'
                  }}>
                    <h4 style={{ margin: '0 0 12px 0', color: '#495057' }}>📋 Entry Details</h4>
                    <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
                      <div><strong>Type:</strong> {selectedEntry.resourceType}</div>
                      <div><strong>Status:</strong> {selectedEntry.type === 'has' ? 'Available' : 'Needed'}</div>
                      <div><strong>Location:</strong> {Math.round(selectedEntry.coordinates.lat * 1000) / 1000}°, {Math.round(selectedEntry.coordinates.lng * 1000) / 1000}°</div>
                      <div><strong>Created:</strong> {new Date(selectedEntry.timestamp).toLocaleString()}</div>
                      {selectedEntry.context && Object.keys(selectedEntry.context).length > 0 && (
                        <div style={{ marginTop: '8px' }}>
                          <strong>Context:</strong>
                          <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
                            {Object.entries(selectedEntry.context).map(([key, value]) => (
                              <li key={key}>{key}: {String(value)}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Match Candidates */}
                  <div style={{
                    background: '#f8f9fa',
                    borderRadius: '8px',
                    padding: '16px'
                  }}>
                    <h4 style={{ margin: '0 0 12px 0', color: '#495057' }}>🔗 Potential Matches</h4>
                    <div style={{ fontSize: '14px' }}>
                      {getMatchCandidates(selectedEntry).length > 0 ? (
                        <div>
                          {getMatchCandidates(selectedEntry).slice(0, 3).map((candidate, index) => (
                            <div key={candidate.id} style={{
                              padding: '8px',
                              marginBottom: '8px',
                              background: 'white',
                              borderRadius: '6px',
                              border: '1px solid #dee2e6'
                            }}>
                              <div style={{ fontWeight: 'bold', color: candidate.type === 'has' ? '#28a745' : '#dc3545' }}>
                                {candidate.type === 'has' ? '🟢' : '🔴'} {candidate.resourceType}
                              </div>
                              <div style={{ fontSize: '12px', color: '#666' }}>
                                {candidate.description}
                              </div>
                              <div style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
                                {Math.round(candidate.coordinates.lat * 1000) / 1000}°, {Math.round(candidate.coordinates.lng * 1000) / 1000}°
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ color: '#6c757d', fontStyle: 'italic' }}>
                          No potential matches found
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
