import { struct, u16 } from "@marceloclp/bsd";
import { table } from "./common/table";

/** One physical Black Desert quest identifier. */
const QuestId = struct({
    /** Quest family/group identifier stored in the low two bytes. */
    questGroupId: u16(),
    /** Quest number within the group, stored in the high two bytes. */
    questNumber: u16(),
});

/** Physical ordered list of cash-track Season Pass quest identifiers. */
export const SeasonPassQuestListForCashBss = table({
    path: "gamecommondata/binary/seasonpassquestlistforcash.bss",
    pabr: true,
    rows: {
        /** Cash-track Season Pass quest identifiers in physical order. */
        QuestId: { schema: QuestId },
    },
});

if (import.meta.main) {
    await SeasonPassQuestListForCashBss.decodeIntoDisk({ debug: true });
}
