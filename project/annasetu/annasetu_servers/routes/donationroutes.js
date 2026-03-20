const express = require("express");
const router = express.Router();

const {
  createDonation,
  getUserDonations,
  getAllDonations,
  updateDonation,
  deleteDonation,
  debugClearAllDonations,
  debugGetAllDonationsWithUsers
} = require("../controllers/donationcontrollers");

// Debug logging middleware
router.use((req, res, next) => {
  console.log(`[DONATION] ${req.method} ${req.path} - Auth: ${req.headers.authorization ? 'Yes' : 'No'}`);
  next();
});

// Create new donation
router.post("/create", (req, res, next) => {
  console.log("[DONATION] POST /create - Body size:", JSON.stringify(req.body).length, "bytes");
  next();
}, createDonation);

// Get current user's donations
router.get("/my-donations", getUserDonations);

// Get all available donations (for browsing)
router.get("/available", getAllDonations);

// Update donation status
router.put("/:donationId", updateDonation);

// Delete donation
router.delete("/:donationId", deleteDonation);

// DEBUG ENDPOINTS (development only - REMOVE OR SECURE IN PRODUCTION)
// These endpoints are useful for testing but should NEVER be exposed in production
// Only available when NODE_ENV === 'development'
router.delete("/debug/clear-all", debugClearAllDonations);
router.get("/debug/all-with-users", debugGetAllDonationsWithUsers);

module.exports = router;
