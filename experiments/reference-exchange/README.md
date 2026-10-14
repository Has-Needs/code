# V1 reference exchange — planned prototype

**Status:** Planned fixture; **no functioning code or measured results yet**.

**Question:** Can two participants complete an exchange while Persona Managers keep their underlying personal chains permanently inaccessible to outward personas and counterparties?

**Sequence to prototype:** A user-created professional persona (Bob the Builder) and a customer accept a match; the associated Has and Need enter `WORKING` while the Need's conditions execute. Both independently mark completion. Each independently contributes optional metadata and chooses plaintext or encryption; both see the other's words and exposure settings without gaining editorial control. Each marks **Not ready / Ready to commit** on the same complete transaction and communication record. The Persona Managers write identical canonical receipts to private chains; matching hashes establish completion without an extra “verified” label. Bob's separate social persona remains unlinkable through the protocol.

- [Illustrative input fixture](./data/scenario.json)
- [Implementation status](./code/README.md)
- [Results status](./results/README.md)

**Non-goals of first test:** Production encryption, deployed peer network, fully adversarial identity system, legal enforceability or production key recovery. The fixture is invented test input, not a measured result.
