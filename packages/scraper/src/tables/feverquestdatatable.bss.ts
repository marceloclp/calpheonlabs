import { struct, u16, u32 } from "@marceloclp/bsd";
import { table } from "./common/table";

/** One quest and the Agris Fever points consumed when it is accepted. */
const FeverQuestDataTableRow = struct({
    /** Quest group identifier. */
    questGroupId: u16(),
    /** Quest number within the group. */
    questNumber: u16(),
    /** Agris Fever cost charged on acceptance. */
    agrisFeverCost: u32(),
}).fixedLength(8);

export const FeverQuestDataTableBss = table({
    path: "gamecommondata/binary/feverquestdatatable.bss",
    pabr: true,
    rows: {
        FeverQuestDataTableRow: {
            schema: FeverQuestDataTableRow,
        },
    },
});

if (import.meta.main) {
    await FeverQuestDataTableBss.decodeIntoDisk();
}
