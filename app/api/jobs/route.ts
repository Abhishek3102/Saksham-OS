import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Job from "@/models/Job";

export async function GET() {
    try {
        await dbConnect();
        const jobs = await Job.find({}).sort({ postedAt: -1 });
        return NextResponse.json(jobs);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
