# Contributing to Has-Needs

Contributions are welcome.

Has-Needs is at a stage where careful criticism and small, testable implementations are more valuable than broad feature accumulation. Developers, researchers, humanitarian practitioners, security reviewers, networking engineers, designers, accessibility specialists, and domain experts can all make useful contributions.

## Start here

1. Read the [Has-Needs Specification V1](https://github.com/Has-Needs/docs/blob/main/Has-Needs-Spec-v1.md).
2. Read the [Development Roadmap](https://github.com/Has-Needs/docs/blob/main/ROADMAP.md).
3. Treat current code as experimental 0.x work, not as the source of protocol truth.
4. Use V1 as the implementation cutover. Existing code imposes no compatibility or reuse requirement; fresh implementations are welcome. Judge any retained component against V1, not the reverse.
5. Use [reference-loop issue #2](https://github.com/Has-Needs/code/issues/2) and the [Need Configurator demonstrator brief](demo-artifacts/need-configurator/README.md) to distinguish a bounded demonstration from completion of the full milestone.

## Especially useful contributions

- identify contradictions or underspecified invariants;
- build small conformance tests;
- implement independent Has and Need creation, mutual acceptance into Working, and completion into one canonical receipt with participant-local chain evidence;
- test owner-scoped enumeration and network non-enumerability;
- prototype progressive disclosure;
- prototype live chain-hop vetting and visible relationship distance;
- test the eight-hop reference depth and shorter user-selected stopping points;
- test Trust Kernel version detection and random-peer update propagation;
- explore semantic Friend-node behavior;
- run constrained-network / BLE experiments;
- improve accessibility and literacy-agnostic interaction;
- prototype RGB layer composition and Data Stories;
- adversarially test disaster and recovery scenarios.

## Design posture

Prefer minimal mechanisms over feature accumulation.

If a behavior can be expressed through the existing primitives, demonstrate that before proposing a new primitive.

Human judgment remains authoritative. AI, routing, ranking, ontology, and vetting should support the person rather than silently make consequential decisions for them.

## Governance

Has-Needs currently uses a benevolent-dictator / lead-maintainer governance model. Discussion and disagreement are welcome; final normative architectural authority remains with the project lead while V1 is being established.

See [Governance](https://github.com/Has-Needs/docs/blob/main/GOVERNANCE.md).

## Licensing

The repository's current `LICENSE` controls use of the code.

Contribution guidance does not itself grant additional rights. Before broad external developer onboarding, licensing can be revisited deliberately so contributors have clear, welcoming terms while project stewardship and architectural authority remain explicit.
