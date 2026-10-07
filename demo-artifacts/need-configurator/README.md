# Need Configurator

**Status:** V1 demonstrator design brief; executable conformance remains to be demonstrated.  
**Protocol authority:** [Has-Needs Specification V1](https://github.com/Has-Needs/docs/blob/main/Has-Needs-Spec-v1.md)  
**Implementation milestone:** [Three-participant reference loop, issue #2](https://github.com/Has-Needs/code/issues/2)  
**Review baseline:** [V1 frozen expert-review branch](https://github.com/Has-Needs/docs/blob/spec-v1-expert-review-2026-10-05/Has-Needs-Spec-v1.md)

The Need Configurator is the human-facing mechanism for creating a sovereign `NEED` object without requiring the user to understand protocol structure.

V1 is the implementation cutover and the source of architectural authority. Existing code, including `src/components/NeedButton.tsx`, is historical exploratory material. It imposes no compatibility, component-reuse, schema, or migration requirement. A fresh implementation is permitted; any reuse is justified by V1 conformance and human usefulness.

This brief applies V1 to a bounded demonstrator. It does not amend the specification or claim that the existing code implements the flow.

## Design principle

The user describes a human situation.

The configurator progressively translates that description into:

`[entity, relation, context]`

For initial Need creation, `relation = NEED`, giving `[entity, NEED, context]`. The only protocol relation values are `HAS`, `NEED`, and `WORKING`.

The object also carries the operational constraints needed for matching, progressive disclosure, entry into `WORKING`, and completion.

The protocol grammar may be shown when useful, but the user should not need to understand it to create a valid Need.

## Interaction progression

### 1. What do you need?

Human prompt:

> What would make things better or resolve this?

Produces the initial `entity`.

Examples:
- potable water
- ride to clinic
- help repairing roof
- translation
- 24-hour rainfall data

### 2. What does resolved look like?

This establishes the desired outcome and preliminary satisfaction conditions.

Examples:

> Enough safe water for four people for one day.

> Arrival at the clinic before 14:00.

The Need describes the desired outcome rather than prescribing a provider.

### 3. What context matters?

Only ask for factors that materially affect matching.

Possible context:
- quantity;
- time / urgency;
- compatibility;
- accessibility;
- transport;
- language;
- skill/certification;
- acceptable substitutions;
- broad spatial scope.

Context should be expandable rather than mandatory.

### 4. What alternatives would work?

This seeds declared semantic expectations, not evidence that an exchange has succeeded.

For example, a Need for `potable water` may accept:
- bottled drinking water;
- filled food-safe jugs;
- a verified refill point.

If those alternatives produce successful exchanges, the resulting relationships become useful local semantic evidence.

### 5. Who may discover this?

The Need begins inside the Persona boundary.

Possible initial discovery scopes:
- local only;
- direct contacts;
- selected community;
- semantic Friend network;
- wider/public discovery.

These are illustrative policy choices, not new protocol primitives. Wider/public discovery means wider scoped semantic routing, not publication into a globally enumerable inventory. Across sovereign boundaries, candidates arise from semantic matching.

Discovery does not imply disclosure of every field. Owner-local views may enumerate all of the owner's Has, Needs, Working objects, and receipts; other holdings require an authorized scope.

### 6. Progressive disclosure

Sensitive dimensions should be controlled independently.

Illustrative location progression:

`no location`
→ `broad region`
→ `approximate area after plausible match`
→ `rendezvous after acceptance`
→ `exact location only if operationally required`

Each step is conditional on the owner's policy and explicit permission, not an automatic location reveal. OCA grants are scoped to the recipient, fields, purpose, and relationship stage. Precise location stays within the owner boundary unless operationally needed and authorized. Carol receives only permitted rind/overlay information; relaying an object grants no access to its protected payload. Completion retains only receipt fields authorized by contract/policy.

### 7. Plausible match

The user should be able to understand why a candidate Has appeared.

The interface can surface:
- semantic overlap;
- quantity/compatibility;
- temporal fit;
- broad proximity;
- required capability;
- other relevant context.

### 8. Acceptance boundary

A Need is independently addressable and smart-contract-like from creation, with provisional satisfaction conditions and optional value-exchange terms. Creating it does not establish a mutually accepted Working binding.

Alice and Bob must explicitly accept the same agreed terms. One party's acceptance alone cannot establish Working. Mutual acceptance creates a `working_id` referencing the Need and Has and transitions the participating objects' relations to `WORKING`. Committed objects or portions leave ordinary matching for the duration of the agreement. Match-specific communication attaches to this Working relationship.

The configurator should make the acceptance conditions understandable.

Example:
- quantity confirmed;
- arrival time agreed;
- container type acceptable.

### 9. Completion boundary

The user should understand what will count as completed value exchange.

The completion definition is agreed before the exchange. The receipt records what both participants attest actually occurred, rather than merely copying the original request.

Example:

> Four sealed water containers transferred and both participants confirm completion.

## Minimum three-participant demonstrator

Use one reproducible fixture: Alice needs 30 L of potable water; Bob has 100 L; Carol assists discovery as a semantic Friend node. The quantities are a demo fixture, not protocol constants.

| Step | Observable result |
| --- | --- |
| Create | Alice creates an independent Need; Bob creates an independent Has. Each has its V1 identifier, issuer reference, ontology namespace/token, and authenticity material. Preserve structured meaning independently of display text. |
| Discover | Carol routes permitted semantic information without owning either object or reading protected payload. Alice and Bob see a plausible candidate and the permitted evidence explaining the match. |
| Disclose | Each participant can inspect the fields granted to the other party. Carol's received projection is separately inspectable. |
| Accept | Alice and Bob separately accept the same terms. A pending or declined proposal does not establish Working. |
| Work | Both objects enter `WORKING` under one binding; the demo reserves the entire 100 L Has during this exchange to avoid concurrent allocation complexity. One exchange-specific message demonstrates communication attached to the binding. |
| Complete | Both participants confirm the agreed 30 L transfer. One canonical receipt records the Working reference, Need/Has references, actual value exchange, completion attestations, and resulting lineage. |
| Remember | Alice and Bob hold identical canonical receipt bytes or byte-equivalent canonical encodings and the same hash. Each appends its own local chain entry referencing that hash. |
| Remainder | The original 100 L Has lineage terminates into receipt evidence. A new 70 L Has has a new ID, the original Has as parent, and an originating receipt reference. The fulfilled Need's active lineage also terminates. |
| Learn | Local receipt-derived resolution evidence updates. Declared substitutions remain distinguishable from successful resolution evidence; neither becomes a stored personal trust score. |

Participant-local previous-chain pointers belong in local chain entries, never inside the shared canonical receipt. A participant's local timestamp or sequence must not cause their copy of the canonical receipt to differ.

Availability is the default for an unbound Has or Need, subject to owner policy. "Floating" is descriptive. Completion terminates active lineage into provenance; `FLOATING`, `COMPLETE`, and `SPENT` are not additional protocol relation values.

## Implementation freedom and boundaries

Choose the smallest implementation that demonstrates these semantics. A browser harness with isolated participant stores and explicit message delivery is one possible approach, not a required architecture. No existing component, library, transport, or data model is mandatory.

The configurator should:

- begin with the desired outcome and relevant context;
- offer optional value terms after the Need is expressed, without requiring payment, swap, a named provider, or an institutional category;
- keep satisfaction conditions available for every kind of Need;
- separate owner-local data from recipient-specific outbound projections;
- provide owner-scoped views and no privileged network-wide inventory;
- expose a development event trace of creation, routing, proposal, disclosure, acceptance, Working, completion, receipt hash, lineage, and local evidence updates.

The event trace is development observability, not a permanent shared behavioral log or protocol-wide inventory. Use synthetic fixture data and avoid logging protected raw payloads.

Label mocks and simulated security explicitly. A hidden UI field does not prove that a relay cannot read its payload. A semantic demonstration using mocked protection must not claim to establish the protected-relay security property.

## Acceptance and milestone scope

The bounded demonstration above is credible when a reviewer can execute the loop and verify:

- one acceptance cannot establish Working;
- committed resources cannot be matched again while reserved;
- Carol receives only authorized exposed information;
- unauthorized participant views and network-wide enumeration are unavailable;
- both participants finish with identical canonical receipt bytes/hash and valid local receipt pointers;
- the original Has terminates and the new remainder conserves quantity;
- only successful completion creates the corresponding receipt-derived resolution evidence.

This bounded loop alone does not complete [issue #2](https://github.com/Has-Needs/code/issues/2). That milestone additionally requires:

- live vetting evidence: first-order in-chain short-circuit subject to grey-list and personal-filter checks; visible second-/third-order cues and current hop depth; configurable stop depth with eight hops available; no stored numerical trust score;
- the Trust Kernel update state machine: expose version/fingerprint, detect stale/suspect state, wait for the next random eligible peer rather than automatically accepting replacement from the detecting counterparty, validate locally, activate only on success, and retain the current kernel on failure; the kernel itself may be transparently mocked;
- fully connected, Carol-offline, Bob-offline/reconnect, duplicate-delivery, and out-of-order slow-plane receipt/ontology synchronization scenarios;
- tests showing that redelivery does not duplicate completion effects, remainder creation, or local receipt-derived evidence, and that delayed synchronization converges without changing the canonical receipt.

Production cryptographic hardening, final Jitterbug/BLE transport, final globe UI, AI/Sattva integration, institutional integrations, and production deployment remain outside this first milestone, as specified in issue #2.

## V1 traceability

| Demonstrator requirement | Specification V1 |
| --- | --- |
| Triplet, independent objects, Working acceptance | Architectural invariants; §§2, 7–9 |
| Canonical receipt, local chain entries, remainder lineage | §§10–12; Appendix A |
| Declared semantics versus resolution evidence | §§14–16 |
| Owner-scoped views and non-enumerability | §19 |
| Live vetting and Trust Kernel refresh | §§23.1–23.2 |
| Persona/OCA and protected relay payload | §§22, 24–25, 32 |
| Match-specific communication | §36 |
| Three-participant loop and validation | §§49–52 |

## Refinement rule

Every iteration should answer:

**Did this make it easier for a human to express the Need while preserving more sovereignty?**

If a field exists primarily because the implementation wants it rather than because the human interaction requires it, reconsider the field.
