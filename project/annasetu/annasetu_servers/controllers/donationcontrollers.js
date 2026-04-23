const Donation = require("../models/donation");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

// Helper function to detect and handle MongoDB network errors
function handleDatabaseError(error) {
  if (error.name === 'MongoNetworkError' || error.name === 'MongoNetworkTimeoutError') {
    return {
      status: 503,
      message: "Database temporarily unavailable. Please check your internet connection and try again.",
      isDatabaseError: true
    };
  }
  return null;
}

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

    // --- Real-time notification logic ---

    // Only notify other users, not the one who added the food
    const Notification = require('../models/notification');
    const io = req.app.get('io');
    const notifMsg = `${user.name || user.email} added new food: ${food}`;
    const notification = await Notification.create({
      message: notifMsg,
      foodId: donation._id,
      addedBy: user._id
    });
    if (io) {
      io.sockets.sockets.forEach((socket) => {
        let socketUserId = null;
        if (socket.handshake.auth && socket.handshake.auth.token) {
          try {
            const decoded = jwt.verify(socket.handshake.auth.token, process.env.JWT_SECRET);
            socketUserId = String(decoded.id);
          } catch (e) {
            console.log('Socket token invalid:', e.message);
          }
        }
        // Debug log for each socket
        console.log('Socket', socket.id, 'userId:', socketUserId, '| Donor:', String(user._id));
        if (socketUserId && socketUserId === String(user._id)) {
          // Don't send to the user who added
          return;
        }
        socket.emit('new_notification', {
          message: notifMsg,
          foodId: donation._id,
          addedBy: user._id,
          createdAt: notification.createdAt,
          notificationId: notification._id
        });
      });
    }

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
      userId: user._id
    });

  } catch (error) {
    console.error("Error fetching donations:", error);

    // Check if it's a database connectivity issue
    const dbError = handleDatabaseError(error);
    if (dbError) {
      return res.status(dbError.status).json({ message: dbError.message });
    }

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

    // Check if it's a database connectivity issue
    const dbError = handleDatabaseError(error);
    if (dbError) {
      return res.status(dbError.status).json({ message: dbError.message });
    }

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


// ================================================
// CLAIM DONATION
// ================================================
exports.claimDonation = async (req, res) => {
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

    const { donationId } = req.params;
    const { purpose, beneficiaries, notes, address, preferredPickupTime } = req.body;

    console.log('[CLAIM] Request body received:', {
      purpose,
      beneficiaries,
      notes,
      address,
      preferredPickupTime
    });

    // Validate required claim details
    if (!purpose || !beneficiaries || !address) {
      return res.status(400).json({
        message: "Missing required claim details",
        required: ["purpose", "beneficiaries", "address"],
        received: { purpose, beneficiaries, address }
      });
    }

    // Find donation
    const donation = await Donation.findById(donationId).populate('userId', 'name email phone');
    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }

    // Check if donation is available
    if (donation.status !== "Available") {
      return res.status(400).json({ message: `Donation is already ${donation.status.toLowerCase()}` });
    }

    // Check if user is trying to claim their own donation
    if (donation.userId._id.toString() === user._id.toString()) {
      return res.status(400).json({ message: "Cannot claim your own donation" });
    }

    // Check if user already claimed this donation
    const existingClaim = donation.claims.find(c => c.userId.toString() === user._id.toString());
    if (existingClaim) {
      return res.status(400).json({ message: "You have already claimed this donation" });
    }

    // Add claim request with details
    const claimObject = {
      userId: user._id,
      userName: user.name,
      userEmail: user.email,
      userPhone: user.phone || "",
      status: "pending",
      purpose: purpose,
      beneficiaries: parseInt(beneficiaries),
      notes: notes || "",
      address: address,
      preferredPickupTime: preferredPickupTime || ""
    };

    console.log('[CLAIM] Saving claim object to database:', claimObject);
    donation.claims.push(claimObject);

    // Mark the claims array as modified so Mongoose will save it
    donation.markModified('claims');

    await donation.save();

    const savedClaim = donation.claims[donation.claims.length - 1];
    console.log(`✓ Donation ${donationId} claimed by user ${user.email} - Purpose: ${purpose}, Beneficiaries: ${beneficiaries}`);
    console.log('[CLAIM] After save, saved claim details:', {
      _id: savedClaim._id,
      userId: savedClaim.userId,
      userName: savedClaim.userName,
      purpose: savedClaim.purpose,
      beneficiaries: savedClaim.beneficiaries,
      address: savedClaim.address,
      status: savedClaim.status,
      notes: savedClaim.notes,
      preferredPickupTime: savedClaim.preferredPickupTime,
      allKeys: Object.keys(savedClaim).join(', ')
    });

    console.log('[CLAIM] Full donation object keys:', Object.keys(donation.toObject ? donation.toObject() : donation));


    // --- Notify the donor ---
    try {
      const Notification = require('../models/notification');
      const io = req.app.get('io');
      const donorId = donation.userId._id ? donation.userId._id.toString() : donation.userId.toString();
      const notifMsg = `${user.name || user.email} claimed your food: ${donation.food}`;
      const notification = await Notification.create({
        message: notifMsg,
        foodId: donation._id,
        addedBy: user._id,
        recipient: donorId
      });
      if (io) {
        io.sockets.sockets.forEach((socket) => {
          let socketUserId = null;
          if (socket.handshake.auth && socket.handshake.auth.token) {
            try {
              const decoded = require('jsonwebtoken').verify(socket.handshake.auth.token, process.env.JWT_SECRET);
              socketUserId = String(decoded.id);
            } catch (e) { }
          }
          if (socketUserId && socketUserId === donorId) {
            socket.emit('new_notification', {
              message: notifMsg,
              foodId: donation._id,
              addedBy: user._id,
              createdAt: notification.createdAt,
              notificationId: notification._id
            });
          }
        });
      }
    } catch (notifyErr) {
      console.error('Error sending donor notification:', notifyErr);
    }

    res.status(200).json({
      message: "Donation claimed successfully",
      donation: donation,
      claim: donation.claims[donation.claims.length - 1]
    });

  } catch (error) {
    console.error("Error claiming donation:", error);
    res.status(500).json({ message: "Failed to claim donation", error: error.message });
  }
};


