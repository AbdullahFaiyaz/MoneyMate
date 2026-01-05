require('dotenv').config();
const mongoose = require('mongoose');

console.log("Checking DB Connection...");
console.log("URI from env:", process.env.MONGO_URI);

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Connected Successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Error connecting:", error.message);
        process.exit(1);
    }
};

connectDB();
