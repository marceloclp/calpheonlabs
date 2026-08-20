import { struct, u16 } from "@marceloclp/bsd";
import { table } from "./common/table";

/** One physical Black Desert quest identifier. */
const QuestId = struct({
    /** Quest family/group identifier stored in the low two bytes. */
    questGroupId: u16(),
    /** Quest number within the group, stored in the high two bytes. */
    questNumber: u16(),
});

/** Physical ordered list of Growth Pass quest identifiers. */
export const GrowthPassQuestListBss = table({
    path: "gamecommondata/binary/growthpassquestlist.bss",
    pabr: true,
    rows: {
        QuestId: {
            schema: QuestId,
        },
    },
});

if (import.meta.main) {
    await GrowthPassQuestListBss.decodeIntoDisk();
}
