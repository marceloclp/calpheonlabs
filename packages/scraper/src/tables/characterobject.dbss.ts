import {
    array,
    bool,
    bytes,
    f32,
    literal,
    padded,
    struct,
    u16,
    u32,
    u8,
    union,
} from "@marceloclp/bsd";

import { asciiText, utf16Text } from "./common/bsd";
import { dbss } from "./common/helpers";

/** Identity-only transform slot used by the shared compact/housing suffix. */
const TransformMatrix = array(16, f32());
/** Each mesh triangle has the a reserved range of bytes. */
const MeshTriangle = u32().pad((x) => x * 140);
const Point3D = struct({ x: f32(), y: f32(), z: f32() });

const CharacterObjectCommonAttributes = struct({
    /** Required unused prefix. */
    reserved00: bytes(16).reserved(),
    /** First ordinal serializer transform slot. */
    transformMatrixA: TransformMatrix,
    /** Second ordinal serializer transform slot. */
    transformMatrixB: TransformMatrix.pad(4),
    /**
     * Selects housing-geometry handling instead of the compact-structure
     * profile.
     */
    usesHousingGeometryProfile: bool(),
    /**
     * Historical object armor/impact-material code.
     *
     * @see {@link https://github.com/freedDog/bdoemu/blob/master/game-logic/src/main/data/sqlite3/bdo.sqlite3 | archived `Object_Table.ArmorMaterial`}
     */
    armorMaterialCode: u8().in([4, 6, 7]),
    /** Neutral variant member control at suffix offset `+150`. */
    field150: u8(),
    /** Neutral variant-family control at suffix offset `+151`. */
    field151: u8(),
    /** Required profile terminator. */
    sentinel152: u16().is(0xffff),
    /** Required zero capacity before the tuning controls. */
    reserved154: bytes(56).reserved(),
    /** Neutral tuning control at suffix offset `+210`. */
    field210: u8(),
    /** Required zero alignment between tuning controls. */
    reserved211: bytes(7).reserved(),
    /** Neutral tuning control at suffix offset `+218`. */
    field218: u8(),
    /** Required zero alignment before the terminal sentinel. */
    reserved219: bytes(7).reserved(),
    /** Required signed-minus-one terminal sentinel. */
    sentinel226: u32().is(0xffffffff),
    /** Required zero trailer. */
    reserved230: bytes(4).reserved(),
})
    .fixedLength(234)
    .omit({
        reserved00: true,
        field150: true,
        field151: true,
        field210: true,
        field218: true,
        reserved144: true,
        sentinel152: true,
        reserved154: true,
        reserved211: true,
        reserved219: true,
        sentinel226: true,
        reserved230: true,
    });

/** Sequential post-geometry layout for type-0 and named-structure rows. */
const CharacterObjectType0CommonSuffixProperties = struct({
    type: literal("commonSuffix"),
    /** Fixed format token serialized before the common suffix. */
    versionToken: asciiText().is("10"),
    /** Common attributes shared by compact and housing bodies. */
    attributes: CharacterObjectCommonAttributes,
});

const CharacterObjectType0NumericHousingProperties = struct({
    type: literal("numericHousing"),
    /**
     * Historical `Desc_Area` text stored as printable ASCII digits.
     *
     * @see {@link https://github.com/freedDog/bdoemu/blob/master/game-logic/src/main/data/sqlite3/bdo.sqlite3 | archived `Object_Table.Desc_Area`}
     */
    areaDescription: asciiText(),
    /**
     * Historical `Desc_Feature1` text in source order.
     *
     * @see {@link https://github.com/freedDog/bdoemu/blob/master/game-logic/src/main/data/sqlite3/bdo.sqlite3 | archived `Object_Table.Desc_Feature1` and `Desc_Feature2`}
     */
    featureA: utf16Text(),
    /**
     * Historical `Desc_Feature2` text in source order.
     *
     * @see {@link https://github.com/freedDog/bdoemu/blob/master/game-logic/src/main/data/sqlite3/bdo.sqlite3 | archived `Object_Table.Desc_Feature1` and `Desc_Feature2`}
     */
    featureB: utf16Text(),
    /** Fixed base-object transforms and neutral control. */
    base: bytes(162).reserved(),
    /**
     * Four historical house screenshot asset slots, including empty slots.
     *
     * @see {@link https://github.com/freedDog/bdoemu/blob/master/game-logic/src/main/data/sqlite3/bdo.sqlite3 | archived `Object_Table.HouseScreenShotPath_1..4`}
     */
    screenshotPaths: array(4, asciiText()),
    /** Neutral final row-local control from the numeric-housing trailer. */
    trailerField16: struct({
        /** Required unused prefix. */
        reserved00: bytes(16).reserved(),
        /** Neutral unique row-local control at trailer offset `+16`. */
        field16: u32(),
        /** Required zero terminal word. */
        reserved20: bytes(4).reserved(),
    }).fixedLength(24),
}).omit({ trailerField16: true });

