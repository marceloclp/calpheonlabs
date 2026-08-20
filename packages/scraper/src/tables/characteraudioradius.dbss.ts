import { f32, struct, u16 } from "@marceloclp/bsd";
import { table } from "./common/table";

/** One character-specific audible-distance override. */
const CharacterAudioRadiusRow = struct({
    /** Character, boss, hazard, or world-object key. */
    characterKey: u16(),
    /** Audible radius in centimetres. */
    audibleRadiusCentimeters: f32(),
});

export const CharacterAudioRadiusDbss = table({
    path: "gamecommondata/binary/characteraudioradius.dbss",
    rows: {
        CharacterAudioRadiusRow: { schema: CharacterAudioRadiusRow },
    },
});

if (import.meta.main) {
    await CharacterAudioRadiusDbss.decodeIntoDisk();
}
