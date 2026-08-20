import { struct, u16, u32 } from "@marceloclp/bsd";
import { table } from "./common/table";

/** One ten-byte pointer into `characterobject.dbss`. */
const CharacterObjectOffsetRow = struct({
    /** Character-object key repeated by the pointed-to payload row. */
    key: u16(),
    /** Absolute payload-row start in `characterobject.dbss`. */
    offset: u32(),
    /** Exact byte length of the pointed-to payload row. */
    byteLength: u32(),
}).fixedLength(10);

export const CharacterObjectOffsetDbss = table({
    path: "gamecommondata/binary/characterobjectoffset.dbss",
    pabr: true,
    rows: {
        CharacterObjectOffsetRow: { schema: CharacterObjectOffsetRow },
    },
});

if (import.meta.main) {
    await CharacterObjectOffsetDbss.decodeIntoDisk();
}
