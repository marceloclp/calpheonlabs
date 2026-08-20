import { struct, u32 } from "@marceloclp/bsd";
import { table } from "./common/table";

/** One source item and the market-listed item whose price it references. */
const ItemLinkPriceRow = struct({
    /** Non-market item family delegating its market-price identity. */
    itemId: u32().positive(),
    /** Market-listed item family supplying the referenced price identity. */
    marketPriceReferenceItemId: u32().positive(),
}).fixedLength(8);

/** Complete physical item-price-link table. */
export const ItemLinkPriceBss = table({
    path: "gamecommondata/binary/itemlinkprice.bss",
    pabr: true,
    rows: {
        ItemLinkPriceRow: {
            schema: ItemLinkPriceRow,
        },
    },
});

if (import.meta.main) {
    await ItemLinkPriceBss.decodeIntoDisk();
}
