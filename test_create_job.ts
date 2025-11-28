import mongoose from "mongoose";
import dotenv from "dotenv";
import Job from "./models/Job";

dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/saksham-os";

async function testJobPersistence() {
    try {
        console.log("Connecting to DB...");
        await mongoose.connect(MONGODB_URI);
        console.log("Connected.");

        console.log("Creating test job...");
        const newJob = await Job.create({
            title: "Persistence Test Job",
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
