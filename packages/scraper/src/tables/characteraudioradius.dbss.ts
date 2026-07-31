import { array, f32, struct, u16, u32 } from "@marceloclp/bsd";

import { dbss } from "./common/helpers";

/** One character-specific audible-distance override. */
const CharacterAudioRadiusRow = struct({
    /** Character, boss, hazard, or world-object key. */
    characterKey: u16(),
    /** Audible radius in centimetres. */
    audibleRadiusCentimeters: f32(),
});

export const CharacterAudioRadiusDbss = dbss("characteraudioradius.dbss")({
    rows: array(u32(), CharacterAudioRadiusRow),
});

if (import.meta.main) {
    await CharacterAudioRadiusDbss.load();
}
