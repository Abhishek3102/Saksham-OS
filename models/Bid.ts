import mongoose from "mongoose";

const BidSchema = new mongoose.Schema({
    bid_id: { type: String, required: true, unique: true },
    job_id: { type: String, required: true },
    freelancer_id: { type: String, required: true },
    freelancer_name: { type: String },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    proposal_text: { type: String },
    estimated_days: { type: Number },
    status: { type: String, enum: ["Pending", "Accepted", "Rejected"], default: "Pending" },
    created_at: { type: String }
}, { timestamps: true });

export default mongoose.models.Bid || mongoose.model("Bid", BidSchema);
