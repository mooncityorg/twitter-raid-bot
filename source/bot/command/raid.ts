import { CommandContext } from "grammy";
import { env } from "node:process";
import { config as dotenv } from "dotenv";
import axios from "axios";
import { MyContext } from "../my-context.js";
import { getTweetIdOfUrl, isValidTweetId } from "../../utils.js";
import Raid from "../../model/Raid.js";
import Tweet from "../../model/Tweet.js";
import { raidMenu } from "../menu/raid.js";
// import { likingUsers } from "../../api/twitter/liking_users.js";

dotenv(); // Load from .env file
const rapidApiKey = env["RAPID_API_KEY"];
export const RaidCommand = async (ctx: CommandContext<MyContext>) => {
	if (ctx.match == "") {
		ctx.reply(
			'No valid tweet URL found. Make sure you typed the command in the following format: "/raid https://x.com/JamesjamMoon/status/1813452079077421478"',
			{
				reply_to_message_id: ctx.message?.message_id,
			},
		);
		return;
	}
	const tweetId = getTweetIdOfUrl(ctx.match);
	if (tweetId == "" || undefined) {
		ctx.reply("Invalid twitter link!", {
			reply_to_message_id: ctx.message?.message_id,
		});
		return;
	}
	// await likingUsers(tweetId as string);
	// return;
	try {
		const isValid = await isValidTweetId(tweetId);
		if (!isValid) {
			ctx.reply("Invalid twitter link!", {
				reply_to_message_id: ctx.message?.message_id,
			});
			return;
		}
	} catch (error) {
		ctx.reply("Rapid twitter api have some problems!", {
			reply_to_message_id: ctx.message?.message_id,
		});
		return;
	}

	try {
		// Get the user ID of the message sender
		const userId = await ctx.from?.id;
		// Get the chat ID
		const chatId = ctx.chat.id;

		// Retrieve chat member information
		const chatMember = await ctx.api.getChatMember(chatId, userId || 0);
		if (
			chatMember.status === "administrator" ||
			chatMember.status === "creator"
		) {
			Raid.findOne({ groupId: chatId, isActive: true })
				.then((raid) => {
					if (raid) {
						if (raid.twitterLink == ctx.match) {
							ctx.reply("The raid has already begun in this group!", {
								reply_to_message_id: ctx.message?.message_id,
							});
						} else {
							ctx.reply(
								"Another raid has already begun in this group!\nIf you want to raid your link, execute `/resume` command",
								{
									reply_to_message_id: ctx.message?.message_id,
								},
							);
						}
					} else {
						Raid.findOne({ groupId: chatId, twitterLink: ctx.match })
							.then((raid) => {
								if (raid) {
									raid.isActive = true;
									raid
										.save()
										.then(async () => {
											ctx.reply("The raid is restarted!");
											const replyText = `🦈Raid bot sensed prey…🦈\n\n🎯1 SMASH\n\n🔥RAID NOW🔥\n\nPowered by [Mooncity](https://t.me/+mooncity0x)\n\nAd: 🚀 [Join $PULSE Airdrop Now](https://mooncity.io)\\!`;
											ctx.reply(replyText, {
												parse_mode: "MarkdownV2",
												reply_markup: raidMenu,
											});
										})
										.catch(async (err) => {
											console.log(err);
											ctx.reply("Database have problems.\nTry again later!", {
												reply_to_message_id: ctx.message?.message_id,
											});
										});
								} else {
									const newRaid = new Raid();
									newRaid.twitterLink = ctx.match;
									newRaid.groupId = ctx.chat.id.toString();
									newRaid.admin = ctx.from?.username || "";
									newRaid.isActive = true;
									newRaid
										.save()
										.then(async (updatedRaid) => {
											const options = {
												method: "GET",
												url: "https://twitter-api45.p.rapidapi.com/tweet.php",
												params: {
													id: tweetId,
												},
												headers: {
													"x-rapidapi-key": rapidApiKey,
													"x-rapidapi-host": "twitter-api45.p.rapidapi.com",
												},
											};

											try {
												const response = await axios.request(options);
												const tweetDetail = response.data;
												if (tweetDetail) {
													const newTweet = new Tweet();
													newTweet.raidId = updatedRaid._id.toString();
													newTweet.name = tweetDetail.author.name;
													newTweet.screenName = tweetDetail.author.screen_name;
													newTweet.avatar = tweetDetail.author.image;
													newTweet.content = tweetDetail.text;
													newTweet.shortContent = tweetDetail.display_text;
													newTweet.createdAt = tweetDetail.created_at;
													newTweet.likes = tweetDetail.likes;
													newTweet.retweets = tweetDetail.retweets;
													newTweet.replies = tweetDetail.replies;
													newTweet.bookmarks = tweetDetail.bookmarks;
													await newTweet.save();
													// ctx.reply(
													// 	`${tweetDetail.display_text}\nDate: ${tweetDetail.created_at}\nCreator: ${tweetDetail.author.name}\nFavourite: ${tweetDetail.likes}\nReply: ${tweetDetail.replies}\nRetweet: ${tweetDetail.retweets}\nBookmark: ${tweetDetail.bookmarks}`,
													// 	{
													// 		reply_to_message_id: ctx.message?.message_id,
													// 	},
													// );
													const replyText = `🦈Raid bot sensed prey…🦈\n\n🎯1 SMASH\n\n🔥RAID NOW🔥\n\nPowered by [Mooncity](https://t.me/mooncity0x)\n\nAd: 🚀 [Join $PULSE Airdrop Now](https://mooncity.io)\\!`;
													ctx.reply(replyText, {
														parse_mode: "MarkdownV2",
														reply_markup: raidMenu,
													});
												}
											} catch (error) {
												console.error(error);
												ctx.reply("Api fetch error!", {
													reply_to_message_id: ctx.message?.message_id,
												});
												return;
											}
											ctx.reply("Raid is start!", {
												reply_to_message_id: ctx.message?.message_id,
											});
										})
										.catch((err) => {
											console.log(err);
											ctx.reply("Database have problems.\nTry again later.", {
												reply_to_message_id: ctx.message?.message_id,
											});
										});
								}
							})
							.catch((err) => {
								ctx.reply(err.data, {
									reply_to_message_id: ctx.message?.message_id,
								});
							});
					}
				})
				.catch((err) => {
					console.log(err);
					ctx.reply("Database have problems.\nTry again later!", {
						reply_to_message_id: ctx.message?.message_id,
					});
				});
		} else {
			ctx.reply("Only admin can execute this command", {
				reply_to_message_id: ctx.message?.message_id,
			});
		}
	} catch (error) {
		console.error("Error getting chat member info:", error);
		ctx.reply("Sorry, something went wrong.", {
			reply_to_message_id: ctx.message?.message_id,
		});
	}
};
