import {
    array,
    bytes,
    i32,
    literal,
    struct,
    u16,
    u24,
    u32,
    u64,
    u8,
    union,
} from "@marceloclp/bsd";

import { bss } from "./common/helpers";

/** Exact unsigned 64-bit value retained losslessly in JSON-compatible form. */
const DecimalU64 = u64().transform((value) => value.toString());

/** One item-and-quantity input used by a worker or workshop recipe. */
const ItemExchangeSourceMaterial = struct({
    /** Low 24 bits of the packed input item and enhancement key. */
    itemId: u24(),
    /** High byte of the packed input item and enhancement key. */
    enhancementLevel: u8(),
    /** Exact input quantity retained as a decimal string. */
    quantity: DecimalU64,
}).fixedLength(12);

/** Fields preceding the material list in an ordinary recipe row. */
const ItemExchangeSourceOrdinaryPrefix = {
    /** Ordinary physical-layout label. */
    layout: literal("ordinary"),
    /** Stable worker or workshop production recipe identifier. */
    recipeId: u32(),
    /** Required physical repetition of `recipeId`. */
    repeatedRecipeId: u32(),
    /** Uninterpreted one-byte separator after the repeated identity. */
    reserved08: bytes(1).reserved(),
    /** Numeric exchange family. */
    exchangeTypeCode: u8(),
    /** Retired recipe-control region before the material count. */
    reserved10: bytes(36).reserved(),
    /** Ordered production inputs. */
    materials: array(u32(), ItemExchangeSourceMaterial),
};

/** Fields preceding the material list in a content-option-selected row. */
const ItemExchangeSourceContentOptionPrefix = {
    /** Content-option-selected extended physical-layout label. */
    layout: literal("content-option"),
    /** First intrinsic extended-layout marker. */
    reservedMarker00: u32().is(256),
    /** Repeated intrinsic extended-layout marker. */
    reservedMarker04: u32().is(256),
    /** Uninterpreted one-byte separator after the layout markers. */
    reserved08: bytes(1).reserved(),
    /** Numeric exchange family. */
    exchangeTypeCode: u8(),
    /** Uninterpreted alignment region before the selector hash. */
    reserved10: bytes(3).reserved(),
    /** Content option selecting this otherwise-hidden recipe. */
    selectorContentOptionHash: u32(),
    /** Uninterpreted alignment region before the real recipe key. */
    reserved17: bytes(4).reserved(),
    /** Stable worker or workshop production recipe identifier. */
    recipeId: u32(),
    /** Required physical repetition of `recipeId`. */
    repeatedRecipeId: u32(),
    /** Uninterpreted one-byte separator after the repeated identity. */
    reserved29: bytes(1).reserved(),
    /** Product-data family repeated by the common recipe body. */
    outerProductDataTypeCode: u8(),
    /** Retired extended-layout controls. */
    reserved31: bytes(15).reserved(),
    /** Empty ordinary material-list placeholder. */
    reserved46: bytes(4).reserved(),
    /** Alignment and retired controls before the real material list. */
    reserved50: bytes(17).reserved(),
    /** Ordered production inputs. */
    materials: array(u32(), ItemExchangeSourceMaterial),
};

/** Fields shared after the material list by all recipe row layouts. */
const ItemExchangeSourceCommonBody = {
    /** Low 24 bits of the packed key repeated from the first material. */
    keyMaterialItemId: u24(),
    /** High byte of the packed key repeated from the first material. */
    keyMaterialEnhancementLevel: u8(),
    /** Material quantity repeated from the first material, or zero when empty. */
    keyMaterialQuantity: DecimalU64,
    /** Product-data family controlling recipe execution. */
    productDataTypeCode: u8(),
    /** Retired requirement and reward controls. */
    reservedAfterProductDataType: bytes(12).reserved(),
    /** Base worker workload in milliseconds. */
    productionWorkloadMilliseconds: DecimalU64,
    /** Retired crafting-zone selector. */
    reservedCraftingZone: bytes(2).reserved(),
    /** Drop group producing the normal result. */
    resultDropGroupId: u32(),
    /** Drop group producing a worker's lucky result. */
    luckyResultDropGroupId: u32(),
    /** Guild-house craft-object character key, or zero when absent. */
    guildHouseCharacterKey: u16(),
    /** One-based shared-pool slot for the result icon path. */
    resultIconPoolIndex: u32(),
    /** One-based shared-pool slot for the display name. */
    namePoolIndex: u32(),
    /** One-based shared-pool slot for the description. */
    descriptionPoolIndex: u32(),
    /** Retired visibility, requirement, and presentation controls. */
    reservedBeforeWorkAnimation: bytes(60).reserved(),
    /** Worker animation family used while performing this recipe. */
    workAnimationTypeCode: u8(),
};

/** Fields completing a fully populated recipe row. */
const ItemExchangeSourceFullSuffix = {
    /** Endurance cost; current rows use `-1` when disabled. */
    enduranceCost: i32(),
    /** Serialized state slots for repeat-group recipes. */
    repeatGroupStateSlots: array(u32(), u16()),
    /** Initial repeat-work index. */
    firstWorkingIndex: u16(),
    /** Group whose workshop recipes share repeat-work state. */
    repeatGroupKey: u16(),
    /** Maximum starts per day; zero means no daily limit. */
    dailyWorkingCount: u32(),
    /** Retired single content-group gate. */
    legacyContentsGroupKey: i32(),
    /** Modern content-option gates. */
    contentOptionHashes: array(u32(), u32()),
    /** Uninterpreted four-byte full-row terminator. */
    reservedTerminator: bytes(4).reserved(),
};

