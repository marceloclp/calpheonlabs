import {
    array,
    bytes,
    i16,
    i64,
    literal,
    struct,
    u16,
    u24,
    u32,
    u64,
    u8,
    union,
} from "@marceloclp/bsd";
import { dbss } from "./common/helpers";

/** Returns whether an opaque structural byte range is entirely zero. */
function isZero(value: Uint8Array) {
    return value.every((byte) => byte === 0);
}

/** Item-subgroup member whose optional auxiliary and trade regions are empty. */
const ItemSubGroupMemberEmpty = struct({
    /** Decoder-emitted name of this intrinsically selected layout. */
    type: literal("empty"),
    /** Low 24 bits of the packed item/enhancement identity. */
    itemId: u24(),
    /** High byte of the packed identity, used as the enhancement level. */
    enhancementLevel: u8(),
    /** Required empty range at member-relative offsets `+4..+15`. */
    reserved04: bytes(12).check(isZero).reserved(),
    /** Required empty auxiliary payload at `+16..+45`. */
    auxiliary: bytes(30).check(isZero).reserved(),
    /** Neutral byte control at member-relative offset `+46`. */
    field46: u8(),
    /** Neutral byte control at member-relative offset `+47`. */
    field47: u8(),
    /** Required empty alignment range at `+48..+50`. */
    reserved48: bytes(3).check(isZero).reserved(),
    /** Neutral unsigned control at member-relative offset `+51`. */
    field51: u32(),
    /** Required empty non-trade tail at `+55..+134`. */
    reserved55: bytes(80).check(isZero).reserved(),
}).fixedLength(135);

/** Item-subgroup member carrying one nonzero auxiliary flag byte. */
const ItemSubGroupMemberSingleFlag = struct({
    /** Decoder-emitted name of this intrinsically selected layout. */
    type: literal("single_flag"),
    /** Low 24 bits of the packed item/enhancement identity. */
    itemId: u24(),
    /** High byte of the packed identity, used as the enhancement level. */
    enhancementLevel: u8(),
    /** Required empty range at member-relative offsets `+4..+15`. */
    reserved04: bytes(12).check(isZero).reserved(),
    /** Sole nonempty value in the otherwise empty auxiliary block. */
    auxiliary: struct({
        /** Nonzero auxiliary discriminator whose gameplay meaning is unresolved. */
        flag: u8().check((v) => v !== 0),
        /** Required empty remainder of the auxiliary block. */
        reserved: bytes(29).check(isZero).reserved(),
    }).fixedLength(30),
    /** Neutral byte control at member-relative offset `+46`. */
    field46: u8(),
    /** Neutral byte control at member-relative offset `+47`. */
    field47: u8(),
    /** Required empty alignment range at `+48..+50`. */
    reserved48: bytes(3).check(isZero).reserved(),
    /** Neutral unsigned control at member-relative offset `+51`. */
    field51: u32(),
    /** Required empty non-trade tail at `+55..+134`. */
    reserved55: bytes(80).check(isZero).reserved(),
}).fixedLength(135);

/** Item-subgroup member carrying the sentinel/constraint auxiliary layout. */
const ItemSubGroupMemberSentinel = struct({
    /** Decoder-emitted name of this intrinsically selected layout. */
    type: literal("sentinel"),
    /** Low 24 bits of the packed item/enhancement identity. */
    itemId: u24(),
    /** High byte of the packed identity, used as the enhancement level. */
    enhancementLevel: u8(),
    /** Required empty range at member-relative offsets `+4..+15`. */
    reserved04: bytes(12).check(isZero).reserved(),
    /** Structurally bounded sentinel and signed-value payload. */
    auxiliary: struct({
        /** Required zero word beginning the sentinel layout. */
        field16: u16().is(0),
        /** Eight required unset-slot sentinel words. */
        sentinels: array(8, u16().is(0xffff)),
        /** Signed row-local value whose gameplay operation remains unresolved. */
        signedValue34: i16(),
        /** Stored sign extension of `signedValue34`. */
        signedValue36: i16().in([-1, 0]),
        /** Required zero byte after the signed pair. */
        byte38: u8().is(0),
        /** Required empty remainder of the auxiliary block. */
        reserved: bytes(7).check(isZero).reserved(),
    })
        .fixedLength(30)
        .check((v) => v.signedValue36 === (v.signedValue34 < 0 ? -1 : 0)),
    /** Neutral byte control at member-relative offset `+46`. */
    field46: u8(),
    /** Neutral byte control at member-relative offset `+47`. */
    field47: u8(),
    /** Required empty alignment range at `+48..+50`. */
    reserved48: bytes(3).check(isZero).reserved(),
    /** Neutral unsigned control at member-relative offset `+51`. */
    field51: u32(),
    /** Required empty non-trade tail at `+55..+134`. */
    reserved55: bytes(80).check(isZero).reserved(),
}).fixedLength(135);

