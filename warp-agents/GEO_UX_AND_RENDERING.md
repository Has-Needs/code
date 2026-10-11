# Lightweight geographic UX: design constraints for Warp

**Status:** Candidate implementation profile, not a normative replacement for [Has-Needs Specification V1](https://github.com/Has-Needs/docs/blob/main/Has-Needs-Spec-v1.md). The existing React/Leaflet-style prototype is design history, not a required frontend.

## Geographic space is the interaction surface, not the data authority

Has-Needs' human interface should be excellent at seeing *where something could happen* while preventing location from becoming a mandatory identifier, a network-wide inventory, or a source of unauthorized inference.

The UI must allow a globe and local map to become alternate navigable views over participant-authorized data. Do **not** equate an object's semantic identity with a GeoJSON feature, GPS coordinate, cloud geocoder record, or map marker. The map is a renderer/projection, not the store of sovereign Has/Need truth. The same objects must be intelligible via low-bandwidth text, speech, symbols and constrained-device views when the map renderer is unavailable.

## Primary scale: the last few meters, not the road network

**User priority (October 10, 2026):** Most participants may be walking, often acting within a small, finite area. The map's core job is to make *actionable local surroundings* intelligible: the entrance actually in use, the location of water, a safe route around debris, a curb cut, steps, paths, gates, level changes, a staging point, or a temporary resource. Do not design primarily for drivers or assume quarter-mile-scale road maps are sufficient.

**Tiles are an efficient rendering/cache partition, not a declaration of travel scale or spatial accuracy.** Leaflet can use tiles but can also show high-detail vector paths, polygons, markers, images/SVG and non-geographic local grids. The basemap can be blank; locally held, authorized participant geometry is first-class. Rendering more zoom pixels does not invent missing ground-truth detail.

Separate four independent dimensions:

1. **Extent:** Is the person navigating a continent, a neighborhood, a block, a building, a room, or the last several feet of an approach?
2. **Geometry quality:** What is actually known—surveyed entrance, hand-drawn path, image-derived feature, participant-observed obstacle, uncertain rough zone? Carry source, age, confidence/uncertainty, and approximate dimensional accuracy.
3. **Semantic actionability:** Can a person reach, enter, cross, obtain, avoid, or use the feature? A 2-meter-wide impassable fence matters more than a more precise street centerline. Model walkable connections, access conditions, hazards and level/floor changes when known.
4. **Disclosure permission:** What precision, feature and relationship context may *this recipient* learn now? A centimeter-quality private coordinate must not become a public coordinate merely because the map is zoomed in.

For close-range contexts, allow **local coordinate frames** anchored to a participant-authorized landmark, building, device-relative observation or surveyed reference, and map those frames to geographic coordinates only when justified. A single Leaflet map uses one coordinate-reference system at a time; coordinate-frame switching or layered projections must be explicit, not a claim of effortless continuous global-to-indoor geodesy.

**Accuracy guardrail:** Ordinary phone GNSS is generally not inch-accurate, especially near buildings or indoors. Never equate map zoom or display resolution with actual positional accuracy. Show uncertainty as a region or other truthful cue, and allow locally confirmed landmark-relative placement without requiring exact satellite positioning. Do not imply that precision is known just because floating-point coordinates are available.

**Baseline UX test:** In a fictional 100-meter-wide disaster staging area, the user must identify an accessible approach to a water distribution point whose closest straight-line path is blocked by a fence, with a gate and a step-free entrance on a different side. Test whether a map with only roads/building tiles fails; add a handful of local authorized microfeatures and verify the correct approach. Support offline use, floor/level changes if relevant, and synthetic uncertainty. Measure legibility at walking pace on a low-end phone. The same fixture must be intelligible in an accessible text description.

**Design aim:** The semantic geography of Has-Needs is not merely "Where is the pin?" but **"What is physically possible here, right now, for this person, with these permissions?"** This is a protocol-neutral rendering and spatial-reasoning goal, not permission for a global tracking database.

Useful references:
- https://leafletjs.com/examples/crs-simple/ — arbitrary local-grid coordinate system
- https://leafletjs.com/examples/overlays/ — detailed images, SVG and raster overlays
- https://wiki.openstreetmap.org/wiki/Micromapping — very small pedestrian features and objects
- https://wiki.openstreetmap.org/wiki/Guidelines_for_pedestrian_navigation — indoor connections and floor transitions

## Paths as private, participant-created geographic memory

**Primary use case — personal memory, not publication.** A person can tap **Start**, walk a path, tap **Stop**, and give it a human label. The result is a locally retained piece of *their own geographic knowledge*. They might label it “favorite shady path,” “avoids poison ivy,” “route I used yesterday,” or “possible unexploded-ordnance hazard nearby.” **No sharing, upload, listing, marketplace offer, community membership, exchange or automatic creation of a published HAS is required.** Saving knowledge for oneself is a complete and valuable action.

A path can be viewed again, annotated, compared with alternatives, edited, or deleted locally. The user controls retention, access and disclosure. The app should not collect or transmit the user's route as telemetry merely to render it. A base map, map tile provider, relay, or optional cloud backup does not become the authority over the recorded geometry or its annotations.

### Human interaction

1. **Tap Start** — begin opt-in, clearly indicated local route capture. Request only the location permissions necessary. Use a simple touch target; do not require map-editing expertise.
2. **Walk** — record available position fixes with uncertainty; preserve useful sequence and context. Do not confuse dense samples or a visually smooth line with centimeter accuracy. Allow approximate landmark-relative annotations when device GPS is unreliable.
3. **Tap Stop** — finish locally. Preview the line and, if necessary, trim stray fixes or correct a section.
4. **Label it** — a simple name in the user's own vocabulary. Optional notes may include accessibility, surface, preferred conditions, hazards, dates, photographs or alternative routes. The map can display this as a layered mathematical/geometric object.
5. **Remember privately** — save it as the participant's own object/history. No default social feed, map submission, monetization prompt or need to share.
6. **Optionally offer it later** — only on explicit choice, the participant may disclose a limited view, gift it, or express an independently addressable `HAS` of route knowledge/access under their own terms. Sharing or payment is a *possible subsequent relationship*, not the reason the object exists.

### Semantic and modular boundary

**Private observation → optional authorized projection → optional Has/Need exchange.** These must be distinct operations. A recorded path is not automatically public geographic data and not automatically a Has offered to others. Geography is useful even when no transaction occurs.

Separate the local geometry/notes store from the participant's persona/disclosure policy, semantic object engine, matching, map rendering and optional receipt/contract machinery. Swapping Leaflet for a globe or a text renderer must neither erase the private path nor make it public.

If the person elects to share or license their *contribution*, keep origin and agreed terms where applicable. The act of mapping does not establish exclusive ownership of the physical trail or geographic facts; legal rights in recordings and map data vary. Disclosing a copy may be irreversible even if later access is revoked.

**Safety and uncertainty:** Labels such as “landmine-free” or “safe route” must not be converted into verified safety guarantees. Conditions change, and a recorded absence of hazards is not evidence that unexploded ordnance is absent. Expose provenance, last observation date, uncertainty and suitable caution; do not automatically optimize routes through suspected hazardous areas.

### Warp acceptance demonstration

With synthetic local data, show a participant record, label, retain and redisplay a walking route **without any remote account, network request, Has offer or community sharing**. Reopen it offline and render it through a different view. Then show that optional recipient-scoped sharing is a *separate, explicit action*. Verify that changing renderers does not change object ownership or release undisclosed positions.

**Foundational principle:** The participant's lived experience can produce durable private geographic knowledge. A marketplace is only one optional way that knowledge may later be used.

## Target qualities

- **Fast and lightweight on ordinary phones.** Favor small initial bundles, lazy-loaded advanced layers, optional tiles for context, local microfeature overlays, spatial indexing and semantic level-of-detail rendering. Measure load time, memory, battery and frame pacing on representative low-end hardware, including intermittently connected devices. Do not promise a specific footprint or frame rate until measured.
- **Geographically capable.** Design for smooth transitions between globe, regional, neighborhood and local scopes; overlay semantic relationships, paths, density/aggregation and bounded spatial uncertainty. Keep basemap projection and rendered layers replaceable.
- **Offline/collapse-native.** Useful work continues with cached/bundled regional basemaps or without imagery altogether. Basemap availability is distinct from protocol transport and messaging availability. Never require cloud map APIs for basic Need/Has operations.
- **Privacy-aware geometry.** The map must render only recipient-authorized OCA projections (e.g., coarse region, approximate zone, rendezvous point, precise position only when permitted). Avoid shipping undisclosed coordinates to a client and merely hiding them in visual layers. Spatial indexes and inferred heatmaps can leak data, so they must observe the same authority boundaries.
- **Accessible and legible.** Text/speech/terminal views should expose equivalent authorized information and meaningful controls. Touch interaction must not demand precise motor control or visual literacy.
- **Extensible without accretion.** RGB composition, Data Views/Stories, semantic lenses, accessibility modes and new cartographic renderers attach to stable projection contracts, rather than adding shared state to a monolithic UI framework.

## Candidate renderer strategy: compare, don't prematurely select

1. **First pedestrian benchmark:** Leaflet with an optional local/offline basemap and separately rendered, high-detail local vector/shape overlays. Compare a blank basemap plus detailed local geometry, not just standard streets-and-roads tiles. Leaflet is a candidate, not the system's spatial data model.
2. **Globe and alternative benchmark:** MapLibre GL JS in a minimal TypeScript shell offers WebGL vector layers and globe capabilities; MapLibre Native offers native approaches. This is a replaceable geographic renderer, not a dependency of Has-Needs semantics.
3. **Maps without a required map service:** PMTiles can supply static bundled/regional tile archives, including via MapLibre adapters. A remotely hosted PMTiles file still requires network access; offline means bytes actually stored on device. Account for glyphs/sprites/style assets too.
4. **Fallback and alternatives:** Bench a simpler canvas/SVG/text projection for constrained modes. Compare any custom globe/WebGPU or more elaborate geospatial engine **only after** a representative low-end-device test demonstrates a needed capability or better resource profile. Do not add a heavy 3-D geospatial stack solely to look impressive.

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
