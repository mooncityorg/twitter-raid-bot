import mongoose from "mongoose";

const MarkSchema = new mongoose.Schema({
	id: { type: Number, required: true },
	mark: { type: Number, required: true, default: 0 },
});

const Mark = mongoose.model("Mark", MarkSchema);

export default Mark;
