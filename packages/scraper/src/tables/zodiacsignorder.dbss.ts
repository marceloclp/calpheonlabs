import { array, struct, u16, u32, u8 } from "@marceloclp/bsd";
import { dbss } from "./common/helpers";

/** One intrinsically framed zodiac conversation-order row. */
const ZodiacSignOrderRow = struct({
    /** Conversation-order key stored before the variable payload. */
    orderId: u16(),
    /**
     * Stored order parameters whose exact conversation operation remains
     * unresolved.
     */
    orderValues: array(u32().pad(4), u16()),
    /** Zodiac or horoscope identifier resolved by localization type `7`. */
    zodiacSignId: u8(),
    /** Conversation-order key repeated at the end of the payload. */
    repeatedOrderId: u16(),
})
    .check((row) => row.orderId === row.repeatedOrderId)
    .omit({ repeatedOrderId: true });

/** Zodiac order rows with the player-facing horoscope identifier exposed. */
export const ZodiacSignOrderDbss = dbss(
    "gamecommondata/binary/zodiacsignorder.dbss",
)({
    /** Zodiac conversation-order rows in physical file order. */
    rows: array(u32(), ZodiacSignOrderRow),
});

if (import.meta.main) {
    await ZodiacSignOrderDbss.load();
}
