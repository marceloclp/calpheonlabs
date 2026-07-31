import {
    array,
    bool,
    bytes,
    f32,
    i16,
    i32,
    struct,
    u16,
    u32,
    u64,
    u8,
} from "@marceloclp/bsd";
import { mixedText } from "./common/bsd";
import { bss } from "./common/helpers";

/** One fixed 118-byte compact character definition. */
const CharacterSimplyRow = struct({
    /** Global character key. */
    characterKey: u16(),
    /** Historical spawn-condition policy code. */
    spawnConditionCode: u8(),
    /** Inclusive daily spawn-window start, with `0xffff` meaning unscheduled. */
    spawnStartHour: u16(),
    /** Daily spawn-window end, with `0xffff` meaning unscheduled. */
    spawnEndHour: u16(),
    /** Suppresses the ordinary overhead name tag. */
    hidesNameTag: bool(),
    /** Optional collection-interaction profile; zero means absent. */
    collectProfileId: u16(),
    /** Marks active command posts and node forts. */
    kingOrLordTent: bool(),
    /** Selects the standard Node/Conquest annex family. */
    standardSiegeAnnex: bool(),
    /** Bypasses the ordinary character death-penalty path. */
    skipsDeathPenalty: bool(),
    /** Index of the model/animation asset path in `stringPool`. */
    modelStringIndex: u32(),
    /** Stable action-script asset hash. */
    actionScriptHash: u32(),
    /** Numeric character gameplay family. */
    characterKindCode: u8(),
    /** Client class ordinal, or the not-applicable sentinel. */
    classTypeCode: u8(),
    /** Collision capsule height in centimetres. */
    collisionHeightCentimeters: f32(),
    /** Collision capsule radius in centimetres. */
    collisionRadiusCentimeters: f32(),
    /** Base hit-point capacity. */
    hitPoints: f32(),
    /** Historical `AttributeType` membership mask as a lossless decimal string. */
    attributeTypeMask: u64().transform((value) => value.toString()),
    /** Selects vehicle/portable or skip-penalty death handling. */
    isCarryableOrSkipsDeathPenalty: bool(),
    /** Enables ordinary player dialogue interaction. */
    talkable: bool(),
    /** Historical recruitment/taming switch. */
    tamable: bool(),
    /** Legacy world/event-boss role code. */
    worldBossRoleCode: u8(),
    /** Three required zero bytes before the render controls. */
    reserved47: bytes(3)
        .check((value) => value.every((byte) => byte === 0))
        .reserved(),
    /** Whether the ordinary model casts a shadow. */
    rendersShadow: bool(),
    /** Historical default-audio switch. */
    usesDefaultAudio: bool(),
    /** Index of the voice-event label in `stringPool`. */
    voiceProfileStringIndex: u32(),
    /** Historical carrier-relative movement switch. */
    isCarrier: bool(),
    /** Enables client-side AI control. */
    clientAiControlled: bool(),
    /** Sparse client `VehicleType` ordinal. */
    vehicleTypeCode: u8(),
    /** Historical encounter-team number. */
    teamNumber: i16(),
    /** Enables cannon or ship-artillery combat. */
    usesCannonCombat: bool(),
    /** Compact copy of the legacy hidden-name policy. */
    legacyHidesName: bool(),
    /** Signed legacy hunting-target classification. */
    huntingTargetTypeCode: i32(),
    /** Unresolved byte between hunting classification and name index. */
    unknown67: u8(),
    /** Index of the Korean source name in `stringPool`. */
    nameStringIndex: u32(),
    /** Index of the optional Korean title in `stringPool`. */
    titleStringIndex: u32(),
    /** Enables the specialized direct-world-interaction path. */
    usesSpecializedWorldInteraction: bool(),
    /** Client character-grade ordinal. */
    characterGradeTypeCode: u8(),
    /** Compact copy of the legacy hidden-HP policy. */
    legacyHidesHitPointBar: bool(),
    /** Base character level. */
    level: u8(),
    /** Three required zero bytes before the tribe code. */
    reserved80: bytes(3)
        .check((value) => value.every((byte) => byte === 0))
        .reserved(),
    /** Client ecology/combat-family identifier. */
    tribeTypeCode: u16(),
    /** Selects the Aal's Breath fusion-core actor. */
    isFusionCore: bool(),
    /** Three required zero bytes before the name-tag controls. */
    reserved86: bytes(3)
        .check((value) => value.every((byte) => byte === 0))
        .reserved(),
    /** Enables the NPC-specific visible HP bar. */
    visibleHpBarForNpc: bool(),
    /** Client forced-name-tag visibility ordinal. */
    visibleNameTagTypeCode: u8(),
    /** Marks actors summoned through siege-object installation. */
    summonedBySiegeObject: bool(),
    /** Unresolved byte before the knowledge-string index. */
    unknown92: u8(),
    /** Index of the knowledge/unlock expression in `stringPool`. */
    knowledgeStringIndex: u32(),
    /** Item-main-group drop bag used when stealing from this NPC. */
    stealDropGroupId: u32(),
    /** Vehicle inventory capacity including two engine-reserved slots. */
    inventorySlotCapacity: u8(),
    /** Enables absolute interaction. */
    absoluteInteraction: bool(),
    /** Suppresses the ordinary actor HP-bar rendering. */
    hidesHitPointBar: bool(),
    /** Enables runtime actor/vehicle ownership. */
    usesRuntimeOwner: bool(),
    /** Number of actor seats defined by the vehicle. */
    vehicleSeatCount: u8(),
    /** Index of the activation-condition expression in `stringPool`. */
    activationConditionStringIndex: u16(),
    /** Two required zero bytes before vehicle subtyping. */
    reserved108: bytes(2)
        .check((value) => value.every((byte) => byte === 0))
        .reserved(),
    /** Engine `TVehicleSubType` ordinal. */
    vehicleSubTypeCode: u8(),
    /** Marks guild/Node/Conquest-War vehicles. */
    guildVehicle: bool(),
    /** Narrow legacy mount-family ordinal. */
    legacyMountFamilyCode: u8(),
    /** Historical scheduled-world-transport family code. */
    scheduledTransportKindCode: u8(),
    /** Four required zero bytes at the end of the row. */
    reserved114: bytes(4)
        .check((value) => value.every((byte) => byte === 0))
        .reserved(),
}).fixedLength(118);

const CharacterSimplyFooter = struct({
    /** Absolute byte offset of the string-pool count. */
    stringPoolOffset: u32(),
    /** Required zero four-byte footer trailer. */
    reserved: bytes(4).reserved(),
});

/** Compact character rows and their in-file mixed-encoding string pool. */
export const CharacterSimplyBss = bss("charactersimply.bss")({
    /** Fixed-width compact character rows in physical order. */
    rows: array(u32(), CharacterSimplyRow),
    /** Local string pool with its validated framing footer omitted. */
    stringPool: array(u32(), mixedText()),
    /** Footer used for validation. */
    footer: CharacterSimplyFooter,
});

if (import.meta.main) {
    await CharacterSimplyBss.load();
}
