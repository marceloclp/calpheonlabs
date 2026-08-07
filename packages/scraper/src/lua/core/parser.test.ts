import { describe, expect, test } from "bun:test";
import { parseLua51 } from "./parser";
import { abc, ByteWriter, encodeChunk } from "./test-helpers";

describe("parseLua51", () => {
    test("decodes constants, debug data, and recursive prototypes", () => {
        const bytes = encodeChunk({
            source: "@root.lua",
            lineDefined: 1,
            lastLineDefined: 20,
            upvalueCount: 1,
            parameterCount: 2,
            isVararg: 2,
            maxStackSize: 8,
            code: [abc(30, 0, 1, 0)],
            constants: [null, false, true, 42.5, "hello"],
            prototypes: [
                {
                    source: null,
                    lineDefined: 5,
                    lastLineDefined: 7,
                    code: [abc(30, 0, 1, 0)],
                    lineInfo: [7],
                    locals: [{ name: "child", startPc: 0, endPc: 1 }],
                    upvalueNames: ["parent"],
                },
            ],
            lineInfo: [20],
            locals: [{ name: "argument", startPc: 0, endPc: 1 }],
            upvalueNames: ["environment"],
        });

        const result = parseLua51(bytes);

        expect(result).toMatchObject({
            source: "@root.lua",
            lineDefined: 1,
            lastLineDefined: 20,
            upvalueCount: 1,
            parameterCount: 2,
            isVararg: 2,
            maxStackSize: 8,
            constants: [null, false, true, 42.5, "hello"],
            lineInfo: [20],
            locals: [{ name: "argument", startPc: 0, endPc: 1 }],
            upvalueNames: ["environment"],
        });
        expect(result.prototypes[0]).toMatchObject({
            source: "@root.lua",
            lineDefined: 5,
            lastLineDefined: 7,
            lineInfo: [7],
            locals: [{ name: "child", startPc: 0, endPc: 1 }],
            upvalueNames: ["parent"],
        });
    });

    test("rejects incompatible headers, truncation, and trailing data", () => {
        const valid = encodeChunk({ source: "@root.lua" });
        const badSignature = valid.slice();
        badSignature[0] = 0;
        const badVersion = valid.slice();
        badVersion[4] = 0x52;
        const badAbi = valid.slice();
        badAbi[8] = 4;

        expect(() => parseLua51(badSignature)).toThrow();
        expect(() => parseLua51(badVersion)).toThrow();
        expect(() => parseLua51(badAbi)).toThrow();
        expect(() => parseLua51(valid.slice(0, -1))).toThrow();
        expect(() => parseLua51(Uint8Array.from([...valid, 0]))).toThrow(
            "unexpected 1 bytes remaining",
        );
    });

    test("rejects malformed string lengths and constant tags", () => {
        const missingStringBytes = new ByteWriter();
        missingStringBytes.raw([0x1b, 0x4c, 0x75, 0x61]);
        missingStringBytes.raw([0x51, 0, 1, 4, 8, 4, 8, 0]);
        missingStringBytes.u64(2n);
        missingStringBytes.u8(0x78);

        const unsafeLength = new ByteWriter();
        unsafeLength.raw([0x1b, 0x4c, 0x75, 0x61]);
        unsafeLength.raw([0x51, 0, 1, 4, 8, 4, 8, 0]);
        unsafeLength.u64(BigInt(Number.MAX_SAFE_INTEGER) + 1n);

        const invalidTerminator = encodeChunk({ source: "x" });
        invalidTerminator[21] = 1;

        expect(() => parseLua51(missingStringBytes.finish())).toThrow();
        expect(() => parseLua51(unsafeLength.finish())).toThrow();
        expect(() => parseLua51(invalidTerminator)).toThrow(
            "Lua string is not null-terminated",
        );
        expect(() =>
            parseLua51(
                encodeChunk({
                    source: "@root.lua",
                    constants: [{ tag: 99 }],
                }),
            ),
        ).toThrow();
    });
});
