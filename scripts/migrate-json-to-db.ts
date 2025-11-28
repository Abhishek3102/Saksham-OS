import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// Load env vars
dotenv.config({ path: ".env.local" });

import Job from "../models/Job";
import Invoice from "../models/Invoice";
import Event from "../models/Event";
import Task from "../models/Task";
import Bid from "../models/Bid";
import Notification from "../models/Notification";
import Transaction from "../models/Transaction";
import User from "../models/User";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error("Please define the MONGODB_URI environment variable inside .env.local");
    process.exit(1);
}

async function connectDB() {
    try {
        await mongoose.connect(MONGODB_URI!);
        console.log("Connected to MongoDB");
    } catch (err) {
        console.error("MongoDB connection error:", err);
        process.exit(1);
    }
}

function readJson(filename: string) {
    try {
        const filePath = path.join(process.cwd(), 'public', 'data', filename);
        if (fs.existsSync(filePath)) {
            return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        }
    } catch (e) {
        console.error(`Error reading ${filename}`, e);
    }
    return [];
}

async function migrate() {
    await connectDB();

    try {
        // 1. Jobs
        const jobs = readJson('dummy_job_feed_v3.json');
        console.log(`Found ${jobs.length} jobs.`);
        for (const j of jobs) {
            try {
                const exists = await Job.findOne({ job_id: j.job_id });
                if (!exists) {
                    await Job.create({
                        ...j,
                        clientId: j.client_id,
                        clientName: "Unknown Client",
                        budgetMin: j.budget_min,
                        budgetMax: j.budget_max,
                        experienceLevel: j.experience_level,
                        description: j.job_description,
                        postedAt: j.posted_at
                    });
                }
            } catch (err: any) {
                console.error(`Failed to migrate job ${j.job_id}:`, err.message);
            }
        }
        console.log("Jobs migrated.");

        // 2. Invoices
        const invoices = readJson('overdue_invoices_v3.json');
        console.log(`Found ${invoices.length} invoices.`);
        for (const inv of invoices) {
            try {
                const exists = await Invoice.findOne({ invoice_id: inv.invoice_id });
                if (!exists) {
                    await Invoice.create(inv);
                }
            } catch (err: any) {
                console.error(`Failed to migrate invoice ${inv.invoice_id}:`, err.message);
            }
        }
        console.log("Invoices migrated.");

        // 3. Events
        const events = readJson('calendar_events_v3.json');
        console.log(`Found ${events.length} events.`);
        for (const ev of events) {
            try {
                const exists = await Event.findOne({ event_id: ev.event_id });
                if (!exists) {
                    await Event.create({
                        ...ev,
                        userId: "user_100",
                        start_time: ev.start_time,
                        end_time: ev.end_time,
                        event_type: ev.event_type || "Personal"
                    });
                }
            } catch (err: any) {
                console.error(`Failed to migrate event ${ev.event_id}:`, err.message);
            }
        }
        console.log("Events migrated.");

        // 4. Tasks
        const tasks = readJson('tasks.json');
        console.log(`Found ${tasks.length} tasks.`);
        for (const t of tasks) {
            try {
                const exists = await Task.findOne({ id: t.id });
                if (!exists) {
                    await Task.create({
                        ...t,
                        userId: "user_100"
                    });
                }
            } catch (err: any) {
                console.error(`Failed to migrate task ${t.id}:`, err.message);
            }
        }
        console.log("Tasks migrated.");

        // 5. Bids
        const bids = readJson('bids.json');
        console.log(`Found ${bids.length} bids.`);
        for (const b of bids) {
            try {
                const exists = await Bid.findOne({ bid_id: b.bid_id });
                if (!exists) {
                    await Bid.create(b);
                }
            } catch (err: any) {
                console.error(`Failed to migrate bid ${b.bid_id}:`, err.message);
            }
        }
        console.log("Bids migrated.");

        // 6. Notifications
        const notifs = readJson('notifications.json');
        console.log(`Found ${notifs.length} notifications.`);
        for (const n of notifs) {
            try {
                const exists = await Notification.findOne({ notification_id: n.notification_id });
                if (!exists) {
                    await Notification.create({
                        recipientId: n.recipient_id,
                        type: n.type,
                        message: n.message,
                        relatedJobId: n.related_job_id,
                        read: n.is_read,
                        createdAt: n.created_at
                    });
                }
            } catch (err: any) {
                console.error(`Failed to migrate notification ${n.notification_id}:`, err.message);
            }
        }
        console.log("Notifications migrated.");

        // 7. Transactions
        const txns = readJson('setu_account_response_v3.json');
        console.log(`Found ${txns.length} transactions.`);
        for (const t of txns) {
            try {
                const exists = await Transaction.findOne({ txnId: t.txnId });
                if (!exists) {
                    await Transaction.create({
                        ...t,
                        user_id: "user_100"
                    });
                }
            } catch (err: any) {
                console.error(`Failed to migrate transaction ${t.txnId}:`, err.message);
            }
        }
        console.log("Transactions migrated.");

        console.log("Migration complete!");
        process.exit(0);

    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
}

migrate();
