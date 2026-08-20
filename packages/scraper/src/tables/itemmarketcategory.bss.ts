import { array, struct, u32, u8 } from "@marceloclp/bsd";
import { markedUtf16Text } from "./common/bsd";
import { table } from "./common/table";

/** One numeric category and its index into the in-file Korean name dictionary. */
const ItemMarketCategoryEntry = struct({
    /** Neutral one-byte value paired with the indexed category name. */
    field00: u8(),
    /** Zero-based index into the table's category-name dictionary. */
    categoryNameIndex: u32(),
}).fixedLength(5);

/** One counted category-entry group in its physical row position. */
const ItemMarketCategoryEntryGroup = struct({
    /** Category/name references in physical order. */
    entries: array(u32(), ItemMarketCategoryEntry),
});

/** One variable-width top-level market-category row. */
const ItemMarketCategoryRow = struct({
    /** Outer one-byte key identifying this top-level category. */
    categoryKey: u8(),
    /** Client main-category value physically repeated from `categoryKey`. */
    mainCategoryValue: u8(),
    /** Zero-based index of this category's Korean display name. */
    categoryNameIndex: u32(),
    /** Three ordered counted groups whose distinct roles remain unresolved. */
    entryGroups: array(3, ItemMarketCategoryEntryGroup),
    /** Neutral final row control retained without a speculative filter meaning. */
    fieldAfterGroups: u32(),
}).check((row) => row.categoryKey === row.mainCategoryValue);

/** Complete physical market-category hierarchy and Korean name dictionary. */
export const ItemMarketCategoryBss = table({
    path: "gamecommondata/binary/itemmarketcategory.bss",
    pabr: true,
    rows: {
        ItemMarketCategoryRow: {
            schema: ItemMarketCategoryRow,
        },
        Stringpool: {
            schema: markedUtf16Text(),
        },
    },
});

if (import.meta.main) {
    await ItemMarketCategoryBss.decodeIntoDisk();
}
