import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import axios from "axios";
import Parser from "rss-parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize RSS Parser
const parser = new Parser({
  customFields: {
    item: ['media:content', 'media:thumbnail']
  }
});

// List of popular Bangladeshi RSS feeds
const RSS_FEEDS = [
  // Newspapers
  { url: 'https://www.prothomalo.com/feed', source: 'Prothom Alo', category: 'national' },
  { url: 'https://www.thedailystar.net/rss.xml', source: 'The Daily Star', category: 'national' },
  { url: 'https://www.dhakatribune.com/rss.xml', source: 'Dhaka Tribune', category: 'national' },
  { url: 'https://www.jugantor.com/feed', source: 'Jugantor', category: 'national' },
  { url: 'https://www.ittefaq.com.bd/feed', source: 'Ittefaq', category: 'national' },
  { url: 'https://samakal.com/feed', source: 'Samakal', category: 'national' },
  
  // TV Channels
  { url: 'https://www.somoynews.tv/feed', source: 'Somoy TV', category: 'general' },
  { url: 'https://www.jamuna.tv/feed', source: 'Jamuna TV', category: 'general' },
  { url: 'https://www.channelionline.com/feed', source: 'Channel i', category: 'general' },
  { url: 'https://www.independent24.com/feed', source: 'Independent TV', category: 'general' },
  
  // International
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', source: 'NYT World', category: 'international' }
];

// In-memory cache for RSS news to prevent spamming feeds on every request
let cachedRssNews: any[] = [];
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function fetchRssFeeds() {
  const now = Date.now();
  if (now - lastFetchTime < CACHE_DURATION && cachedRssNews.length > 0) {
    return cachedRssNews;
  }

  const allNews: any[] = [];

  for (const feedConfig of RSS_FEEDS) {
    try {
      const feed = await parser.parseURL(feedConfig.url);
      
      feed.items.forEach(item => {
        // Extract an image if available - checking multiple common fields
        let imageUrl = "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&q=80"; // Default placeholder
        
        if (item.enclosure && item.enclosure.url) {
          imageUrl = item.enclosure.url;
        } else if (item['media:content'] && item['media:content']['$'] && item['media:content']['$'].url) {
          imageUrl = item['media:content']['$'].url;
        } else if (item['media:thumbnail'] && item['media:thumbnail']['$'] && item['media:thumbnail']['$'].url) {
          imageUrl = item['media:thumbnail']['$'].url;
        } else if (item.content) {
          // Try to find an img tag in the content
          const imgMatch = item.content.match(/<img[^>]+src="([^">]+)"/);
          if (imgMatch && imgMatch[1]) {
            imageUrl = imgMatch[1];
          }
        }

        allNews.push({
          id: Buffer.from(item.guid || item.link || item.title || '').toString('base64'),
          title: item.title,
          summary: (item.contentSnippet || item.content || '').substring(0, 150) + "...",
          content: item.content || item.contentSnippet,
          category: feedConfig.category,
          source: feedConfig.source || feed.title,
          url: item.link,
          image: imageUrl,
          time: item.pubDate ? new Date(item.pubDate).toLocaleTimeString() : "Recent",
          timestamp: item.pubDate ? new Date(item.pubDate).getTime() : Date.now()
        });
      });
    } catch (err) {
      console.error(`Failed to fetch RSS from ${feedConfig.url}:`, (err as Error).message);
    }
  }

  // Sort by newest, take top 50
  allNews.sort((a, b) => b.timestamp - a.timestamp);
  cachedRssNews = allNews.slice(0, 50);
  lastFetchTime = now;
  
  return cachedRssNews;
}

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
    
    // Fetch and merge RSS news
    let rssNews: any[] = [];
    try {
      rssNews = await fetchRssFeeds();
    } catch (err) {
      console.error("Failed to fetch RSS news during request");
    }
    
    // Merge mock storage, external news, and RSS news
    const combined = [...newsArticles, ...externalNews, ...rssNews];
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
