import mongoose from 'mongoose';

const OTPSchema = new mongoose.Schema({
    phone: {
        type: String,
        required: true,
        unique: true, // One active OTP per phone
    },
    otp: {
        type: String,
        required: true,
    },
    attempts: {
        type: Number,
        default: 0,
    },
    blockedUntil: {
        type: Date,
        default: null,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300, // OTP expires in 5 minutes
    },
});

export default mongoose.models.OTP || mongoose.model('OTP', OTPSchema);
