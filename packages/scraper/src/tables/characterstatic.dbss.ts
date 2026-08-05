import {
    array,
    bool,
    bytes,
    f32,
    i16,
    i32,
    literal,
    struct,
    u16,
    u32,
    u64,
    u8,
    union,
} from "@marceloclp/bsd";
import { asciiText, reserved, utf16Text } from "./common/bsd";
import { dbss } from "./common/helpers";

/**
 * Fixed 276-byte character-definition body before the asset and identity
 * strings.
 */
const CharacterStaticBody = struct({
    /** Client ecology/combat-family identifier. */
    tribeTypeCode: u16(),
    /** Numeric character gameplay family. */
    characterKindCode: u8(),
    /** Client character-grade ordinal. */
    characterGradeTypeCode: u8(),
    /** Stored karma delta units. */
    karmaDeltaUnits: i32(),
    /** Naval Fame delta for ship and sea-monster interactions. */
    navalFameDelta: i32(),
    /** First physical dimension channel. */
    dimensionX: f32(),
    /** Second physical dimension channel. */
    dimensionY: f32(),
    /** Third physical dimension channel. */
    dimensionZ: f32(),
    /** Selects the Aal's Breath fusion-core actor. */
    isFusionCore: bool(),
    /** Unresolved fixed bytes before collection metadata. */
    unknown25: bytes(3),
    /** Optional collection-interaction profile. */
    collectProfileId: u16(),
    /** Base hit-point capacity. */
    hitPoints: f32(),
    /** Base mana/resource capacity. */
    manaPoints: u32(),
    /** Exact unresolved combat/body region before direct attack channels. */
    unknown38: bytes(72),
    /** Stored attack-power channel. */
    attackPower: u32(),
    /** Direct-attack damage channel. */
    directDamage: u32(),
    /** Ranged-attack damage channel. */
    rangedDamage: u32(),
    /** Magic-attack damage channel. */
    magicDamage: u32(),
    /** Direct-attack accuracy/default channel. */
    directAccuracy: u32(),
    /** Ranged-attack accuracy/default channel. */
    rangedAccuracy: u32(),
    /** Magic-attack accuracy/default channel. */
    magicAccuracy: u32(),
    /** Exact unresolved region before presentation and vehicle flags. */
    unknown138: bytes(16),
    /** Suppresses ordinary overhead name-tag rendering. */
    hidesNameTag: bool(),
    /** Exact unresolved bytes before combat/vehicle flags. */
    unknown155: bytes(3),
    /** Enables cannon or ship-artillery combat. */
    usesCannonCombat: bool(),
    /** Marks actors summoned through siege-object installation. */
    summonedBySiegeObject: bool(),
    /** Marks guild/Node/Conquest-War vehicles. */
    guildVehicle: bool(),
    /** Exact unresolved bytes before vehicle classification. */
    unknown161: bytes(2),
    /** Sparse client `VehicleType` ordinal. */
    vehicleTypeCode: u8(),
    /** Engine `TVehicleSubType` ordinal. */
    vehicleSubTypeCode: u8(),
    /** Exact unresolved vehicle region. */
    unknown165: bytes(8),
    /** Number of actor seats defined by the vehicle. */
    vehicleSeatCount: u8(),
    /** Enables runtime actor/vehicle ownership. */
    usesRuntimeOwner: bool(),
    /** Client forced-name-tag visibility ordinal. */
    visibleNameTagTypeCode: u8(),
    /** Unresolved byte before inventory capacity. */
    unknown176: u8(),
    /** Vehicle inventory capacity including engine-reserved slots. */
    inventorySlotCapacity: u8(),
    /** Enables ordinary player dialogue interaction. */
    talkable: bool(),
    /** Unresolved byte before the visible-HP flag. */
    unknown179: u8(),
    /** Enables the NPC-specific visible HP bar. */
    visibleHpBarForNpc: bool(),
    /** Exact unresolved bytes before the client-AI switch. */
    unknown181: bytes(3),
    /** Enables client-side AI control. */
    clientAiControlled: bool(),
    /** Exact unresolved bytes before legacy mount classification. */
    unknown185: bytes(6),
    /** Narrow legacy mount-family ordinal. */
    legacyMountFamilyCode: u8(),
    /** Base character level. */
    level: u8(),
    /** Exact unresolved bytes before hunting classification. */
    unknown193: bytes(3),
    /** Signed legacy hunting-target classification. */
    huntingTargetTypeCode: i32(),
    /** Exact unresolved region before collision dimensions. */
    unknown200: bytes(8),
    /** Collision capsule radius in centimetres. */
    collisionRadiusCentimeters: f32(),
    /** Collision capsule height in centimetres. */
    collisionHeightCentimeters: f32(),
    /** Physical weight in grams. */
    weightGrams: u32(),
    /** Exact unresolved region before spawn scheduling. */
    unknown220: bytes(24),
    /** Historical spawn-condition policy code. */
    spawnConditionCode: u8(),
    /** Inclusive daily spawn-window start, with `0xffff` meaning unscheduled. */
    spawnStartHour: u16(),
    /** Daily spawn-window end, with `0xffff` meaning unscheduled. */
    spawnEndHour: u16(),
    /** Exact unresolved bytes before final policy flags. */
    unknown249: bytes(4),
    /** Suppresses ordinary actor HP-bar rendering. */
    hidesHitPointBar: bool(),
    /** Legacy world/event-boss role code. */
    worldBossRoleCode: u8(),
    /** Exact unresolved bytes before the death-policy flag. */
    unknown255: bytes(12),
    /** Bypasses the ordinary character death-penalty path. */
    skipsDeathPenalty: bool(),
    /** Stable action-script asset hash. */
    actionScriptHash: u32(),
    /** Player-only action-profile hash; zero for other definitions. */
    playerActionProfileHash: u32(),
}).fixedLength(276);

