import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema({
    transaction_id: { type: String, required: true, unique: true },
    user_id: { type: String, required: true },
    related_invoice_id: { type: String },
    related_job_id: { type: String },
    transaction_type: { type: String, enum: ["DEBIT", "CREDIT"], required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    description: { type: String },
    merchant_name: { type: String },
    transaction_category: { type: String },
    date: { type: Date },
    balance_after_transaction: { type: Number },
    payment_method: { type: String },
    geo_location: { type: String },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

export default mongoose.models.Transaction || mongoose.model("Transaction", TransactionSchema);
