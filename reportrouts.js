// routes/reportRoutes.js
const express = require("express");
const router = express.Router();
const Report = require("../models/Report");

// Save a new report
router.post("/", async (req, res) => {
  try {
    const { title, description, citizenName } = req.body;
    const newReport = new Report({ title, description, citizenName });
    await newReport.save();
    res.status(201).json({ message: "Report submitted successfully", report: newReport });
  } catch (error) {
    res.status(500).json({ message: "Error saving report", error: error.message });
  }
});

// Get all reports
router.get("/", async (req, res) => {
  try {
    const reports = await Report.find();
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: "Error fetching reports", error: error.message });
  }
});

module.exports = router;
