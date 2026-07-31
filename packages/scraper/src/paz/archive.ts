import { join } from "node:path/posix";

import { array, bytes, repeat, struct, u32 } from "@marceloclp/bsd";

import { Cstring } from "../tables/common/bsd";
import { decompress, readUInt32LE } from "./decompress";
import { IceKey } from "./ice";

const BDO_ICE_KEY = new Uint8Array([
    0x51, 0xf3, 0x0f, 0x11, 0x04, 0x24, 0x6a, 0x00,
]);
const ICE_KEY = new IceKey(0).set(BDO_ICE_KEY);

function decrypt(bytes: Uint8Array) {
    return ICE_KEY.decrypt(bytes);
}

interface FileEntry {
    fileName: string;
    /** Hash value stored by the game for the file path/name. */
    fileHash: number;
    folderName: string;
    /** Index into the folder-name table. */
    folderNum: number;
    /** Index into the file-name table. */
    fileNum: number;
    /** Number used to derive `padNNNNN.paz`. */
    pazNum: number;
    /** Byte offset of this file's payload inside the `.paz` archive. */
    offset: number;
    /** Stored payload size, before archive-level decompression. */
    compressedSize: number;
    /** Expected output size after decryption/decompression. */
    originalSize: number;
}

const FileEntryBSD = struct({
    /** Hash value stored by the game for the file path/name. */
    fileHash: u32(),
    /** Index into the folder-name table. */
    folderNum: u32(),
    /** Index into the file-name table. */
    fileNum: u32(),
    /** Number used to derive `padNNNNN.paz`. */
    pazNum: u32(),
    /** Byte offset of this file's payload inside the `.paz` archive. */
    offset: u32(),
    /** Stored payload size, before archive-level decompression. */
    compressedSize: u32(),
    /** Expected output size after decryption/decompression. */
    originalSize: u32(),
});

/**
 * The global `pad00000.meta` metadata file.
 *
 * The meta file describes where each file is located. Files are spread across
 * many PAZ archives.
 */
const MetaFileBSD = struct({
    /** The client version. */
    version: u32(),
    pazCount: u32().pad((x) => x * 12),
    fileEntries: array(u32(), FileEntryBSD),
    folderNames: bytes(u32().transform((x) => x - 8))
        .transform(decrypt)
        .transform((x) => x.slice(8))
        .frame(repeat(Cstring.pad((_, r) => (r.remaining === 0 ? 0 : 8))))
        .pad(8),
    fileNames: bytes(u32()).transform(decrypt).frame(repeat(Cstring)),
});

export namespace PAZ {
    export async function readMeta(bdoPath = Bun.env.BDO_GAME_PATH) {
        const path = join(bdoPath, `Paz/pad00000.meta`);
        const file = Bun.file(path);
        const buffer = await file.bytes();
        const meta = MetaFileBSD.decode(buffer);

        meta.fileEntries.forEach((entry) => {
            const file = entry as FileEntry;
            file.fileName = meta.fileNames[entry.fileNum]!;
            file.folderName = meta.folderNames[entry.folderNum]!;
        });

        return meta.fileEntries as FileEntry[];
    }

    /**
     * Loads one resolved archive entry directly into memory.
     *
     * Only the entry's byte range is streamed from its containing PAZ file. The
     * complete archive is never loaded. The stored bytes are then decrypted and
     * decompressed exactly as they are during disk extraction.
     *
     * @param entry
     * @param bdoPath
     * @returns
     * @note
     * When the compressed size is equal to the original size, this usually
     * means that the payload is unencrypted. The decrypted candidate is
     * accepted only when its signature agrees with the archive path: an XML
     * declaration for `.xml`, or `PABR` for binary tables.
     */
    export async function extract(
        entry: FileEntry,
        bdoPath = Bun.env.BDO_GAME_PATH,
    ) {
        if (entry.compressedSize === 0) {
            return new Uint8Array();
        }

        const pazPath = join(
            bdoPath,
            `Paz/pad${entry.pazNum.toString().padStart(5, "0")}.paz`,
        );
        const pazFile = Bun.file(pazPath);
        const buffer = await pazFile
            .slice(entry.offset, entry.offset + entry.compressedSize)
            .bytes();

        if (isDecrypted(entry, buffer)) {
            // File is already decrypted, so we can return as it is:
            return buffer;
        }

        console.log("decrypting");
        const candidate = decrypt(buffer);

        if (hasHeader(entry, candidate)) {
            console.log("has header");
            return candidate;
        }

        if (isCompressed(entry, candidate)) {
            console.log("is compressed");
            return decompress(candidate);
        }

        return buffer;
    }
}

function isXml(entry: FileEntry) {
    return entry.fileName.endsWith(".xml");
}

function isBss(entry: FileEntry) {
    return entry.fileName.endsWith(".bss");
}

function isDbss(entry: FileEntry) {
    return entry.fileName.endsWith(".dbss");
}

/**
 * @param entry The file entry to check.
 * @param data The compressed data bytes.
 * @returns Whether the data is already decrypted.
 */
function isDecrypted(entry: FileEntry, data: Uint8Array) {
    if (entry.compressedSize !== entry.originalSize) {
        console.log("isDecrypted(false): compressedSize !== originalSize");
        return false;
    }

    if (data.length % 8 !== 0) {
        console.log("isDecrypted(true): not a multiple of 8");
        // Decryption requires the source buffer size to be
        // a multiple of 8 bytes. If this is not the case, then
        // we assume it's already decrypted.
        return true;
    }

    if (isXml(entry)) {
        console.log("isDecrypted(true): xml file has header");
        // @todo - check for XML declaration header
        return true;
    }

    if (isBss(entry) || isDbss(entry)) {
        console.log(
            `isDecrypted(${hasPabrHeader(data)}): pabr file ${hasPabrHeader(data) ? "has" : "has no"} header`,
        );
        return hasPabrHeader(data);
    }

    // Non-XML, non-dbss and non-bss files are already decrypted:
    return true;
}

function hasHeader(entry: FileEntry, data: Uint8Array) {
    if (entry.fileName.endsWith(".xml")) {
        // @todo - check for XML declaration header
        return true;
    }

    if (entry.fileName.endsWith(".bss") || entry.fileName.endsWith(".dbss")) {
        return hasPabrHeader(data);
    }

    return false;
}

/**
 * Returns whether a file data is a a PABR (Pearl Abyss Binary Record). PABR
 * files may require decryption.
 */
function hasPabrHeader(data: Uint8Array) {
    return (
        data.length >= 4 &&
        data[0] === 0x50 &&
        data[1] === 0x41 &&
        data[2] === 0x42 &&
        data[3] === 0x52
    );
}

function isCompressed(entry: FileEntry, data: Uint8Array) {
    if (data[0] !== 0x6f && data[0] !== 0x6e) {
        return false;
    }

    if (entry.compressedSize <= 9) {
        return false;
    }

    const size = readUInt32LE(data, 5);
    return size === entry.originalSize;
}
