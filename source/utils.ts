import axios from "axios";
import { env } from "node:process";
import { config as dotenv } from "dotenv";
import Raid from "./model/Raid.js";
import User from "./model/User.js";
import { getReplies, getRetweets } from "./api/twitter/tweets.js";
import Point from "./model/Point.js";
import Mark from "./model/Mark.js";
// import Point from "./model/Point.js";

dotenv(); // Load from .env file
const rapidApiKey = env["RAPID_API_KEY"];
const botToken = env["BOT_TOKEN"];

export const isEmptyObject = (obj: Record<string, any>): boolean => {
	return Object.keys(obj).length === 0;
};

export const getTweetIdOfUrl = (url: string): string | undefined => {
	const parts = url.split("/");
	return parts[parts.length - 1];
};

export const isValidTweetId = async (
	id: string | undefined,
): Promise<boolean> => {
	if (id == undefined) return false;
	const options = {
		method: "GET",
		url: "https://twitter-api45.p.rapidapi.com/tweet.php",
		params: {
			id: id,
		},
		headers: {
			"x-rapidapi-key": rapidApiKey,
			"x-rapidapi-host": "twitter-api45.p.rapidapi.com",
		},
	};

	try {
		const response = await axios.request(options);
		const status = response.data.status;
		if (status == "active") return true;
		return false;
	} catch (error) {
		console.error(error);
		return false;
	}
};

export const isValidXAccount = async (
	username: string | undefined,
): Promise<boolean> => {
	if (username == undefined) return false;
	console.log("🚀 ~ username:", username);
	console.log("🚀 ~ options.headers.rapidApiKey:", rapidApiKey);
	const options = {
		method: "GET",
		url: "https://twitter-api45.p.rapidapi.com/screenname.php",
		params: {
			screenname: username,
		},
		headers: {
			"x-rapidapi-key": rapidApiKey,
			"x-rapidapi-host": "twitter-api45.p.rapidapi.com",
		},
	};

	try {
		const response = await axios.request(options);
		console.log(response.data);
		const status = response.data.status;
		if (status == "active") return true;
		return false;
	} catch (error) {
		console.error(error);
		return false;
	}
};

export const isChatMember = async (
	chatId: string | undefined,
	userId: string | undefined,
): Promise<boolean> => {
	try {
		const url = `https://api.telegram.org/bot${botToken}/getChatMember?chat_id=${chatId}&user_id=${userId}`;

		const response = await axios.get(url);
		return response.data.ok;
	} catch (error) {
		console.log(error)
		return false;
	}
};

export const updateRaid = () => {
	// Retrieve currently active raid
	try {
		const raidUsers: string[] = [];
		Raid.findOne({ isActive: true }).then((raid) => {
			if (raid) {
				const { _id, groupId, twitterLink } = raid;
				User.find({ isVerify: true }).then(async (users) => {
					if (users == null) return;
					for (let i = 0; i < users.length; i++) {
						if (await isChatMember(groupId, users[i]?.userId)) {
							raidUsers.push(users[i]?.xAccount as string);
						}
					}
					await updateRetweetData(_id.toString(), twitterLink, raidUsers);
					await updateReplyData(_id.toString(), twitterLink, raidUsers);
				});
			}
		});
	} catch (error) {
		console.log(error)
	}
};

export const summarizeRaid = async (chatId: number): Promise<string> => {
	try {
		const raid = await Raid.findOne({ groupId: chatId, isActive: true });
		if (raid?.isActive == undefined || raid == null) {
			return "There is no active raid.";
		}
		raid.isActive = false;
		raid.save();

		const tweetId = getTweetIdOfUrl(raid.twitterLink);
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
		const response = await axios.request(options);
		const tweetDetail = response.data;
		return `${tweetDetail.text}\nDate: ${tweetDetail.created_at}\nCreator: ${tweetDetail.author.name}\nFavourite: ${tweetDetail.likes}\nReply: ${tweetDetail.replies}\nRetweet: ${tweetDetail.retweets}\nBookmark: ${tweetDetail.bookmarks}`;
	} catch (error) {
		console.error(error);
		return "Api fetch error!";
	}
};

