// import axios from "axios";
// import { env } from "node:process";
// import { config as dotenv } from "dotenv";
import { Request, Response, Router } from "express";
// import Raid from "../../model/Raid.js";
// import { getTweetIdOfUrl } from "../../utils.js";
import Tweet from "../../model/Tweet.js";
import Point from "../../model/Point.js";
import Raid from "../../model/Raid.js";
import User from "../../model/User.js";
// import { check, validationResult } from "express-validator";

// dotenv(); // Load from .env file
// const rapidApiKey = env["RAPID_API_KEY"];
// Create a new instance of the Express Router
const router = Router();

router.get("/tweet", async (req: Request, res: Response) => {
	const url = req.url;
	console.log(url);
	try {
		const recentTweet = await Tweet.findOne().sort({ date: -1 }).lean();
		if (recentTweet) {
			const raid = await Raid.findById(recentTweet.raidId);
			res.json({ ...recentTweet, link: raid?.twitterLink });
		} else {
			res.status(404).json({ error: true, content: "Not found" });
		}
	} catch (error) {
		res.status(500).json({ error: true, content: "Database fetch error!" });
	}
});

router.get("/summary", async (req: Request, res: Response) => {
	const url = req.url;
	console.log(url);
	try {
		const recentTweet = await Tweet.findOne().sort({ date: -1 });
		if (recentTweet) {
			const { raidId } = recentTweet;
			Point.find({ raidId }).then((points) => {
				res.json(
					points.map((point) => ({
						username: point.username,
						item: point.item,
					})),
				);
			});
		} else {
			res.status(404).json({ error: true, content: "Not found" });
		}
	} catch (error) {
		res.status(500).json({ error: true, content: "Database fetch error!" });
	}
});

router.post("/winners", async (req: Request, res: Response) => {
	const { period } = req.body;
	console.log("🚀 ~ router.post ~ period:", period)
	try {
		const recentTweet = await Tweet.findOne().sort({ date: -1 });
		if (recentTweet) {
			const { raidId } = recentTweet;
			const endDate = new Date();
			const startDate = new Date();
			switch (period) {
				// a day
				case 0: {
					startDate.setDate(endDate.getDate() - 1);
					break;
				}
				// a week
				case 1: {
					startDate.setDate(endDate.getDate() - 7);
					break;
				}
				// a month
				case 2: {
					startDate.setMonth(endDate.getMonth() - 1);
					break;
				}
				default:
					break;
			}
			console.log("🚀 ~ router.post ~ startDate:", startDate);
			const result = await Point.aggregate([
				{
					$match: {
						raidId,
						$expr: {
							$and: [
								{
									$cond: {
										if: { $ne: [period, 3] }, // If period is not 3
										then: {
											$and: [
												{ $gte: ["$lastFetch", startDate] }, // Apply date filter
												{ $lte: ["$lastFetch", endDate] },
											],
										},
										else: true, // If period is 3, always match (no date filter)
									},
								},
							],
						},
					},
				},
				{
					$group: {
						_id: "$username",
						totalMarks: {
							$sum: "$marks",
						},
						count: {
							$sum: 1,
						},
					},
				},
				{
					$lookup: {
						from: "users",
						localField: "_id",
						foreignField: "xAccount",
						as: "result",
					},
				},
				{
					$unwind: {
						path: "$result",
						preserveNullAndEmptyArrays: true,
					},
				},
				{
					$project: {
						username: 1,
						totalMarks: 1,
						"result.name": 1,
						"result.avatar": 1,
					},
				},
				{
					$addFields: {
						name: "$result.name",
						avatar: "$result.avatar",
					},
				},
				{
					$project: {
						result: 0,
					},
				},
			]);
			res.json(result);
		} else {
			res.status(404).json({ error: true, content: "Not found" });
		}
	} catch (err) {
		res.status(500).json({ error: true, content: "Internal server error" });
	}
});

router.post("/smash", async (req: Request, res: Response) => {
	const { userId, link } = req.body;
	try {
		const raid = await Raid.findOne({ twitterLink: link, isActive: true });
		if (raid) {
			const newPoint = new Point();
			const user = await User.findOne({ userId });
			if (user) {
				newPoint.raidId = raid._id.toString();
				newPoint.username = user.xAccount as string;
				newPoint.marks = 1;
				newPoint.item = 4;
				newPoint.lastFetch = new Date();
				newPoint
					.save()
					.then((point) => {
						res.json(point);
					})
					.catch((err) => res.status(500).json(err));
			}
		}
	} catch (error) {
		res.status(500).json({ error: true, content: "Internal server error" });
	}
});

export default router;
