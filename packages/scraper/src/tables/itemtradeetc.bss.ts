import { array, bytes, struct, u24, u32, u8 } from "@marceloclp/bsd";
import { reserved } from "./common/bsd";
import { table } from "./common/table";

/** One ten-byte directed conversion ratio. */
const ItemTradeEtcRatioEntry = struct({
    /** Source namespace repeated from the enclosing group. */
    sourceCode: u8(),
    /** Destination namespace produced by the conversion. */
    targetCode: u8(),
    /** Unused byte before the structural marker; zero in the verified capture. */
    reserved02: bytes(1).reserved(),
    /** Invariant 24-bit structural marker at entry offset `+3`. */
    marker24: u24().is(0x492ae6),
    /** Fixed-point conversion multiplier with denominator 1,000,000. */
    ratioNumerator: u32(),
}).fixedLength(10);

/** One source namespace and its outgoing conversion entries. */
const ItemTradeEtcRatioGroup = struct({
    /** Internal namespace from which every nested entry converts. */
    sourceCode: u8(),
    /** Directed conversion entries in physical order. */
    entries: array(u32(), ItemTradeEtcRatioEntry),
}).check((g) => g.entries.every((e) => e.sourceCode === g.sourceCode));

/** One twelve-byte trade-value threshold and multiplier. */
const ItemTradeEtcThreshold = struct({
    /** Inclusive stored trade-value boundary. */
    thresholdValue: u32(),
    /** Required zero word between the boundary and multiplier. */
    reserved04: reserved(4, 0),
    /** Fixed-point conversion multiplier with denominator 1,000,000. */
    ratioNumerator: u32(),
}).fixedLength(12);

/** Physical trade conversion configuration in its PABR envelope. */
export const ItemTradeEtcBss = table({
    path: "gamecommondata/binary/itemtradeetc.bss",
    pabr: true,
    rows: {
        ItemTradeEtcRatioGroup: { schema: ItemTradeEtcRatioGroup },
        ItemTradeEtcThreshold: { schema: ItemTradeEtcThreshold },
    },
});

if (import.meta.main) {
    await ItemTradeEtcBss.decodeIntoDisk();
}
