const mongoose = require("mongoose");

const connectDB = async (retries = 3) => {
  const uri = process.env.MONGO_URI;
  if (!uri || typeof uri !== "string") {
    console.error(
      "MongoDB connection error: MONGO_URI is not set. Please add MONGO_URI to your .env file."
    );
    throw new Error("MONGO_URI is not defined");
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`[${attempt}/${retries}] Connecting to MongoDB...`);

      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 10000,
        retryWrites: true,
        w: 'majority'
      });

      console.log("✓ MongoDB connected successfully");

      // Handle connection reconnection events
      mongoose.connection.on('disconnected', () => {
        console.warn("⚠️  MongoDB disconnected - app will attempt to reconnect");
      });

      mongoose.connection.on('error', (error) => {
        console.error("❌ MongoDB connection error:", error.message);
      });

      return; // Success - exit the retry loop

    } catch (error) {
      console.error(`❌ Connection attempt ${attempt} failed:`, error.message);

      if (attempt < retries) {
        const delayMs = Math.pow(2, attempt) * 1000; // Exponential backoff: 2s, 4s, 8s
        console.log(`⏳ Retrying in ${delayMs / 1000}s...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      } else {
        throw error;
      }
    }
  }
};

module.exports = connectDB;
