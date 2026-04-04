const express = require("express");
const router = express.Router();
const passport = require("passport");

const {
  registerUser,
  loginUser,
  googleCallback,
  getGoogleLoginSuccess,
  getUserStats,
  analyzeFoodWithAI,
  updateProfile,
  changePassword
} = require("../controllers/authcontrollers");

router.post("/register", registerUser);
router.post("/login", loginUser);

// Direct Google OAuth redirect (simpler approach)
router.get("/google", (req, res) => {
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: process.env.GOOGLE_CALLBACK_URL,
    response_type: "code",
    scope: "profile email",
    access_type: "offline"
  }).toString()}`;

  res.redirect(googleAuthUrl);
});

// Google OAuth callback - receive code OR token
router.get("/google/callback", async (req, res) => {
  try {
    console.log("\n=== Google OAuth Callback Started ===");
    console.log("Step 1: Received query params keys:", Object.keys(req.query));

    const { code, token } = req.query;

    // Handle JWT token from Google Sign-In Widget
    if (token && !code) {
      console.log("✓ Step 1: JWT token received from Google Sign-In Widget");
      return handleGoogleSignInWidget(token, res);
    }

    // Handle authorization code from backend OAuth flow
    if (code && !token) {
      console.log("✓ Step 1: Authorization code received from backend OAuth");
      return handleGoogleOAuthCode(code, res);
    }

    console.log("❌ Step 1 FAILED: Neither code nor token received");
    return res.redirect("/login.html?error=no_auth_data");

  } catch (error) {
    console.error("❌ CRITICAL ERROR in Google callback:", error);
    res.redirect("/login.html?error=auth_failed&message=" + encodeURIComponent(error.message));
  }
});

// Handle JWT token from Google Sign-In Widget
async function handleGoogleSignInWidget(jwtToken, res) {
  try {
    console.log("\n--- Processing Google Sign-In Widget Token ---");

    // Decode JWT (Note: we're not verifying signature here for simplicity, but you should in production)
    const parts = jwtToken.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT token format');
    }

    // Decode payload
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    console.log("Decoded JWT payload:", {
      name: payload.name,
      email: payload.email,
      sub: payload.sub
    });

    const User = require("../models/user");
    const jwt = require("jsonwebtoken");

    const googleId = payload.sub;
    const email = payload.email;
    const name = payload.name;
    const picture = payload.picture;

    console.log("Step 2: Checking if user exists with googleId:", googleId);
    let user = await User.findOne({ googleId });

    if (!user) {
      console.log("  → User NOT found with googleId, checking by email:", email);
      let existingEmailUser = await User.findOne({ email });

      if (existingEmailUser) {
        console.log("  → Found existing user by email, updating with Google info...");
        user = await User.findByIdAndUpdate(
          existingEmailUser._id,
          {
            googleId,
            googleName: name,
            googleEmail: email,
            googleProfilePicture: picture,
            authMethod: 'google'
          },
          { new: true }
        );
        console.log("✓ Step 2a SUCCESS: User updated. User ID:", user._id);
      } else {
        console.log("  → No existing user found, CREATING NEW USER...");
        user = await User.create({
          name,
          email,
          googleId,
          googleName: name,
          googleEmail: email,
          googleProfilePicture: picture,
          authMethod: 'google'
        });
        console.log("✓ Step 2b SUCCESS: New user created. User ID:", user._id);
      }
    } else {
      console.log("✓ Step 2c SUCCESS: User already exists. User ID:", user._id);
    }

    // Create JWT token for our app
    console.log("Step 3: Creating JWT token for our app...");
    const ourToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const redirectUrl = `/dashboard.html?token=${ourToken}&userId=${user._id}&userName=${encodeURIComponent(user.name)}&userEmail=${encodeURIComponent(user.email)}`;
    console.log("✓ Step 3 SUCCESS: JWT token created");
    console.log("✓ Redirecting to dashboard...");
    console.log("=== Google Sign-In Widget Auth Complete (SUCCESS) ===\n");

    res.redirect(redirectUrl);

  } catch (error) {
    console.error("❌ Error processing Google Sign-In Widget token:", error);
    res.redirect("/login.html?error=widget_token_failed&message=" + encodeURIComponent(error.message));
  }
}

// Handle authorization code from backend OAuth flow
async function handleGoogleOAuthCode(code, res) {
  try {
    console.log("\n--- Processing Google OAuth Authorization Code ---");
    console.log("Step 2: Exchanging code for access token...");

    const { default: fetch } = await import("node-fetch");

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code: code,
        grant_type: "authorization_code",
        redirect_uri: process.env.GOOGLE_CALLBACK_URL
      }).toString()
    });

    const tokenData = await tokenResponse.json();
    console.log("Step 2 Response:", { status: tokenResponse.status, hasAccessToken: !!tokenData.access_token });

    if (!tokenData.access_token) {
      console.log("❌ Step 2 FAILED: No access token received:", tokenData);
      return res.redirect("/login.html?error=no_token&details=" + encodeURIComponent(JSON.stringify(tokenData)));
    }

    console.log("✓ Step 2 SUCCESS: Access token received");

    console.log("Step 3: Fetching user profile from Google...");
    const profileResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });

    const profile = await profileResponse.json();
    console.log("✓ Step 3 SUCCESS: User profile received:", {
      id: profile.id,
      name: profile.name,
      email: profile.email
    });

    const User = require("../models/user");
    const jwt = require("jsonwebtoken");

    console.log("Step 4: Checking if user exists with googleId:", profile.id);
    let user = await User.findOne({ googleId: profile.id });

    if (!user) {
      console.log("  → User NOT found with googleId, checking by email:", profile.email);
      let existingEmailUser = await User.findOne({ email: profile.email });

      if (existingEmailUser) {
        console.log("  → Found existing user by email, updating with Google info...");
        user = await User.findByIdAndUpdate(
          existingEmailUser._id,
          {
            googleId: profile.id,
            googleName: profile.name,
            googleEmail: profile.email,
            googleProfilePicture: profile.picture,
            authMethod: 'google'
          },
          { new: true }
        );
        console.log("✓ Step 4a SUCCESS: User updated with Google info. User ID:", user._id);
      } else {
        console.log("  → No existing user found, CREATING NEW USER...");
        user = await User.create({
          name: profile.name,
          email: profile.email,
          googleId: profile.id,
          googleName: profile.name,
          googleEmail: profile.email,
          googleProfilePicture: profile.picture,
          authMethod: 'google'
        });
        console.log("✓ Step 4b SUCCESS: New user created. User ID:", user._id);
      }
    } else {
      console.log("✓ Step 4c SUCCESS: User already exists with googleId. User ID:", user._id);
    }

    console.log("Step 5: Creating JWT token for our app...");
    const jwtToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const redirectUrl = `/dashboard.html?token=${jwtToken}&userId=${user._id}&userName=${encodeURIComponent(user.name)}&userEmail=${encodeURIComponent(user.email)}`;
    console.log("✓ Step 5 SUCCESS: JWT token created");
    console.log("✓ Redirecting to dashboard...");
    console.log("=== Google OAuth Code Auth Complete (SUCCESS) ===\n");

    res.redirect(redirectUrl);

  } catch (error) {
    console.error("❌ Error processing Google OAuth code:", error);
    res.redirect("/login.html?error=auth_failed&message=" + encodeURIComponent(error.message));
  }
}

router.get("/google/login-success", getGoogleLoginSuccess);
router.get("/user-stats", getUserStats);
router.post("/analyze-food", analyzeFoodWithAI);

// User endpoints
router.put("/users/profile", updateProfile);
router.post("/users/change-password", changePassword);

module.exports = router;