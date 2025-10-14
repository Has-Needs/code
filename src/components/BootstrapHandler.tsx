/**
 * Has-Needs: Bootstrap Handler
 * ----------------------------
 * Handles community invitations and app installation flows
 */

import React, { useEffect } from 'react';

interface BootstrapHandlerProps {
  onCommunityInvitation?: (invitationData: any) => void;
  onAppInstallPrompt?: () => void;
  hasAppInstalled?: boolean;
}

export const BootstrapHandler: React.FC<BootstrapHandlerProps> = ({
  onCommunityInvitation,
  onAppInstallPrompt,
  hasAppInstalled = false
}) => {
  useEffect(() => {
    // Check if we arrived via a community invitation URL
    const urlParams = new URLSearchParams(window.location.search);

    if (urlParams.has('type') && urlParams.get('type') === 'community-invitation') {
      handleCommunityInvitation(urlParams);
    }

    // Also check if we were launched with a hasneeds:// URL
    if (window.location.protocol === 'hasneeds:') {
      handleHasneedsProtocol(window.location.href);
    }

    // Handle hasneeds:// protocol when app is already installed
    if (window.location.search.includes('invitation=')) {
      const invitationParam = urlParams.get('invitation');
      if (invitationParam) {
        try {
          // Decode the invitation data from the URL parameter
          const invitationData = JSON.parse(decodeURIComponent(invitationParam));
          handleCommunityInvitationFromData(invitationData);
        } catch (error) {
          console.error('Failed to parse invitation data:', error);
        }
      }
    }
  }, []);

  const handleCommunityInvitation = (params: URLSearchParams) => {
    try {
      const invitationData = {
        type: 'community-invitation',
        communityId: params.get('communityId') || '',
        communityName: params.get('communityName') || '',
        inviterId: params.get('inviterId') || '',
        inviterName: params.get('inviterName') || '',
        timestamp: params.get('timestamp') || Date.now().toString()
      };

      console.log('🏘️ Community invitation received:', invitationData);

      if (!hasAppInstalled) {
        // User doesn't have Has-Needs installed, redirect to app installation
        console.log('📱 Redirecting to app installation...');
        onAppInstallPrompt?.();
      } else {
        // User has Has-Needs, show persona selection for community
        console.log('👤 Showing persona selection for community...');
        onCommunityInvitation?.(invitationData);
      }

    } catch (error) {
      console.error('❌ Failed to process community invitation:', error);
    }
  };

  const handleCommunityInvitationFromData = (invitationData: any) => {
    console.log('🏘️ Processing community invitation from data:', invitationData);

    if (!hasAppInstalled) {
      // User doesn't have Has-Needs installed, redirect to app installation
      console.log('📱 Redirecting to app installation...');
      onAppInstallPrompt?.();
    } else {
      // User has Has-Needs, show persona selection for community
      console.log('👤 Showing persona selection for community...');
      onCommunityInvitation?.(invitationData);
    }
  };

  const handleHasneedsProtocol = (url: string) => {
    try {
      // Parse hasneeds://community-invitation?params format
      const urlObj = new URL(url);
      const params = urlObj.searchParams;

      handleCommunityInvitation(params);
    } catch (error) {
      console.error('❌ Failed to parse hasneeds:// URL:', error);
    }
  };

  // This component doesn't render anything visible
  return null;
};

export default BootstrapHandler;
