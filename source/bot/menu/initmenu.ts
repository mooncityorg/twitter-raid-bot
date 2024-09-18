import { InlineKeyboard } from "grammy";

export const initMenu = new InlineKeyboard()
	.url("Install bot", "https://t.me/SolRaidBot?startgroup=_")
	.row()
	.url("Document", "https://docs.solraidbot.com/quickguide")
	.row();