/** Tests the repeated packed material key without changing its representation. */
function hasMatchingMaterialKey(row: {
    materials: Array<{
        itemId: number;
        enhancementLevel: number;
        quantity: string;
    }>;
    keyMaterialItemId: number;
    keyMaterialEnhancementLevel: number;
    keyMaterialQuantity: string;
}) {
    const first = row.materials[0];
    return first
        ? row.keyMaterialItemId === first.itemId &&
              row.keyMaterialEnhancementLevel === first.enhancementLevel &&
              row.keyMaterialQuantity === first.quantity
        : row.keyMaterialItemId === 0 &&
              row.keyMaterialEnhancementLevel === 0 &&
              row.keyMaterialQuantity === "0";
}

/** Fully populated ordinary worker or workshop production recipe. */
const ItemExchangeSourceOrdinaryRow = struct({
    ...ItemExchangeSourceOrdinaryPrefix,
    ...ItemExchangeSourceCommonBody,
    ...ItemExchangeSourceFullSuffix,
})
    .check((row) => row.recipeId === row.repeatedRecipeId)
    .check(hasMatchingMaterialKey);

/**
 * Two retired serializer rows ending before repeat and content controls.
 *
 * Their stable recipe identities and branch-local execution controls
 * intrinsically select this otherwise prefix-compatible short layout.
 */
const ItemExchangeSourceRetiredShortRow = struct({
    ...ItemExchangeSourceOrdinaryPrefix,
    layout: literal("retired-short"),
    ...ItemExchangeSourceCommonBody,
    /** Endurance cost; both retained rows use the disabled sentinel. */
    enduranceCost: i32(),
    /** Empty repeat count followed by three legacy terminator bytes. */
    reservedAfterEndurance: bytes(7).reserved(),
})
    .check(
        (row) =>
            (row.recipeId === 7901 || row.recipeId === 7927) &&
            row.recipeId === row.repeatedRecipeId &&
            row.productDataTypeCode === 8 &&
            (row.workAnimationTypeCode === 6 ||
                row.workAnimationTypeCode === 8),
    )
    .check(hasMatchingMaterialKey);

/** Content-option-selected recipe with its extended prefix retained. */
const ItemExchangeSourceContentOptionRow = struct({
    ...ItemExchangeSourceContentOptionPrefix,
    ...ItemExchangeSourceCommonBody,
    ...ItemExchangeSourceFullSuffix,
})
    .check(
        (row) =>
            row.recipeId === row.repeatedRecipeId &&
            row.outerProductDataTypeCode === row.productDataTypeCode,
    )
    .check(hasMatchingMaterialKey);

/**
 * Intrinsically selected recipe-row layouts.
 *
 * The strongest `256`-marker profile is tried first, followed by the two
 * key-qualified retired short rows and the ordinary full-row profile.
 */
const ItemExchangeSourceRow = union(
    ItemExchangeSourceContentOptionRow,
    ItemExchangeSourceRetiredShortRow,
    ItemExchangeSourceOrdinaryRow,
);

/** One shared-pool string with its physical encoding tag retained. */
const ItemExchangeSourcePoolEntry = u8()
    .peek()
    .pipe((encodingCode) =>
        struct({
            /** `0` selects ASCII and `1` selects UTF-16LE. */
            encodingCode: u8().in([0, 1]),
            /** Icon path, Korean display name, or Korean description. */
            value:
                encodingCode === 0
                    ? bytes(u32()).ascii()
                    : bytes(
                          u32().check((byteLength) => byteLength % 2 === 0),
                      ).utf16(),
        }),
    );

/** Shared icon, display-name, and description string pool. */
const ItemExchangeSourceTrailer = u32()
    .gte(1)
    .peek()
    .pipe((slotCount) =>
        struct({
            /** Total slots including the implicit empty slot zero. */
            slotCount: u32(),
            /** Uninterpreted five-byte trailer-header region. */
            reserved04: bytes(5).reserved(),
            /** Physical records for one-based slots `1..slotCount-1`. */
            entries: array(slotCount - 1, ItemExchangeSourcePoolEntry),
        }),
    );

/** Informational footer following the shared recipe string pool. */
const ItemExchangeSourceFooter = struct({
    /** Absolute byte offset of the shared string-pool trailer. */
    trailerOffset: u32(),
    /** Uninterpreted four-byte file trailer. */
    reserved04: bytes(4).reserved(),
}).fixedLength(8);

/** Complete worker and workshop production-recipe table. */
export const ItemExchangeSourceBss = bss("itemexchangesource.bss")({
    /** Recipes retained in physical table order. */
    rows: array(u32(), ItemExchangeSourceRow),
    /** Shared icon, name, and description strings. */
    trailer: ItemExchangeSourceTrailer,
    /** Informational trailer pointer and terminal byte range. */
    footer: ItemExchangeSourceFooter,
});

if (import.meta.main) {
    await ItemExchangeSourceBss.load();
}
