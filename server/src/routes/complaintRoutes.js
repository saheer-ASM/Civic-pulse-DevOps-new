import express from "express";
import Complaint from "../models/complaint.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * Citizen: Create a new complaint
 */
router.post("/create", protect, async (req, res) => {
  try {
    const { title, description, department } = req.body;

    if (!title || !description || !department) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const complaint = await Complaint.create({
      citizen: req.user._id, // from auth middleware
      title,
      description,
      department,
    });

    res.status(201).json({ message: "Complaint registered", complaint });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/**
 * Citizen: View my complaints
 */
router.get("/my-complaints", protect, async (req, res) => {
  try {
    const complaints = await Complaint.find({ citizen: req.user._id });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * Authority: View complaints assigned to their department
 */
router.get("/authority", protect, async (req, res) => {
  try {
    if (req.user.role !== "authority") {
      return res.status(403).json({ message: "Access denied" });
    }

    const complaints = await Complaint.find({ department: req.user.department });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * Authority: Update complaint status
 */
router.patch("/:id/status", protect, async (req, res) => {
  try {
    if (req.user.role !== "authority") {
      return res.status(403).json({ message: "Access denied" });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    complaint.status = req.body.status || complaint.status;
    await complaint.save();

    res.json({ message: "Status updated", complaint });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/**
 * (Optional) Admin/Authority: Get all complaints
 */
router.get("/all", protect, async (req, res) => {
  try {
    if (req.user.role !== "authority") {
      return res.status(403).json({ message: "Access denied" });
    }

    const complaints = await Complaint.find({});
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * Citizen: Add a comment to a complaint
 */
router.post("/:id/comment", protect, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ message: "Message is required" });

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    // Only the owner (citizen) or authority can comment
    if (req.user.role === "citizen" && complaint.citizen.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not allowed to comment on this complaint" });
    }

    complaint.comments.push({ citizen: req.user._id, message });
    await complaint.save();

    res.status(201).json({ message: "Comment added", complaint });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});


export default router;
