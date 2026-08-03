import { array, bytes, struct, u16, u32, u8 } from "@marceloclp/bsd";
import { dbss } from "./common/helpers";

/** One fixed-width, 127-byte item-trade entry owned by an NPC. */
const ItemTradeGroupToNpcEntry = struct({
    /** NPC identifier repeated from the enclosing row. */
    npcId: u16(),
    /** Item identifier offered by this trade entry. */
    tradeItemId: u32(),
    /** Unused bytes between the item ID and `field54`; zero in the capture. */
    reserved06: bytes(48).reserved(),
    /** Raw unsigned trade-system control retained over its byte views. */
    field54: u16().peek(),
    /** Low byte of `field54`, shared with trade conversion namespaces. */
    namespaceCode: u8(),
    /** High byte of `field54`; its exact operation remains unresolved. */
    field55: u8(),
    /** Unused bytes between `field54` and `field107`; zero in the capture. */
    reserved56: bytes(51).reserved(),
    /** Raw unsigned control retained over two neutral byte views. */
    field107: u16().peek(),
    /** Low physical byte of `field107`. */
    field107LowByte: u8(),
    /** High physical byte of `field107`. */
    field108: u8(),
    /** Unused bytes between `field107` and `field124`; zero in the capture. */
    reserved109: bytes(15).reserved(),
    /** Raw unsigned control retained over two neutral byte views. */
    field124: u16().peek(),
    /** Low physical byte of `field124`. */
    field124LowByte: u8(),
    /** High physical byte of `field124`. */
    field125: u8(),
    /** Unused final byte; zero in the verified capture. */
    reserved126: bytes(1).reserved(),
}).fixedLength(127);

/** One variable-width NPC trade row framed by its own entry count. */
const ItemTradeGroupToNpcRow = struct({
    /** NPC that owns the nested item entries. */
    npcId: u16(),
    /** Fixed-width item entries in physical order. */
    entries: array(u32(), ItemTradeGroupToNpcEntry),
});

/** Complete intrinsic NPC trade-item table without offset-table dependencies. */
export const ItemTradeGroupToNpcDbss = dbss(
    "gamecommondata/binary/itemtradegrouptonpc.dbss",
)({
    /** Variable-width NPC trade rows in physical order. */
    rows: array(u32(), ItemTradeGroupToNpcRow),
});

if (import.meta.main) {
    await ItemTradeGroupToNpcDbss.load();
}