/** Tail fields shared by the generic and vehicle physical layouts. */
const CharacterStaticTailPrefix = {
    /** Scheduled world-transport role code; zero means no scheduled route. */
    scheduledTransportKindCode: u32(),
    /** Required zero byte between the transport and team fields. */
    reserved04: reserved(1),
    /** Actor instance/runtime team number. */
    teamNumber: i16(),
    /** Client `ServantType` ordinal. */
    servantTypeCode: u8(),
    /** Client `TimeAttackType` code; `-1` disables the feature. */
    timeAttackTypeCode: i16(),
    /** Stored time-attack limit in minutes. */
    timeAttackLimitMinutes: u32(),
};

/** Shared post-layout controls before the related-hash list. */
const CharacterStaticTailControls = {
    /** Exact normalized historical `Suspension` value. */
    suspensionValue: u32(),
    /** Stored 64-bit `AttributeType` bit set as a lossless decimal string. */
    attributeTypeMask: u64().transform((v) => v.toString()),
    /** Historical stealing drop-group selector; zero means absent. */
    stealDropGroupId: u32(),
};

/** Shared 23-byte footer after a counted related-hash list. */
const CharacterStaticTailFooter = {
    /** Client `ClassType` ordinal or its not-applicable sentinel. */
    classTypeCode: u8(),
    /** Historical `CharacterSiegeUsingType` code. */
    characterSiegeUsingTypeCode: u32(),
    /** Required zero word before the source-item identifier. */
    reserved05: reserved(4),
    /** Item that creates, installs, or owns this definition; zero means absent. */
    sourceItemId: u32(),
    /** Required zero word before the inventory-container switch. */
    reserved13: reserved(4),
    /** Selects the ordinary character inventory-container path. */
    inventoryContainerEnabled: u16()
        .lte(1)
        .transform((value) => value === 1),
    /** Historical reset distance, stored in engine centimetres. */
    resetDistanceCentimeters: f32().check(Number.isFinite),
};

/** Vehicle tail selected by its positive, bounded inventory-item count. */
const CharacterStaticVehicleTail = struct({
    /** Physical tail family retained as an output discriminant. */
    layout: literal("vehicle"),
    ...CharacterStaticTailPrefix,
    /** Vehicle inventory/loadout item identifiers. */
    vehicleInventoryItemIds: array(u32().gte(1).lte(20), u32()),
    /** Required zero capacity between the item list and shared controls. */
    reservedAfterItems: reserved(8),
    ...CharacterStaticTailControls,
    /** Region/location hashes shared with mental-card rows. */
    relatedHashes: array(u32().gte(1).lte(6), u32()),
    ...CharacterStaticTailFooter,
});

/** Generic tail selected after the vehicle count rejects its zero prefix. */
const CharacterStaticGenericTail = struct({
    /** Physical tail family retained as an output discriminant. */
    layout: literal("generic"),
    ...CharacterStaticTailPrefix,
    /** Required zero capacity occupying the vehicle item-list position. */
    reservedVehicleItems: reserved(12),
    ...CharacterStaticTailControls,
    /** Region/location hashes shared with mental-card rows. */
    relatedHashes: array(u32().gte(1).lte(6), u32()),
    ...CharacterStaticTailFooter,
});

/** One complete intrinsically framed character definition. */
const CharacterStaticRow = struct({
    /** Character key stored at the physical row boundary. */
    characterKey: u16(),
    /** Eight legacy presentation and interaction switches. */
    headerFlags: array(8, bool()),
    /** Physical character-definition format marker. */
    formatCode: u8().is(21),
    /** Primary activation/knowledge expression. */
    primaryExpression: utf16Text(),
    /** Secondary activation/knowledge expression. */
    secondaryExpression: utf16Text(),
    /** Switch following the two expression slots. */
    postExpressionFlag: bool(),
    /** Redundant in-row copy of `characterKey`, retained only as byte framing. */
    repeatedCharacterKey: bytes(2).reserved(),
    /** Fixed body through the two action hashes. */
    body: CharacterStaticBody,
    /** Action-chart asset name. */
    actionChartName: asciiText(),
    /** Action-script asset path. */
    actionScriptPath: asciiText(),
    /** Korean source name. */
    koreanName: utf16Text(),
    /** Korean affiliation or role family. */
    koreanAffiliation: utf16Text(),
    /** Optional Korean title. */
    koreanTitle: utf16Text(),
    /** Optional voice-event profile label. */
    voiceProfileLabel: asciiText(),
    /** Intrinsic generic or vehicle tail, strongest branch first. */
    tailFields: union(CharacterStaticVehicleTail, CharacterStaticGenericTail),
});

/** Complete intrinsic character-static table without an offset dependency. */
export const CharacterStaticDbss = dbss("characterstatic.dbss")({
    /** Character definitions retained in physical file order. */
    rows: array(u32(), CharacterStaticRow),
});

if (import.meta.main) {
    await CharacterStaticDbss.decodeIntoDisk();
}
