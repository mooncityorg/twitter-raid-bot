import { Menu } from "@grammyjs/menu";
import { InlineKeyboard } from "grammy";
import { summarizeRaid } from "../../utils.js";

export const menu = new Menu("raid-bot-menu")
	.text("Raid", (ctx) => {
		ctx.reply(
			'Input twitter link.\nex: "/raid https://x.com/JamesjamMoon/status/1813452079077421478" \nor "/raid 1813452079077421478"',
		);
	})
	.text("Resume", async (ctx) => {
		try {
			const userId = await ctx.from?.id;
			const chatId = ctx.chat?.id;
			if (chatId == undefined) {
				ctx.reply("Unknown group error!");
				return;
			}

			// Retrieve chat member information
			const chatMember = await ctx.api.getChatMember(chatId, userId || 0);
			if (
				chatMember.status == "administrator" ||
				chatMember.status == "creator"
			) {
				ctx.reply(await summarizeRaid(chatId));
			}
		} catch (error) {
			console.log(error);
			ctx.reply("Something went wrong!");
		}
	})
	.text("Document", (ctx) => {
		const keyboard = new InlineKeyboard().url(
			"Visit Website",
			"https://docs.raidsharksbot.com/",
		);

		ctx.reply("Welcome! Click the button below to visit our website.", {
			reply_markup: keyboard,
		});
	})
	.text("Customize", (ctx) => ctx.reply("You should input retweet counts!"))
	.row();
