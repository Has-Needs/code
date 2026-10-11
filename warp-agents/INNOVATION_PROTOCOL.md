# Warp autonomous engineering protocol — Has-Needs

**Audience:** Warp agents working in `Has-Needs/code`. Read this along with `../WARP.md`, `THIS_IS_NOT.md`, the canonical V1 specification, and the relevant milestone. This document empowers independent engineering reasoning, rather than prescribing every coding step.

## The working agreement: freedom inside a membrane

Warp SHOULD independently choose libraries, test harnesses, code organization, transport adapters, reversible storage strategies, simulation tools, and iterative refactors **provided** its choices preserve Has-Needs invariants and are justified by evidence. Warp MUST NOT silently convert an invariant into a convenience assumption (e.g., "we'll centralize all Needs first and decentralize later"). A demonstrator that cheats a claimed security boundary is acceptable **only** if clearly labeled a mock and never presented as proof.

Use a **two-speed process**:
- **Within the membrane:** propose, implement, test, refine, and document routine engineering decisions without requesting approval for every file edit.
- **At the membrane:** stop and offer a crisp decision record when a proposed approach changes participant ownership, disclosure, receipt authority, acceptance semantics, normative state/contract rules, key continuity, network enumeration, or V1 conformance claims. Leave architecture/release decisions to the project lead.

## Agent loop

1. **Reconstruct the human situation.** What real-world Need is being met? What are the other participant's affordances and risks in a disaster or partition?
2. **Locate authority.** Quote the relevant V1 invariants/sections and identify non-normative design proposals separately. Do not treat the experimental repo as normative.
3. **List the default traps.** State at least one familiar architecture that would be tempting but destructive (for instance, a global listings database).
4. **Propose 2–3 mechanisms only if the choice is architectural.** Compare simplicity, disclosure surface, offline behavior, interoperability, reversibility, observability, and conformity to V1; choose the smallest defensible option.
5. **Write a falsifiable acceptance test first.** Negative cases are often more valuable than happy-path features.
6. **Implement a narrow end-to-end slice.** Prefer small commits and comprehensible object boundaries to broad scaffolding.
7. **Validate under adversity.** Test two-sided consent, duplicate/out-of-order messages, partitions, authorization boundaries, receipt equality, quantity conservation, local-only enumeration and relay visibility as applicable.
8. **Inspect your own work.** Ask whether an eager agent has slipped in a server, global index, stored reputation score, extra relation value, or unbounded location/payload visibility.
9. **Report in a durable decision record** and hand off a branch/PR for review.

## Required short decision record (in PR or `warp-agents/decisions/`)

- **Human result:** one sentence.
- **Source of authority:** V1 sections and exact ref/commit; named proposal if experimental.
- **Proposed mechanism:** explicit objects, authority and data flows.
- **Conventional mechanism avoided:** what was rejected and why.
- **Alternative and reversibility:** what can be replaced later, at what cost.
- **Evidence:** test names, commands and actual results; state failures honestly.
- **Boundary:** mocks, unsafe assumptions, privacy gaps, offline caveats, open questions.
- **Recommendation:** proceed, revise, or submit a normative design question.

The decision record exists to make reasoning auditable, not to turn every micro-edit into a meeting. Keep it brief.

## Recommended first autonomous assignment

Implement the smallest V1-aligned **three-participant reference loop** in a synthetic, isolated harness:
- Alice: independent `NEED`, 30 L potable water.
- Bob: independent `HAS`, 100 L.
- Carol: semantic Friend assisting scoped discovery without reading protected payload.
- Alice and Bob independently accept the same terms before `WORKING`.
- Completion yields exactly identical canonical receipt bytes/hash in both participants, each referenced from its own local chain entry.
- For the frozen V1 reference, ending original Has lineage and creating a 70 L remainder Has is required by the current demonstrator brief. Separately evaluate stable-identity portion allocation as an **October 8 proposal** if asked.
- Show owner-only enumeration, staged recipient disclosure, refusal of premature binding, duplicate delivery, out-of-order sync and delayed/disconnected participants.
- Display an **ephemeral synthetic development trace**, not a proposed global permanent activity ledger.

See `demo-artifacts/need-configurator/README.md` and https://github.com/Has-Needs/code/issues/2 for the complete acceptance milestone, including live vetting and Trust Kernel state machine. Do not mark issue #2 complete after only the bounded exchange loop.

## Tooling, safety and delegation

- Favor a **Git branch or isolated worktree per independently testable assignment**. If multiple agents are used, one owns a file/subsystem; others review/test without conflicting writes.
- Use Warp's structured `/plan` for architectural work; not every small command needs a plan. On a new checkout, index/initialize context and verify that root `WARP.md` and both companion documents were actually read. If Warp's automatic `/init` offers to generate `AGENTS.md`, don't allow generated generic rules to conflict with `WARP.md`.
- Use permissions that allow sandboxed reading/testing and reversible edits but require review for destructive operations, external network actions, secrets, force pushes and merges. **Do not enable unrestricted auto-approve without confirming effective denylist behavior.**
- Never place live participant data, precise location, secret keys or raw sensitive payloads in logs, issues, PRs, embeddings or examples. Synthetic fixtures by default.
- Do not add a dependency just to recreate standard marketplace semantics; document dependency, license and portability consequences. The repo is source-visible under restrictive license terms, not automatically open-source for copying/deployment.
- For complex changes use a **builder + adversarial reviewer** pattern: reviewer supplies counterexamples and checks invariants, not just coding style. Require tests with at least one deliberate attempt to falsify the proposal.
- Prefer **outcome gates** to a stream of tiny agent chores. A milestone is done when independently rerunnable evidence demonstrates the bounded human transaction, including a failure test; not when a UI screen or issue checklist looks complete.
- Keep implementation `0.x` until demonstrable V1 conformance. Mark simulated security and unstated assumptions explicitly.

## Escalate exactly these classes of uncertainty

- Is a proposed new contract primitive unavoidable, or can existing grammar express it?
- Should October 8 portion-level binding, no-deal receipts or Authorize/Bind/Resolve become an amendment to V1?
- Does a design need an intermediary who can enumerate, decrypt or authorize more than a participant expressly permits?
- Does an offline or recovery mechanism require new custody/continuity authority?
- Does an implementation conflict with two plausible readings of the canonical spec?

For each escalation, provide the smallest breaking example, two viable choices if available, and the recommended reversible experiment.

**Success is not the number of files Warp writes. It is the number of protocol claims we can test without hiding a conventional system underneath.**
