import { array, bool, f32, struct, u16, u32, u8 } from "@marceloclp/bsd";
import { utf16Text } from "./common/bsd";
import { dbss } from "./common/helpers";

/** One ship-character extension row framed by its final condition string. */
const EmployeeCharacterShipRow = struct({
    /** Ship character key. */
    shipCharacterKey: u16(),
    /** Cabin occupancy or capacity shown on the ship information page. */
    cabinQuantity: u32(),
    /** Base maximum hired-sailor capacity. */
    baseSailorCapacity: u32(),
    /** Ship provisions, called Rations in the current client. */
    rations: u32(),
    /** Maximum cannonballs supplied to the ship. */
    cannonballCapacity: u32(),
    /** Base cannon-damage multiplier for the hull. */
    cannonDamageMultiplier: f32(),
    /** Damage added per destruction or recovery incident, in basis points. */
    damageGaugeStepBasisPoints: f32(),
    /** Repair cost for one accumulated ship-damage step. */
    damageStepRepairCost: f32().pad(8),
    /** Selects the basic-vessel handling family. */
    basicVesselHandling: bool(),
    /** First copy of the captain-controlled cannon switch. */
    captainControlledCannonFlagA: bool(),
    /** Total cannon count. */
    cannonCount: u8(),
    /** Cannon reload duration in seconds. */
    cannonReloadSeconds: f32(),
    /** Enables onboard cannonball supply. */
    onboardCannonballSupply: bool(),
    /** Second copy of the captain-controlled cannon switch. */
    captainControlledCannonFlagB: bool(),
    /** Minimum captain-controlled cannon range in centimetres. */
    minimumCannonRangeCentimeters: f32(),
    /** Maximum Focus Fire range in centimetres. */
    maximumFocusFireRangeCentimeters: f32(),
    /** Base Focus Fire maximum-angle value in engine source units. */
    focusFireMaximumAngleSourceUnits: f32(),
    /** Maximum cannon power-gauge value. */
    cannonPowerGaugeMaximum: f32(),
    /** Focus Fire precision-rate value. */
    focusFirePrecisionRate: u32(),
    /** Enables the populated Focus Fire profile. */
    focusFireProfileEnabled: bool(),
    /** Optional availability expression. */
    condition: utf16Text(),
}).check(
    (row) =>
        row.captainControlledCannonFlagA === row.captainControlledCannonFlagB,
);

/** Count-prefixed ship extensions without mount-page or character-table joins. */
export const EmployeeCharacterShipDbss = dbss(
    "gamecommondata/binary/employeecharactership.dbss",
)({
    /** Ship-character extension rows in physical file order. */
    rows: array(u32(), EmployeeCharacterShipRow),
});

if (import.meta.main) {
    await EmployeeCharacterShipDbss.decodeIntoDisk();
}
