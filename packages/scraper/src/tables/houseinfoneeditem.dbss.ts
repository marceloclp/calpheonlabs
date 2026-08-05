import { array, padded, struct, u16, u32, u64 } from "@marceloclp/bsd";
import { dbss } from "./common/helpers";

/** One item and quantity required by a house transfer or upgrade tier. */
const HouseInfoNeedItemMaterial = struct({
    /** Required item identifier; `1` denotes silver in the current table. */
    itemId: u32(),
    /** Exact required quantity. */
    quantity: u64(),
}).fixedLength(12);

/** One of the five level-specific house transfer or upgrade requirements. */
const HouseInfoNeedItemTier = struct({
    /** One-based house upgrade level. */
    level: u32(),
    /** Transfer or upgrade duration in seconds. */
    conversionTimeSeconds: u32(),
    /** Items consumed at this level. */
    materials: array(u32(), HouseInfoNeedItemMaterial),
});

/** One complete five-level house transfer or upgrade requirement row. */
const HouseInfoNeedItemRow = struct({
    /** Requirement-set key also used by house recipes. */
    requirementKey: u16(),
    /** Requirements for levels one through five after a twelve-byte separator. */
    tiers: padded(12, array(5, HouseInfoNeedItemTier)),
});

/** Intrinsically framed house transfer and upgrade requirement sets. */
export const HouseInfoNeedItemDbss = dbss(
    "gamecommondata/binary/houseinfoneeditem.dbss",
)({
    /** House requirement rows in physical file order. */
    rows: array(u32(), HouseInfoNeedItemRow),
});

if (import.meta.main) {
    await HouseInfoNeedItemDbss.decodeIntoDisk();
}
