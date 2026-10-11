# Design philosophy and modular architecture — Has-Needs

**Audience:** Warp and all future implementers. **Status:** Engineering interpretation of the [V1 architecture](https://github.com/Has-Needs/docs/blob/main/Has-Needs-Spec-v1.md), not an independent normative amendment. Read before naming packages, creating database entities, or choosing a stack.

## The central invention is a relationship, not a technology stack

Has-Needs starts where conventional software usually stops: with the autonomous participant rather than the service provider. Its smallest grammar — `[entity, relation, context]`, with `HAS`, `NEED`, and `WORKING` — expresses available capability, desired resolution and consented cooperation without requiring a common owner, institutional taxonomy, payments, internet, or application vendor.

The architecture is aimed at **discovering and preserving successful state transitions**, not at collecting all available resources in one place. A Need is a sovereign, addressable intent with terms for satisfaction; a Has is a sovereign capability; Working is an authorized relationship among such objects; a canonical receipt is common evidence of an actual exchange, held within independent personal histories. Ontology can learn from declarations and outcomes without becoming a centralized authority over meaning.

**Modularity must preserve these relationships when implementations change.** Splitting a conventional centralized app into microservices does not accomplish this. The true boundaries are *authority*, *meaning*, *disclosure* and *recoverability*.

## What modularity means here

A good module can be replaced without forcing participants to relinquish ownership, rewriting what `NEED` means, invalidating past receipts, or requiring global migration of every user into a new provider. At every interface, distinguish:

1. **Semantic contract:** What the signed claim, authorization, exchange, receipt or relationship *means*. Stable at the applicable protocol version.
2. **Authority contract:** Who may create, inspect, modify, authorize or revoke it. Never an accidental property of where data is hosted.
3. **Evidence contract:** Which proof must travel with the event and how an independently held record remains verifiable over time.
4. **Projection/disclosure contract:** What a specific recipient may see *at this relationship stage*, in a given persona and purpose.
5. **Mechanism contract:** Algorithms, transports, encodings, storage libraries, interface technologies and services that can be swapped under the first four contracts.

These five dimensions should guide package and API boundaries. A package split that severs semantic continuity or buries authority behind shared infrastructure is not modularity.

## Candidate conceptual modules, with boundaries

These are engineering seams, **not mandatory services, new protocol object classes or a call for a microservice architecture**:

- **Participant continuity and persona:** sovereign keys/continuity reference and selectable participation facets; cannot depend on a particular social login or central administrator.
- **Semantic object engine:** produce and inspect independent Has/Need claims and their lineage; no global database required.
- **Matching/discovery:** propose candidates from only consented semantic hints; no authority to enter Working.
- **Agreement engine:** compare proposals and verify bounded authorization; protect committed allocation without mistaking offline messages for mutual assent.
- **OCA/disclosure:** recipient-, purpose-, field- and stage-specific projections. A transport or renderer cannot bypass this decision.
- **Evidence and receipts:** canonicalized exchange records and verification, distinct from each participant's local append-only chain entry.
- **Local ontology/evidence learning:** distinguish declared substitutions from receipt-supported successful resolutions.
- **Trust inspection:** reveal permissioned current chain-hop/grey-list/filter evidence, not a persistent universal trust score.
- **Transport/routing:** carry allowed semantic deltas under intermittency, bandwidth constraints and relays; transport never owns a Has or Need.
- **Renderer/accessibility:** globe, text, symbols, terminal, voice, SMS and future modes project the same participant-held semantics.
- **Cryptographic mechanisms:** provide authentication, signature verification, key establishment, protection and revalidation under explicit algorithm/version policy, without becoming the definition of identity or of a receipt.

## Two example module boundaries that must survive replacement

**Changing a crypto suite** must not change what consent Alice gave, what Bob offered, what the `WORKING` object binds, what value the parties attest was exchanged, or which canonical receipt they are discussing. It *will* require versioned verification metadata, deliberate re-attestation/key rotation rules where necessary, and honest handling of signatures that become insecure; "same history" is a claim backed by transition evidence, not a naive re-sign-and-erase operation.

**Changing a transport** from IP to Bluetooth, radio, a slow store-carry-forward Friend or a human relay must not alter the requested outcome, authorization requirements or canonical receipt. It may alter latency, ordering, delivery guarantees and available rind size. Applications must confront those changes without inventing central coordination.

## Coherence before coding

Do not ask every module to rediscover the philosophy. Establish the small stable cross-module contracts first, in one shared architecture and conformance fixture. Build a **single thin end-to-end reference loop** that touches the seams, then replace one mechanism at a time. Put falsification tests at authority and semantic boundaries, reusing the same tests when changing adapters. Avoid proliferating disconnected proof-of-concept packages.

For each proposed module ask:
- Could this be replaced by a different implementation *without forcing a new protocol ontology or new authority*?
- What is the smallest information it is permitted to learn or disclose?
- Which participant controls its outputs, and what happens when it is offline or compromised?
- Does its interface preserve versioned meaning even when cryptography, transport and storage evolve?
- Is it a meaningful boundary of sovereignty or merely a familiar division from SaaS architecture?

**The intended result:** a system free to innovate in its mechanisms precisely because its human and protocol invariants are not repeatedly reinterpreted.
