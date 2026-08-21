import { struct } from "@marceloclp/bsd";
import { table } from "./common/table";

export const WorldQuestDbss = table({
    path: "gamecommondata/binary/worldquest.dbss",
    rows: {
        /** Table has no rows. */
        WorldQuestRow: { schema: struct({}) },
    },
});

if (import.meta.main) {
    await WorldQuestDbss.decodeIntoDisk({ debug: true });
}
