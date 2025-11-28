import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true }, // Keeping 'id' to match JSON for now, but usually _id
    title: { type: String, required: true },
    dueDate: { type: String },
    estHours: { type: Number },
    done: { type: Boolean, default: false },
    priority: { type: String, default: "Medium" },
    userId: { type: String, required: true },
    relatedJobId: { type: String }
}, { timestamps: true });

export default mongoose.models.Task || mongoose.model("Task", TaskSchema);