/** Item-subgroup member carrying the observed trade-value-band layout. */
const ItemSubGroupMemberTrade = struct({
    /** Decoder-emitted name of this intrinsically selected layout. */
    type: literal("trade"),
    /** Low 24 bits of the packed item/enhancement identity. */
    itemId: u24(),
    /** High byte of the packed identity, used as the enhancement level. */
    enhancementLevel: u8(),
    /** Required empty range at member-relative offsets `+4..+15`. */
    reserved04: bytes(12).check(isZero).reserved(),
    /** Intrinsic marker/sentinel prefix selecting the trade layout. */
    auxiliary: struct({
        /** Required `0x0100` trade-family marker. */
        marker: u16().is(0x0100),
        /** Eight required unset-slot sentinel words. */
        sentinels: array(8, u16().is(0xffff)),
        /** Required zero word before the variant byte. */
        field34: u32().is(0),
        /** Neutral structural variant code retained without an allow-list. */
        variantCode: u8(),
        /** Required empty remainder of the auxiliary block. */
        reserved: bytes(7).check(isZero).reserved(),
    }).fixedLength(30),
    /** Neutral byte control at member-relative offset `+46`. */
    field46: u8(),
    /** Neutral byte control at member-relative offset `+47`. */
    field47: u8(),
    /** Required empty alignment range at `+48..+50`. */
    reserved48: bytes(3).check(isZero).reserved(),
    /** Neutral unsigned control at member-relative offset `+51`. */
    field51: u32(),
    /** Required `0x0101` marker selecting the trade tail. */
    tradeMarker: u16().is(0x0101),
    /** Required empty alignment before the 64-bit value slots. */
    reserved57: bytes(2).check(isZero).reserved(),
    /** Complete unsigned base-value slot, serialized losslessly as decimal text. */
    baseValue64: u64().transform((v) => v.toString()),
    /**
     * Complete unsigned lower-bound slot, serialized losslessly as decimal
     * text.
     */
    lowerValue64: u64().transform((v) => v.toString()),
    /**
     * Complete unsigned upper-bound slot, serialized losslessly as decimal
     * text.
     */
    upperValue64: u64().transform((v) => v.toString()),
    /** Complete signed row-local slot, serialized losslessly as decimal text. */
    signedValue64: i64().transform((v) => v.toString()),
    /** Complete hundredth-unit slot, serialized losslessly as decimal text. */
    valueUnit64: u64().transform((v) => v.toString()),
    /** Required empty range before the final scalar. */
    reserved99: bytes(32).check(isZero).reserved(),
    /** Neutral final control scalar. */
    field131: u32(),
})
    .fixedLength(135)
    .check((v) => BigInt(v.valueUnit64) * 100n === BigInt(v.baseValue64));

/**
 * All four intrinsic 135-byte member layouts.
 *
 * Strong marker-bearing branches precede progressively more permissive
 * zero-region branches so every capture row selects from its own bytes.
 */
const ItemSubGroupMember = union(
    ItemSubGroupMemberTrade,
    ItemSubGroupMemberSentinel,
    ItemSubGroupMemberSingleFlag,
    ItemSubGroupMemberEmpty,
);

/** One self-framed subgroup header followed by fixed-width members. */
const ItemSubGroupGroup = struct({
    /** Internal subgroup identifier referenced by item-main-group rows. */
    groupId: u32(),
    /** Required empty ten-byte range after the subgroup identifier. */
    reserved: bytes(10).check(isZero).reserved(),
    /** Ordered members in physical file order. */
    members: array(u32(), ItemSubGroupMember),
});

/** Complete physical item-subgroup table without an offset-table dependency. */
export const ItemSubGroupDbss = dbss("gamecommondata/binary/itemsubgroup.dbss")(
    {
        /** Physical subgroups, required to have unique identifiers. */
        groups: array(u32(), ItemSubGroupGroup).check(
            (groups) =>
                new Set(groups.map((group) => group.groupId)).size ===
                groups.length,
        ),
    },
);

if (import.meta.main) {
    await ItemSubGroupDbss.decodeIntoDisk();
}
