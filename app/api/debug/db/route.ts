import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Job from "@/models/Job";

export async function GET(req: Request) {
    try {
        await dbConnect();
        const url = new URL(req.url);
        const id = url.searchParams.get("id");

        if (id) {
            console.log(`Debug searching for ID: ${id}`);
            const job = await Job.findById(id);
            console.log(`Debug result:`, job);
            return NextResponse.json({ found: !!job, job });
        }

        const jobs = await Job.find({}, "_id title createdAt").sort({ createdAt: -1 }).limit(20);

        return NextResponse.json({
            count: jobs.length,
            jobs: jobs.map((j: any) => ({
                id: j._id.toString(),
                title: j.title,
                createdAt: j.createdAt
            }))
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
