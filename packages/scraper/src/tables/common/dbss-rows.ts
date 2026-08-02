import { closeSync, openSync, writeSync } from "node:fs";
import { join } from "node:path/posix";
import {
    array,
    offset,
    struct,
    u32,
    type Bsd,
    type BsdShape,
} from "@marceloclp/bsd";
import { PAZ } from "../../paz/archive";

/** Serializes byte views in the tagged base64 form used by snapshot proofs. */
function snapshotJsonReplacer(_key: string, value: unknown) {
    if (value instanceof Uint8Array) {
        return { $bytes: Buffer.from(value).toString("base64") };
    }
    return value;
}

/**
 * A count-framed DBSS row table whose CLI writer decodes one row at a time.
 *
 * The ordinary complete schema remains available for consumers and strict
 * snapshot harnesses. Streaming applies the same complete row schema to a
 * detached adaptive frame and records its terminal offset, avoiding retention
 * of multi-gigabyte decoded object graphs while preserving intrinsic row
 * framing.
 */
class DbssRowTable<Row extends BsdShape> {
    /** Complete count-framed schema retained for strict verification. */
    readonly schema;

    /** Execution-only row wrapper exposing consumed bytes for adaptive frames. */
    private readonly streamingRowSchema;

    constructor(
        /** Archive-relative DBSS path. */
        private readonly name: string,
        /** Complete intrinsic schema for one physical row. */
        rowSchema: Bsd<Row>,
    ) {
        this.schema = struct({ rows: array(u32(), rowSchema) });
        this.streamingRowSchema = struct({
            row: rowSchema,
            byteLength: offset(),
        });
    }

    /** Extracts the table bytes without decoding them. */
    async extract(bdoPath = Bun.env.BDO_GAME_PATH) {
        const meta = await PAZ.readMeta(bdoPath);
        const entry = meta.find((candidate) => {
            const path = join(candidate.folderName, candidate.fileName);
            return this.name === candidate.fileName || this.name === path;
        });
        if (!entry) throw new Error(`File not found: ${this.name}`);
        return await PAZ.extract(entry, bdoPath);
    }

    /**
     * Decodes and writes rows incrementally so the complete object graph is
     * never retained in memory.
     */
    async load(bdoPath = Bun.env.BDO_GAME_PATH, outputPath?: string) {
        const buffer = await this.extract(bdoPath);
        const rowCount = u32().decode(buffer.slice(0, 4), { strict: true });
        let byteOffset = 4;
        const path = this.name.split("/").at(-1)!;
        const output = openSync(outputPath ?? `out/${path}.json`, "w");

        let bufferedJson = '{"rows":[';
        try {
            for (let index = 0; index < rowCount; index++) {
                let frameByteLength = 8 * 1024;
                let decoded: { byteLength: number; row: Row };
                while (true) {
                    const end = Math.min(
                        buffer.length,
                        byteOffset + frameByteLength,
                    );
                    try {
                        decoded = this.streamingRowSchema.decode(
                            buffer.slice(byteOffset, end),
                        );
                        break;
                    } catch (error) {
                        if (end === buffer.length) {
                            throw new Error(
                                `row ${index} failed to decode through EOF`,
                                { cause: error },
                            );
                        }
                        frameByteLength *= 2;
                    }
                }
                let row: Row | undefined = decoded.row;
                byteOffset += decoded.byteLength;
                if (index > 0) bufferedJson += ",";
                bufferedJson += JSON.stringify(row, snapshotJsonReplacer);
                row = undefined;
                if (bufferedJson.length >= 1024 * 1024) {
                    writeSync(output, bufferedJson, undefined, "utf8");
                    bufferedJson = "";
                }
            }
            if (byteOffset !== buffer.length) {
                throw new Error(
                    `unexpected ${buffer.length - byteOffset} bytes remaining`,
                );
            }
            writeSync(output, `${bufferedJson}]}\n`, undefined, "utf8");
        } finally {
            closeSync(output);
        }
    }
}

/** Creates a DBSS table with an intrinsic schema and row-streaming CLI load. */
export function dbssRows<const Row extends BsdShape>(
    path: string,
    rowSchema: Bsd<Row>,
) {
    return new DbssRowTable(path, rowSchema);
}
