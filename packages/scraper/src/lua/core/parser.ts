import {
    array,
    bytes,
    f64,
    literal,
    struct,
    u32,
    u64,
    u8,
    union,
    type Bsd,
    type BsdAny,
    type BsdInfer,
} from "@marceloclp/bsd";

function constType<T extends BsdAny>(type: number, schema: T) {
    return u8().is(type).pipe(schema);
}

/** A nullable-length Lua byte string with its stored null byte removed. */
const LuaString = u64()
    .lte(BigInt(Number.MAX_SAFE_INTEGER))
    .transform(Number)
    .pipe((length) =>
        length === 0
            ? literal("")
            : bytes(length)
                  .check((value, reader) => {
                      if (value.at(-1) !== 0) {
                          throw reader.fail(
                              "Lua string is not null-terminated",
                          );
                      }
                  })
                  .slice(0, -1)
                  .utf8(),
    );

/** Tagged constant variants supported by Lua 5.1 chunks. */
const LuaConst = union(
    constType(0, literal(null)),
    constType(
        1,
        u8().transform((x) => x !== 0),
    ),
    constType(3, f64()),
    constType(4, LuaString),
);

/** Lua local-variable debug metadata. */
const LuaLocal = struct({ name: LuaString, startPc: u32(), endPc: u32() });

export type LuaConst = BsdInfer<typeof LuaConst>;
export type LuaLocal = BsdInfer<typeof LuaLocal>;

export interface LuaPrototype {
    source: string;
    lineDefined: number;
    lastLineDefined: number;
    upvalueCount: number;
    parameterCount: number;
    isVararg: number;
    maxStackSize: number;
    code: number[];
    constants: BsdInfer<typeof LuaConst>[];
    prototypes: LuaPrototype[];
    lineInfo: number[];
    locals: LuaLocal[];
    upvalueNames: string[];
}

const LuaPrototype: Bsd<LuaPrototype> = struct({
    source: LuaString,
    lineDefined: u32(),
    lastLineDefined: u32(),
    upvalueCount: u8(),
    parameterCount: u8(),
    isVararg: u8(),
    maxStackSize: u8(),
    code: array(u32(), u32()),
    constants: array(u32(), LuaConst),
    prototypes: array(
        u32(),
        literal(null).pipe(() => LuaPrototype),
    ),
    lineInfo: array(u32(), u32()),
    locals: array(u32(), LuaLocal),
    upvalueNames: array(u32(), LuaString),
});

/** The exact Lua 5.1 binary ABI emitted by the supported BDO client. */
const Lua51Chunk = struct({
    signature: bytes(4).ascii().is("\x1bLua"),
    version: u8().is(0x51),
    format: u8().is(0),
    littleEndian: u8().is(1),
    intWidth: u8().is(4),
    sizeTWidth: u8().is(8),
    instructionWidth: u8().is(4),
    numberWidth: u8().is(8),
    integralNumbers: u8().is(0),
    root: LuaPrototype,
}).transform(({ root }) => inherit(root));

/** Applies Lua's empty-source inheritance rule to a prototype tree. */
function inherit(prototype: LuaPrototype, parentSource = "") {
    prototype.source = prototype.source || parentSource;
    prototype.prototypes.forEach((x) => inherit(x, prototype.source));
    return prototype;
}

/**
 * Decodes a compiled Lua 5.1 chunk using the BDO client's binary ABI.
 * Plain-text `.lua` source is outside this parser's scope.
 */
export function parseLua51(buffer: Uint8Array): LuaPrototype {
    return Lua51Chunk.decode(buffer, { strict: true });
}
