const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// Root route (health check)
app.get("/", (req, res) => {
  res.send("Server is running ✅");
});

// ===============================
// 📰 NEWS API ROUTE (FIXED)
// ===============================
app.get("/api/news", async (req, res) => {
  try {
    const response = await fetch(
      `https://newsapi.org/v2/top-headlines?country=bd&apiKey=${process.env.NEWS_API_KEY}`
    );

    const data = await response.json();

    if (!data.articles) {
      return res.status(500).json({ error: "No news found" });
    }

    res.json(data.articles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error fetching news" });
  }
});

// ===============================
// PORT SETUP (IMPORTANT FOR RENDER)
// ===============================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});