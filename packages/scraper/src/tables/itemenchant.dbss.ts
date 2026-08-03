import {
    array,
    bool,
    bytes,
    literal,
    offset,
    struct,
    u16,
    u24,
    u32,
    u64,
    u8,
    union,
    type BsdShape,
} from "@marceloclp/bsd";
import { asciiText64, reserved, utf16Text64 } from "./common/bsd";
import { dbssRows } from "./common/dbss-rows";

const ItemEnchantFixed = struct({
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
    /** Opaque bytes at row-relative offsets `+130..+148`. */
    unknown130Prefix: bytes(19),
    /** Opaque leading bytes of the twelve-byte layout expansion. */
    unknown149: bytes(6),
    /** Required empty middle of the twelve-byte layout expansion. */
    reserved155: reserved(5, 0),
    /** Neutral final byte of the twelve-byte layout expansion. */
    field160: u8(),
    /** Opaque bytes at row-relative offsets `+161..+163`. */
    unknown161: bytes(3),
    /** Whether this is a cash-shop item. */
    isCash: bool(),
    /** Opaque bytes at row-relative offsets `+165..+195`. */
    unknown165: bytes(31),
    /** Whether direct player-to-player trade is permitted. */
    isPersonalTrade: bool(),
    /** Opaque bytes at row-relative offsets `+197..+204`. */
    unknown197: bytes(8),
    /** Neutral word at row-relative offset `+205`. */
    field205: u16(),
    /** Opaque bytes at row-relative offsets `+207..+211`. */
    unknown207: bytes(5),
}).fixedLength(212);

/**
 * An ItemEnchant row is laid out as such:
 *
 * | Frame                             | Description                          |
 * | :-------------------------------- | :----------------------------------- |
 * | `ItemEnchantFixed`                | Fixed 212-byte row prefix.           |
 * | `ItemEnchantVariable*`            | Union of variable-length branches.   |
 * | `repeatedRowKey` + `trailerValue` | Terminates and validates the branch. |
 *
 * A branch succeeds only when its repeated key equals the little-endian packed
 * identity at `rowStart`, proving that the schema reached the row trailer.
 */
function ItemEnchantVariable<const K extends string, S extends BsdShape>(
    key: K,
    shape: S,
) {
    return struct({
        $type: literal(key),
        /** Absolute byte offset of the row start in a complete-table decode. */
        rowStart: offset().transform((x) => x - 212),
        ...shape,
        /** Neutral scalar immediately before the item name. */
        fieldBeforeName: u32(),
        /** Client item name framed by a 64-bit UTF-16 character count. */
        name: utf16Text64(),
        /** Client icon resource path framed by a 64-bit ASCII byte count. */
        iconPath: asciiText64(),
        /** Fixed controls immediately following the icon path. */
        postIcon: bytes(18),
        /** First post-icon UTF-16 expression or client text. */
        postIconTextA: utf16Text64(),
        /** Second post-icon UTF-16 expression or client text. */
        postIconTextB: utf16Text64(),
        /** Third post-icon UTF-16 expression or client text. */
        postIconTextC: utf16Text64(),
        /** Unsigned market-registration limit retained as a decimal string. */
        marketLimit: u64().transform((value) => value.toString()),
        /** Fixed post-market region whose individual meanings remain unknown. */
        fixed84: bytes(84),
        /** Fixed prefix of the formerly opaque type-dependent tail. */
        tailPrefix82: bytes(82),
        /** First tail list; each entry is sixteen opaque bytes. */
        tailEntries16: array(u32(), bytes(16)),
        /** Fixed region between the first and second tail lists. */
        tailMiddle40: bytes(40),
        /** Second tail list; each entry is twelve opaque bytes. */
        tailEntries12: array(u32(), bytes(12)),
        /** Fixed region before the first scalar tail list. */
        tailMiddle8: bytes(8),
        /** First counted list of neutral 32-bit tail values. */
        tailValuesA: array(u32(), u32()),
        /** Fixed region before the second scalar tail list. */
        tailMiddle45: bytes(45),
        /** Second counted list of neutral 32-bit tail values. */
        tailValuesB: array(u32(), u32()),
        /** Fixed region before the final three tail strings. */
        tailMiddle15: bytes(15),
        /** First final-tail UTF-16 expression or client text. */
        tailTextA: utf16Text64(),
        /** Final-tail ASCII expression, sound key, or client text. */
        tailAsciiText: asciiText64(),
        /** Second final-tail UTF-16 expression or client text. */
        tailTextB: utf16Text64(),
        /** Third counted list of neutral 32-bit tail values. */
        tailValuesC: array(u32(), u32()),
        /** Five opaque bytes before the final counted list. */
        tailMiddle5: bytes(5),
        /**
         * Final counted list of neutral 16-bit tail values. Current captures
         * store three zero upper count bytes, so their conceptual ownership as
         * count bits versus reserved bytes remains unresolved.
         */
        tailValues16: array(u32(), u16()),
        /** Twelve opaque bytes immediately before the row trailer. */
        tailSuffix12: bytes(12),
        /** Full packed row identity repeated eight bytes before row end. */
        repeatedRowKey: u32(),
        /** Neutral final row word retained without captured-domain checks. */
        trailerValue: u32(),
    }).check((row, reader) => {
        const rowKey = reader.view.getUint32(row.rowStart, true);
        return rowKey === row.repeatedRowKey;
    });
}

