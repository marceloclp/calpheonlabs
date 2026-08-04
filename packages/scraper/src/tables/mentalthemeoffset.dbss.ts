import { array, struct, u16, u32 } from "@marceloclp/bsd";
import { dbss } from "./common/helpers";

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
export const MentalThemeOffsetDbss = dbss(
    "gamecommondata/binary/mentalthemeoffset.dbss",
)({
    /** Mental-theme pointers in directory order. */
    rows: array(u32(), MentalThemeOffsetRow),
});

if (import.meta.main) {
    await MentalThemeOffsetDbss.load();
}
