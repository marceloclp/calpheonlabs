import { array, struct, u32 } from "@marceloclp/bsd";
import { dbss } from "./common/helpers";

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
export const DisplayExchangeItemNpcOffsetDbss = dbss(
    "gamecommondata/binary/displayexchangeitemnpcoffset.dbss",
)({
    /** NPC exchange-display pointers in directory order. */
    rows: array(u32(), DisplayExchangeItemNpcOffsetRow),
});

if (import.meta.main) {
    await DisplayExchangeItemNpcOffsetDbss.load();
}
