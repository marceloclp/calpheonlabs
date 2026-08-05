import { array, bytes, padded, struct, u32 } from "@marceloclp/bsd";
import { bss } from "./common/helpers";

/** One fixed-width item-to-search-text reference. */
const MarketSearchListRow = struct({
    /** Item-family identifier. */
    itemId: u32().positive(),
    /** Zero-based index into this table's `searchTexts` dictionary. */
    searchTextIndex: u32().pad(4),
}).fixedLength(12);

/** Complete market-search list with its local search-text dictionary. */
export const MarketSearchListBss = bss(
    "gamecommondata/binary/marketsearchlist.bss",
)({
    /** Item-to-search-text references in physical order. */
    rows: array(u32(), MarketSearchListRow),
    /** Search labels addressed by each row's `searchTextIndex`. */
    searchTexts: array(u32(), padded(1, bytes(u32()).utf16())),
    /** Informational footer following the search-text dictionary. */
    footer: struct({
        /** Absolute byte offset of the counted `searchTexts` dictionary. */
        searchTextOffset: u32().pad(4),
    }),
});

if (import.meta.main) {
    await MarketSearchListBss.decodeIntoDisk();
}
