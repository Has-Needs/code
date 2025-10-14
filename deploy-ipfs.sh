#!/bin/bash

# Has-Needs: IPFS Deployment Script for Agregore
# ---------------------------------------------
# Builds and deploys the application to IPFS for Agregore compatibility

set -e

echo "🚀 Building Has-Needs for Agregore deployment..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build for production
echo "🔨 Building production bundle..."
npm run build

# Create IPFS-compatible directory structure
echo "📁 Preparing IPFS structure..."
mkdir -p dist-ipfs

# Copy built files
cp -r dist/* dist-ipfs/

# Create Agregore manifest
cat > dist-ipfs/manifest.json << EOF
{
  "name": "Has-Needs",
  "version": "1.0.0",
  "description": "Peer-to-peer resource sharing platform",
  "start_url": "/index.html",
  "scope": "/",
  "display": "standalone",
  "orientation": "any",
  "categories": ["productivity", "social", "utilities"],
  "lang": "en",
  "dir": "ltr",
  "icons": [
    {
      "src": "/favicon.ico",
      "sizes": "16x16 32x32",
      "type": "image/x-icon"
    }
  ],
  "protocol_handlers": [
    {
      "protocol": "ssb",
      "url": "/?feed=%s"
    },
    {
      "protocol": "ipfs",
      "url": "/?cid=%s"
    },
    {
      "protocol": "ipns",
      "url": "/?name=%s"
    }
  ],
  "share_target": {
    "action": "/share",
    "method": "POST",
    "enctype": "multipart/form-data",
    "params": {
      "title": "Share to Has-Needs",
      "text": "Share resource or need"
    }
  }
}
EOF

# Create .agregorerc configuration
cat > dist-ipfs/.agregorerc << EOF
{
  "autoHideMenuBar": true,
  "protocols": {
    "ssb": {
      "enabled": true,
      "autoConvert": true
    },
    "ipfs": {
      "enabled": true,
      "autoConvert": true,
      "gateway": "https://gateway.pinata.cloud/ipfs/"
    },
    "ipns": {
      "enabled": true,
      "autoConvert": true
    }
  },
  "p2p": {
    "autoShare": true,
    "cache": {
      "enabled": true,
      "maxSize": "1GB"
    }
  }
}
EOF

# Add IPFS hash placeholder
echo "bafkreihashplaceholder" > dist-ipfs/.ipfs-hash

echo "✅ Build complete!"
echo ""
echo "📋 Next steps:"
echo "1. Upload 'dist-ipfs' directory to IPFS"
echo "2. Get the IPFS hash of the uploaded content"
echo "3. Update .ipfs-hash file with real hash"
echo "4. Access via: https://gateway.pinata.cloud/ipfs/<hash>/"
echo "5. Or use Agregore: ipfs://<hash>/"
echo ""
echo "🔗 Your app will be available at:"
echo "   Web Gateway: https://gateway.pinata.cloud/ipfs/<hash>/"
echo "   Agregore P2P: ipfs://<hash>/"
echo "   Direct IPFS: /ipfs/<hash>/"
echo ""
echo "🎯 Ready for decentralized deployment!"
