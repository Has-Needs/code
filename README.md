# Has-Needs Sovereign Globe MVP

This is a modular, human-centric codebase for a peer-owned resource coordination protocol, visualized on a 25km globe, with explicit privacy, trust, and user-consent as defaults.

## Key Features

- **Personal globe UI:** View and manage "has" and "need" resources in a natural, human-scale 25km view.
- **Sovereign store:** Local-only, privacy-enforced storage model.
- **Trust window/overlay:** Visualizes trust paths and levels as overlays on peer resources.
- **Contract/stream model:** Purchase/contract data feeds with explicit cryptographic consent.
- **Rapid-modifiable** TypeScript+React modular files — easily extendable.

## File Structure

- `src/lib/types.ts`: Core types/interfaces.
- `src/lib/SovereignStore.ts`: Local resource/receipt store.
- `src/lib/TrustUtils.ts`: Trust logic/utilities.
- `src/lib/PeerDiscovery.ts`: P2P/IPFS stub logic.
- `src/components/Globe.tsx`: Visual globe, entries/peers rendering.
- `src/components/TrustOverlay.tsx`: Trust path overlay, per-peer.
- `src/components/HasButton.tsx`, `src/components/NeedButton.tsx`: Resource/need creation flows.
- `src/components/FeedPurchaseDialog.tsx`: Consent-driven contract/data-access UI.
- `src/App.tsx`, `src/index.tsx`: App root and bootstrap.

## Usage

1. `npm install`
2. `npm start`
3. Open `http://localhost:3000` and try out the sovereign globe UI.

## Extending

- P2P: Implement PeerDiscovery with actual WebRTC/libp2p/IPFS.
- Persistence: Wire SovereignStore to localStorage, IndexedDB, or personal blockchain.
- Real location: Use HTML5 Geolocation API or OS sensor feeds.

## Philosophy

This codebase exists to empower self-quantification, mutual aid, and real privacy at the protocol level. Service to the individual, not extractive systems.

---

### File: `.gitignore` (at the project root)