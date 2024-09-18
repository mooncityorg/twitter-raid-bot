import { CommandContext } from "grammy";
import { MyContext } from "../my-context.js";
import Raid from "../../model/Raid.js";
import Point from "../../model/Point.js";
import { resumeMenu } from "../menu/resume.js";
// import { summarizeRaid } from "../../utils.js";

export const ResumeCommand = async (ctx: CommandContext<MyContext>) => {
	try {
		// console.log(await ctx.chatMembers.getChatMember());
		const userId = await ctx.from?.id;
		const chatId = ctx.chat.id;

		// Retrieve chat member information
		const chatMember = await ctx.api.getChatMember(chatId, userId || 0);
		if (
			chatMember.status == "administrator" ||
			chatMember.status == "creator"
		) {
			// ctx.reply(await summarizeRaid(chatId), {
			// 	reply_to_message_id: ctx.message?.message_id,
			// });
			const raid = await Raid.findOne({ groupId: chatId, isActive: true });
			const raidId = raid?._id;
			const results = await Point.aggregate([
				{
					$match: {
						raidId,
					},
				},
				{
					$group: {
						_id: "$item",
						totalMarks: {
							$sum: "$marks",
						},
						count: {
							$sum: 1,
						},
					},
				},
			]);
			let likes = 0;
			let retweets = 0;
			let replies = 0;
			let smashes = 0;
			let totalPoints = 0;
			for (let i = 0; i < results.length; i++) {
				totalPoints += results[i].totalMarks;
				switch (results[i]._id) {
					case 1: {
						likes = results[i].count;
						break;
					}
					case 2: {
						retweets = results[i].count;
						break;
					}
					case 3: {
						replies = results[i].count;
						break;
					}
					case 4: {
						smashes = results[i].count;
						break;
					}
					default:
						break;
				}
			}
			ctx.reply(
				`✨Raid Engagement Summary\nLikes: ${likes}\n🔁Retweets Gained: ${retweets}\n💬Replies Made: ${replies}\n🔨 Smashes Hit: ${smashes}\n- 🎯 ${totalPoints} Points of impact`,
				{
					reply_markup: resumeMenu,
				},
			);
		} else {
			ctx.reply("Only admin can execute this command!");
		}
	} catch (error) {
		console.error(error);
		ctx.reply("Api fetch error!", {
			reply_to_message_id: ctx.message?.message_id,
		});
	}
};
