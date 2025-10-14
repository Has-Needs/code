/**
 * Has-Needs: QR Code Component
 * ----------------------------
 * Handles both app distribution and community invitation QR codes
 */

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';

interface QRData {
  type: 'app-distribution' | 'community-invitation';
  // App distribution fields
  appVersion?: string;
  downloadUrl?: string;
  // Community invitation fields
  communityId?: string;
  communityName?: string;
  inviterId?: string;
  inviterName?: string;
}

interface QRConnectionProps {
  qrData: QRData;
  onClose?: () => void;
  title?: string;
}

export const QRConnection: React.FC<QRConnectionProps> = ({
  qrData,
  onClose,
  title = "QR Code"
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(true);

  useEffect(() => {
    generateQR();
  }, [qrData]);

  const generateQR = async () => {
    try {
      setIsGenerating(true);

      let qrUrl: URL;

      if (qrData.type === 'app-distribution') {
        // App distribution QR - links to web deployment
        // In production: 'https://your-domain.com/'
        // For development: use localhost
        qrUrl = new URL(window.location.origin + '/');
      } else {
        // Community invitation QR - hasneeds:// protocol
        qrUrl = new URL('hasneeds://community-invitation');

        // Add community invitation data
        Object.entries(qrData).forEach(([key, value]) => {
          if (value !== undefined && key !== 'type') {
            qrUrl.searchParams.set(key, String(value));
          }
        });
      }

      const qrOptions = {
        width: 300,
        margin: 2,
        color: {
          dark: qrData.type === 'app-distribution' ? '#2e90fa' : '#28a745',
          light: '#ffffff'
        },
        errorCorrectionLevel: 'M' as const
      };

      const qrDataUrl = await QRCode.toDataURL(qrUrl.toString(), qrOptions);
      setQrCodeUrl(qrDataUrl);
    } catch (error) {
      console.error('Failed to generate QR code:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        const shareData = {
          title: `${title} - Has-Needs`,
          text: qrData.type === 'app-distribution'
            ? 'Download Has-Needs - the mobile-first P2P resource sharing app'
            : `Join ${qrData.communityName} community on Has-Needs`,
          url: qrData.type === 'app-distribution'
            ? window.location.origin + '/'
            : `hasneeds://community-invitation?${new URLSearchParams(qrData as any).toString()}`
        };

        await navigator.share(shareData);
      } catch (error) {
        console.log('Share cancelled or failed');
      }
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.9)',
      zIndex: 4000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '16px',
        padding: '32px',
        maxWidth: '500px',
        width: '100%',
        boxShadow: '0 12px 48px rgba(0,0,0,0.4)',
        textAlign: 'center'
      }}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{
            margin: '0 0 8px 0',
            color: qrData.type === 'app-distribution' ? '#2e90fa' : '#28a745',
            fontSize: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{
              width: '24px',
              height: '24px',
              background: qrData.type === 'app-distribution' ? '#2e90fa' : '#28a745',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              color: 'white'
            }}>
              {qrData.type === 'app-distribution' ? '📱' : '🏘️'}
            </span>
            {title}
          </h3>
          <p style={{ margin: 0, color: '#666', fontSize: '16px', lineHeight: '1.4' }}>
            {qrData.type === 'app-distribution'
              ? 'Share this code to help others download Has-Needs'
              : `Invite others to join ${qrData.communityName} community`
            }
          </p>
        </div>

        {/* QR Code */}
        <div style={{
          margin: '24px 0',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '300px',
          background: '#f8f9fa',
          borderRadius: '12px',
          padding: '20px'
        }}>
          {isGenerating ? (
            <div style={{
              width: '300px',
              height: '300px',
              background: '#f8f9fa',
              border: '2px dashed #dee2e6',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6c757d',
              flexDirection: 'column'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: '#2e90fa',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                color: 'white',
                marginBottom: '12px'
              }}>
                📱
              </div>
              <div style={{ fontSize: '14px' }}>Generating QR Code...</div>
            </div>
          ) : (
            <img
              src={qrCodeUrl}
              alt={`${qrData.type} QR Code`}
              style={{
                width: '300px',
                height: '300px',
                border: '3px solid #e9ecef',
                borderRadius: '12px'
              }}
            />
          )}
        </div>

        {/* QR Info */}
        <div style={{
          background: qrData.type === 'app-distribution'
            ? 'linear-gradient(135deg, #2e90fa, #20B2AA)'
            : 'linear-gradient(135deg, #28a745, #20c997)',
          color: 'white',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px',
          textAlign: 'left'
        }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              width: '20px',
              height: '20px',
              background: qrData.type === 'app-distribution' ? '#2e90fa' : '#28a745',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              color: 'white'
            }}>
              {qrData.type === 'app-distribution' ? '📱' : '🏘️'}
            </span>
            {qrData.type === 'app-distribution' ? 'App Download' : 'Community Invitation'}
          </h4>
          <div style={{ fontSize: '14px', lineHeight: '1.5' }}>
            {qrData.type === 'app-distribution' ? (
              <>
                <div><strong>App:</strong> Has-Needs v{qrData.appVersion}</div>
                <div><strong>Type:</strong> Mobile-first P2P resource sharing</div>
              </>
            ) : (
              <>
                <div><strong>Community:</strong> {qrData.communityName}</div>
                <div><strong>Invited by:</strong> {qrData.inviterName}</div>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {'share' in navigator && (
            <button
              onClick={handleShare}
              style={{
                background: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              📤 Share QR Code
            </button>
          )}

          <button
            onClick={() => {
              // Copy URL to clipboard
              const url = qrData.type === 'app-distribution'
                ? window.location.origin + '/'
                : `hasneeds://community-invitation?${new URLSearchParams(qrData as any).toString()}`;

              navigator.clipboard.writeText(url);
              // Show feedback
              const btn = event?.target as HTMLButtonElement;
              const originalText = btn.textContent;
              btn.textContent = '✅ Copied!';
              setTimeout(() => {
                btn.textContent = originalText;
              }, 1500);
            }}
            style={{
              background: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            📋 Copy Link
          </button>

          <button
            onClick={onClose}
            style={{
              background: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            ✕ Close
          </button>
        </div>

        {/* Instructions */}
        <div style={{
          marginTop: '24px',
          fontSize: '14px',
          color: '#6c757d',
          lineHeight: '1.5',
          textAlign: 'left',
          background: '#f8f9fa',
          borderRadius: '8px',
          padding: '16px'
        }}>
          <h5 style={{ margin: '0 0 12px 0', color: '#495057', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{
              width: '16px',
              height: '16px',
              background: qrData.type === 'app-distribution' ? '#2e90fa' : '#28a745',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '8px',
              color: 'white'
            }}>
              {qrData.type === 'app-distribution' ? '📱' : '🏘️'}
            </span>
            {qrData.type === 'app-distribution' ? 'How to Use App QR:' : 'How to Use Community QR:'}
          </h5>
          <ol style={{ margin: 0, paddingLeft: '20px' }}>
            {qrData.type === 'app-distribution' ? (
              <>
                <li><strong>Scan QR code</strong> with camera</li>
                <li><strong>Download Has-Needs</strong> PWA</li>
                <li><strong>Grant permissions</strong> (camera, microphone, etc.)</li>
                <li><strong>Start using</strong> mobile-first P2P app</li>
              </>
            ) : (
              <>
                <li><strong>Scan QR code</strong> with camera</li>
                <li><strong>Join community</strong> {qrData.communityName}</li>
                <li><strong>Choose persona</strong> or create new one</li>
                <li><strong>Start coordinating</strong> with community members</li>
              </>
            )}
          </ol>
        </div>
      </div>
    </div>
  );
};

export default QRConnection;
