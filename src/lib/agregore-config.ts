/**
 * Has-Needs: Agregore Configuration
 * --------------------------------
 * Configuration file for Agregore browser integration
 * Enables P2P features, protocol handling, and offline capabilities
 */

export const agregoreConfig = {
  // App metadata for Agregore
  name: "Has-Needs",
  version: "1.0.0",
  description: "Peer-to-peer resource sharing platform for communities",

  // Protocol handlers for Agregore
  protocols: {
    // Handle SSB identities
    ssb: {
      enabled: true,
      autoConvert: true,
      defaultFeed: null
    },

    // Handle IPFS content
    ipfs: {
      enabled: true,
      gateway: 'https://gateway.pinata.cloud/ipfs/',
      autoConvert: true
    },

    // Handle IPNS names
    ipns: {
      enabled: true,
      autoConvert: true
    },

    // Handle magnet links for torrents
    magnet: {
      enabled: true,
      autoConvert: true
    }
  },

  // P2P features
  p2p: {
    // Enable automatic content sharing
    autoShare: true,

    // Cache settings
    cache: {
      enabled: true,
      maxSize: '1GB',
      ttl: 7 * 24 * 60 * 60 * 1000 // 7 days
    },

    // Offline mode settings
    offline: {
      enabled: true,
      fallbackToCache: true,
      showOfflineIndicator: true
    }
  },

  // UI preferences for Agregore
  ui: {
    // Hide traditional menu bar for minimal interface
    autoHideMenuBar: true,

    // Custom theme
    theme: {
      primary: '#2e90fa',
      secondary: '#20B2AA',
      background: '#525A3A',
      surface: '#f8f9fa'
    }
  },

  // Development settings
  development: {
    // Enable debug logging
    debug: true,

    // Hot reload for development
    hotReload: true,

    // Source maps for debugging
    sourceMaps: true
  }
};

// Export for use in Agregore
if (typeof window !== 'undefined' && (window as any).agregore) {
  (window as any).agregore.config = agregoreConfig;
}
