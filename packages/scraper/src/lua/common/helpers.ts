import { JsonStreamStringify } from "json-stream-stringify";
import { PazMeta } from "../../paz/paz-meta";
import { parseLua51, type LuaPrototype } from "../core/parser";
import { LuaReference, LuaTable } from "../core/runtime";

type LuaTransform<T> = (prototype: LuaPrototype) => T;

/**
 * Binds a compiled Lua file to its archive path and optional decoded-value
 * transformation.
 */
export function luac(path: string): LuaFile<LuaPrototype>;
export function luac<T>(path: string, transform: LuaTransform<T>): LuaFile<T>;
export function luac<T>(
    path: string,
    transform: LuaTransform<T> = ((prototype) => prototype) as LuaTransform<T>,
) {
    return new LuaFile(path, transform);
}

class LuaFile<T> {
    constructor(
        /** Archive-relative file name, including the `.luac` extension. */
        private readonly path: string,
        private readonly transform: LuaTransform<T>,
    ) { }

    /** Decodes bytes already extracted from the archive. */
    decode(buffer: Uint8Array): T {
        if (buffer.length === 0) {
            throw new Error(
                `Lua archive entry ${this.path} is empty or missing.`,
            );
        }
        return this.transform(parseLua51(buffer));
    }

    /** Loads and decodes this Lua file using an existing archive index. */
    async loadIntoMemory(meta: PazMeta): Promise<T> {
        return this.decode(await meta.extract(this.path));
    }

    /** Extracts this Lua file without decoding it. */
    async extract(bdoPath = Bun.env.BDO_GAME_PATH) {
        const meta = await PazMeta.load(bdoPath);
        return await meta.extract(this.path);
    }

    /** Loads, decodes, and writes this Lua file to `out/<name>.json`. */
    async decodeIntoDisk(bdoPath = Bun.env.BDO_GAME_PATH) {
        const meta = await PazMeta.load(bdoPath);
        const decoded = await this.loadIntoMemory(meta);
        const filename = this.path
            .split("/")
            .at(-1)!
            .replace(/\.luac$/i, "");
        const file = Bun.file(`out/${filename}.json`);

        if (await file.exists()) {
            await file.delete();
        }

        const sink = file.writer({ highWaterMark: 1024 * 1024 });
        const stream = new JsonStreamStringify(
            serializeLuaData(decoded),
            undefined,
            4,
        );
        for await (const chunk of stream) {
            await sink.write(chunk);
        }
        await sink.end();
    }
}

/** Converts runtime Maps, tables, and references into cycle-safe JSON data. */
export function serializeLuaData(
    value: unknown,
    seenTables = new Set<number>(),
): unknown {
    if (value === null || typeof value !== "object") return value;

    if (value instanceof LuaReference) {
        return { reference: value.path };
    }

    if (value instanceof LuaTable) {
        if (seenTables.has(value.id)) return { tableReference: value.id };
        seenTables.add(value.id);
        return Object.fromEntries(
            [...value.entries]
                .sort(compareEntries)
                .map(([key, child]) => [
                    String(key),
                    serializeLuaData(child, seenTables),
                ]),
        );
    }

    if (value instanceof Map) {
        return Object.fromEntries(
            [...value.entries()]
                .sort(compareEntries)
                .map(([key, child]) => [
                    String(key),
                    serializeLuaData(child, seenTables),
                ]),
        );
    }

    if (Array.isArray(value)) {
        return value.map((child) => serializeLuaData(child, seenTables));
    }

    return Object.fromEntries(
        Object.entries(value).map(([key, child]) => [
            key,
            serializeLuaData(child, seenTables),
        ]),
    );
}

function compareEntries(
    [left]: readonly [unknown, unknown],
    [right]: readonly [unknown, unknown],
) {
    return String(left).localeCompare(String(right));
}
