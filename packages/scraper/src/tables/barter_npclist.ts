import { struct, u16 } from "@marceloclp/bsd";
import { table } from "./common/table";

/** One barter-location profile and the character assigned to serve it. */
const BarterNpcListRow = struct({
    /** Barter point or location profile key. */
    barterKey: u16(),
    /** Character key of the barterer at that point. */
    characterKey: u16(),
});

export const BarterNpcListBss = table({
    path: "gamecommondata/binary/barter_npclist.bss",
    pabr: true,
    rows: {
        BarterNpcListRow: { schema: BarterNpcListRow },
    },
});

if (import.meta.main) {
    await BarterNpcListBss.decodeIntoDisk();
}
