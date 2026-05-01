const express = require("express");
const path = require("path");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");

// Load environment
const dotenv = require('dotenv');
const envPath = path.join(__dirname, ".env");
dotenv.config({ path: envPath });

// Configure Passport (side-effect: strategies registration)
require("./config/passport");

const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cors({
  origin: [
    "http://localhost:5000",
    "http://localhost:3000",
    "http://127.0.0.1:5000",
    "http://127.0.0.1:5500",
    "http://localhost:5500",
    "*"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-admin-key"]
}));

app.use(session({
  secret: process.env.JWT_SECRET || "your_session_secret",
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, httpOnly: true, maxAge: 24 * 60 * 60 * 1000 }
}));

app.use(passport.initialize());
app.use(passport.session());

// Request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Serve frontend static files
app.use(express.static(path.join(__dirname, "../annasetu_clients")));

// API routes
app.use("/api/auth", require("./routes/authroutes"));
app.use("/api/donations", require("./routes/donationroutes"));
app.use("/api/notifications", require("./routes/notificationroutes"));
app.use("/api/reviews", require("./routes/reviewroutes"));

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error', error: process.env.NODE_ENV === 'development' ? err : {} });
});

module.exports = app;
