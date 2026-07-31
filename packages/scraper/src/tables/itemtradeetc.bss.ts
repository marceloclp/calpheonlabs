import { array, bytes, struct, u24, u32, u8 } from "@marceloclp/bsd";

import { bss } from "./common/helpers";

/** Fixed 24-bit marker stored in every conversion entry. */
const RATIO_ENTRY_MARKER = 0x492ae6;

/** One ten-byte directed conversion ratio. */
const ItemTradeEtcRatioEntry = struct({
    /** Source namespace repeated from the enclosing group. */
    sourceCode: u8(),
    /** Destination namespace produced by the conversion. */
    targetCode: u8(),
    /** Required zero byte before the structural marker. */
    reserved02: bytes(1)
        .check((value) => value[0] === 0)
        .reserved(),
    /** Invariant 24-bit structural marker at entry offset `+3`. */
    marker24: u24().is(RATIO_ENTRY_MARKER),
    /** Fixed-point conversion multiplier with denominator 1,000,000. */
    ratioNumerator: u32(),
}).fixedLength(10);

/** One source namespace and its outgoing conversion entries. */
const ItemTradeEtcRatioGroup = struct({
    /** Internal namespace from which every nested entry converts. */
    sourceCode: u8(),
    /** Directed conversion entries in physical order. */
    entries: array(u32(), ItemTradeEtcRatioEntry),
}).check((group) =>
    group.entries.every((entry) => entry.sourceCode === group.sourceCode),
);

/** One twelve-byte trade-value threshold and multiplier. */
const ItemTradeEtcThreshold = struct({
    /** Inclusive stored trade-value boundary. */
    thresholdValue: u32(),
    /** Required zero word between the boundary and multiplier. */
    reserved04: bytes(4)
        .check((value) => value.every((byte) => byte === 0))
        .reserved(),
    /** Fixed-point conversion multiplier with denominator 1,000,000. */
    ratioNumerator: u32(),
}).fixedLength(12);

/** Informational twelve-byte footer after the conversion configuration. */
const ItemTradeEtcFooter = struct({
    /** Four-byte leading footer word; zero in the verified capture. */
    reserved00: bytes(4).reserved(),
    /** Stored absolute byte offset of this footer. */
    footerOffset: u32(),
    /** Four-byte trailing footer word; zero in the verified capture. */
    reserved08: bytes(4).reserved(),
}).fixedLength(12);

/** Physical trade conversion configuration in its PABR envelope. */
export const ItemTradeEtcBss = bss("gamecommondata/binary/itemtradeetc.bss")({
    /** Stored ratio-group count retained alongside the decoded array. */
    ratioGroupCount: u32().peek(),
    /** Source-code groups in physical order. */
    ratioGroups: array(u32(), ItemTradeEtcRatioGroup),
    /** Stored threshold count retained alongside the decoded array. */
    thresholdCount: u32().peek(),
    /** Trade-value thresholds in physical order. */
    thresholds: array(u32(), ItemTradeEtcThreshold),
    /** Informational footer framing the end of the table. */
    footer: ItemTradeEtcFooter,
});

if (import.meta.main) {
    await ItemTradeEtcBss.load();
}
