import { describe, expect, test } from "bun:test";
import type { PazMeta } from "../../paz/paz-meta";
import { LuaReference, LuaTable, type LuaValue } from "../core/runtime";
import { abc, abx, encodeChunk } from "../core/test-helpers";
import { GlobalDefineCppEnumLuac } from "../global_define_cpp_enum.luac";
import { PanelTooltipStaticSlotLuac } from "../panel_tooltip_staticslot.luac";
import { serializeLuaData } from "./helpers";

describe("luac files", () => {
    test("bind each legacy Lua consumer to its archive path and decoder", async () => {
        const bytes = encodeChunk({
            source: "@fixture.lua",
            constants: ["Answer", 42],
            code: [abx(1, 0, 1), abx(7, 0, 0), abc(30, 0, 1, 0)],
            lineInfo: [1, 2, 3],
        });
        const paths: string[] = [];
        const meta = {
            async extract(path: string) {
                paths.push(path);
                return bytes;
            },
        } as PazMeta;

        const globals = await GlobalDefineCppEnumLuac.loadIntoMemory(meta);
        const tooltip = await PanelTooltipStaticSlotLuac.loadIntoMemory(meta);

        expect(globals.get("Answer")).toBe(42);
        expect(tooltip.source).toBe("@fixture.lua");
        expect(paths).toEqual([
            "luacscript/x64/include/global_define_cpp_enum.luac",
            "luacscript/x64/widget/tooltip/panel_tooltip_staticslot.luac",
        ]);
    });

    test("serializes reconstructed graphs with references and cycles", () => {
        const table = new LuaTable(1);
        table.entries.set("answer", 42);
        table.entries.set("self", table);
        const globals = new Map<string, LuaValue>([
            ["Root", table],
            ["Symbol", new LuaReference("external.value")],
        ]);

        expect(serializeLuaData(globals)).toEqual({
            Root: {
                answer: 42,
                self: { tableReference: 1 },
            },
            Symbol: { reference: "external.value" },
        });
    });
});
