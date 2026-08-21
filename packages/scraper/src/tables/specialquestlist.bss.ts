import { struct, u16 } from "@marceloclp/bsd";
import { table } from "./common/table";

/** One physical Black Desert quest identifier. */
const QuestId = struct({
    /** Quest family/group identifier stored in the low two bytes. */
    questGroupId: u16(),
    /** Quest number within the group, stored in the high two bytes. */
    questNumber: u16(),
});

/** Physical ordered list of special quest identifiers. */
export const SpecialQuestListBss = table({
    path: "gamecommondata/binary/specialquestlist.bss",
    pabr: true,
    rows: {
        /** Special quest identifiers in physical table order. */
        QuestId: { schema: QuestId },
    },
});

if (import.meta.main) {
    await SpecialQuestListBss.decodeIntoDisk({ debug: true });
}
