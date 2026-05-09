import { NewsArticle } from '../data';

export async function fetchLiveNews(category: string = 'all', maxRetries: number = 3): Promise<NewsArticle[]> {
  const API_KEY = import.meta.env.VITE_NEWSDATA_API_KEY || 'pub_bc5de72ec8cb424e9ceecc4bec439f87';
  
  let url = `https://newsdata.io/api/1/news?apikey=${API_KEY}&country=bd&language=bn`;
  // Use English parameters for international or English requests
  if (category === 'english') {
    url = `https://newsdata.io/api/1/news?apikey=${API_KEY}&language=en`;
  }

  const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timeout = (attempt + 1) * 15000; // Shorter timeout for mobile/fast UI
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      if (attempt > 0) {
        await wait(attempt * 1000); // Gradual backoff
      }

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 429) {
            // Rate limit is expected on free tiers, don't spam retries
            console.warn("NewsData.io Rate limit exceeded. Skipping live update.");
            return [];
        }
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status === "success" && data.results) {
        return data.results.map((news: any) => {
          let itemTimestamp = Date.now();
          if (news.pubDate) {
              const parsed = new Date(news.pubDate).getTime();
              if (!isNaN(parsed) && parsed > 0) {
                  itemTimestamp = parsed;
              }
          }

          return {
            id: news.article_id || Math.random().toString(36).substring(7),
            title: news.title || 'Untitled',
            summary: news.description || '',
            content: news.content || news.description || '',
            source: news.source_id || 'News Hub',
            time: '', 
            image: news.image_url || null,
            category: category === 'english' ? 'english' : 'national',
            url: news.link || '',
            timestamp: itemTimestamp,
            author: Array.isArray(news.creator) ? news.creator[0] : null
          } as NewsArticle;
        });
      } else {
         // Some versions return 200 OK but status: "error" in body for rate limit
         if (data.results?.message?.includes('rate limit') || data.status === "error") {
            console.warn("NewsData.io returned error:", data.results?.message || "Check API credits");
            return [];
         }
         throw new Error('NewsData backend error');
      }

    } catch (error: any) {
      clearTimeout(timeoutId);
      const isLastAttempt = attempt === maxRetries;
      
      if (error.name === 'AbortError') {
        // Silent timeout
      } else if (!isLastAttempt) {
        console.warn(`News sync retrying...`);
      }
      
      if (isLastAttempt) {
        // Return empty result silently if all retries fail
        return [];
      }
    }
  }
  return [];
}
