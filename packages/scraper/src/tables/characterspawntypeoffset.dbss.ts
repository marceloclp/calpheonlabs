import { struct, u16, u32 } from "@marceloclp/bsd";
import { table } from "./common/table";

/** One ten-byte pointer into `characterspawntype.dbss`. */
const CharacterSpawnTypeOffsetRow = struct({
    /** Character key repeated by the pointed-to capability row. */
    key: u16(),
    /** Absolute capability-row start in `characterspawntype.dbss`. */
    offset: u32(),
    /** Exact byte length of the pointed-to capability row. */
    byteLength: u32(),
}).fixedLength(10);

export const CharacterSpawnTypeOffsetDbss = table({
    path: "gamecommondata/binary/characterspawntypeoffset.dbss",
    pabr: true,
    rows: {
        CharacterSpawnTypeOffsetRow: {
            schema: CharacterSpawnTypeOffsetRow,
        },
    },
});

if (import.meta.main) {
    await CharacterSpawnTypeOffsetDbss.decodeIntoDisk();
}
