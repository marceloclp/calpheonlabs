import { array, bytes, struct, u16, u32 } from "@marceloclp/bsd";

import { bss } from "./common/helpers";

/** One barter-location profile and the character assigned to serve it. */
const BarterNpcListRow = struct({
    /** Barter point or location profile key. */
    barterKey: u16(),
    /** Character key of the barterer at that point. */
    characterKey: u16(),
});

export const BarterNpcListBss = bss("barter_npclist.bss")({
    rows: array(u32(), BarterNpcListRow),
    footer: bytes(12).reserved(),
});

if (import.meta.main) {
    await BarterNpcListBss.load();
}
