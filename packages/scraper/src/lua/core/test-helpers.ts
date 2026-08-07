import type { LuaConst } from "./parser";

type FixtureConstant = LuaConst | { tag: number };

export type PrototypeFixture = {
    source?: string | null;
    lineDefined?: number;
    lastLineDefined?: number;
    upvalueCount?: number;
    parameterCount?: number;
    isVararg?: number;
    maxStackSize?: number;
    code?: number[];
    constants?: FixtureConstant[];
    prototypes?: PrototypeFixture[];
    lineInfo?: number[];
    locals?: Array<{ name: string; startPc: number; endPc: number }>;
    upvalueNames?: string[];
};

export class ByteWriter {
    readonly values: number[] = [];

    u8(value: number) {
        this.values.push(value & 0xff);
    }

    u32(value: number) {
        const bytes = new Uint8Array(4);
        new DataView(bytes.buffer).setUint32(0, value, true);
        this.raw(bytes);
    }

    u64(value: bigint) {
        const bytes = new Uint8Array(8);
        new DataView(bytes.buffer).setBigUint64(0, value, true);
        this.raw(bytes);
    }

    f64(value: number) {
        const bytes = new Uint8Array(8);
        new DataView(bytes.buffer).setFloat64(0, value, true);
        this.raw(bytes);
    }

    raw(values: Iterable<number>) {
        this.values.push(...values);
    }

    finish() {
        return Uint8Array.from(this.values);
    }
}

const textEncoder = new TextEncoder();

function writeString(writer: ByteWriter, value: string | null) {
    if (value === null) {
        writer.u64(0n);
        return;
    }
    const encoded = textEncoder.encode(value);
    writer.u64(BigInt(encoded.length + 1));
    writer.raw(encoded);
    writer.u8(0);
}

function writeArray<T>(
    writer: ByteWriter,
    values: T[],
    write: (writer: ByteWriter, value: T) => void,
) {
    writer.u32(values.length);
    for (const value of values) write(writer, value);
}

function writeConstant(writer: ByteWriter, value: FixtureConstant) {
    if (typeof value === "object" && value !== null && "tag" in value) {
        writer.u8(value.tag);
    } else if (value === null) {
        writer.u8(0);
    } else if (typeof value === "boolean") {
        writer.u8(1);
        writer.u8(value ? 1 : 0);
    } else if (typeof value === "number") {
        writer.u8(3);
        writer.f64(value);
    } else {
        writer.u8(4);
        writeString(writer, value);
    }
}

function writePrototype(writer: ByteWriter, fixture: PrototypeFixture) {
    writeString(writer, fixture.source ?? null);
    writer.u32(fixture.lineDefined ?? 0);
    writer.u32(fixture.lastLineDefined ?? 0);
    writer.u8(fixture.upvalueCount ?? 0);
    writer.u8(fixture.parameterCount ?? 0);
    writer.u8(fixture.isVararg ?? 0);
    writer.u8(fixture.maxStackSize ?? 2);
    writeArray(writer, fixture.code ?? [], (output, value) =>
        output.u32(value),
    );
    writeArray(writer, fixture.constants ?? [], writeConstant);
    writeArray(writer, fixture.prototypes ?? [], writePrototype);
    writeArray(writer, fixture.lineInfo ?? [], (output, value) =>
        output.u32(value),
    );
    writeArray(writer, fixture.locals ?? [], (output, value) => {
        writeString(output, value.name);
        output.u32(value.startPc);
        output.u32(value.endPc);
    });
    writeArray(writer, fixture.upvalueNames ?? [], writeString);
}

/** Encodes an independent synthetic Lua 5.1 chunk for decoder tests. */
export function encodeChunk(root: PrototypeFixture) {
    const writer = new ByteWriter();
    writer.raw([0x1b, 0x4c, 0x75, 0x61]);
    writer.raw([0x51, 0, 1, 4, 8, 4, 8, 0]);
    writePrototype(writer, root);
    return writer.finish();
}

export function abc(opcode: number, a: number, b: number, c: number) {
    return (opcode | (a << 6) | (c << 14) | (b << 23)) >>> 0;
}

export function abx(opcode: number, a: number, bx: number) {
    return (opcode | (a << 6) | (bx << 14)) >>> 0;
}

export function asbx(opcode: number, a: number, sbx: number) {
    return abx(opcode, a, sbx + 131_071);
}

export function rkConstant(index: number) {
    return 256 + index;
}
