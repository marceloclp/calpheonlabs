import { array, bytes, struct, u32, u8 } from "@marceloclp/bsd";

import { bss } from "./common/helpers";

/** One numeric category and its index into the in-file Korean name dictionary. */
const ItemMarketCategoryEntry = struct({
    /** Neutral one-byte value paired with the indexed category name. */
    field00: u8(),
    /** Zero-based index into the table's category-name dictionary. */
    categoryNameIndex: u32(),
}).fixedLength(5);

/** One counted category-entry group in its physical row position. */
const ItemMarketCategoryEntryGroup = struct({
    /** Stored number of entries in this group. */
    entryCount: u32().peek(),
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

/** One marker- and byte-length-prefixed Korean category name. */
const ItemMarketCategoryName = struct({
    /** Required one-byte marker identifying a dictionary string. */
    marker: u8().is(1),
    /** Stored UTF-16 byte length retained independently of the text. */
    byteLength: u32()
        .check((value) => value % 2 === 0)
        .peek(),
    /** Korean display name decoded from its exact byte-length frame. */
    text: bytes(u32()).utf16(),
});

/** Informational footer following the category-name dictionary. */
const ItemMarketCategoryFooter = struct({
    /** Absolute byte offset at which the dictionary's count begins. */
    categoryNamesOffset: u32(),
    /** Unused four-byte file terminator. */
    reserved04: bytes(4).reserved(),
}).fixedLength(8);

/** Complete physical market-category hierarchy and Korean name dictionary. */
export const ItemMarketCategoryBss = bss(
    "gamecommondata/binary/itemmarketcategory.bss",
)({
    /** Stored top-level category count retained independently of the array. */
    rowCount: u32().peek(),
    /** Top-level market categories in physical order. */
    rows: array(u32(), ItemMarketCategoryRow),
    /** Stored number of Korean category names. */
    categoryNameCount: u32().peek(),
    /** Indexed Korean category-name records. */
    categoryNames: array(u32(), ItemMarketCategoryName),
    /** Informational pointer to the name dictionary. */
    footer: ItemMarketCategoryFooter,
});

if (import.meta.main) {
    await ItemMarketCategoryBss.load();
}
