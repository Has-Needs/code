#!/bin/bash

# Has-Needs: Agregore Integration Bundle Script
# --------------------------------------------
# Creates a bundled version where Agregore browser comes with Has-Needs

set -e

echo "🔗 Creating Has-Needs + Agregore Bundle..."

# Check if Agregore is installed
if ! command -v agregore &> /dev/null; then
    echo "❌ Agregore browser not found. Please install it first:"
    echo "   https://github.com/AgregoreWeb/agregore-browser/releases"
    exit 1
fi

echo "✅ Agregore browser detected"

# Create bundle directory
BUNDLE_DIR="has-needs-agregore-bundle"
mkdir -p "$BUNDLE_DIR"

# Copy Agregore browser
echo "📦 Copying Agregore browser..."
AGREGORE_PATH=$(which agregore)
AGREGORE_DIR=$(dirname "$AGREGORE_PATH")
cp -r "$AGREGORE_DIR" "$BUNDLE_DIR/agregore-browser"

# Build Has-Needs for IPFS
echo "🔨 Building Has-Needs..."
npm run build

# Copy built Has-Needs
cp -r dist/* "$BUNDLE_DIR/has-needs-app/"

# Create launcher script
cat > "$BUNDLE_DIR/launch-has-needs.sh" << 'EOF'
#!/bin/bash

echo "🚀 Launching Has-Needs with Agregore..."
echo ""

# Start Agregore with Has-Needs as default page
echo "Opening Has-Needs in Agregore browser..."
agregore "$(pwd)/has-needs-app/index.html" &

echo ""
echo "✅ Has-Needs is now running in Agregore!"
echo "🌐 Access your P2P app at: http://localhost:3000"
echo "📱 Or use Agregore's P2P features for decentralized access"
echo ""
echo "Features available:"
echo "  • P2P Protocol Support (SSB, IPFS, IPNS)"
echo "  • Offline Browsing"
echo "  • Automatic Content Sharing"
echo "  • QR Code Peer Connections"
echo ""
echo "Press Ctrl+C to stop all processes"
wait
EOF

chmod +x "$BUNDLE_DIR/launch-has-needs.sh"

# Create bundle info file
cat > "$BUNDLE_DIR/README.md" << 'EOF'
# 🌐 Has-Needs + Agregore Bundle

This bundle combines Has-Needs (P2P resource sharing platform) with Agregore (P2P web browser) for a complete decentralized experience.

## 🚀 Quick Start

```bash
./launch-has-needs.sh
```

This will:
1. Launch Agregore browser
2. Open Has-Needs application
3. Enable all P2P features

## 📦 What's Included

- **Agregore Browser**: Full P2P web browser
- **Has-Needs App**: Resource sharing platform
- **Protocol Integration**: SSB, IPFS, IPNS support
- **Offline Capability**: Works without internet
- **QR Connections**: Easy peer setup

## 🎯 Features

### P2P Protocols
- ✅ SSB (Secure Scuttlebutt)
- ✅ IPFS (InterPlanetary File System)
- ✅ IPNS (IPFS Naming)
- ✅ Magnet Links (BitTorrent)

### Decentralized Features
- ✅ No central servers required
- ✅ Offline-first design
- ✅ Automatic content sharing
- ✅ Peer-to-peer networking

## 🔧 Usage

1. **Launch**: `./launch-has-needs.sh`
2. **Access**: Has-Needs opens automatically in Agregore
3. **Connect**: Use QR codes to connect with other users
4. **Share**: All content is automatically shared P2P

## 🛠️ Development

To modify the bundle:

```bash
# Rebuild Has-Needs
npm run build

# Copy updated files
cp -r dist/* has-needs-agregore-bundle/has-needs-app/

# Relaunch
./has-needs-agregore-bundle/launch-has-needs.sh
```

## 📚 Learn More

- [Agregore Browser](https://agregore.mauve.moe/)
- [Has-Needs Documentation](AGREGORE-README.md)
- [P2P Protocols Guide](https://docs.agregore.mauve.moe/)

---

**Experience the future of decentralized applications!** 🌐
EOF

echo "✅ Bundle created successfully!"
echo ""
echo "📁 Bundle location: $BUNDLE_DIR/"
echo "🚀 Launch script: $BUNDLE_DIR/launch-has-needs.sh"
echo ""
echo "To use:"
echo "  cd $BUNDLE_DIR"
echo "  ./launch-has-needs.sh"
echo ""
echo "🌟 Has-Needs and Agregore are now unified!"
