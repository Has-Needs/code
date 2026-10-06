# Need Configurator

**Status:** Demo artifact / interaction prototype  
**Implementation anchor:** `src/components/NeedButton.tsx`  
**Protocol reference:** Has-Needs Specification V1

The Need Configurator is the human-facing mechanism for creating a sovereign `NEED` object without requiring the user to understand protocol structure.

The existing `NeedButton.tsx` is **Need Configurator v0**. It already captures useful interaction concepts:

- what is needed;
- descriptive details;
- location;
- exchange type;
- exchange-specific terms;
- explicit contract creation.

The goal is to refine this existing prototype rather than replace it.

## Design principle

The user describes a human situation.

The configurator progressively translates that description into:

`[ENTITY, NEED, CONTEXT]`

plus the operational constraints needed for matching, progressive disclosure, entry into `WORKING`, and completion.

The protocol grammar may be shown when useful, but the user should not need to understand it to create a valid Need.

## Interaction progression

### 1. What do you need?

Human prompt:

> What would make things better or resolve this?

Produces the initial `ENTITY`.

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

This seeds ontology naturally.

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

Discovery does not imply disclosure of every field.

### 6. Progressive disclosure

Sensitive dimensions should be controlled independently.

Illustrative location progression:

`no location`
→ `broad region`
→ `approximate area after plausible match`
→ `rendezvous after acceptance`
→ `exact location only if operationally required`

The existing v0 behavior of attaching coordinates directly should evolve into a disclosure policy.

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

The configurator should help the user understand what must be true before the relationship becomes `WORKING`.

Example:
- quantity confirmed;
- arrival time agreed;
- container type acceptable.

### 9. Completion boundary

The user should understand what will count as completed value exchange.

That completion definition becomes input to the canonical receipt.

Example:

> Four sealed water containers transferred and both participants confirm completion.

## V0 → V1 migration

| V0 behavior | V1 direction |
| --- | --- |
| `what` + `details` | explicit semantic `ENTITY / NEED / CONTEXT` model |
| exact coordinates attached to entry | progressive location disclosure policy |
| payment/services/swap as primary exchange types | value-exchange terms attached after the Need is expressed |
| provider name requested for service | describe required capability first; provider emerges through matching |
| smart contract created immediately | Need exists independently; binding emerges on accepted match / `WORKING` |
| `dataTriplet: { what, details, location }` | canonical readable `[entity, relation, context]` triplet |
| fixed form | progressive questions driven by relevant context |

## Demo goals

The demo should eventually let a reviewer:

1. press **I NEED**;
2. express a Need in ordinary language;
3. see the semantic triplet emerge;
4. add only the context that matters;
5. choose disclosure boundaries;
6. see plausible Has candidates and why they matched;
7. explicitly accept one;
8. watch the relation enter `WORKING`;
9. complete the exchange;
10. see the canonical receipt and resulting lineage/ontology update.

## Refinement rule

Every iteration should answer:

**Did this make it easier for a human to express the Need while preserving more sovereignty?**

If a field exists primarily because the implementation wants it rather than because the human interaction requires it, reconsider the field.
