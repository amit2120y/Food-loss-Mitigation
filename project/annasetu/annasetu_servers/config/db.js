const mongoose = require("mongoose");

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri || typeof uri !== "string") {
    console.error(
      "MongoDB connection error: MONGO_URI is not set. Please add MONGO_URI to your .env file."
    );
    // Don't exit here so the caller can decide how to handle startup (useful in dev)
    throw new Error("MONGO_URI is not defined");
  }

  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    throw error;
  }
};

module.exports = connectDB;
