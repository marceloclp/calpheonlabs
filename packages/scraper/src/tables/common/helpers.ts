import { type BsdShape, type BsdStruct, bytes, struct } from "@marceloclp/bsd";
import { JsonStreamStringify } from "json-stream-stringify";
import { PazMeta } from "../../paz/paz-meta";

export function dbss(path: string) {
    return <S extends BsdShape>(shape: S) => {
        return new Table<S>(path, struct(shape));
    };
}

export function bss(path: string) {
    return <S extends BsdShape>(shape: S) => {
        return new Table(
            path,
            struct({
                /**
                 * Validated four-byte Pearl Abyss table signature.
                 *
                 * The validated signature is retained in the decoded table so
                 * the complete non-byte representation remains visible.
                 */
                magic: bytes(4).ascii().is("PABR"),
                ...shape,
            }),
        );
    };
}

class Table<S extends BsdShape> {
    constructor(
        /** File name (with extension). */
        private readonly path: string,
        private readonly schema: BsdStruct<S>,
    ) { }

    /**
     * Loads the table from the BDO game path, decodes it using the
     * provided schema, and persists the result to disk.
     */
    async decodeIntoDisk(bdoPath = Bun.env.BDO_GAME_PATH) {
        const meta = await PazMeta.load(bdoPath);
        const buffer = await meta.extract(this.path);
        const decoded = this.schema.decode(buffer);

        const filename = this.path.split("/").at(-1)!.split(".").slice(0, -1).join(".");
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

    /**
     * Loads the table into memory.
     */
    async loadIntoMemory(meta: PazMeta) {
        const buffer = await meta.extract(this.path);
        return this.schema.decode(buffer);
    }

    async extract(bdoPath = Bun.env.BDO_GAME_PATH) {
        const meta = await PazMeta.load(bdoPath);
        return await meta.extract(this.path);
    }
}
