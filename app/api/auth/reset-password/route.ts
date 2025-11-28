import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import OTP from '@/models/OTP';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
    await dbConnect();
    const { phone, otp, newPassword } = await req.json();

    // 1. Verify OTP
    const otpRecord = await OTP.findOne({ phone });
    if (!otpRecord || otpRecord.otp !== otp) {
        return NextResponse.json({ message: 'Invalid or expired OTP' }, { status: 400 });
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

    // 5. Delete OTP
    await OTP.deleteOne({ phone });

    return NextResponse.json({ message: 'Password reset successfully' });
}
