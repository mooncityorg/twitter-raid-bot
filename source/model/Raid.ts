import mongoose from "mongoose";

const RaidSchema = new mongoose.Schema({
	// username: { type: String, required: true },
	groupId: { type: String, required: true },
	twitterLink: { type: String, required: true },
	admin: { type: String, required: true },
	isActive: { type: Boolean, required: true },
	actived_at: { type: Date, required: true, default: Date.now() },
});

const Raid = mongoose.model("Raid", RaidSchema);

export default Raid;
