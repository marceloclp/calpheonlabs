import {
    array,
    bool,
    bytes,
    literal,
    struct,
    u16,
    u24,
    u32,
    u64,
    u8,
    union,
} from "@marceloclp/bsd";
import { asciiText64, reserved, utf16Text64 } from "./common/bsd";
import { table } from "./common/table";

/** Fixed 212-byte prefix shared by every build-2954 row variation. */
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

/** Five-byte entries followed by an eight-byte gap and 32-bit values. */
const ItemEnchantPreNameStandard = struct({
    layout: literal("standard"),
    firstEntries: array(u32().lte(1_024), bytes(5)),
    betweenLists: bytes(8),
    secondValues: array(u32().lte(1_024), u32()),
});

/** Two adjacent counted lists of five-byte entries. */
const ItemEnchantPreNameFive = struct({
    layout: literal("five"),
    firstEntries: array(u32().lte(1_024), bytes(5)),
    secondEntries: array(u32().lte(1_024), bytes(5)),
    afterLists: bytes(8),
});

/** Two five-byte-entry lists separated by one neutral byte. */
const ItemEnchantPreNameByteFive = struct({
    layout: literal("byte-five"),
    firstEntries: array(u32().lte(1_024), bytes(5)),
    betweenLists: u8(),
    secondEntries: array(u32().lte(1_024), bytes(5)),
    afterLists: bytes(8),
});

/** Two five-byte-entry lists separated by one neutral 32-bit word. */
const ItemEnchantPreNameWordFive = struct({
    layout: literal("word-five"),
    firstEntries: array(u32().lte(1_024), bytes(5)),
    betweenLists: u32(),
    secondEntries: array(u32().lte(1_024), bytes(5)),
    afterLists: bytes(8),
});

/** Shared string and market-limit block following every pre-name layout. */
const ItemEnchantTexts = struct({
    fieldBeforeName: u32(),
    name: utf16Text64(),
    iconPath: asciiText64(),
    postIcon: bytes(18),
    postIconTextA: utf16Text64(),
    postIconTextB: utf16Text64(),
    postIconTextC: utf16Text64(),
    marketLimit: u64().transform((value) => value.toString()),
});

/** Standard 168-byte post-market prefix retained in its known 86/82 split. */
const ItemEnchantPostMarketPrefix168 = struct({
    layout: literal("168-byte"),
    fixed86: bytes(86),
    tailPrefix82: bytes(82),
});

/** Opaque 164-byte post-market prefix variation. */
const ItemEnchantPostMarketPrefix164 = struct({
    layout: literal("164-byte"),
    unknown: bytes(164),
});

/** Opaque 180-byte post-market prefix variation. */
const ItemEnchantPostMarketPrefix180 = struct({
    layout: literal("180-byte"),
    unknown: bytes(180),
});

/** Opaque 140-byte post-market prefix variation. */
const ItemEnchantPostMarketPrefix140 = struct({
    layout: literal("140-byte"),
    unknown: bytes(140),
});

/** Opaque 116-byte post-market prefix variation. */
const ItemEnchantPostMarketPrefix116 = struct({
    layout: literal("116-byte"),
    unknown: bytes(116),
});

/** Opaque 125-byte post-market prefix variation. */
const ItemEnchantPostMarketPrefix125 = struct({
    layout: literal("125-byte"),
    unknown: bytes(125),
});

/** Opaque 126-byte post-market prefix variation. */
const ItemEnchantPostMarketPrefix126 = struct({
    layout: literal("126-byte"),
    unknown: bytes(126),
});

/** Opaque 132-byte post-market prefix variation. */
const ItemEnchantPostMarketPrefix132 = struct({
    layout: literal("132-byte"),
    unknown: bytes(132),
});

/** Counted lists and fixed separators following every post-market prefix. */
const ItemEnchantPostMarketLists = struct({
    entries16: array(u32().lte(2), bytes(16)),
    unknownAfterEntries16: bytes(40),
    entries12: array(u32().lte(3), bytes(12)),
    unknownBeforeValuesA: bytes(8),
    valuesA: array(u32().lte(58), u32()),
});

/** Opaque 36-byte region before the second scalar tail list. */
const ItemEnchantMiddle36 = struct({
    layout: literal("36-byte"),
    unknown: bytes(36),
});

/** Opaque 48-byte region before the second scalar tail list. */
const ItemEnchantMiddle48 = struct({
    layout: literal("48-byte"),
    unknown: bytes(48),
});

/** Opaque 50-byte region before the second scalar tail list. */
const ItemEnchantMiddle50 = struct({
    layout: literal("50-byte"),
    unknown: bytes(50),
});

/** Opaque 64-byte region before the second scalar tail list. */
const ItemEnchantMiddle64 = struct({
    layout: literal("64-byte"),
    unknown: bytes(64),
});

/** Opaque 76-byte region before the second scalar tail list. */
const ItemEnchantMiddle76 = struct({
    layout: literal("76-byte"),
    unknown: bytes(76),
});

/** Opaque 88-byte region before the second scalar tail list. */
const ItemEnchantMiddle88 = struct({
    layout: literal("88-byte"),
    unknown: bytes(88),
});

/** Opaque 104-byte region before the second scalar tail list. */
const ItemEnchantMiddle104 = struct({
    layout: literal("104-byte"),
    unknown: bytes(104),
});

/** Opaque 108-byte region before the second scalar tail list. */
const ItemEnchantMiddle108 = struct({
    layout: literal("108-byte"),
    unknown: bytes(108),
});

/** Opaque 116-byte region before the second scalar tail list. */
const ItemEnchantMiddle116 = struct({
    layout: literal("116-byte"),
    unknown: bytes(116),
});

/** Opaque 122-byte region before the second scalar tail list. */
const ItemEnchantMiddle122 = struct({
    layout: literal("122-byte"),
    unknown: bytes(122),
});

/** Opaque 123-byte region before the second scalar tail list. */
const ItemEnchantMiddle123 = struct({
    layout: literal("123-byte"),
    unknown: bytes(123),
});

/** Opaque 228-byte region before the second scalar tail list. */
const ItemEnchantMiddle228 = struct({
    layout: literal("228-byte"),
    unknown: bytes(228),
});

/** Opaque 280-byte region before the second scalar tail list. */
const ItemEnchantMiddle280 = struct({
    layout: literal("280-byte"),
    unknown: bytes(280),
});

/** 52-byte middle variation retained as its stable 48+4 expansion. */
const ItemEnchantMiddle52 = struct({
    layout: literal("52-byte"),
    unknown48: bytes(48),
    extension4: bytes(4),
});

/** No bytes occur before the first final-tail text in this variation. */
const ItemEnchantPreTextDirect = struct({ layout: literal("direct") });

/** Opaque 4-byte expansion before the first final-tail text. */
const ItemEnchantPreText4 = struct({
    layout: literal("4-byte"),
    unknown: bytes(4),
});

/** Opaque 8-byte expansion before the first final-tail text. */
const ItemEnchantPreText8 = struct({
    layout: literal("8-byte"),
    unknown: bytes(8),
});

/** Opaque 12-byte expansion before the first final-tail text. */
const ItemEnchantPreText12 = struct({
    layout: literal("12-byte"),
    unknown: bytes(12),
});

/** Opaque 16-byte expansion before the first final-tail text. */
const ItemEnchantPreText16 = struct({
    layout: literal("16-byte"),
    unknown: bytes(16),
});

/** Opaque 20-byte expansion before the first final-tail text. */
const ItemEnchantPreText20 = struct({
    layout: literal("20-byte"),
    unknown: bytes(20),
});

/** Opaque 24-byte expansion before the first final-tail text. */
const ItemEnchantPreText24 = struct({
    layout: literal("24-byte"),
    unknown: bytes(24),
});

/** Opaque 28-byte expansion before the first final-tail text. */
const ItemEnchantPreText28 = struct({
    layout: literal("28-byte"),
    unknown: bytes(28),
});

/** No bytes occur between the first final-tail and ASCII texts. */
const ItemEnchantPostTextDirect = struct({ layout: literal("direct") });

/** Opaque twelve-byte expansion between the first final-tail and ASCII texts. */
const ItemEnchantPostText12 = struct({
    layout: literal("12-byte"),
    unknown: bytes(12),
});

/** Standard counted 32-bit values and 15-byte trailer prefix. */
const ItemEnchantSuffix15 = struct({
    layout: literal("15-byte"),
    valuesC: array(u32().lte(648), u32()),
    unknown: bytes(15),
    repeatedRowKey: u32(),
    trailerValue: u16(),
});

/** Counted 32-bit values and expanded 17-byte trailer prefix. */
const ItemEnchantSuffix17 = struct({
    layout: literal("17-byte"),
    valuesC: array(u32().lte(648), u32()),
    unknown: bytes(17),
    repeatedRowKey: u32(),
    trailerValue: u16(),
});

/** Legacy final counted 16-bit values and ten-byte trailer prefix. */
const ItemEnchantSuffixCountedU16 = struct({
    layout: literal("counted-u16"),
    unknownBeforeValues16: bytes(5),
    values16: array(u32().lte(64), u16()),
    unknown: bytes(10),
    repeatedRowKey: u32(),
    trailerValue: u16(),
});

/** Exercised late-tail layout: standard-48/direct/direct/standard-15. */
const ItemEnchantTailMiddle48PreTextDirectPostTextDirectSuffix15 = struct({
    /** Complete physical discriminator for this late-tail branch. */
    layout: literal("standard-48/direct/direct/standard-15"),
    /** Fixed-width region before the second scalar list. */
    middle: ItemEnchantMiddle48,
    /** Second counted list of neutral 32-bit tail values. */
    valuesB: array(u32().lte(8), u32()),
    /** Opaque 20-byte region before the optional pre-text expansion. */
    unknownAfterValuesB: bytes(20),
    /** Optional opaque expansion before the first final text. */
    preText: ItemEnchantPreTextDirect,
    /** First final-tail UTF-16 expression or client text. */
    textA: utf16Text64(),
    /** Optional opaque expansion after the first final text. */
    postText: ItemEnchantPostTextDirect,
    /** Final-tail ASCII expression, sound key, or client text. */
    asciiText: asciiText64(),
    /** Second final-tail UTF-16 expression or client text. */
    textB: utf16Text64(),
    /** Counted values and fixed row trailer for this branch. */
    suffix: ItemEnchantSuffix15,
});

/** Exercised late-tail layout: standard-48/extra-word/direct/standard-15. */
const ItemEnchantTailMiddle48PreText4PostTextDirectSuffix15 = struct({
    /** Complete physical discriminator for this late-tail branch. */
    layout: literal("standard-48/extra-word/direct/standard-15"),
    /** Fixed-width region before the second scalar list. */
    middle: ItemEnchantMiddle48,
    /** Second counted list of neutral 32-bit tail values. */
    valuesB: array(u32().lte(8), u32()),
    /** Opaque 20-byte region before the optional pre-text expansion. */
    unknownAfterValuesB: bytes(20),
    /** Optional opaque expansion before the first final text. */
    preText: ItemEnchantPreText4,
    /** First final-tail UTF-16 expression or client text. */
    textA: utf16Text64(),
    /** Optional opaque expansion after the first final text. */
    postText: ItemEnchantPostTextDirect,
    /** Final-tail ASCII expression, sound key, or client text. */
    asciiText: asciiText64(),
    /** Second final-tail UTF-16 expression or client text. */
    textB: utf16Text64(),
    /** Counted values and fixed row trailer for this branch. */
    suffix: ItemEnchantSuffix15,
});

/** Exercised late-tail layout: standard-48/extra-double-word/direct/standard-15. */
const ItemEnchantTailMiddle48PreText8PostTextDirectSuffix15 = struct({
    /** Complete physical discriminator for this late-tail branch. */
    layout: literal("standard-48/extra-double-word/direct/standard-15"),
    /** Fixed-width region before the second scalar list. */
    middle: ItemEnchantMiddle48,
    /** Second counted list of neutral 32-bit tail values. */
    valuesB: array(u32().lte(8), u32()),
    /** Opaque 20-byte region before the optional pre-text expansion. */
    unknownAfterValuesB: bytes(20),
    /** Optional opaque expansion before the first final text. */
    preText: ItemEnchantPreText8,
    /** First final-tail UTF-16 expression or client text. */
    textA: utf16Text64(),
    /** Optional opaque expansion after the first final text. */
    postText: ItemEnchantPostTextDirect,
    /** Final-tail ASCII expression, sound key, or client text. */
    asciiText: asciiText64(),
    /** Second final-tail UTF-16 expression or client text. */
    textB: utf16Text64(),
    /** Counted values and fixed row trailer for this branch. */
    suffix: ItemEnchantSuffix15,
});

/** Exercised late-tail layout: standard-48/extra-three-word/direct/standard-15. */
const ItemEnchantTailMiddle48PreText12PostTextDirectSuffix15 = struct({
    /** Complete physical discriminator for this late-tail branch. */
    layout: literal("standard-48/extra-three-word/direct/standard-15"),
    /** Fixed-width region before the second scalar list. */
    middle: ItemEnchantMiddle48,
    /** Second counted list of neutral 32-bit tail values. */
    valuesB: array(u32().lte(8), u32()),
    /** Opaque 20-byte region before the optional pre-text expansion. */
    unknownAfterValuesB: bytes(20),
    /** Optional opaque expansion before the first final text. */
    preText: ItemEnchantPreText12,
    /** First final-tail UTF-16 expression or client text. */
    textA: utf16Text64(),
    /** Optional opaque expansion after the first final text. */
    postText: ItemEnchantPostTextDirect,
    /** Final-tail ASCII expression, sound key, or client text. */
    asciiText: asciiText64(),
    /** Second final-tail UTF-16 expression or client text. */
    textB: utf16Text64(),
    /** Counted values and fixed row trailer for this branch. */
    suffix: ItemEnchantSuffix15,
});

/** Exercised late-tail layout: standard-48/extra-four-word/direct/standard-15. */
const ItemEnchantTailMiddle48PreText16PostTextDirectSuffix15 = struct({
    /** Complete physical discriminator for this late-tail branch. */
    layout: literal("standard-48/extra-four-word/direct/standard-15"),
    /** Fixed-width region before the second scalar list. */
    middle: ItemEnchantMiddle48,
    /** Second counted list of neutral 32-bit tail values. */
    valuesB: array(u32().lte(8), u32()),
    /** Opaque 20-byte region before the optional pre-text expansion. */
    unknownAfterValuesB: bytes(20),
    /** Optional opaque expansion before the first final text. */
    preText: ItemEnchantPreText16,
    /** First final-tail UTF-16 expression or client text. */
    textA: utf16Text64(),
    /** Optional opaque expansion after the first final text. */
    postText: ItemEnchantPostTextDirect,
    /** Final-tail ASCII expression, sound key, or client text. */
    asciiText: asciiText64(),
    /** Second final-tail UTF-16 expression or client text. */
    textB: utf16Text64(),
    /** Counted values and fixed row trailer for this branch. */
    suffix: ItemEnchantSuffix15,
});

/** Exercised late-tail layout: standard-48/extra-five-word/direct/standard-15. */
const ItemEnchantTailMiddle48PreText20PostTextDirectSuffix15 = struct({
    /** Complete physical discriminator for this late-tail branch. */
    layout: literal("standard-48/extra-five-word/direct/standard-15"),
    /** Fixed-width region before the second scalar list. */
    middle: ItemEnchantMiddle48,
    /** Second counted list of neutral 32-bit tail values. */
    valuesB: array(u32().lte(8), u32()),
    /** Opaque 20-byte region before the optional pre-text expansion. */
    unknownAfterValuesB: bytes(20),
    /** Optional opaque expansion before the first final text. */
    preText: ItemEnchantPreText20,
    /** First final-tail UTF-16 expression or client text. */
    textA: utf16Text64(),
    /** Optional opaque expansion after the first final text. */
    postText: ItemEnchantPostTextDirect,
    /** Final-tail ASCII expression, sound key, or client text. */
    asciiText: asciiText64(),
    /** Second final-tail UTF-16 expression or client text. */
    textB: utf16Text64(),
    /** Counted values and fixed row trailer for this branch. */
    suffix: ItemEnchantSuffix15,
});

/** Exercised late-tail layout: standard-48/extra-six-word/direct/standard-15. */
const ItemEnchantTailMiddle48PreText24PostTextDirectSuffix15 = struct({
    /** Complete physical discriminator for this late-tail branch. */
    layout: literal("standard-48/extra-six-word/direct/standard-15"),
    /** Fixed-width region before the second scalar list. */
    middle: ItemEnchantMiddle48,
    /** Second counted list of neutral 32-bit tail values. */
    valuesB: array(u32().lte(8), u32()),
    /** Opaque 20-byte region before the optional pre-text expansion. */
    unknownAfterValuesB: bytes(20),
    /** Optional opaque expansion before the first final text. */
    preText: ItemEnchantPreText24,
    /** First final-tail UTF-16 expression or client text. */
    textA: utf16Text64(),
    /** Optional opaque expansion after the first final text. */
    postText: ItemEnchantPostTextDirect,
    /** Final-tail ASCII expression, sound key, or client text. */
    asciiText: asciiText64(),
    /** Second final-tail UTF-16 expression or client text. */
    textB: utf16Text64(),
    /** Counted values and fixed row trailer for this branch. */
    suffix: ItemEnchantSuffix15,
});

/** Exercised late-tail layout: standard-48/extra-seven-word/direct/standard-15. */
const ItemEnchantTailMiddle48PreText28PostTextDirectSuffix15 = struct({
    /** Complete physical discriminator for this late-tail branch. */
    layout: literal("standard-48/extra-seven-word/direct/standard-15"),
    /** Fixed-width region before the second scalar list. */
    middle: ItemEnchantMiddle48,
    /** Second counted list of neutral 32-bit tail values. */
    valuesB: array(u32().lte(8), u32()),
    /** Opaque 20-byte region before the optional pre-text expansion. */
    unknownAfterValuesB: bytes(20),
    /** Optional opaque expansion before the first final text. */
    preText: ItemEnchantPreText28,
    /** First final-tail UTF-16 expression or client text. */
    textA: utf16Text64(),
    /** Optional opaque expansion after the first final text. */
    postText: ItemEnchantPostTextDirect,
    /** Final-tail ASCII expression, sound key, or client text. */
    asciiText: asciiText64(),
    /** Second final-tail UTF-16 expression or client text. */
    textB: utf16Text64(),
    /** Counted values and fixed row trailer for this branch. */
    suffix: ItemEnchantSuffix15,
});

/** Exercised late-tail layout: extra-word/direct/direct/standard-15. */
const ItemEnchantTailMiddle52PreTextDirectPostTextDirectSuffix15 = struct({
    /** Complete physical discriminator for this late-tail branch. */
    layout: literal("extra-word/direct/direct/standard-15"),
    /** Fixed-width region before the second scalar list. */
    middle: ItemEnchantMiddle52,
    /** Second counted list of neutral 32-bit tail values. */
    valuesB: array(u32().lte(8), u32()),
    /** Opaque 20-byte region before the optional pre-text expansion. */
    unknownAfterValuesB: bytes(20),
    /** Optional opaque expansion before the first final text. */
    preText: ItemEnchantPreTextDirect,
    /** First final-tail UTF-16 expression or client text. */
    textA: utf16Text64(),
    /** Optional opaque expansion after the first final text. */
    postText: ItemEnchantPostTextDirect,
    /** Final-tail ASCII expression, sound key, or client text. */
    asciiText: asciiText64(),
    /** Second final-tail UTF-16 expression or client text. */
    textB: utf16Text64(),
    /** Counted values and fixed row trailer for this branch. */
    suffix: ItemEnchantSuffix15,
});

/** Exercised late-tail layout: extra-word/extra-word/direct/standard-15. */
const ItemEnchantTailMiddle52PreText4PostTextDirectSuffix15 = struct({
    /** Complete physical discriminator for this late-tail branch. */
    layout: literal("extra-word/extra-word/direct/standard-15"),
    /** Fixed-width region before the second scalar list. */
    middle: ItemEnchantMiddle52,
    /** Second counted list of neutral 32-bit tail values. */
    valuesB: array(u32().lte(8), u32()),
    /** Opaque 20-byte region before the optional pre-text expansion. */
    unknownAfterValuesB: bytes(20),
    /** Optional opaque expansion before the first final text. */
    preText: ItemEnchantPreText4,
    /** First final-tail UTF-16 expression or client text. */
    textA: utf16Text64(),
    /** Optional opaque expansion after the first final text. */
    postText: ItemEnchantPostTextDirect,
    /** Final-tail ASCII expression, sound key, or client text. */
    asciiText: asciiText64(),
    /** Second final-tail UTF-16 expression or client text. */
    textB: utf16Text64(),
    /** Counted values and fixed row trailer for this branch. */
    suffix: ItemEnchantSuffix15,
});

