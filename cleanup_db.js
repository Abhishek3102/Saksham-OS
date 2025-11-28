const mongoose = require("mongoose");
require("dotenv").config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/saksham-os";

const JobSchema = new mongoose.Schema({
    title: String,
});
const Job = mongoose.models.Job || mongoose.model("Job", JobSchema);

const NotificationSchema = new mongoose.Schema({
    recipientId: String,
    type: String,
    relatedJobId: String,
    message: String,
});
const Notification = mongoose.models.Notification || mongoose.model("Notification", NotificationSchema);

async function cleanup() {
    try {
        console.log("Connecting to DB...");
        await mongoose.connect(MONGODB_URI);
        console.log("Connected.");

        const jobs = await Job.find({});
        const jobIds = new Set(jobs.map(j => j._id.toString()));
        console.log(`Loaded ${jobs.length} valid Job IDs.`);

        const notifications = await Notification.find({ relatedJobId: { $exists: true } });
        console.log(`Scanning ${notifications.length} notifications...`);

        const idsToDelete = [];
        for (const n of notifications) {
            if (n.relatedJobId && !jobIds.has(n.relatedJobId.toString())) {
                console.log(`[INVALID] Notification ${n._id} points to missing Job ${n.relatedJobId}`);
                idsToDelete.push(n._id);
            }
        }

        if (idsToDelete.length > 0) {
            console.log(`Deleting ${idsToDelete.length} corrupted notifications...`);
            await Notification.deleteMany({ _id: { $in: idsToDelete } });
            console.log("Cleanup complete.");
        } else {
            console.log("No corrupted notifications found.");
        }

    } catch (error) {
        console.error("Cleanup failed:", error);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected.");
    }
}

cleanup();
