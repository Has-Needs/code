# This is NOT that — architectural anti-patterns for Warp agents

**Purpose:** Prevent an AI coding agent from replacing Has-Needs' intentionally unusual architecture with a familiar but incompatible software product. Read with `../WARP.md`. Examples here are design diagnostics, not new normative protocol text. When there is a conflict, follow [Specification V1](https://github.com/Has-Needs/docs/blob/main/Has-Needs-Spec-v1.md) and surface the ambiguity.

## What makes Has-Needs unusual

Has-Needs begins with **a sovereign participant**, not a system administrator, corporate tenant, account database, or cloud platform. The minimal semantic triplet `[entity, relation, context]` has exactly three relation values: `HAS`, `NEED`, `WORKING`. A Need is a participant-owned, addressable desired outcome with satisfaction conditions, not simply a search query or a product request. A Has is a capability with constraints; it can be knowledge, time, service, transport, water, attention, access, or material goods. Mutual authorization moves participating objects into a Working relationship, and accepted actual exchange can be proved through a shared canonical receipt and distinct entries in participant-local chains.

Semantic discovery uses **partial information with staged disclosure**. The network may help find compatible objects without receiving their protected semantics or acquiring authority over them. Community coordination is a relationship among sovereign participants, not a transfer of ownership to a group.

The purpose is not to collect a perfect inventory, but to help people resolve real needs and learn, locally and with provenance, **what worked**. Disaster, intermittent connectivity, low literacy and distrust of institutions are baseline design constraints, not edge cases to bolt on after launch.

## Anti-patterns and replacements

| This is **NOT**… | Conventional shortcut to reject | Instead, test… |
| --- | --- | --- |
| A two-sided marketplace | `users`, `listings`, `orders` in one authoritative server; all products globally searchable | Independent sovereign Has/Need objects, reciprocal discovery, owner-scoped views and consented projection |
| A resource-management dashboard | Privileged `getAllNeeds()` across the network, even under an “emergency admin” role | Consent-scoped aggregation and per-owner visibility without a universal inventory |
| A cloud-first SaaS account system | Identity rooted in an institution's user table; loss of login makes a person or their history disappear | Participant-controlled continuity/personas; provider-independent objects and local authority |
| A normal social network or rating app | Friends/followers as a mandatory identity graph; ratings or AI fraud scores stored as universal truth | Live, relationship-specific evidence, grey-list and personal filters, user choice; no universal stored trust score |
| A single global blockchain | Shared ledger of all bids, browsing, failed proposals and movements | Canonical bilateral receipt plus separate personal chain entries; only authorized durable evidence |
| A centralized ontology or taxonomy | Demand all entries fit standardized product categories before discovery | Locally meaningful semantic namespaces, provisional resolution criteria, receipt-derived evidence, translation at boundaries |
| An AI negotiation authority | Match engine unilaterally accepts deals because confidence is high | Humans accept shared terms, or an explicitly authorized bounded delegation; distinguish proposal from commitment |
| A traditional CRUD lifecycle | Add `PENDING`, `SPENT`, `COMPLETE`, `FLOATING` as protocol relation values | Keep `HAS | NEED | WORKING`; describe availability, lineage and outcomes in the appropriate fields/events |
| A message broker that owns messages | Relay stores readable personal details and creates an authoritative centralized mirror | Route permitted semantic rind/overlays; make protected-payload boundaries testable |
| Privacy by presentation | UI hides exact location while raw requests send it to a relay | Recipient-, purpose-, field- and relationship-stage-limited OCA projection; mark encryption mocks |
| A feature-rich smartphone app | Treat globe/cloud/LLM/live API as a prerequisite to local exchange | Core exchange also works with constrained devices, delay, store-carry-forward, and human relay |
| An NGO/government service portal | Community or agency absorbs personal holdings when someone joins or requests aid | Aggregation without ownership transfer, optional membership, direct resolution preserved |
| A payment system | Every exchange needs dollars, tokens, wallet, checkout or fee | A Need seeks an outcome; exchange may be gift, barter, skill, access, information, payment, or other value |

## Failure-mode questions before selecting a library or data model

1. Who *owns* and may change this object? What remains valid when a server disappears?
2. Which party can enumerate which objects? Can any API accidentally become a network-wide catalog?
3. What precisely may Carol/the relay see, and could a debugger, index, cache or telemetry path expose more?
4. At which instant is a proposal authorized to enter `WORKING`? Can replay, partition or delayed delivery double-commit a quantity?
5. Which facts are retained permanently, by whom, and why? Is a failed match being silently persisted as reputation?
6. Can the same invariant hold when AI, internet, cloud, or high-bandwidth UI is unavailable?
7. Is the developer implementing **frozen V1** or an **explicitly proposed amendment**? Are the two kept separate?

## Innovation opportunities, not preselected solutions

- Represent consent/disclosure as inspectable state transitions rather than static UI toggles.
- Design semantic discovery that transmits a *minimum useful delta* without granting intermediaries full object visibility.
- Explore tiny portable schemas and transport adapters whose semantics survive interruption, high latency, relays and intermittent power.
- Use receipt evidence to evolve **local** semantic mappings without treating a declared taxonomy as absolute truth.
- Make permitted owner views and accessible representations (map, language, symbols, SMS, speech, terminal) alternative projections of the **same** sovereign underlying objects.
- Keep contract behavior composable and understandable to a nontechnical person; minimize primitives only when counterexamples show the reduction still holds.

**Do not claim these opportunities have been proven.** Explore them using synthetic actors, observable acceptance, explicit negative tests, and reversibility.

## Proposed October 8 contract changes: keep experimental

[CONTRACT_PRIMITIVES.md](https://github.com/Has-Needs/docs/blob/main/CONTRACT_PRIMITIVES.md) proposes stable Has identity with portion-level binding and a single deal/no-deal receipt shape (`1` exchange occurred, `0` accepted interaction closed without exchange; unresolved is neither). Those design proposals **conflict with or extend parts of frozen V1**, which presently models terminating Has lineage into a receipt and creating a new remainder Has in the reference example, and defaults to completed-exchange receipts. Do not silently change the V1 demonstrator to implement the proposal. A good experiment compares both approaches and their failure cases (parallel allocation, partial fulfillment, no-show, delayed resolution) before suggesting a specification amendment.

**Design test:** If the prototype could be mistaken for “a marketplace with a private database,” it has probably failed to demonstrate what makes Has-Needs interesting.