const CharacterObjectType0 = struct({
    /** Body family supplied by the physical low-byte type code. */
    type: literal("type0"),
    /** Secondary housing/farm mesh. */
    secondaryAssetPath: asciiText(),
    /** Housing locator, structure token, or farm/tent configuration. */
    housingConfiguration: asciiText(),
    /** Stored geometry-layout version or alternate-world flag. */
    formatVersion: u8().lte(1),
    /** Triangle counts for every mesh in every layer. */
    collisionMeshTriangleCounts: array(
        /** Number of mesh layers. */
        u32().pad(4),
        /** Triangle counts inside each mesh layer. */
        array(u32(), MeshTriangle),
    ),
    /** Opaque common-property block following the collision geometry. */
    reserved00: bytes(333).reserved(),
    /**
     * Material-preview asset serialized immediately after the common
     * properties.
     */
    materialPreviewPath: asciiText().pad(16),
    /** Complete sequential variant after the material preview. */
    propertiesAndAssets: union(
        CharacterObjectType0CommonSuffixProperties,
        CharacterObjectType0NumericHousingProperties,
    ),
});

const CharacterObjectType2 = struct({
    /** Body family supplied by the physical low-byte type code. */
    type: literal("type2"),
    /** Complete fixed block plus established row-local field projections. */
    fixed: struct({
        collisionEnabled: padded(16, bool()).pad(128),
        maidInstallationEnabled: bool().pad(43),
        installationMaxCount: u8().pad(119),
        installationTypeCode: u8(),
        subInstallationTypeCode: u8(),
        referenceActionObjectTypeCode: u8(),
        placementFlags: array(6, u8()).pad(3),
        areaEffectRadius: f32(),
        areaEffectTypeCode: u8().pad(16),
        productRecipeId: u16().pad(2),
        seedRecipeId: u16().pad(2),
        explorationExperience: u8().pad(19),
        usageTimeMilliseconds: u32().pad(4),
        interiorPoints: u32().pad(152),
        audioBankNumber: u8().pad(5),
        summonCharacterKey: u16(),
        materialIndex: u16(),
        relocationOffset: Point3D,
    }).fixedLength(556),
    /** Optional object-use animation/action. */
    interactionAction: asciiText(),
    /** Stable hash paired with the interaction action. */
    interactionActionHash: u32(),
    /** Optional housing/object UI icon. */
    iconPath: asciiText(),
    /** Fixed trailer and repair ite`m. */
    trailer: struct({
        reserved: bytes(40).reserved(),
        terminalSentinel: u32().is(0xffffffff),
        repairItemId: u32(),
    })
        .fixedLength(48)
        .omit({ reserved: true, terminalSentinel: true }),
});

/** Shared compact siege/guild structure body. */
const CharacterObjectTypeCompact = struct({
    /** Body family selected by one of the compact low-byte type codes. */
    type: literal("compact"),
    /** Secondary housing mesh. */
    secondaryAssetPath: asciiText(),
    /** Completely retained 350-byte structure-property block. */
    fixedProperties: bytes(350),
    /** Material-preview asset. */
    materialPreviewPath: asciiText(),
    /** Required unused material suffix. */
    reservedAfterMaterial: bytes(16).reserved(),
    /** Physical compact-layout version token. */
    versionToken: asciiText(),
    /** Fully partitioned shared transform/profile/tuning suffix. */
    commonSuffix: CharacterObjectCommonAttributes,
}).omit({ reservedAfterMaterial: true });

const CharacterObjectRow = struct({
    /** Object key repeated by the companion directory. */
    objectKey: u16(),
    /** Packed low-byte object kind and high-byte independent flags. */
    typeCode: u16().peek(),
    objectKindCode: u16()
        .transform((x) => x & 0xff)
        .peek(),
    layoutTypeFlags: u16().transform((x) => x >>> 8),
    /** Independent standard-compact-layout flag. */
    layoutFlag: u16(),
    /** Primary render or vegetation asset. */
    primaryAssetPath: asciiText(),
    /** Conditional object body selected by `typeCode`. */
    body: union(
        CharacterObjectType2,
        CharacterObjectTypeCompact,
        CharacterObjectType0,
    ),
});

export const CharacterObjectDbss = dbss("characterobject.dbss")({
    rows: array(u32(), CharacterObjectRow),
});

if (import.meta.main) {
    await CharacterObjectDbss.load();
}
