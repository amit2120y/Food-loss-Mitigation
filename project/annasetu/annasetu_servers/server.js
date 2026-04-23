const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");


const envPath = path.join(__dirname, ".env");
const result = dotenv.config({ path: envPath });
if (result.error) {
  // Fallback to default config (will look in process.cwd())
  dotenv.config();
}

// Configure Passport (must be after dotenv.config())
require("./config/passport");

const connectDB = require("./config/db");

const app = express();

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
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
app.use("/api/donations", require("./routes/donationroutes"));
app.use("/api/notifications", require("./routes/notificationroutes"));

// Global error handling middleware (MUST be after all routes)
app.use((err, req, res, next) => {
  console.error("Global error handler:", err);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Route for serving frontend files - catch all remaining routes
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "../annasetu_clients/index.html"));
});

const PORT = process.env.PORT || 5000;

const http = require('http');
const { Server } = require('socket.io');
let io;

const startServer = async () => {
  try {
    await connectDB();
    const httpServer = http.createServer(app);
    io = new Server(httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    });

    // Socket.io connection
    io.on('connection', (socket) => {
      console.log('A user connected:', socket.id);
      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
      });
    });

    // Make io accessible in routes/controllers
    app.set('io', io);

    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error);
      process.exit(1);
    });

  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();