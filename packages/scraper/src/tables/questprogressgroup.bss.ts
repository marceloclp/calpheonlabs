import { array, struct, u16, u32 } from "@marceloclp/bsd";
import { bss } from "./common/helpers";

const QuestProgressGroupEntry = struct({
    /** Progress-group identifier repeated from the enclosing row. */
    progressGroupId: u32(),
    /** Quest group containing the range. */
    questGroupId: u16(),
    /** First quest number in the inclusive range. */
    firstQuestNumber: u16(),
    /** Last quest number in the inclusive range. */
    lastQuestNumber: u16(),
});

const QuestProgressGroupRow = struct({
    /** Parent progress-group identifier. */
	progressGroupId: u32(),
	/** Count-prefixed ranges that repeat `progressGroupId`. */
	entries: array(u32(), QuestProgressGroupEntry),
});

export const QuestProgressGroupBss = bss("gamecommondata/binary/questprogressgroup.bss")({
    rows: array(u32(), QuestProgressGroupRow),
});

if (import.meta.main) {
    await QuestProgressGroupBss.load();
}
