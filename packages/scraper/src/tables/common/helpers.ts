import { join } from "node:path/posix";

import { type BsdShape, type BsdStruct, bytes, struct } from "@marceloclp/bsd";
import { JsonStreamStringify } from "json-stream-stringify";

import { PAZ } from "../../paz/archive";

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
                 * The signature is framing rather than table data, so the
                 * reserved byte range is intentionally absent from output.
                 */
                magic: bytes(4)
                    .check(
                        (value) =>
                            value[0] === 0x50 &&
                            value[1] === 0x41 &&
                            value[2] === 0x42 &&
                            value[3] === 0x52,
                    )
                    .reserved(),
                ...shape,
            }),
        );
    };
}

class Table<S extends BsdShape> {
    constructor(
        /** File name (with extension). */
        private readonly name: string,
        private readonly schema: BsdStruct<S>,
    ) {}

    async load(bdoPath = Bun.env.BDO_GAME_PATH) {
        const meta = await PAZ.readMeta(bdoPath);
        const entry = meta.find((entry) => {
            const path = join(entry.folderName, entry.fileName);
            return this.name === entry.fileName || this.name === path;
        });

        if (!entry) {
            throw new Error(`File not found: ${this.name}`);
        }

        const buffer = await PAZ.extract(entry, bdoPath);
        const decoded = this.schema.decode(buffer);

        const path = join(entry.folderName, entry.fileName);
        const file = Bun.file(`out/${path.split("/").at(-1)}.json`);
        await file.write("");
        const sink = file.writer({ highWaterMark: 1024 * 1024 });
        const stream = new JsonStreamStringify(decoded, undefined, 4);
        for await (const chunk of stream) {
            await sink.write(chunk);
        }
        await sink.end();
    }

    async extract(bdoPath = Bun.env.BDO_GAME_PATH) {
        const meta = await PAZ.readMeta(bdoPath);
        const entry = meta.find((entry) => {
            const path = join(entry.folderName, entry.fileName);
            return this.name === entry.fileName || this.name === path;
        });

        if (!entry) {
            throw new Error(`File not found: ${this.name}`);
        }

        return await PAZ.extract(entry, bdoPath);
    }
}

// /** No header/footer. No decryption required. */
// class Dbss<S extends BsdShape> {
//     constructor(
//         /** File path. */
//         private readonly path: string,
//         private readonly schema: BsdStruct<S>,
//     ) {}

//     async load(bdoPath = Bun.env.BDO_GAME_PATH) {
//         const meta = await PAZ.readMeta(bdoPath);
//         const entry = meta.find((entry) => {
//             return this.path === join(entry.folderName, entry.fileName);
//         });

//         if (!entry) {
//             throw new Error(`File not found: ${this.path}`);
//         }

//         const buffer = await PAZ.extract(entry, bdoPath);
//         const decoded = this.schema.decode(buffer);

//         const file = Bun.file(`out/${this.path.split("/").at(-1)}.json`);
//         await file.write("");
//         const sink = file.writer({ highWaterMark: 1024 * 1024 });
//         const stream = new JsonStreamStringify(decoded, undefined, 4);
//         for await (const chunk of stream) {
//             sink.write(chunk);
//         }
//     }
// }

// /** Has PABR header. */
// class Bss<S extends BsdShape> {
//     constructor(
//         private readonly path: string,
//         private readonly schema: BsdStruct<S>,
//     ) {}

//     async load(bdoPath = Bun.env.BDO_GAME_PATH) {
//         const meta = await PAZ.readMeta(bdoPath);
//         const entry = meta.find((entry) => {
//             return this.path === join(entry.folderName, entry.fileName);
//         });

//         if (!entry) {
//             throw new Error(`File not found: ${this.path}`);
//         }

//         const buffer = await PAZ.extract(entry, bdoPath);
//         const decoded = this.schema.decode(buffer);

//         const file = Bun.file(`out/${this.path.split("/").at(-1)}.json`);
//         await file.write("");
//         const sink = file.writer({ highWaterMark: 1024 * 1024 });
//         const stream = new JsonStreamStringify(decoded, undefined, 4);
//         for await (const chunk of stream) {
//             sink.write(chunk);
//         }
//     }
// }
