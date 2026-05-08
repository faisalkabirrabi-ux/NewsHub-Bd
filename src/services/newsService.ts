import { NewsArticle } from '../data';

export async function fetchLiveNews(category: string = 'all', maxRetries: number = 3): Promise<NewsArticle[]> {
  const API_KEY = 'pub_bc5de72ec8cb424e9ceecc4bec439f87';
  
  let url = `https://newsdata.io/api/1/news?apikey=${API_KEY}&country=bd&language=bn`;
  // Use English parameters for international or English requests
  if (category === 'english') {
    url = `https://newsdata.io/api/1/news?apikey=${API_KEY}&language=en`;
  }

  const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timeout = (attempt + 1) * 30000; // Increase timeout with each attempt
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      if (attempt > 0) {
        console.log(`Self-healing: News fetch retry attempt ${attempt}...`);
        await wait(attempt * 2000); // Wait before retrying (2s, 4s, 6s)
      }

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 429) {
            console.warn("NewsData.io Rate limit exceeded.");
            // Don't throw for 429 to avoid crashing, just return empty [] or fake error below
            throw new Error('Rate limit exceeded');
        }
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
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
            time: '', // will be populated outside or default
            image: news.image_url || null,
            category: category === 'english' ? 'english' : 'national',
            url: news.link || '',
            timestamp: itemTimestamp,
            author: Array.isArray(news.creator) ? news.creator[0] : null
          } as NewsArticle;
        });
      } else {
         throw new Error('NewsData backend did not return success status');
      }

    } catch (error: any) {
      clearTimeout(timeoutId);
      const isLastAttempt = attempt === maxRetries;
      
      if (error.name === 'AbortError') {
        console.warn(`Attempt ${attempt + 1} timed out`);
      } else {
        console.warn(`Attempt ${attempt + 1} failed: ${error.message}`);
        // If 429, don't spam retries too fast, wait longer or just break
        if (error.message.includes('Rate limit exceeded')) {
            await wait(5000);
        }
      }
      
      if (isLastAttempt) {
        console.error("Self-healing: All retry attempts exhausted for news fetch.");
        return [];
      }
    }
  }
  return [];
}
