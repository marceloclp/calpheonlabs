import { BsdReader, u32, type Bsd, type BsdAny, type BsdInfer } from "@marceloclp/bsd";
import { PazMeta } from "../../paz/paz-meta";

interface StreamOptions {
    /** If set to true, it will print when each row is decoded. */
    debug?: boolean;
}

interface DecodeIntoDiskOptions {
    /** Path to the BDO game files directory. */
    path?: string;
    /** If set to true, it will print when each row is decoded. */
    debug?: boolean;
}

interface RowType {
    /** Optional array counter schema, passed straight to array(). */
    counter?: Bsd<number>;
    /** The actual row type schema. */
    schema: BsdAny;
}

interface TableConfig<R extends Record<string, RowType>> {
    /** Path to the file, from inside the Paz/ directory. */
    path: string;
    /** Whether this is a PABR file and contains the PABR header. */
    pabr?: boolean;
    /** The row types defined in this table/file. */
    rows: R;
}

type Infer<R extends Record<string, RowType>, K extends keyof R = keyof R> = BsdInfer<R[K]["schema"]>;

export function table<R extends Record<string, RowType>>(options: TableConfig<R>): Table<R> {
    return new Table(options);
}

class Table<R extends Record<string, RowType>> {
    constructor(
        private readonly config: TableConfig<R>,
    ) { }

    get filename() {
        return this.config.path.split("/").at(-1)!;
    }

    async streamer(meta: PazMeta, opts?: StreamOptions): Promise<TableStream<R>> {
        const buffer = await meta.extract(this.config.path);
        const reader = new BsdReader(buffer);
        return new TableStream(opts, this.config, reader);
    }

    /*
     * Loads the table from the BDO game path, decodes it using
     * the provided row schema, and persists the results to disk
     * as a JSONL file.
     *
     * This is mostly used for debugging.
     */
    async decodeIntoDisk(opts?: DecodeIntoDiskOptions) {
        const file = Bun.file(`out/${this.filename}.jsonl`);
        if (await file.exists()) {
            await file.delete();
        }
        const writer = file.writer({
            highWaterMark: 1024 * 4024,
        });

        const meta = await PazMeta.load(opts?.path);
        const streamer = await this.streamer(meta, opts);

        for (const row of streamer.all()) {
            await writer.write(serialize(row));
            await writer.write("\n");
        }

        await writer.end();
    }
}

class TableStream<R extends Record<string, RowType>> {
    constructor(
        private readonly options: StreamOptions = {},
        private readonly config: TableConfig<R>,
        private readonly reader: BsdReader,
    ) {
        this.prepare();
        this.filename = fname(this.config.path);
    }

    private readonly filename: string;

    /**
     * Since the length of each row is dynamic, and we abstain
     * from using the offset tables, we must decode rows sequentially
     * as they appear in the buffer.
     *
     * We need to keep track of each rows we have already fully
     * decoded, so we know whether we can decode a certain row
     * type (the internal reader has advanced its byte offset).
     */
    private consumedIndex = 0;

    private readonly offsets: Partial<Record<keyof R, number[]>> = {};

    private debug(...args: any[]) {
        if (this.options.debug) {
            console.log(`[${this.filename}]:`, ...args);
        }
    }

    private prepare() {
        this.reader.byteOffset = 0;
        this.consumedIndex = 0;

        if (this.config.pabr) {
            // Skip the PABR header for PABR files:
            this.reader.byteOffset += 4;
        }
    }

    *rows<const K extends keyof R>(rowKey: K): Generator<Infer<R, K>> {
        const row = this.config.rows[rowKey];
        if (!row) throw new Error(`Invalid row key: ${String(rowKey)}`);

        const rowKeys = keys(this.config.rows);
        const index = rowKeys.indexOf(rowKey);

        // Ensure the internal reader is at the right byte offset
        // before starting to parse the items in a row type entry:
        for (; this.consumedIndex < index; this.consumedIndex++) {
            this.rows(rowKeys[this.consumedIndex]!).forEach(() => { });
        }

        const counter = row.counter ?? u32();
        const n = counter.read(this.reader);

        this.offsets[rowKey] ??= [];
        for (let i = 0; i < n; i++) {
            this.debug(String(rowKey), "-", i + 1, "/", n);

            // Generate an offset table for comparison against the real offset tables:
            this.offsets[rowKey].push(this.reader.byteOffset);

            yield row.schema.read(this.reader);
        }

        this.consumedIndex++;
    }

    /**
     * Decodes all row types sequentially. This is mostly useful
     * when persisting the table into a JSONL file for inspection.
     */
    *all(): Generator<Infer<R>> {
        this.prepare();

        for (const k in this.config.rows) {
            yield* this.rows(k);
        }
    }
}

function keys<const T extends Record<string, any>>(obj: T): (keyof T)[] {
    return Object.keys(obj);
}

function serialize(v: any) {
    return JSON.stringify(v, (_, x) => {
        switch (typeof x) {
            // Serialize bigints as strings for introspection:
            case "bigint": return x.toString();
        }
        return x;
    }, 4);
}

function fname(path: string) {
    return path.split("/").at(-1)!
}
