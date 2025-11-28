const mongoose = require("mongoose");
require("dotenv").config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/saksham-os";

const JobSchema = new mongoose.Schema({
    title: String,
    status: String,
});
const Job = mongoose.models.Job || mongoose.model("Job", JobSchema);

const NotificationSchema = new mongoose.Schema({
    recipientId: String,
    type: String,
    relatedJobId: String,
    message: String,
});
const Notification = mongoose.models.Notification || mongoose.model("Notification", NotificationSchema);

async function checkConsistency() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to DB");

        const jobs = await Job.find({});
        console.log(`Found ${jobs.length} jobs.`);
        const jobIds = new Set(jobs.map(j => j._id.toString()));
        console.log("Sample Job IDs:", jobs.slice(0, 3).map(j => j._id.toString()));

        const notifications = await Notification.find({ relatedJobId: { $exists: true } });
        console.log(`Found ${notifications.length} notifications with relatedJobId.`);

        let mismatchCount = 0;
        notifications.forEach(n => {
            if (!jobIds.has(n.relatedJobId)) {
                console.log(`[MISMATCH] Notification ${n._id} has relatedJobId ${n.relatedJobId} which does NOT exist in Jobs.`);
                mismatchCount++;
            }
        });

        if (mismatchCount === 0) {
            console.log("All notification relatedJobIds are valid.");
        } else {
            console.log(`Found ${mismatchCount} mismatches.`);
        }

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
}

checkConsistency();
