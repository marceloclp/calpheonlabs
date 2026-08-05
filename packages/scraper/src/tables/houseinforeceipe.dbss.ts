import { array, struct, u16, u32, u8 } from "@marceloclp/bsd";
import { utf16Text } from "./common/bsd";
import { dbss } from "./common/helpers";

/** One intrinsically framed house or workshop recipe-list row. */
const HouseInfoReceipeRow = struct({
    /** Stable house recipe-list identifier. */
    recipeListId: u32(),
    /** Transfer or upgrade target code for this house function. */
    transferKey: u16(),
    /** Korean source label stored as length-prefixed UTF-16 text. */
    name: utf16Text(),
    /** House or workshop function family. */
    groupTypeCode: u8(),
    /** Specific workshop or processor subtype within `groupTypeCode`. */
    workshopSubtypeCode: u8().pad(1),
    /** Five ordered tiers of `itemexchangesource` recipe identifiers. */
    exchangeKeyTiers: array(5, array(u32(), u32())),
    /** Content-group gate; zero means no additional gate in the current capture. */
    contentsGroupKey: u32(),
    /** House-use groups accepted by this recipe-list entry. */
    houseUseGroupTypeCodes: array(u32(), u8()),
});

/** House and workshop recipe lists without item-exchange joins. */
export const HouseInfoReceipeDbss = dbss(
    "gamecommondata/binary/houseinforeceipe.dbss",
)({
    /** House recipe-list rows in physical file order. */
    rows: array(u32(), HouseInfoReceipeRow),
});

if (import.meta.main) await HouseInfoReceipeDbss.decodeIntoDisk();
