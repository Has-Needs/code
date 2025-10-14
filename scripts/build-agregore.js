#!/usr/bin/env node

/**
 * Has-Needs: Agregore Build Script
 * -------------------------------
 * Prepares the application for Agregore deployment with P2P features
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Building Has-Needs for Agregore...');

// Create Agregore-compatible manifest
const manifest = {
  name: 'Has-Needs',
  short_name: 'HasNeeds',
  description: 'Peer-to-peer resource sharing platform',
  version: '1.0.0',
  start_url: '/',
  scope: '/',
  display: 'standalone',
  orientation: 'any',
  theme_color: '#2e90fa',
  background_color: '#525A3A',
  categories: ['productivity', 'social', 'utilities'],
  icons: [
    {
      src: '/favicon.ico',
      sizes: '16x16 32x32',
      type: 'image/x-icon',
      purpose: 'any'
    }
  ],
  protocol_handlers: [
    {
      protocol: 'ssb',
      url: '/?feed=%s'
    },
    {
      protocol: 'ipfs',
      url: '/?cid=%s'
    },
    {
      protocol: 'ipns',
      url: '/?name=%s'
    },
    {
      protocol: 'magnet',
      url: '/?magnet=%s'
    }
  ],
  share_target: {
    action: '/share',
    method: 'POST',
    enctype: 'multipart/form-data',
    params: {
      title: 'Share to Has-Needs',
      text: 'Share resource or need'
    }
  },
  permissions: ['geolocation', 'notifications'],
  agregore: {
    protocols: ['ssb', 'ipfs', 'ipns', 'magnet'],
    p2p: {
      enabled: true,
      autoShare: true
    },
    cache: {
      enabled: true,
      maxSize: '1GB'
    }
  }
};

// Write manifest to public directory
fs.writeFileSync(
  path.join(__dirname, '../public/manifest.json'),
  JSON.stringify(manifest, null, 2)
);

console.log('✅ Agregore manifest created');
console.log('✅ P2P protocols configured');
console.log('✅ Cache settings applied');
console.log('');
console.log('🚀 Ready for Agregore deployment!');
console.log('   Run: npm run deploy:ipfs');
console.log('   Access via: ipfs://<hash>/ or https://gateway.pinata.cloud/ipfs/<hash>/');