/** Exercised late-tail layout: extra-word/extra-double-word/direct/standard-15. */
const ItemEnchantTailMiddle52PreText8PostTextDirectSuffix15 = struct({
    /** Complete physical discriminator for this late-tail branch. */
    layout: literal("extra-word/extra-double-word/direct/standard-15"),
    /** Fixed-width region before the second scalar list. */
    middle: ItemEnchantMiddle52,
    /** Second counted list of neutral 32-bit tail values. */
    valuesB: array(u32().lte(8), u32()),
    /** Opaque 20-byte region before the optional pre-text expansion. */
    unknownAfterValuesB: bytes(20),
    /** Optional opaque expansion before the first final text. */
    preText: ItemEnchantPreText8,
    /** First final-tail UTF-16 expression or client text. */
    textA: utf16Text64(),
    /** Optional opaque expansion after the first final text. */
    postText: ItemEnchantPostTextDirect,
    /** Final-tail ASCII expression, sound key, or client text. */
    asciiText: asciiText64(),
    /** Second final-tail UTF-16 expression or client text. */
    textB: utf16Text64(),
    /** Counted values and fixed row trailer for this branch. */
    suffix: ItemEnchantSuffix15,
});

/**
 * Exercised late-tail layout:
 * extra-word/extra-double-word/expanded-12/standard-15.
 */
const ItemEnchantTailMiddle52PreText8PostText12Suffix15 = struct({
    /** Complete physical discriminator for this late-tail branch. */
    layout: literal("extra-word/extra-double-word/expanded-12/standard-15"),
    /** Fixed-width region before the second scalar list. */
    middle: ItemEnchantMiddle52,
    /** Second counted list of neutral 32-bit tail values. */
    valuesB: array(u32().lte(8), u32()),
    /** Opaque 20-byte region before the optional pre-text expansion. */
    unknownAfterValuesB: bytes(20),
    /** Optional opaque expansion before the first final text. */
    preText: ItemEnchantPreText8,
    /** First final-tail UTF-16 expression or client text. */
    textA: utf16Text64(),
    /** Optional opaque expansion after the first final text. */
    postText: ItemEnchantPostText12,
    /** Final-tail ASCII expression, sound key, or client text. */
    asciiText: asciiText64(),
    /** Second final-tail UTF-16 expression or client text. */
    textB: utf16Text64(),
    /** Counted values and fixed row trailer for this branch. */
    suffix: ItemEnchantSuffix15,
});

/** Exercised late-tail layout: extra-word/extra-three-word/direct/standard-15. */
const ItemEnchantTailMiddle52PreText12PostTextDirectSuffix15 = struct({
    /** Complete physical discriminator for this late-tail branch. */
    layout: literal("extra-word/extra-three-word/direct/standard-15"),
    /** Fixed-width region before the second scalar list. */
    middle: ItemEnchantMiddle52,
    /** Second counted list of neutral 32-bit tail values. */
    valuesB: array(u32().lte(8), u32()),
    /** Opaque 20-byte region before the optional pre-text expansion. */
    unknownAfterValuesB: bytes(20),
    /** Optional opaque expansion before the first final text. */
    preText: ItemEnchantPreText12,
    /** First final-tail UTF-16 expression or client text. */
    textA: utf16Text64(),
    /** Optional opaque expansion after the first final text. */
    postText: ItemEnchantPostTextDirect,
    /** Final-tail ASCII expression, sound key, or client text. */
    asciiText: asciiText64(),
    /** Second final-tail UTF-16 expression or client text. */
    textB: utf16Text64(),
    /** Counted values and fixed row trailer for this branch. */
    suffix: ItemEnchantSuffix15,
});

/** Exercised late-tail layout: short-three-word/direct/direct/standard-15. */
const ItemEnchantTailMiddle36PreTextDirectPostTextDirectSuffix15 = struct({
    /** Complete physical discriminator for this late-tail branch. */
    layout: literal("short-three-word/direct/direct/standard-15"),
    /** Fixed-width region before the second scalar list. */
    middle: ItemEnchantMiddle36,
    /** Second counted list of neutral 32-bit tail values. */
    valuesB: array(u32().lte(8), u32()),
    /** Opaque 20-byte region before the optional pre-text expansion. */
    unknownAfterValuesB: bytes(20),
    /** Optional opaque expansion before the first final text. */
    preText: ItemEnchantPreTextDirect,
    /** First final-tail UTF-16 expression or client text. */
    textA: utf16Text64(),
    /** Optional opaque expansion after the first final text. */
    postText: ItemEnchantPostTextDirect,
    /** Final-tail ASCII expression, sound key, or client text. */
    asciiText: asciiText64(),
    /** Second final-tail UTF-16 expression or client text. */
    textB: utf16Text64(),
    /** Counted values and fixed row trailer for this branch. */
    suffix: ItemEnchantSuffix15,
});

/** Exercised late-tail layout: extra-ten-word/direct/direct/standard-15. */
const ItemEnchantTailMiddle88PreTextDirectPostTextDirectSuffix15 = struct({
    /** Complete physical discriminator for this late-tail branch. */
    layout: literal("extra-ten-word/direct/direct/standard-15"),
    /** Fixed-width region before the second scalar list. */
    middle: ItemEnchantMiddle88,
    /** Second counted list of neutral 32-bit tail values. */
    valuesB: array(u32().lte(8), u32()),
    /** Opaque 20-byte region before the optional pre-text expansion. */
    unknownAfterValuesB: bytes(20),
    /** Optional opaque expansion before the first final text. */
    preText: ItemEnchantPreTextDirect,
    /** First final-tail UTF-16 expression or client text. */
    textA: utf16Text64(),
    /** Optional opaque expansion after the first final text. */
    postText: ItemEnchantPostTextDirect,
    /** Final-tail ASCII expression, sound key, or client text. */
    asciiText: asciiText64(),
    /** Second final-tail UTF-16 expression or client text. */
    textB: utf16Text64(),
    /** Counted values and fixed row trailer for this branch. */
    suffix: ItemEnchantSuffix15,
});

/** Exercised late-tail layout: extra-ten-word/extra-word/direct/standard-15. */
const ItemEnchantTailMiddle88PreText4PostTextDirectSuffix15 = struct({
    /** Complete physical discriminator for this late-tail branch. */
    layout: literal("extra-ten-word/extra-word/direct/standard-15"),
    /** Fixed-width region before the second scalar list. */
    middle: ItemEnchantMiddle88,
    /** Second counted list of neutral 32-bit tail values. */
    valuesB: array(u32().lte(8), u32()),
    /** Opaque 20-byte region before the optional pre-text expansion. */
    unknownAfterValuesB: bytes(20),
    /** Optional opaque expansion before the first final text. */
    preText: ItemEnchantPreText4,
    /** First final-tail UTF-16 expression or client text. */
    textA: utf16Text64(),
    /** Optional opaque expansion after the first final text. */
    postText: ItemEnchantPostTextDirect,
    /** Final-tail ASCII expression, sound key, or client text. */
    asciiText: asciiText64(),
    /** Second final-tail UTF-16 expression or client text. */
    textB: utf16Text64(),
    /** Counted values and fixed row trailer for this branch. */
    suffix: ItemEnchantSuffix15,
});

/**
 * Exercised late-tail layout:
 * extra-ten-word/extra-double-word/direct/standard-15.
 */
const ItemEnchantTailMiddle88PreText8PostTextDirectSuffix15 = struct({
    /** Complete physical discriminator for this late-tail branch. */
    layout: literal("extra-ten-word/extra-double-word/direct/standard-15"),
    /** Fixed-width region before the second scalar list. */
    middle: ItemEnchantMiddle88,
    /** Second counted list of neutral 32-bit tail values. */
    valuesB: array(u32().lte(8), u32()),
    /** Opaque 20-byte region before the optional pre-text expansion. */
    unknownAfterValuesB: bytes(20),
    /** Optional opaque expansion before the first final text. */
    preText: ItemEnchantPreText8,
    /** First final-tail UTF-16 expression or client text. */
    textA: utf16Text64(),
    /** Optional opaque expansion after the first final text. */
    postText: ItemEnchantPostTextDirect,
    /** Final-tail ASCII expression, sound key, or client text. */
    asciiText: asciiText64(),
    /** Second final-tail UTF-16 expression or client text. */
    textB: utf16Text64(),
    /** Counted values and fixed row trailer for this branch. */
    suffix: ItemEnchantSuffix15,
});

/**
 * Exercised late-tail layout:
 * extra-ten-word/extra-four-word/direct/standard-15.
 */
const ItemEnchantTailMiddle88PreText16PostTextDirectSuffix15 = struct({
    /** Complete physical discriminator for this late-tail branch. */
    layout: literal("extra-ten-word/extra-four-word/direct/standard-15"),
    /** Fixed-width region before the second scalar list. */
    middle: ItemEnchantMiddle88,
    /** Second counted list of neutral 32-bit tail values. */
    valuesB: array(u32().lte(8), u32()),
    /** Opaque 20-byte region before the optional pre-text expansion. */
    unknownAfterValuesB: bytes(20),
    /** Optional opaque expansion before the first final text. */
    preText: ItemEnchantPreText16,
    /** First final-tail UTF-16 expression or client text. */
    textA: utf16Text64(),
    /** Optional opaque expansion after the first final text. */
    postText: ItemEnchantPostTextDirect,
    /** Final-tail ASCII expression, sound key, or client text. */
    asciiText: asciiText64(),
    /** Second final-tail UTF-16 expression or client text. */
    textB: utf16Text64(),
    /** Counted values and fixed row trailer for this branch. */
    suffix: ItemEnchantSuffix15,
});

/** Exercised late-tail layout: extra-four-word/direct/direct/standard-15. */
const ItemEnchantTailMiddle64PreTextDirectPostTextDirectSuffix15 = struct({
    /** Complete physical discriminator for this late-tail branch. */
    layout: literal("extra-four-word/direct/direct/standard-15"),
    /** Fixed-width region before the second scalar list. */
    middle: ItemEnchantMiddle64,
    /** Second counted list of neutral 32-bit tail values. */
    valuesB: array(u32().lte(8), u32()),
    /** Opaque 20-byte region before the optional pre-text expansion. */
    unknownAfterValuesB: bytes(20),
    /** Optional opaque expansion before the first final text. */
    preText: ItemEnchantPreTextDirect,
    /** First final-tail UTF-16 expression or client text. */
    textA: utf16Text64(),
    /** Optional opaque expansion after the first final text. */
    postText: ItemEnchantPostTextDirect,
    /** Final-tail ASCII expression, sound key, or client text. */
    asciiText: asciiText64(),
    /** Second final-tail UTF-16 expression or client text. */
    textB: utf16Text64(),
    /** Counted values and fixed row trailer for this branch. */
    suffix: ItemEnchantSuffix15,
});

/** Exercised late-tail layout: wide/direct/direct/standard-15. */
const ItemEnchantTailMiddle280PreTextDirectPostTextDirectSuffix15 = struct({
    /** Complete physical discriminator for this late-tail branch. */
    layout: literal("wide/direct/direct/standard-15"),
    /** Fixed-width region before the second scalar list. */
    middle: ItemEnchantMiddle280,
    /** Second counted list of neutral 32-bit tail values. */
    valuesB: array(u32().lte(8), u32()),
    /** Opaque 20-byte region before the optional pre-text expansion. */
    unknownAfterValuesB: bytes(20),
    /** Optional opaque expansion before the first final text. */
    preText: ItemEnchantPreTextDirect,
    /** First final-tail UTF-16 expression or client text. */
    textA: utf16Text64(),
    /** Optional opaque expansion after the first final text. */
    postText: ItemEnchantPostTextDirect,
    /** Final-tail ASCII expression, sound key, or client text. */
    asciiText: asciiText64(),
    /** Second final-tail UTF-16 expression or client text. */
    textB: utf16Text64(),
    /** Counted values and fixed row trailer for this branch. */
    suffix: ItemEnchantSuffix15,
});

/** Exercised late-tail layout: wide-104/extra-word/direct/standard-15. */
const ItemEnchantTailMiddle104PreText4PostTextDirectSuffix15 = struct({
    /** Complete physical discriminator for this late-tail branch. */
    layout: literal("wide-104/extra-word/direct/standard-15"),
    /** Fixed-width region before the second scalar list. */
    middle: ItemEnchantMiddle104,
    /** Second counted list of neutral 32-bit tail values. */
    valuesB: array(u32().lte(8), u32()),
    /** Opaque 20-byte region before the optional pre-text expansion. */
    unknownAfterValuesB: bytes(20),
    /** Optional opaque expansion before the first final text. */
    preText: ItemEnchantPreText4,
    /** First final-tail UTF-16 expression or client text. */
    textA: utf16Text64(),
    /** Optional opaque expansion after the first final text. */
    postText: ItemEnchantPostTextDirect,
    /** Final-tail ASCII expression, sound key, or client text. */
    asciiText: asciiText64(),
    /** Second final-tail UTF-16 expression or client text. */
    textB: utf16Text64(),
    /** Counted values and fixed row trailer for this branch. */
    suffix: ItemEnchantSuffix15,
});

/** Exercised late-tail layout: wide-116/direct/direct/standard-15. */
const ItemEnchantTailMiddle116PreTextDirectPostTextDirectSuffix15 = struct({
    /** Complete physical discriminator for this late-tail branch. */
    layout: literal("wide-116/direct/direct/standard-15"),
    /** Fixed-width region before the second scalar list. */
    middle: ItemEnchantMiddle116,
    /** Second counted list of neutral 32-bit tail values. */
    valuesB: array(u32().lte(8), u32()),
    /** Opaque 20-byte region before the optional pre-text expansion. */
    unknownAfterValuesB: bytes(20),
    /** Optional opaque expansion before the first final text. */
    preText: ItemEnchantPreTextDirect,
    /** First final-tail UTF-16 expression or client text. */
    textA: utf16Text64(),
    /** Optional opaque expansion after the first final text. */
    postText: ItemEnchantPostTextDirect,
    /** Final-tail ASCII expression, sound key, or client text. */
    asciiText: asciiText64(),
    /** Second final-tail UTF-16 expression or client text. */
    textB: utf16Text64(),
    /** Counted values and fixed row trailer for this branch. */
    suffix: ItemEnchantSuffix15,
});

/** Exercised late-tail layout: wide-116/extra-seven-word/direct/standard-15. */
const ItemEnchantTailMiddle116PreText28PostTextDirectSuffix15 = struct({
    /** Complete physical discriminator for this late-tail branch. */
    layout: literal("wide-116/extra-seven-word/direct/standard-15"),
    /** Fixed-width region before the second scalar list. */
    middle: ItemEnchantMiddle116,
    /** Second counted list of neutral 32-bit tail values. */
    valuesB: array(u32().lte(8), u32()),
    /** Opaque 20-byte region before the optional pre-text expansion. */
    unknownAfterValuesB: bytes(20),
    /** Optional opaque expansion before the first final text. */
    preText: ItemEnchantPreText28,
    /** First final-tail UTF-16 expression or client text. */
    textA: utf16Text64(),
    /** Optional opaque expansion after the first final text. */
    postText: ItemEnchantPostTextDirect,
    /** Final-tail ASCII expression, sound key, or client text. */
    asciiText: asciiText64(),
    /** Second final-tail UTF-16 expression or client text. */
    textB: utf16Text64(),
    /** Counted values and fixed row trailer for this branch. */
    suffix: ItemEnchantSuffix15,
});

/** Exercised late-tail layout: wide-76/direct/direct/standard-15. */
const ItemEnchantTailMiddle76PreTextDirectPostTextDirectSuffix15 = struct({
    /** Complete physical discriminator for this late-tail branch. */
    layout: literal("wide-76/direct/direct/standard-15"),
    /** Fixed-width region before the second scalar list. */
    middle: ItemEnchantMiddle76,
    /** Second counted list of neutral 32-bit tail values. */
    valuesB: array(u32().lte(8), u32()),
    /** Opaque 20-byte region before the optional pre-text expansion. */
    unknownAfterValuesB: bytes(20),
    /** Optional opaque expansion before the first final text. */
    preText: ItemEnchantPreTextDirect,
    /** First final-tail UTF-16 expression or client text. */
    textA: utf16Text64(),
    /** Optional opaque expansion after the first final text. */
    postText: ItemEnchantPostTextDirect,
    /** Final-tail ASCII expression, sound key, or client text. */
    asciiText: asciiText64(),
    /** Second final-tail UTF-16 expression or client text. */
    textB: utf16Text64(),
    /** Counted values and fixed row trailer for this branch. */
    suffix: ItemEnchantSuffix15,
});

/** Exercised late-tail layout: wide-76/extra-word/direct/standard-15. */
const ItemEnchantTailMiddle76PreText4PostTextDirectSuffix15 = struct({
    /** Complete physical discriminator for this late-tail branch. */
    layout: literal("wide-76/extra-word/direct/standard-15"),
    /** Fixed-width region before the second scalar list. */
    middle: ItemEnchantMiddle76,
    /** Second counted list of neutral 32-bit tail values. */
    valuesB: array(u32().lte(8), u32()),
    /** Opaque 20-byte region before the optional pre-text expansion. */
    unknownAfterValuesB: bytes(20),
    /** Optional opaque expansion before the first final text. */
    preText: ItemEnchantPreText4,
    /** First final-tail UTF-16 expression or client text. */
    textA: utf16Text64(),
    /** Optional opaque expansion after the first final text. */
    postText: ItemEnchantPostTextDirect,
    /** Final-tail ASCII expression, sound key, or client text. */
    asciiText: asciiText64(),
    /** Second final-tail UTF-16 expression or client text. */
    textB: utf16Text64(),
    /** Counted values and fixed row trailer for this branch. */
    suffix: ItemEnchantSuffix15,
});

/** Exercised late-tail layout: wide-104/direct/direct/standard-15. */
const ItemEnchantTailMiddle104PreTextDirectPostTextDirectSuffix15 = struct({
    /** Complete physical discriminator for this late-tail branch. */
    layout: literal("wide-104/direct/direct/standard-15"),
    /** Fixed-width region before the second scalar list. */
    middle: ItemEnchantMiddle104,
    /** Second counted list of neutral 32-bit tail values. */
    valuesB: array(u32().lte(8), u32()),
    /** Opaque 20-byte region before the optional pre-text expansion. */
    unknownAfterValuesB: bytes(20),
    /** Optional opaque expansion before the first final text. */
    preText: ItemEnchantPreTextDirect,
    /** First final-tail UTF-16 expression or client text. */
    textA: utf16Text64(),
    /** Optional opaque expansion after the first final text. */
    postText: ItemEnchantPostTextDirect,
    /** Final-tail ASCII expression, sound key, or client text. */
    asciiText: asciiText64(),
    /** Second final-tail UTF-16 expression or client text. */
    textB: utf16Text64(),
    /** Counted values and fixed row trailer for this branch. */
    suffix: ItemEnchantSuffix15,
});

/** Exercised late-tail layout: wide-108/direct/direct/standard-15. */
const ItemEnchantTailMiddle108PreTextDirectPostTextDirectSuffix15 = struct({
    /** Complete physical discriminator for this late-tail branch. */
    layout: literal("wide-108/direct/direct/standard-15"),
    /** Fixed-width region before the second scalar list. */
    middle: ItemEnchantMiddle108,
    /** Second counted list of neutral 32-bit tail values. */
    valuesB: array(u32().lte(8), u32()),
    /** Opaque 20-byte region before the optional pre-text expansion. */
    unknownAfterValuesB: bytes(20),
    /** Optional opaque expansion before the first final text. */
    preText: ItemEnchantPreTextDirect,
    /** First final-tail UTF-16 expression or client text. */
    textA: utf16Text64(),
    /** Optional opaque expansion after the first final text. */
    postText: ItemEnchantPostTextDirect,
    /** Final-tail ASCII expression, sound key, or client text. */
    asciiText: asciiText64(),
    /** Second final-tail UTF-16 expression or client text. */
    textB: utf16Text64(),
    /** Counted values and fixed row trailer for this branch. */
    suffix: ItemEnchantSuffix15,
});

