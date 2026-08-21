import { struct, u16 } from "@marceloclp/bsd";
import { table } from "./common/table";

/** One physical Black Desert quest identifier. */
const QuestId = struct({
    /** Quest family/group identifier stored in the low two bytes. */
    questGroupId: u16(),
    /** Quest number within the group, stored in the high two bytes. */
    questNumber: u16(),
});

/** Physical ordered list of normal-track Season Pass quest identifiers. */
export const SeasonPassQuestListForNormalBss = table({
    path: "gamecommondata/binary/seasonpassquestlistfornormal.bss",
    pabr: true,
    rows: {
        /** Normal-track Season Pass quest identifiers in physical order. */
        QuestId: { schema: QuestId },
    },
});

if (import.meta.main) {
    await SeasonPassQuestListForNormalBss.decodeIntoDisk({ debug: true });
}
