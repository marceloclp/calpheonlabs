import {
    array,
    bytes,
    find,
    literal,
    offset,
    struct,
    u16,
    u24,
    u32,
    u8,
    union,
    type BsdShape,
} from "@marceloclp/bsd";
import { reserved } from "./common/bsd";
import { dbss } from "./common/helpers";

/** Number of bytes from the repeated key through the row end. */
const ITEM_ENCHANT_TRAILER_SIZE = 8;
/** Boolean byte that rejects non-canonical values instead of coercing them. */
const ItemEnchantBoolean = u8()
    .in(new Set([0, 1]))
    .transform((value) => value === 1);

/** Builds one discriminated fixed-prefix schema. */
function ItemEnchantType<const K extends string, S extends BsdShape>(
    type: K,
    shape: S,
) {
    return struct({
        layout: literal(type),
        /** Low 24 bits of the packed item/enhancement identity. */
        itemId: u24(),
        /** High byte of the packed identity, used as the enhancement level. */
        enhancementLevel: u8(),
        /** Client item-type code at row-relative offset `+4`. */
        itemTypeCode: u8(),
        /** Client item-classification code at row-relative offset `+5`. */
        itemClassifyCode: u8(),
        /** Client item-grade code at row-relative offset `+6`. */
        itemGradeCode: u8(),
        /** Numeric equipment-type code at row-relative offset `+7`. */
        equipTypeCode: u8(),
        /** Neutral byte control at row-relative offset `+8`. */
        field08: u8(),
        /** Neutral byte control at row-relative offset `+9`. */
        field09: u8(),
        /** Neutral byte control at row-relative offset `+10`. */
        field10: u8(),
        /** Neutral byte control at row-relative offset `+11`. */
        field11: u8(),
        /** Neutral byte control at row-relative offset `+12`. */
        field12: u8(),
        /** Neutral byte control at row-relative offset `+13`. */
        field13: u8(),
        /** Client equipment-slot code at row-relative offset `+14`. */
        equipSlotCode: u8(),
        /** Leading neutral control byte at row-relative offset `+15`. */
        field15: u8(),
        /** First neutral slot byte at row-relative offset `+16`. */
        field16: u8(),
        /** Second neutral slot byte at row-relative offset `+17`. */
        field17: u8(),
        /** Third neutral slot byte at row-relative offset `+18`. */
        field18: u8(),
        /** Required 43-byte `0x2e` framing region. */
        reserved19: reserved(43, 0x2e),
        /** Neutral byte at row-relative offset `+62`. */
        field62: u8(),
        /** Item weight numerator in ten-thousandths of one LT. */
        weightValue: u32(),
        /** Whether multiple copies share one inventory slot. */
        isStackable: ItemEnchantBoolean,
        /** Whether item use applies immediately. */
        appliesDirectly: ItemEnchantBoolean,
        /** Four opaque bytes at row-relative offsets `+69..+72`. */
        unknown69: bytes(4),
        /** Numeric vesting/binding mode. */
        vestingTypeCode: u8(),
        /** Whether a vested item belongs to the user rather than the family. */
        isUserVested: ItemEnchantBoolean,
        /** Whether the client exposes the item as tradeable. */
        isTradeable: ItemEnchantBoolean,
        /** Numeric trade-mode discriminator. */
        tradeTypeCode: u8(),
        /** Opaque bytes at row-relative offsets `+77..+109`. */
        unknown77: bytes(33),
        /** NPC purchase price. */
        buyPrice: u32(),
        /** Neutral word at row-relative offset `+114`. */
        field114: u32(),
        /** NPC sale price. */
        sellPrice: u32(),
        /** Neutral word at row-relative offset `+122`. */
        field122: u32(),
        /** Stored item repair price. */
        repairPrice: u32(),
        ...shape,
    });
}

/** Fixed 216-byte prefix of the installed expanded row layout. */
const ItemEnchantModernFixed = ItemEnchantType("modern", {
    /** Opaque bytes at modern row-relative offsets `+130..+148`. */
    unknown130Prefix: bytes(19),
    /** Opaque leading bytes of the twelve-byte layout expansion. */
    unknown149: bytes(6),
    /** Required empty middle of the twelve-byte layout expansion. */
    reserved155: reserved(5, 0),
    /** Neutral final byte of the twelve-byte layout expansion. */
    field160: u8(),
    /** Opaque bytes at modern row-relative offsets `+161..+163`. */
    unknown161: bytes(3),
    /** Whether this is a cash-shop item. */
    isCash: ItemEnchantBoolean,
    /** Opaque bytes at modern row-relative offsets `+165..+195`. */
    unknown165: bytes(31),
    /** Whether direct player-to-player trade is permitted. */
    isPersonalTrade: ItemEnchantBoolean,
    /** Opaque bytes at modern row-relative offsets `+197..+204`. */
    unknown197: bytes(8),
    /** Neutral word at modern row-relative offset `+205`. */
    field205: u16(),
    /** Opaque bytes at modern row-relative offsets `+207..+215`. */
    unknown207: bytes(9),
}).fixedLength(216);

/** Fixed 204-byte prefix of the pre-expansion row layout. */
const ItemEnchantLegacyFixed = ItemEnchantType("legacy", {
    /** Opaque bytes at legacy row-relative offsets `+130..+148`. */
    unknown130Prefix: bytes(19),
    /** Opaque bytes at legacy row-relative offsets `+149..+151`. */
    unknown149: bytes(3),
    /** Whether this is a cash-shop item. */
    isCash: ItemEnchantBoolean,
    /** Opaque bytes at legacy row-relative offsets `+153..+183`. */
    unknown153: bytes(31),
    /** Whether direct player-to-player trade is permitted. */
    isPersonalTrade: ItemEnchantBoolean,
    /** Opaque bytes at legacy row-relative offsets `+185..+192`. */
    unknown185: bytes(8),
    /** Neutral word at legacy row-relative offset `+193`. */
    field193: u16(),
    /** Opaque bytes at legacy row-relative offsets `+195..+203`. */
    unknown195: bytes(9),
}).fixedLength(204);

