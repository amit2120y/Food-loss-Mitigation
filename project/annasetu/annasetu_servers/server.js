const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const passport = require("passport");
const session = require("express-session");

// Load environment variables early so other modules can read them
dotenv.config();

// Configure Passport (must be after dotenv.config())
require("./config/passport");

const connectDB = require("./config/db");

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: ["http://localhost:5000", "http://localhost:3000", "http://127.0.0.1:5000", "http://127.0.0.1:5500", "http://localhost:5500", "*"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Session middleware for Passport
app.use(session({
  secret: process.env.JWT_SECRET || "your_session_secret",
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: false, // Set to true in production with HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Serve static files from frontend directory
app.use(express.static(path.join(__dirname, "../annasetu_clients")));

// Routes
app.use("/api/auth", require("./routes/authroutes"));

// Serve frontend files - catch all remaining routes
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "../annasetu_clients/index.html"));
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();