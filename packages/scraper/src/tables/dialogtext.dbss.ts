import { array, struct, u16, u32 } from "@marceloclp/bsd";
import { utf16Text } from "./common/bsd";
import { dbss } from "./common/helpers";

/** One addressed line in a named dialogue-text group. */
const DialogTextLine = struct({
    /** Selector used within the enclosing dialogue group. */
    lineId: u16(),
    /** Line text, including any physical voice markup. */
    text: utf16Text(),
});

/** One named dialogue-text group. */
const DialogTextRow = struct({
    /** Lookup key prefix repeated by the payload. */
    outerDialogTextKey: u32(),
    /** Full-width engine lookup key whose derivation remains unknown. */
    dialogTextKey: u32(),
    /** Source label naming the dialogue group. */
    label: utf16Text(),
    /** Addressed lines prefixed by their stored count. */
    lines: array(u32(), DialogTextLine),
})
    .pad(4)
    .check((row) => row.outerDialogTextKey === row.dialogTextKey);

/** Intrinsically framed dialogue-text groups without presentation-layer parsing. */
export const DialogTextDbss = dbss("gamecommondata/binary/dialogtext.dbss")({
    /** Named dialogue-text groups in physical file order. */
    rows: array(u32(), DialogTextRow),
});

if (import.meta.main) {
    await DialogTextDbss.decodeIntoDisk();
}
