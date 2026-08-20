import { struct, u16 } from "@marceloclp/bsd";
import { table } from "./common/table";

const QuestId = struct({
    /** Quest family/group identifier stored in the low two bytes. */
    questGroupId: u16(),
    /** Quest number within `questGroupId`, stored in the high two bytes. */
    questNumber: u16(),
});

export const AllQuestListBss = table({
    path: "gamecommondata/binary/allquestlist.bss",
    pabr: true,
    rows: {
        QuestId: { schema: QuestId },
    },
});

if (import.meta.main) {
    await AllQuestListBss.decodeIntoDisk();
}
