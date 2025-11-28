const mongoose = require("mongoose");
require("dotenv").config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/saksham-os";

async function dropIndexes() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Dropping indexes on 'jobs' collection...");
        await mongoose.connection.db.collection("jobs").dropIndexes();
        console.log("Indexes dropped.");
    } catch (error) {
        console.error("Error:", error);
    } finally {
        await mongoose.disconnect();
    }
}

dropIndexes();
