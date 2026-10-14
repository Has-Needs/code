# Has-Needs experiment index

One folder per experiment. **Code, input data/fixtures, report, limitations, and reproducibility instructions live together.** These status descriptions say only what has actually been checked into the repository.

| Experiment | Status | Evidence |
|---|---|---|
| [Reference exchange](./reference-exchange/README.md) | Planned; illustrative fixture only | Next V1 prototype: protected personas, `WORKING`, independent completion, metadata exposure, ready-to-commit and identical receipts |
| [Need Configurator](./need-configurator/README.md) | Planned; design fixture only | An intuitive front end for self-contained Need conditions and permissions |
| [Anti-gaming](./anti-gaming/README.md) | Historical; unverified | Python script, legacy reported metrics, methodological limitations |
| [Ontological efficiency](./ontological-efficiency/README.md) | Historical; incomplete | Placeholder benchmark script; reported metrics not reproducible |
| [Privacy robustness](./privacy-robustness/README.md) | Historical; incomplete | Empty interaction loop; reported “zero disclosures” not a validated result |

**Implementation starting point:** Has-Needs provides the graphical interface and an official, bounded vocabulary of basic contract primitives for giving, receiving, and exchange. Participants create their own Has, Need, and local ontology content using the provided controls; they do not design the visual environment or have to author contracts. Advanced custom contracts are separate extensions rather than new official primitives. The first Need Configurator should implement this ordinary graphical flow and retain its results in its own experiment directory. This remains planned, not demonstrated by the existing scripts.

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
