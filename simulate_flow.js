const mongoose = require("mongoose");
require("dotenv").config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/saksham-os";

const JobSchema = new mongoose.Schema({
    title: String,
    clientId: String,
    status: { type: String, default: "Open" },
    bids: [{
        freelancerId: String,
        amount: Number,
        proposal: String
    }],
    assignedFreelancerId: String
});
const Job = mongoose.models.Job || mongoose.model("Job", JobSchema);

const NotificationSchema = new mongoose.Schema({
    recipientId: String,
    type: String,
    relatedJobId: String,
    message: String,
});
const Notification = mongoose.models.Notification || mongoose.model("Notification", NotificationSchema);

async function simulateFlow() {
    try {
        console.log("Connecting to DB...");
        await mongoose.connect(MONGODB_URI);
        console.log("Connected.");

        // 1. Create Job
        console.log("Creating Job...");
        const job = await Job.create({
            title: "Simulation Job " + Date.now(),
            clientId: "user_client_sim",
            status: "Open",
            bids: []
        });
        console.log("Job Created:", job._id);

        // 2. Create Notification
        console.log("Creating Notification...");
        const notif = await Notification.create({
            recipientId: "user_freelancer_sim",
            type: "job_match",
            relatedJobId: job._id.toString(),
            message: "New Job Match"
        });
        console.log("Notification Created:", notif._id);

        // 3. Verify Link
        console.log("Verifying Link...");
        const foundJob = await Job.findById(notif.relatedJobId);
        if (foundJob) {
            console.log("Link Verified: Notification points to valid Job.");
        } else {
            console.error("Link Failed: Job not found via Notification ID.");
        }

        // 4. Simulate Bid
        console.log("Simulating Bid...");
        foundJob.bids.push({
            freelancerId: "user_freelancer_sim",
            amount: 500,
            proposal: "I can do this."
        });
        await foundJob.save();
        console.log("Bid Placed.");

        // 5. Simulate Accept
        console.log("Simulating Accept...");
        foundJob.status = "InProgress";
        foundJob.assignedFreelancerId = "user_freelancer_sim";
        await foundJob.save();
        console.log("Bid Accepted. Job Status:", foundJob.status);

        // Cleanup
        console.log("Cleaning up simulation data...");
        await Job.findByIdAndDelete(job._id);
        await Notification.findByIdAndDelete(notif._id);
        console.log("Cleanup complete.");

    } catch (error) {
        console.error("Simulation Failed:", error);
    } finally {
        await mongoose.disconnect();
    }
}

simulateFlow();
