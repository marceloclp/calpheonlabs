import { struct, u32 } from "@marceloclp/bsd";
import { table } from "./common/table";

/** Twelve-byte companion pointer with a four-byte lookup key. */
const GuildHouseCraftStorageOffsetRow = struct({
    /** Four-byte lookup key repeated by the addressed data row. */
    key: u32(),
    /** Absolute byte offset of the addressed payload. */
    offset: u32(),
    /** Exact byte length of the addressed payload. */
    byteLength: u32(),
}).fixedLength(12);

/** Directory of six-byte guild-house craft-storage payloads. */
export const GuildHouseCraftStorageOffsetDbss = table({
    path: "gamecommondata/binary/guildhousecraftstorageoffset.dbss",
    pabr: true,
    rows: {
        GuildHouseCraftStorageOffsetRow: {
            schema: GuildHouseCraftStorageOffsetRow,
        },
    },
});

if (import.meta.main) {
    await GuildHouseCraftStorageOffsetDbss.decodeIntoDisk();
}
