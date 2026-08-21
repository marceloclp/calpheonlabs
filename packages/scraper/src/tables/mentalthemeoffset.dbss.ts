import { struct, u16, u32 } from "@marceloclp/bsd";
import { table } from "./common/table";

/** One ten-byte pointer to a variable-width mental-theme payload. */
const MentalThemeOffsetRow = struct({
    /** Mental-theme key repeated by the addressed data row. */
    themeKey: u16(),
    /** Absolute start of the inner theme payload. */
    offset: u32(),
    /** Exact byte size of that inner payload. */
    byteLength: u32(),
}).fixedLength(10);

/** Counted mental-theme pointer table without PABR framing. */
export const MentalThemeOffsetDbss = table({
    path: "gamecommondata/binary/mentalthemeoffset.dbss",
    rows: {
        /** Mental-theme pointers in directory order. */
        MentalThemeOffsetRow: { schema: MentalThemeOffsetRow },
    },
});

if (import.meta.main) {
    await MentalThemeOffsetDbss.decodeIntoDisk({ debug: true });
}
