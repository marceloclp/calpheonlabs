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
    type BsdInfer,
} from "@marceloclp/bsd";
import { bss } from "./common/helpers";
import { mixedText } from "./common/bsd";

type ItemExchangeSourceMaterial = BsdInfer<typeof ItemExchangeSourceMaterial>;
/** One item-and-quantity input used by a worker or workshop recipe. */
const ItemExchangeSourceMaterial = struct({
    /** Low 24 bits of the packed input item and enhancement key. */
    itemId: u24(),
    /** High byte of the packed input item and enhancement key. */
    enhancementLevel: u8(),
    /** Exact input quantity retained as a decimal string. */
    quantity: u64().transform((v) => v.toString()),
}).fixedLength(12);

/** Tests the repeated packed material key without changing its representation. */
function hasMatchingMaterialKey(row: {
    materials: ItemExchangeSourceMaterial[];
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
    $type: literal("ordinary"),
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
    /** Low 24 bits of the packed key repeated from the first material. */
    keyMaterialItemId: u24(),
    /** High byte of the packed key repeated from the first material. */
    keyMaterialEnhancementLevel: u8(),
    /** Material quantity repeated from the first material, or zero when empty. */
    keyMaterialQuantity: u64().transform((v) => v.toString()),
    /** Product-data family controlling recipe execution. */
    productDataTypeCode: u8(),
    /** Retired requirement and reward controls. */
    reservedAfterProductDataType: bytes(12).reserved(),
    /** Base worker workload in milliseconds. */
    productionWorkloadMilliseconds: u64().transform((v) => v.toString()),
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
})
    .check((row) => row.recipeId === row.repeatedRecipeId)
    .check(hasMatchingMaterialKey);

/**
 * Two retired serializer rows ending before repeat and content controls.
 *
 * Their stable recipe identities and branch-local execution controls
 * intrinsically select this otherwise prefix-compatible short layout.
 */
const ItemExchangeSourceRowRetiredShortType = struct({
    $type: literal("retired-short"),
    /** Stable worker or workshop production recipe identifier. */
    recipeId: u32().in([7901, 7927]),
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
    /** Low 24 bits of the packed key repeated from the first material. */
    keyMaterialItemId: u24(),
    /** High byte of the packed key repeated from the first material. */
    keyMaterialEnhancementLevel: u8(),
    /** Material quantity repeated from the first material, or zero when empty. */
    keyMaterialQuantity: u64().transform((v) => v.toString()),
    /** Product-data family controlling recipe execution. */
    productDataTypeCode: u8(),
    /** Retired requirement and reward controls. */
    reservedAfterProductDataType: bytes(12).reserved(),
    /** Base worker workload in milliseconds. */
    productionWorkloadMilliseconds: u64().transform((v) => v.toString()),
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
    /** Endurance cost; both retained rows use the disabled sentinel. */
    enduranceCost: i32(),
    /** Empty repeat count followed by three legacy terminator bytes. */
    reservedAfterEndurance: bytes(7).reserved(),
})
    .check((row) => row.recipeId === row.repeatedRecipeId)
    .check(
        (row) =>
            row.productDataTypeCode === 8 &&
            (row.workAnimationTypeCode === 6 ||
                row.workAnimationTypeCode === 8),
    )
    .check(hasMatchingMaterialKey);

/** Content-option-selected recipe with its extended prefix retained. */
const ItemExchangeSourceRowContentOptionType = struct({
    $type: literal("content-option"),
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
    /** Low 24 bits of the packed key repeated from the first material. */
    keyMaterialItemId: u24(),
    /** High byte of the packed key repeated from the first material. */
    keyMaterialEnhancementLevel: u8(),
    /** Material quantity repeated from the first material, or zero when empty. */
    keyMaterialQuantity: u64().transform((v) => v.toString()),
    /** Product-data family controlling recipe execution. */
    productDataTypeCode: u8(),
    /** Retired requirement and reward controls. */
    reservedAfterProductDataType: bytes(12).reserved(),
    /** Base worker workload in milliseconds. */
    productionWorkloadMilliseconds: u64().transform((v) => v.toString()),
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
})
    .check((row) => row.recipeId === row.repeatedRecipeId)
    .check((row) => row.outerProductDataTypeCode === row.productDataTypeCode)
    .check(hasMatchingMaterialKey);

/**
 * Intrinsically selected recipe-row layouts.
 *
 * The strongest `256`-marker profile is tried first, followed by the two
 * key-qualified retired short rows and the ordinary full-row profile.
 */
const ItemExchangeSourceRow = union(
    ItemExchangeSourceRowContentOptionType,
    ItemExchangeSourceRowRetiredShortType,
    ItemExchangeSourceOrdinaryRow,
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
    trailer: array(u32().transform((x) => x - 1).pad(5), mixedText()),
    /** Informational trailer pointer and terminal byte range. */
    footer: ItemExchangeSourceFooter,
});

if (import.meta.main) {
    await ItemExchangeSourceBss.decodeIntoDisk();
}
