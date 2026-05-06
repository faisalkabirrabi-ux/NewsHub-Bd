import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import axios from "axios";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Mock News Storage
  let newsArticles = [
    {
      id: "1",
      title: "জাতীয় সংবাদ: নতুন অর্থনৈতিক নীতি ঘোষণা",
      summary: "দেশের অর্থনীতিকে শক্তিশালী করতে নতুন একগুচ্ছ পদক্ষেপ নিয়েছে সরকার।",
      content: "সরকারের পক্ষ থেকে জানানো হয়েছে যে এই নীতি আগামী মাস থেকে কার্যকর হবে...",
      category: "national",
      source: "Prothom Alo",
      url: "https://prothomalo.com",
      image: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&q=80",
      time: "২ ঘণ্টা আগে"
    },
    {
      id: "2",
      title: "খেলাধুলা: বাংলাদেশের জয়!",
      summary: "শেষ বলের রোমাঞ্চে জয় ছিনিয়ে নিল টাইগাররা।",
      content: "বোলারদের নিয়ন্ত্রিত বোলিং আর ব্যাটসম্যানদের দৃঢ়তায় এই জয় সম্ভব হয়েছে...",
      category: "sports",
      source: "Daily Star",
      url: "https://thedailystar.net",
      image: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&q=80",
      time: "৫ ঘণ্টা আগে"
    }
  ];

  app.get("/api/news", async (req, res) => {
    // Sync with external source if available (e.g. Github RAW file)
    let externalNews: any[] = [];
    if (process.env.EXTERNAL_NEWS_URL) {
      try {
        const response = await axios.get(process.env.EXTERNAL_NEWS_URL);
        externalNews = Array.isArray(response.data) ? response.data : [];
        console.log("Synced news from external source");
      } catch (err) {
        console.error("Failed to sync from external source:", (err as Error).message);
      }
    }
    
    // Merge mock storage with external news
    const combined = [...newsArticles, ...externalNews];
    // Remove duplicates by ID
    const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
    
    res.json(unique);
  });

  app.post("/api/news", (req, res) => {
    const newArticle = {
      ...req.body,
      id: String(Date.now() + Math.random())
    };
    newsArticles.unshift(newArticle);
    res.status(201).json(newArticle);
  });

  app.delete("/api/news/:id", (req, res) => {
    const { id } = req.params;
    newsArticles = newsArticles.filter(n => String(n.id) !== String(id));
    res.status(204).send();
  });

  app.patch("/api/news/:id", (req, res) => {
    const { id } = req.params;
    newsArticles = newsArticles.map(n => String(n.id) === String(id) ? { ...n, ...req.body } : n);
    res.json({ success: true });
  });

  // Example API route for fetching server-side news if needed
  app.get("/api/news/trending", (req, res) => {
    // This could call Firestore or a scraping service
    res.json({ message: "Feature coming soon" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