/** Exercised late-tail layout: wide-122/direct/direct/standard-15. */
const ItemEnchantTailMiddle122PreTextDirectPostTextDirectSuffix15 = struct({
    /** Complete physical discriminator for this late-tail branch. */
    layout: literal("wide-122/direct/direct/standard-15"),
    /** Fixed-width region before the second scalar list. */
    middle: ItemEnchantMiddle122,
    /** Second counted list of neutral 32-bit tail values. */
    valuesB: array(u32().lte(8), u32()),
    /** Opaque 20-byte region before the optional pre-text expansion. */
    unknownAfterValuesB: bytes(20),
    /** Optional opaque expansion before the first final text. */
    preText: ItemEnchantPreTextDirect,
    /** First final-tail UTF-16 expression or client text. */
    textA: utf16Text64(),
    /** Optional opaque expansion after the first final text. */
    postText: ItemEnchantPostTextDirect,
    /** Final-tail ASCII expression, sound key, or client text. */
    asciiText: asciiText64(),
    /** Second final-tail UTF-16 expression or client text. */
    textB: utf16Text64(),
    /** Counted values and fixed row trailer for this branch. */
    suffix: ItemEnchantSuffix15,
});

/** Exercised late-tail layout: wide-123/extra-word/direct/standard-15. */
const ItemEnchantTailMiddle123PreText4PostTextDirectSuffix15 = struct({
    /** Complete physical discriminator for this late-tail branch. */
    layout: literal("wide-123/extra-word/direct/standard-15"),
    /** Fixed-width region before the second scalar list. */
    middle: ItemEnchantMiddle123,
    /** Second counted list of neutral 32-bit tail values. */
    valuesB: array(u32().lte(8), u32()),
    /** Opaque 20-byte region before the optional pre-text expansion. */
    unknownAfterValuesB: bytes(20),
    /** Optional opaque expansion before the first final text. */
    preText: ItemEnchantPreText4,
    /** First final-tail UTF-16 expression or client text. */
    textA: utf16Text64(),
    /** Optional opaque expansion after the first final text. */
    postText: ItemEnchantPostTextDirect,
    /** Final-tail ASCII expression, sound key, or client text. */
    asciiText: asciiText64(),
    /** Second final-tail UTF-16 expression or client text. */
    textB: utf16Text64(),
    /** Counted values and fixed row trailer for this branch. */
    suffix: ItemEnchantSuffix15,
});

/** Exercised late-tail layout: wide-123/extra-double-word/direct/standard-15. */
const ItemEnchantTailMiddle123PreText8PostTextDirectSuffix15 = struct({
    /** Complete physical discriminator for this late-tail branch. */
    layout: literal("wide-123/extra-double-word/direct/standard-15"),
    /** Fixed-width region before the second scalar list. */
    middle: ItemEnchantMiddle123,
    /** Second counted list of neutral 32-bit tail values. */
    valuesB: array(u32().lte(8), u32()),
    /** Opaque 20-byte region before the optional pre-text expansion. */
    unknownAfterValuesB: bytes(20),
    /** Optional opaque expansion before the first final text. */
    preText: ItemEnchantPreText8,
    /** First final-tail UTF-16 expression or client text. */
    textA: utf16Text64(),
    /** Optional opaque expansion after the first final text. */
    postText: ItemEnchantPostTextDirect,
    /** Final-tail ASCII expression, sound key, or client text. */
    asciiText: asciiText64(),
    /** Second final-tail UTF-16 expression or client text. */
    textB: utf16Text64(),
    /** Counted values and fixed row trailer for this branch. */
    suffix: ItemEnchantSuffix15,
});

/** Exercised late-tail layout: wide-123/direct/direct/standard-15. */
const ItemEnchantTailMiddle123PreTextDirectPostTextDirectSuffix15 = struct({
    /** Complete physical discriminator for this late-tail branch. */
    layout: literal("wide-123/direct/direct/standard-15"),
    /** Fixed-width region before the second scalar list. */
    middle: ItemEnchantMiddle123,
    /** Second counted list of neutral 32-bit tail values. */
    valuesB: array(u32().lte(8), u32()),
    /** Opaque 20-byte region before the optional pre-text expansion. */
    unknownAfterValuesB: bytes(20),
    /** Optional opaque expansion before the first final text. */
    preText: ItemEnchantPreTextDirect,
    /** First final-tail UTF-16 expression or client text. */
    textA: utf16Text64(),
    /** Optional opaque expansion after the first final text. */
    postText: ItemEnchantPostTextDirect,
    /** Final-tail ASCII expression, sound key, or client text. */
    asciiText: asciiText64(),
    /** Second final-tail UTF-16 expression or client text. */
    textB: utf16Text64(),
    /** Counted values and fixed row trailer for this branch. */
    suffix: ItemEnchantSuffix15,
});

/** Exercised late-tail layout: wide-228/direct/direct/standard-15. */
const ItemEnchantTailMiddle228PreTextDirectPostTextDirectSuffix15 = struct({
    /** Complete physical discriminator for this late-tail branch. */
    layout: literal("wide-228/direct/direct/standard-15"),
    /** Fixed-width region before the second scalar list. */
    middle: ItemEnchantMiddle228,
    /** Second counted list of neutral 32-bit tail values. */
    valuesB: array(u32().lte(8), u32()),
    /** Opaque 20-byte region before the optional pre-text expansion. */
    unknownAfterValuesB: bytes(20),
    /** Optional opaque expansion before the first final text. */
    preText: ItemEnchantPreTextDirect,
    /** First final-tail UTF-16 expression or client text. */
    textA: utf16Text64(),
    /** Optional opaque expansion after the first final text. */
    postText: ItemEnchantPostTextDirect,
    /** Final-tail ASCII expression, sound key, or client text. */
    asciiText: asciiText64(),
    /** Second final-tail UTF-16 expression or client text. */
    textB: utf16Text64(),
    /** Counted values and fixed row trailer for this branch. */
    suffix: ItemEnchantSuffix15,
});

/** Exercised late-tail layout: extra-word/direct/direct/extra-half-word. */
const ItemEnchantTailMiddle52PreTextDirectPostTextDirectSuffix17 = struct({
    /** Complete physical discriminator for this late-tail branch. */
    layout: literal("extra-word/direct/direct/extra-half-word"),
    /** Fixed-width region before the second scalar list. */
    middle: ItemEnchantMiddle52,
    /** Second counted list of neutral 32-bit tail values. */
    valuesB: array(u32().lte(8), u32()),
    /** Opaque 20-byte region before the optional pre-text expansion. */
    unknownAfterValuesB: bytes(20),
    /** Optional opaque expansion before the first final text. */
    preText: ItemEnchantPreTextDirect,
    /** First final-tail UTF-16 expression or client text. */
    textA: utf16Text64(),
    /** Optional opaque expansion after the first final text. */
    postText: ItemEnchantPostTextDirect,
    /** Final-tail ASCII expression, sound key, or client text. */
    asciiText: asciiText64(),
    /** Second final-tail UTF-16 expression or client text. */
    textB: utf16Text64(),
    /** Counted values and fixed row trailer for this branch. */
    suffix: ItemEnchantSuffix17,
});

/**
 * Exercised late-tail layout:
 * extra-half-word/extra-three-word/direct/extra-half-word.
 */
const ItemEnchantTailMiddle50PreText12PostTextDirectSuffix17 = struct({
    /** Complete physical discriminator for this late-tail branch. */
    layout: literal("extra-half-word/extra-three-word/direct/extra-half-word"),
    /** Fixed-width region before the second scalar list. */
    middle: ItemEnchantMiddle50,
    /** Second counted list of neutral 32-bit tail values. */
    valuesB: array(u32().lte(8), u32()),
    /** Opaque 20-byte region before the optional pre-text expansion. */
    unknownAfterValuesB: bytes(20),
    /** Optional opaque expansion before the first final text. */
    preText: ItemEnchantPreText12,
    /** First final-tail UTF-16 expression or client text. */
    textA: utf16Text64(),
    /** Optional opaque expansion after the first final text. */
    postText: ItemEnchantPostTextDirect,
    /** Final-tail ASCII expression, sound key, or client text. */
    asciiText: asciiText64(),
    /** Second final-tail UTF-16 expression or client text. */
    textB: utf16Text64(),
    /** Counted values and fixed row trailer for this branch. */
    suffix: ItemEnchantSuffix17,
});

/**
 * Exercised late-tail layout:
 * extra-half-word/extra-word/direct/extra-half-word.
 */
const ItemEnchantTailMiddle50PreText4PostTextDirectSuffix17 = struct({
    /** Complete physical discriminator for this late-tail branch. */
    layout: literal("extra-half-word/extra-word/direct/extra-half-word"),
    /** Fixed-width region before the second scalar list. */
    middle: ItemEnchantMiddle50,
    /** Second counted list of neutral 32-bit tail values. */
    valuesB: array(u32().lte(8), u32()),
    /** Opaque 20-byte region before the optional pre-text expansion. */
    unknownAfterValuesB: bytes(20),
    /** Optional opaque expansion before the first final text. */
    preText: ItemEnchantPreText4,
    /** First final-tail UTF-16 expression or client text. */
    textA: utf16Text64(),
    /** Optional opaque expansion after the first final text. */
    postText: ItemEnchantPostTextDirect,
    /** Final-tail ASCII expression, sound key, or client text. */
    asciiText: asciiText64(),
    /** Second final-tail UTF-16 expression or client text. */
    textB: utf16Text64(),
    /** Counted values and fixed row trailer for this branch. */
    suffix: ItemEnchantSuffix17,
});

/**
 * Exercised late-tail layout:
 * extra-half-word/extra-double-word/direct/extra-half-word.
 */
const ItemEnchantTailMiddle50PreText8PostTextDirectSuffix17 = struct({
    /** Complete physical discriminator for this late-tail branch. */
    layout: literal("extra-half-word/extra-double-word/direct/extra-half-word"),
    /** Fixed-width region before the second scalar list. */
    middle: ItemEnchantMiddle50,
    /** Second counted list of neutral 32-bit tail values. */
    valuesB: array(u32().lte(8), u32()),
    /** Opaque 20-byte region before the optional pre-text expansion. */
    unknownAfterValuesB: bytes(20),
    /** Optional opaque expansion before the first final text. */
    preText: ItemEnchantPreText8,
    /** First final-tail UTF-16 expression or client text. */
    textA: utf16Text64(),
    /** Optional opaque expansion after the first final text. */
    postText: ItemEnchantPostTextDirect,
    /** Final-tail ASCII expression, sound key, or client text. */
    asciiText: asciiText64(),
    /** Second final-tail UTF-16 expression or client text. */
    textB: utf16Text64(),
    /** Counted values and fixed row trailer for this branch. */
    suffix: ItemEnchantSuffix17,
});

/**
 * Exercised late-tail layout:
 * extra-half-word/extra-five-word/direct/extra-half-word.
 */
const ItemEnchantTailMiddle50PreText20PostTextDirectSuffix17 = struct({
    /** Complete physical discriminator for this late-tail branch. */
    layout: literal("extra-half-word/extra-five-word/direct/extra-half-word"),
    /** Fixed-width region before the second scalar list. */
    middle: ItemEnchantMiddle50,
    /** Second counted list of neutral 32-bit tail values. */
    valuesB: array(u32().lte(8), u32()),
    /** Opaque 20-byte region before the optional pre-text expansion. */
    unknownAfterValuesB: bytes(20),
    /** Optional opaque expansion before the first final text. */
    preText: ItemEnchantPreText20,
    /** First final-tail UTF-16 expression or client text. */
    textA: utf16Text64(),
    /** Optional opaque expansion after the first final text. */
    postText: ItemEnchantPostTextDirect,
    /** Final-tail ASCII expression, sound key, or client text. */
    asciiText: asciiText64(),
    /** Second final-tail UTF-16 expression or client text. */
    textB: utf16Text64(),
    /** Counted values and fixed row trailer for this branch. */
    suffix: ItemEnchantSuffix17,
});

/**
 * Exercised late-tail layout:
 * extra-half-word/extra-six-word/direct/extra-half-word.
 */
const ItemEnchantTailMiddle50PreText24PostTextDirectSuffix17 = struct({
    /** Complete physical discriminator for this late-tail branch. */
    layout: literal("extra-half-word/extra-six-word/direct/extra-half-word"),
    /** Fixed-width region before the second scalar list. */
    middle: ItemEnchantMiddle50,
    /** Second counted list of neutral 32-bit tail values. */
    valuesB: array(u32().lte(8), u32()),
    /** Opaque 20-byte region before the optional pre-text expansion. */
    unknownAfterValuesB: bytes(20),
    /** Optional opaque expansion before the first final text. */
    preText: ItemEnchantPreText24,
    /** First final-tail UTF-16 expression or client text. */
    textA: utf16Text64(),
    /** Optional opaque expansion after the first final text. */
    postText: ItemEnchantPostTextDirect,
    /** Final-tail ASCII expression, sound key, or client text. */
    asciiText: asciiText64(),
    /** Second final-tail UTF-16 expression or client text. */
    textB: utf16Text64(),
    /** Counted values and fixed row trailer for this branch. */
    suffix: ItemEnchantSuffix17,
});

/**
 * Exercised late-tail layout:
 * extra-half-word/extra-four-word/direct/extra-half-word.
 */
const ItemEnchantTailMiddle50PreText16PostTextDirectSuffix17 = struct({
    /** Complete physical discriminator for this late-tail branch. */
    layout: literal("extra-half-word/extra-four-word/direct/extra-half-word"),
    /** Fixed-width region before the second scalar list. */
    middle: ItemEnchantMiddle50,
    /** Second counted list of neutral 32-bit tail values. */
    valuesB: array(u32().lte(8), u32()),
    /** Opaque 20-byte region before the optional pre-text expansion. */
    unknownAfterValuesB: bytes(20),
    /** Optional opaque expansion before the first final text. */
    preText: ItemEnchantPreText16,
    /** First final-tail UTF-16 expression or client text. */
    textA: utf16Text64(),
    /** Optional opaque expansion after the first final text. */
    postText: ItemEnchantPostTextDirect,
    /** Final-tail ASCII expression, sound key, or client text. */
    asciiText: asciiText64(),
    /** Second final-tail UTF-16 expression or client text. */
    textB: utf16Text64(),
    /** Counted values and fixed row trailer for this branch. */
    suffix: ItemEnchantSuffix17,
});

/** Exercised late-tail layout: standard-48/extra-word/direct/extra-half-word. */
const ItemEnchantTailMiddle48PreText4PostTextDirectSuffix17 = struct({
    /** Complete physical discriminator for this late-tail branch. */
    layout: literal("standard-48/extra-word/direct/extra-half-word"),
    /** Fixed-width region before the second scalar list. */
    middle: ItemEnchantMiddle48,
    /** Second counted list of neutral 32-bit tail values. */
    valuesB: array(u32().lte(8), u32()),
    /** Opaque 20-byte region before the optional pre-text expansion. */
    unknownAfterValuesB: bytes(20),
    /** Optional opaque expansion before the first final text. */
    preText: ItemEnchantPreText4,
    /** First final-tail UTF-16 expression or client text. */
    textA: utf16Text64(),
    /** Optional opaque expansion after the first final text. */
    postText: ItemEnchantPostTextDirect,
    /** Final-tail ASCII expression, sound key, or client text. */
    asciiText: asciiText64(),
    /** Second final-tail UTF-16 expression or client text. */
    textB: utf16Text64(),
    /** Counted values and fixed row trailer for this branch. */
    suffix: ItemEnchantSuffix17,
});

/** Exercised late-tail layout: standard-48/direct/direct/extra-half-word. */
const ItemEnchantTailMiddle48PreTextDirectPostTextDirectSuffix17 = struct({
    /** Complete physical discriminator for this late-tail branch. */
    layout: literal("standard-48/direct/direct/extra-half-word"),
    /** Fixed-width region before the second scalar list. */
    middle: ItemEnchantMiddle48,
    /** Second counted list of neutral 32-bit tail values. */
    valuesB: array(u32().lte(8), u32()),
    /** Opaque 20-byte region before the optional pre-text expansion. */
    unknownAfterValuesB: bytes(20),
    /** Optional opaque expansion before the first final text. */
    preText: ItemEnchantPreTextDirect,
    /** First final-tail UTF-16 expression or client text. */
    textA: utf16Text64(),
    /** Optional opaque expansion after the first final text. */
    postText: ItemEnchantPostTextDirect,
    /** Final-tail ASCII expression, sound key, or client text. */
    asciiText: asciiText64(),
    /** Second final-tail UTF-16 expression or client text. */
    textB: utf16Text64(),
    /** Counted values and fixed row trailer for this branch. */
    suffix: ItemEnchantSuffix17,
});

/**
 * Exercised late-tail layout:
 * standard-48/extra-double-word/direct/extra-half-word.
 */
const ItemEnchantTailMiddle48PreText8PostTextDirectSuffix17 = struct({
    /** Complete physical discriminator for this late-tail branch. */
    layout: literal("standard-48/extra-double-word/direct/extra-half-word"),
    /** Fixed-width region before the second scalar list. */
    middle: ItemEnchantMiddle48,
    /** Second counted list of neutral 32-bit tail values. */
    valuesB: array(u32().lte(8), u32()),
    /** Opaque 20-byte region before the optional pre-text expansion. */
    unknownAfterValuesB: bytes(20),
    /** Optional opaque expansion before the first final text. */
    preText: ItemEnchantPreText8,
    /** First final-tail UTF-16 expression or client text. */
    textA: utf16Text64(),
    /** Optional opaque expansion after the first final text. */
    postText: ItemEnchantPostTextDirect,
    /** Final-tail ASCII expression, sound key, or client text. */
    asciiText: asciiText64(),
    /** Second final-tail UTF-16 expression or client text. */
    textB: utf16Text64(),
    /** Counted values and fixed row trailer for this branch. */
    suffix: ItemEnchantSuffix17,
});

/**
 * Exercised late-tail layout:
 * standard-48/extra-three-word/direct/extra-half-word.
 */
const ItemEnchantTailMiddle48PreText12PostTextDirectSuffix17 = struct({
    /** Complete physical discriminator for this late-tail branch. */
    layout: literal("standard-48/extra-three-word/direct/extra-half-word"),
    /** Fixed-width region before the second scalar list. */
    middle: ItemEnchantMiddle48,
    /** Second counted list of neutral 32-bit tail values. */
    valuesB: array(u32().lte(8), u32()),
    /** Opaque 20-byte region before the optional pre-text expansion. */
    unknownAfterValuesB: bytes(20),
    /** Optional opaque expansion before the first final text. */
    preText: ItemEnchantPreText12,
    /** First final-tail UTF-16 expression or client text. */
    textA: utf16Text64(),
    /** Optional opaque expansion after the first final text. */
    postText: ItemEnchantPostTextDirect,
    /** Final-tail ASCII expression, sound key, or client text. */
    asciiText: asciiText64(),
    /** Second final-tail UTF-16 expression or client text. */
    textB: utf16Text64(),
    /** Counted values and fixed row trailer for this branch. */
    suffix: ItemEnchantSuffix17,
});

/**
 * Exercised late-tail layout:
 * standard-48/extra-four-word/direct/extra-half-word.
 */
const ItemEnchantTailMiddle48PreText16PostTextDirectSuffix17 = struct({
    /** Complete physical discriminator for this late-tail branch. */
    layout: literal("standard-48/extra-four-word/direct/extra-half-word"),
    /** Fixed-width region before the second scalar list. */
    middle: ItemEnchantMiddle48,
    /** Second counted list of neutral 32-bit tail values. */
    valuesB: array(u32().lte(8), u32()),
    /** Opaque 20-byte region before the optional pre-text expansion. */
    unknownAfterValuesB: bytes(20),
    /** Optional opaque expansion before the first final text. */
    preText: ItemEnchantPreText16,
    /** First final-tail UTF-16 expression or client text. */
    textA: utf16Text64(),
    /** Optional opaque expansion after the first final text. */
    postText: ItemEnchantPostTextDirect,
    /** Final-tail ASCII expression, sound key, or client text. */
    asciiText: asciiText64(),
    /** Second final-tail UTF-16 expression or client text. */
    textB: utf16Text64(),
    /** Counted values and fixed row trailer for this branch. */
    suffix: ItemEnchantSuffix17,
});

