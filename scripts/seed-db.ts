import fs from "fs";
import path from "path";
import csv from "csv-parser";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// ---------- ENV LOADING ----------
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGO_DB || "notification";
const COLLECTION_NAME = process.env.MONGO_COLLECTION || "notifications";
const CSV_PATH = process.env.CSV_PATH;

if (!MONGODB_URI) {
    throw new Error("❌ MONGODB_URI is missing in .env.local file");
}
if (!CSV_PATH) {
    throw new Error("❌ CSV_PATH is missing in .env file");
}

const client = new MongoClient(MONGODB_URI);

// ---------- CSV ROW TYPE ----------
interface CSVRow {
    title: string;
    job_category: string;
    budget_min: string;
    budget_max: string;
    currency: string;
    urgency_level: string;
    experience_level: string;
    job_description: string;
    skills: string; // JSON string
    required_hours_estimate: string;
    deadline: string;
}

// ---------- READ CSV ----------
async function readCSV(filePath: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
        const results: any[] = [];

        fs.createReadStream(filePath)
            .pipe(csv())
            .on("data", (row: CSVRow) => {
                try {
                    const job = {
                        title: row.title,
                        job_category: row.job_category,
                        budget_min: Number(row.budget_min),
                        budget_max: Number(row.budget_max),
                        currency: row.currency,
                        urgency_level: row.urgency_level,
                        experience_level: row.experience_level,
                        job_description: row.job_description,
                        skills: JSON.parse(row.skills),
                        required_hours_estimate: Number(row.required_hours_estimate),
                        deadline: row.deadline.split("T")[0],
                        job_status: "Open",

                        // Notification metadata
                        created_at: new Date().toISOString(),
                        type: "job_post",
                        _id: crypto.randomUUID(),
                    };

                    results.push(job);
                } catch (err) {
                    console.error("Error processing row:", row, err);
                }
            })
            .on("end", () => {
                resolve(results);
            })
            .on("error", (err: any) => reject(err));
    });
}

// ---------- MAIN DUMP FUNCTION ----------
async function dumpData() {
    try {
        if (!CSV_PATH) throw new Error("CSV_PATH is missing");
        const absoluteCSV = path.resolve(CSV_PATH);
        console.log("📄 Reading CSV from:", absoluteCSV);

        const jobs = await readCSV(absoluteCSV);
        console.log(`📦 Parsed ${jobs.length} jobs from CSV`);

        await client.connect();
        console.log("📡 Connected to MongoDB");

        const collection = client.db(DB_NAME).collection(COLLECTION_NAME);

        const result = await collection.insertMany(jobs);
        console.log(`✅ Inserted ${result.insertedCount} notification documents`);
    } catch (error) {
        console.error("❌ Error:", error);
    } finally {
        await client.close();
        console.log("🔌 MongoDB connection closed");
    }
}

dumpData();
