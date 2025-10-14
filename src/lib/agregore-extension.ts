/**
 * Has-Needs: Agregore Extension Bridge
 * -----------------------------------
 * Integrates Has-Needs functionality directly into Agregore browser
 */

// Agregore Extension API Bridge
declare global {
  interface Window {
    agregore: {
      // Core browser API
      version: string;
      platform: string;

      // P2P Protocol APIs
      p2p: {
        isConnected(): boolean;
        getPeers(): string[];
        shareContent(url: string): Promise<void>;
        onConnectionChange(callback: (connected: boolean) => void): void;
      };

      // Protocol handlers
      protocols: {
        ssb: {
          enabled: boolean;
          convertUrl(url: string): string;
        };
        ipfs: {
          enabled: boolean;
          convertUrl(url: string): string;
        };
        ipns: {
          enabled: boolean;
          convertUrl(url: string): string;
        };
      };

      // UI Integration
      ui: {
        addButton(id: string, config: any): void;
        removeButton(id: string): void;
        showNotification(message: string, type?: 'info' | 'success' | 'warning' | 'error'): void;
      };

      // Storage API
      storage: {
        set(key: string, value: any): Promise<void>;
        get(key: string): Promise<any>;
        remove(key: string): Promise<void>;
      };
    };
  }
}

// Has-Needs Extension Class
export class HasNeedsAgregoreExtension {
  private extensionId = 'has-needs-extension';
  private isInitialized = false;

  constructor() {
    if (typeof window !== 'undefined' && window.agregore) {
      this.initialize();
    }
  }

  private async initialize() {
    if (this.isInitialized) return;

    console.log('🔗 Initializing Has-Needs Agregore Extension');

    try {
      // Register extension with Agregore
      await this.registerExtension();

      // Set up protocol handlers
      this.setupProtocolHandlers();

      // Add UI elements
      this.addUIElements();

      // Set up event listeners
      this.setupEventListeners();

      this.isInitialized = true;
      console.log('✅ Has-Needs extension initialized');
    } catch (error) {
      console.error('❌ Failed to initialize extension:', error);
    }
  }

  private async registerExtension() {
    // Register with Agregore's extension system
    if (window.agregore.ui) {
      window.agregore.ui.addButton(this.extensionId, {
        label: 'Has-Needs',
        icon: '🤝',
        position: 'toolbar',
        onClick: () => this.openHasNeeds()
      });
    }
  }

  private setupProtocolHandlers() {
    // Enhance SSB protocol handling for Has-Needs
    if (window.agregore.protocols?.ssb) {
      const originalConvert = window.agregore.protocols.ssb.convertUrl;
      window.agregore.protocols.ssb.convertUrl = (url: string) => {
        // Add Has-Needs context to SSB URLs
        const converted = originalConvert(url);
        if (converted.includes('ssb://')) {
          return `${converted}?source=has-needs`;
        }
        return converted;
      };
    }
  }

  private addUIElements() {
    // Add connection status indicator
    this.addConnectionIndicator();

    // Add quick access menu
    this.addQuickAccessMenu();
  }

  private addConnectionIndicator() {
    if (window.agregore.ui) {
      // Add P2P status to address bar or toolbar
      const statusElement = document.createElement('div');
      statusElement.id = 'has-needs-connection-status';
      statusElement.style.cssText = `
        display: inline-flex;
        align-items: center;
        margin-left: 8px;
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: 500;
      `;

      // Update status based on P2P connection
      const updateStatus = () => {
        const connected = window.agregore.p2p?.isConnected() || false;
        statusElement.textContent = connected ? '🟢 P2P' : '🔴 Offline';
        statusElement.style.backgroundColor = connected ? '#d4edda' : '#f8d7da';
        statusElement.style.color = connected ? '#155724' : '#721c24';
      };

      updateStatus();

      // Monitor connection changes
      if (window.agregore.p2p) {
        window.agregore.p2p.onConnectionChange(updateStatus);
      }

      // Add to appropriate location in UI
      setTimeout(() => {
        const toolbar = document.querySelector('.agregore-toolbar, .toolbar');
        if (toolbar) {
          toolbar.appendChild(statusElement);
        }
      }, 1000);
    }
  }

  private addQuickAccessMenu() {
    // Add context menu items for Has-Needs
    if (window.agregore.ui) {
      // This would integrate with Agregore's context menu system
      console.log('📋 Has-Needs context menu integration ready');
    }
  }

  private setupEventListeners() {
    // Listen for navigation events
    window.addEventListener('agregore:navigate', (event: any) => {
      const { url } = event.detail;
      if (url && url.includes('has-needs')) {
        this.handleHasNeedsNavigation(url);
      }
    });

    // Listen for P2P events
    window.addEventListener('agregore:p2p-peer', (event: any) => {
      console.log('🤝 P2P peer event:', event.detail);
      // Could show notification or update UI
    });
  }

  private handleHasNeedsNavigation(url: string) {
    // Handle navigation to Has-Needs content
    console.log('🎯 Navigating to Has-Needs:', url);

    // Could preload Has-Needs data or show specific views
    if (url.includes('persona')) {
      // Handle persona-specific navigation
    } else if (url.includes('community')) {
      // Handle community-specific navigation
    }
  }

  private openHasNeeds() {
    // Open Has-Needs in current tab or new tab
    const hasNeedsUrl = '/has-needs-app/index.html';
    window.location.href = hasNeedsUrl;
  }

  // Public API for Has-Needs app to interact with Agregore
  public async shareContent(url: string, metadata?: any) {
    if (window.agregore.p2p) {
      await window.agregore.p2p.shareContent(url);
      console.log('📤 Content shared via P2P:', url);
    }
  }

  public async getConnectedPeers() {
    if (window.agregore.p2p) {
      return await window.agregore.p2p.getPeers();
    }
    return [];
  }

  public showNotification(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') {
    if (window.agregore.ui) {
      window.agregore.ui.showNotification(message, type);
    }
  }
}

// Initialize extension when DOM is ready
if (typeof window !== 'undefined') {
  // Wait for Agregore to load
  if (window.agregore) {
    new HasNeedsAgregoreExtension();
  } else {
    // Wait for Agregore to initialize
    window.addEventListener('agregore:ready', () => {
      new HasNeedsAgregoreExtension();
    });
  }
}
