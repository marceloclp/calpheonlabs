import { bytes, literal, remaining, struct, u32 } from "@marceloclp/bsd";
import { table } from "./common/table";

const QuestDbssRow = struct({
    /** Stored quest count. */
    recordCount: u32(),
    /** Version/format marker observed as `0x00010000`. */
    formatMarker: u32().is(0x00010000),
    /** Four required zero header words. */
    reservedHeader: bytes(16).reserved(),
    /** Exact unframed quest record stream retained as a zero-copy byte view. */
    recordData: remaining().reserved(),
});

export const QuestDbss = table({
    path: "gamecommondata/binary/quest.dbss",
    rows: {
        QuestDbssRow: {
            schema: QuestDbssRow,
            counter: literal(1),
        },
    },
});

if (import.meta.main) {
    await QuestDbss.decodeIntoDisk({ debug: true });
}
