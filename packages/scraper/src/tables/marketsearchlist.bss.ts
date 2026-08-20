import { bytes, padded, struct, u32 } from "@marceloclp/bsd";
import { table } from "./common/table";

/** One fixed-width item-to-search-text reference. */
const MarketSearchListRow = struct({
    /** Item-family identifier. */
    itemId: u32().positive(),
    /** Zero-based index into this table's `searchTexts` dictionary. */
    searchTextIndex: u32().pad(4),
}).fixedLength(12);

/** Complete market-search list with its local search-text dictionary. */
export const MarketSearchListBss = table({
    path: "gamecommondata/binary/marketsearchlist.bss",
    pabr: true,
    rows: {
        /** Item-to-search-text references in physical order. */
        MarketSearchListRow: { schema: MarketSearchListRow },
        /** Search labels addressed by each row's `searchTextIndex`. */
        SearchTexts: { schema: padded(1, bytes(u32()).utf16()) },
    },
});

if (import.meta.main) {
    await MarketSearchListBss.decodeIntoDisk({ debug: true });
}
