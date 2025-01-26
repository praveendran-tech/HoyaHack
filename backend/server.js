const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");

// Load environment variables
dotenv.config();

const app = express();

// Define CORS configuration with proper format
// Notice we remove the trailing slash from the origin URL as it should match exactly
const corsOptions = {
    origin: 'https://hoya-hack.vercel.app',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 204,
    maxAge: 86400 // Cache preflight request results for 24 hours
};

// Apply CORS configuration - we only need to call this once
app.use(cors(corsOptions));

// Add middleware to handle CORS preflight requests and logging
app.use((req, res, next) => {
    // Set CORS headers explicitly for additional security
    res.header('Access-Control-Allow-Origin', 'https://hoya-hack.vercel.app');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');

    // Log requests for debugging
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);

    // Handle OPTIONS requests
    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }
    
    next();
});

// Parse JSON bodies
app.use(express.json());

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// MongoDB Connection with enhanced error handling
mongoose
    .connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("MongoDB connected successfully"))
    .catch((err) => {
        console.error("MongoDB connection error:", err);
        process.exit(1); // Exit process with failure if database connection fails
    });

// Routes
app.use("/api/patients", require("./routes/patient"));
app.use("/api/doctors", require("./routes/doctor"));

// Root route with more informative response
app.get("/", (req, res) => {
    res.json({ 
        status: "active",
        message: "AI Diagnosis Backend is running",
        version: "1.0"
    });
});

// Global error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        error: "Internal Server Error",
        message: err.message
    });
});

// Start server with environment variable support
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`CORS enabled for origin: ${corsOptions.origin}`);
});

module.exports = app;