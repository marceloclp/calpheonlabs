import { luac } from "./common/helpers";

/** Item tooltip bytecode used by the legacy focused-disassembly investigation. */
export const PanelTooltipStaticSlotLuac = luac(
    "luacscript/x64/widget/tooltip/panel_tooltip_staticslot.luac",
);

if (import.meta.main) {
    await PanelTooltipStaticSlotLuac.decodeIntoDisk();
}
