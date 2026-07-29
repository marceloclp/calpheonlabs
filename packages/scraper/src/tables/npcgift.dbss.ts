import { array, struct, u16, u32 } from "@marceloclp/bsd";

import { dbss } from "./common/helpers";

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

export const NpcGiftDbss = dbss("gamecommondata/binary/npcgift.dbss")({
    rows: array(u32(), NpcGiftRow),
});

if (import.meta.main) {
    await NpcGiftDbss.load();
}
