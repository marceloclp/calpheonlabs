import { struct, u16, u32 } from "@marceloclp/bsd";
import { table } from "./common/table";

const NpcGiftOffsetRow = struct({
    /** Character or NPC key selecting the companion payload. */
    key: u16(),
    /** Absolute payload start in the companion data file. */
    offset: u32(),
    /** Exact number of bytes owned by the payload. */
    byteLength: u32(),
});

export const NpcGiftOffsetDbss = table({
    path: "gamecommondata/binary/npcgiftoffset.dbss",
    rows: {
        NpcGiftOffsetRow: { schema: NpcGiftOffsetRow },
    },
});

if (import.meta.main) {
    await NpcGiftOffsetDbss.decodeIntoDisk({ debug: true });
}
