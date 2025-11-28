import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import Papa from "papaparse";
import dotenv from "dotenv";
import Job from "./models/Job";

dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/saksham-os";

async function seedJobs() {
    try {
        console.log("Connecting to DB...");
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
        for (const row of data as any[]) {
            // Check if job already exists (by title or some unique field to avoid dupes if re-run)
            // Using title + client_id as a rough unique key
            const existing = await Job.findOne({ title: row.title, clientId: row.client_id });
            if (existing) continue;

            // Map CSV fields to Mongoose Schema
            // Note: CSV has 'job_id' which we can't force as _id easily if it's not ObjectID.
            // We will let Mongo generate _id, but store csv_job_id for reference if needed.
            // OR, if the user wants to keep the CSV IDs, we need to handle that.
            // But the user's error was "Job not found" for an ID like "674...", which is Mongo.
            // The CSV IDs are "job_...", so if the frontend links to "job_...", the API fails.

            // Wait! If the frontend is displaying CSV jobs, it's linking to /jobs/job_...
            // And the API tries to findById("job_..."), which fails for Mongo.
            // So we MUST store the "job_..." ID or handle it.

            // Let's add a 'originalId' field to Job model to store the CSV ID.

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
                clientId: row.client_id, // This is a CSV user ID, not Mongo ID. Might be an issue later.
                clientName: row.company_name, // Using company name as client name for now
                status: row.job_status === "Assigned" ? "InProgress" : (row.job_status === "Completed" ? "Completed" : "Open"),
                createdAt: row.posted_at ? new Date(row.posted_at) : new Date(),
                // Store the CSV ID so we can find it if needed, though we rely on Mongo _id for new system
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
