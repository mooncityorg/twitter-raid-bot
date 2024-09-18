import axios from "axios";
import { env } from "node:process";
import { config as dotenv } from "dotenv";
import { Reply, ReplyItem, Retweet, RetweetItem } from "../../type.js";

dotenv(); // Load from .env file
const bearerToken = env["BEARER_TOKEN"];

export const getRetweets = async (
	id: string | undefined,
	lastFetchTime: string,
): Promise<Retweet> => {
	if (id == undefined) return { status: 500, datas: [] };
	// const options = {
	// 	method: "GET",
	// 	url: "https://twitter-api45.p.rapidapi.com/retweets.php",
	// 	params: {
	// 		id: id,
	// 	},
	// 	headers: {
	// 		"x-rapidapi-key": rapidApiKey,
	// 		"x-rapidapi-host": "twitter-api45.p.rapidapi.com",
	// 	},
	// };

	// try {
	// 	const response = await axios.request(options);
	// 	console.log(response.data);
	// 	const status = response.data.status;
	// 	if (status == "active")
	// 		return {
	// 			count: response.data.retweets.length,
	// 			datas: response.data.retweets,
	// 		};
	// 	return { count: -1, datas: [] };
	// } catch (error) {
	// 	console.error(error);
	// 	return { count: -1, datas: [] };
	// }
	const options = {
		method: "GET",
		url: `https://api.x.com/2/tweets/${id}/retweets`,
		params: {
			"tweet.fields": "username,created_at",
		},
		headers: {
			Authorization: `Bearer ${bearerToken}`,
		},
		data: null
	};

	try {
		const fetchTime = new Date(lastFetchTime);
		console.log("🚀 ~ fetchTime:", fetchTime);
		const response = await axios.request(options);
		const status = response.status;
		let returnDatas: any[];
		if (status == 200) {
			const retweets = response.data.data;
			returnDatas = retweets.filter((retweet: any) => {
				const retweeted_at = new Date(retweet.created_at);
				return retweeted_at > fetchTime;
			});
			const retweetData: RetweetItem[] = returnDatas.map((item) => ({
				id: item.id,
				username: item.username,
				created_at: item.created_at,
			}));
			return {
				status: status,
				datas: retweetData,
			};
		} else if (status == 429) {
			return {
				status: status,
				datas: [],
			};
		}
		return { status: 500, datas: [] };
	} catch (error) {
		console.error(error);
		return { status: -1, datas: [] };
	}
};

export const getReplies = async (
	id: string | undefined,
	lastFetchTime: string,
): Promise<Reply> => {
	if (id == undefined) return { status: 500, datas: [] };

	const options = {
		method: "GET",
		url: `https://api.x.com/2/tweets/search/recent`,
		params: {
			"tweet.fields": "username,created_at",
			query: `conversation_id:${id}`,
		},
		headers: {
			Authorization: `Bearer ${bearerToken}`,
		},
	};

	try {
		const fetchTime = new Date(lastFetchTime);
		const response = await axios.request(options);
		const status = response.status;
		let returnDatas: any[] = [];
		if (status == 200) {
			const tweets = response.data.data;
			if (tweets) {
				returnDatas = tweets.filter((retweet: any) => {
					const replied_at = new Date(retweet.created_at);
					return replied_at > fetchTime;
				});
			}
			const replyData: ReplyItem[] = returnDatas.map((item) => ({
				id: item.id,
				username: item.username,
				created_at: item.created_at,
			}));
			return {
				status: status,
				datas: replyData,
			};
		} else if (status == 429) {
			return {
				status: status,
				datas: [],
			};
		}
		return { status: 500, datas: [] };
	} catch (error) {
		return { status: -1, datas: [] };
	}
};
