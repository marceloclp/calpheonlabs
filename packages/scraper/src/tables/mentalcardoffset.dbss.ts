import { struct, u32 } from "@marceloclp/bsd";
import { table } from "./common/table";

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
export const MentalCardOffsetDbss = table({
    path: "gamecommondata/binary/mentalcardoffset.dbss",
    pabr: true,
    rows: {
        /** Mental-card pointers in directory order. */
        MentalCardOffsetRow: { schema: MentalCardOffsetRow },
    },
});

if (import.meta.main) {
    await MentalCardOffsetDbss.decodeIntoDisk({ debug: true });
}
