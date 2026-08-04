import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { inflateSync } from "node:zlib";
import { bytes, repeat, struct, u16, u32, u8 } from "@marceloclp/bsd";

/**
 * One desktop localization row shared by every locale.
 *
 * The identifiers select a string in the game's broad text namespace; joins to
 * item, NPC, dialogue, and UI tables are intentionally deferred.
 */
const LanguageDataRow = struct({
    /** Stored UTF-16 code-unit count for `text`, excluding its terminator. */
    textSize: u32().peek(),
    /** Namespace identifiers and text framed by the preceding code-unit count. */
    fields: u32().pipe((textSize) =>
        struct({
            /** Broad localization namespace or category code. */
            type: u32(),
            /** Primary identifier within the namespace selected by `type`. */
            id1: u32(),
            /** Secondary 16-bit localization variant identifier. */
            id2: u16(),
            /** Third localization variant byte. */
            id3: u8(),
            /** Fourth localization variant byte. */
            id4: u8(),
            /**
             * UTF-16 localized text without its four-byte serialized
             * terminator.
             */
            text: bytes(textSize * 2)
                .utf16()
                .pad(4),
        }),
    ),
}).transform(({ textSize, fields }) => ({ textSize, ...fields }));

/** Inflated localization payload as a count-less sequence of self-sized rows. */
const LanguageDataSchema = struct({
    /** Locale strings in their physical order, decoded until payload end. */
    rows: repeat(LanguageDataRow),
});

/**
 * Inflates and validates one desktop `.loc` compression envelope.
 *
 * @param input Compressed file bytes including the four-byte inflated-size
 *   header.
 * @returns The inflated localization payload.
 */
function decompressLanguageData(input: Uint8Array) {
    if (input.byteLength < 4) {
        throw new Error("Localization file is shorter than its size header");
    }
    const expectedSize = new DataView(
        input.buffer,
        input.byteOffset,
        input.byteLength,
    ).getUint32(0, true);
    const inflated = new Uint8Array(inflateSync(input.subarray(4)));
    if (inflated.byteLength !== expectedSize) {
        throw new Error(
            "Localization size mismatch: expected " +
                expectedSize +
                ", got " +
                inflated.byteLength,
        );
    }
    return inflated;
}

/** Extracts, inflates, decodes, and writes desktop localization tables. */
class LanguageDataTable {
    /** Canonical table name shared by locale-specific loose files. */
    readonly name = "languagedata.loc";
    /** Locale-independent schema for an inflated localization payload. */
    readonly schema = LanguageDataSchema;

    /**
     * Decodes one compressed desktop localization file.
     *
     * @param input Compressed `.loc` file bytes.
     * @returns Every physical localization row.
     */
    decode(input: Uint8Array) {
        return this.schema.decode(decompressLanguageData(input), {
            strict: true,
        });
    }

    /**
     * Reads one locale-specific loose localization file.
     *
     * @param locale Locale suffix such as `pt` or `es`.
     * @param bdoPath Black Desert installation root.
     */
    async extract(locale = "pt", bdoPath = Bun.env.BDO_GAME_PATH) {
        if (!bdoPath) throw new Error("BDO_GAME_PATH is not configured");
        if (!/^[a-z0-9_-]+$/i.test(locale)) {
            throw new Error("Invalid localization locale: " + locale);
        }
        return new Uint8Array(
            await readFile(
                join(
                    bdoPath,
                    "ads",
                    "languagedata_" + locale.toLowerCase() + ".loc",
                ),
            ),
        );
    }

    /**
     * Decodes one installed locale and writes its JSON representation to
     * `out/`.
     *
     * @param locale Locale suffix such as `pt` or `es`.
     * @param bdoPath Black Desert installation root.
     */
    async load(locale = "pt", bdoPath = Bun.env.BDO_GAME_PATH) {
        const decoded = this.decode(await this.extract(locale, bdoPath));
        await Bun.write(
            "out/languagedata_" + locale.toLowerCase() + ".loc.json",
            JSON.stringify(decoded, null, 4),
        );
    }
}

/** Locale-independent desktop localization table loader. */
export const LanguageDataLoc = new LanguageDataTable();

if (import.meta.main) await LanguageDataLoc.load();
