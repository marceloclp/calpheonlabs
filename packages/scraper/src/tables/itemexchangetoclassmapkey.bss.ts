import { array, bytes, struct, u32 } from "@marceloclp/bsd";
import { bss } from "./common/helpers";

/** One reverse lookup from an exchangeable item to its class-exchange group. */
const ItemExchangeToClassMapKeyRow = struct({
    /** Item identifier present in at least one slot of the referenced group. */
    itemId: u32().positive(),
    /** Group identifier resolving through `itemexchangetoclass.dbss`. */
    exchangeGroupId: u32().positive(),
}).fixedLength(8);

/** Informational footer following the class-exchange reverse lookup. */
const ItemExchangeToClassMapKeyFooter = struct({
    /** Uninterpreted four-byte footer prefix. */
    reserved00: bytes(4).reserved(),
    /** Absolute byte offset of this footer in the captured table. */
    footerOffset: u32(),
    /** Uninterpreted four-byte footer trailer. */
    reserved08: bytes(4).reserved(),
}).fixedLength(12);

/** Complete PABR reverse index for class-specific item exchange. */
export const ItemExchangeToClassMapKeyBss = bss(
    "itemexchangetoclassmapkey.bss",
)({
    /** Reverse lookups retained in physical table order. */
    rows: array(u32(), ItemExchangeToClassMapKeyRow),
    /** Informational footer retained with its numeric pointer. */
    footer: ItemExchangeToClassMapKeyFooter,
});

if (import.meta.main) {
    await ItemExchangeToClassMapKeyBss.load();
}
