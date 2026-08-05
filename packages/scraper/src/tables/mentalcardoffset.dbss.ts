import { array, struct, u32 } from "@marceloclp/bsd";
import { bss } from "./common/helpers";

/** One twelve-byte mental-card pointer using 32-bit keys and span fields. */
const MentalCardOffsetRow = struct({
    /** Mental-card or knowledge ID repeated at the data row. */
    cardId: u32(),
    /** Absolute start of the corresponding `mentalcard.dbss` row. */
    offset: u32(),
    /** Exact byte size of the corresponding variable-width row. */
    byteLength: u32(),
}).fixedLength(12);

/** Complete pointer index for `mentalcard.dbss`. */
export const MentalCardOffsetDbss = bss(
    "gamecommondata/binary/mentalcardoffset.dbss",
)({
    /** Mental-card pointers in directory order. */
    rows: array(u32(), MentalCardOffsetRow).pad(12),
});

if (import.meta.main) {
    await MentalCardOffsetDbss.decodeIntoDisk();
}
