import { array, bytes, struct, u32 } from "@marceloclp/bsd";

import { bss } from "./common/helpers";

/** One improvement source selected for the client's default display list. */
const ItemImprovementDefaultDisplayListRow = struct({
    /** Item identifier resolving through `itemimprovementsource.dbss`. */
    sourceItemId: u32().positive(),
}).fixedLength(4);

/** Informational PABR footer following the fixed-width display-list rows. */
const ItemImprovementDefaultDisplayListFooter = struct({
    /** Reserved four-byte range before the footer pointer. */
    reserved00: bytes(4).reserved(),
    /** Absolute byte offset of this twelve-byte footer. */
    footerOffset: u32(),
    /** Reserved four-byte terminal range. */
    reserved08: bytes(4).reserved(),
}).fixedLength(12);

/** PABR-framed default item-improvement display list. */
export const ItemImprovementDefaultDisplayListBss = bss(
    "gamecommondata/binary/itemimprovementdefaultdisplaylist.bss",
)({
    /** Default-displayed source items in physical order. */
    rows: array(u32(), ItemImprovementDefaultDisplayListRow),
    /** Informational footer retained with its non-byte pointer value. */
    footer: ItemImprovementDefaultDisplayListFooter,
});

if (import.meta.main) {
    await ItemImprovementDefaultDisplayListBss.load();
}
