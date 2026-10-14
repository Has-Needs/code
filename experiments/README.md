# Has-Needs experiment index

One folder per experiment. **Code, input data/fixtures, report, limitations, and reproducibility instructions live together.** These status descriptions say only what has actually been checked into the repository.

| Experiment | Status | Evidence |
|---|---|---|
| [Reference exchange](./reference-exchange/README.md) | Planned; illustrative fixture only | Next V1 prototype: protected personas, `WORKING`, independent completion, metadata exposure, ready-to-commit and identical receipts |
| [Need Configurator](./need-configurator/README.md) | Planned; design fixture only | An intuitive front end for self-contained Need conditions and permissions |
| [Anti-gaming](./anti-gaming/README.md) | Historical; unverified | Python script, legacy reported metrics, methodological limitations |
| [Ontological efficiency](./ontological-efficiency/README.md) | Historical; incomplete | Placeholder benchmark script; reported metrics not reproducible |
| [Privacy robustness](./privacy-robustness/README.md) | Historical; incomplete | Empty interaction loop; reported “zero disclosures” not a validated result |

**Foundational V1 test requirement:** A participant must be able to express an unfamiliar Need without any preloaded category or required written label, using their own local dialect or an accessible nonwritten mode. Human-curated interpretations can spread from a personal context into neighboring, authorized ontologies. This behavior is planned, **not demonstrated by the existing scripts**. The first Need Configurator prototype should test it and save actual outcomes under its directory.

## How experiment folders work

```text
experiments/<experiment>/
  README.md            # Question, status, method and how to inspect/run
  code/                # Only the code used by this experiment
  data/                # Fixtures, inputs, seeds or clearly marked missing data
  results/             # Outputs, report, source revision and limitations
```

**Planned** means no executable implementation or run. **Historical** means material is preserved, not necessarily reproduced. **Tested** would require a complete command, source revision, input data, environment and saved raw results. **V1-conformant** additionally requires specification conformance tests. No experiment here is labeled Tested or V1-conformant.

The scripts also remain at the former [simulations/](../simulations/) and [protocol/simulations/](../protocol/simulations/) paths for existing links. Those are **legacy duplicates**, not separate tests. The combined legacy report remains [here](../simulations/simulation_report.md) and is preserved by experiment in the individual results folders.
