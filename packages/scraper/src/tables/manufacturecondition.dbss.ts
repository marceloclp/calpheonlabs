import { array, struct, u32 } from "@marceloclp/bsd";
import { asciiText, utf16Text } from "./common/bsd";
import { dbss } from "./common/helpers";

/** One intrinsically framed processing-action condition row. */
const ManufactureConditionRow = struct({
    /** Physical action-hash key prefix. */
    outerActionHash: u32(),
    /** ASCII manufacture action name. */
    actionName: asciiText(),
    /** Action hash repeated by the payload. */
    actionHash: u32(),
    /**
     * Expression controlling whether the action is shown; empty means
     * unrestricted.
     */
    visibleCondition: utf16Text(),
    /** Expression controlling whether a visible action is currently enabled. */
    enableCondition: utf16Text(),
})
    .check((row) => row.outerActionHash === row.actionHash)
    .omit({ outerActionHash: true });

/** Manufacture action names and their visibility and enablement expressions. */
export const ManufactureConditionDbss = dbss(
    "gamecommondata/binary/manufacturecondition.dbss",
)({
    /** Manufacture-condition rows in physical file order. */
    rows: array(u32(), ManufactureConditionRow),
});

if (import.meta.main) {
    await ManufactureConditionDbss.decodeIntoDisk();
}
