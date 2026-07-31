import { array, bytes, struct, u32 } from "@marceloclp/bsd";

import { bss } from "./common/helpers";

/** One source item and the market-listed item whose price it references. */
const ItemLinkPriceRow = struct({
    /** Non-market item family delegating its market-price identity. */
    itemId: u32().positive(),
    /** Market-listed item family supplying the referenced price identity. */
    marketPriceReferenceItemId: u32().positive(),
}).fixedLength(8);

/** Informational PABR footer following the item-price links. */
const ItemLinkPriceFooter = struct({
    /** Unused four-byte prefix before the footer self-pointer. */
    reserved00: bytes(4).reserved(),
    /** Absolute byte offset at which this footer begins. */
    footerOffset: u32(),
    /** Unused four-byte file terminator. */
    reserved08: bytes(4).reserved(),
}).fixedLength(12);

/** Complete physical item-price-link table. */
export const ItemLinkPriceBss = bss("gamecommondata/binary/itemlinkprice.bss")({
    /** Stored link count retained independently of the decoded array. */
    rowCount: u32().peek(),
    /** Directional item-price links in physical file order. */
    rows: array(u32(), ItemLinkPriceRow),
    /** Informational footer framing the table. */
    footer: ItemLinkPriceFooter,
});

if (import.meta.main) {
    await ItemLinkPriceBss.load();
}
