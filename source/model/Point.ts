import mongoose from "mongoose";

const PointSchema = new mongoose.Schema({
	raidId: { type: String, required: true },
	postId: { type: String, required: true },
	username: { type: String, required: true },
	item: { type: Number, required: true }, // 1: like, 2: retweet, 3: reply, 4: smash
	marks: { type: Number, required: true },
	lastFetch: { type: Date, required: true, default: Date.now() },
});

const Point = mongoose.model("Point", PointSchema);

export default Point;