// ================================================
// UNCLAIM DONATION
// ================================================
exports.unclaimDonation = async (req, res) => {
  try {
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

    const { donationId } = req.params;

    const donation = await Donation.findById(donationId);
    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }

    // Remove user's claim
    donation.claims = donation.claims.filter(c => c.userId.toString() !== user._id.toString());

    // If no more claims and was claimed by this user, revert status
    if (donation.claimedBy && donation.claimedBy.toString() === user._id.toString()) {
      donation.claimedBy = null;
      donation.status = "Available";
    }

    // Mark the claims array as modified so Mongoose will save it
    donation.markModified('claims');

    await donation.save();

    console.log(`✓ Claim removed by user ${user.email} for donation ${donationId}`);

    res.status(200).json({
      message: "Claim removed successfully",
      donation: donation
    });

  } catch (error) {
    console.error("Error unclaiming donation:", error);
    res.status(500).json({ message: "Failed to unclaim donation", error: error.message });
  }
};


// ================================================
// ACCEPT CLAIM (Donor accepts a claim request)
// ================================================
exports.acceptClaim = async (req, res) => {
  try {
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

    const { donationId, claimUserId } = req.params;

    const donation = await Donation.findById(donationId);
    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }

    // Verify user owns this donation
    if (donation.userId.toString() !== user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to accept claims on this donation" });
    }

    // Find and update the claim
    const claim = donation.claims.find(c => c.userId.toString() === claimUserId);
    if (!claim) {
      return res.status(404).json({ message: "Claim not found" });
    }

    // Reject all other claims
    donation.claims.forEach(c => {
      if (c._id.toString() !== claim._id.toString()) {
        c.status = "rejected";
      }
    });

    // Accept this claim
    claim.status = "accepted";
    donation.claimedBy = claimUserId;
    donation.status = "Claimed";

    // Mark the claims array as modified so Mongoose will save it
    donation.markModified('claims');

    // Update recipient's donation count
    await User.findByIdAndUpdate(claimUserId, {
      $inc: { donationsReceived: 1 }
    });

    await donation.save();

    console.log(`✓ Claim accepted by ${user.email} for user ${claimUserId}`);

    res.status(200).json({
      message: "Claim accepted successfully",
      donation: donation
    });

  } catch (error) {
    console.error("Error accepting claim:", error);
    res.status(500).json({ message: "Failed to accept claim", error: error.message });
  }
};


