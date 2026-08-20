import { array, struct, u16, u32, u8 } from "@marceloclp/bsd";
import { table } from "./common/table";

/** One quest participating in a physical branch set. */
const BranchQuestEntry = struct({
    /** Branch-set identifier repeated by every entry in the enclosing row. */
    branchSetId: u32(),
    /** Quest group identifier. */
    questGroupId: u16(),
    /** Quest number within the group. */
    questNumber: u16(),
    /** Structural role code; `2` occurs only on the final entry. */
    roleCode: u8().in([0, 1, 2]),
});

/** One counted branch set, with repeated IDs retained as physical evidence. */
const BranchQuestRow = struct({
    /** Branch entries prefixed by their stored count. */
    rows: array(u32(), BranchQuestEntry),
});

export const BranchQuestBss = table({
    path: "gamecommondata/binary/branchquest.bss",
    pabr: true,
    rows: {
        BranchQuestRow: { schema: BranchQuestRow },
    },
});

if (import.meta.main) {
    await BranchQuestBss.decodeIntoDisk();
}
