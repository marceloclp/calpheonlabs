import { array, bytes, repeat, struct, u32, type BsdInfer } from "@marceloclp/bsd";
import { join } from "node:path/posix";
import { decrypt } from "./ice";
import { padBy, terminatedText } from "../tables/common/bsd";
import { decompress, readUInt32LE } from "./compression";

const Entry = struct({
    /** Hash value stored by the game for the file path/name. */
    hash: u32(),
    /** Index into the folder-name table. */
    folderIndex: u32(),
    /** Index into the file-name table. */
    fileIndex: u32(),
    /** Number used to derive `padNNNNN.paz`. */
    pazNum: u32(),
    /** Byte offset of this file's payload inside the `.paz` archive. */
    offset: u32(),
    /** Stored payload size, before archive-level decompression. */
    compressedSize: u32(),
    /** Expected output size after decryption/decompression. */
    size: u32(),
});

const Meta = struct({
    /** The client version. */
    version: u32(),
    /** @unsure */
    pazCount: u32().pad((x) => x * 12),
    /** Array of file entries. */
    entries: array(u32(), Entry),
    /** Folder names - entries are indexed by folderIndex. */
    folders: bytes(u32())
        .slice(8, -8)
        .transform(decrypt)
        .frame(repeat(terminatedText().pad(padBy(8)))),
    /** File names - entries are indexed by fileIndex. */
    files: bytes(u32())
        .transform(decrypt)
        .frame(repeat(terminatedText())),
});

export class PazMeta {
    private constructor(
        public readonly bdoPath: string,
        public readonly data: BsdInfer<typeof Meta>
    ) {
        for (const entry of this.data.entries) {
            const folder = this.data.folders[entry.folderIndex]!;
            const file = this.data.files[entry.fileIndex]!;
            const path = join(folder, file);
            this.#byPath.set(path, entry);
        }
    }

    #byPath = new Map<string, BsdInfer<typeof Entry>>();

    private getArchive(entry: BsdInfer<typeof Entry>) {
        const num = entry.pazNum.toString().padStart(5, "0");
        const path = join(this.bdoPath, `Paz/pad${num}.paz`);
        return Bun.file(path).slice(
            entry.offset,
            entry.offset + entry.compressedSize,
        );
    }

    /** */
    async extract(path: string) {
        const entry = this.#byPath.get(path);
        if (!entry || entry.compressedSize === 0) {
            return new Uint8Array();
        }

        const buffer = await this.getArchive(entry).bytes();
        const file = this.data.files[entry.fileIndex]!;
        const { isBSS, isDBSS, isXML } = getType(file);

        // If the sizes are equal, then the buffer is most
        // likely already decrypted and decompressed:
        if (entry.compressedSize === entry.size) {
            // The ICE decryption works in 8-byte chunks.
            // If the buffer length is not a multiple of 8,
            // then we can't decrypt, which it means the buffer
            // is already decrypted and decompressed:
            if (buffer.length % 8 !== 0) {
                return buffer;
            }

            // @todo - handle XML files
            if (isXML) {
                return buffer;
            }

            // If the buffer already contains a PABR header,
            // then we can assume it's already decrypted:
            if ((isDBSS || isBSS) && isPABR(buffer)) {
                return buffer;
            }
        }

        const decrypted = decrypt(buffer);

        // ICE decryption works in 8-byte chunks. An encrypted
        // but otherwise uncompressed file can include cipher
        // alignment after its metadata-declared logical end:
        if (isPABR(decrypted)) {
            return decrypted.subarray(0, entry.size);
        }

        if (isCompressed(decrypted, entry.size)) {
            return decompress(decrypted);
        }

        return buffer;
    }


    /**
     * Loads the `pad00000.meta` file into memory, decodes
     * it and returns the indexed list of entries.
     */
    static async load(bdoPath = Bun.env.BDO_GAME_PATH): Promise<PazMeta> {
        bdoPath = normalize(bdoPath);
        const path = join(bdoPath, "Paz/pad00000.meta");
        const file = Bun.file(path);
        const buffer = await file.bytes();
        const data = Meta.decode(buffer);
        return new PazMeta(bdoPath, data);
    }
}

/**
 * Normalize paths by replacing \ with a /.
 */
function normalize(path: string): string {
    return path.replaceAll("\\", "/");
}

function getType(file: string) {
    return {
        isBSS: file.endsWith(".bss"),
        isDBSS: file.endsWith(".dbss"),
        isXML: file.endsWith(".xml"),
    };
}

/**
 * Checks if the buffer and entry are representative of a
 * PABR (Pearl Abyss Binary Record) archive by checking
 * for its header.
 *
 * The PABR header is a 4-byte ASCII string that decodes
 * to "PABR".
 *
 * @param buffer the paz entry bytes slice
 * @returns whether the buffer is a decoded PABR file
 */
function isPABR(buffer: Uint8Array): boolean {
    return (
        buffer.length >= 4 &&
        buffer[0] === 0x50 &&
        buffer[1] === 0x41 &&
        buffer[2] === 0x42 &&
        buffer[3] === 0x52
    );
}

/**
 * Compressed files have a header structure where
 * the first byte is 0x6f or 0x6e, followed by
 * 4 bytes of padding, and then a u32 value which
 * should match the original size of the entry.
 */
function isCompressed(buffer: Uint8Array, size: number): boolean {
    if (buffer[0] !== 0x6f && buffer[0] !== 0x6e) {
        return false;
    }
    return readUInt32LE(buffer, 5) === size;
}

if (import.meta.main) {
    await PazMeta.load();
}
