import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { runAgents } from "@/lib/agents-service";

export async function GET(req: Request) {
    try {
        const session: any = await getServerSession(authOptions as any);
        // For demo, allow running without session or use a default ID if needed
        // but ideally require session
        const userId = session?.user?.id || "user_100"; // Default to our demo freelancer

        const { actions, logs } = await runAgents(userId);

        return NextResponse.json({
            success: true,
            count: actions.length,
            actions,
            logs
        });

    } catch (error: any) {
        console.error("Agent Run Error:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
