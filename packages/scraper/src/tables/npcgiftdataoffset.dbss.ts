import { struct, u16, u32 } from "@marceloclp/bsd";
import { table } from "./common/table";

const NpcGiftDataOffsetRow = struct({
    /** Character or NPC key selecting the companion payload. */
    key: u16(),
    /** Absolute payload start in the companion data file. */
    offset: u32(),
    /** Exact number of bytes owned by the payload. */
    byteLength: u32(),
});

export const NpcGiftDataOffsetDbss = table({
    path: "gamecommondata/binary/npcgiftdataoffset.dbss",
    rows: {
        NpcGiftDataOffsetRow: { schema: NpcGiftDataOffsetRow },
    },
});

if (import.meta.main) {
    await NpcGiftDataOffsetDbss.decodeIntoDisk({ debug: true });
}
