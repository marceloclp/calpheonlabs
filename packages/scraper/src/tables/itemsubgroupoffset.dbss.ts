import { array, bytes, struct, u16, u32 } from "@marceloclp/bsd";

import { dbss } from "./common/helpers";

/** One fixed-width pointer to a complete `itemsubgroup.dbss` group. */
const ItemSubGroupOffsetRow = struct({
    /** Internal subgroup identifier repeated by the pointed-to group header. */
    groupId: u16(),
    /** Absolute byte offset of the matching subgroup header. */
    offset: u32(),
    /** Exact byte width of the matching subgroup and its members. */
    byteLength: u32(),
}).fixedLength(10);

/** Informational PABR footer following the subgroup pointer rows. */
const ItemSubGroupOffsetFooter = struct({
    /** Unused four-byte prefix before the footer self-pointer. */
    reserved00: bytes(4).reserved(),
    /** Absolute byte offset at which this footer begins. */
    footerOffset: u32(),
    /** Unused four-byte file terminator. */
    reserved08: bytes(4).reserved(),
}).fixedLength(12);

/** Complete physical pointer directory for `itemsubgroup.dbss`. */
export const ItemSubGroupOffsetDbss = dbss(
    "gamecommondata/binary/itemsubgroupoffset.dbss",
)({
    /** Validated PABR signature, omitted as a byte-only framing range. */
    magic: bytes(4)
        .check(
            (value) =>
                value[0] === 0x50 &&
                value[1] === 0x41 &&
                value[2] === 0x42 &&
                value[3] === 0x52,
        )
        .reserved(),
    /** Stored pointer count retained independently of the decoded array. */
    rowCount: u32().peek(),
    /** Subgroup pointers in directory-file order. */
    rows: array(u32(), ItemSubGroupOffsetRow),
    /** Informational footer framing the directory. */
    footer: ItemSubGroupOffsetFooter,
});

if (import.meta.main) {
    await ItemSubGroupOffsetDbss.load();
}
