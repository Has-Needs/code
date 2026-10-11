# Cryptographic agility and post-quantum migration — engineering guidance for Warp

**Status:** Engineering guidance for prototypes, not a cryptographic security claim or an amendment to Has-Needs Specification V1. The protocol aspires to post-quantum resilience but must not depend on an assumption that any one cryptographic construction will remain optimal forever.

## Why agility is an architectural requirement

Has-Needs expects sovereign participant continuity, independently verifiable objects, selective disclosure, local receipt chains, intermittent/low-bandwidth transport and decades-long provenance. A crypto primitive is an implementation mechanism; **proof meaning, authorization semantics and participant sovereignty are what must endure**. Algorithm substitution is therefore not a search-and-replace task: verification, identity continuity, encoding, signature sizes, device constraints, and trust anchors can all change.

Cryptographic agility is essential, but an arbitrary "plug-in crypto" API is insufficient. The surrounding protocol must say **which suite was used, what was signed, how it was encoded, under which domain and purpose, and which transition evidence establishes continuity when suites/keys change**.

## Required seams (conceptual interfaces, not prescriptions for one codebase)

- **Cryptographic suite identity and negotiation:** explicitly version suite and allowed operations, key/signature and digest encodings, canonicalization version, verification policy and capability metadata. Authenticate any negotiation so a downgrade cannot be silently chosen by a counterparty or relay.
- **Signing and verification:** operate on stable, domain-separated, canonically encoded protocol statements with explicit purpose (object declaration, Working authorization, receipt attestation, persona continuity, kernel update). Signatures are not interchangeable merely because their bytes have the same shape.
- **Confidentiality/key establishment:** independently selectable authenticated encryption and key establishment; keep authorized data projection/OCA distinct from the ciphertext mechanism. Ciphertext length and metadata may reveal information even when payload is encrypted.
- **Participant continuity and key change:** distinguish a participant's enduring control/continuity claim from a particular public key. Model authorized rotation, recovery, compromised/retired keys, transition signatures and an offline verification path. A historic signature is judged under its original suite and policy; a new signature never retroactively repairs an invalid old assertion without new attested evidence.
- **Receipt and lineage verification:** preserve canonical shared receipt semantics across algorithm migrations. Store enough suite/encoding identifiers to re-verify historic attestations when possible. New cryptographic wrappers or transition attestations must not silently rewrite the original shared receipt/hash.
- **Wire/storage adapters:** isolate variable-length keys, signatures, ciphertext and proofs from semantic object types. Benchmark packet size, CPU, memory, energy and store-carry-forward feasibility before selecting a suite for BLE/SMS-like constrained paths.
- **Trust and update channels:** Trust Kernel replacement and peer-led refresh require explicit independent authenticity and local validation. A future suite transition cannot be silently dictated by a detecting counterparty or centrally privileged endpoint.

## Post-quantum implementation discipline

1. For prototypes, use established, maintained libraries and versioned standards-based algorithms where suitable; do **not** invent cryptographic primitives.
2. Consider authenticated, downgrade-resistant hybrid migration where justified by threat model and current interoperability; do not assume any hybrid automatically provides every desired property.
3. Explicitly separate the **security target** (confidentiality window, authenticity lifetime, device capability, adversary, compromise recovery) from the **candidate implementation** (PQC signature/KEM/hash/cipher library).
4. A protocol must be testable with a mock crypto adapter, but **passing a mock does not establish real confidentiality, authenticity, Sybil resistance or post-quantum security**.
5. Record which properties remain theoretical or untested. Threat-model and independently review any production security selection.

## Conformance questions for a replacement suite

- Can old signed Has/Need/Working claims and canonical receipts still be interpreted and independently validated under their original stated policy?
- Can a new key establish continuity without letting the storage service, relay, or key directory impersonate the person?
- Can peers reject downgrade attacks and obsolete suites while still processing archival evidence and intermittently connected devices?
- Do larger ciphertexts and proofs degrade toward constrained transport, rather than changing who owns or authorizes data?
- Does an OCA projection disclose the same allowed information regardless of whether the cipher/KEM changes?
- Can future independently held personal chains interoperate with other participants across mixed-suite versions?

**Engineering principle:** Make cryptographic implementations replaceable, but make proof interpretation, transcript binding, authority and provenance explicit. Do not describe Has-Needs as “post-quantum secure” until a defined and reviewed implementation profile warrants it.