/** Layout with five-byte entries followed by 32-bit values. */
const ItemEnchantVariableStandard = ItemEnchantVariable("standard", {
    /** First counted sequence of opaque five-byte entries. */
    firstEntries: array(u32(), bytes(5)),
    /** Fixed bytes between the two pre-name lists. */
    betweenLists: bytes(8),
    /** Counted sequence of neutral 32-bit values. */
    secondValues: array(u32(), u32()),
});

/** Layout containing two adjacent five-byte entry lists. */
const ItemEnchantVariableFive = ItemEnchantVariable("five", {
    /** First counted sequence of opaque five-byte entries. */
    firstEntries: array(u32(), bytes(5)),
    /** Second counted sequence of opaque five-byte entries. */
    secondEntries: array(u32(), bytes(5)),
    /** Fixed bytes after the two pre-name lists. */
    afterLists: bytes(8),
});

/** Two-list layout with a one-byte control between the lists. */
const ItemEnchantVariableByteFive = ItemEnchantVariable("byte-five", {
    /** First counted sequence of opaque five-byte entries. */
    firstEntries: array(u32(), bytes(5)),
    /** Neutral one-byte control between the two lists. */
    betweenLists: u8(),
    /** Second counted sequence of opaque five-byte entries. */
    secondEntries: array(u32(), bytes(5)),
    /** Fixed bytes after the two pre-name lists. */
    afterLists: bytes(8),
});

/** Two-list layout with a four-byte control between the lists. */
const ItemEnchantVariableWordFive = ItemEnchantVariable("word-five", {
    /** First counted sequence of opaque five-byte entries. */
    firstEntries: array(u32(), bytes(5)),
    /** Neutral four-byte control between the two lists. */
    betweenLists: u32(),
    /** Second counted sequence of opaque five-byte entries. */
    secondEntries: array(u32(), bytes(5)),
    /** Fixed bytes after the two pre-name lists. */
    afterLists: bytes(8),
});

const ItemEnchantRow = struct({
    fixed: ItemEnchantFixed,
    variable: union(
        ItemEnchantVariableStandard,
        ItemEnchantVariableFive,
        ItemEnchantVariableByteFive,
        ItemEnchantVariableWordFive,
    ),
}).transform((row) => ({ ...row.fixed, ...row.variable })).omit({
    rowStart: true,
});

/** Complete item-enchant table with intrinsic row framing and streaming output. */
export const ItemEnchantDbss = dbssRows(
    "gamecommondata/binary/itemenchant.dbss",
    ItemEnchantRow,
);

if (import.meta.main) {
    await ItemEnchantDbss.load();
}
