"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Match = exports.Need = exports.Has = exports.Persona = void 0;
const echo_schema_1 = require("@dxos/echo-schema");
const schema_1 = require("@effect/schema");
class Persona extends (0, echo_schema_1.TypedObject)({
    typename: 'has.needs.Persona',
    version: '0.1.0',
})({
    name: schema_1.Schema.String,
    publicKey: schema_1.Schema.String, // For verifiable identity and chain hopping
    // Add other persona-related fields here
}) {
}
exports.Persona = Persona;
class Has extends (0, echo_schema_1.TypedObject)({
    typename: 'has.needs.Has',
    version: '0.1.0',
})({
    title: schema_1.Schema.String,
    description: schema_1.Schema.String,
    locationContext: schema_1.Schema.String, // Abstracted location (e.g., Community ID)
    contentCid: schema_1.Schema.String, // IPFS CID for associated content (e.g., image, document)
    // Add other Has-related fields here
}) {
}
exports.Has = Has;
class Need extends (0, echo_schema_1.TypedObject)({
    typename: 'has.needs.Need',
    version: '0.1.0',
})({
    title: schema_1.Schema.String,
    description: schema_1.Schema.String,
    locationContext: schema_1.Schema.String, // Abstracted location (e.g., Community ID)
    // Add other Need-related fields here
}) {
}
exports.Need = Need;
class Match extends (0, echo_schema_1.TypedObject)({
    typename: 'has.needs.Match',
    version: '0.1.0',
})({
    hasId: schema_1.Schema.String,
    needId: schema_1.Schema.String,
    timestamp: schema_1.Schema.String, // ISO string for simplicity
    status: schema_1.Schema.String, // e.g., 'pending', 'accepted', 'completed', 'disputed'
    encryptedReceipt: schema_1.Schema.String, // Encrypted proof of financial transaction
    // Add other Match-related fields here
}) {
}
exports.Match = Match;
