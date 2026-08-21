import { struct, u16 } from "@marceloclp/bsd";
import { table } from "./common/table";

/** One physical Black Desert quest identifier. */
const QuestId = struct({
    /** Quest family/group identifier stored in the low two bytes. */
    questGroupId: u16(),
    /** Quest number within the group, stored in the high two bytes. */
    questNumber: u16(),
});

/** Physical ordered list of regional monster-kill quest identifiers. */
export const RegionMonsterKillQuestListBss = table({
    path: "gamecommondata/binary/regionmonsterkillquestlist.bss",
    pabr: true,
    rows: {
        /** Regional monster-kill quest identifiers in physical order. */
        QuestId: { schema: QuestId },
    },
});

if (import.meta.main) {
    await RegionMonsterKillQuestListBss.decodeIntoDisk({ debug: true });
}
