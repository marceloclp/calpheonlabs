import { array, bytes, f32, struct, u32, u64, u8 } from "@marceloclp/bsd";
import { bss } from "./common/helpers";

/** One placed player-avatar display. */
const UserNpcRow = struct({
    /** Exact 64-bit user or avatar identifier. */
    userIdentifier: u64(),
    /** World-space X coordinate. */
    positionX: f32(),
    /** World-space Y coordinate. */
    positionY: f32(),
    /** World-space Z coordinate. */
    positionZ: f32(),
    /** Unwrapped world yaw in radians. */
    orientationRadians: f32(),
    /** Index into the trailing action-name list. */
    actionIndex: u32(),
    /** Action-scoped reward or podium display slot. */
    displaySlot: u8(),
}).fixedLength(29);

/** One ASCII action name preceded by its zero flag and byte length. */
const UserNpcAction = u8().is(0).pipe(bytes(u32()).ascii());

/** User-avatar placements and their in-file action-name pool. */
export const UserNpcBss = bss("gamecommondata/binary/usernpc.bss")({
    /** Fixed-width placed-avatar rows. */
    rows: array(u32(), UserNpcRow),
    /** Action names addressed by each row's `actionIndex`. */
    actions: array(u32(), UserNpcAction),
    /** Informational footer following the action-name pool. */
    footer: struct({
        /** Absolute byte offset of the counted `actions` pool. */
        actionPoolOffset: u32().pad(4),
    }),
});

if (import.meta.main) {
    await UserNpcBss.decodeIntoDisk();
}
