import { array, u16, u32 } from "@marceloclp/bsd";
import { bss } from "./common/helpers";

/**
 * Physical allowlist of character or object keys admitted to cutscene
 * sequences.
 */
export const CutsceneCharacterDataBss = bss(
    "gamecommondata/binary/cutscenecharacterdata.bss",
)({
    /** Character or object keys in physical table order. */
    rows: array(u32(), u16()).pad(12),
});

if (import.meta.main) {
    await CutsceneCharacterDataBss.load();
}
