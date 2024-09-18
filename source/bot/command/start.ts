import { CommandContext } from "grammy";
import { MyContext } from "../my-context.js";
import { initMenu } from "../menu/initmenu.js";

export const StartCommand = (ctx: CommandContext<MyContext>) => {
	ctx.reply(
		`Experience the future of Telegram community engagement with SolRaidBot! Turn your raiding process into a game at no cost, and select from a wide array of features to customize your experience.

		Key features
		🏆 Leaderboard for top raiders
		📊 Start raids and analyze data

		Functions
		🎯 Adjust group targets
		🤝 Host joint raids with your partners
		🔒 Lock Chat to focus your community
		🔔 Show raid process notifications
		👁 Show X post preview
		🔄 Repost the raid message within the chat

		To get started, simply add @SolRaidBot to your group and start raiding!

		Need a quick guide? Click here (https://docs.solraidbot.com/quickguide)`,
		{
			reply_markup: initMenu,
		},
	);
};
