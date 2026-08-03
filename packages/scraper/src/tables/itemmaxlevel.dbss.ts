import { array, bytes, struct, u32, u8 } from "@marceloclp/bsd";
import { bss } from "./common/helpers";

/** One fixed five-byte item maximum-enhancement record. */
const ItemMaxLevelRow = struct({
    /** Item-family identifier shared by item-keyed tables. */
    itemId: u32(),
    /** Highest stored enhancement level; zero means no enhanced variants. */
    maxEnhancementLevel: u8(),
}).fixedLength(5);

/** Informational PABR footer following the fixed-width maximum-level rows. */
const ItemMaxLevelFooter = struct({
    /** Reserved four-byte range before the footer pointer. */
    reserved00: bytes(4).reserved(),
    /** Absolute byte offset of this twelve-byte footer. */
    footerOffset: u32(),
    /** Reserved four-byte terminal range. */
    reserved08: bytes(4).reserved(),
}).fixedLength(12);

/** PABR-framed item maximum-enhancement table. */
export const ItemMaxLevelDbss = bss("gamecommondata/binary/itemmaxlevel.dbss")({
    /** Fixed-width maximum-level rows in physical order. */
    rows: array(u32(), ItemMaxLevelRow),
    /** Informational footer retained with its non-byte pointer value. */
    footer: ItemMaxLevelFooter,
});

if (import.meta.main) {
    await ItemMaxLevelDbss.load();
}
