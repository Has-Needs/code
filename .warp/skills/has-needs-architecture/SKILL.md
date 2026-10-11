---
name: has-needs-architecture
description: Use for any Has-Needs feature, schema, API, data-flow, privacy, matching, contract, identity, networking, state, or code review task. Challenge conventional software defaults before implementing a sovereign protocol design.
---

# Has-Needs architecture-first engineering skill

This is a **Warp-specific** decision aid for working on the unfamiliar portions of Has-Needs. It is not a license to invent protocol semantics at will. Before modifying protocol-facing behavior, read `WARP.md`, `warp-agents/THIS_IS_NOT.md`, `warp-agents/INNOVATION_PROTOCOL.md`, and the applicable version of https://github.com/Has-Needs/docs/blob/main/Has-Needs-Spec-v1.md. If repository content is unavailable, say so; do not pretend to have read it.

## Frame the problem from first principles

1. **Human event:** Describe the actual outcome sought by a participant in a disaster, routine commerce, agriculture or aid. Include their ability to opt out, withhold information and act offline.
2. **Primitive inventory:** Identify the smallest existing protocol objects and relationships needed: `[entity, HAS | NEED | WORKING, context]`, participant-scoped permissions, semantic discovery, authorized agreement, receipts and local lineage. **Do not create object types merely because a conventional ORM expects them.**
3. **Authority diagram:** State for each operation who owns it, who can sign/authorize it, which participant can read it, and what happens when any intermediary disappears.
4. **Default-assumption inversion:** Name the obvious textbook implementation *and specifically why it would compromise this system*. Challenge notions such as central DB, single trusted operator, global browse/search, shared user table, global consensus, universal taxonomy, per-interaction logs, persistent numerical reputation, and AI-mediated consent. A familiar library is acceptable when its actual authority/data behavior preserves the invariants.
5. **Novel candidate designs:** Generate at least two plausible mechanisms *when* the architectural choice is nontrivial, preferably including one that would not arise from a standard SaaS CRUD design. Compare their permission boundaries, network failure behavior, complexity, testability and replacement cost; choose the **least complex valid** candidate. Do not optimize for novelty as theater.
6. **Falsification gate:** Before declaring a design viable, specify a negative test capable of disproving the relevant invariant: relay leakage, unauthorized enumeration, one-sided binding, two concurrent reservations, out-of-order duplicate receipts, forged/outdated identity context, loss of cloud or network, ontology disagreement, or hidden central authority.
7. **Implementation and evidence:** Implement a narrow slice with synthetic fixture data; run tests; state exactly which invariant was demonstrated, which was only modeled, and which remains unproven. A UI showing hidden data is **not** proof of encryption. A successful receipt equality test is **not** proof of network security.
8. **Decision record:** Write a concise note in the PR: human goal, controlling V1 section/ref, candidate choices, rejected default, mechanism/authority map, falsification test/result, boundary and recommendation. Escalate only if the design alters normative semantics, consent/ownership, or privacy authority; routine implementation choices are autonomous.

## Two architectural inversion exercises

### Discovery across sovereign actors
A conventional agent may create a central `needs` table indexed by category/location, and an administrator-facing global search API. That is *the wrong primitive*, even if the front end conceals the data. Instead propose how independent Need and Has objects exchange just enough scoped semantic hints for discovery via an optional Friend node, without granting the relay authority or access to protected payloads. **Test:** Carol cannot fetch or enumerate Alice's undisclosed objects, and removing Carol does not erase Alice's object or her permission to attempt alternate discovery.

### Exchange completion without universal consensus
A conventional agent may put each transaction into a globally shared blockchain or centralized orders/events table. That is *the wrong evidence model*. Instead design a deterministic canonical receipt shared with the relevant participants, with independent participant-local append-only entries referencing the receipt. **Test:** The parties compute identical canonical receipt hashes even with different local prior-chain pointers and under delayed/replayed delivery; third parties do not automatically receive the exchange ledger.

## Hard distinctions the agent must not erase

- **Normative V1 vs new hypotheses:** The October 8 contract-primitives draft proposes stable Has identity with portion-level allocation, Authorize/Bind/Resolve reduction, and no-deal receipts. They have not yet superseded V1. Run alternate-design experiments **without claiming V1 conformance** or silently changing the frozen milestone.
- **Outcome vs convenience:** The user need not understand code, ontologies, blockchain or identity mechanisms to express what would resolve their situation.
- **Purposeful novelty vs reinvention:** Standard cryptographic primitives, test harnesses and parsers are generally preferable to invented ones. What is novel is the system's *composition and authority structure*, not a homemade replacement for mature security algorithms.
- **Simulation vs proof:** Agent mocks are useful for research but must be labeled and cannot substantiate security or decentralization guarantees.
- **Proposals vs permission:** An agent may propose a new architecture; it must not autonomously commit normative changes under an implementation task.

## Completion definition

A feature is complete only if a reviewer can reproduce its **human outcome**, inspect the **authority/data flow**, and run a **counterexample test**. Avoid mistaking a large number of completed subtasks for progress in the protocol.

If tasked only with a mechanical edit, apply existing project rules without generating a full design dossier. If the task touches a sovereignty boundary, use the full exercise.
