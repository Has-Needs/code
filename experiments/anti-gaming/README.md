# Anti-gaming and relationship vetting

**Status:** Historical experiment; **not independently reproduced, not V1-conformant**.

Historical peer/receipt consistency simulation with Sybil behavior, grey-listing and scored trust. Its numeric reputation scores and 20-hop logic conflict with V1 event-only vetting and eight-hop reference depth.

This folder contains:
- [Original simulation code](./code/simulation.py) (copied unchanged)
- [Data availability](./data/README.md) and [claimed legacy metrics](./data/reported_metrics.json)
- [Legacy report excerpt](./results/legacy_report_excerpt.md) and [reproducibility assessment](./results/README.md)

**What to do next:** Reframe the test around the [V1 specification](https://github.com/Has-Needs/docs/blob/main/Has-Needs-Spec-v1.md), define a repeatable fixture and save raw outputs here. Claims in the old report are **historical claims**, not verified measurements made from this checked-in script.

The script also remains at its [original location](../../simulations/anti_gaming.py); the duplicate at `protocol/simulations/` remains for existing references.
