const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const Papa = require("papaparse");
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

async function seedJobs() {
    try {
        console.log("Connecting to DB:", MONGODB_URI);
        await mongoose.connect(MONGODB_URI);
        console.log("Connected.");

        const csvPath = path.join(process.cwd(), "bubble-chart", "data", "dummy_job_feed_v2.csv");
        const csvFile = fs.readFileSync(csvPath, "utf8");

        const { data } = Papa.parse(csvFile, {
            header: true,
            skipEmptyLines: true,
        });

        console.log(`Found ${data.length} jobs in CSV.`);

        let importedCount = 0;
        for (const row of data) {
            const existing = await Job.findOne({ title: row.title, clientId: row.client_id });
            if (existing) continue;

            await Job.create({
                title: row.title,
                job_category: row.job_category,
                budget_min: Number(row.budget_min) || 0,
                budget_max: Number(row.budget_max) || 0,
                currency: row.currency,
                urgency_level: row.urgency_level,
                experience_level: row.experience_level,
                job_description: row.job_description,
                skills: row.skills ? row.skills.replace(/[\[\]"]/g, '').split(',') : [],
                required_hours_estimate: Number(row.required_hours_estimate) || 0,
                deadline: row.deadline ? new Date(row.deadline) : undefined,
                job_status: row.job_status || "Open",
                clientId: row.client_id,
                clientName: row.company_name,
                status: row.job_status === "Assigned" ? "InProgress" : (row.job_status === "Completed" ? "Completed" : "Open"),
                createdAt: row.posted_at ? new Date(row.posted_at) : new Date(),
            });
            importedCount++;
        }

        console.log(`Imported ${importedCount} new jobs.`);

    } catch (error) {
        console.error("Seeding failed:", error);
    } finally {
        await mongoose.disconnect();
    }
}

seedJobs();
