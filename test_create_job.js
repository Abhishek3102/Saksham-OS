const mongoose = require("mongoose");
require("dotenv").config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/saksham-os";

const JobSchema = new mongoose.Schema({
    title: { type: String, required: true },
    job_category: { type: String, required: true },
    budget_min: { type: Number, required: true },
    budget_max: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    urgency_level: { type: String, default: "Medium" },
    experience_level: { type: String, default: "Mid" },
    job_description: { type: String, required: true },
    skills: [{ type: String }],
    required_hours_estimate: { type: Number },
    deadline: { type: Date },
    job_status: { type: String, default: "Open" },
    clientId: { type: String, required: true },
    clientName: { type: String },
    status: {
        type: String,
        enum: ["Open", "InProgress", "Completed"],
        default: "Open"
    },
    assignedFreelancerId: { type: String },
    bids: [{
        freelancerId: { type: String, required: true },
        freelancerName: { type: String, required: true },
        amount: { type: Number, required: true },
        proposal: { type: String },
        createdAt: { type: Date, default: Date.now }
    }],
    createdAt: { type: Date, default: Date.now },
});

const Job = mongoose.models.Job || mongoose.model("Job", JobSchema);

async function testJobPersistence() {
    try {
        console.log("Connecting to DB:", MONGODB_URI);
        await mongoose.connect(MONGODB_URI);
        console.log("Connected.");

        console.log("Creating test job...");
        const newJob = await Job.create({
            title: "Persistence Test Job JS",
            job_category: "Testing",
            budget_min: 100,
            budget_max: 200,
            job_description: "This is a test job to verify persistence.",
            clientId: "test_client_id",
            clientName: "Test Client",
            skills: ["Debugging"],
            deadline: new Date()
        });

        console.log(`Job Created. ID: ${newJob._id}`);

        console.log("Fetching job by ID...");
        const fetchedJob = await Job.findById(newJob._id);
        console.log(`Job Found: ${!!fetchedJob}`);
        
        if (fetchedJob) {
            console.log(`Fetched Title: ${fetchedJob.title}`);
        } else {
            console.error("CRITICAL: Job not found immediately after creation!");
        }

    } catch (error) {
        console.error("Test failed:", error);
    } finally {
        await mongoose.disconnect();
    }
}

testJobPersistence();
