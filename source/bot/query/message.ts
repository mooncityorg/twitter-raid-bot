import User from "../../model/User.js";
import { getAvatar, isValidXAccount } from "../../utils.js";

export const MessageQuery = async (ctx: any) => {
	const userReaction = ctx.session.userReaction as string;
	const username = ctx.message.from.username as string;
	switch (userReaction) {
		case "input x-account": {
			const xAccount = ctx.message.text;
			if ((await isValidXAccount(xAccount)) == false) {
				await ctx.reply("Your x-account is invalid.\nInput x-account again.", {
					reply_to_message_id: ctx.message.message_id,
				});
				break;
			}
			const userId = await ctx.from?.id;
			const chatId = ctx.chat.id;
			const chatMember = await ctx.api.getChatMember(chatId, userId || 0);
			let userRole = 0;
			if (
				chatMember.status === "administrator" ||
				chatMember.status === "creator"
			) {
				userRole = 1;
			}
			const user = await User.findOne({ name: username });
			if (user) {
				user.xAccount = xAccount;
				user.role = userRole;
				user
					.save()
					.then(async () => {
						ctx.session = { userReaction: "input verify code" };
						await ctx.reply(
							"I sent verify code to your x-account by dm.\nInput verify code.",
							{
								reply_to_message_id: ctx.message.message_id,
							},
						);
					})
					.catch(async (err) => {
						console.log(err);
						await ctx.reply("Database have problem.\nTry again later", {
							reply_to_message_id: ctx.message.message_id,
						});
					});
			} else {
				const newUser = new User();
				newUser.name = username;
				newUser.userId = userId.toString();
				newUser.walletAddress = "";
				newUser.xAccount = xAccount;
				newUser.role = userRole;
				newUser.avatar = await getAvatar(userId);
				newUser
					.save()
					.then(async () => {
						ctx.session = { userReaction: "input verify code" };
						await ctx.reply(
							"I sent verify code to your x-account by dm.\nInput verify code.",
							{
								reply_to_message_id: ctx.message.message_id,
							},
						);
					})
					.catch(async (err) => {
						console.log(err);
						await ctx.reply("Database have problem.\nTry again later", {
							reply_to_message_id: ctx.message.message_id,
						});
					});
			}
			break;
		}
		case "input verify code": {
			const verifyCode = ctx.message.text;
			const username = ctx.message.from.username;
			User.findOne({ name: username }).then((user) => {
				if (user == null || user.xAccount == null) {
					ctx.reply("User not found.", {
						reply_to_message_id: ctx.message.message_id,
					});
					return;
				}
				if (user.verifyCode == verifyCode) {
					user.isVerify = true;
					ctx.session = { userReaction: "Verification is success" };
					ctx.reply("Verification is success.", {
						reply_to_message_id: ctx.message.message_id,
					});
				} else {
					ctx.reply("Verification is failed.\nInput verification code again.", {
						reply_to_message_id: ctx.message.message_id,
					});
				}
			});
			break;
		}
		case "Verification is success": {
			ctx.reply(
				"Verification is already success.\nThe raid is already underway",
				{
					reply_to_message_id: ctx.message.message_id,
				},
			);
			break;
		}
		default:
			break;
	}
};
