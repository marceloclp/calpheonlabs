import { array, bytes, struct, u16, u32 } from "@marceloclp/bsd";
import { markedUtf16Text } from "./common/bsd";
import { bss } from "./common/helpers";

/** One ten-byte reference from a main group to an item subgroup. */
const ItemMainGroupEntry = struct({
    /** Unused four-byte prefix before the two stored selectors. */
    reserved00: bytes(4).reserved(),
    /** Zero-based index into this table's condition trailer. */
    conditionIndex: u32(),
    /** Internal subgroup identifier resolved through `itemsubgroup.dbss`. */
    subgroupId: u16(),
}).fixedLength(10);

/** One variable-width main-group row and its ordered subgroup references. */
const ItemMainGroupRow = struct({
    /** Main-group identifier referenced by shop, NPC, and drop tables. */
    groupId: u32(),
    /** Neutral row-local control whose gameplay meaning remains unresolved. */
    field04: u32(),
    /** Unused four-byte range at row-relative offset `+8`. */
    reserved08: bytes(4).reserved(),
    /** Unused byte immediately before the varying marker. */
    reserved12: bytes(1).reserved(),
    /** Varying four-byte marker retained without a speculative interpretation. */
    marker13: bytes(4),
    /** Unused four-byte range at row-relative offset `+17`. */
    reserved17: bytes(4).reserved(),
    /** Unused four-byte range at row-relative offset `+21`. */
    reserved21: bytes(4).reserved(),
    /** Ordered subgroup and condition references. */
    entries: array(u32(), ItemMainGroupEntry),
});

/** Informational footer following the main-group condition dictionary. */
const ItemMainGroupFooter = struct({
    /** Absolute byte offset at which the condition dictionary begins. */
    trailerOffset: u32(),
    /** Unused four-byte file terminator. */
    reserved04: bytes(4).reserved(),
}).fixedLength(8);

/** Complete physical item-main-group table without companion joins. */
export const ItemMainGroupBss = bss("gamecommondata/binary/itemmaingroup.bss")({
    /** Main-group rows in physical file order. */
    rows: array(u32(), ItemMainGroupRow),
    /** Indexed condition expressions referenced by row entries. */
    trailer: array(u32(), markedUtf16Text()),
    /** Informational pointer to the condition dictionary. */
    footer: ItemMainGroupFooter,
});

if (import.meta.main) {
    await ItemMainGroupBss.decodeIntoDisk();
}
