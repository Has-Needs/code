# Has-Needs Experimental Implementation

This repository contains prototype and exploratory implementation work for the Has-Needs protocol.

> **Status: pre-V1 / non-conformant prototype.**  
> The canonical architecture is [Has-Needs Specification V1](https://github.com/Has-Needs/docs/blob/main/Has-Needs-Spec-v1.md). Code in this repository predates several clarified V1 invariants and must not be treated as normative.

## V1 implementation cutover

V1 governs all new implementation work. Existing code is historical experimental material and imposes no compatibility or reuse requirement. A fresh implementation is permitted; retaining a component is an implementation choice, not an architectural obligation. Evaluate new work against V1 and its conformance criteria, not against legacy behavior.

## Optional historical scaffolding

The existing code contains useful scaffolding for:
- the `[entity, relation, context]` triplet;
- local Has/Need creation;
- matching experiments;
- identity, validation, networking, and overlay experiments;
- Jitterbug topology exploration;
- globe/resource-map interface work.

## Known pre-V1 divergences

Historical prototype assumptions must not be carried into a V1 implementation where they conflict with the specification. Examples include:
- `committed` where V1 uses the `WORKING` relation state;
- locally stored collections whose scope is not explicit enough;
- query methods such as `getAllNeeds()` that should be clearly owner- or permission-scoped;
- matching against all locally held objects rather than semantic/routing discovery across sovereign boundaries;
- consensus-oriented terminology that may be unnecessary for receipt-only personal chains;
- technology choices that were explored before transport and storage were made explicitly replaceable.

Local enumeration itself is valid: a participant must be able to inspect **their own** Has, Needs, Working objects, receipts, and other authorized holdings. V1 prohibits privileged network-wide enumeration of other participants' sovereign objects.

## Development direction

See the [Development Roadmap](https://github.com/Has-Needs/docs/blob/main/ROADMAP.md).

The immediate implementation target is a minimal three-participant reference loop:

Alice creates `NEED`; Bob creates `HAS`; Carol assists scoped discovery. Progressive disclosure and explicit acceptance by both parties establish `WORKING`. Completion produces the same canonical receipt for Alice and Bob, separate participant-local chain entries, and local lineage/resolution evidence updates.

See [reference-loop issue #2](https://github.com/Has-Needs/code/issues/2) for the full milestone and the [Need Configurator demonstrator brief](demo-artifacts/need-configurator/README.md) for the bounded interaction flow.

The implementation remains **0.x** until V1 conformance criteria are demonstrated.

## License

This repository is **source-visible but not open source**. It is currently available for limited reference and evaluation under the repository `LICENSE`. Attribution is required for uses licensed by Has-Needs. Modification, redistribution, derivative works, deployment, commercial use, and AI-training use require prior written permission unless independently authorized by law or binding platform terms.
