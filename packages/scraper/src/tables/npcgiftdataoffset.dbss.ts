import { array, struct, u16, u32 } from "@marceloclp/bsd";
import { dbss } from "./common/helpers";

const NpcGiftDataOffsetRowBSD = struct({
    /** Character or NPC key selecting the companion payload. */
    key: u16(),
    /** Absolute payload start in the companion data file. */
    offset: u32(),
    /** Exact number of bytes owned by the payload. */
    byteLength: u32(),
});

export const NpcGiftDataOffsetDbss = dbss(
    "gamecommondata/binary/npcgiftdataoffset.dbss",
)({
    rows: array(u32(), NpcGiftDataOffsetRowBSD),
});

if (import.meta.main) {
    await NpcGiftDataOffsetDbss.load();
}
