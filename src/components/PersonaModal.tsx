/**
 * Has-Needs: PersonaModal Component
 * ---------------------------------
 * Detailed view of a persona showing communities, messages, and associated entries.
 */

import React, { useState, useRef, useEffect } from 'react';
import { Persona, Community, Entry } from '../lib/types';

interface PersonaModalProps {
  persona: Persona;
  isOpen: boolean;
  onClose: () => void;
  onPersonaUpdate?: (persona: Persona) => void;
  onPersonaDelete?: (personaId: string) => void;
  entries: Entry[];
}

export const PersonaModal: React.FC<PersonaModalProps> = ({
  persona,
  isOpen,
  onClose,
  onPersonaUpdate,
  onPersonaDelete,
  entries
}) => {
  console.log('PersonaModal render called:', { isOpen, persona: persona?.name, hasPersona: !!persona });

  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState(persona?.name || '');

  // Menu dropdown state
  const [showMenu, setShowMenu] = useState(false);

  // Ref for the name input field
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Effect to handle name input selection when editing starts
  useEffect(() => {
    if (editingName && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.setSelectionRange(0, nameInputRef.current.value.length);
    }
  }, [editingName]);

  // Effect to close menu when clicking outside
  useEffect(() => {
    if (!showMenu) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target as Element).closest('.persona-menu-container')) {
        setShowMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showMenu]);

  if (!isOpen || !persona) {
    console.log('PersonaModal: not rendering due to isOpen or no persona');
    return null;
  }

  const handleNameSave = () => {
    if (tempName.trim() && tempName !== persona.name) {
      const updatedPersona = { ...persona, name: tempName.trim() };
      onPersonaUpdate?.(updatedPersona);
    }
    setEditingName(false);
  };

  const handleNameCancel = () => {
    setTempName(persona.name);
    setEditingName(false);
  };

  // Filter entries for this persona
  const personaEntries = entries.filter(entry =>
    entry.userDID === persona.id ||
    persona.hasEntries.some(e => e.id === entry.id) ||
    persona.needEntries.some(e => e.id === entry.id)
  );

  const personaHasEntries = personaEntries.filter(e => e.type === 'has');
  const personaNeedEntries = personaEntries.filter(e => e.type === 'need');

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      zIndex: 3000,
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
        maxWidth: '1200px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #eee',
          background: '#f8f9fa'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <h2 style={{ margin: 0, color: '#333', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {editingName ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    ref={nameInputRef}
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    style={{
                      padding: '4px 8px',
                      border: '1px solid #2e90fa',
                      borderRadius: '4px',
                      fontSize: 'inherit',
                      fontWeight: 'inherit'
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleNameSave();
                      if (e.key === 'Escape') handleNameCancel();
                    }}
                  />
                  <button
                    onClick={handleNameSave}
                    style={{
                      padding: '4px 8px',
                      background: '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    Save
                  </button>
                  <button
                    onClick={handleNameCancel}
                    style={{
                      padding: '4px 8px',
                      background: '#6c757d',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  {persona.name}
                  <div style={{ position: 'relative' }} className="persona-menu-container">
                    <button
                      onClick={() => setShowMenu(!showMenu)}
                      style={{
                        padding: '4px 8px',
                        background: 'transparent',
                        border: '1px solid #6c757d',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        color: '#6c757d'
                      }}
                      title="Persona options"
                    >
                      ⋯
                    </button>

                    {/* Dropdown Menu */}
                    {showMenu && (
                      <div style={{
                        position: 'absolute',
                        top: '100%',
                        right: '0',
                        background: 'white',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        zIndex: 1000,
                        minWidth: '120px',
                        marginTop: '4px'
                      }}>
                        <button
                          onClick={() => {
                            setTempName(persona.name);
                            setEditingName(true);
                            setShowMenu(false);
                          }}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            border: 'none',
                            background: 'transparent',
                            textAlign: 'left',
                            cursor: 'pointer',
                            fontSize: '12px',
                            color: '#333',
                            borderBottom: '1px solid #eee'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#f8f9fa';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                          }}
                        >
                          ✏️ Edit Name
                        </button>

                        {onPersonaDelete && (() => {
                          const hasActivity = personaHasEntries.length > 0 || personaNeedEntries.length > 0;
                          const actionText = hasActivity ? 'Archive' : 'Delete';
                          const actionIcon = hasActivity ? '📦' : '🗑️';
                          const confirmMessage = hasActivity
                            ? `Are you sure you want to archive "${persona.name}"? You can recover it later from the Archive View.`
                            : `Are you sure you want to permanently delete "${persona.name}"? This action cannot be undone.`;

                          return (
                            <button
                              onClick={() => {
                                if (window.confirm(confirmMessage)) {
                                  onPersonaDelete(persona.id);
                                }
                                setShowMenu(false);
                              }}
                              style={{
                                width: '100%',
                                padding: '8px 12px',
                                border: 'none',
                                background: 'transparent',
                                textAlign: 'left',
                                cursor: 'pointer',
                                fontSize: '12px',
                                color: hasActivity ? '#6c757d' : '#dc3545'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = hasActivity ? '#f8f9fa' : '#fff5f5';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                              }}
                            >
                              {actionIcon} {actionText} Persona
                            </button>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                </>
              )}
            </h2>
            <button
              onClick={onClose}
              style={{
                marginLeft: 'auto',
                padding: '8px 16px',
                background: 'linear-gradient(135deg, #6c757d, #5a6268)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '500',
                boxShadow: '0 2px 4px rgba(108, 117, 125, 0.2)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #5a6268, #495057)';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(108, 117, 125, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #6c757d, #5a6268)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(108, 117, 125, 0.2)';
              }}
              title="Close modal"
            >
              Close
            </button>
          </div>
          <p style={{ margin: '8px 0 0 0', color: '#666', fontSize: '14px' }}>
            Communities: {persona.communities.length} |
            Has: {personaHasEntries.length} |
            Needs: {personaNeedEntries.length}
          </p>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Left Sidebar - Communities */}
          <div style={{
            width: '200px',
            borderRight: '1px solid #eee',
            background: '#f8f9fa',
            overflow: 'auto'
          }}>
            <h4 style={{ padding: '16px', margin: 0, color: '#333', borderBottom: '1px solid #eee' }}>
              Communities
            </h4>
            <div style={{ padding: '8px' }}>
              {persona.communities.map((community) => (
                <button
                  key={community.id}
                  onClick={() => setSelectedCommunity(community)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    marginBottom: '4px',
                    border: selectedCommunity?.id === community.id ? '2px solid #2e90fa' : '1px solid #ddd',
                    borderRadius: '6px',
                    background: selectedCommunity?.id === community.id ? '#e8f4fd' : 'white',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontSize: '12px'
                  }}
                >
                  {community.name}
                  <div style={{ fontSize: '10px', color: '#666', marginTop: '2px' }}>
                    {community.messages.length} messages
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right Content Area */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {selectedCommunity ? (
              <>
                {/* Community Messages */}
                <div style={{
                  flex: 1,
                  padding: '16px',
                  overflow: 'auto',
                  background: '#fafbfc'
                }}>
                  <h4 style={{ margin: '0 0 16px 0', color: '#333' }}>
                    {selectedCommunity.name} Messages
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {selectedCommunity.messages.map((message) => (
                      <div
                        key={message.id}
                        style={{
                          padding: '12px',
                          background: 'white',
                          borderRadius: '8px',
                          border: '1px solid #e9ecef',
                          maxWidth: '70%'
                        }}
                      >
                        <div style={{
                          fontSize: '12px',
                          color: '#666',
                          marginBottom: '4px'
                        }}>
                          <strong>{message.sender}</strong> • {new Date(message.timestamp).toLocaleString()}
                        </div>
                        <div style={{ fontSize: '14px' }}>
                          {message.content}
                        </div>
                        {message.type !== 'text' && (
                          <div style={{
                            marginTop: '8px',
                            padding: '8px',
                            background: message.type === 'has' ? '#d4edda' : '#f8d7da',
                            borderRadius: '4px',
                            fontSize: '12px'
                          }}>
                            {message.type === 'has' ? '🟢' : '🔴'} {message.type.toUpperCase()} Entry
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              /* Has/Needs Overview */
              <div style={{
                flex: 1,
                padding: '16px',
                overflow: 'auto'
              }}>
                <div style={{ display: 'flex', gap: '20px' }}>
                  {/* Has Entries */}
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 12px 0', color: '#333' }}>
                      Has ({personaHasEntries.length})
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {personaHasEntries.map((entry) => (
                        <button
                          key={entry.id}
                          onClick={() => setSelectedEntry(entry)}
                          style={{
                            padding: '12px',
                            border: selectedEntry?.id === entry.id ? '2px solid #28a745' : '1px solid #ddd',
                            borderRadius: '6px',
                            background: selectedEntry?.id === entry.id ? '#f8fff8' : 'white',
                            cursor: 'pointer',
                            textAlign: 'left'
                          }}
                        >
                          <div style={{ fontWeight: 'bold', color: '#333' }}>
                            {entry.resourceType}
                          </div>
                          <div style={{ fontSize: '12px', color: '#666' }}>
                            {entry.description}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Need Entries */}
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 12px 0', color: '#333' }}>
                      Needs ({personaNeedEntries.length})
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {personaNeedEntries.map((entry) => (
                        <button
                          key={entry.id}
                          onClick={() => setSelectedEntry(entry)}
                          style={{
                            padding: '12px',
                            border: selectedEntry?.id === entry.id ? '2px solid #e74c3c' : '1px solid #ddd',
                            borderRadius: '6px',
                            background: selectedEntry?.id === entry.id ? '#fff8f8' : 'white',
                            cursor: 'pointer',
                            textAlign: 'left'
                          }}
                        >
                          <div style={{ fontWeight: 'bold', color: '#333' }}>
                            {entry.resourceType}
                          </div>
                          <div style={{ fontSize: '12px', color: '#666' }}>
                            {entry.description}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Entry Details (when selected) */}
        {selectedEntry && (
          <div style={{
            borderTop: '1px solid #eee',
            padding: '16px',
            background: '#f8f9fa',
            maxHeight: '300px',
            overflow: 'auto'
          }}>
            <h4 style={{ margin: '0 0 12px 0', color: '#333' }}>
              {selectedEntry.type === 'has' ? '🟢' : '🔴'} {selectedEntry.resourceType} Details
            </h4>
            <div style={{ marginBottom: '16px' }}>
              <p><strong>Description:</strong> {selectedEntry.description}</p>
              <p><strong>Location:</strong> {Math.round(selectedEntry.coordinates.lat * 1000) / 1000}°, {Math.round(selectedEntry.coordinates.lng * 1000) / 1000}°</p>
              <p><strong>User:</strong> {selectedEntry.userDID}</p>
              <p><strong>Posted:</strong> {new Date(selectedEntry.timestamp).toLocaleString()}</p>
            </div>

            {/* Match Candidates */}
            <div>
              <h5 style={{ margin: '0 0 8px 0', color: '#333' }}>
                Match Candidates
              </h5>
              <div style={{ fontSize: '12px', color: '#666' }}>
                {/* Placeholder for match candidates - would implement based on actual matching logic */}
                Matching functionality would be implemented here based on the selected entry type and available candidates.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonaModal;
