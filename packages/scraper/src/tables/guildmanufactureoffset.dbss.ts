import { array, struct, u32 } from "@marceloclp/bsd";
import { dbss } from "./common/helpers";

/** Twelve-byte companion pointer with a four-byte lookup key. */
export const GuildManufactureOffsetRow = struct({
    /** Four-byte lookup key repeated by the addressed data row. */
    key: u32(),
    /** Absolute byte offset of the addressed payload. */
    offset: u32(),
    /** Exact byte length of the addressed payload. */
    byteLength: u32(),
}).fixedLength(12);

/** Physical directory of variable-width guild-manufacture payloads. */
export const GuildManufactureOffsetDbss = dbss(
    "gamecommondata/binary/guildmanufactureoffset.dbss",
)({
    /** Guild-manufacture payload pointers in directory order. */
    rows: array(u32(), GuildManufactureOffsetRow),
});

if (import.meta.main) {
    await GuildManufactureOffsetDbss.load();
}
