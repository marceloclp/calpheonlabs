import { join } from "node:path/posix";
import { bytes, struct } from "@marceloclp/bsd";
import type { BsdShape, BsdStruct } from "@marceloclp/bsd/src/bsd";
import { JsonStreamStringify } from "json-stream-stringify";
import { PAZ } from "../../paz/archive";

export function dbss(path: string) {
    return <S extends BsdShape>(shape: S) => {
        return new Dbss(path, struct(shape));
    };
}

export function bss(path: string) {
    return <S extends BsdShape>(shape: S) => {
        return new Bss(
            path,
            struct({
                /** Four-byte Pearl Abyss table signature. */
                magic: bytes(4).ascii().is("PABR"),
                ...shape,
            }).omit({ magic: true }),
        );
    };
}

/** No header/footer. No decryption required. */
class Dbss<R extends BsdShape> {
    constructor(
        /** File path. */
        private readonly path: string,
        private readonly schema: BsdStruct<R>,
    ) {}

    async load(bdoPath = Bun.env.BDO_GAME_PATH) {
        const meta = await PAZ.readMeta(bdoPath);
        const entry = meta.find((entry) => {
            return this.path === join(entry.folderName, entry.fileName);
        });

        if (!entry) {
            throw new Error(`File not found: ${this.path}`);
        }

        const buffer = await PAZ.extract(entry, bdoPath);
        const decoded = this.schema.decode(buffer);

        const file = Bun.file(`out/${this.path.split("/").at(-1)}.json`);
        await file.write("");
        const sink = file.writer({ highWaterMark: 1024 * 1024 });
        const stream = new JsonStreamStringify(decoded, undefined, 4);
        for await (const chunk of stream) {
            sink.write(chunk);
        }
    }
}

/** Has PABR header. */
class Bss<R extends BsdShape> {
    constructor(
        private readonly path: string,
        private readonly schema: BsdStruct<R>,
    ) {}

    async load(bdoPath = Bun.env.BDO_GAME_PATH) {
        const meta = await PAZ.readMeta(bdoPath);
        const entry = meta.find((entry) => {
            return this.path === join(entry.folderName, entry.fileName);
        });

        if (!entry) {
            throw new Error(`File not found: ${this.path}`);
        }

        const buffer = await PAZ.extract(entry, bdoPath);
        const decoded = this.schema.decode(buffer);

        const file = Bun.file(`out/${this.path.split("/").at(-1)}.json`);
        await file.write("");
        const sink = file.writer({ highWaterMark: 1024 * 1024 });
        const stream = new JsonStreamStringify(decoded, undefined, 4);
        for await (const chunk of stream) {
            sink.write(chunk);
        }
    }
}
