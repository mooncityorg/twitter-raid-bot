import mongoose from "mongoose";

const TweetSchema = new mongoose.Schema({
	raidId: { type: String, required: true },
	name: { type: String, required: true },
	screenName: { type: String, required: true },
	avatar: { type: String },
	content: { type: String, required: true },
	shortContent: { type: String, required: true },
	createdAt: { type: String, required: true },
	likes: { type: Number, required: true, default: 0 },
	retweets: { type: Number, required: true, default: 0 },
	replies: { type: Number, required: true, default: 0 },
	bookmarks: { type: Number, required: true, default: 0 },
	status: { type: Number, required: true, default: 0 }, // 0: initial 1: raided
	date: { type: Date, required: true, default: Date.now },
});

const Tweet = mongoose.model("Tweet", TweetSchema);

export default Tweet;
