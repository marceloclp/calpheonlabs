import {
    array,
    bool,
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
} from "@marceloclp/bsd";

import { dbss } from "./common/helpers";

/** Number of bytes from the repeated key through the row end. */
const ITEM_ENCHANT_TRAILER_SIZE = 8;
/** Number of candidate starts inspected by one intrinsic boundary-search step. */
const ITEM_ENCHANT_SEARCH_STRIDE = 64;
/** Bytes needed to inspect one stride plus the next row's layout controls. */
const ITEM_ENCHANT_SEARCH_WINDOW = 268;

/** Returns whether a byte range is filled with one required value. */
function isFilledWith(value: Uint8Array, expected: number) {
    return value.every((byte) => byte === expected);
}

/**
 * Finds a repeated-key candidate followed by the next row's 43-byte dot region,
 * common Boolean controls, and layout-specific Boolean/reserved controls.
 * Returning `-1` means this window contains no row boundary.
 */
function locateItemEnchantBoundary(
    lookahead: Uint8Array,
    packedKey: number,
    layout: "legacy" | "modern",
) {
    const key0 = packedKey & 0xff;
    const key1 = (packedKey >>> 8) & 0xff;
    const key2 = (packedKey >>> 16) & 0xff;
    const key3 = packedKey >>> 24;

    for (
        let alignment = 0;
        alignment < ITEM_ENCHANT_SEARCH_STRIDE;
        alignment++
    ) {
        if (
            lookahead[alignment] !== key0 ||
            lookahead[alignment + 1] !== key1 ||
            lookahead[alignment + 2] !== key2 ||
            lookahead[alignment + 3] !== key3
        ) {
            continue;
        }

        let hasNextRowDotRegion = true;
        for (let index = alignment + 27; index <= alignment + 69; index++) {
            if (lookahead[index] !== 0x2e) {
                hasNextRowDotRegion = false;
                break;
            }
        }
        if (!hasNextRowDotRegion) continue;

        const nextRow = alignment + ITEM_ENCHANT_TRAILER_SIZE;
        const commonBooleanOffsets = [67, 68, 74, 75];
        if (
            commonBooleanOffsets.some(
                (offset) => lookahead[nextRow + offset]! > 1,
            )
        ) {
            continue;
        }

        if (layout === "modern") {
            if (
                lookahead[nextRow + 164]! > 1 ||
                lookahead[nextRow + 196]! > 1
            ) {
                continue;
            }
            let hasExpansionReservedBytes = true;
            for (let index = nextRow + 155; index <= nextRow + 159; index++) {
                if (lookahead[index] !== 0) {
                    hasExpansionReservedBytes = false;
                    break;
                }
            }
            if (!hasExpansionReservedBytes) continue;
        } else if (
            lookahead[nextRow + 152]! > 1 ||
            lookahead[nextRow + 184]! > 1
        ) {
            continue;
        }

        return alignment;
    }

    return -1;
}

/**
 * Search block used by `find` to locate one non-final row boundary.
 *
 * The lookahead does not advance the cursor; the explicit stride advances the
 * search in bounded chunks while checking every byte alignment in each chunk.
 */
const ItemEnchantBoundarySearchBlock = struct({
    /** Candidate starts plus enough bytes to prove the next row's dot region. */
    lookahead: bytes(ITEM_ENCHANT_SEARCH_WINDOW).peek(),
    /** Opaque payload bytes advanced after one unsuccessful search block. */
    stride: bytes(ITEM_ENCHANT_SEARCH_STRIDE),
});

/** Common fixed prefix shared by the legacy and modern row layouts. */
const ItemEnchantPrefixShape = {
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
    reserved19: bytes(43)
        .check((value) => isFilledWith(value, 0x2e))
        .reserved(),
    /** Neutral byte at row-relative offset `+62`. */
    field62: u8(),
    /** Item weight numerator in ten-thousandths of one LT. */
    weightValue: u32(),
    /** Whether multiple copies share one inventory slot. */
    isStackable: bool(),
    /** Whether item use applies immediately. */
    appliesDirectly: bool(),
    /** Four opaque bytes at row-relative offsets `+69..+72`. */
    unknown69: bytes(4),
    /** Numeric vesting/binding mode. */
    vestingTypeCode: u8(),
    /** Whether a vested item belongs to the user rather than the family. */
    isUserVested: bool(),
    /** Whether the client exposes the item as tradeable. */
    isTradeable: bool(),
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
} as const;