/** Exercised late-tail layout: standard-48/extra-word/direct/counted-u16. */
const ItemEnchantTailMiddle48PreText4PostTextDirectSuffixCountedU16 = struct({
    /** Complete physical discriminator for this late-tail branch. */
    layout: literal("standard-48/extra-word/direct/counted-u16"),
    /** Fixed-width region before the second scalar list. */
    middle: ItemEnchantMiddle48,
    /** Second counted list of neutral 32-bit tail values. */
    valuesB: array(u32().lte(8), u32()),
    /** Opaque 20-byte region before the optional pre-text expansion. */
    unknownAfterValuesB: bytes(20),
    /** Optional opaque expansion before the first final text. */
    preText: ItemEnchantPreText4,
    /** First final-tail UTF-16 expression or client text. */
    textA: utf16Text64(),
    /** Optional opaque expansion after the first final text. */
    postText: ItemEnchantPostTextDirect,
    /** Final-tail ASCII expression, sound key, or client text. */
    asciiText: asciiText64(),
    /** Second final-tail UTF-16 expression or client text. */
    textB: utf16Text64(),
    /** Counted values and fixed row trailer for this branch. */
    suffix: ItemEnchantSuffixCountedU16,
});

/** Exercised late-tail layout: standard-48/direct/direct/counted-u16. */
const ItemEnchantTailMiddle48PreTextDirectPostTextDirectSuffixCountedU16 =
    struct({
        /** Complete physical discriminator for this late-tail branch. */
        layout: literal("standard-48/direct/direct/counted-u16"),
        /** Fixed-width region before the second scalar list. */
        middle: ItemEnchantMiddle48,
        /** Second counted list of neutral 32-bit tail values. */
        valuesB: array(u32().lte(8), u32()),
        /** Opaque 20-byte region before the optional pre-text expansion. */
        unknownAfterValuesB: bytes(20),
        /** Optional opaque expansion before the first final text. */
        preText: ItemEnchantPreTextDirect,
        /** First final-tail UTF-16 expression or client text. */
        textA: utf16Text64(),
        /** Optional opaque expansion after the first final text. */
        postText: ItemEnchantPostTextDirect,
        /** Final-tail ASCII expression, sound key, or client text. */
        asciiText: asciiText64(),
        /** Second final-tail UTF-16 expression or client text. */
        textB: utf16Text64(),
        /** Counted values and fixed row trailer for this branch. */
        suffix: ItemEnchantSuffixCountedU16,
    });

/** Complete row layout exercised by 76,811 build-2954 rows. */
const ItemEnchantRowStandardPrefix168Middle48PreTextDirectPostTextDirectSuffix15 =
    struct({
        /** Complete physical row-layout discriminator. */
        layout: literal(
            "standard/standard-168/standard-48/direct/direct/standard-15",
        ),
        /** Fixed 212-byte item and trade prefix. */
        fixed: ItemEnchantFixed,
        /** Pre-name counted-list layout. */
        preName: ItemEnchantPreNameStandard,
        /** Names, icon path, expressions, and market limit. */
        texts: ItemEnchantTexts,
        /** Fixed-width post-market prefix. */
        postMarketPrefix: ItemEnchantPostMarketPrefix168,
        /** Three counted post-market lists and their fixed separators. */
        postMarketLists: ItemEnchantPostMarketLists,
        /** Intrinsically framed late-tail layout. */
        tail: ItemEnchantTailMiddle48PreTextDirectPostTextDirectSuffix15,
    }).check(
        ({ fixed, tail }) =>
            ((fixed.enhancementLevel << 24) | fixed.itemId) >>> 0 ===
            tail.suffix.repeatedRowKey,
    );

/** Complete row layout exercised by 26,962 build-2954 rows. */
const ItemEnchantRowStandardPrefix168Middle48PreText4PostTextDirectSuffix15 =
    struct({
        /** Complete physical row-layout discriminator. */
        layout: literal(
            "standard/standard-168/standard-48/extra-word/direct/standard-15",
        ),
        /** Fixed 212-byte item and trade prefix. */
        fixed: ItemEnchantFixed,
        /** Pre-name counted-list layout. */
        preName: ItemEnchantPreNameStandard,
        /** Names, icon path, expressions, and market limit. */
        texts: ItemEnchantTexts,
        /** Fixed-width post-market prefix. */
        postMarketPrefix: ItemEnchantPostMarketPrefix168,
        /** Three counted post-market lists and their fixed separators. */
        postMarketLists: ItemEnchantPostMarketLists,
        /** Intrinsically framed late-tail layout. */
        tail: ItemEnchantTailMiddle48PreText4PostTextDirectSuffix15,
    }).check(
        ({ fixed, tail }) =>
            ((fixed.enhancementLevel << 24) | fixed.itemId) >>> 0 ===
            tail.suffix.repeatedRowKey,
    );

/** Complete row layout exercised by 23,113 build-2954 rows. */
const ItemEnchantRowStandardPrefix168Middle48PreText8PostTextDirectSuffix15 =
    struct({
        /** Complete physical row-layout discriminator. */
        layout: literal(
            "standard/standard-168/standard-48/extra-double-word/direct/standard-15",
        ),
        /** Fixed 212-byte item and trade prefix. */
        fixed: ItemEnchantFixed,
        /** Pre-name counted-list layout. */
        preName: ItemEnchantPreNameStandard,
        /** Names, icon path, expressions, and market limit. */
        texts: ItemEnchantTexts,
        /** Fixed-width post-market prefix. */
        postMarketPrefix: ItemEnchantPostMarketPrefix168,
        /** Three counted post-market lists and their fixed separators. */
        postMarketLists: ItemEnchantPostMarketLists,
        /** Intrinsically framed late-tail layout. */
        tail: ItemEnchantTailMiddle48PreText8PostTextDirectSuffix15,
    }).check(
        ({ fixed, tail }) =>
            ((fixed.enhancementLevel << 24) | fixed.itemId) >>> 0 ===
            tail.suffix.repeatedRowKey,
    );

/** Complete row layout exercised by 13,559 build-2954 rows. */
const ItemEnchantRowStandardPrefix168Middle48PreText12PostTextDirectSuffix15 =
    struct({
        /** Complete physical row-layout discriminator. */
        layout: literal(
            "standard/standard-168/standard-48/extra-three-word/direct/standard-15",
        ),
        /** Fixed 212-byte item and trade prefix. */
        fixed: ItemEnchantFixed,
        /** Pre-name counted-list layout. */
        preName: ItemEnchantPreNameStandard,
        /** Names, icon path, expressions, and market limit. */
        texts: ItemEnchantTexts,
        /** Fixed-width post-market prefix. */
        postMarketPrefix: ItemEnchantPostMarketPrefix168,
        /** Three counted post-market lists and their fixed separators. */
        postMarketLists: ItemEnchantPostMarketLists,
        /** Intrinsically framed late-tail layout. */
        tail: ItemEnchantTailMiddle48PreText12PostTextDirectSuffix15,
    }).check(
        ({ fixed, tail }) =>
            ((fixed.enhancementLevel << 24) | fixed.itemId) >>> 0 ===
            tail.suffix.repeatedRowKey,
    );

/** Complete row layout exercised by 13,938 build-2954 rows. */
const ItemEnchantRowStandardPrefix168Middle48PreText16PostTextDirectSuffix15 =
    struct({
        /** Complete physical row-layout discriminator. */
        layout: literal(
            "standard/standard-168/standard-48/extra-four-word/direct/standard-15",
        ),
        /** Fixed 212-byte item and trade prefix. */
        fixed: ItemEnchantFixed,
        /** Pre-name counted-list layout. */
        preName: ItemEnchantPreNameStandard,
        /** Names, icon path, expressions, and market limit. */
        texts: ItemEnchantTexts,
        /** Fixed-width post-market prefix. */
        postMarketPrefix: ItemEnchantPostMarketPrefix168,
        /** Three counted post-market lists and their fixed separators. */
        postMarketLists: ItemEnchantPostMarketLists,
        /** Intrinsically framed late-tail layout. */
        tail: ItemEnchantTailMiddle48PreText16PostTextDirectSuffix15,
    }).check(
        ({ fixed, tail }) =>
            ((fixed.enhancementLevel << 24) | fixed.itemId) >>> 0 ===
            tail.suffix.repeatedRowKey,
    );

/** Complete row layout exercised by 6,939 build-2954 rows. */
const ItemEnchantRowStandardPrefix168Middle48PreText20PostTextDirectSuffix15 =
    struct({
        /** Complete physical row-layout discriminator. */
        layout: literal(
            "standard/standard-168/standard-48/extra-five-word/direct/standard-15",
        ),
        /** Fixed 212-byte item and trade prefix. */
        fixed: ItemEnchantFixed,
        /** Pre-name counted-list layout. */
        preName: ItemEnchantPreNameStandard,
        /** Names, icon path, expressions, and market limit. */
        texts: ItemEnchantTexts,
        /** Fixed-width post-market prefix. */
        postMarketPrefix: ItemEnchantPostMarketPrefix168,
        /** Three counted post-market lists and their fixed separators. */
        postMarketLists: ItemEnchantPostMarketLists,
        /** Intrinsically framed late-tail layout. */
        tail: ItemEnchantTailMiddle48PreText20PostTextDirectSuffix15,
    }).check(
        ({ fixed, tail }) =>
            ((fixed.enhancementLevel << 24) | fixed.itemId) >>> 0 ===
            tail.suffix.repeatedRowKey,
    );

/** Complete row layout exercised by 603 build-2954 rows. */
const ItemEnchantRowStandardPrefix168Middle48PreText24PostTextDirectSuffix15 =
    struct({
        /** Complete physical row-layout discriminator. */
        layout: literal(
            "standard/standard-168/standard-48/extra-six-word/direct/standard-15",
        ),
        /** Fixed 212-byte item and trade prefix. */
        fixed: ItemEnchantFixed,
        /** Pre-name counted-list layout. */
        preName: ItemEnchantPreNameStandard,
        /** Names, icon path, expressions, and market limit. */
        texts: ItemEnchantTexts,
        /** Fixed-width post-market prefix. */
        postMarketPrefix: ItemEnchantPostMarketPrefix168,
        /** Three counted post-market lists and their fixed separators. */
        postMarketLists: ItemEnchantPostMarketLists,
        /** Intrinsically framed late-tail layout. */
        tail: ItemEnchantTailMiddle48PreText24PostTextDirectSuffix15,
    }).check(
        ({ fixed, tail }) =>
            ((fixed.enhancementLevel << 24) | fixed.itemId) >>> 0 ===
            tail.suffix.repeatedRowKey,
    );

/** Complete row layout exercised by 6 build-2954 rows. */
const ItemEnchantRowStandardPrefix168Middle48PreText28PostTextDirectSuffix15 =
    struct({
        /** Complete physical row-layout discriminator. */
        layout: literal(
            "standard/standard-168/standard-48/extra-seven-word/direct/standard-15",
        ),
        /** Fixed 212-byte item and trade prefix. */
        fixed: ItemEnchantFixed,
        /** Pre-name counted-list layout. */
        preName: ItemEnchantPreNameStandard,
        /** Names, icon path, expressions, and market limit. */
        texts: ItemEnchantTexts,
        /** Fixed-width post-market prefix. */
        postMarketPrefix: ItemEnchantPostMarketPrefix168,
        /** Three counted post-market lists and their fixed separators. */
        postMarketLists: ItemEnchantPostMarketLists,
        /** Intrinsically framed late-tail layout. */
        tail: ItemEnchantTailMiddle48PreText28PostTextDirectSuffix15,
    }).check(
        ({ fixed, tail }) =>
            ((fixed.enhancementLevel << 24) | fixed.itemId) >>> 0 ===
            tail.suffix.repeatedRowKey,
    );

/** Complete row layout exercised by 612 build-2954 rows. */
const ItemEnchantRowStandardPrefix168Middle52PreTextDirectPostTextDirectSuffix15 =
    struct({
        /** Complete physical row-layout discriminator. */
        layout: literal(
            "standard/standard-168/extra-word/direct/direct/standard-15",
        ),
        /** Fixed 212-byte item and trade prefix. */
        fixed: ItemEnchantFixed,
        /** Pre-name counted-list layout. */
        preName: ItemEnchantPreNameStandard,
        /** Names, icon path, expressions, and market limit. */
        texts: ItemEnchantTexts,
        /** Fixed-width post-market prefix. */
        postMarketPrefix: ItemEnchantPostMarketPrefix168,
        /** Three counted post-market lists and their fixed separators. */
        postMarketLists: ItemEnchantPostMarketLists,
        /** Intrinsically framed late-tail layout. */
        tail: ItemEnchantTailMiddle52PreTextDirectPostTextDirectSuffix15,
    }).check(
        ({ fixed, tail }) =>
            ((fixed.enhancementLevel << 24) | fixed.itemId) >>> 0 ===
            tail.suffix.repeatedRowKey,
    );

/** Complete row layout exercised by 67 build-2954 rows. */
const ItemEnchantRowStandardPrefix168Middle52PreText4PostTextDirectSuffix15 =
    struct({
        /** Complete physical row-layout discriminator. */
        layout: literal(
            "standard/standard-168/extra-word/extra-word/direct/standard-15",
        ),
        /** Fixed 212-byte item and trade prefix. */
        fixed: ItemEnchantFixed,
        /** Pre-name counted-list layout. */
        preName: ItemEnchantPreNameStandard,
        /** Names, icon path, expressions, and market limit. */
        texts: ItemEnchantTexts,
        /** Fixed-width post-market prefix. */
        postMarketPrefix: ItemEnchantPostMarketPrefix168,
        /** Three counted post-market lists and their fixed separators. */
        postMarketLists: ItemEnchantPostMarketLists,
        /** Intrinsically framed late-tail layout. */
        tail: ItemEnchantTailMiddle52PreText4PostTextDirectSuffix15,
    }).check(
        ({ fixed, tail }) =>
            ((fixed.enhancementLevel << 24) | fixed.itemId) >>> 0 ===
            tail.suffix.repeatedRowKey,
    );

/** Complete row layout exercised by 20 build-2954 rows. */
const ItemEnchantRowStandardPrefix168Middle52PreText8PostTextDirectSuffix15 =
    struct({
        /** Complete physical row-layout discriminator. */
        layout: literal(
            "standard/standard-168/extra-word/extra-double-word/direct/standard-15",
        ),
        /** Fixed 212-byte item and trade prefix. */
        fixed: ItemEnchantFixed,
        /** Pre-name counted-list layout. */
        preName: ItemEnchantPreNameStandard,
        /** Names, icon path, expressions, and market limit. */
        texts: ItemEnchantTexts,
        /** Fixed-width post-market prefix. */
        postMarketPrefix: ItemEnchantPostMarketPrefix168,
        /** Three counted post-market lists and their fixed separators. */
        postMarketLists: ItemEnchantPostMarketLists,
        /** Intrinsically framed late-tail layout. */
        tail: ItemEnchantTailMiddle52PreText8PostTextDirectSuffix15,
    }).check(
        ({ fixed, tail }) =>
            ((fixed.enhancementLevel << 24) | fixed.itemId) >>> 0 ===
            tail.suffix.repeatedRowKey,
    );

/** Complete row layout exercised by 1 build-2954 rows. */
const ItemEnchantRowStandardPrefix168Middle52PreText8PostText12Suffix15 =
    struct({
        /** Complete physical row-layout discriminator. */
        layout: literal(
            "standard/standard-168/extra-word/extra-double-word/expanded-12/standard-15",
        ),
        /** Fixed 212-byte item and trade prefix. */
        fixed: ItemEnchantFixed,
        /** Pre-name counted-list layout. */
        preName: ItemEnchantPreNameStandard,
        /** Names, icon path, expressions, and market limit. */
        texts: ItemEnchantTexts,
        /** Fixed-width post-market prefix. */
        postMarketPrefix: ItemEnchantPostMarketPrefix168,
        /** Three counted post-market lists and their fixed separators. */
        postMarketLists: ItemEnchantPostMarketLists,
        /** Intrinsically framed late-tail layout. */
        tail: ItemEnchantTailMiddle52PreText8PostText12Suffix15,
    }).check(
        ({ fixed, tail }) =>
            ((fixed.enhancementLevel << 24) | fixed.itemId) >>> 0 ===
            tail.suffix.repeatedRowKey,
    );

/** Complete row layout exercised by 1 build-2954 rows. */
const ItemEnchantRowStandardPrefix168Middle52PreText12PostTextDirectSuffix15 =
    struct({
        /** Complete physical row-layout discriminator. */
        layout: literal(
            "standard/standard-168/extra-word/extra-three-word/direct/standard-15",
        ),
        /** Fixed 212-byte item and trade prefix. */
        fixed: ItemEnchantFixed,
        /** Pre-name counted-list layout. */
        preName: ItemEnchantPreNameStandard,
        /** Names, icon path, expressions, and market limit. */
        texts: ItemEnchantTexts,
        /** Fixed-width post-market prefix. */
        postMarketPrefix: ItemEnchantPostMarketPrefix168,
        /** Three counted post-market lists and their fixed separators. */
        postMarketLists: ItemEnchantPostMarketLists,
        /** Intrinsically framed late-tail layout. */
        tail: ItemEnchantTailMiddle52PreText12PostTextDirectSuffix15,
    }).check(
        ({ fixed, tail }) =>
            ((fixed.enhancementLevel << 24) | fixed.itemId) >>> 0 ===
            tail.suffix.repeatedRowKey,
    );

/** Complete row layout exercised by 324 build-2954 rows. */
const ItemEnchantRowStandardPrefix168Middle88PreTextDirectPostTextDirectSuffix15 =
    struct({
        /** Complete physical row-layout discriminator. */
        layout: literal(
            "standard/standard-168/extra-ten-word/direct/direct/standard-15",
        ),
        /** Fixed 212-byte item and trade prefix. */
        fixed: ItemEnchantFixed,
        /** Pre-name counted-list layout. */
        preName: ItemEnchantPreNameStandard,
        /** Names, icon path, expressions, and market limit. */
        texts: ItemEnchantTexts,
        /** Fixed-width post-market prefix. */
        postMarketPrefix: ItemEnchantPostMarketPrefix168,
        /** Three counted post-market lists and their fixed separators. */
        postMarketLists: ItemEnchantPostMarketLists,
        /** Intrinsically framed late-tail layout. */
        tail: ItemEnchantTailMiddle88PreTextDirectPostTextDirectSuffix15,
    }).check(
        ({ fixed, tail }) =>
            ((fixed.enhancementLevel << 24) | fixed.itemId) >>> 0 ===
            tail.suffix.repeatedRowKey,
    );

/** Complete row layout exercised by 2 build-2954 rows. */
const ItemEnchantRowStandardPrefix168Middle88PreText4PostTextDirectSuffix15 =
    struct({
        /** Complete physical row-layout discriminator. */
        layout: literal(
            "standard/standard-168/extra-ten-word/extra-word/direct/standard-15",
        ),
        /** Fixed 212-byte item and trade prefix. */
        fixed: ItemEnchantFixed,
        /** Pre-name counted-list layout. */
        preName: ItemEnchantPreNameStandard,
        /** Names, icon path, expressions, and market limit. */
        texts: ItemEnchantTexts,
        /** Fixed-width post-market prefix. */
        postMarketPrefix: ItemEnchantPostMarketPrefix168,
        /** Three counted post-market lists and their fixed separators. */
        postMarketLists: ItemEnchantPostMarketLists,
        /** Intrinsically framed late-tail layout. */
        tail: ItemEnchantTailMiddle88PreText4PostTextDirectSuffix15,
    }).check(
        ({ fixed, tail }) =>
            ((fixed.enhancementLevel << 24) | fixed.itemId) >>> 0 ===
            tail.suffix.repeatedRowKey,
    );

