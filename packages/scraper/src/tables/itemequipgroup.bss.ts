import { array, bytes, struct, u16, u32 } from "@marceloclp/bsd";

import { bss } from "./common/helpers";

/** One variable-width equipment-family membership group. */
const ItemEquipGroupRow = struct({
    /** Internal equipment-family identifier. */
    groupId: u16(),
    /** Second physical copy of `groupId`. */
    repeatedGroupId: u16(),
    /** Stored number of member item identifiers. */
    memberCount: u32().peek(),
    /** Member item identifiers in physical order. */
    itemIds: array(u32(), u32()),
}).check((row) => row.repeatedGroupId === row.groupId);

/** Informational PABR footer following the equipment groups. */
const ItemEquipGroupFooter = struct({
    /** Unused four-byte prefix before the footer self-pointer. */
    reserved00: bytes(4).reserved(),
    /** Absolute byte offset at which this footer begins. */
    footerOffset: u32(),
    /** Unused four-byte file terminator. */
    reserved08: bytes(4).reserved(),
}).fixedLength(12);

/** Complete physical equipment-family membership table. */
export const ItemEquipGroupBss = bss(
    "gamecommondata/binary/itemequipgroup.bss",
)({
    /** Stored group count retained independently of the decoded array. */
    rowCount: u32().peek(),
    /** Equipment groups in physical file order. */
    rows: array(u32(), ItemEquipGroupRow),
    /** Informational footer framing the table. */
    footer: ItemEquipGroupFooter,
});

if (import.meta.main) {
    await ItemEquipGroupBss.load();
}
