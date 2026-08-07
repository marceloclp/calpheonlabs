import { describe, expect, test } from "bun:test";
import type { LuaConst, LuaPrototype } from "./parser";
import { inspectLuaAssignments, LuaReference, LuaTable } from "./runtime";
import { abc, abx, asbx, rkConstant } from "./test-helpers";

function prototype(
    code: number[],
    constants: LuaConst[] = [],
    overrides: Partial<LuaPrototype> = {},
): LuaPrototype {
    return {
        source: "@fixture.lua",
        lineDefined: 0,
        lastLineDefined: 0,
        upvalueCount: 0,
        parameterCount: 0,
        isVararg: 0,
        maxStackSize: 32,
        code,
        constants,
        prototypes: [],
        lineInfo: code.map((_, index) => 100 + index),
        locals: [],
        upvalueNames: [],
        ...overrides,
    };
}

function table(value: unknown): LuaTable {
    expect(value).toBeInstanceOf(LuaTable);
    return value as LuaTable;
}

function reference(value: unknown): LuaReference {
    expect(value).toBeInstanceOf(LuaReference);
    return value as LuaReference;
}

describe("inspectLuaAssignments", () => {
    test("reconstructs globals, tables, arithmetic, lists, and closures", () => {
        const constants: LuaConst[] = [
            "Table",
            "answer",
            6,
            7,
            "first",
            "second",
            "list",
            "nilValue",
            "Answer",
            "Function",
            "flag",
        ];
        const code = [
            abc(10, 0, 0, 0),
            abx(7, 0, 0),
            abx(1, 1, 1),
            abx(1, 2, 2),
            abx(1, 3, 3),
            abc(14, 2, 2, 3),
            abc(9, 0, 1, 2),
            abc(10, 4, 0, 0),
            abx(1, 5, 4),
            abx(1, 6, 5),
            abc(34, 4, 2, 1),
            abc(9, 0, rkConstant(6), 4),
            abc(3, 8, 8, 0),
            abc(9, 0, rkConstant(7), 8),
            abx(5, 11, 0),
            abc(6, 12, 11, rkConstant(1)),
            abx(7, 12, 8),
            abx(36, 13, 0),
            abx(7, 13, 9),
            abc(2, 14, 1, 0),
            abc(0, 15, 14, 0),
            abc(9, 0, rkConstant(10), 15),
            abc(30, 0, 1, 0),
            abx(1, 0, 2),
            abx(7, 0, 8),
        ];
        const child = prototype([abc(30, 0, 1, 0)]);

        const globals = inspectLuaAssignments(
            prototype(code, constants, { prototypes: [child] }),
        );
        const root = table(globals.get("Table"));
        const list = table(root.entries.get("list"));

        expect(root.entries.get("answer")).toBe(42);
        expect(root.entries.get("nilValue")).toBeNull();
        expect(root.entries.get("flag")).toBe(true);
        expect([...list.entries]).toEqual([
            [1, "first"],
            [2, "second"],
        ]);
        expect(globals.get("Answer")).toBe(42);
        expect(reference(globals.get("Function")).path).toBe("<function:0>");
    });

    test("models symbolic calls and unresolved equality materialization", () => {
        const constants: LuaConst[] = [
            "external",
            "argument",
            "Result",
            "left",
            "right",
            "Condition",
        ];
        const code = [
            abx(5, 0, 0),
            abx(1, 1, 1),
            abc(28, 0, 2, 2),
            abx(7, 0, 2),
            abx(5, 3, 3),
            abx(5, 4, 4),
            abc(23, 1, 3, 4),
            asbx(22, 0, 1),
            abc(2, 5, 0, 1),
            abc(2, 5, 1, 0),
            abx(7, 5, 5),
            abc(30, 0, 1, 0),
        ];

        const globals = inspectLuaAssignments(prototype(code, constants));

        expect(reference(globals.get("Result")).path).toBe(
            'external("argument")',
        );
        expect(reference(globals.get("Condition")).path).toBe(
            "(left == right)",
        );
    });

    test("keeps unresolved multiplication symbolic", () => {
        const constants: LuaConst[] = ["external", 2, "Product"];
        const code = [
            abx(5, 0, 0),
            abx(1, 1, 1),
            abc(14, 0, 0, 1),
            abx(7, 0, 2),
            abc(30, 0, 1, 0),
        ];

        const product = inspectLuaAssignments(prototype(code, constants)).get(
            "Product",
        );
        expect(reference(product).path).toBe("(external * 2)");
    });

    test("executes resolved comparisons and forward jumps", () => {
        const constants: LuaConst[] = [1, "Equal"];
        const code = [
            abx(1, 0, 0),
            abx(1, 1, 0),
            abc(23, 1, 0, 1),
            asbx(22, 0, 1),
            abc(2, 2, 0, 1),
            abc(2, 2, 1, 0),
            abx(7, 2, 1),
            abc(30, 0, 1, 0),
        ];

        expect(
            inspectLuaAssignments(prototype(code, constants)).get("Equal"),
        ).toBe(true);
    });

    test("supports symbolic table keys used by client enum name maps", () => {
        const constants: LuaConst[] = ["externalKey", "Names", "label"];
        const code = [
            abc(10, 0, 0, 0),
            abx(5, 1, 0),
            abc(9, 0, 1, rkConstant(2)),
            abx(7, 0, 1),
            abc(30, 0, 1, 0),
        ];

        const names = table(
            inspectLuaAssignments(prototype(code, constants)).get("Names"),
        );
        expect(names.entries.get("[externalKey]")).toBe("label");
    });

    test("reports unsupported opcodes and forms with instruction context", () => {
        expect(() =>
            inspectLuaAssignments(prototype([abc(12, 0, 0, 0)])),
        ).toThrow(
            "@fixture.lua:100, pc 0, ADD (12, A=0, B=0, C=0): opcode is not supported",
        );

        expect(() =>
            inspectLuaAssignments(
                prototype([abx(5, 0, 0), abc(28, 0, 0, 2)], ["external"]),
            ),
        ).toThrow("variable-arity or variable-result calls are not supported");

        expect(() =>
            inspectLuaAssignments(
                prototype([abx(5, 0, 0), abc(28, 0, 1, 3)], ["external"]),
            ),
        ).toThrow("multiple call results are not supported");

        expect(() =>
            inspectLuaAssignments(prototype([asbx(22, 0, -1)])),
        ).toThrow("backward jumps are not supported");

        expect(() =>
            inspectLuaAssignments(
                prototype(
                    [abx(5, 0, 0), abx(5, 1, 1), abc(23, 1, 0, 1)],
                    ["left", "right"],
                ),
            ),
        ).toThrow("unresolved equality controls a truncated branch");
    });
});
