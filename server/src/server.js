import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes.js";
import complaintRoutes from "./routes/complaintRoutes.js";
import cors from "cors";

dotenv.config();

const app = express();

// CORS configuration - UPDATED for Docker
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true
}));

app.use(express.json());

// MongoDB connection with Docker support
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI, {
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    });
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    // Retry connection after 5 seconds for Docker compatibility
    setTimeout(connectDB, 5000);
  }
};

// Health check endpoint for Docker
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.status(200).json({
    status: 'OK',
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

// Test route
app.get('/api', (req, res) => {
  res.json({ message: '✅ Backend API is working!' });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);

// Start server
const port = process.env.PORT || 5000;

// Connect to DB and start server
connectDB().then(() => {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`API available at http://localhost:${port}`);
    console.log(`Health check at http://localhost:${port}/health`);
  });
}).catch(err => {
  console.error("Failed to start server:", err);
});