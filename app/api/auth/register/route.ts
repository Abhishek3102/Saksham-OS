import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import OTP from '@/models/OTP';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
    await dbConnect();
    const { name, email, phone, password, role, otp } = await req.json();

    // 1. Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
        return NextResponse.json({ message: 'User with this email or phone already exists' }, { status: 400 });
    }

    // 2. Verify OTP
    const otpRecord = await OTP.findOne({ phone });
    if (!otpRecord || otpRecord.otp !== otp) {
        return NextResponse.json({ message: 'Invalid or expired OTP' }, { status: 400 });
    }

    // 3. Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Generate Custom IDs
    // Find the latest user to increment ID
    const lastUser = await User.findOne({}, {}, { sort: { 'createdAt': -1 } });

    let nextIdNum = 100; // Start from 100 to avoid collision with static CSV data (which goes up to ~50)
    if (lastUser && lastUser.userId) {
        const lastIdStr = lastUser.userId.replace('user_', '');
        const lastIdNum = parseInt(lastIdStr);
        if (!isNaN(lastIdNum)) {
            nextIdNum = lastIdNum + 1;
        }
    }

    const userId = `user_${nextIdNum.toString().padStart(3, '0')}`;
    let companyId = undefined;

    if (role === 'client') {
        // For simplicity, let's keep companyId sync with userId number or independent?
        // Let's make it independent or just use the same number for simplicity if they are the first user of that company.
        // But here we assume 1 user = 1 company for the "Client" role in this context.
        companyId = `company_${nextIdNum.toString().padStart(3, '0')}`;
    }

    // 5. Create User
    const user = await User.create({
        name,
        email,
        phone,
        password: hashedPassword,
        role,
        userId,
        companyId
    });

    // 6. Delete OTP
    await OTP.deleteOne({ phone });

    return NextResponse.json({
        message: 'User registered successfully',
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            userId: user.userId,
            companyId: user.companyId
        }
    });
}