/** The only two viable fixed-prefix layouts, selected from their own bytes. */
const ItemEnchantFixed = union(ItemEnchantModernFixed, ItemEnchantLegacyFixed);

/** One unsuccessful candidate consumed by the intrinsic boundary search. */
const ItemEnchantBoundaryMiss = struct({
    kind: literal("miss"),
    candidateByte: u8(),
});

/** Creates the intrinsically bounded tail of a non-final item-enchant row. */
function itemEnchantNonFinalTail(
    packedKey: number,
    layout: "legacy" | "modern",
) {
    const BoundaryCandidate = struct({
        kind: literal("boundary"),
        /** Full packed row identity repeated eight bytes before row end. */
        repeatedRowKey: u32().is(packedKey),
        /** Neutral final row word retained without captured-domain checks. */
        trailerValue: u32(),
        /** The next row must begin with the same complete fixed-prefix schema. */
        nextFixed:
            layout === "modern"
                ? ItemEnchantModernFixed
                : ItemEnchantLegacyFixed,
    });
    const BoundarySearchStep = find(
        u8(),
        (value) => value === (packedKey & 0xff),
    ).pipe((candidateOffset, reader) =>
        struct({
            /** Opaque bytes before the next possible repeated-key candidate. */
            skipped: bytes(candidateOffset - reader.byteOffset).reserved(),
            /** Absolute candidate offset retained only during schema preview. */
            candidateOffset: offset(),
            /** A valid trailer plus next-row schema, or one byte of progress. */
            match: union(BoundaryCandidate, ItemEnchantBoundaryMiss),
        }),
    );

    return find(BoundarySearchStep, ({ match }) => match.kind === "boundary")
        .pipe((searchOffset, reader) =>
            struct({
                /** Failed search steps replayed only to reach the match. */
                skipped: bytes(searchOffset - reader.byteOffset).reserved(),
                /** Successful step previewed without consuming the payload. */
                boundary: BoundarySearchStep,
            }).peek(),
        )
        .pipe(({ boundary }, reader) =>
            struct({
                /** Opaque payload ending immediately before the repeated key. */
                payload: bytes(boundary.candidateOffset - reader.byteOffset),
                /** Full packed row identity repeated eight bytes before row end. */
                repeatedRowKey: u32().is(packedKey),
                /**
                 * Neutral final row word retained without captured-domain
                 * checks.
                 */
                trailerValue: u32(),
            }),
        );
}

/** Creates the EOF-bounded tail of the final item-enchant row. */
function itemEnchantFinalTail(packedKey: number) {
    return struct({
        /** Opaque final-row payload consuming all bytes before the trailer. */
        payload: offset()
            .transform((_value, reader) => {
                const byteLength = reader.remaining - ITEM_ENCHANT_TRAILER_SIZE;
                if (byteLength < 0) {
                    throw reader.fail(
                        "item-enchant final row is shorter than its trailer",
                    );
                }
                return byteLength;
            })
            .pipe((byteLength) => bytes(byteLength)),
        /** Full packed row identity repeated eight bytes before EOF. */
        repeatedRowKey: u32().is(packedKey),
        /** Neutral final row word retained without captured-domain checks. */
        trailerValue: u32(),
    });
}

/** Flattens a fixed row prefix and its lossless variable tail. */
function flattenItemEnchantRow<
    Fixed extends Record<string, unknown>,
    Tail extends Record<string, unknown>,
>({ fixed, tail }: { fixed: Fixed; tail: Tail }) {
    return { ...fixed, ...tail };
}

/** Creates one row whose layout and repeated-key boundary come from its bytes. */
function itemEnchantRow(isFinal: boolean) {
    return u32()
        .peek()
        .pipe((packedKey) =>
            ItemEnchantFixed.pipe((fixed) =>
                struct({
                    /** Fixed prefix already consumed by the layout union. */
                    fixed: literal(fixed),
                    /** Repeated-key-bounded opaque payload and trailer. */
                    tail: isFinal
                        ? itemEnchantFinalTail(packedKey)
                        : itemEnchantNonFinalTail(packedKey, fixed.layout),
                }).transform(flattenItemEnchantRow),
            ),
        );
}

/** Non-final row whose boundary is proven by its trailer and the next row. */
const ItemEnchantNonFinalRow = itemEnchantRow(false);
/** Final row whose variable payload is bounded by the table EOF. */
const ItemEnchantFinalRow = itemEnchantRow(true);

/** Complete item-enchant table with intrinsic row framing. */
export const ItemEnchantDbss = dbss("gamecommondata/binary/itemenchant.dbss")({
    /**
     * Physical rows. All but the final row use the repeated-key trailer plus
     * the next row's complete same-layout fixed schema; the final row is
     * bounded by EOF.
     */
    rows: u32()
        .positive()
        .pipe((rowCount) =>
            struct({
                /** Repeated-key-bounded rows before the final EOF-bounded row. */
                initialRows: array(rowCount - 1, ItemEnchantNonFinalRow),
                /** Sole row whose payload terminates at the table trailer. */
                finalRow: ItemEnchantFinalRow,
            }).transform(({ initialRows, finalRow }) => [
                ...initialRows,
                finalRow,
            ]),
        )
        .check((rows) => new Set(rows.map((row) => row.layout)).size === 1),
});

if (import.meta.main) {
    await ItemEnchantDbss.load();
}
