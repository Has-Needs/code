# Need Configurator

**Status:** V1 demo artifact

The Need Configurator is the human-facing path for producing a sovereign `NEED` without requiring the user to understand protocol syntax.

Human interaction:

`describe desired outcome → add relevant context → choose disclosure boundaries → create NEED`

Protocol result:

`[ENTITY, NEED, CONTEXT]`

The configurator should ask only for information that materially improves matching or later acceptance.

The first UI implementation should call `createNeed()` from the V1 core rather than creating a parallel Entry or SmartContract model.
