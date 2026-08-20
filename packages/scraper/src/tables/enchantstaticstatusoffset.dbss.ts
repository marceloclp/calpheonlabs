import { struct, u16, u32, u8 } from "@marceloclp/bsd";
import { table } from "./common/table";

/** One fixed-width pointer to an equipment enhancement-status row. */
const EnchantStaticStatusOffsetRow = struct({
    /** Complete packed family/level identity. */
    key: u32().peek(),
    /** Low 16-bit status-family identifier. */
    staticStatusKey: u16().pad(1),
    /** Enhancement-level discriminator stored in the packed key's high byte. */
    enhancementLevel: u8(),
    /** Absolute start of the corresponding status row. */
    offset: u32(),
    /** Exact byte size of the corresponding status row. */
    byteLength: u32(),
}).fixedLength(12);

/** Physical index of equipment status rows by family and enhancement level. */
export const EnchantStaticStatusOffsetDbss = table({
    path: "gamecommondata/binary/enchantstaticstatusoffset.dbss",
    pabr: true,
    rows: {
        EnchantStaticStatusOffsetRow: {
            schema: EnchantStaticStatusOffsetRow,
        },
    },
});

if (import.meta.main) {
    await EnchantStaticStatusOffsetDbss.decodeIntoDisk();
}
