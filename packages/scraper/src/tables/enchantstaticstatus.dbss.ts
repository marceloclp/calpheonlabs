import {
    array,
    bytes,
    f32,
    literal,
    struct,
    u32,
    u8,
    union,
} from "@marceloclp/bsd";
import { utf16Text } from "./common/bsd";
import { table } from "./common/table";

/** Variable standard tail selected by its complete intrinsic framing. */
const StandardTail = struct({
    /** Decoder-supplied physical tail family. */
    layout: literal("standard"),
    /** Exact undecoded bytes beginning at row-relative offset `+251`. */
    unknown251: bytes(12),
    /** Effect-script text. */
    effectScript: utf16Text(),
    /** Exact undecoded bytes following `effectScript`. */
    unknownAfterEffectScript: bytes(13),
    /** Three padded auxiliary-effect text slots. */
    auxiliaryTexts: array(3, utf16Text().pad(4)),
    /** Opaque fixed region preceding the counted terminal values. */
    unknownTailPrefix: bytes(125),
    /** Unknown variable terminal values. */
    tailValues: array(u32(), u32()),
    /** Opaque six-byte terminal suffix. */
    unknownTailSuffix: bytes(6),
});

/** Fixed-width compact tail used by rows without auxiliary text slots. */
const CompactTail = struct({
    /** Decoder-supplied physical tail family. */
    layout: literal("compact"),
    /** Exact undecoded bytes beginning at row-relative offset `+251`. */
    unknown251: bytes(4),
    /** Effect-script text. */
    effectScript: utf16Text(),
    /** Opaque fixed-width bytes completing the compact profile. */
    unknownTail: bytes(222),
});

/** One complete equipment enhancement-status row. */
const EnchantStaticStatusRow = struct({
    /** Status-family identifier referenced by item records. */
    staticStatusKey: u32(),
    /** Enhancement-level discriminator within the status family. */
    enhancementLevel: u8(),
    /** Exact undecoded bytes at row-relative offsets `+5..+182`. */
    unknown05: bytes(178),
    /** Eleven little-endian float32 values at offsets `+183..+226`. */
    float183: array(11, f32()),
    /** Three little-endian float32 values at offsets `+227..+238`. */
    float227: array(3, f32()),
    /** Three little-endian float32 values at offsets `+239..+250`. */
    float239: array(3, f32()),
    /** Intrinsically selected standard or compact tail. */
    tail: union(StandardTail, CompactTail),
});

/** Equipment enhancement-status rows without joins to item tables. */
export const EnchantStaticStatusDbss = table({
    path: "gamecommondata/binary/enchantstaticstatus.dbss",
    rows: {
        EnchantStaticStatusRow: {
            schema: EnchantStaticStatusRow,
        },
    },
});

if (import.meta.main) {
    await EnchantStaticStatusDbss.decodeIntoDisk();
}
