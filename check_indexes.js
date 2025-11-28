const mongoose = require("mongoose");
require("dotenv").config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/saksham-os";

async function checkIndexes() {
    try {
        await mongoose.connect(MONGODB_URI);
        const indexes = await mongoose.connection.db.collection("jobs").indexes();
        console.log("Indexes on 'jobs' collection:");
        console.log(JSON.stringify(indexes, null, 2));
    } catch (error) {
        console.error("Error:", error);
    } finally {
        await mongoose.disconnect();
    }
}

checkIndexes();
