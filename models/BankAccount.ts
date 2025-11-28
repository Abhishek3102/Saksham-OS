import mongoose from "mongoose";

const BankAccountSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    accountNumber: { type: String, required: true },
    ifsc: { type: String, required: true },
    bankName: { type: String, required: true },
    balance: { type: Number, default: 0 },
    isLinked: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.models.BankAccount || mongoose.model("BankAccount", BankAccountSchema);