/** Complete row layout exercised by 2 build-2954 rows. */
const ItemEnchantRowStandardPrefix168Middle88PreText8PostTextDirectSuffix15 =
    struct({
        /** Complete physical row-layout discriminator. */
        layout: literal(
            "standard/standard-168/extra-ten-word/extra-double-word/direct/standard-15",
        ),
        /** Fixed 212-byte item and trade prefix. */
        fixed: ItemEnchantFixed,
        /** Pre-name counted-list layout. */
        preName: ItemEnchantPreNameStandard,
        /** Names, icon path, expressions, and market limit. */
        texts: ItemEnchantTexts,
        /** Fixed-width post-market prefix. */
        postMarketPrefix: ItemEnchantPostMarketPrefix168,
        /** Three counted post-market lists and their fixed separators. */
        postMarketLists: ItemEnchantPostMarketLists,
        /** Intrinsically framed late-tail layout. */
        tail: ItemEnchantTailMiddle88PreText8PostTextDirectSuffix15,
    }).check(
        ({ fixed, tail }) =>
            ((fixed.enhancementLevel << 24) | fixed.itemId) >>> 0 ===
            tail.suffix.repeatedRowKey,
    );

/** Complete row layout exercised by 1 build-2954 rows. */
const ItemEnchantRowStandardPrefix168Middle88PreText16PostTextDirectSuffix15 =
    struct({
        /** Complete physical row-layout discriminator. */
        layout: literal(
            "standard/standard-168/extra-ten-word/extra-four-word/direct/standard-15",
        ),
        /** Fixed 212-byte item and trade prefix. */
        fixed: ItemEnchantFixed,
        /** Pre-name counted-list layout. */
        preName: ItemEnchantPreNameStandard,
        /** Names, icon path, expressions, and market limit. */
        texts: ItemEnchantTexts,
        /** Fixed-width post-market prefix. */
        postMarketPrefix: ItemEnchantPostMarketPrefix168,
        /** Three counted post-market lists and their fixed separators. */
        postMarketLists: ItemEnchantPostMarketLists,
        /** Intrinsically framed late-tail layout. */
        tail: ItemEnchantTailMiddle88PreText16PostTextDirectSuffix15,
    }).check(
        ({ fixed, tail }) =>
            ((fixed.enhancementLevel << 24) | fixed.itemId) >>> 0 ===
            tail.suffix.repeatedRowKey,
    );

/** Complete row layout exercised by 11 build-2954 rows. */
const ItemEnchantRowStandardPrefix168Middle64PreTextDirectPostTextDirectSuffix15 =
    struct({
        /** Complete physical row-layout discriminator. */
        layout: literal(
            "standard/standard-168/extra-four-word/direct/direct/standard-15",
        ),
        /** Fixed 212-byte item and trade prefix. */
        fixed: ItemEnchantFixed,
        /** Pre-name counted-list layout. */
        preName: ItemEnchantPreNameStandard,
        /** Names, icon path, expressions, and market limit. */
        texts: ItemEnchantTexts,
        /** Fixed-width post-market prefix. */
        postMarketPrefix: ItemEnchantPostMarketPrefix168,
        /** Three counted post-market lists and their fixed separators. */
        postMarketLists: ItemEnchantPostMarketLists,
        /** Intrinsically framed late-tail layout. */
        tail: ItemEnchantTailMiddle64PreTextDirectPostTextDirectSuffix15,
    }).check(
        ({ fixed, tail }) =>
            ((fixed.enhancementLevel << 24) | fixed.itemId) >>> 0 ===
            tail.suffix.repeatedRowKey,
    );

/** Complete row layout exercised by 9 build-2954 rows. */
const ItemEnchantRowStandardPrefix168Middle280PreTextDirectPostTextDirectSuffix15 =
    struct({
        /** Complete physical row-layout discriminator. */
        layout: literal("standard/standard-168/wide/direct/direct/standard-15"),
        /** Fixed 212-byte item and trade prefix. */
        fixed: ItemEnchantFixed,
        /** Pre-name counted-list layout. */
        preName: ItemEnchantPreNameStandard,
        /** Names, icon path, expressions, and market limit. */
        texts: ItemEnchantTexts,
        /** Fixed-width post-market prefix. */
        postMarketPrefix: ItemEnchantPostMarketPrefix168,
        /** Three counted post-market lists and their fixed separators. */
        postMarketLists: ItemEnchantPostMarketLists,
        /** Intrinsically framed late-tail layout. */
        tail: ItemEnchantTailMiddle280PreTextDirectPostTextDirectSuffix15,
    }).check(
        ({ fixed, tail }) =>
            ((fixed.enhancementLevel << 24) | fixed.itemId) >>> 0 ===
            tail.suffix.repeatedRowKey,
    );

/** Complete row layout exercised by 4 build-2954 rows. */
const ItemEnchantRowStandardPrefix168Middle104PreText4PostTextDirectSuffix15 =
    struct({
        /** Complete physical row-layout discriminator. */
        layout: literal(
            "standard/standard-168/wide-104/extra-word/direct/standard-15",
        ),
        /** Fixed 212-byte item and trade prefix. */
        fixed: ItemEnchantFixed,
        /** Pre-name counted-list layout. */
        preName: ItemEnchantPreNameStandard,
        /** Names, icon path, expressions, and market limit. */
        texts: ItemEnchantTexts,
        /** Fixed-width post-market prefix. */
        postMarketPrefix: ItemEnchantPostMarketPrefix168,
        /** Three counted post-market lists and their fixed separators. */
        postMarketLists: ItemEnchantPostMarketLists,
        /** Intrinsically framed late-tail layout. */
        tail: ItemEnchantTailMiddle104PreText4PostTextDirectSuffix15,
    }).check(
        ({ fixed, tail }) =>
            ((fixed.enhancementLevel << 24) | fixed.itemId) >>> 0 ===
            tail.suffix.repeatedRowKey,
    );

/** Complete row layout exercised by 1 build-2954 rows. */
const ItemEnchantRowStandardPrefix168Middle116PreTextDirectPostTextDirectSuffix15 =
    struct({
        /** Complete physical row-layout discriminator. */
        layout: literal(
            "standard/standard-168/wide-116/direct/direct/standard-15",
        ),
        /** Fixed 212-byte item and trade prefix. */
        fixed: ItemEnchantFixed,
        /** Pre-name counted-list layout. */
        preName: ItemEnchantPreNameStandard,
        /** Names, icon path, expressions, and market limit. */
        texts: ItemEnchantTexts,
        /** Fixed-width post-market prefix. */
        postMarketPrefix: ItemEnchantPostMarketPrefix168,
        /** Three counted post-market lists and their fixed separators. */
        postMarketLists: ItemEnchantPostMarketLists,
        /** Intrinsically framed late-tail layout. */
        tail: ItemEnchantTailMiddle116PreTextDirectPostTextDirectSuffix15,
    }).check(
        ({ fixed, tail }) =>
            ((fixed.enhancementLevel << 24) | fixed.itemId) >>> 0 ===
            tail.suffix.repeatedRowKey,
    );

/** Complete row layout exercised by 6 build-2954 rows. */
const ItemEnchantRowStandardPrefix168Middle76PreTextDirectPostTextDirectSuffix15 =
    struct({
        /** Complete physical row-layout discriminator. */
        layout: literal(
            "standard/standard-168/wide-76/direct/direct/standard-15",
        ),
        /** Fixed 212-byte item and trade prefix. */
        fixed: ItemEnchantFixed,
        /** Pre-name counted-list layout. */
        preName: ItemEnchantPreNameStandard,
        /** Names, icon path, expressions, and market limit. */
        texts: ItemEnchantTexts,
        /** Fixed-width post-market prefix. */
        postMarketPrefix: ItemEnchantPostMarketPrefix168,
        /** Three counted post-market lists and their fixed separators. */
        postMarketLists: ItemEnchantPostMarketLists,
        /** Intrinsically framed late-tail layout. */
        tail: ItemEnchantTailMiddle76PreTextDirectPostTextDirectSuffix15,
    }).check(
        ({ fixed, tail }) =>
            ((fixed.enhancementLevel << 24) | fixed.itemId) >>> 0 ===
            tail.suffix.repeatedRowKey,
    );

/** Complete row layout exercised by 1 build-2954 rows. */
const ItemEnchantRowStandardPrefix168Middle76PreText4PostTextDirectSuffix15 =
    struct({
        /** Complete physical row-layout discriminator. */
        layout: literal(
            "standard/standard-168/wide-76/extra-word/direct/standard-15",
        ),
        /** Fixed 212-byte item and trade prefix. */
        fixed: ItemEnchantFixed,
        /** Pre-name counted-list layout. */
        preName: ItemEnchantPreNameStandard,
        /** Names, icon path, expressions, and market limit. */
        texts: ItemEnchantTexts,
        /** Fixed-width post-market prefix. */
        postMarketPrefix: ItemEnchantPostMarketPrefix168,
        /** Three counted post-market lists and their fixed separators. */
        postMarketLists: ItemEnchantPostMarketLists,
        /** Intrinsically framed late-tail layout. */
        tail: ItemEnchantTailMiddle76PreText4PostTextDirectSuffix15,
    }).check(
        ({ fixed, tail }) =>
            ((fixed.enhancementLevel << 24) | fixed.itemId) >>> 0 ===
            tail.suffix.repeatedRowKey,
    );

/** Complete row layout exercised by 9 build-2954 rows. */
const ItemEnchantRowStandardPrefix168Middle104PreTextDirectPostTextDirectSuffix15 =
    struct({
        /** Complete physical row-layout discriminator. */
        layout: literal(
            "standard/standard-168/wide-104/direct/direct/standard-15",
        ),
        /** Fixed 212-byte item and trade prefix. */
        fixed: ItemEnchantFixed,
        /** Pre-name counted-list layout. */
        preName: ItemEnchantPreNameStandard,
        /** Names, icon path, expressions, and market limit. */
        texts: ItemEnchantTexts,
        /** Fixed-width post-market prefix. */
        postMarketPrefix: ItemEnchantPostMarketPrefix168,
        /** Three counted post-market lists and their fixed separators. */
        postMarketLists: ItemEnchantPostMarketLists,
        /** Intrinsically framed late-tail layout. */
        tail: ItemEnchantTailMiddle104PreTextDirectPostTextDirectSuffix15,
    }).check(
        ({ fixed, tail }) =>
            ((fixed.enhancementLevel << 24) | fixed.itemId) >>> 0 ===
            tail.suffix.repeatedRowKey,
    );

/** Complete row layout exercised by 1 build-2954 rows. */
const ItemEnchantRowStandardPrefix168Middle108PreTextDirectPostTextDirectSuffix15 =
    struct({
        /** Complete physical row-layout discriminator. */
        layout: literal(
            "standard/standard-168/wide-108/direct/direct/standard-15",
        ),
        /** Fixed 212-byte item and trade prefix. */
        fixed: ItemEnchantFixed,
        /** Pre-name counted-list layout. */
        preName: ItemEnchantPreNameStandard,
        /** Names, icon path, expressions, and market limit. */
        texts: ItemEnchantTexts,
        /** Fixed-width post-market prefix. */
        postMarketPrefix: ItemEnchantPostMarketPrefix168,
        /** Three counted post-market lists and their fixed separators. */
        postMarketLists: ItemEnchantPostMarketLists,
        /** Intrinsically framed late-tail layout. */
        tail: ItemEnchantTailMiddle108PreTextDirectPostTextDirectSuffix15,
    }).check(
        ({ fixed, tail }) =>
            ((fixed.enhancementLevel << 24) | fixed.itemId) >>> 0 ===
            tail.suffix.repeatedRowKey,
    );

/** Complete row layout exercised by 66 build-2954 rows. */
const ItemEnchantRowStandardPrefix168Middle50PreText12PostTextDirectSuffix17 =
    struct({
        /** Complete physical row-layout discriminator. */
        layout: literal(
            "standard/standard-168/extra-half-word/extra-three-word/direct/extra-half-word",
        ),
        /** Fixed 212-byte item and trade prefix. */
        fixed: ItemEnchantFixed,
        /** Pre-name counted-list layout. */
        preName: ItemEnchantPreNameStandard,
        /** Names, icon path, expressions, and market limit. */
        texts: ItemEnchantTexts,
        /** Fixed-width post-market prefix. */
        postMarketPrefix: ItemEnchantPostMarketPrefix168,
        /** Three counted post-market lists and their fixed separators. */
        postMarketLists: ItemEnchantPostMarketLists,
        /** Intrinsically framed late-tail layout. */
        tail: ItemEnchantTailMiddle50PreText12PostTextDirectSuffix17,
    }).check(
        ({ fixed, tail }) =>
            ((fixed.enhancementLevel << 24) | fixed.itemId) >>> 0 ===
            tail.suffix.repeatedRowKey,
    );

/** Complete row layout exercised by 88 build-2954 rows. */
const ItemEnchantRowStandardPrefix168Middle50PreText4PostTextDirectSuffix17 =
    struct({
        /** Complete physical row-layout discriminator. */
        layout: literal(
            "standard/standard-168/extra-half-word/extra-word/direct/extra-half-word",
        ),
        /** Fixed 212-byte item and trade prefix. */
        fixed: ItemEnchantFixed,
        /** Pre-name counted-list layout. */
        preName: ItemEnchantPreNameStandard,
        /** Names, icon path, expressions, and market limit. */
        texts: ItemEnchantTexts,
        /** Fixed-width post-market prefix. */
        postMarketPrefix: ItemEnchantPostMarketPrefix168,
        /** Three counted post-market lists and their fixed separators. */
        postMarketLists: ItemEnchantPostMarketLists,
        /** Intrinsically framed late-tail layout. */
        tail: ItemEnchantTailMiddle50PreText4PostTextDirectSuffix17,
    }).check(
        ({ fixed, tail }) =>
            ((fixed.enhancementLevel << 24) | fixed.itemId) >>> 0 ===
            tail.suffix.repeatedRowKey,
    );

/** Complete row layout exercised by 101 build-2954 rows. */
const ItemEnchantRowStandardPrefix168Middle50PreText8PostTextDirectSuffix17 =
    struct({
        /** Complete physical row-layout discriminator. */
        layout: literal(
            "standard/standard-168/extra-half-word/extra-double-word/direct/extra-half-word",
        ),
        /** Fixed 212-byte item and trade prefix. */
        fixed: ItemEnchantFixed,
        /** Pre-name counted-list layout. */
        preName: ItemEnchantPreNameStandard,
        /** Names, icon path, expressions, and market limit. */
        texts: ItemEnchantTexts,
        /** Fixed-width post-market prefix. */
        postMarketPrefix: ItemEnchantPostMarketPrefix168,
        /** Three counted post-market lists and their fixed separators. */
        postMarketLists: ItemEnchantPostMarketLists,
        /** Intrinsically framed late-tail layout. */
        tail: ItemEnchantTailMiddle50PreText8PostTextDirectSuffix17,
    }).check(
        ({ fixed, tail }) =>
            ((fixed.enhancementLevel << 24) | fixed.itemId) >>> 0 ===
            tail.suffix.repeatedRowKey,
    );

/** Complete row layout exercised by 50 build-2954 rows. */
const ItemEnchantRowStandardPrefix168Middle50PreText20PostTextDirectSuffix17 =
    struct({
        /** Complete physical row-layout discriminator. */
        layout: literal(
            "standard/standard-168/extra-half-word/extra-five-word/direct/extra-half-word",
        ),
        /** Fixed 212-byte item and trade prefix. */
        fixed: ItemEnchantFixed,
        /** Pre-name counted-list layout. */
        preName: ItemEnchantPreNameStandard,
        /** Names, icon path, expressions, and market limit. */
        texts: ItemEnchantTexts,
        /** Fixed-width post-market prefix. */
        postMarketPrefix: ItemEnchantPostMarketPrefix168,
        /** Three counted post-market lists and their fixed separators. */
        postMarketLists: ItemEnchantPostMarketLists,
        /** Intrinsically framed late-tail layout. */
        tail: ItemEnchantTailMiddle50PreText20PostTextDirectSuffix17,
    }).check(
        ({ fixed, tail }) =>
            ((fixed.enhancementLevel << 24) | fixed.itemId) >>> 0 ===
            tail.suffix.repeatedRowKey,
    );

/** Complete row layout exercised by 4 build-2954 rows. */
const ItemEnchantRowStandardPrefix168Middle50PreText24PostTextDirectSuffix17 =
    struct({
        /** Complete physical row-layout discriminator. */
        layout: literal(
            "standard/standard-168/extra-half-word/extra-six-word/direct/extra-half-word",
        ),
        /** Fixed 212-byte item and trade prefix. */
        fixed: ItemEnchantFixed,
        /** Pre-name counted-list layout. */
        preName: ItemEnchantPreNameStandard,
        /** Names, icon path, expressions, and market limit. */
        texts: ItemEnchantTexts,
        /** Fixed-width post-market prefix. */
        postMarketPrefix: ItemEnchantPostMarketPrefix168,
        /** Three counted post-market lists and their fixed separators. */
        postMarketLists: ItemEnchantPostMarketLists,
        /** Intrinsically framed late-tail layout. */
        tail: ItemEnchantTailMiddle50PreText24PostTextDirectSuffix17,
    }).check(
        ({ fixed, tail }) =>
            ((fixed.enhancementLevel << 24) | fixed.itemId) >>> 0 ===
            tail.suffix.repeatedRowKey,
    );

/** Complete row layout exercised by 95 build-2954 rows. */
const ItemEnchantRowStandardPrefix168Middle50PreText16PostTextDirectSuffix17 =
    struct({
        /** Complete physical row-layout discriminator. */
        layout: literal(
            "standard/standard-168/extra-half-word/extra-four-word/direct/extra-half-word",
        ),
        /** Fixed 212-byte item and trade prefix. */
        fixed: ItemEnchantFixed,
        /** Pre-name counted-list layout. */
        preName: ItemEnchantPreNameStandard,
        /** Names, icon path, expressions, and market limit. */
        texts: ItemEnchantTexts,
        /** Fixed-width post-market prefix. */
        postMarketPrefix: ItemEnchantPostMarketPrefix168,
        /** Three counted post-market lists and their fixed separators. */
        postMarketLists: ItemEnchantPostMarketLists,
        /** Intrinsically framed late-tail layout. */
        tail: ItemEnchantTailMiddle50PreText16PostTextDirectSuffix17,
    }).check(
        ({ fixed, tail }) =>
            ((fixed.enhancementLevel << 24) | fixed.itemId) >>> 0 ===
            tail.suffix.repeatedRowKey,
    );

/** Complete row layout exercised by 190 build-2954 rows. */
const ItemEnchantRowStandardPrefix168Middle48PreText4PostTextDirectSuffix17 =
    struct({
        /** Complete physical row-layout discriminator. */
        layout: literal(
            "standard/standard-168/standard-48/extra-word/direct/extra-half-word",
        ),
        /** Fixed 212-byte item and trade prefix. */
        fixed: ItemEnchantFixed,
        /** Pre-name counted-list layout. */
        preName: ItemEnchantPreNameStandard,
        /** Names, icon path, expressions, and market limit. */
        texts: ItemEnchantTexts,
        /** Fixed-width post-market prefix. */
        postMarketPrefix: ItemEnchantPostMarketPrefix168,
        /** Three counted post-market lists and their fixed separators. */
        postMarketLists: ItemEnchantPostMarketLists,
        /** Intrinsically framed late-tail layout. */
        tail: ItemEnchantTailMiddle48PreText4PostTextDirectSuffix17,
    }).check(
        ({ fixed, tail }) =>
            ((fixed.enhancementLevel << 24) | fixed.itemId) >>> 0 ===
            tail.suffix.repeatedRowKey,
    );

/** Complete row layout exercised by 238 build-2954 rows. */
const ItemEnchantRowStandardPrefix168Middle48PreTextDirectPostTextDirectSuffix17 =
    struct({
        /** Complete physical row-layout discriminator. */
        layout: literal(
            "standard/standard-168/standard-48/direct/direct/extra-half-word",
        ),
        /** Fixed 212-byte item and trade prefix. */
        fixed: ItemEnchantFixed,
        /** Pre-name counted-list layout. */
        preName: ItemEnchantPreNameStandard,
        /** Names, icon path, expressions, and market limit. */
        texts: ItemEnchantTexts,
        /** Fixed-width post-market prefix. */
        postMarketPrefix: ItemEnchantPostMarketPrefix168,
        /** Three counted post-market lists and their fixed separators. */
        postMarketLists: ItemEnchantPostMarketLists,
        /** Intrinsically framed late-tail layout. */
        tail: ItemEnchantTailMiddle48PreTextDirectPostTextDirectSuffix17,
    }).check(
        ({ fixed, tail }) =>
            ((fixed.enhancementLevel << 24) | fixed.itemId) >>> 0 ===
            tail.suffix.repeatedRowKey,
    );

