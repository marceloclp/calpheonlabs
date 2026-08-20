import {
    array,
    literal,
    struct,
    u16,
    u32,
    u8,
    union,
} from "@marceloclp/bsd";
import { utf16Text, utf8Text } from "./common/bsd";
import { table } from "./common/table";

/** One service-specific prompt preceding ordinary dialogue options. */
const DetailDialogServicePrompt = struct({
    /** Client service-prompt discriminator; individual numeric meanings remain raw. */
    typeCode: u8(),
    /** Korean service-prompt text. */
    text: utf16Text(),
});

/** One full dialogue option. */
const DetailDialogOption = struct({
    /** Availability expression; empty means unconditional. */
    condition: utf16Text(),
    /** Korean option label. */
    label: utf16Text(),
    /** Client dialogue-button type discriminator. */
    typeCode: u32(),
    /** Korean response, explanation, or result text. */
    description: utf16Text(),
    /** Client command program; empty when selection only navigates. */
    action: utf16Text(),
    /** Destination node in the source dialogue-script namespace. */
    destinationId: u16(),
});

/** One condition-selected alternate dialogue line and its source node. */
const DetailDialogConditionalDialogue = struct({
    /** Availability expression; empty means unconditional. */
    condition: utf16Text(),
    /** Korean alternate dialogue text, not a button label. */
    text: utf16Text(),
    /** Destination node in the source dialogue-script namespace. */
    destinationId: u16(),
});

/** Standard control trailer selected by two structural constants. */
const DetailDialogStandardTrailer = struct({
    /** Decoder-supplied physical trailer family. */
    layout: literal("standard"),
    /** Required leading literal `2`; no gameplay meaning is claimed. */
    leadingConstant: u32().is(2).pad(4),
    /** Required trailing literal `2`; no gameplay meaning is claimed. */
    trailingConstant: u16().is(2),
    /** Packed metadata flags whose individual bit meanings remain unresolved. */
    metadataFlags: u16().pad(4),
}).omit({ leadingConstant: true, trailingConstant: true });

/** Compact twelve-byte control trailer. */
const DetailDialogCompactTrailer = struct({
    /** Decoder-supplied physical trailer family. */
    layout: literal("compact"),
}).pad(12);

/** Physical compact or standard detail-dialogue control trailer. */
const DetailDialogControlTrailer = union(
    DetailDialogStandardTrailer,
    DetailDialogCompactTrailer,
);

/** All three count-framed dialogue-control sections and their trailer. */
const DetailDialogControl = struct({
    /** Service prompts selected before ordinary options. */
    servicePrompts: array(u32(), DetailDialogServicePrompt),
    /** Full dialogue options. */
    options: array(u32(), DetailDialogOption),
    /** Condition-selected alternate dialogue lines. */
    conditionalDialogues: array(u32(), DetailDialogConditionalDialogue),
    /** Compact or standard physical trailer. */
    trailer: DetailDialogControlTrailer,
});

/** One complete detailed-dialogue row. */
const DetailDialogRow = struct({
    /** Lookup key prefix repeated by the payload. */
    outerDialogKey: u32(),
    /** Packed `(dialogId << 16) | npcId` key. */
    dialogKey: u32().peek(),
    /** Low 16-bit NPC identifier derived from `dialogKey`. */
    npcId: u32().peek().transform((x) => x & 0xffff),
    /** High 16-bit dialogue-variant identifier derived from `dialogKey`. */
    dialogId: u32().transform((x) => x >>> 16),
    /** Node identifier within the source dialogue script. */
    detailId: u16(),
    /** Animation or dialogue-scene asset name. */
    actionName: utf8Text(),
    /** Optional camera/function-scene preset or compact camera parameters. */
    cameraPreset: utf8Text(),
    /** Primary Korean dialogue text. */
    koreanText: utf16Text(),
    /** Fully decoded dialogue-control program. */
    control: DetailDialogControl,
}).check((row) => row.outerDialogKey === row.dialogKey)

/**
 * Intrinsically framed detailed dialogues without base-dialogue or
 * localization joins.
 */
export const DetailDialogDbss = table({
    path: "gamecommondata/binary/detail_dialog.dbss",
    rows: {
        DetailDialogRow: {
            schema: DetailDialogRow,
        },
    },
});

if (import.meta.main) {
    await DetailDialogDbss.decodeIntoDisk();
}
