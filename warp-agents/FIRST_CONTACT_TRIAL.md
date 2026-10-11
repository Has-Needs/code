# First-contact Warp architecture comprehension trial

**Goal:** Measure whether Warp understands Has-Needs with little prompting, how it changes when given project philosophy, and whether it invents conventional infrastructure. This is a **design-only diagnostic**; it is not a request to generate code. The result should improve our shared design context, not produce disconnected prototype fragments.

## Before the trial

Use two **fresh, separate Warp agent conversations** with no shared conversation history. The same architecture question is used both times; the context is the variable. Do not use this file, the rubric, or project rules as input to the unprimed run. Save the outputs and exact model/agent/version if known. A single comparison is informative, not a statistically reliable estimate of Warp's general behavior.

### Run A — first contact, unprimed

Run **outside any Has-Needs repository**, in a clean scratch working directory with no Has-Needs project/global rules or skills applied. Do not point Warp to the repo, specs, README, or this document. Use only the following prompt:

> I am designing a sovereign coordination protocol called Has-Needs. People own independently addressable Has and Need objects; mutual agreement binds them into Working, and a completed exchange gives the two participants a matching receipt held in their separate histories. People should find one another without a service owning the full inventory. Assume connectivity is intermittent. Before any code, explain the architecture you infer, what you would need to know, the key modular interfaces and the first coherent executable milestone. Propose choices, but do not create files or execute commands.

### Run B — architecture-guided

Open a **fresh conversation inside the Has-Needs/code checkout on the `agent-guidance-v1-warp` branch** (or the reviewed merged branch, later), with the root `WARP.md`, project skill and companion docs available. Ask Warp to confirm which rules and files it actually loaded. Then give the **identical prompt** from Run A; do not add hints.

If you want a third run, apply **only the canonical V1 spec** without the Warp guidance to help determine whether the difference is caused by general background context or agent-specific instructions.

## Score the whole architectural response once — not every fragment

Use 0 = absent or contrary; 1 = partially understood; 2 = correctly understood and tied to an engineering consequence. Maximum **20 points**:

| Dimension | What earns 2 points |
| --- | --- |
| Participant sovereignty | Specifies issuer-controlled objects/authority rather than backend ownership |
| Discovery | Avoids global enumeration, proposes scoped semantic discovery |
| Consent and Working | Requires matching authorizations; distinguishes proposal from active obligation |
| Receipt evidence | Distinguishes canonical counterpart receipt from independent participant-local chain entries |
| Semantic grammar | Keeps `HAS | NEED | WORKING` distinct from auxiliary lifecycle events |
| Privacy | Uses recipient/stage-specific projection; recognizes relay/metadata exposure |
| Offline/collapse behavior | Preserves basic semantics and idempotency across partition/delay |
| Cohesive modularity | Suggests stable cross-module semantic/authority contracts, not unrelated microservices |
| Cryptographic agility | Separates algorithm/version selection from continuity/proof meaning, considers PQ migration |
| Novelty with discipline | Identifies default SaaS traps and proposes simple valid mechanisms, not novelty for its own sake |

**Immediate disqualifiers:** a globally authoritative Has/Need inventory presented as the protocol, an intermediary acquiring participant ownership by default, AI silently accepting on behalf of people, or a universal permanent transaction ledger/reputation score. A response can be fluent and still be architecturally wrong.

## Record outcome

For each run capture: (a) exact prompt, agent/model version and active project rules if known, (b) transcript or response, (c) the ten dimension scores with one quoted piece of evidence each, (d) any disqualifying assumptions, and (e) what novel insight Warp added that we had not considered. Highlight hypotheses rather than turning one plausible answer into specification.

## What to do next

Review **one integrated architecture map** before issuing coding tasks. Ask Warp to identify the semantic object, disclosure, agreement, receipt, local ontology, continuity/crypto, and transport seams in a single three-participant Alice–Bob–Carol exchange. Select a smallest executable loop that crosses all essential seams; do not spin up separate packages or tests for each question until the cross-module meaning is coherent.

After the baseline, give the guided Warp agent permission to implement **only** the selected vertical slice on a branch, then test the invariants end to end. Reuse the same shared fixtures and conformance suite as mechanisms evolve. This lets Warp exercise autonomy while we learn whether it is preserving the invention rather than normalizing it.