/** Complete row layout exercised by 125 build-2954 rows. */
const ItemEnchantRowStandardPrefix168Middle48PreText8PostTextDirectSuffix17 =
    struct({
        /** Complete physical row-layout discriminator. */
        layout: literal(
            "standard/standard-168/standard-48/extra-double-word/direct/extra-half-word",
        ),
        /** Fixed 212-byte item and trade prefix. */
        fixed: ItemEnchantFixed,
        /** Pre-name counted-list layout. */
        preName: ItemEnchantPreNameStandard,
        /** Names, icon path, expressions, and market limit. */
        texts: ItemEnchantTexts,
        /** Fixed-width post-market prefix. */
        postMarketPrefix: ItemEnchantPostMarketPrefix168,
        /** Three counted post-market lists and their fixed separators. */
        postMarketLists: ItemEnchantPostMarketLists,
        /** Intrinsically framed late-tail layout. */
        tail: ItemEnchantTailMiddle48PreText8PostTextDirectSuffix17,
    }).check(
        ({ fixed, tail }) =>
            ((fixed.enhancementLevel << 24) | fixed.itemId) >>> 0 ===
            tail.suffix.repeatedRowKey,
    );

/** Complete row layout exercised by 147 build-2954 rows. */
const ItemEnchantRowStandardPrefix168Middle48PreText12PostTextDirectSuffix17 =
    struct({
        /** Complete physical row-layout discriminator. */
        layout: literal(
            "standard/standard-168/standard-48/extra-three-word/direct/extra-half-word",
        ),
        /** Fixed 212-byte item and trade prefix. */
        fixed: ItemEnchantFixed,
        /** Pre-name counted-list layout. */
        preName: ItemEnchantPreNameStandard,
        /** Names, icon path, expressions, and market limit. */
        texts: ItemEnchantTexts,
        /** Fixed-width post-market prefix. */
        postMarketPrefix: ItemEnchantPostMarketPrefix168,
        /** Three counted post-market lists and their fixed separators. */
        postMarketLists: ItemEnchantPostMarketLists,
        /** Intrinsically framed late-tail layout. */
        tail: ItemEnchantTailMiddle48PreText12PostTextDirectSuffix17,
    }).check(
        ({ fixed, tail }) =>
            ((fixed.enhancementLevel << 24) | fixed.itemId) >>> 0 ===
            tail.suffix.repeatedRowKey,
    );

/** Complete row layout exercised by 28 build-2954 rows. */
const ItemEnchantRowStandardPrefix168Middle48PreText16PostTextDirectSuffix17 =
    struct({
        /** Complete physical row-layout discriminator. */
        layout: literal(
            "standard/standard-168/standard-48/extra-four-word/direct/extra-half-word",
        ),
        /** Fixed 212-byte item and trade prefix. */
        fixed: ItemEnchantFixed,
        /** Pre-name counted-list layout. */
        preName: ItemEnchantPreNameStandard,
        /** Names, icon path, expressions, and market limit. */
        texts: ItemEnchantTexts,
        /** Fixed-width post-market prefix. */
        postMarketPrefix: ItemEnchantPostMarketPrefix168,
        /** Three counted post-market lists and their fixed separators. */
        postMarketLists: ItemEnchantPostMarketLists,
        /** Intrinsically framed late-tail layout. */
        tail: ItemEnchantTailMiddle48PreText16PostTextDirectSuffix17,
    }).check(
        ({ fixed, tail }) =>
            ((fixed.enhancementLevel << 24) | fixed.itemId) >>> 0 ===
            tail.suffix.repeatedRowKey,
    );

/** Complete row layout exercised by 33 build-2954 rows. */
const ItemEnchantRowStandardPrefix168Middle48PreText4PostTextDirectSuffixCountedU16 =
    struct({
        /** Complete physical row-layout discriminator. */
        layout: literal(
            "standard/standard-168/standard-48/extra-word/direct/counted-u16",
        ),
        /** Fixed 212-byte item and trade prefix. */
        fixed: ItemEnchantFixed,
        /** Pre-name counted-list layout. */
        preName: ItemEnchantPreNameStandard,
        /** Names, icon path, expressions, and market limit. */
        texts: ItemEnchantTexts,
        /** Fixed-width post-market prefix. */
        postMarketPrefix: ItemEnchantPostMarketPrefix168,
        /** Three counted post-market lists and their fixed separators. */
        postMarketLists: ItemEnchantPostMarketLists,
        /** Intrinsically framed late-tail layout. */
        tail: ItemEnchantTailMiddle48PreText4PostTextDirectSuffixCountedU16,
    }).check(
        ({ fixed, tail }) =>
            ((fixed.enhancementLevel << 24) | fixed.itemId) >>> 0 ===
            tail.suffix.repeatedRowKey,
    );

/** Complete row layout exercised by 46 build-2954 rows. */
const ItemEnchantRowStandardPrefix168Middle48PreTextDirectPostTextDirectSuffixCountedU16 =
    struct({
        /** Complete physical row-layout discriminator. */
        layout: literal(
            "standard/standard-168/standard-48/direct/direct/counted-u16",
        ),
        /** Fixed 212-byte item and trade prefix. */
        fixed: ItemEnchantFixed,
        /** Pre-name counted-list layout. */
        preName: ItemEnchantPreNameStandard,
        /** Names, icon path, expressions, and market limit. */
        texts: ItemEnchantTexts,
        /** Fixed-width post-market prefix. */
        postMarketPrefix: ItemEnchantPostMarketPrefix168,
        /** Three counted post-market lists and their fixed separators. */
        postMarketLists: ItemEnchantPostMarketLists,
        /** Intrinsically framed late-tail layout. */
        tail: ItemEnchantTailMiddle48PreTextDirectPostTextDirectSuffixCountedU16,
    }).check(
        ({ fixed, tail }) =>
            ((fixed.enhancementLevel << 24) | fixed.itemId) >>> 0 ===
            tail.suffix.repeatedRowKey,
    );

/** Complete row layout exercised by 37 build-2954 rows. */
const ItemEnchantRowStandardPrefix164Middle48PreText8PostTextDirectSuffix15 =
    struct({
        /** Complete physical row-layout discriminator. */
        layout: literal(
            "standard/short/standard-48/extra-double-word/direct/standard-15",
        ),
        /** Fixed 212-byte item and trade prefix. */
        fixed: ItemEnchantFixed,
        /** Pre-name counted-list layout. */
        preName: ItemEnchantPreNameStandard,
        /** Names, icon path, expressions, and market limit. */
        texts: ItemEnchantTexts,
        /** Fixed-width post-market prefix. */
        postMarketPrefix: ItemEnchantPostMarketPrefix164,
        /** Three counted post-market lists and their fixed separators. */
        postMarketLists: ItemEnchantPostMarketLists,
        /** Intrinsically framed late-tail layout. */
        tail: ItemEnchantTailMiddle48PreText8PostTextDirectSuffix15,
    }).check(
        ({ fixed, tail }) =>
            ((fixed.enhancementLevel << 24) | fixed.itemId) >>> 0 ===
            tail.suffix.repeatedRowKey,
    );

/** Complete row layout exercised by 13 build-2954 rows. */
const ItemEnchantRowStandardPrefix164Middle48PreText12PostTextDirectSuffix15 =
    struct({
        /** Complete physical row-layout discriminator. */
        layout: literal(
            "standard/short/standard-48/extra-three-word/direct/standard-15",
        ),
        /** Fixed 212-byte item and trade prefix. */
        fixed: ItemEnchantFixed,
        /** Pre-name counted-list layout. */
        preName: ItemEnchantPreNameStandard,
        /** Names, icon path, expressions, and market limit. */
        texts: ItemEnchantTexts,
        /** Fixed-width post-market prefix. */
        postMarketPrefix: ItemEnchantPostMarketPrefix164,
        /** Three counted post-market lists and their fixed separators. */
        postMarketLists: ItemEnchantPostMarketLists,
        /** Intrinsically framed late-tail layout. */
        tail: ItemEnchantTailMiddle48PreText12PostTextDirectSuffix15,
    }).check(
        ({ fixed, tail }) =>
            ((fixed.enhancementLevel << 24) | fixed.itemId) >>> 0 ===
            tail.suffix.repeatedRowKey,
    );

/** Complete row layout exercised by 38 build-2954 rows. */
const ItemEnchantRowStandardPrefix164Middle48PreText16PostTextDirectSuffix15 =
    struct({
        /** Complete physical row-layout discriminator. */
        layout: literal(
            "standard/short/standard-48/extra-four-word/direct/standard-15",
        ),
        /** Fixed 212-byte item and trade prefix. */
        fixed: ItemEnchantFixed,
        /** Pre-name counted-list layout. */
        preName: ItemEnchantPreNameStandard,
        /** Names, icon path, expressions, and market limit. */
        texts: ItemEnchantTexts,
        /** Fixed-width post-market prefix. */
        postMarketPrefix: ItemEnchantPostMarketPrefix164,
        /** Three counted post-market lists and their fixed separators. */
        postMarketLists: ItemEnchantPostMarketLists,
        /** Intrinsically framed late-tail layout. */
        tail: ItemEnchantTailMiddle48PreText16PostTextDirectSuffix15,
    }).check(
        ({ fixed, tail }) =>
            ((fixed.enhancementLevel << 24) | fixed.itemId) >>> 0 ===
            tail.suffix.repeatedRowKey,
    );

/** Complete row layout exercised by 13 build-2954 rows. */
const ItemEnchantRowStandardPrefix164Middle48PreText20PostTextDirectSuffix15 =
    struct({
        /** Complete physical row-layout discriminator. */
        layout: literal(
            "standard/short/standard-48/extra-five-word/direct/standard-15",
        ),
        /** Fixed 212-byte item and trade prefix. */
        fixed: ItemEnchantFixed,
        /** Pre-name counted-list layout. */
        preName: ItemEnchantPreNameStandard,
        /** Names, icon path, expressions, and market limit. */
        texts: ItemEnchantTexts,
        /** Fixed-width post-market prefix. */
        postMarketPrefix: ItemEnchantPostMarketPrefix164,
        /** Three counted post-market lists and their fixed separators. */
        postMarketLists: ItemEnchantPostMarketLists,
        /** Intrinsically framed late-tail layout. */
        tail: ItemEnchantTailMiddle48PreText20PostTextDirectSuffix15,
    }).check(
        ({ fixed, tail }) =>
            ((fixed.enhancementLevel << 24) | fixed.itemId) >>> 0 ===
            tail.suffix.repeatedRowKey,
    );

/** Complete row layout exercised by 1 build-2954 rows. */
const ItemEnchantRowStandardPrefix164Middle48PreText24PostTextDirectSuffix15 =
    struct({
        /** Complete physical row-layout discriminator. */
        layout: literal(
            "standard/short/standard-48/extra-six-word/direct/standard-15",
        ),
        /** Fixed 212-byte item and trade prefix. */
        fixed: ItemEnchantFixed,
        /** Pre-name counted-list layout. */
        preName: ItemEnchantPreNameStandard,
        /** Names, icon path, expressions, and market limit. */
        texts: ItemEnchantTexts,
        /** Fixed-width post-market prefix. */
        postMarketPrefix: ItemEnchantPostMarketPrefix164,
        /** Three counted post-market lists and their fixed separators. */
        postMarketLists: ItemEnchantPostMarketLists,
        /** Intrinsically framed late-tail layout. */
        tail: ItemEnchantTailMiddle48PreText24PostTextDirectSuffix15,
    }).check(
        ({ fixed, tail }) =>
            ((fixed.enhancementLevel << 24) | fixed.itemId) >>> 0 ===
            tail.suffix.repeatedRowKey,
    );

/** Complete row layout exercised by 9 build-2954 rows. */
const ItemEnchantRowStandardPrefix164Middle48PreText28PostTextDirectSuffix15 =
    struct({
        /** Complete physical row-layout discriminator. */
        layout: literal(
            "standard/short/standard-48/extra-seven-word/direct/standard-15",
        ),
        /** Fixed 212-byte item and trade prefix. */
        fixed: ItemEnchantFixed,
        /** Pre-name counted-list layout. */
        preName: ItemEnchantPreNameStandard,
        /** Names, icon path, expressions, and market limit. */
        texts: ItemEnchantTexts,
        /** Fixed-width post-market prefix. */
        postMarketPrefix: ItemEnchantPostMarketPrefix164,
        /** Three counted post-market lists and their fixed separators. */
        postMarketLists: ItemEnchantPostMarketLists,
        /** Intrinsically framed late-tail layout. */
        tail: ItemEnchantTailMiddle48PreText28PostTextDirectSuffix15,
    }).check(
        ({ fixed, tail }) =>
            ((fixed.enhancementLevel << 24) | fixed.itemId) >>> 0 ===
            tail.suffix.repeatedRowKey,
    );

/** Complete row layout exercised by 214 build-2954 rows. */
const ItemEnchantRowStandardPrefix164Middle52PreTextDirectPostTextDirectSuffix15 =
    struct({
        /** Complete physical row-layout discriminator. */
        layout: literal("standard/short/extra-word/direct/direct/standard-15"),
        /** Fixed 212-byte item and trade prefix. */
        fixed: ItemEnchantFixed,
        /** Pre-name counted-list layout. */
        preName: ItemEnchantPreNameStandard,
        /** Names, icon path, expressions, and market limit. */
        texts: ItemEnchantTexts,
        /** Fixed-width post-market prefix. */
        postMarketPrefix: ItemEnchantPostMarketPrefix164,
        /** Three counted post-market lists and their fixed separators. */
        postMarketLists: ItemEnchantPostMarketLists,
        /** Intrinsically framed late-tail layout. */
        tail: ItemEnchantTailMiddle52PreTextDirectPostTextDirectSuffix15,
    }).check(
        ({ fixed, tail }) =>
            ((fixed.enhancementLevel << 24) | fixed.itemId) >>> 0 ===
            tail.suffix.repeatedRowKey,
    );

/** Complete row layout exercised by 55 build-2954 rows. */
const ItemEnchantRowStandardPrefix164Middle52PreText4PostTextDirectSuffix15 =
    struct({
        /** Complete physical row-layout discriminator. */
        layout: literal(
            "standard/short/extra-word/extra-word/direct/standard-15",
        ),
        /** Fixed 212-byte item and trade prefix. */
        fixed: ItemEnchantFixed,
        /** Pre-name counted-list layout. */
        preName: ItemEnchantPreNameStandard,
        /** Names, icon path, expressions, and market limit. */
        texts: ItemEnchantTexts,
        /** Fixed-width post-market prefix. */
        postMarketPrefix: ItemEnchantPostMarketPrefix164,
        /** Three counted post-market lists and their fixed separators. */
        postMarketLists: ItemEnchantPostMarketLists,
        /** Intrinsically framed late-tail layout. */
        tail: ItemEnchantTailMiddle52PreText4PostTextDirectSuffix15,
    }).check(
        ({ fixed, tail }) =>
            ((fixed.enhancementLevel << 24) | fixed.itemId) >>> 0 ===
            tail.suffix.repeatedRowKey,
    );

/** Complete row layout exercised by 5 build-2954 rows. */
const ItemEnchantRowStandardPrefix164Middle52PreText8PostTextDirectSuffix15 =
    struct({
        /** Complete physical row-layout discriminator. */
        layout: literal(
            "standard/short/extra-word/extra-double-word/direct/standard-15",
        ),
        /** Fixed 212-byte item and trade prefix. */
        fixed: ItemEnchantFixed,
        /** Pre-name counted-list layout. */
        preName: ItemEnchantPreNameStandard,
        /** Names, icon path, expressions, and market limit. */
        texts: ItemEnchantTexts,
        /** Fixed-width post-market prefix. */
        postMarketPrefix: ItemEnchantPostMarketPrefix164,
        /** Three counted post-market lists and their fixed separators. */
        postMarketLists: ItemEnchantPostMarketLists,
        /** Intrinsically framed late-tail layout. */
        tail: ItemEnchantTailMiddle52PreText8PostTextDirectSuffix15,
    }).check(
        ({ fixed, tail }) =>
            ((fixed.enhancementLevel << 24) | fixed.itemId) >>> 0 ===
            tail.suffix.repeatedRowKey,
    );

/** Complete row layout exercised by 3 build-2954 rows. */
const ItemEnchantRowStandardPrefix164Middle52PreText8PostText12Suffix15 =
    struct({
        /** Complete physical row-layout discriminator. */
        layout: literal(
            "standard/short/extra-word/extra-double-word/expanded-12/standard-15",
        ),
        /** Fixed 212-byte item and trade prefix. */
        fixed: ItemEnchantFixed,
        /** Pre-name counted-list layout. */
        preName: ItemEnchantPreNameStandard,
        /** Names, icon path, expressions, and market limit. */
        texts: ItemEnchantTexts,
        /** Fixed-width post-market prefix. */
        postMarketPrefix: ItemEnchantPostMarketPrefix164,
        /** Three counted post-market lists and their fixed separators. */
        postMarketLists: ItemEnchantPostMarketLists,
        /** Intrinsically framed late-tail layout. */
        tail: ItemEnchantTailMiddle52PreText8PostText12Suffix15,
    }).check(
        ({ fixed, tail }) =>
            ((fixed.enhancementLevel << 24) | fixed.itemId) >>> 0 ===
            tail.suffix.repeatedRowKey,
    );

/** Complete row layout exercised by 1 build-2954 rows. */
const ItemEnchantRowStandardPrefix164Middle52PreText12PostTextDirectSuffix15 =
    struct({
        /** Complete physical row-layout discriminator. */
        layout: literal(
            "standard/short/extra-word/extra-three-word/direct/standard-15",
        ),
        /** Fixed 212-byte item and trade prefix. */
        fixed: ItemEnchantFixed,
        /** Pre-name counted-list layout. */
        preName: ItemEnchantPreNameStandard,
        /** Names, icon path, expressions, and market limit. */
        texts: ItemEnchantTexts,
        /** Fixed-width post-market prefix. */
        postMarketPrefix: ItemEnchantPostMarketPrefix164,
        /** Three counted post-market lists and their fixed separators. */
        postMarketLists: ItemEnchantPostMarketLists,
        /** Intrinsically framed late-tail layout. */
        tail: ItemEnchantTailMiddle52PreText12PostTextDirectSuffix15,
    }).check(
        ({ fixed, tail }) =>
            ((fixed.enhancementLevel << 24) | fixed.itemId) >>> 0 ===
            tail.suffix.repeatedRowKey,
    );

/** Complete row layout exercised by 8 build-2954 rows. */
const ItemEnchantRowStandardPrefix164Middle36PreTextDirectPostTextDirectSuffix15 =
    struct({
        /** Complete physical row-layout discriminator. */
        layout: literal(
            "standard/short/short-three-word/direct/direct/standard-15",
        ),
        /** Fixed 212-byte item and trade prefix. */
        fixed: ItemEnchantFixed,
        /** Pre-name counted-list layout. */
        preName: ItemEnchantPreNameStandard,
        /** Names, icon path, expressions, and market limit. */
        texts: ItemEnchantTexts,
        /** Fixed-width post-market prefix. */
        postMarketPrefix: ItemEnchantPostMarketPrefix164,
        /** Three counted post-market lists and their fixed separators. */
        postMarketLists: ItemEnchantPostMarketLists,
        /** Intrinsically framed late-tail layout. */
        tail: ItemEnchantTailMiddle36PreTextDirectPostTextDirectSuffix15,
    }).check(
        ({ fixed, tail }) =>
            ((fixed.enhancementLevel << 24) | fixed.itemId) >>> 0 ===
            tail.suffix.repeatedRowKey,
    );

