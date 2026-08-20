import { array, struct, u32 } from "@marceloclp/bsd";
import { table } from "./common/table";

/** One authoritative pointer to a journal volume row. */
const JournalQuestOffsetEntry = struct({
    /** Volume/quest number repeated in the target row. */
    questNumber: u32(),
    /** Absolute target-row offset in `journalquest.dbss`. */
    offset: u32(),
    /** Exact byte length of the target row. */
    byteLength: u32(),
});

/** One journal group and its count-prefixed target-row pointers. */
const JournalQuestOffsetGroup = struct({
    /** Journal group identifier repeated by every target row. */
    journalGroupId: u32(),
    /** Pointers for volumes belonging to this group. */
    entries: array(u32(), JournalQuestOffsetEntry),
});

export const JournalQuestOffsetDbss = table({
    path: "gamecommondata/binary/journalquestoffset.dbss",
    pabr: true,
    rows: {
        JournalQuestOffsetGroup: {
            schema: JournalQuestOffsetGroup
        },
    },
});

if (import.meta.main) {
    await JournalQuestOffsetDbss.decodeIntoDisk({ debug: true });
}
