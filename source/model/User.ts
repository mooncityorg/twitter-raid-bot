import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
	name: { type: String, required: true },
	userId: { type: String, required: true },
	role: { type: Number, required: true, default: 0 },
	avatar: { type: String },
	customBotName: { type: String, required: true, default: "SolRaidBot" },
	customBotProfilePicture: { type: String },
	customStartAnimation: { type: String },
	customEndAnimation: { type: String },
	customEmoji: { type: String },
	walletAddress: { type: String },
	xAccount: { type: String },
	verifyCode: { type: String },
	isVerify: { type: Boolean, required: true, default: false },
	// commentCnt: { type: Number, required: true, default: 0 },
	// bookmarkCnt: { type: Number, required: true, default: 0 },
	// retweetCnt: { type: Number, required: true, default: 0 },
	// totalPoint: { type: Number, required: true, default: 0 },
	lastLogin: { type: Date, required: true, default: Date.now },
});

const User = mongoose.model("User", UserSchema);

export default User;