/** Complete row layout exercised by 36 build-2954 rows. */
const ItemEnchantRowStandardPrefix164Middle88PreTextDirectPostTextDirectSuffix15 =
    struct({
        /** Complete physical row-layout discriminator. */
        layout: literal(
            "standard/short/extra-ten-word/direct/direct/standard-15",
        ),
        /** Fixed 212-byte item and trade prefix. */
        fixed: ItemEnchantFixed,
        /** Pre-name counted-list layout. */
        preName: ItemEnchantPreNameStandard,
        /** Names, icon path, expressions, and market limit. */
        texts: ItemEnchantTexts,
        /** Fixed-width post-market prefix. */
        postMarketPrefix: ItemEnchantPostMarketPrefix164,
        /** Three counted post-market lists and their fixed separators. */
        postMarketLists: ItemEnchantPostMarketLists,
        /** Intrinsically framed late-tail layout. */
        tail: ItemEnchantTailMiddle88PreTextDirectPostTextDirectSuffix15,
    }).check(
        ({ fixed, tail }) =>
            ((fixed.enhancementLevel << 24) | fixed.itemId) >>> 0 ===
            tail.suffix.repeatedRowKey,
    );

/** Complete row layout exercised by 1 build-2954 rows. */
const ItemEnchantRowStandardPrefix164Middle88PreText8PostTextDirectSuffix15 =
    struct({
        /** Complete physical row-layout discriminator. */
        layout: literal(
            "standard/short/extra-ten-word/extra-double-word/direct/standard-15",
        ),
        /** Fixed 212-byte item and trade prefix. */
        fixed: ItemEnchantFixed,
        /** Pre-name counted-list layout. */
        preName: ItemEnchantPreNameStandard,
        /** Names, icon path, expressions, and market limit. */
        texts: ItemEnchantTexts,
        /** Fixed-width post-market prefix. */
        postMarketPrefix: ItemEnchantPostMarketPrefix164,
        /** Three counted post-market lists and their fixed separators. */
        postMarketLists: ItemEnchantPostMarketLists,
        /** Intrinsically framed late-tail layout. */
        tail: ItemEnchantTailMiddle88PreText8PostTextDirectSuffix15,
    }).check(
        ({ fixed, tail }) =>
            ((fixed.enhancementLevel << 24) | fixed.itemId) >>> 0 ===
            tail.suffix.repeatedRowKey,
    );

/** Complete row layout exercised by 1 build-2954 rows. */
const ItemEnchantRowStandardPrefix164Middle116PreText28PostTextDirectSuffix15 =
    struct({
        /** Complete physical row-layout discriminator. */
        layout: literal(
            "standard/short/wide-116/extra-seven-word/direct/standard-15",
        ),
        /** Fixed 212-byte item and trade prefix. */
        fixed: ItemEnchantFixed,
        /** Pre-name counted-list layout. */
        preName: ItemEnchantPreNameStandard,
        /** Names, icon path, expressions, and market limit. */
        texts: ItemEnchantTexts,
        /** Fixed-width post-market prefix. */
        postMarketPrefix: ItemEnchantPostMarketPrefix164,
        /** Three counted post-market lists and their fixed separators. */
        postMarketLists: ItemEnchantPostMarketLists,
        /** Intrinsically framed late-tail layout. */
        tail: ItemEnchantTailMiddle116PreText28PostTextDirectSuffix15,
    }).check(
        ({ fixed, tail }) =>
            ((fixed.enhancementLevel << 24) | fixed.itemId) >>> 0 ===
            tail.suffix.repeatedRowKey,
    );

/** Complete row layout exercised by 2 build-2954 rows. */
const ItemEnchantRowStandardPrefix164Middle52PreTextDirectPostTextDirectSuffix17 =
    struct({
        /** Complete physical row-layout discriminator. */
        layout: literal(
            "standard/short/extra-word/direct/direct/extra-half-word",
        ),
        /** Fixed 212-byte item and trade prefix. */
        fixed: ItemEnchantFixed,
        /** Pre-name counted-list layout. */
        preName: ItemEnchantPreNameStandard,
        /** Names, icon path, expressions, and market limit. */
        texts: ItemEnchantTexts,
        /** Fixed-width post-market prefix. */
        postMarketPrefix: ItemEnchantPostMarketPrefix164,
        /** Three counted post-market lists and their fixed separators. */
        postMarketLists: ItemEnchantPostMarketLists,
        /** Intrinsically framed late-tail layout. */
        tail: ItemEnchantTailMiddle52PreTextDirectPostTextDirectSuffix17,
    }).check(
        ({ fixed, tail }) =>
            ((fixed.enhancementLevel << 24) | fixed.itemId) >>> 0 ===
            tail.suffix.repeatedRowKey,
    );

/** Complete row layout exercised by 28 build-2954 rows. */
const ItemEnchantRowStandardPrefix180Middle48PreText8PostTextDirectSuffix15 =
    struct({
        /** Complete physical row-layout discriminator. */
        layout: literal(
            "standard/long/standard-48/extra-double-word/direct/standard-15",
        ),
        /** Fixed 212-byte item and trade prefix. */
        fixed: ItemEnchantFixed,
        /** Pre-name counted-list layout. */
        preName: ItemEnchantPreNameStandard,
        /** Names, icon path, expressions, and market limit. */
        texts: ItemEnchantTexts,
        /** Fixed-width post-market prefix. */
        postMarketPrefix: ItemEnchantPostMarketPrefix180,
        /** Three counted post-market lists and their fixed separators. */
        postMarketLists: ItemEnchantPostMarketLists,
        /** Intrinsically framed late-tail layout. */
        tail: ItemEnchantTailMiddle48PreText8PostTextDirectSuffix15,
    }).check(
        ({ fixed, tail }) =>
            ((fixed.enhancementLevel << 24) | fixed.itemId) >>> 0 ===
            tail.suffix.repeatedRowKey,
    );

/** Complete row layout exercised by 19 build-2954 rows. */
const ItemEnchantRowStandardPrefix180Middle48PreText12PostTextDirectSuffix15 =
    struct({
        /** Complete physical row-layout discriminator. */
        layout: literal(
            "standard/long/standard-48/extra-three-word/direct/standard-15",
        ),
        /** Fixed 212-byte item and trade prefix. */
        fixed: ItemEnchantFixed,
        /** Pre-name counted-list layout. */
        preName: ItemEnchantPreNameStandard,
        /** Names, icon path, expressions, and market limit. */
        texts: ItemEnchantTexts,
        /** Fixed-width post-market prefix. */
        postMarketPrefix: ItemEnchantPostMarketPrefix180,
        /** Three counted post-market lists and their fixed separators. */
        postMarketLists: ItemEnchantPostMarketLists,
        /** Intrinsically framed late-tail layout. */
        tail: ItemEnchantTailMiddle48PreText12PostTextDirectSuffix15,
    }).check(
        ({ fixed, tail }) =>
            ((fixed.enhancementLevel << 24) | fixed.itemId) >>> 0 ===
            tail.suffix.repeatedRowKey,
    );

/** Complete row layout exercised by 2 build-2954 rows. */
const ItemEnchantRowStandardPrefix180Middle52PreTextDirectPostTextDirectSuffix15 =
    struct({
        /** Complete physical row-layout discriminator. */
        layout: literal("standard/long/extra-word/direct/direct/standard-15"),
        /** Fixed 212-byte item and trade prefix. */
        fixed: ItemEnchantFixed,
        /** Pre-name counted-list layout. */
        preName: ItemEnchantPreNameStandard,
        /** Names, icon path, expressions, and market limit. */
        texts: ItemEnchantTexts,
        /** Fixed-width post-market prefix. */
        postMarketPrefix: ItemEnchantPostMarketPrefix180,
        /** Three counted post-market lists and their fixed separators. */
        postMarketLists: ItemEnchantPostMarketLists,
        /** Intrinsically framed late-tail layout. */
        tail: ItemEnchantTailMiddle52PreTextDirectPostTextDirectSuffix15,
    }).check(
        ({ fixed, tail }) =>
            ((fixed.enhancementLevel << 24) | fixed.itemId) >>> 0 ===
            tail.suffix.repeatedRowKey,
    );

/** Complete row layout exercised by 5 build-2954 rows. */
const ItemEnchantRowStandardPrefix180Middle36PreTextDirectPostTextDirectSuffix15 =
    struct({
        /** Complete physical row-layout discriminator. */
        layout: literal(
            "standard/long/short-three-word/direct/direct/standard-15",
        ),
        /** Fixed 212-byte item and trade prefix. */
        fixed: ItemEnchantFixed,
        /** Pre-name counted-list layout. */
        preName: ItemEnchantPreNameStandard,
        /** Names, icon path, expressions, and market limit. */
        texts: ItemEnchantTexts,
        /** Fixed-width post-market prefix. */
        postMarketPrefix: ItemEnchantPostMarketPrefix180,
        /** Three counted post-market lists and their fixed separators. */
        postMarketLists: ItemEnchantPostMarketLists,
        /** Intrinsically framed late-tail layout. */
        tail: ItemEnchantTailMiddle36PreTextDirectPostTextDirectSuffix15,
    }).check(
        ({ fixed, tail }) =>
            ((fixed.enhancementLevel << 24) | fixed.itemId) >>> 0 ===
            tail.suffix.repeatedRowKey,
    );

/** Complete row layout exercised by 15 build-2954 rows. */
const ItemEnchantRowStandardPrefix140Middle48PreText8PostTextDirectSuffix15 =
    struct({
        /** Complete physical row-layout discriminator. */
        layout: literal(
            "standard/shortest/standard-48/extra-double-word/direct/standard-15",
        ),
        /** Fixed 212-byte item and trade prefix. */
        fixed: ItemEnchantFixed,
        /** Pre-name counted-list layout. */
        preName: ItemEnchantPreNameStandard,
        /** Names, icon path, expressions, and market limit. */
        texts: ItemEnchantTexts,
        /** Fixed-width post-market prefix. */
        postMarketPrefix: ItemEnchantPostMarketPrefix140,
        /** Three counted post-market lists and their fixed separators. */
        postMarketLists: ItemEnchantPostMarketLists,
        /** Intrinsically framed late-tail layout. */
        tail: ItemEnchantTailMiddle48PreText8PostTextDirectSuffix15,
    }).check(
        ({ fixed, tail }) =>
            ((fixed.enhancementLevel << 24) | fixed.itemId) >>> 0 ===
            tail.suffix.repeatedRowKey,
    );

/** Complete row layout exercised by 2 build-2954 rows. */
const ItemEnchantRowStandardPrefix140Middle48PreText28PostTextDirectSuffix15 =
    struct({
        /** Complete physical row-layout discriminator. */
        layout: literal(
            "standard/shortest/standard-48/extra-seven-word/direct/standard-15",
        ),
        /** Fixed 212-byte item and trade prefix. */
        fixed: ItemEnchantFixed,
        /** Pre-name counted-list layout. */
        preName: ItemEnchantPreNameStandard,
        /** Names, icon path, expressions, and market limit. */
        texts: ItemEnchantTexts,
        /** Fixed-width post-market prefix. */
        postMarketPrefix: ItemEnchantPostMarketPrefix140,
        /** Three counted post-market lists and their fixed separators. */
        postMarketLists: ItemEnchantPostMarketLists,
        /** Intrinsically framed late-tail layout. */
        tail: ItemEnchantTailMiddle48PreText28PostTextDirectSuffix15,
    }).check(
        ({ fixed, tail }) =>
            ((fixed.enhancementLevel << 24) | fixed.itemId) >>> 0 ===
            tail.suffix.repeatedRowKey,
    );

/** Complete row layout exercised by 1,041 build-2954 rows. */
const ItemEnchantRowStandardPrefix140Middle52PreTextDirectPostTextDirectSuffix15 =
    struct({
        /** Complete physical row-layout discriminator. */
        layout: literal(
            "standard/shortest/extra-word/direct/direct/standard-15",
        ),
        /** Fixed 212-byte item and trade prefix. */
        fixed: ItemEnchantFixed,
        /** Pre-name counted-list layout. */
        preName: ItemEnchantPreNameStandard,
        /** Names, icon path, expressions, and market limit. */
        texts: ItemEnchantTexts,
        /** Fixed-width post-market prefix. */
        postMarketPrefix: ItemEnchantPostMarketPrefix140,
        /** Three counted post-market lists and their fixed separators. */
        postMarketLists: ItemEnchantPostMarketLists,
        /** Intrinsically framed late-tail layout. */
        tail: ItemEnchantTailMiddle52PreTextDirectPostTextDirectSuffix15,
    }).check(
        ({ fixed, tail }) =>
            ((fixed.enhancementLevel << 24) | fixed.itemId) >>> 0 ===
            tail.suffix.repeatedRowKey,
    );

/** Complete row layout exercised by 4 build-2954 rows. */
const ItemEnchantRowStandardPrefix140Middle52PreText4PostTextDirectSuffix15 =
    struct({
        /** Complete physical row-layout discriminator. */
        layout: literal(
            "standard/shortest/extra-word/extra-word/direct/standard-15",
        ),
        /** Fixed 212-byte item and trade prefix. */
        fixed: ItemEnchantFixed,
        /** Pre-name counted-list layout. */
        preName: ItemEnchantPreNameStandard,
        /** Names, icon path, expressions, and market limit. */
        texts: ItemEnchantTexts,
        /** Fixed-width post-market prefix. */
        postMarketPrefix: ItemEnchantPostMarketPrefix140,
        /** Three counted post-market lists and their fixed separators. */
        postMarketLists: ItemEnchantPostMarketLists,
        /** Intrinsically framed late-tail layout. */
        tail: ItemEnchantTailMiddle52PreText4PostTextDirectSuffix15,
    }).check(
        ({ fixed, tail }) =>
            ((fixed.enhancementLevel << 24) | fixed.itemId) >>> 0 ===
            tail.suffix.repeatedRowKey,
    );

/** Complete row layout exercised by 4 build-2954 rows. */
const ItemEnchantRowStandardPrefix140Middle52PreText8PostText12Suffix15 =
    struct({
        /** Complete physical row-layout discriminator. */
        layout: literal(
            "standard/shortest/extra-word/extra-double-word/expanded-12/standard-15",
        ),
        /** Fixed 212-byte item and trade prefix. */
        fixed: ItemEnchantFixed,
        /** Pre-name counted-list layout. */
        preName: ItemEnchantPreNameStandard,
        /** Names, icon path, expressions, and market limit. */
        texts: ItemEnchantTexts,
        /** Fixed-width post-market prefix. */
        postMarketPrefix: ItemEnchantPostMarketPrefix140,
        /** Three counted post-market lists and their fixed separators. */
        postMarketLists: ItemEnchantPostMarketLists,
        /** Intrinsically framed late-tail layout. */
        tail: ItemEnchantTailMiddle52PreText8PostText12Suffix15,
    }).check(
        ({ fixed, tail }) =>
            ((fixed.enhancementLevel << 24) | fixed.itemId) >>> 0 ===
            tail.suffix.repeatedRowKey,
    );

/** Complete row layout exercised by 30 build-2954 rows. */
const ItemEnchantRowStandardPrefix116Middle116PreTextDirectPostTextDirectSuffix15 =
    struct({
        /** Complete physical row-layout discriminator. */
        layout: literal("standard/minimal/wide-116/direct/direct/standard-15"),
        /** Fixed 212-byte item and trade prefix. */
        fixed: ItemEnchantFixed,
        /** Pre-name counted-list layout. */
        preName: ItemEnchantPreNameStandard,
        /** Names, icon path, expressions, and market limit. */
        texts: ItemEnchantTexts,
        /** Fixed-width post-market prefix. */
        postMarketPrefix: ItemEnchantPostMarketPrefix116,
        /** Three counted post-market lists and their fixed separators. */
        postMarketLists: ItemEnchantPostMarketLists,
        /** Intrinsically framed late-tail layout. */
        tail: ItemEnchantTailMiddle116PreTextDirectPostTextDirectSuffix15,
    }).check(
        ({ fixed, tail }) =>
            ((fixed.enhancementLevel << 24) | fixed.itemId) >>> 0 ===
            tail.suffix.repeatedRowKey,
    );

/** Complete row layout exercised by 14 build-2954 rows. */
const ItemEnchantRowStandardPrefix125Middle123PreText4PostTextDirectSuffix15 =
    struct({
        /** Complete physical row-layout discriminator. */
        layout: literal(
            "standard/compact-125/wide-123/extra-word/direct/standard-15",
        ),
        /** Fixed 212-byte item and trade prefix. */
        fixed: ItemEnchantFixed,
        /** Pre-name counted-list layout. */
        preName: ItemEnchantPreNameStandard,
        /** Names, icon path, expressions, and market limit. */
        texts: ItemEnchantTexts,
        /** Fixed-width post-market prefix. */
        postMarketPrefix: ItemEnchantPostMarketPrefix125,
        /** Three counted post-market lists and their fixed separators. */
        postMarketLists: ItemEnchantPostMarketLists,
        /** Intrinsically framed late-tail layout. */
        tail: ItemEnchantTailMiddle123PreText4PostTextDirectSuffix15,
    }).check(
        ({ fixed, tail }) =>
            ((fixed.enhancementLevel << 24) | fixed.itemId) >>> 0 ===
            tail.suffix.repeatedRowKey,
    );

/** Complete row layout exercised by 1 build-2954 rows. */
const ItemEnchantRowStandardPrefix125Middle123PreText8PostTextDirectSuffix15 =
    struct({
        /** Complete physical row-layout discriminator. */
        layout: literal(
            "standard/compact-125/wide-123/extra-double-word/direct/standard-15",
        ),
        /** Fixed 212-byte item and trade prefix. */
        fixed: ItemEnchantFixed,
        /** Pre-name counted-list layout. */
        preName: ItemEnchantPreNameStandard,
        /** Names, icon path, expressions, and market limit. */
        texts: ItemEnchantTexts,
        /** Fixed-width post-market prefix. */
        postMarketPrefix: ItemEnchantPostMarketPrefix125,
        /** Three counted post-market lists and their fixed separators. */
        postMarketLists: ItemEnchantPostMarketLists,
        /** Intrinsically framed late-tail layout. */
        tail: ItemEnchantTailMiddle123PreText8PostTextDirectSuffix15,
    }).check(
        ({ fixed, tail }) =>
            ((fixed.enhancementLevel << 24) | fixed.itemId) >>> 0 ===
            tail.suffix.repeatedRowKey,
    );

/** Complete row layout exercised by 443 build-2954 rows. */
const ItemEnchantRowStandardPrefix125Middle123PreTextDirectPostTextDirectSuffix15 =
    struct({
        /** Complete physical row-layout discriminator. */
        layout: literal(
            "standard/compact-125/wide-123/direct/direct/standard-15",
        ),
        /** Fixed 212-byte item and trade prefix. */
        fixed: ItemEnchantFixed,
        /** Pre-name counted-list layout. */
        preName: ItemEnchantPreNameStandard,
        /** Names, icon path, expressions, and market limit. */
        texts: ItemEnchantTexts,
        /** Fixed-width post-market prefix. */
        postMarketPrefix: ItemEnchantPostMarketPrefix125,
        /** Three counted post-market lists and their fixed separators. */
        postMarketLists: ItemEnchantPostMarketLists,
        /** Intrinsically framed late-tail layout. */
        tail: ItemEnchantTailMiddle123PreTextDirectPostTextDirectSuffix15,
    }).check(
        ({ fixed, tail }) =>
            ((fixed.enhancementLevel << 24) | fixed.itemId) >>> 0 ===
            tail.suffix.repeatedRowKey,
    );

/** Complete row layout exercised by 4 build-2954 rows. */
const ItemEnchantRowStandardPrefix126Middle122PreTextDirectPostTextDirectSuffix15 =
    struct({
        /** Complete physical row-layout discriminator. */
        layout: literal(
            "standard/compact-126/wide-122/direct/direct/standard-15",
        ),
        /** Fixed 212-byte item and trade prefix. */
        fixed: ItemEnchantFixed,
        /** Pre-name counted-list layout. */
        preName: ItemEnchantPreNameStandard,
        /** Names, icon path, expressions, and market limit. */
        texts: ItemEnchantTexts,
        /** Fixed-width post-market prefix. */
        postMarketPrefix: ItemEnchantPostMarketPrefix126,
        /** Three counted post-market lists and their fixed separators. */
        postMarketLists: ItemEnchantPostMarketLists,
        /** Intrinsically framed late-tail layout. */
        tail: ItemEnchantTailMiddle122PreTextDirectPostTextDirectSuffix15,
    }).check(
        ({ fixed, tail }) =>
            ((fixed.enhancementLevel << 24) | fixed.itemId) >>> 0 ===
            tail.suffix.repeatedRowKey,
    );

