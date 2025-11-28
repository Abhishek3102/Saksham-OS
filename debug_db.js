const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/saksham-os";

const JobSchema = new mongoose.Schema({
    title: String,
    clientId: String,
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

async function debug() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to DB");

        const jobs = await Job.find({});
        console.log("Jobs:", jobs);

        const notifications = await Notification.find({});
        console.log("Notifications:", notifications);

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
}

debug();
