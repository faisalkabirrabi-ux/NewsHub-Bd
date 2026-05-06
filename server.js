const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

// Root route (important - না থাকলে error দেখাবে)
app.get("/", (req, res) => {
  res.send("Server is running ✅");
});

// Mongo connect (safe)
if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log("Mongo Error:", err));
}

// PORT FIX (MOST IMPORTANT)
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Running on port", PORT);
});