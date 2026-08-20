import { struct, u32, u8 } from "@marceloclp/bsd";
import { table } from "./common/table";

/** One fixed five-byte item maximum-enhancement record. */
const ItemMaxLevelRow = struct({
    /** Item-family identifier shared by item-keyed tables. */
    itemId: u32(),
    /** Highest stored enhancement level; zero means no enhanced variants. */
    maxEnhancementLevel: u8(),
}).fixedLength(5);

/** PABR-framed item maximum-enhancement table. */
export const ItemMaxLevelDbss = table({
    path: "gamecommondata/binary/itemmaxlevel.dbss",
    pabr: true,
    rows: {
        ItemMaxLevelRow: {
            schema: ItemMaxLevelRow,
        },
    },
});

if (import.meta.main) {
    await ItemMaxLevelDbss.decodeIntoDisk();
}
