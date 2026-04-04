const Donation = require("../models/donation");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

// CREATE NEW DONATION
exports.createDonation = async (req, res) => {
  try {
    // Get token and verify user
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { food, quantity, foodType, description, location, cookedTime, images, aiAnalysis, coordinates } = req.body;

    // Validate required fields
    if (!food || !quantity || !foodType || !description || !location || !cookedTime) {
      const missing = [];
      if (!food) missing.push("food");
      if (!quantity) missing.push("quantity");
      if (!foodType) missing.push("foodType");
      if (!description) missing.push("description");
      if (!location) missing.push("location");
      if (!cookedTime) missing.push("cookedTime");
      return res.status(400).json({
        message: "Missing required fields: " + missing.join(", "),
        missingFields: missing
      });
    }

    // Validate foodType enum
    if (!["Vegetarian", "Non-Veg", "Vegan"].includes(foodType)) {
      return res.status(400).json({ message: "Invalid foodType. Must be Vegetarian, Non-Veg, or Vegan" });
    }

    // Parse cookedTime safely - handle both ISO string and datetime-local format
    let parsedCookedTime;
    try {
      parsedCookedTime = new Date(cookedTime);
      if (isNaN(parsedCookedTime.getTime())) {
        return res.status(400).json({ message: "Invalid cookedTime format" });
      }
    } catch (dateError) {
      return res.status(400).json({ message: "Failed to parse cookedTime: " + dateError.message });
    }

    // Create donation
    const donation = await Donation.create({
      userId: user._id,
      food,
      quantity,
      foodType,
      description,
      location,
      coordinates: coordinates || null,
      cookedTime: parsedCookedTime,
      images: images || [],
      aiAnalysis: aiAnalysis || null,
      status: "Available"
    });

    // Update user's donation count
    await User.findByIdAndUpdate(user._id, {
      $inc: { donationsMade: 1 }
    });

    console.log(`✓ Donation created by user: ${user.email}`);

    res.status(201).json({
      message: "Donation created successfully",
      donation: donation
    });

  } catch (error) {
    console.error("Error creating donation:", error);
    res.status(500).json({
      message: "Failed to create donation",
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};


// GET USER'S DONATIONS
exports.getUserDonations = async (req, res) => {
  try {
    // Get token and verify user
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log(`[GET DONATIONS] User ID: ${user._id}, Email: ${user.email}`);

    // Fetch all donations by this user
    const donations = await Donation.find({ userId: user._id })
      .sort({ createdAt: -1 }); // Latest first

    console.log(`✓ Fetched ${donations.length} donations for user: ${user.email}`);

    // Log details for debugging
    if (donations.length === 0) {
      console.log(`[DEBUG] User ${user._id} has no donations`);
    } else {
      console.log(`[DEBUG] Donations found:`, donations.map(d => ({
        id: d._id,
        userId: d.userId,
        food: d.food,
        createdAt: d.createdAt
      })));
    }

    res.status(200).json({
      message: "Donations retrieved successfully",
      donations: donations,
      count: donations.length,
      userId: user._id // Include user ID in response for debugging
    });

  } catch (error) {
    console.error("Error fetching donations:", error);
    res.status(500).json({ message: "Failed to fetch donations", error: error.message });
  }
};


// GET ALL DONATIONS (for browsing)
exports.getAllDonations = async (req, res) => {
  try {
    // Get token and verify user
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get only "Available" donations, excluding the current user's donations
    const donations = await Donation.find({
      status: "Available",
      userId: { $ne: user._id }  // Exclude current user's donations
    })
      .populate("userId", "name email phone")
      .sort({ createdAt: -1 });

    console.log(`✓ Fetched ${donations.length} available donations for user ${user.email}`);

    res.status(200).json({
      message: "All available donations retrieved",
      donations: donations,
      count: donations.length
    });

  } catch (error) {
    console.error("Error fetching all donations:", error);
    res.status(500).json({ message: "Failed to fetch donations", error: error.message });
  }
};


// UPDATE DONATION
exports.updateDonation = async (req, res) => {
  try {
    const { donationId } = req.params;
    const { status } = req.body;

    // Validate status
    if (!["Available", "Claimed", "Expired"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const donation = await Donation.findByIdAndUpdate(
      donationId,
      { status, updatedAt: new Date() },
      { new: true }
    );

    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }

    console.log(`✓ Donation updated: ${donationId}`);

    res.status(200).json({
      message: "Donation updated successfully",
      donation: donation
    });

  } catch (error) {
    console.error("Error updating donation:", error);
    res.status(500).json({ message: "Failed to update donation", error: error.message });
  }
};


// DELETE DONATION
exports.deleteDonation = async (req, res) => {
  try {
    // Get token and verify user
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { donationId } = req.params;

    // Check if user owns this donation
    const donation = await Donation.findById(donationId);
    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }

    if (donation.userId.toString() !== user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this donation" });
    }

    // Delete donation
    await Donation.findByIdAndDelete(donationId);

    // Update user's donation count
    await User.findByIdAndUpdate(user._id, {
      $inc: { donationsMade: -1 }
    });

    console.log(`✓ Donation deleted: ${donationId}`);

    res.status(200).json({
      message: "Donation deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting donation:", error);
    res.status(500).json({ message: "Failed to delete donation", error: error.message });
  }
};

// DEBUG: Clear all donations (USE WITH CAUTION)
exports.debugClearAllDonations = async (req, res) => {
  try {
    if (process.env.NODE_ENV !== 'development') {
      return res.status(403).json({ message: "This endpoint is only available in development mode" });
    }

    const result = await Donation.deleteMany({});
    console.log(`[DEBUG] Cleared ${result.deletedCount} donations from database`);

    res.status(200).json({
      message: `Cleared ${result.deletedCount} donations`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error("Error clearing donations:", error);
    res.status(500).json({ message: "Failed to clear donations", error: error.message });
  }
};

// DEBUG: Get all donations with user info
exports.debugGetAllDonationsWithUsers = async (req, res) => {
  try {
    if (process.env.NODE_ENV !== 'development') {
      return res.status(403).json({ message: "This endpoint is only available in development mode" });
    }

    const all = await Donation.find({}).populate('userId', 'name email _id');
    console.log(`[DEBUG] Found ${all.length} total donations in database`);

    res.status(200).json({
      message: `Found ${all.length} donations`,
      donations: all.map(d => ({
        _id: d._id,
        userId: d.userId?._id || 'NO_USER',
        userName: d.userId?.name || 'UNKNOWN',
        userEmail: d.userId?.email || 'UNKNOWN',
        food: d.food,
        quantity: d.quantity,
        createdAt: d.createdAt
      }))
    });
  } catch (error) {
    console.error("Error fetching all donations:", error);
    res.status(500).json({ message: "Failed to fetch donations", error: error.message });
  }
};