/** Complete row layout exercised by 11 build-2954 rows. */
const ItemEnchantRowStandardPrefix132Middle228PreTextDirectPostTextDirectSuffix15 =
    struct({
        /** Complete physical row-layout discriminator. */
        layout: literal("standard/compact/wide-228/direct/direct/standard-15"),
        /** Fixed 212-byte item and trade prefix. */
        fixed: ItemEnchantFixed,
        /** Pre-name counted-list layout. */
        preName: ItemEnchantPreNameStandard,
        /** Names, icon path, expressions, and market limit. */
        texts: ItemEnchantTexts,
        /** Fixed-width post-market prefix. */
        postMarketPrefix: ItemEnchantPostMarketPrefix132,
        /** Three counted post-market lists and their fixed separators. */
        postMarketLists: ItemEnchantPostMarketLists,
        /** Intrinsically framed late-tail layout. */
        tail: ItemEnchantTailMiddle228PreTextDirectPostTextDirectSuffix15,
    }).check(
        ({ fixed, tail }) =>
            ((fixed.enhancementLevel << 24) | fixed.itemId) >>> 0 ===
            tail.suffix.repeatedRowKey,
    );

/** Complete row layout exercised by 1,263 build-2954 rows. */
const ItemEnchantRowFivePrefix168Middle48PreTextDirectPostTextDirectSuffix15 =
    struct({
        /** Complete physical row-layout discriminator. */
        layout: literal(
            "five/standard-168/standard-48/direct/direct/standard-15",
        ),
        /** Fixed 212-byte item and trade prefix. */
        fixed: ItemEnchantFixed,
        /** Pre-name counted-list layout. */
        preName: ItemEnchantPreNameFive,
        /** Names, icon path, expressions, and market limit. */
        texts: ItemEnchantTexts,
        /** Fixed-width post-market prefix. */
        postMarketPrefix: ItemEnchantPostMarketPrefix168,
        /** Three counted post-market lists and their fixed separators. */
        postMarketLists: ItemEnchantPostMarketLists,
        /** Intrinsically framed late-tail layout. */
        tail: ItemEnchantTailMiddle48PreTextDirectPostTextDirectSuffix15,
    }).check(
        ({ fixed, tail }) =>
            ((fixed.enhancementLevel << 24) | fixed.itemId) >>> 0 ===
            tail.suffix.repeatedRowKey,
    );

/** Complete row layout exercised by 100 build-2954 rows. */
const ItemEnchantRowFivePrefix168Middle48PreText4PostTextDirectSuffix15 =
    struct({
        /** Complete physical row-layout discriminator. */
        layout: literal(
            "five/standard-168/standard-48/extra-word/direct/standard-15",
        ),
        /** Fixed 212-byte item and trade prefix. */
        fixed: ItemEnchantFixed,
        /** Pre-name counted-list layout. */
        preName: ItemEnchantPreNameFive,
        /** Names, icon path, expressions, and market limit. */
        texts: ItemEnchantTexts,
        /** Fixed-width post-market prefix. */
        postMarketPrefix: ItemEnchantPostMarketPrefix168,
        /** Three counted post-market lists and their fixed separators. */
        postMarketLists: ItemEnchantPostMarketLists,
        /** Intrinsically framed late-tail layout. */
        tail: ItemEnchantTailMiddle48PreText4PostTextDirectSuffix15,
    }).check(
        ({ fixed, tail }) =>
            ((fixed.enhancementLevel << 24) | fixed.itemId) >>> 0 ===
            tail.suffix.repeatedRowKey,
    );

/** Complete row layout exercised by 374 build-2954 rows. */
const ItemEnchantRowFivePrefix168Middle48PreText8PostTextDirectSuffix15 =
    struct({
        /** Complete physical row-layout discriminator. */
        layout: literal(
            "five/standard-168/standard-48/extra-double-word/direct/standard-15",
        ),
        /** Fixed 212-byte item and trade prefix. */
        fixed: ItemEnchantFixed,
        /** Pre-name counted-list layout. */
        preName: ItemEnchantPreNameFive,
        /** Names, icon path, expressions, and market limit. */
        texts: ItemEnchantTexts,
        /** Fixed-width post-market prefix. */
        postMarketPrefix: ItemEnchantPostMarketPrefix168,
        /** Three counted post-market lists and their fixed separators. */
        postMarketLists: ItemEnchantPostMarketLists,
        /** Intrinsically framed late-tail layout. */
        tail: ItemEnchantTailMiddle48PreText8PostTextDirectSuffix15,
    }).check(
        ({ fixed, tail }) =>
            ((fixed.enhancementLevel << 24) | fixed.itemId) >>> 0 ===
            tail.suffix.repeatedRowKey,
    );

/** Complete row layout exercised by 132 build-2954 rows. */
const ItemEnchantRowFivePrefix168Middle48PreText12PostTextDirectSuffix15 =
    struct({
        /** Complete physical row-layout discriminator. */
        layout: literal(
            "five/standard-168/standard-48/extra-three-word/direct/standard-15",
        ),
        /** Fixed 212-byte item and trade prefix. */
        fixed: ItemEnchantFixed,
        /** Pre-name counted-list layout. */
        preName: ItemEnchantPreNameFive,
        /** Names, icon path, expressions, and market limit. */
        texts: ItemEnchantTexts,
        /** Fixed-width post-market prefix. */
        postMarketPrefix: ItemEnchantPostMarketPrefix168,
        /** Three counted post-market lists and their fixed separators. */
        postMarketLists: ItemEnchantPostMarketLists,
        /** Intrinsically framed late-tail layout. */
        tail: ItemEnchantTailMiddle48PreText12PostTextDirectSuffix15,
    }).check(
        ({ fixed, tail }) =>
            ((fixed.enhancementLevel << 24) | fixed.itemId) >>> 0 ===
            tail.suffix.repeatedRowKey,
    );

/** Complete row layout exercised by 81 build-2954 rows. */
const ItemEnchantRowByteFivePrefix168Middle48PreTextDirectPostTextDirectSuffix15 =
    struct({
        /** Complete physical row-layout discriminator. */
        layout: literal(
            "byte-five/standard-168/standard-48/direct/direct/standard-15",
        ),
        /** Fixed 212-byte item and trade prefix. */
        fixed: ItemEnchantFixed,
        /** Pre-name counted-list layout. */
        preName: ItemEnchantPreNameByteFive,
        /** Names, icon path, expressions, and market limit. */
        texts: ItemEnchantTexts,
        /** Fixed-width post-market prefix. */
        postMarketPrefix: ItemEnchantPostMarketPrefix168,
        /** Three counted post-market lists and their fixed separators. */
        postMarketLists: ItemEnchantPostMarketLists,
        /** Intrinsically framed late-tail layout. */
        tail: ItemEnchantTailMiddle48PreTextDirectPostTextDirectSuffix15,
    }).check(
        ({ fixed, tail }) =>
            ((fixed.enhancementLevel << 24) | fixed.itemId) >>> 0 ===
            tail.suffix.repeatedRowKey,
    );

/** Complete row layout exercised by 185 build-2954 rows. */
const ItemEnchantRowByteFivePrefix168Middle48PreText4PostTextDirectSuffix15 =
    struct({
        /** Complete physical row-layout discriminator. */
        layout: literal(
            "byte-five/standard-168/standard-48/extra-word/direct/standard-15",
        ),
        /** Fixed 212-byte item and trade prefix. */
        fixed: ItemEnchantFixed,
        /** Pre-name counted-list layout. */
        preName: ItemEnchantPreNameByteFive,
        /** Names, icon path, expressions, and market limit. */
        texts: ItemEnchantTexts,
        /** Fixed-width post-market prefix. */
        postMarketPrefix: ItemEnchantPostMarketPrefix168,
        /** Three counted post-market lists and their fixed separators. */
        postMarketLists: ItemEnchantPostMarketLists,
        /** Intrinsically framed late-tail layout. */
        tail: ItemEnchantTailMiddle48PreText4PostTextDirectSuffix15,
    }).check(
        ({ fixed, tail }) =>
            ((fixed.enhancementLevel << 24) | fixed.itemId) >>> 0 ===
            tail.suffix.repeatedRowKey,
    );

/** Complete row layout exercised by 180 build-2954 rows. */
const ItemEnchantRowByteFivePrefix168Middle48PreText8PostTextDirectSuffix15 =
    struct({
        /** Complete physical row-layout discriminator. */
        layout: literal(
            "byte-five/standard-168/standard-48/extra-double-word/direct/standard-15",
        ),
        /** Fixed 212-byte item and trade prefix. */
        fixed: ItemEnchantFixed,
        /** Pre-name counted-list layout. */
        preName: ItemEnchantPreNameByteFive,
        /** Names, icon path, expressions, and market limit. */
        texts: ItemEnchantTexts,
        /** Fixed-width post-market prefix. */
        postMarketPrefix: ItemEnchantPostMarketPrefix168,
        /** Three counted post-market lists and their fixed separators. */
        postMarketLists: ItemEnchantPostMarketLists,
        /** Intrinsically framed late-tail layout. */
        tail: ItemEnchantTailMiddle48PreText8PostTextDirectSuffix15,
    }).check(
        ({ fixed, tail }) =>
            ((fixed.enhancementLevel << 24) | fixed.itemId) >>> 0 ===
            tail.suffix.repeatedRowKey,
    );

/** Complete row layout exercised by 118 build-2954 rows. */
const ItemEnchantRowByteFivePrefix168Middle48PreText12PostTextDirectSuffix15 =
    struct({
        /** Complete physical row-layout discriminator. */
        layout: literal(
            "byte-five/standard-168/standard-48/extra-three-word/direct/standard-15",
        ),
        /** Fixed 212-byte item and trade prefix. */
        fixed: ItemEnchantFixed,
        /** Pre-name counted-list layout. */
        preName: ItemEnchantPreNameByteFive,
        /** Names, icon path, expressions, and market limit. */
        texts: ItemEnchantTexts,
        /** Fixed-width post-market prefix. */
        postMarketPrefix: ItemEnchantPostMarketPrefix168,
        /** Three counted post-market lists and their fixed separators. */
        postMarketLists: ItemEnchantPostMarketLists,
        /** Intrinsically framed late-tail layout. */
        tail: ItemEnchantTailMiddle48PreText12PostTextDirectSuffix15,
    }).check(
        ({ fixed, tail }) =>
            ((fixed.enhancementLevel << 24) | fixed.itemId) >>> 0 ===
            tail.suffix.repeatedRowKey,
    );

/** Complete row layout exercised by 1 build-2954 rows. */
const ItemEnchantRowWordFivePrefix168Middle48PreTextDirectPostTextDirectSuffix15 =
    struct({
        /** Complete physical row-layout discriminator. */
        layout: literal(
            "word-five/standard-168/standard-48/direct/direct/standard-15",
        ),
        /** Fixed 212-byte item and trade prefix. */
        fixed: ItemEnchantFixed,
        /** Pre-name counted-list layout. */
        preName: ItemEnchantPreNameWordFive,
        /** Names, icon path, expressions, and market limit. */
        texts: ItemEnchantTexts,
        /** Fixed-width post-market prefix. */
        postMarketPrefix: ItemEnchantPostMarketPrefix168,
        /** Three counted post-market lists and their fixed separators. */
        postMarketLists: ItemEnchantPostMarketLists,
        /** Intrinsically framed late-tail layout. */
        tail: ItemEnchantTailMiddle48PreTextDirectPostTextDirectSuffix15,
    }).check(
        ({ fixed, tail }) =>
            ((fixed.enhancementLevel << 24) | fixed.itemId) >>> 0 ===
            tail.suffix.repeatedRowKey,
    );

/**
 * All 78 complete row variations exercised by build 2954.
 *
 * Each branch owns the full row so its repeated-key check participates in union
 * backtracking. The companion offset table is not a runtime dependency.
 */
export const ItemEnchantRow = union(
    ItemEnchantRowStandardPrefix168Middle48PreTextDirectPostTextDirectSuffix15,
    ItemEnchantRowStandardPrefix168Middle48PreText4PostTextDirectSuffix15,
    ItemEnchantRowStandardPrefix168Middle48PreText8PostTextDirectSuffix15,
    ItemEnchantRowStandardPrefix168Middle48PreText12PostTextDirectSuffix15,
    ItemEnchantRowStandardPrefix168Middle48PreText16PostTextDirectSuffix15,
    ItemEnchantRowStandardPrefix168Middle48PreText20PostTextDirectSuffix15,
    ItemEnchantRowStandardPrefix168Middle48PreText24PostTextDirectSuffix15,
    ItemEnchantRowStandardPrefix168Middle48PreText28PostTextDirectSuffix15,
    ItemEnchantRowStandardPrefix168Middle52PreTextDirectPostTextDirectSuffix15,
    ItemEnchantRowStandardPrefix168Middle52PreText4PostTextDirectSuffix15,
    ItemEnchantRowStandardPrefix168Middle52PreText8PostTextDirectSuffix15,
    ItemEnchantRowStandardPrefix168Middle52PreText8PostText12Suffix15,
    ItemEnchantRowStandardPrefix168Middle52PreText12PostTextDirectSuffix15,
    ItemEnchantRowStandardPrefix168Middle88PreTextDirectPostTextDirectSuffix15,
    ItemEnchantRowStandardPrefix168Middle88PreText4PostTextDirectSuffix15,
    ItemEnchantRowStandardPrefix168Middle88PreText8PostTextDirectSuffix15,
    ItemEnchantRowStandardPrefix168Middle88PreText16PostTextDirectSuffix15,
    ItemEnchantRowStandardPrefix168Middle64PreTextDirectPostTextDirectSuffix15,
    ItemEnchantRowStandardPrefix168Middle280PreTextDirectPostTextDirectSuffix15,
    ItemEnchantRowStandardPrefix168Middle104PreText4PostTextDirectSuffix15,
    ItemEnchantRowStandardPrefix168Middle116PreTextDirectPostTextDirectSuffix15,
    ItemEnchantRowStandardPrefix168Middle76PreTextDirectPostTextDirectSuffix15,
    ItemEnchantRowStandardPrefix168Middle76PreText4PostTextDirectSuffix15,
    ItemEnchantRowStandardPrefix168Middle104PreTextDirectPostTextDirectSuffix15,
    ItemEnchantRowStandardPrefix168Middle108PreTextDirectPostTextDirectSuffix15,
    ItemEnchantRowStandardPrefix168Middle50PreText12PostTextDirectSuffix17,
    ItemEnchantRowStandardPrefix168Middle50PreText4PostTextDirectSuffix17,
    ItemEnchantRowStandardPrefix168Middle50PreText8PostTextDirectSuffix17,
    ItemEnchantRowStandardPrefix168Middle50PreText20PostTextDirectSuffix17,
    ItemEnchantRowStandardPrefix168Middle50PreText24PostTextDirectSuffix17,
    ItemEnchantRowStandardPrefix168Middle50PreText16PostTextDirectSuffix17,
    ItemEnchantRowStandardPrefix168Middle48PreText4PostTextDirectSuffix17,
    ItemEnchantRowStandardPrefix168Middle48PreTextDirectPostTextDirectSuffix17,
    ItemEnchantRowStandardPrefix168Middle48PreText8PostTextDirectSuffix17,
    ItemEnchantRowStandardPrefix168Middle48PreText12PostTextDirectSuffix17,
    ItemEnchantRowStandardPrefix168Middle48PreText16PostTextDirectSuffix17,
    ItemEnchantRowStandardPrefix168Middle48PreText4PostTextDirectSuffixCountedU16,
    ItemEnchantRowStandardPrefix168Middle48PreTextDirectPostTextDirectSuffixCountedU16,
    ItemEnchantRowStandardPrefix164Middle48PreText8PostTextDirectSuffix15,
    ItemEnchantRowStandardPrefix164Middle48PreText12PostTextDirectSuffix15,
    ItemEnchantRowStandardPrefix164Middle48PreText16PostTextDirectSuffix15,
    ItemEnchantRowStandardPrefix164Middle48PreText20PostTextDirectSuffix15,
    ItemEnchantRowStandardPrefix164Middle48PreText24PostTextDirectSuffix15,
    ItemEnchantRowStandardPrefix164Middle48PreText28PostTextDirectSuffix15,
    ItemEnchantRowStandardPrefix164Middle52PreTextDirectPostTextDirectSuffix15,
    ItemEnchantRowStandardPrefix164Middle52PreText4PostTextDirectSuffix15,
    ItemEnchantRowStandardPrefix164Middle52PreText8PostTextDirectSuffix15,
    ItemEnchantRowStandardPrefix164Middle52PreText8PostText12Suffix15,
    ItemEnchantRowStandardPrefix164Middle52PreText12PostTextDirectSuffix15,
    ItemEnchantRowStandardPrefix164Middle36PreTextDirectPostTextDirectSuffix15,
    ItemEnchantRowStandardPrefix164Middle88PreTextDirectPostTextDirectSuffix15,
    ItemEnchantRowStandardPrefix164Middle88PreText8PostTextDirectSuffix15,
    ItemEnchantRowStandardPrefix164Middle116PreText28PostTextDirectSuffix15,
    ItemEnchantRowStandardPrefix164Middle52PreTextDirectPostTextDirectSuffix17,
    ItemEnchantRowStandardPrefix180Middle48PreText8PostTextDirectSuffix15,
    ItemEnchantRowStandardPrefix180Middle48PreText12PostTextDirectSuffix15,
    ItemEnchantRowStandardPrefix180Middle52PreTextDirectPostTextDirectSuffix15,
    ItemEnchantRowStandardPrefix180Middle36PreTextDirectPostTextDirectSuffix15,
    ItemEnchantRowStandardPrefix140Middle48PreText8PostTextDirectSuffix15,
    ItemEnchantRowStandardPrefix140Middle48PreText28PostTextDirectSuffix15,
    ItemEnchantRowStandardPrefix140Middle52PreTextDirectPostTextDirectSuffix15,
    ItemEnchantRowStandardPrefix140Middle52PreText4PostTextDirectSuffix15,
    ItemEnchantRowStandardPrefix140Middle52PreText8PostText12Suffix15,
    ItemEnchantRowStandardPrefix116Middle116PreTextDirectPostTextDirectSuffix15,
    ItemEnchantRowStandardPrefix125Middle123PreText4PostTextDirectSuffix15,
    ItemEnchantRowStandardPrefix125Middle123PreText8PostTextDirectSuffix15,
    ItemEnchantRowStandardPrefix125Middle123PreTextDirectPostTextDirectSuffix15,
    ItemEnchantRowStandardPrefix126Middle122PreTextDirectPostTextDirectSuffix15,
    ItemEnchantRowStandardPrefix132Middle228PreTextDirectPostTextDirectSuffix15,
    ItemEnchantRowFivePrefix168Middle48PreTextDirectPostTextDirectSuffix15,
    ItemEnchantRowFivePrefix168Middle48PreText4PostTextDirectSuffix15,
    ItemEnchantRowFivePrefix168Middle48PreText8PostTextDirectSuffix15,
    ItemEnchantRowFivePrefix168Middle48PreText12PostTextDirectSuffix15,
    ItemEnchantRowByteFivePrefix168Middle48PreTextDirectPostTextDirectSuffix15,
    ItemEnchantRowByteFivePrefix168Middle48PreText4PostTextDirectSuffix15,
    ItemEnchantRowByteFivePrefix168Middle48PreText8PostTextDirectSuffix15,
    ItemEnchantRowByteFivePrefix168Middle48PreText12PostTextDirectSuffix15,
    ItemEnchantRowWordFivePrefix168Middle48PreTextDirectPostTextDirectSuffix15,
);

/** Count-framed item-enchant rows with fully intrinsic branch selection. */
export const ItemEnchantDbss = table({
    path: "gamecommondata/binary/itemenchant.dbss",
    rows: {
        ItemEnchantRow: {
            schema: ItemEnchantRow,
        },
    },
});

if (import.meta.main) {
    await ItemEnchantDbss.decodeIntoDisk();
}
