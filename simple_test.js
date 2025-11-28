console.log("Node is working");
try {
    const mongoose = require("mongoose");
    console.log("Mongoose loaded");
} catch (e) {
    console.log("Mongoose failed:", e.message);
}
