/**
 * Has-Needs: Community Interface Component
 * ----------------------------------------
 * Shows current community with invitation sharing and app distribution
 */

import React, { useState, useEffect } from 'react';
import QRConnection from './QRConnection';
import { Community } from '../lib/types';

interface CommunityInterfaceProps {
  currentCommunity: Community | null;
  currentUserId: string;
  currentUserName: string;
  onLeaveCommunity?: () => void;
}

export const CommunityInterface: React.FC<CommunityInterfaceProps> = ({
  currentCommunity,
  currentUserId,
  currentUserName,
  onLeaveCommunity
}) => {
  const [showCommunityQR, setShowCommunityQR] = useState(false);
  const [showAppQR, setShowAppQR] = useState(false);

  if (!currentCommunity) {
    return null; // Don't show anything if not in a community
  }

  return (
    <>
      <div style={{
        position: 'fixed',
        top: '20px',
        left: '20px',
        background: 'rgba(255,255,255,0.95)',
        borderRadius: '12px',
        padding: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        zIndex: 2000,
        minWidth: '280px',
        maxWidth: '320px'
      }}>
        {/* Community Header */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '8px'
          }}>
            <div style={{
              width: '12px',
              height: '12px',
              background: '#28a745',
              borderRadius: '50%'
            }}></div>
            <h3 style={{ margin: 0, color: '#2e90fa', fontSize: '16px' }}>
              {currentCommunity.name}
            </h3>
          </div>
          <p style={{ margin: 0, color: '#666', fontSize: '12px' }}>
            {currentCommunity.description || 'Community coordination space'}
          </p>
        </div>

        {/* Community Stats */}
        <div style={{
          background: 'linear-gradient(135deg, #2e90fa, #20B2AA)',
          color: 'white',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '16px'
        }}>
          <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
            👥 {currentCommunity.memberCount} Members
          </div>
          <div style={{ fontSize: '12px', opacity: 0.9 }}>
            Active Community
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
          <button
            onClick={() => setShowAppQR(true)}
            style={{
              background: '#2e90fa',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            📱 Share Has-Needs
          </button>

          <button
            onClick={() => setShowCommunityQR(true)}
            style={{
              background: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            🏘️ Invite to Community
          </button>

          <button
            onClick={onLeaveCommunity}
            style={{
              background: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            🚪 Leave Community
          </button>
        </div>
      </div>

      {/* App Distribution QR Modal */}
      {showAppQR && (
        <QRConnection
          qrData={{
            type: 'app-distribution',
            appVersion: '1.0.0'
          }}
          onClose={() => setShowAppQR(false)}
          title="Share Has-Needs"
        />
      )}

      {/* Community Invitation QR Modal */}
      {showCommunityQR && (
        <QRConnection
          qrData={{
            type: 'community-invitation',
            communityId: currentCommunity.id,
            communityName: currentCommunity.name,
            inviterId: currentUserId,
            inviterName: currentUserName
          }}
          onClose={() => setShowCommunityQR(false)}
          title={`Invite to ${currentCommunity.name}`}
        />
      )}
    </>
  );
};

export default CommunityInterface;
