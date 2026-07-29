import { remaining, reserved, u32 } from "@marceloclp/bsd";

import { dbss } from "./common/helpers";

export const QuestDbss = dbss("gamecommondata/binary/quest.dbss")({
    /** Stored quest count. */
    recordCount: u32(),
    /** Version/format marker observed as `0x00010000`. */
    formatMarker: u32().is(0x00010000),
    /** Four required zero header words. */
    reservedHeader: reserved(16),
    /** Exact unframed quest record stream retained as a zero-copy byte view. */
    recordData: remaining().transform((x) => Array.from(x)),
});

if (import.meta.main) {
    await QuestDbss.load();
}
