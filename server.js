const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.send("Server is running ✅");
});

// News API route
app.get("/api/news", async (req, res) => {
  try {
    const fetch = (await import("node-fetch")).default;

    const response = await fetch(
      `https://newsapi.org/v2/top-headlines?country=bd&apiKey=${process.env.NEWS_API_KEY}`
    );

    const data = await response.json();

    res.json(data.articles || []);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch news" });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});