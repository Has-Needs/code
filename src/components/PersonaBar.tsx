/**
 * Has-Needs: PersonaBar Component
 * -------------------------------
 * Displays 4 visible personas with left/right navigation arrows.
 * Shows persona names and allows clicking to open persona modal.
 */

import React, { useState } from 'react';
import CommunityQR from './QRConnection';
import { Persona, Community, Message } from '../lib/types';

interface PersonaBarProps {
  personas: Persona[];
  onPersonaSelect?: (persona: Persona) => void;
}

export const PersonaBar: React.FC<PersonaBarProps> = ({ personas, onPersonaSelect }) => {
  const [startIndex, setStartIndex] = useState(0);
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [qrPersona, setQrPersona] = useState<Persona | null>(null);

  const visiblePersonas = personas.slice(startIndex, startIndex + 6);
  const hasMoreLeft = startIndex > 0;
  const hasMoreRight = startIndex + 6 < personas.length;

  const handlePrev = () => {
    if (hasMoreLeft) {
      setStartIndex(Math.max(0, startIndex - 1));
    }
  };

  const handleNext = () => {
    if (hasMoreRight) {
      setStartIndex(Math.min(personas.length - 6, startIndex + 1));
    }
  };

  const handlePersonaClick = (persona: Persona) => {
    setSelectedPersona(persona);
    onPersonaSelect?.(persona);
  };

  const handleShareClick = (persona: Persona) => {
    setQrPersona(persona);
    setShowQR(true);
  };

  return (
    <>
      {/* Indicator Squares Row - Separate from persona tabs */}
      <div style={{
        display: 'flex',
        gap: '2px',
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginBottom: '2px'
      }}>
        {/* Empty squares for all personas */}
        {personas.map((_, index) => (
          <div
            key={`indicator-${index}`}
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '2px',
              background: index >= startIndex && index < startIndex + 6
                ? '#2e90fa'  // Filled for visible personas
                : 'rgba(0,0,0,0.2)', // Empty for hidden personas
              border: '1px solid rgba(0,0,0,0.1)'
            }}
            title={`Persona ${index + 1} ${index >= startIndex && index < startIndex + 6 ? '(visible)' : '(hidden)'}`}
          />
        ))}
      </div>

      {/* QR Connection Modal */}
      {showQR && qrPersona && (
        <CommunityQR
          qrData={{
            type: 'community-invitation',
            communityId: qrPersona.communities?.[0]?.id || 'default-community',
            communityName: qrPersona.communities?.[0]?.name || 'Has-Needs Community',
            inviterId: qrPersona.id,
            inviterName: qrPersona.name
          }}
          onClose={() => {
            setShowQR(false);
            setQrPersona(null);
          }}
          title={`Share ${qrPersona.name}`}
        />
      )}
    </>
  );
};

export default PersonaBar;
