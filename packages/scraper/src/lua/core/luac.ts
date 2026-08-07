import { JsonStreamStringify } from "json-stream-stringify";
import { PazMeta } from "../../paz/paz-meta";
import { parseLua51, type LuaPrototype } from "./parser";

type LuaTransform<T> = (prototype: LuaPrototype) => T;

export function luac(path: string) {
    return <T>(transform: LuaTransform<T>) => {
        return new LuaFile<T>(path, transform);
    }
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
        const prototype = parseLua51(buffer);
        return this.transform(prototype);
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

        const filename = this.path.split("/").at(-1)!;
        const file = Bun.file(`out/${filename}.json`);

        if (await file.exists()) {
            await file.delete();
        }

        const sink = file.writer({ highWaterMark: 1024 * 1024 });
        const stream = new JsonStreamStringify(decoded, undefined, 4);
        for await (const chunk of stream) {
            await sink.write(chunk);
        }
        await sink.end();
    }
}
