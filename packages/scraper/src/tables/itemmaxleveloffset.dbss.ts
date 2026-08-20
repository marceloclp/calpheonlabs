import { bytes, struct, u32 } from "@marceloclp/bsd";
import { table } from "./common/table";

/** One twelve-byte pointer into `itemmaxlevel.dbss`. */
const ItemMaxLevelOffsetRow = struct({
    /** Item identifier repeated by the pointed-to maximum-level row. */
    itemId: u32(),
    /** Absolute byte offset of the five-byte data row. */
    offset: u32(),
    /** Reserved four-byte row trailer. */
    reserved08: bytes(4).reserved(),
}).fixedLength(12);

/** PABR-framed pointer directory for `itemmaxlevel.dbss`. */
export const ItemMaxLevelOffsetDbss = table({
    path: "gamecommondata/binary/itemmaxleveloffset.dbss",
    pabr: true,
    rows: {
        ItemMaxLevelOffsetRow: {
            schema: ItemMaxLevelOffsetRow,
        },
    },
});

if (import.meta.main) {
    await ItemMaxLevelOffsetDbss.decodeIntoDisk();
}
