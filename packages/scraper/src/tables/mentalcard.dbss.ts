import { array, f32, struct, u16, u32, u8 } from "@marceloclp/bsd";
import { asciiText, utf16Text } from "./common/bsd";
import { table } from "./common/table";

/** One intrinsically framed knowledge or mental-card row. */
const MentalCardRow = struct({
    /** Knowledge or card identifier stored at row offset `+0`. */
    cardId: u32(),
    /** Owning mental-theme key stored at `+4`. */
    themeKey: u16(),
    /** Packed acquisition and name-placeholder flags stored at `+6`. */
    themeFlags: u16(),
    /** Minimum random favor or amity award. */
    minimumFavor: f32(),
    /** Maximum random favor or amity award. */
    maximumFavor: f32(),
    /** Interest-level input used by the conversation system. */
    interestLevel: f32(),
    /** Next-combo target: zero interest, one favor, or four no effect. */
    nextComboTargetCode: u8().in([0, 1, 4]),
    /** Turn delay before the next-combo effect begins. */
    nextComboDelayTurns: f32(),
    /** Interest or favor increase applied by the next-combo effect. */
    nextComboIncrease: u32(),
    /** Number of turns for which the combo increase remains active. */
    nextComboDurationTurns: u32(),
    /** Korean source name. */
    koreanName: utf16Text(),
    /** Korean source description. */
    koreanDescription: utf16Text(),
    /** Client card type: zero normal or one important/story. */
    mentalCardTypeCode: u16().in([0, 1]),
    /** Client knowledge or card level used by the acquisition badge. */
    mentalCardLevel: u32().lte(5),
    /** Knowledge-card artwork path. */
    iconPath: asciiText(),
    /** Korean acquisition or source hint. */
    koreanAcquisitionHint: utf16Text(),
    /** World-space marker coordinate. */
    markerCoordinate: struct({
        /** First stored coordinate axis. */
        x: f32(),
        /** Second stored coordinate axis. */
        y: f32(),
        /** Third stored coordinate axis. */
        z: f32(),
    }),
    /** Marker or service namespace code. */
    markerTypeCode: u8().lte(17),
    /** Marker flags for coordinates and NPC-service selection. */
    markerFlags: u32().in([0, 1, 3]),
    /** Region or location hashes followed by the five-byte row terminator. */
    relatedHashes: array(u32().gte(1).lte(7), u32()).pad(5),
});

/** Physical mental-card table without item, theme, or localization joins. */
export const MentalCardDbss = table({
    path: "gamecommondata/binary/mentalcard.dbss",
    rows: {
        /** Mental-card rows in physical file order. */
        MentalCardRow: { schema: MentalCardRow },
    },
});

if (import.meta.main) {
    await MentalCardDbss.decodeIntoDisk({ debug: true });
}
