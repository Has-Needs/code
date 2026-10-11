# Lightweight geographic UX: design constraints for Warp

**Status:** Candidate implementation profile, not a normative replacement for [Has-Needs Specification V1](https://github.com/Has-Needs/docs/blob/main/Has-Needs-Spec-v1.md). The existing React/Leaflet-style prototype is design history, not a required frontend.

## Geographic space is the interaction surface, not the data authority

Has-Needs' human interface should be excellent at seeing *where something could happen* while preventing location from becoming a mandatory identifier, a network-wide inventory, or a source of unauthorized inference.

The UI must allow a globe and local map to become alternate navigable views over participant-authorized data. Do **not** equate an object's semantic identity with a GeoJSON feature, GPS coordinate, cloud geocoder record, or map marker. The map is a renderer/projection, not the store of sovereign Has/Need truth. The same objects must be intelligible via low-bandwidth text, speech, symbols and constrained-device views when the map renderer is unavailable.

## Target qualities

- **Fast and lightweight on ordinary phones.** Favor small initial bundles, lazy-loaded advanced layers, tile-based detail, spatial indexing and level-of-detail rendering. Measure load time, memory, battery and frame pacing on representative low-end hardware, including intermittently connected devices. Do not promise a specific footprint or frame rate until measured.
- **Geographically capable.** Design for smooth transitions between globe, regional, neighborhood and local scopes; overlay semantic relationships, paths, density/aggregation and bounded spatial uncertainty. Keep basemap projection and rendered layers replaceable.
- **Offline/collapse-native.** Useful work continues with cached/bundled regional basemaps or without imagery altogether. Basemap availability is distinct from protocol transport and messaging availability. Never require cloud map APIs for basic Need/Has operations.
- **Privacy-aware geometry.** The map must render only recipient-authorized OCA projections (e.g., coarse region, approximate zone, rendezvous point, precise position only when permitted). Avoid shipping undisclosed coordinates to a client and merely hiding them in visual layers. Spatial indexes and inferred heatmaps can leak data, so they must observe the same authority boundaries.
- **Accessible and legible.** Text/speech/terminal views should expose equivalent authorized information and meaningful controls. Touch interaction must not demand precise motor control or visual literacy.
- **Extensible without accretion.** RGB composition, Data Views/Stories, semantic lenses, accessibility modes and new cartographic renderers attach to stable projection contracts, rather than adding shared state to a monolithic UI framework.

## Candidate renderer strategy: compare, don't prematurely select

1. **First benchmark:** MapLibre GL JS in a minimal TypeScript shell. It is a vector-tile WebGL renderer with globe capabilities and style-layer control. MapLibre Native offers native mobile approaches. This is an implementation candidate, not a dependency of Has-Needs semantics.
2. **Maps without a required map service:** PMTiles can supply static bundled/regional tile archives, including via MapLibre adapters. A remotely hosted PMTiles file still requires network access; offline means bytes actually stored on device. Account for glyphs/sprites/style assets too.
3. **Fallback and alternatives:** Bench a simpler canvas/SVG/text projection for constrained modes. Compare any custom globe/WebGPU or more elaborate geospatial engine **only after** a representative low-end-device test demonstrates a needed capability or better resource profile. Do not add a heavy 3-D geospatial stack solely to look impressive.

Reference docs:
- https://maplibre.org/maplibre-gl-js/docs/
- https://maplibre.org/maplibre-gl-js/docs/examples/pmtiles/
- https://maplibre.org/maplibre-native/android/examples/data/PMTiles/

## Essential interface seams

- `SovereignObject -> AuthorizedProjection`: only the owner/policy can determine fields and geographic precision exposed to a recipient.
- `AuthorizedProjection -> SpatialViewModel`: renderable approximate shape, scope and permitted relationship metadata. Spatial uncertainty is data, not a defect to hide.
- `SpatialViewModel -> Renderer`: map/globe/text renderer receives authorized data, not encryption keys, full raw objects or a global listing index.
- `BasemapProvider -> Renderer`: local PMTiles, downloaded regional tiles, lightweight primitives or external map provider can be swapped; no cloud basemap should become an identity provider.
- `InteractionIntent -> ProtocolAction`: tap, gesture, voice and keyboard all issue the same intention through the protocol/authorization boundary, never directly rewrite sovereign objects based on map UI state.

## Warp acceptance exercise

Using synthetic fixtures, show Alice's Need at coarse neighborhood scope, Bob's compatible Has as a permitted approximate region, and Carol's intermediary view with **less** sensitive information than Alice or Bob. Change one OCA authorization and demonstrate recipient-specific geographic precision transition without reconstructing the world state from a server.

Then remove the network and basemap service and demonstrate that locally held authorized objects still support the Need/Has/Working interaction (perhaps by text view or cached map). Test a low-end device and report actual memory, initial bundle and perceived responsiveness against another simple rendering approach.

**Anti-goal:** Creating a beautifully animated world map that requires every person to upload precise location and all Needs to a common map server. That would reproduce exactly the centralized architecture Has-Needs is designed to avoid.
