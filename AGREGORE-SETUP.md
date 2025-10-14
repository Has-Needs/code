# 🌐 Agregore Browser Setup Guide

A comprehensive guide to installing and setting up Agregore browser for the Has-Needs P2P platform.

## 📦 Installation

### Option 1: Direct Download (Recommended)

**Windows, macOS, Linux:**

```bash
# Download from official releases
curl -L -o agregore.zip "https://github.com/AgregoreWeb/agregore-browser/releases/latest/download/agregore-browser-win32-x64.zip"
# Or visit: https://github.com/AgregoreWeb/agregore-browser/releases
```

**macOS (Homebrew):**

```bash
brew install agregore-browser
```

**Linux (Snap):**

```bash
sudo snap install agregore-browser
```

### Option 2: Build from Source

```bash
# Clone the repository
git clone https://github.com/AgregoreWeb/agregore-browser.git
cd agregore-browser

# Install dependencies
npm install

# Build for your platform
npm run build:win32  # Windows
npm run build:darwin # macOS
npm run build:linux  # Linux

# The built app will be in the 'dist' folder
```

## 🚀 Quick Start

1. **Download and install** Agregore browser using one of the methods above
2. **Launch Agregore** - it should open with a clean interface
3. **Access Has-Needs** by navigating to your deployed IPFS hash:
   ```
   ipfs://bafkreihashhere/
   ```
   **Or use the web gateway** while setting up:
   ```
   https://gateway.pinata.cloud/ipfs/bafkreihashhere/
   ```

## ⚙️ Configuration for Has-Needs

### Enable P2P Features

Agregore automatically handles P2P protocols, but you can verify settings:

1. **Open Settings** (gear icon or menu)
2. **Check Protocol Support:**
   - ✅ SSB (Secure Scuttlebutt)
   - ✅ IPFS (InterPlanetary File System)
   - ✅ IPNS (IPFS Naming)
   - ✅ Magnet Links (BitTorrent)

### Recommended Settings for Has-Needs

```json
{
  "autoHideMenuBar": false,
  "protocols": {
    "ssb": { "enabled": true, "autoConvert": true },
    "ipfs": { "enabled": true, "autoConvert": true },
    "ipns": { "enabled": true, "autoConvert": true }
  },
  "p2p": {
    "autoShare": true,
    "cache": { "enabled": true, "maxSize": "1GB" }
  }
}
```

## 🔗 Integration Features

### Automatic Protocol Detection

Agregore automatically converts various URL formats:

| Format | Converts To | Example |
|--------|-------------|---------|
| `ssb://feed-id` | SSB Feed | `ssb://%abc123...` |
| `ipfs://hash` | IPFS Content | `ipfs://bafkreia...` |
| `ipns://name` | IPNS Name | `ipns://example.eth` |
| `magnet:?xt=...` | Torrent | `magnet:?xt=urn:btih:...` |

### P2P Content Sharing

- **Automatic Caching**: Visited P2P sites are cached and shared
- **Offline Access**: Browse previously visited content without internet
- **Peer Discovery**: Find content through connected peers

## 🛠️ Troubleshooting

### Common Issues

**"Protocol not supported" errors:**
- Ensure Agregore is the latest version
- Check that P2P protocols are enabled in settings

**Slow loading of P2P content:**
- Check internet connection for initial load
- Content will be cached for faster subsequent access

**Can't connect to peers:**
- Ensure both devices are on the same network (or use internet)
- Check firewall settings for P2P traffic

### Debug Mode

Enable debug logging in Agregore:
```bash
# Run with debug flags
agregore --debug
```

## 📚 Resources

- **Official Website**: https://agregore.mauve.moe/
- **GitHub Repository**: https://github.com/AgregoreWeb/agregore-browser
- **Documentation**: https://docs.agregore.mauve.moe/
- **Community Chat**: Join via SSB or Matrix

## 🎯 Has-Needs Specific Setup

For the best Has-Needs experience:

1. **Install Agregore** using the recommended method for your OS
2. **Verify P2P protocols** are enabled in settings
3. **Test with demo content** before deploying your app
4. **Enable caching** for offline functionality
5. **Join communities** to test peer connections

---

**Ready to experience the decentralized web with Has-Needs!** 🌐
