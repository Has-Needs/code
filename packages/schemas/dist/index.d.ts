declare const Persona_base: import("@dxos/echo-schema").EchoSchemaClass<{
    name: string;
    publicKey: string;
} & {
    id: string;
}>;
export declare class Persona extends Persona_base {
}
declare const Has_base: import("@dxos/echo-schema").EchoSchemaClass<{
    title: string;
    description: string;
    locationContext: string;
    contentCid: string;
} & {
    id: string;
}>;
export declare class Has extends Has_base {
}
declare const Need_base: import("@dxos/echo-schema").EchoSchemaClass<{
    title: string;
    description: string;
    locationContext: string;
} & {
    id: string;
}>;
export declare class Need extends Need_base {
}
declare const Match_base: import("@dxos/echo-schema").EchoSchemaClass<{
    hasId: string;
    needId: string;
    timestamp: string;
    status: string;
    encryptedReceipt: string;
} & {
    id: string;
}>;
export declare class Match extends Match_base {
}
export {};
