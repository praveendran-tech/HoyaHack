// server.js
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");

dotenv.config();

const app = express();

app.use(
  cors({
    origin: ["http://hoya-hack.vercel.app/"], // Replace with your actual frontend URL
    methods: ["GET", "POST", "PUT", "DELETE","OPTIONS"], // Specify allowed methods
    allowedHeaders: ["Content-Type", "Authorization"], // Specify allowed headers
    credentials: true, // If you need to allow cookies
  })
);

// Define allowed origins
const allowedOrigins = ["http://hoya-hack.vercel.app/"]
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ["GET", "POST", "PUT", "DELETE","OPTIONS"],
  credentials: true,
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // Serve static files

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use("/api/patients", require("./routes/patient"));
app.use("/api/doctors", require("./routes/doctor")); // Updated to include doctor routes

// Root Route
app.get("/", (req, res) => {
  res.send("AI Diagnosis Backend is running");
});

// Start Server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
