import { struct, u16, u32 } from "@marceloclp/bsd";
import { table } from "./common/table";

/** One ten-byte pointer into `characterstatic.dbss`. */
const CharacterStaticOffsetRow = struct({
    /** Character key repeated by the pointed-to payload row. */
    key: u16(),
    /** Absolute payload-body start in `characterstatic.dbss`. */
    offset: u32(),
    /** Exact byte length of the pointed-to payload body. */
    byteLength: u32(),
}).fixedLength(10);

export const CharacterStaticOffsetDbss = table({
    path: "gamecommondata/binary/characterstaticoffset.dbss",
    pabr: true,
    rows: {
        CharacterStaticOffsetRow: {
            schema: CharacterStaticOffsetRow,
        },
    },
});

if (import.meta.main) {
    await CharacterStaticOffsetDbss.decodeIntoDisk();
}
