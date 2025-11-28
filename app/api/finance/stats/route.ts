import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Transaction from "@/models/Transaction";

export async function GET() {
    try {
        await dbConnect();
        const transactions = await Transaction.find({});

        let totalRevenue = 0;
        transactions.forEach((txn: any) => {
            if (txn.type === 'CREDIT') {
                const amount = Number(txn.amount);
                if (!isNaN(amount)) {
                    totalRevenue += amount;
                }
            }
        });

        const taxSaved = totalRevenue * 0.20;

        return NextResponse.json({
            revenue: totalRevenue,
            taxSaved: taxSaved
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
