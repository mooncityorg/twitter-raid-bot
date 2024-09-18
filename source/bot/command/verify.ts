import { CommandContext } from "grammy";
import { MyContext } from "../my-context.js";
import User from "../../model/User.js";

export const VerifyCommand = async (ctx: CommandContext<MyContext>) => {
	const user = await User.findOne({
		name: ctx.message?.from.username as string,
	});
	if (user && user.xAccount) {
		if (user.isVerify == true) {
			await ctx.reply("You are already verified.", {
				reply_to_message_id: ctx.message?.message_id,
			});
		} else {
			ctx.session = { userReaction: "input verify code" };
			await ctx.reply(
				"I sent verify code to your x-account by dm.\nInput verify code.",
				{
					reply_to_message_id: ctx.message?.message_id,
				},
			);
		}
	} else {
		ctx.session = { userReaction: "input x-account" };
		await ctx.reply("Input x-account's username", {
			reply_to_message_id: ctx.message?.message_id,
		});
	}
};