export const updateRetweetData = async (
	raidId: string,
	twitterLink: string,
	raidUsers: string[],
) => {
	try {
		let fetched_at: string;
		const latestPoint = await Point.findOne({
			raidId,
			item: 2,
		}).sort({
			lastFetch: -1,
		});
		if (latestPoint == null) {
			// fetched_at = new Date().toString();
			const raid = await Raid.findById(raidId);
			fetched_at = raid?.actived_at.toString() as string;
		} else {
			fetched_at = latestPoint?.lastFetch.toString();
		}
		console.log("🚀 ~ fetched_at:", fetched_at);
		const retweetData = await getRetweets(
			getTweetIdOfUrl(twitterLink),
			fetched_at,
		);
		const status = retweetData.status;
		const retweets = retweetData.datas;
		console.log("🚀 ~ User.find ~ retweets:", retweets);
		if (status == 200) {
			for (let i = 0; i < retweets.length; i++) {
				const focusUser = retweets[i]?.username;
				console.log("🚀 ~ User.find ~ focusUser:", focusUser);
				if (focusUser == undefined) continue;
				if (raidUsers.includes(focusUser as string)) {
					const fetchedPoint = await Point.findOne({ postId: retweets[i]?.id });
					if (fetchedPoint) return;
					const newPoint = new Point();
					newPoint.raidId = raidId.toString();
					newPoint.postId = retweets[i]?.id as string;
					newPoint.username = focusUser;
					const mark = await Mark.findOne({ id: 2 });
					newPoint.marks = mark?.mark as number;
					newPoint.item = 2;
					await newPoint.save();
				}
			}
		}
	} catch (error) {
		console.log(error)
	}
};

export const updateReplyData = async (
	raidId: string,
	twitterLink: string,
	raidUsers: string[],
) => {
	try {
		let fetched_at: string;
		const latestPoint = await Point.findOne({
			raidId,
			item: 3,
		}).sort({
			lastFetch: -1,
		});
		if (latestPoint == null) {
			// fetched_at = Date.now().toString();
			const raid = await Raid.findById(raidId);
			fetched_at = raid?.actived_at.toString() as string;
		} else {
			fetched_at = latestPoint?.lastFetch.toString();
		}
		const replyData = await getReplies(getTweetIdOfUrl(twitterLink), fetched_at);
		const status = replyData.status;
		const replies = replyData.datas;
		console.log("🚀 ~ User.find ~ replies:", replies);
		if (status == 200) {
			for (let i = 0; i < replies.length; i++) {
				const focusUser = replies[i]?.username;
				console.log("🚀 ~ User.find ~ focusUser:", focusUser);
				if (focusUser == undefined) continue;
				if (raidUsers.includes(focusUser as string)) {
					const fetchedPoint = await Point.findOne({ postId: replies[i]?.id });
					if (fetchedPoint) return;
					const newPoint = new Point();
					newPoint.raidId = raidId.toString();
					newPoint.postId = replies[i]?.id as string;
					newPoint.username = focusUser;
					newPoint.item = 3;
					const mark = await Mark.findOne({ id: 3 });
					newPoint.marks = mark?.mark as number;
					await newPoint.save();
				}
			}
		}
	} catch (error) {
		console.log(error)
	}
};

export const setMarks = async () => {
	try {
		const marks = [4, 3, 3, 2];
		for (let i = 1; i <= 4; i++) {
			const newMark = new Mark();
			newMark.id = i;
			newMark.mark = marks[i - 1] as number;
			await newMark.save();
		}
	} catch (error) {
		console.log(error)
		throw error;
	}
};

const getFilePath = async (token: string, fileId: string) => {
	try {
		const url = `https://api.telegram.org/bot${token}/getFile`;
		const response = await axios.get(url, { params: { file_id: fileId } });
		return response.data.result.file_path;
	} catch (error) {
		console.error("Error fetching file path:", error);
		throw error;
	}
};

const getAvatarUrl = (token: string, filePath: string) => {
	return `https://api.telegram.org/file/bot${token}/${filePath}`;
};

export const getAvatar = async (
	userId: number | undefined,
): Promise<string | null> => {
	if (userId == undefined) return null;
	try {
		const url = `https://api.telegram.org/bot${botToken}/getUserProfilePhotos`;
		const response = await axios.get(url, { params: { user_id: userId } });
		const profilePhotos = response.data;
		if (profilePhotos.result.total_count > 0) {
			const fileId =
				profilePhotos.result.photos[0][
					profilePhotos.result.photos[0].length - 1
				].file_id;
			const filePath = await getFilePath(botToken as string, fileId);
			const avatarUrl = getAvatarUrl(botToken as string, filePath);
			console.log("Avatar URL:", avatarUrl);
			return avatarUrl;
		} else {
			console.log("No profile photos found.");
			return null;
		}
	} catch (error) {
		console.log(error);
		return null;
	}
};
