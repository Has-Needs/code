# WARP.md — Has-Needs agent rules

**For Warp's coding agents.** This repository is a pre-V1 experimental implementation of a sovereign coordination protocol, not a conventional app. Warp recognizes a root-level `WARP.md` as project rules; the files in `warp-agents/` are supporting context and must be read deliberately. Read them before architectural decisions.

## Read first
1. `warp-agents/THIS_IS_NOT.md` — familiar patterns to reject and what replaces them.
2. `warp-agents/INNOVATION_PROTOCOL.md` — how to make independent, evidence-driven design choices.
3. `warp-agents/DESIGN_PHILOSOPHY_AND_MODULES.md` — overarching philosophy and stable module interfaces.
4. `warp-agents/CRYPTO_AGILITY.md` — suite versioning, proof continuity and post-quantum migration.
5. `warp-agents/FIRST_CONTACT_TRIAL.md` — design-only cold-start evaluation; **do not read this during the unprimed run**.
6. [Canonical Specification V1](https://github.com/Has-Needs/docs/blob/main/Has-Needs-Spec-v1.md).
7. [Roadmap](https://github.com/Has-Needs/docs/blob/main/ROADMAP.md), [Need Configurator brief](demo-artifacts/need-configurator/README.md), and [three-participant implementation issue #2](https://github.com/Has-Needs/code/issues/2).
8. [Contract primitives working list](https://github.com/Has-Needs/docs/blob/main/CONTRACT_PRIMITIVES.md) **as a proposed amendment**, not yet an adopted V1 requirement.

## Guiding proposition

**Has-Needs discovers and preserves successful state transitions; it is not fundamentally a system for describing resources.** Human agency, participant-owned semantic objects, scoped discovery, protected disclosure, accepted commitments, and evidence of outcomes are the architecture. Do not substitute a familiar centralized implementation because it is easier to scaffold.

## This is not…
- **A centralized resource inventory or two-sided marketplace.** No authoritative global Has/Need database, universal listing page, or privileged network-wide enumeration. A participant can enumerate **their own** objects and legitimately disclosed holdings.
- **A custodial identity/social graph platform.** Participants control identity, personas, and disclosure; an institution, relay, or account provider must not silently become their owner.
- **A traditional shared blockchain ledger or permanent activity feed.** Core evidence resides in participant-local append-only chains, with counterparties sharing a canonical receipt; no default global transaction log or exhaust of unsuccessful exploration.
- **A reputation scoring/rating service.** Trust is inspected live from permitted relationship evidence, not stored as a universal score, stars, or permanent "bad user" classification.
- **A CRUD state machine with invented relation types.** The protocol triplet is `[entity, relation, context]` with exactly `HAS | NEED | WORKING`. Completion and availability are lifecycle semantics, not extra relation values.
- **An AI-controlled judge of matches or a universal ontology.** Ontology is locally evolving and evidentiary. Matching proposes; people authorize interpersonal acceptance.
- **A cloud-dependent service with privacy implemented by hiding UI fields.** Transport is replaceable and should degrade gracefully; OCA/persona rules must constrain actual recipient-specific data exposure, not merely display.
- **A system in which communities absorb member sovereignty.** Pooling and coordinated action must retain each participant's independently authorized objects and direct resolution paths.
- **A cryptocurrency or monetization prerequisite.** Value exchange includes aid, access, services, knowledge, logistics and commerce; money is optional.

These are architectural guardrails, **not bans** on ordinary web technology, convenient UI, conventional libraries, or scoped indexes used inside a participant's authorized boundary. Judge mechanisms by their authority and information flows, not their fashionable names.

## Non-negotiable engineering behaviors

- Distinguish an **architectural invariant**, a **V1 protocol requirement**, a **replaceable implementation choice**, and an **unadopted proposal**. Existing code is experimental and non-normative.
- No `WORKING` binding before required parties authorize the same terms. Protect committed quantities from double allocation; disconnection alone is not a no-deal outcome.
- A relay may route allowed semantic rind information without gaining protected payload or ownership.
- Canonical identical counterpart receipt and each participant's separate local chain entries are different objects. Do not include participant-local predecessor pointers in canonical shared receipt bytes.
- Do not claim cryptographic privacy/security, anti-Sybil uniqueness, production readiness, or V1 conformance on the basis of mocks. Mark assumptions and synthetic tests.
- V1 presently uses completed-exchange receipts and a new remainder Has lineage in its reference loop. October 8 proposals include stable Has identity with portion-level binding and explicit deal/no-deal outcome receipts. **These changes are experiments, not silent V1 amendments.**
- Leave normative spec changes, ownership/consent boundary changes, and release designations for project-lead review. Make ordinary technical decisions autonomously, document the alternatives and tests, and favor reversible choices.

## Warp's default process
For every architectural milestone (not every micro-edit): **human outcome → controlling invariants → conventional shortcut declined → chosen minimal mechanism → falsifying test → observed result → unresolved design question**. Establish one coherent cross-module design, then implement a single observable vertical slice and report actual test evidence, rather than expanding features to fit a conventional framework.

Your job is to discover better implementations of Has-Needs, not to normalize Has-Needs into existing software categories.
