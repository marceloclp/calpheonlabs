import { struct, u16, u32 } from "@marceloclp/bsd";
import { table } from "./common/table";

const CharacterFunctionOffsetRow = struct({
    /** Character or NPC key selecting the companion payload. */
    key: u16(),
    /** Absolute payload start in the companion data file. */
    offset: u32(),
    /** Exact number of bytes owned by the payload. */
    byteLength: u32(),
});

export const CharacterFunctionOffsetDbss = table({
    path: "gamecommondata/binary/characterfunctionoffset.dbss",
    pabr: true,
    rows: {
        CharacterFunctionOffsetRow: { schema: CharacterFunctionOffsetRow },
    },
});

if (import.meta.main) {
    await CharacterFunctionOffsetDbss.decodeIntoDisk();
}
