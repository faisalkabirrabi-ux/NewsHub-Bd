import { NewsArticle } from '../data';

export async function fetchLiveNews(category: string = 'general', retries: number = 1): Promise<NewsArticle[]> {
  const url = `https://newshub-bd.onrender.com/api/news?category=${category}`;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // Increased to 30 seconds

    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        const articlesArray = Array.isArray(data) ? data : (data.articles || []);
        
        return articlesArray.map((news: any) => {
          const image = news.urlToImage && news.urlToImage.startsWith("http")
            ? news.urlToImage
            : null;
            
          return {
            ...news,
            image,
          };
        });
      }
      console.warn(`Backend returned non-OK status: ${response.status} ${response.statusText}`);
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        console.error(`Live news fetch timed out [URL: ${url}] - Attempt ${attempt + 1}`);
        if (attempt === retries) {
          console.error("Max retries reached for live news fetch.");
        } else {
          // Wait a bit before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        }
      } else {
        console.error(`Failed to fetch live news from backend [URL: ${url}]:`, error.message || error);
        break;
      }
    }
  }
  return [];
}
