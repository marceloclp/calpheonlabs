import { struct, u16, u32 } from "@marceloclp/bsd";
import { table } from "./common/table";

const NpcPersonalityOffsetRow = struct({
    /** Character or NPC key selecting the companion payload. */
    key: u16(),
    /** Absolute payload start in the companion data file. */
    offset: u32(),
    /** Exact number of bytes owned by the payload. */
    byteLength: u32(),
});

export const NpcPersonalityOffsetDbss = table({
    path: "gamecommondata/binary/npcpersonalityoffset.dbss",
    rows: {
        NpcPersonalityOffsetRow: { schema: NpcPersonalityOffsetRow },
    },
});

if (import.meta.main) {
    await NpcPersonalityOffsetDbss.decodeIntoDisk({ debug: true });
}