/** Fixed 216-byte prefix of the installed expanded row layout. */
const ItemEnchantModernFixed = struct({
    /** Decoder-emitted name of the expanded physical layout. */
    layout: literal("modern"),
    ...ItemEnchantPrefixShape,
    /** Opaque bytes at modern row-relative offsets `+130..+148`. */
    unknown130Prefix: bytes(19),
    /** Opaque leading bytes of the twelve-byte layout expansion. */
    unknown149: bytes(6),
    /** Required empty middle of the twelve-byte layout expansion. */
    reserved155: bytes(5)
        .check((value) => isFilledWith(value, 0))
        .reserved(),
    /** Neutral final byte of the twelve-byte layout expansion. */
    field160: u8(),
    /** Opaque bytes at modern row-relative offsets `+161..+163`. */
    unknown161: bytes(3),
    /** Whether this is a cash-shop item. */
    isCash: bool(),
    /** Opaque bytes at modern row-relative offsets `+165..+195`. */
    unknown165: bytes(31),
    /** Whether direct player-to-player trade is permitted. */
    isPersonalTrade: bool(),
    /** Opaque bytes at modern row-relative offsets `+197..+204`. */
    unknown197: bytes(8),
    /** Neutral word at modern row-relative offset `+205`. */
    field205: u16(),
    /** Opaque bytes at modern row-relative offsets `+207..+215`. */
    unknown207: bytes(9),
}).fixedLength(216);

/** Fixed 204-byte prefix of the pre-expansion row layout. */
const ItemEnchantLegacyFixed = struct({
    /** Decoder-emitted name of the pre-expansion physical layout. */
    layout: literal("legacy"),
    ...ItemEnchantPrefixShape,
    /** Opaque bytes at legacy row-relative offsets `+130..+148`. */
    unknown130Prefix: bytes(19),
    /** Opaque bytes at legacy row-relative offsets `+149..+151`. */
    unknown149: bytes(3),
    /** Whether this is a cash-shop item. */
    isCash: bool(),
    /** Opaque bytes at legacy row-relative offsets `+153..+183`. */
    unknown153: bytes(31),
    /** Whether direct player-to-player trade is permitted. */
    isPersonalTrade: bool(),
    /** Opaque bytes at legacy row-relative offsets `+185..+192`. */
    unknown185: bytes(8),
    /** Neutral word at legacy row-relative offset `+193`. */
    field193: u16(),
    /** Opaque bytes at legacy row-relative offsets `+195..+203`. */
    unknown195: bytes(9),
}).fixedLength(204);

/** Creates the intrinsically bounded tail of a non-final item-enchant row. */
function itemEnchantNonFinalTail(
    packedKey: number,
    layout: "legacy" | "modern",
) {
    return find(
        ItemEnchantBoundarySearchBlock,
        ({ lookahead }) =>
            locateItemEnchantBoundary(lookahead, packedKey, layout) !== -1,
    )
        .transform((blockStart, reader) => {
            const lookahead = reader.buffer.subarray(
                blockStart,
                blockStart + ITEM_ENCHANT_SEARCH_WINDOW,
            );
            const alignment = locateItemEnchantBoundary(
                lookahead,
                packedKey,
                layout,
            );
            if (alignment === -1) {
                throw reader.fail(
                    "item-enchant boundary search lost its validated candidate",
                );
            }
            return blockStart + alignment;
        })
        .pipe((boundaryOffset, reader) =>
            struct({
                /**
                 * Opaque variable payload ending immediately before the
                 * repeated key.
                 */
                payload: bytes(boundaryOffset - reader.byteOffset),
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
        .pipe((packedKey) => {
            return union(
                struct({
                    /** Expanded fixed prefix selected by its intrinsic controls. */
                    fixed: ItemEnchantModernFixed,
                    /** Repeated-key-bounded opaque payload and trailer. */
                    tail: isFinal
                        ? itemEnchantFinalTail(packedKey)
                        : itemEnchantNonFinalTail(packedKey, "modern"),
                }).transform(flattenItemEnchantRow),
                struct({
                    /**
                     * Pre-expansion fixed prefix selected by its intrinsic
                     * controls.
                     */
                    fixed: ItemEnchantLegacyFixed,
                    /** Repeated-key-bounded opaque payload and trailer. */
                    tail: isFinal
                        ? itemEnchantFinalTail(packedKey)
                        : itemEnchantNonFinalTail(packedKey, "legacy"),
                }).transform(flattenItemEnchantRow),
            );
        });
}

/** Non-final row whose boundary is proven by its trailer and the next row. */
const ItemEnchantNonFinalRow = itemEnchantRow(false);
/** Final row whose variable payload is bounded by the table EOF. */
const ItemEnchantFinalRow = itemEnchantRow(true);

/** Complete item-enchant table with intrinsic row framing. */
export const ItemEnchantDbss = dbss("gamecommondata/binary/itemenchant.dbss")({
    /** Stored item/enhancement row count retained independently of the array. */
    rowCount: u32().peek(),
    /**
     * Physical rows. All but the final row use the repeated-key trailer plus
     * the next row's fixed dot region; the final row is bounded by EOF.
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
