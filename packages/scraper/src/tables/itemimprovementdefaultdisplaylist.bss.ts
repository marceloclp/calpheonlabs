import { struct, u32 } from "@marceloclp/bsd";
import { table } from "./common/table";

/** One improvement source selected for the client's default display list. */
const ItemImprovementDefaultDisplayListRow = struct({
    /** Item identifier resolving through `itemimprovementsource.dbss`. */
    sourceItemId: u32().positive(),
}).fixedLength(4);

/** PABR-framed default item-improvement display list. */
export const ItemImprovementDefaultDisplayListBss = table({
    path: "gamecommondata/binary/itemimprovementdefaultdisplaylist.bss",
    pabr: true,
    rows: {
        ItemImprovementDefaultDisplayListRow: {
            schema: ItemImprovementDefaultDisplayListRow,
        },
    },
});

if (import.meta.main) {
    await ItemImprovementDefaultDisplayListBss.decodeIntoDisk();
}
