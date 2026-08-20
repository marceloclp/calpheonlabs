import { struct, u32 } from "@marceloclp/bsd";
import { table } from "./common/table";

/** Twelve-byte companion pointer with a four-byte lookup key. */
export const DisplayExchangeItemNpcOffsetRow = struct({
    /** Four-byte lookup key repeated by the addressed data row. */
    key: u32(),
    /** Absolute byte offset of the addressed payload. */
    offset: u32(),
    /** Exact byte length of the addressed payload. */
    byteLength: u32(),
}).fixedLength(12);

/** Physical directory of NPC exchange-display payload spans. */
export const DisplayExchangeItemNpcOffsetDbss = table({
    path: "gamecommondata/binary/displayexchangeitemnpcoffset.dbss",
    rows: {
        DisplayExchangeItemNpcOffsetRow: {
            schema: DisplayExchangeItemNpcOffsetRow,
        },
    },
});

if (import.meta.main) {
    await DisplayExchangeItemNpcOffsetDbss.decodeIntoDisk();
}
