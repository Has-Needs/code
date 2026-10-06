# Has-Needs V1 Reference Implementation

This branch is the clean reference implementation for the Has-Needs V1 specification.

The previous implementation is preserved on `legacy-pre-v1`.

## Authority

The V1 specification is authoritative. This code exists to prove the architecture and produce conformance tests.

## First proof

The first implementation slice is intentionally small:

`NEED + HAS → candidate → mutual acceptance → WORKING → completion → canonical receipt`

No global inventory, no reputation score, no hidden authority.

## Principles

- `[ENTITY, RELATION, CONTEXT]` is the canonical semantic form.
- RELATION is exactly `HAS`, `NEED`, or `WORKING`.
- Has and Need are sovereign objects.
- Candidate matching is advisory; human acceptance is authoritative.
- WORKING is created only after mutual acceptance.
- Completion creates one canonical receipt shared by the participants.
- Owner-local enumeration is valid; unauthorized network-wide enumeration is not.
- Transport, trust, crypto, Persona/OCA, and UI attach to this lifecycle rather than redefining it.

## Run

```bash
npm install
npm test
```

## Structure

- `src/core` — canonical objects and lifecycle
- `src/sovereign` — owner-local storage
- `src/matching` — advisory candidate generation
- `tests` — conformance tests
- `demo-artifacts` — human-facing interaction designs
