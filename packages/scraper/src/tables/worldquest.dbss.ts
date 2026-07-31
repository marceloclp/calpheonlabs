import { array, struct, u32 } from "@marceloclp/bsd";
import { dbss } from "./common/helpers";

export const WorldQuestDbss = dbss("gamecommondata/binary/worldquest.dbss")({
    /** Table has no rows. */
    rows: array(u32(), struct({})),
});

if (import.meta.main) {
    await WorldQuestDbss.load();
}
