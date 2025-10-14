/**
 * Has-Needs: Persona Selection Modal for Community Invitations
 * -----------------------------------------------------------
 * Allows users to choose a persona or create a new one for a community invitation
 */

import React, { useState } from 'react';
import { Persona, Community } from '../lib/types';

interface PersonaSelectionModalProps {
  isOpen: boolean;
  invitationData: {
    communityId: string;
    communityName: string;
    inviterName: string;
  };
  availablePersonas: Persona[];
  onPersonaSelect: (persona: Persona) => void;
  onCreateNewPersona: (community: Community) => void;
  onClose: () => void;
}

export const PersonaSelectionModal: React.FC<PersonaSelectionModalProps> = ({
  isOpen,
  invitationData,
  availablePersonas,
  onPersonaSelect,
  onCreateNewPersona,
  onClose
}) => {
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>('');

  if (!isOpen) return null;

  const handlePersonaSelect = () => {
    const persona = availablePersonas.find(p => p.id === selectedPersonaId);
    if (persona) {
      onPersonaSelect(persona);
    }
  };

  const handleCreateNew = () => {
    // Create a temporary community object for the new persona
    const community: Community = {
      id: invitationData.communityId,
      name: invitationData.communityName,
      description: `Invited by ${invitationData.inviterName}`,
      messages: [],
      createdBy: invitationData.inviterName,
      createdAt: Date.now(),
      members: [],
      isActive: true,
      memberCount: 1
    };
    onCreateNewPersona(community);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.8)',
      zIndex: 5000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '16px',
        padding: '32px',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '80vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 12px 48px rgba(0,0,0,0.4)'
      }}>
        {/* Header */}
        <div style={{ marginBottom: '24px', textAlign: 'center' }}>
          <h2 style={{ margin: '0 0 8px 0', color: '#2e90fa' }}>
            🏘️ Community Invitation
          </h2>
          <p style={{ margin: 0, color: '#666', fontSize: '16px' }}>
            You've been invited to join <strong>{invitationData.communityName}</strong>
          </p>
          <p style={{ margin: '8px 0 0 0', color: '#999', fontSize: '14px' }}>
            Invited by {invitationData.inviterName}
          </p>
        </div>

        {/* Persona Selection */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#333' }}>
            Choose a Persona for this Community
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {availablePersonas.map((persona) => (
              <div
                key={persona.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '16px',
                  border: selectedPersonaId === persona.id ? '2px solid #2e90fa' : '1px solid #ddd',
                  borderRadius: '8px',
                  background: selectedPersonaId === persona.id ? '#f0f8ff' : '#fff',
                  cursor: 'pointer'
                }}
                onClick={() => setSelectedPersonaId(persona.id)}
              >
                {/* Persona Icon */}
                <div style={{
                  width: '50px',
                  height: '50px',
                  background: `hsl(${persona.id.hashCode() % 360}, 70%, 60%)`,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: '20px',
                  fontWeight: 'bold',
                  flexShrink: 0
                }}>
                  {persona.name.charAt(0).toUpperCase()}
                </div>

                {/* Persona Info */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold', color: '#333', marginBottom: '4px' }}>
                    {persona.name}
                  </div>
                  <div style={{ color: '#666', fontSize: '14px' }}>
                    {persona.communities.length} communities • {persona.hasEntries.length + persona.needEntries.length} entries
                  </div>
                </div>

                {/* Selection Indicator */}
                {selectedPersonaId === persona.id && (
                  <div style={{ color: '#2e90fa', fontSize: '20px' }}>
                    ✓
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          marginTop: '24px',
          display: 'flex',
          gap: '12px',
          justifyContent: 'space-between',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={handleCreateNew}
            style={{
              background: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            ➕ Create New Persona
          </button>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={onClose}
              style={{
                background: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                fontSize: '16px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>

            <button
              onClick={handlePersonaSelect}
              disabled={!selectedPersonaId}
              style={{
                background: selectedPersonaId ? '#2e90fa' : '#ccc',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: selectedPersonaId ? 'pointer' : 'not-allowed'
              }}
            >
              Join Community
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to generate consistent hash codes for colors
declare global {
  interface String {
    hashCode(): number;
  }
}

String.prototype.hashCode = function() {
  let hash = 0;
  for (let i = 0; i < this.length; i++) {
    const char = this.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
};

export default PersonaSelectionModal;
