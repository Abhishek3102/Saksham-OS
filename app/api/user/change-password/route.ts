import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import OTP from '@/models/OTP';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { phone, otp, newPassword } = await req.json();

        if (!phone || !otp || !newPassword) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        // 1. Verify OTP
        const otpRecord = await OTP.findOne({ phone });

        if (!otpRecord) {
            return NextResponse.json({ message: 'OTP not found or expired' }, { status: 400 });
        }

        if (otpRecord.otp !== otp) {
            return NextResponse.json({ message: 'Invalid OTP' }, { status: 400 });
        }

        // 2. Find User
        const user = await User.findOne({ phone });
        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        // 3. Hash New Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // 4. Update Password
        user.password = hashedPassword;
        await user.save();

        // 5. Delete OTP (Optional but recommended for security)
        await OTP.deleteOne({ _id: otpRecord._id });

        return NextResponse.json({ success: true, message: 'Password changed successfully' });

    } catch (error: any) {
        console.error('Password change error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
