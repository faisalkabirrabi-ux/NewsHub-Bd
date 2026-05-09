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
  { url: 'https://www.prothomalo.com/feed', source: 'Prothom Alo', category: 'national' },
  { url: 'https://www.thedailystar.net/rss.xml', source: 'The Daily Star', category: 'national' },
  { url: 'https://www.dhakatribune.com/rss.xml', source: 'Dhaka Tribune', category: 'national' },
  { url: 'https://www.jugantor.com/feed', source: 'Jugantor', category: 'national' },
  { url: 'https://www.ittefaq.com.bd/feed', source: 'Ittefaq', category: 'national' },
  { url: 'https://samakal.com/feed', source: 'Samakal', category: 'national' },
  { url: 'https://www.somoynews.tv/feed', source: 'Somoy TV', category: 'general' },
  { url: 'https://www.jamuna.tv/feed', source: 'Jamuna TV', category: 'general' },
  { url: 'https://www.channelionline.com/feed', source: 'Channel i', category: 'general' },
  { url: 'https://www.independent24.com/feed', source: 'Independent TV', category: 'general' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', source: 'NYT World', category: 'international' }
];

let cachedRssNews: any[] = [];
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000;

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
        let imageUrl = "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&q=80";
        if (item.enclosure && item.enclosure.url) imageUrl = item.enclosure.url;
        else if (item['media:content'] && item['media:content']['$'] && item['media:content']['$'].url) imageUrl = item['media:content']['$'].url;
        else if (item['media:thumbnail'] && item['media:thumbnail']['$'] && item['media:thumbnail']['$'].url) imageUrl = item['media:thumbnail']['$'].url;
        else if (item.content) {
          const imgMatch = item.content.match(/<img[^>]+src="([^">]+)"/);
          if (imgMatch && imgMatch[1]) imageUrl = imgMatch[1];
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
  allNews.sort((a, b) => b.timestamp - a.timestamp);
  cachedRssNews = allNews.slice(0, 50);
  lastFetchTime = now;
  return cachedRssNews;
}

const app = express();
const PORT = 3000;
app.use(express.json());

// API routes FIRST
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

let newsArticles: any[] = [];

app.get("/api/news", async (req, res) => {
  let rssNews: any[] = [];
  try { rssNews = await fetchRssFeeds(); } catch (err) {}
  const combined = [...newsArticles, ...rssNews];
  const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
  res.json(unique);
});

app.post("/api/news", (req, res) => {
  const newArticle = { ...req.body, id: String(Date.now() + Math.random()) };
  newsArticles.unshift(newArticle);
  res.status(201).json(newArticle);
});

// Production/Dev middleware setup
async function setupMiddlewares() {
  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath, { dotfiles: 'allow' }));
    app.get('*', (req, res) => {
      // Don't serve index.html for known API paths
      if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'Not Found' });
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }
}

setupMiddlewares();

// Only listen if not on Vercel
if (!process.env.VERCEL) {
  app.listen(PORT, "0.0.0.0", () => console.log(`Server running on port ${PORT}`));
}

export default app;