// ================================================
// REJECT CLAIM
// ================================================
exports.rejectClaim = async (req, res) => {
  try {
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

    const { donationId, claimUserId } = req.params;

    const donation = await Donation.findById(donationId);
    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }

    // Verify user owns this donation
    if (donation.userId.toString() !== user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to reject claims on this donation" });
    }

    // Find and reject the claim
    const claim = donation.claims.find(c => c.userId.toString() === claimUserId);
    if (!claim) {
      return res.status(404).json({ message: "Claim not found" });
    }

    claim.status = "rejected";

    // Mark the claims array as modified so Mongoose will save it
    donation.markModified('claims');

    await donation.save();

    console.log(`✓ Claim rejected by ${user.email} for user ${claimUserId}`);

    res.status(200).json({
      message: "Claim rejected successfully",
      donation: donation
    });

  } catch (error) {
    console.error("Error rejecting claim:", error);
    res.status(500).json({ message: "Failed to reject claim", error: error.message });
  }
};


// ================================================
// GET USER'S CLAIMS (Donations user has claimed)
// ================================================
exports.getUserClaims = async (req, res) => {
  try {
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

    // Find donations where user has a pending or accepted claim
    const claims = await Donation.find({
      'claims.userId': user._id
    }).populate('userId', 'name email phone');

    console.log(`✓ Fetched ${claims.length} claims for user ${user.email}`);

    res.status(200).json({
      message: "User claims retrieved successfully",
      claims: claims,
      count: claims.length
    });

  } catch (error) {
    console.error("Error fetching user claims:", error);
    res.status(500).json({ message: "Failed to fetch claims", error: error.message });
  }
};


// ================================================
// COMPLETE DONATION AND RATE
// ================================================
exports.completeDonationAndRate = async (req, res) => {
  try {
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

    const { donationId } = req.params;
    const { rating, review } = req.body;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const donation = await Donation.findById(donationId);
    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }

    // Verify user claimed this donation
    if (!donation.claimedBy || donation.claimedBy.toString() !== user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to rate this donation" });
    }

    // Add rating
    donation.rating = {
      score: rating,
      review: review || "",
      ratedBy: user._id,
      ratedAt: new Date()
    };

    donation.isCompleted = true;
    donation.status = "Completed";

    await donation.save();

    console.log(`✓ Donation ${donationId} completed and rated ${rating}/5 by ${user.email}`);

    res.status(200).json({
      message: "Donation completed and rated successfully",
      donation: donation
    });

  } catch (error) {
    console.error("Error completing donation:", error);
    res.status(500).json({ message: "Failed to complete donation", error: error.message });
  }
};


// ================================================
// EDIT DONATION (Owner can edit before being claimed)
// ================================================
exports.editDonation = async (req, res) => {
  try {
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

    const { donationId } = req.params;
    const { quantity } = req.body;

    const donation = await Donation.findById(donationId);
    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }

    // Verify user owns this donation
    if (donation.userId.toString() !== user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to edit this donation" });
    }

    // Can only edit if not claimed
    if (donation.status !== "Available") {
      return res.status(400).json({ message: "Cannot edit a claimed or completed donation" });
    }

    // Only quantity can be edited
    if (!quantity) {
      return res.status(400).json({ message: "Quantity is required" });
    }

    donation.quantity = quantity;
    donation.updatedAt = new Date();
    await donation.save();

    console.log(`✓ Donation ${donationId} quantity updated by ${user.email} to: ${quantity}`);

    res.status(200).json({
      message: "Donation updated successfully",
      donation: donation
    });

  } catch (error) {
    console.error("Error editing donation:", error);
    res.status(500).json({ message: "Failed to edit donation", error: error.message });
  }
};
