import mongoose from "mongoose";

const EventSchema = new mongoose.Schema({
    event_id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    start_time: { type: String, required: true },
    end_time: { type: String, required: true },
    priority: { type: String, enum: ["High", "Medium", "Low"], default: "Medium" },
    event_type: { type: String, required: true },
    description: { type: String },
    userId: { type: String, required: true }
}, { timestamps: true });

export default mongoose.models.Event || mongoose.model("Event", EventSchema);
