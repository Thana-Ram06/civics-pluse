// models/Report.js
const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  citizenName: { type: String, required: true },
  status: { type: String, default: "Pending" }, // Pending, In Progress, Resolved
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Report", reportSchema);
