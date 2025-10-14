# 🌐 Has-Needs: Agregore P2P Platform

A peer-to-peer resource sharing platform designed specifically for the **Agregore browser** and the distributed web.

## 🚀 Features

### ✅ Agregore Integration
- **P2P Protocol Support**: SSB, IPFS, IPNS, BitTorrent Magnet links
- **Offline Capability**: Works without internet using cached content
- **Decentralized Hosting**: Runs entirely on IPFS
- **Auto-sharing**: Automatically shares content with other Agregore users

### ✅ Core Functionality
- **Interactive Map**: Leaflet-based map with crosshair centering
- **Persona Management**: Multiple user personas with community integration
- **Resource Sharing**: Has/Needs posting and matching system
- **Social Features**: Community messaging and coordination

## 📦 Installation & Deployment

### Prerequisites
```bash
npm install -g ipfs-deploy
```

### Build for Agregore
```bash
# Build the application
npm run build:agregore

# Deploy to IPFS
npm run deploy:ipfs
```

### Access Your App
After deployment, your app will be available at:
- **Agregore P2P**: `ipfs://<your-ipfs-hash>/`
- **Web Gateway**: `https://gateway.pinata.cloud/ipfs/<your-ipfs-hash>/`
- **Direct IPFS**: `/ipfs/<your-ipfs-hash>/`

## 🛠️ Development

### Running Locally
```bash
npm start
```

### Agregore-Specific Features
- **P2P Status Indicator**: Shows online/offline/P2P connection status
- **Protocol Detection**: Automatically detects Agregore browser
- **Offline Support**: App works without internet connection
- **Tile Caching**: Map tiles cached for offline use

## 🌟 Agregore Benefits

### 🔗 Protocol Support
- **SSB**: For decentralized social networking
- **IPFS**: For content-addressed storage
- **IPNS**: For mutable content addressing
- **Magnet Links**: For BitTorrent integration

### 🌍 Decentralized Features
- **No Central Servers**: Everything runs peer-to-peer
- **Offline-First**: Designed to work without internet
- **Automatic Sharing**: Content distributed automatically
- **Resilient**: Works even if traditional web is down

### 📱 User Experience
- **Fast Loading**: Cached content loads instantly
- **Privacy-Focused**: No tracking or data collection
- **Community-Driven**: Built for decentralized communities
- **Extensible**: Protocol handlers for custom schemes

## 🎯 Architecture

### Frontend
- **React + TypeScript**: Modern web application
- **Leaflet Maps**: Interactive mapping with P2P tiles
- **PWA Support**: Progressive Web App capabilities

### P2P Integration
- **Agregore API**: Native browser P2P protocols
- **IPFS Content**: Distributed storage and sharing
- **SSB Social**: Decentralized identity and messaging
- **Offline Cache**: Local storage for offline use

### Data Flow
```
User Input → React App → Agregore Browser → P2P Protocols → IPFS/SSB Network
```

## 🔧 Configuration

### Agregore Settings
```json
{
  "agregore": {
    "protocols": ["ssb", "ipfs", "ipns", "magnet"],
    "p2p": {
      "enabled": true,
      "autoShare": true
    },
    "cache": {
      "enabled": true,
      "maxSize": "1GB"
    }
  }
}
```

## 🚀 Getting Started

1. **Deploy to IPFS**: Use the included deployment script
2. **Access via Agregore**: Open `ipfs://<hash>/` in Agregore browser
3. **Create Personas**: Set up different user identities for different communities
4. **Share Resources**: Post Has/Needs entries for your community
5. **Connect P2P**: Share and discover resources through the distributed network

## 📚 Resources

- [Agregore Browser](https://agregore.mauve.moe/)
- [IPFS Documentation](https://docs.ipfs.io/)
- [SSB Protocol](https://scuttlebutt.nz/)
- [Leaflet Maps](https://leafletjs.com/)

## 🏗️ Contributing

This project is designed to work specifically with Agregore's P2P capabilities. Contributions that enhance the decentralized experience are welcome!

---

**Built for the Distributed Web** 🌐
*Peer-to-peer, privacy-first, community-driven resource sharing*
