const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  food: {
    type: String,
    required: true
  },

  quantity: {
    type: String,
    required: true
  },

  foodType: {
    type: String,
    enum: ["Vegetarian", "Non-Veg", "Vegan"],
    required: true
  },

  description: {
    type: String,
    required: true
  },

  location: {
    type: String,
    required: true
  },

  cookedTime: {
    type: Date,
    required: true
  },

  images: {
    type: [String], // Array of base64 or image URLs
    default: []
  },

  aiAnalysis: {
    human: Number,
    cattle: Number,
    fertilizer: Number,
    recommendation: String,
    confidence: String
  },

  status: {
    type: String,
    enum: ["Available", "Claimed", "Expired"],
    default: "Available"
  },

  createdAt: {
    type: Date,
    default: Date.now
  },

  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Donation", donationSchema);
