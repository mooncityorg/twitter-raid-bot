import mongoose from "mongoose";

const GroupSchema = new mongoose.Schema({
	name: { type: String, required: true },
	groupId: { type: Number, required: true },
	twitterLink: { type: String, required: true },
	admin: { type: String, required: true },
	isActive: { type: Boolean, required: true, default: true },
});

const Group = mongoose.model("Group", GroupSchema);

export default Group;
