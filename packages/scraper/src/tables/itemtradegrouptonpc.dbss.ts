import { array, bytes, struct, u16, u32, u8 } from "@marceloclp/bsd";

import { dbss } from "./common/helpers";

/** One fixed-width, 127-byte item-trade entry owned by an NPC. */
const ItemTradeGroupToNpcEntry = struct({
    /** NPC identifier repeated from the enclosing row. */
    npcId: u16(),
    /** Item identifier offered by this trade entry. */
    tradeItemId: u32(),
    /** Required zero bytes between the item ID and `field54`. */
    reserved06: bytes(48)
        .check((value) => value.every((byte) => byte === 0))
        .reserved(),
    /** Raw unsigned trade-system control retained over its byte views. */
    field54: u16().peek(),
    /** Low byte of `field54`, shared with trade conversion namespaces. */
    namespaceCode: u8(),
    /** High byte of `field54`; its exact operation remains unresolved. */
    field55: u8(),
    /** Required zero bytes between `field54` and `field107`. */
    reserved56: bytes(51)
        .check((value) => value.every((byte) => byte === 0))
        .reserved(),
    /** Raw unsigned control retained over two neutral byte views. */
    field107: u16().peek(),
    /** Low physical byte of `field107`. */
    field107LowByte: u8(),
    /** High physical byte of `field107`. */
    field108: u8(),
    /** Required zero bytes between `field107` and `field124`. */
    reserved109: bytes(15)
        .check((value) => value.every((byte) => byte === 0))
        .reserved(),
    /** Raw unsigned control retained over two neutral byte views. */
    field124: u16().peek(),
    /** Low physical byte of `field124`. */
    field124LowByte: u8(),
    /** High physical byte of `field124`. */
    field125: u8(),
    /** Required zero byte completing the entry. */
    reserved126: bytes(1)
        .check((value) => value[0] === 0)
        .reserved(),
}).fixedLength(127);

/** Validates the stored repeated-key relationship within one NPC row. */
function hasRepeatedNpcIds(row: {
    npcId: number;
    entries: Array<{ npcId: number }>;
}) {
    return row.entries.every((entry) => entry.npcId === row.npcId);
}

/** One variable-width NPC trade row framed by its own entry count. */
const ItemTradeGroupToNpcRow = struct({
    /** NPC that owns the nested item entries. */
    npcId: u16(),
    /** Stored entry count retained while the array rereads its prefix. */
    entryCount: u32().peek(),
    /** Fixed-width item entries in physical order. */
    entries: array(u32(), ItemTradeGroupToNpcEntry),
}).check(hasRepeatedNpcIds);

/** Complete intrinsic NPC trade-item table without offset-table dependencies. */
export const ItemTradeGroupToNpcDbss = dbss(
    "gamecommondata/binary/itemtradegrouptonpc.dbss",
)({
    /** Stored NPC-row count retained while `rows` rereads the prefix. */
    rowCount: u32().peek(),
    /** Variable-width NPC trade rows in physical order. */
    rows: array(u32(), ItemTradeGroupToNpcRow),
});

if (import.meta.main) {
    await ItemTradeGroupToNpcDbss.load();
}
