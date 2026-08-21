import { array, struct, u16, u32 } from "@marceloclp/bsd";
import { table } from "./common/table";

const NpcGiftItem = struct({
    /** Item identifier accepted by this NPC. */
    id: u32(),
    /** Fixed base amity awarded for the gift. */
    amity: u32(),
    /** Required physical duplicate of `amity`. */
    amityMirror: u32(),
});

const NpcGiftRow = struct({
    /** Character key owning the gift list. */
    npcId: u16(),
    /** Favorite items; the stored count is decoder-only. */
    items: array(u32(), NpcGiftItem),
});

export const NpcGiftDbss = table({
    path: "gamecommondata/binary/npcgift.dbss",
    rows: {
        NpcGiftRow: { schema: NpcGiftRow },
    },
});

if (import.meta.main) {
    await NpcGiftDbss.decodeIntoDisk({ debug: true });
}
