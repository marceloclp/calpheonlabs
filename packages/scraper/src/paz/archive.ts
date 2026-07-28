import { join } from "node:path/posix";
import {
    array,
    bytes,
    cstring,
    repeat,
    struct,
    u32,
    type BsdInfer,
} from "@marceloclp/bsd";
import { IceKey } from "./ice";
import { decompress } from "./decompress";

const BDO_ICE_KEY = new Uint8Array([
    0x51, 0xf3, 0x0f, 0x11, 0x04, 0x24, 0x6a, 0x00,
]);
const ICE_KEY = new IceKey(0).set(BDO_ICE_KEY);

function decrypt(bytes: Uint8Array) {
    return ICE_KEY.decrypt(bytes);
}

interface FileEntry {
    /** */
    fileName: string;
    /** Hash value stored by the game for the file path/name. */
    fileHash: number;
    /** */
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
 * The meta file describes where each file is located. Files are
 * spread across many PAZ archives.
 */
const MetaFileBSD = struct({
    /** The client version. */
    version: u32(),
    pazCount: u32()
        .peek()
        .skip(u32().transform((x) => x * 12)),
    fileEntries: array(u32(), FileEntryBSD),
    folderNames: bytes(u32().transform((x) => x - 8))
        .transform(decrypt)
        .transform((x) => x.slice(8))
        .frame(repeat(cstring().skip(8)))
        .skip(8),
    fileNames: bytes(u32()).transform(decrypt).frame(repeat(cstring())),
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

        console.log(entry, buffer, isPabr(buffer))
        if (entry.compressedSize === entry.originalSize) {
            if (isPabr(buffer)) {
                return decrypt(buffer);
            }

            const decrypted = decrypt(buffer);
            if (isPabr(decrypted)) {
                return decrypted;
            }

            return buffer;
        }

        if (entry.compressedSize % 8 !== 0) {
            throw new Error(
                `Compressed size ${entry.compressedSize} is not a multiple of 8`,
            );
        }

        const decrypted = decrypt(buffer);
        return decompress(decrypted);
    }
}

/**
 * Returns whether a file data is a a PABR (Pearl Abyss Binary Record).
 * PABR files require decryption.
 */
function isPabr(data: Uint8Array) {
    return (
        data.length >= 4 &&
        data[0] === 0x50 &&
        data[1] === 0x41 &&
        data[2] === 0x42 &&
        data[3] === 0x52
    );
}
