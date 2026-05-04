import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Newspaper, Tv, Globe, MapPin, X, ArrowUpRight, Search, Menu, Bookmark, BookmarkCheck, Share2, Image as ImageIcon, Download, Volume2, PauseCircle, Sparkles, RefreshCw, TrendingUp, Type, Coins, Bot, ExternalLink, Home, Trophy } from 'lucide-react';
import { topNews, banglaPapers, englishPapers, tvChannels, internationalChannels, NewsArticle, MediaSource } from './data';
import { AIBot } from './AIBot';

const categoryPrompts: Record<string, string> = {
  national: "Bangladesh news, politics, Dhaka city, culture, flag of Bangladesh",
  international: "World news, global events, diplomacy, United Nations",
  sports: "Stadium, sports action, cricket, football, trophy",
  tech: "Technology, artificial intelligence, gadgets, software, cyber",
  entertainment: "Cinema, celebrity, music, red carpet, movie theater",
  visa: "Immigration, passport, travel documents, airport, world map",
  bangla: "Bangladesh local news, newspaper, Dhaka life",
  english: "International business, global news, corporate",
  default: "News update, newspaper, broadcast studio, modern media"
};

const getAIImage = (title: string, category: string) => {
  const baseKeyword = categoryPrompts[category] || categoryPrompts.default;
  // Improve seed variety using title hash + length to avoid collisions on similar starts
  const hash = title.split('').reduce((acc, char, i) => acc + (char.charCodeAt(0) * (i + 1)), 0);
  const seed = Math.abs(hash) % 1000000;
  
  // Clean title for URL safety but keep enough context
  // Remove non-alphanumeric except spaces for better prompt parsing
  const cleanTitle = title.replace(/[^\w\s\u0980-\u09FF]/gi, ' ').substring(0, 120);
  
  // High quality photojournalism prompt
  const prompt = `Professional news photography, high-quality editorial style, award-winning photojournalism, cinematic lighting, sharp focus, 8k resolution. Subject: ${cleanTitle}. Context: ${baseKeyword}. No text, no captions, highly realistic.`;
  
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1200&height=800&nologo=true&seed=${seed}&model=flux`;
};

const fallbackImages = [
  'https://images.unsplash.com/photo-1546422904-90eab23c3d7e?auto=format&fit=crop&q=80&w=1200&h=800',
  'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=1200&h=800',
  'https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&q=80&w=1200&h=800',
  'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&q=80&w=1200&h=800'
];

const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>, title: string, category: string) => {
  const target = e.currentTarget;
  if (target.getAttribute('data-failed-all')) return;
  target.onerror = null; 
  
  if (target.src.includes('pollinations.ai')) {
    const hash = title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    target.src = fallbackImages[hash % fallbackImages.length];
    target.setAttribute('data-failed-some', 'true');
    return;
  }
  
  if (target.getAttribute('data-failed-some')) {
    // If even fallback failed
    target.src = 'https://via.placeholder.com/1200x800/111/555?text=No+Photo';
    target.setAttribute('data-failed-all', 'true');
    return;
  }
  
  target.src = getAIImage(title, category);
};

const getNoPhotoPlaceholder = () => "https://images.unsplash.com/photo-1594322436404-5a0526db4d13?q=80&w=1200&h=800&auto=format&fit=crop"; // A "No Photo" type image 


const categoryStyles: Record<string, { accent: string, text: string, bg: string, gradient: string }> = {
  national: { 
    accent: 'bg-emerald-500', 
    text: 'text-emerald-400', 
    bg: 'from-emerald-500/10', 
    gradient: 'hover:shadow-emerald-500/10' 
  },
  international: { 
    accent: 'bg-blue-500', 
    text: 'text-blue-400', 
    bg: 'from-blue-500/10', 
    gradient: 'hover:shadow-blue-500/10' 
  },
  sports: { 
    accent: 'bg-orange-500', 
    text: 'text-orange-400', 
    bg: 'from-orange-500/10', 
    gradient: 'hover:shadow-orange-500/10' 
  },
  tech: { 
    accent: 'bg-purple-500', 
    text: 'text-purple-400', 
    bg: 'from-purple-500/10', 
    gradient: 'hover:shadow-purple-500/10' 
  },
  entertainment: { 
    accent: 'bg-pink-500', 
    text: 'text-pink-400', 
    bg: 'from-pink-500/10', 
    gradient: 'hover:shadow-pink-500/10' 
  },
  visa: { 
    accent: 'bg-cyan-500', 
    text: 'text-cyan-400', 
    bg: 'from-cyan-500/10', 
    gradient: 'hover:shadow-cyan-500/10' 
  },
  bangla: { 
    accent: 'bg-orange-600', 
    text: 'text-orange-400', 
    bg: 'from-orange-600/10', 
    gradient: 'hover:shadow-orange-600/10' 
  },
  english: { 
    accent: 'bg-blue-700', 
    text: 'text-blue-300', 
    bg: 'from-blue-700/10', 
    gradient: 'hover:shadow-blue-700/10' 
  },
  default: { 
    accent: 'bg-red-600', 
    text: 'text-red-400', 
    bg: 'from-red-600/10', 
    gradient: 'hover:shadow-red-600/10' 
  }
};

type Tab = 'home' | 'national' | 'international' | 'sports' | 'tech' | 'entertainment' | 'visa' | 'photocards' | 'saved' | 'bangla' | 'english' | 'tv' | 'intl_tv';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [embeddedUrl, setEmbeddedUrl] = useState<{ url: string; name: string } | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [savedArticles, setSavedArticles] = useState<string[]>([]);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTickerIndex, setCurrentTickerIndex] = useState(0);

  const [liveNews, setLiveNews] = useState<NewsArticle[]>(topNews);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isScraping, setIsScraping] = useState(false);
  const [isGHSynced, setIsGHSynced] = useState(false);
  const [syncTime, setSyncTime] = useState('সদ্য আপডেট করা হয়েছে');
  const [liveScore, setLiveScore] = useState({ runs: 156, wickets: 4, overs: 18.2 });
  const [prayerTime, setPrayerTime] = useState('পরবর্তী নামাজ: লোড হচ্ছে...');
  const [currentDateString, setCurrentDateString] = useState('সোমবার, ২২ মে ২০২৪');
  const [articleTextSize, setArticleTextSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [isAIBotOpen, setIsAIBotOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const dynamicCategories = React.useMemo(() => {
    const cats = new Set(liveNews.filter(n => n.category !== 'international' || activeTab === 'international').map(n => n.category));
    const mainCats = ['national', 'bangla', 'english', 'sports', 'tech', 'entertainment', 'visa'];
    const sorted = (Array.from(cats) as string[]).sort((a, b) => {
        const indexA = mainCats.indexOf(a);
        const indexB = mainCats.indexOf(b);
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return a.localeCompare(b);
    });
    return ['all', ...sorted];
  }, [liveNews, activeTab]);

  const getTextSizeClass = () => {
    switch(articleTextSize) {
      case 'large': return 'text-xl leading-relaxed';
      case 'xlarge': return 'text-2xl leading-loose';
      default: return 'text-lg leading-relaxed';
    }
  };

  const formatTimeFrom24 = (time24: string) => {
    const parts = time24.split(':');
    if (parts.length < 2) return time24;
    let h = parseInt(parts[0], 10);
    const m = parts[1];
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${m} ${ampm}`;
  };

  React.useEffect(() => {
    const fetchPrayerTime = async () => {
      try {
        const res = await fetch('https://api.aladhan.com/v1/timingsByCity?city=Dhaka&country=Bangladesh&method=1');
        const data = await res.json();
        if (data && data.data && data.data.timings) {
          const timings = data.data.timings;
          const now = new Date();
          const currentTimeInt = now.getHours() * 60 + now.getMinutes();

          const prayers = [
            { name: 'ফজর', time: timings.Fajr },
            { name: 'যোহর', time: timings.Dhuhr },
            { name: 'আসর', time: timings.Asr },
            { name: 'মাগরিব', time: timings.Maghrib },
            { name: 'এশা', time: timings.Isha },
          ];

          let nextPrayer = null;
          for (const prayer of prayers) {
            const parts = prayer.time.split(':');
            if (parts.length >= 2) {
              const h = parseInt(parts[0], 10);
              const m = parseInt(parts[1], 10);
              const prayerTimeInt = h * 60 + m;
              if (prayerTimeInt > currentTimeInt) {
                nextPrayer = { ...prayer, timeLabel: formatTimeFrom24(prayer.time) };
                break;
              }
            }
          }

          if (!nextPrayer) {
            nextPrayer = { name: 'ফজর', timeLabel: formatTimeFrom24(prayers[0].time) };
          }

          setPrayerTime(`পরবর্তী নামাজ: ${nextPrayer.name} (${nextPrayer.timeLabel})`);
        }
      } catch(e) {
        setPrayerTime('পরবর্তী নামাজ: আসর (৪:১৫ PM)');
      }
    };
    
    fetchPrayerTime();
    const pInterval = setInterval(fetchPrayerTime, 60 * 60 * 1000);
    return () => clearInterval(pInterval);
  }, []);

  const fetchRSS = React.useCallback(async () => {
    setIsRefreshing(true);
    setIsScraping(true);
    try {
      // Fetching multiple categories for better coverage
      const categories = [
        { url: 'https://news.google.com/rss?hl=bn&gl=BD&ceid=BD:bn', cat: 'national' },
        { url: 'https://news.google.com/rss/headlines/section/topic/WORLD?hl=bn&gl=BD&ceid=BD:bn', cat: 'international' },
        { url: 'https://news.google.com/rss/headlines/section/topic/SPORTS?hl=bn&gl=BD&ceid=BD:bn', cat: 'sports' },
        { url: 'https://news.google.com/rss/headlines/section/topic/TECHNOLOGY?hl=bn&gl=BD&ceid=BD:bn', cat: 'tech' },
        { url: 'https://news.google.com/rss/headlines/section/topic/ENTERTAINMENT?hl=bn&gl=BD&ceid=BD:bn', cat: 'entertainment' },
        { url: 'https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en', cat: 'english' },
        { url: 'https://www.banglanews24.com/rss/rss.xml', cat: 'national' },
        { url: 'https://www.ittefaq.com.bd/rss.xml', cat: 'national' },
        { url: 'https://www.bd-pratidin.com/rss.xml', cat: 'national' }
      ];

      let allFetchedNews: NewsArticle[] = [];

      // Try direct GitHub JSON fetch from the specific user-provided links
      const ghSources = [
        'https://raw.githubusercontent.com/faisalkabirrabi-ux/my-news-portal/main/news.json',
        'https://raw.githubusercontent.com/faisalkabir/my-news-portal/main/news.json',
        'https://faisalkabirrabi-ux.github.io/my-news-portal/news.json',
        'https://faisalkabirrabi-ux.github.io/my-news-portal/data.json'
      ];

      console.log("Starting GitHub Sync...");

      for (const ghUrl of ghSources) {
        try {
          const ghRes = await fetch(ghUrl + `?t=${Date.now()}`); 
          if (ghRes.ok) {
            const ghData = await ghRes.json();
            console.log(`Successfully fetched from ${ghUrl}`, ghData);
            setIsGHSynced(true);
            if (Array.isArray(ghData)) {
              const ghNews: NewsArticle[] = ghData.map((item: any, i: number) => ({
                id: item.id || `gh-${i}-${Date.now()}`,
                title: item.title || item.news_title || 'শিরোনাম নেই',
                summary: item.summary || item.description || item.news_detail || 'সারসংক্ষেপ নেই',
                content: item.content || item.summary || item.news_detail || '',
                source: item.source || 'আমার নিউজ পোর্টাল',
                time: item.time || 'সদ্য আপডেট (GitHub)',
                image: item.image || item.news_image || getAIImage(item.title || item.news_title || 'সংবাদ', (item.category || item.news_category || 'national').toLowerCase()),
                category: (item.category || item.news_category || 'national').toLowerCase() as any,
                url: item.url || item.link || item.news_link || 'https://faisalkabirrabi-ux.github.io/my-news-portal/',
                timestamp: Date.now() + 2000000 - i // Forced high priority
              }));
              allFetchedNews = [...allFetchedNews, ...ghNews];
            } else if (typeof ghData === 'object' && ghData !== null) {
              // Truly automatic categorization based on JSON keys
              Object.entries(ghData).forEach(([key, items]) => {
                if (Array.isArray(items)) {
                  const cat = key.toLowerCase();
                  const mappedItems = items.map((item: any, i: number) => ({
                    id: item.id || `gh-${cat}-${i}-${Date.now()}`,
                    title: item.title || item.news_title || 'শিরোনাম নেই',
                    summary: item.summary || item.description || item.news_detail || 'সারসংক্ষেপ নেই',
                    content: item.content || item.summary || item.description || item.news_detail || '',
                    source: item.source || 'আমার নিউজ পোর্টাল',
                    time: item.time || 'সদ্য আপডেট (GitHub)',
                    image: item.image || item.news_image || getAIImage(item.title || item.news_title || 'সংবাদ', cat),
                    category: cat,
                    url: item.link || item.url || item.news_link || 'https://faisalkabirrabi-ux.github.io/my-news-portal/',
                    timestamp: Date.now() + 2000000 - i // Forced high priority
                  }));
                  allFetchedNews = [...allFetchedNews, ...mappedItems];
                }
              });
            }
            console.log(`Added news items from GitHub, Total now: ${allFetchedNews.length}`);
          }
        } catch (err) {
          console.warn(`Direct GH Sync failed for ${ghUrl}`, err);
        }
      }

      for (const feed of categories) {
        try {
          const cacheBuster = `t=${Date.now()}`;
          const finalUrl = feed.url.includes('?') ? `${feed.url}&${cacheBuster}` : `${feed.url}?${cacheBuster}`;
          const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(finalUrl)}`);
          const data = await res.json();
          
          if (data.status === 'ok') {
             const fNews: NewsArticle[] = data.items.map((item: any, i: number) => {
               const sourceStr = item.title.includes(' - ') ? item.title.split(' - ').pop() : 'সংবাদ মাধ্যম';
               const titleStr = item.title.includes(' - ') ? item.title.substring(0, item.title.lastIndexOf(' - ')) : item.title;
               
               // Try to extract image from enclosure, thumbnail, or description HTML
               let originalImage = '';
               if (item.enclosure && item.enclosure.link) {
                 originalImage = item.enclosure.link;
               } else if (item.thumbnail) {
                 originalImage = item.thumbnail;
               } else {
                 // Extract from description HTML if available
                 const imgMatch = (item.description || '').match(/<img[^>]+src="([^">]+)"/);
                 if (imgMatch && imgMatch[1]) {
                   originalImage = imgMatch[1];
                   // Ensure protocol is present
                   if (originalImage.startsWith('//')) originalImage = 'https:' + originalImage;
                 }
               }

               return {
                  id: item.guid || `live-${feed.cat}-${i}-${Date.now()}`,
                  title: titleStr,
                  summary: (item.description || '').replace(/<[^>]+>/g, '').substring(0, 150) + '...',
                  content: (item.content || titleStr).replace(/<[^>]+>/g, '') + `\n\nসূত্র: ${sourceStr}`,
                  source: sourceStr,
                  time: 'সদ্য আপডেট',
                  image: originalImage || getAIImage(titleStr, feed.cat),
                  category: feed.cat,
                  url: item.link,
                  timestamp: new Date(item.pubDate).getTime()
               };
             });
             allFetchedNews = [...allFetchedNews, ...fNews];
          }
        } catch (e) {
          console.warn(`Failed to fetch ${feed.cat} news`, e);
        }
      }
      
      // Deduplicate at the very top to prevent internal glitches
      const freshUnique = new Map();
      allFetchedNews.forEach(n => {
        const key = `${n.title.trim().toLowerCase()}-${n.source}`;
        if (!freshUnique.has(key)) freshUnique.set(key, n);
      });
      const deduplicated = Array.from(freshUnique.values()) as NewsArticle[];

      if (deduplicated.length > 0) {
         setLiveNews(prev => {
            const combined = [...deduplicated, ...prev];
            const unique = new Map();
            combined.forEach(n => {
               const titleKey = n.title.trim().toLowerCase();
               // Keep the most recent version of the article
               if (!unique.has(titleKey)) {
                 unique.set(titleKey, n);
               } else {
                 const existing = unique.get(titleKey);
                 if ((n.timestamp || 0) > (existing.timestamp || 0)) {
                   unique.set(titleKey, n);
                 }
               }
            });
            // Sort by timestamp descending
            const sorted = Array.from(unique.values()).sort((a: any, b: any) => 
               (b.timestamp || 0) - (a.timestamp || 0)
            );
            // Keep a healthy buffer for the news feed
            return sorted.slice(0, 100) as NewsArticle[];
         });
         
         const d = new Date();
         setSyncTime(`সদ্য আপডেট: ${d.toLocaleTimeString('bn-BD', {hour: '2-digit', minute:'2-digit'})}`);
      }
    } catch(e) {
      console.error("News sync failed", e);
    } finally {
      setIsRefreshing(false);
      setTimeout(() => setIsScraping(false), 2000);
    }
  }, []);

  React.useEffect(() => {
    fetchRSS();
    // Refresh every 2 minutes for background updates
    const newsInterval = setInterval(fetchRSS, 2 * 60 * 1000);

    const sportsInterval = setInterval(() => {
       setLiveScore(prev => {
          let nOvers = prev.overs + 0.1;
          if ((nOvers * 10) % 10 > 5) {
             nOvers = Math.floor(prev.overs) + 1.0;
          }
          return {
             runs: prev.runs + Math.floor(Math.random() * 4), 
             wickets: prev.wickets,
             overs: parseFloat(nOvers.toFixed(1))
          };
       });
    }, 12000);

    return () => {
       clearInterval(newsInterval);
       clearInterval(sportsInterval);
    };
  }, []);

  React.useEffect(() => {
    if (liveNews.length === 0) return;
    const interval = setInterval(() => {
      setCurrentTickerIndex((prev) => (prev + 1) % liveNews.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [liveNews.length]);

  React.useEffect(() => {
    const days = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
    const months = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
    const engToBnNum = (str: string) => {
      const bnNumbers = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
      return str.replace(/[0-9]/g, w => bnNumbers[Number(w)]);
    };

    const d = new Date();
    const dayName = days[d.getDay()];
    const dateNum = engToBnNum(d.getDate().toString());
    const monthName = months[d.getMonth()];
    const yearNum = engToBnNum(d.getFullYear().toString());
    
    setCurrentDateString(`${dayName}, ${dateNum} ${monthName} ${yearNum}`);
  }, []);

  const handleShare = async (news: NewsArticle) => {
    const shareData = {
      title: news.title,
      text: news.summary,
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err: any) {
        if (err.name !== 'AbortError' && !err.message?.includes('canceled') && !err.message?.includes('cancelled')) {
          console.error("Error sharing:", err);
        }
      }
    } else {
      navigator.clipboard.writeText(`${news.title}\n${window.location.href}`);
      alert("লিংক কপি করা হয়েছে!");
    }
  };

  const handleDownloadImage = (news: NewsArticle) => {
    const img = new Image();
    const cacheBuster = news.image.includes('?') ? `&t=${Date.now()}` : `?t=${Date.now()}`;
    
    img.crossOrigin = "anonymous";
    img.src = news.image + cacheBuster;
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          alert("দুঃখিত, আপনার ফোনটি এই ফিচারটি সাপোর্ট করছে না।");
          return;
        }

        canvas.width = img.width || 800;
        canvas.height = img.height || 500;

        ctx.drawImage(img, 0, 0);

        const margin = canvas.width * 0.05;
        const fontSize = Math.max(20, canvas.width * 0.04);
        ctx.font = `bold ${fontSize}px "Inter", sans-serif`;
        const watermarkText = "NewsHub BD";
        
        const metrics = ctx.measureText(watermarkText);
        const x = canvas.width - metrics.width - margin;
        const y = canvas.height - margin;

        ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;

        ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
        ctx.fillText(watermarkText, x, y);

        // Using toBlob for better compatibility in WebViews
        canvas.toBlob((blob) => {
          if (!blob) {
            // Fallback to dataURL if blob fails
            const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
            triggerDownload(dataUrl, `NewsHubBD-${news.id || Date.now()}.jpg`);
            return;
          }
          const blobUrl = URL.createObjectURL(blob);
          triggerDownload(blobUrl, `NewsHubBD-${news.id || Date.now()}.jpg`);
          // Clean up to avoid memory leaks
          setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
        }, 'image/jpeg', 0.9);

      } catch (err) {
        console.error("Download failed:", err);
        alert("ছবিটি সরাসরি সেভ করা যাচ্ছে না। দয়া করে ছবির ওপর লম্বা সময় টাচ করে ধরে রেখে 'Download Image' অপশনটি ব্যবহার করুন।");
      }
    };

    img.onerror = () => {
      alert("ছবিটির সোর্স থেকে সেভ করার অনুমতি নেই।");
    };
  };

  const triggerDownload = (url: string, filename: string) => {
    try {
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      window.open(url, '_blank');
      alert("ছবিটি ওপেন হয়েছে, এখন সেভ করার জন্য ছবির ওপর টাচ করে ধরে রাখুন।");
    }
  };

  const handleSpeak = (text: string) => {
    // Robust check for speechSynthesis support
    const hasSupport = 'speechSynthesis' in window && window.speechSynthesis !== undefined;
    
    if (hasSupport) {
      try {
        if (isPlaying) {
          window.speechSynthesis.cancel();
          setIsPlaying(false);
          return;
        }

        // Create the utterance
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Mobile browsers often need specific rate and pitch for non-default languages
        utterance.lang = 'bn-BD';
        utterance.rate = 0.85; // Slightly slower for better clarity in WebViews
        utterance.pitch = 1.0;
        
        // Event handlers
        utterance.onstart = () => setIsPlaying(true);
        utterance.onend = () => setIsPlaying(false);
        utterance.onerror = (event) => {
          console.error("SpeechSynthesis error:", event);
          setIsPlaying(false);
          
          if (event.error === 'not-allowed') {
            alert("ভয়েস ব্যবহারের অনুমতি নেই। আপনার ফোনের সেটিংসে 'Text-to-speech' অপশনটি চেক করুন।");
          } else if (event.error === 'language-unavailable') {
            alert("আপনার ফোনে বাংলা ভয়েস প্যাকটি ইনস্টল করা নেই।");
          } else {
            alert("দুঃখিত, এই মুহূর্তে অডিও চালু করা সম্ভব হচ্ছে না।");
          }
        };

        // Some WebViews require immediate speak call after user interaction
        window.speechSynthesis.cancel(); // Clear any pending tasks
        window.speechSynthesis.speak(utterance);
        
        // Immediate fallback if it doesn't trigger onstart quickly (common in WebViews)
        setTimeout(() => {
          if (window.speechSynthesis.speaking) {
            setIsPlaying(true);
          }
        }, 100);

      } catch (err) {
        console.error("Speech Synthesis exception:", err);
        alert("আপনার ব্রাউজারটি অডিও ফিচার সাপোর্ট করছে না।");
      }
    } else {
      alert("দুঃখিত, আপনার ব্রাউজার বা অ্যাপটি ভয়েস ফিচার সাপোর্ট করছে না। Chrome ব্রাউজার ব্যবহার করার চেষ্টা করুন।");
    }
  };

  const closeArticle = () => {
    setSelectedArticle(null);
    setIsPlaying(false);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  const filterNews = (category?: string) => {
    let filtered = liveNews;
    
    if (activeTab === 'saved') {
      filtered = liveNews.filter(news => savedArticles.includes(news.id));
    } else if (activeTab === 'home') {
      if (category && category !== 'all') {
        filtered = liveNews.filter((news) => news.category === category);
      } else {
        // Exclude international, english, and bangla from home unless explicitly selected
        filtered = liveNews.filter((news) => news.category !== 'international' && news.category !== 'english' && news.category !== 'bangla');
      }
    } else if (activeTab === 'english') {
      filtered = liveNews.filter((news) => news.category === 'english');
    } else if (activeTab === 'bangla') {
      filtered = liveNews.filter((news) => news.category === 'bangla');
    } else if (category) {
      filtered = liveNews.filter((news) => news.category === category);
    } else if (['national', 'international', 'sports', 'tech', 'entertainment', 'visa'].includes(activeTab)) {
      filtered = liveNews.filter((news) => news.category === activeTab);
    }

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(news => 
        news.title.toLowerCase().includes(q) || 
        news.summary.toLowerCase().includes(q)
      );
    }

    return filtered;
  };

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  const toggleBookmark = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (savedArticles.includes(id)) {
      setSavedArticles(savedArticles.filter(savedId => savedId !== id));
    } else {
      setSavedArticles([...savedArticles, id]);
    }
  };

  const NavButtons = () => (
    <nav className="flex flex-wrap md:flex-nowrap gap-4 md:gap-6 items-center w-full overflow-x-auto pb-2 md:pb-0 scrollbar-hide shrink-0" aria-label="Main Navigation">
      <button onClick={() => handleTabChange('home')} className={`font-bengali text-sm font-bold uppercase whitespace-nowrap tracking-wider transition-colors shrink-0 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none rounded-sm ${activeTab === 'home' ? 'text-white border-b-2 border-red-600 pb-1' : 'text-gray-300 hover:text-red-500 border-b-2 border-transparent pb-1'}`}>হোম</button>
      <button onClick={() => handleTabChange('national')} className={`font-bengali text-sm font-bold uppercase whitespace-nowrap tracking-wider transition-colors shrink-0 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none rounded-sm ${activeTab === 'national' ? 'text-white border-b-2 border-red-600 pb-1' : 'text-gray-400 hover:text-red-500 border-b-2 border-transparent pb-1'}`}>বাংলাদেশ</button>
      <button onClick={() => handleTabChange('international')} className={`font-bengali text-sm font-bold uppercase whitespace-nowrap tracking-wider transition-colors shrink-0 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none rounded-sm ${activeTab === 'international' ? 'text-white border-b-2 border-red-600 pb-1' : 'text-gray-400 hover:text-red-500 border-b-2 border-transparent pb-1'}`}>আন্তর্জাতিক</button>
      <button onClick={() => handleTabChange('sports')} className={`font-bengali text-sm font-bold uppercase whitespace-nowrap tracking-wider transition-colors shrink-0 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none rounded-sm ${activeTab === 'sports' ? 'text-white border-b-2 border-red-600 pb-1' : 'text-gray-400 hover:text-red-500 border-b-2 border-transparent pb-1'}`}>খেলাধুলা</button>
      <button onClick={() => handleTabChange('tech')} className={`font-bengali text-sm font-bold uppercase whitespace-nowrap tracking-wider transition-colors shrink-0 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none rounded-sm ${activeTab === 'tech' ? 'text-white border-b-2 border-red-600 pb-1' : 'text-gray-400 hover:text-red-500 border-b-2 border-transparent pb-1'}`}>প্রযুক্তি</button>
      <button onClick={() => handleTabChange('entertainment')} className={`font-bengali text-sm font-bold uppercase whitespace-nowrap tracking-wider transition-colors shrink-0 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none rounded-sm ${activeTab === 'entertainment' ? 'text-white border-b-2 border-red-600 pb-1' : 'text-gray-400 hover:text-red-500 border-b-2 border-transparent pb-1'}`}>বিনোদন</button>
      <button onClick={() => handleTabChange('visa')} className={`font-bengali text-sm font-bold uppercase whitespace-nowrap tracking-wider transition-colors shrink-0 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none rounded-sm ${activeTab === 'visa' ? 'text-white border-b-2 border-red-600 pb-1' : 'text-gray-400 hover:text-red-500 border-b-2 border-transparent pb-1'}`}>ভিসা</button>
      <div className="w-px h-4 bg-gray-700 shrink-0 hidden md:block"></div>
      <button onClick={() => handleTabChange('photocards')} className={`font-bengali text-sm font-bold uppercase whitespace-nowrap tracking-wider transition-colors shrink-0 flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none rounded-sm ${activeTab === 'photocards' ? 'text-white border-b-2 border-red-600 pb-1' : 'text-gray-400 hover:text-red-500 border-b-2 border-transparent pb-1'}`}>
        <ImageIcon className="w-3.5 h-3.5" aria-hidden="true" /> ফটো কার্ড
      </button>
      <button onClick={() => handleTabChange('saved')} className={`font-bengali text-sm font-bold uppercase whitespace-nowrap tracking-wider transition-colors shrink-0 flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none rounded-sm ${activeTab === 'saved' ? 'text-white border-b-2 border-red-600 pb-1' : 'text-gray-400 hover:text-red-500 border-b-2 border-transparent pb-1'}`}>
        <Bookmark className="w-3.5 h-3.5" aria-hidden="true" /> সেভ করা
      </button>
      <div className="md:hidden w-px h-4 bg-gray-700 shrink-0"></div>
      <button onClick={() => handleTabChange('bangla')} className={`font-bengali text-sm font-bold uppercase whitespace-nowrap tracking-wider transition-colors shrink-0 text-blue-400 hover:text-blue-300 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none rounded-sm ${activeTab === 'bangla' ? 'border-b-2 border-blue-500 pb-1' : 'border-b-2 border-transparent pb-1'}`}>পত্রিকা</button>
      <button onClick={() => handleTabChange('english')} className={`font-bengali text-sm font-bold uppercase whitespace-nowrap tracking-wider transition-colors shrink-0 text-blue-400 hover:text-blue-300 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none rounded-sm ${activeTab === 'english' ? 'border-b-2 border-blue-500 pb-1' : 'border-b-2 border-transparent pb-1'}`}>English</button>
      <button onClick={() => handleTabChange('tv')} className={`font-bengali text-sm font-bold uppercase whitespace-nowrap tracking-wider transition-colors shrink-0 text-blue-400 hover:text-blue-300 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none rounded-sm ${activeTab === 'tv' ? 'border-b-2 border-blue-500 pb-1' : 'border-b-2 border-transparent pb-1'}`}>টিভি চ্যানেল</button>
      <button onClick={() => handleTabChange('intl_tv')} className={`font-bengali text-sm font-bold uppercase whitespace-nowrap tracking-wider transition-colors shrink-0 text-blue-400 hover:text-blue-300 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none rounded-sm ${activeTab === 'intl_tv' ? 'border-b-2 border-blue-500 pb-1' : 'border-b-2 border-transparent pb-1'}`}>আন্তর্জাতিক টিভি</button>
    </nav>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-200 font-sans flex flex-col">
      {/* Top Utility Bar */}
      <div className="bg-[#050505] border-b border-gray-900 px-4 md:px-8 py-1.5 flex justify-between items-center text-[10px] sm:text-xs text-gray-500 font-bengali tracking-wide">
        <div className="flex items-center gap-3 md:gap-4 overflow-x-auto scrollbar-hide shrink-0">
          <span className="hidden sm:block shrink-0">📅 {currentDateString}</span>
          <span className="flex items-center gap-1 shrink-0 text-yellow-500/80">
            <Coins className="w-3 h-3" /> $1 = ৳117.50
          </span>
        </div>
        <div className="flex items-center gap-3 md:gap-4 shrink-0">
          {isScraping && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-1.5 text-red-500 animate-pulse px-2 py-0.5 bg-red-600/10 rounded-full border border-red-600/20"
            >
              <Bot className="w-3 h-3" />
              <span className="text-[9px] font-bold">SCRAPER ACTIVE</span>
            </motion.div>
          )}
          {isGHSynced && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-1.5 text-blue-500 px-2 py-0.5 bg-blue-600/10 rounded-full border border-blue-600/20"
            >
              <ExternalLink className="w-3 h-3" />
              <span className="text-[9px] font-bold uppercase">GH synced</span>
            </motion.div>
          )}
          <span className="hidden lg:flex items-center gap-1 text-emerald-600/80 shrink-0">
            🕌 {prayerTime}
          </span>
          <button 
            onClick={() => fetchRSS()}
            disabled={isRefreshing}
            className={`hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 hover:bg-blue-500/20 text-blue-400/90 hover:text-blue-300 transition-all shrink-0 focus:outline-none focus:ring-1 focus:ring-blue-500/50 ${isRefreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
            title="রিফ্রেশ করুন"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="font-bold">{isRefreshing ? 'লোডিং...' : syncTime}</span>
          </button>
        </div>
      </div>

      {/* Header */}
      <header className="bg-black/90 backdrop-blur-xl border-b border-white/5 px-4 md:px-8 py-4 sticky top-0 z-40 shadow-2xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-white font-black text-2xl md:text-3xl tracking-tighter flex items-center gap-2">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-400">NEWS</span>
              <motion.span 
                animate={{ y: [0, -3, 0] }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 1.5, 
                  ease: "easeInOut" 
                }}
                className="opacity-90 font-serif italic font-normal inline-block"
              >
                Hub
              </motion.span>
            </div>
            <div className="h-6 w-[1px] bg-gray-800 mx-2 hidden md:block"></div>
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-red-600/10 border border-red-600/20 rounded-full text-[10px] text-red-400 uppercase tracking-widest font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span> LIVE
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            <NavButtons />
          </div>

          <div className="flex items-center gap-4">
            <div className={`bg-[#111] rounded-full flex items-center border border-gray-800 focus-within:border-gray-600 focus-within:bg-[#1a1a1a] focus-within:ring-2 focus-within:ring-red-500/20 transition-all ${isSearchActive ? 'w-48 px-4 py-2' : 'w-10 h-10 justify-center md:w-auto md:px-4 md:py-2 md:justify-start'}`}>
              <button onClick={() => setIsSearchActive(!isSearchActive)} aria-label={isSearchActive ? "সার্চ বন্ধ করুন" : "সার্চ চালু করুন"} className="md:hidden flex items-center justify-center text-gray-400 hover:text-white focus:outline-none">
                <Search className="w-4 h-4" />
              </button>
              <Search className="w-4 h-4 text-gray-400 hidden md:block" aria-hidden="true" />
              <label htmlFor="news-search" className="sr-only">খবর সার্চ করুন</label>
              <input 
                id="news-search"
                type="text" 
                placeholder="সার্চ করুন..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`bg-transparent border-none outline-none text-sm text-gray-200 placeholder-gray-600 font-bengali ${isSearchActive ? 'ml-2 w-full block' : 'hidden md:block md:ml-3'}`}
              />
            </div>
            <button aria-label="মোবাইল মেনু" className="md:hidden p-2 rounded-full bg-[#111] border border-gray-800 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-red-500" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Trending Tags */}
      <div className="bg-[#050505] border-b border-gray-900 py-2 px-4 md:px-8 overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-4 text-xs font-bengali">
          <span className="text-red-500 font-bold shrink-0 flex items-center gap-1"><TrendingUp className="w-3 h-3"/> ট্রেন্ডিং:</span>
          {['ক্রিকেট', 'ফিলিস্তিন', 'স্মার্টফোন', 'কৃত্রিম বুদ্ধিমত্তা', 'ভিসা'].map(tag => (
            <button 
              key={tag}
              onClick={() => {
                setSearchQuery(tag);
                setIsSearchActive(true);
                setActiveTab('home');
              }}
              className="text-gray-400 hover:text-white bg-[#111] px-3 py-1 rounded-full border border-gray-800 hover:border-gray-600 hover:shadow-lg hover:shadow-red-600/5 transition-all shrink-0 whitespace-nowrap"
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden bg-[#0f0f0f] border-t border-gray-800 mt-4 px-2 py-4 flex flex-col gap-4 overflow-hidden"
            >
              <NavButtons />
            </motion.div>
          )}
        </AnimatePresence>

      {/* Breaking Ticker */}
      <div 
        className="bg-red-600/10 border-b border-red-600/20 py-2 px-4 md:px-8 flex items-center overflow-hidden cursor-pointer hover:bg-red-600/20 transition-colors"
        onClick={() => liveNews[currentTickerIndex] && setSelectedArticle(liveNews[currentTickerIndex])}
      >
        <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded mr-4 shrink-0 uppercase tracking-wider">ব্রেকিং নিউজ</span>
        <div className="flex-1 relative h-5">
          <AnimatePresence mode="popLayout">
            {liveNews[currentTickerIndex] && (
              <motion.p
                key={currentTickerIndex}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="text-sm font-medium text-gray-300 truncate italic font-bengali absolute inset-0 max-w-full hover:text-white transition-colors"
              >
                {liveNews[currentTickerIndex].title} — {liveNews[currentTickerIndex].summary}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Live Sports Ticker */}
      <div className="bg-[#080808] border-b border-gray-800 py-2 px-4 md:px-8 flex items-center gap-4 md:gap-6 font-bengali overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-2 shrink-0 border-r border-gray-800 pr-4">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
          <span className="font-bold text-gray-400 uppercase tracking-widest text-[10px]">লাইভ স্পোর্টস</span>
        </div>
        <div className="flex gap-4 min-w-max">
          <div className="flex items-center gap-3 bg-[#111] px-3 py-1 rounded text-xs border border-gray-800">
            <span className="font-bold text-green-500">BAN</span>
            <span className="text-white font-bold">{liveScore.runs}/{liveScore.wickets}</span>
            <span className="text-gray-500">({liveScore.overs})</span>
            <span className="text-gray-600">vs</span>
            <span className="font-bold text-blue-400">IND</span>
            <span className="text-gray-400 italic text-[10px] ml-2">লাইভ আপডেট হচ্ছে...</span>
          </div>
          <div className="flex items-center gap-3 bg-[#111] px-3 py-1 rounded text-xs border border-gray-800">
            <span className="font-bold text-red-500">ENG</span>
            <span className="text-white font-bold">210/2</span>
            <span className="text-gray-500 text-[10px]">Won by 8 wkts</span>
            <span className="text-gray-600">vs</span>
            <span className="font-bold text-yellow-500">AUS</span>
            <span className="font-bold text-gray-500">189/8</span>
          </div>
          <div className="flex items-center gap-3 bg-[#111] px-3 py-1 rounded text-xs border border-gray-800">
            <span className="font-bold text-white">REAL MADRID</span>
            <span className="text-white font-bold">2 - 1</span>
            <span className="font-bold text-blue-500">BARCELONA</span>
            <span className="text-red-500 animate-pulse text-[10px] ml-2">88'</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-8 flex flex-col items-stretch">
        
        {/* News Feed Sections */}
        {['home', 'national', 'international', 'sports', 'tech', 'entertainment', 'visa', 'saved', 'english', 'bangla'].includes(activeTab) && (
          <div className="space-y-6">
            
            {activeTab === 'home' && (
               <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-2 scrollbar-hide no-scrollbar">
                {dynamicCategories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-5 py-2.5 rounded-2xl text-[11px] font-black font-bengali whitespace-nowrap transition-all border ${
                      selectedCategory === cat 
                        ? 'bg-red-600 border-red-600 text-white shadow-xl shadow-red-600/30' 
                        : 'bg-[#111] border-gray-800 text-gray-500 hover:border-gray-600 hover:text-white hover:bg-[#161616]'
                    }`}
                  >
                    {cat === 'all' ? 'সব সংবাদ' : 
                     cat === 'national' ? 'বাংলাদেশ' :
                     cat === 'international' ? 'আন্তর্জাতিক' :
                     cat === 'sports' ? 'খেলাধুলা' :
                     cat === 'tech' ? 'প্রযুক্তি' :
                     cat === 'entertainment' ? 'বিনোদন' :
                     cat === 'visa' ? 'ভিসা' :
                     cat === 'bangla' ? 'বাংলা সংবাদ' :
                     cat === 'english' ? 'English News' : cat.toUpperCase()}
                  </button>
                ))}
              </div>
            )}

            <div className="p-4 border-b border-gray-800 flex items-center justify-between mb-2 bg-[#111] rounded-t-2xl">
              <h2 className="text-xs font-bold text-red-500 uppercase tracking-widest flex items-center gap-2 font-bengali">
                {activeTab !== 'saved' && <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>}
                {activeTab === 'home' && (selectedCategory === 'all' ? 'শীর্ষ সংবাদ' : (
                  selectedCategory === 'national' ? 'জাতীয় সংবাদ' :
                  selectedCategory === 'international' ? 'আন্তর্জাতিক সংবাদ' :
                  selectedCategory === 'sports' ? 'খেলার খবর' :
                  selectedCategory === 'tech' ? 'প্রযুক্তি সংবাদ' :
                  selectedCategory === 'entertainment' ? 'বিনোদন সংবাদ' :
                  selectedCategory === 'visa' ? 'ভিসা ও ইমিগ্রেশন' : 
                  selectedCategory === 'bangla' ? 'বাংলা সংবাদ' :
                  selectedCategory === 'english' ? 'English News' : selectedCategory.toUpperCase()
                ))}
                {activeTab === 'national' && 'জাতীয় সংবাদ'}
                {activeTab === 'international' && 'আন্তর্জাতিক সংবাদ'}
                {activeTab === 'sports' && 'খেলার খবর'}
                {activeTab === 'tech' && 'প্রযুক্তি সংবাদ'}
                {activeTab === 'entertainment' && 'বিনোদন সংবাদ'}
                {activeTab === 'visa' && 'ভিসা ও ইমিগ্রেশন'}
                {activeTab === 'bangla' && 'বাংলা সংবাদ'}
                {activeTab === 'english' && 'English News'}
                {activeTab === 'saved' && 'সেভ করা খবর'}
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filterNews(
                activeTab === 'saved' || activeTab === 'english' || activeTab === 'bangla'
                  ? undefined 
                  : (activeTab === 'home' 
                      ? (selectedCategory === 'all' ? undefined : selectedCategory)
                      : activeTab
                    )
              ).length === 0 ? (
                <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-24 bg-[#111] rounded-3xl border border-dashed border-gray-800">
                  <Bot className="w-12 h-12 text-gray-700 mx-auto mb-4 opacity-20" />
                  <div className="text-gray-500 font-bengali text-lg">
                    কোনো খবর পাওয়া যায়নি।
                  </div>
                  <button 
                    onClick={() => fetchRSS()}
                    className="mt-6 px-6 py-2 bg-red-600 text-white rounded-full font-bengali text-sm hover:bg-red-700 transition-colors"
                  >
                    আবার চেষ্টা করুন
                  </button>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {filterNews(
                    activeTab === 'saved' || activeTab === 'english' || activeTab === 'bangla'
                      ? undefined 
                      : (activeTab === 'home' 
                          ? (selectedCategory === 'all' ? undefined : selectedCategory)
                          : activeTab
                        )
                  ).map((news) => {
                const style = categoryStyles[news.category] || categoryStyles.default;
                return (
                  <motion.article 
                    key={news.id} 
                    tabIndex={0}
                    role="button"
                    aria-label={news.title}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedArticle(news); } }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    className={`bg-[#0f0f0f] border border-gray-800/80 rounded-3xl group cursor-pointer hover:border-gray-700/50 shadow-xl ${style.gradient} focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none transition-all duration-500 flex flex-col overflow-hidden relative`}
                    onClick={() => setSelectedArticle(news)}
                  >
                    {/* Glossy Overlay on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0 pointer-events-none"></div>
                    
                    <div className="absolute top-4 right-4 z-30 flex flex-col gap-2">
                      <button 
                        onClick={(e) => toggleBookmark(e, news.id)}
                        className="p-2.5 bg-black/40 rounded-xl hover:bg-black/90 backdrop-blur-md transition-all border border-white/5 opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                        aria-label={savedArticles.includes(news.id) ? "রিমুভ করুন" : "সেভ করুন"}
                        title={savedArticles.includes(news.id) ? "রিমুভ করুন" : "সেভ করুন"}
                      >
                        {savedArticles.includes(news.id) ? (
                          <BookmarkCheck className="w-4 h-4 text-green-400" aria-hidden="true" />
                        ) : (
                          <Bookmark className="w-4 h-4 text-white" aria-hidden="true" />
                        )}
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleShare(news); }}
                        className="p-2.5 bg-black/40 rounded-xl hover:bg-black/90 backdrop-blur-md transition-all border border-white/5 opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                        aria-label="শেয়ার করুন"
                        title="শেয়ার করুন"
                      >
                        <Share2 className="w-4 h-4 text-white" aria-hidden="true" />
                      </button>
                    </div>

                    <div className="h-60 overflow-hidden relative bg-gray-900">
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-transparent to-black/20 z-10 pointer-events-none"></div>
                      <img 
                        loading="lazy" 
                        src={news.image} 
                        alt="" 
                        referrerPolicy="no-referrer"
                        onError={(e) => handleImageError(e, news.title, news.category)}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out" 
                      />
                      <div className={`absolute top-4 left-4 ${style.accent} backdrop-blur-md text-white text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-[0.15em] z-20 shadow-[0_4px_12px_rgba(0,0,0,0.5)] border border-white/10`}>
                    {style.accent.includes('emerald') ? 'বাংলাদেশ' : 
                     style.accent.includes('blue') && news.category === 'international' ? 'আন্তর্জাতিক' : 
                     news.category === 'sports' ? 'খেলাধুলা' : 
                     news.category === 'tech' ? 'প্রযুক্তি' : 
                     news.category === 'entertainment' ? 'বিনোদন' : 
                     news.category === 'visa' ? 'ভিসা' : 
                     news.category === 'bangla' ? 'বাংলা' :
                     news.category === 'english' ? 'English' : news.category}
                      </div>
                    </div>

                    <div className={`p-6 flex-1 flex flex-col bg-gradient-to-b ${style.bg} to-[#0a0a0a] transition-all duration-500`}>
                      <div className="flex items-center gap-2 mb-3">
                         <div className={`w-1 h-4 ${style.accent} rounded-full`}></div>
                         <span className={`text-[10px] font-black uppercase tracking-widest ${style.text}`}>{news.source}</span>
                      </div>
                      <h3 className="text-xl font-bold font-bengali leading-snug mb-3 line-clamp-2 text-white group-hover:text-white transition-colors tracking-tight">{news.title}</h3>
                      <p className="text-sm font-bengali text-gray-400 leading-relaxed line-clamp-3 mb-6 opacity-80 group-hover:opacity-100 transition-opacity">{news.summary}</p>
                      
                      <div className="mt-auto flex items-center justify-between text-[10px] text-gray-500 font-bold uppercase tracking-widest pt-5 border-t border-white/5">
                        <div className="flex items-center gap-2">
                           <RefreshCw className="w-3 h-3 group-hover:rotate-180 transition-transform duration-700" />
                           <span>{news.time}</span>
                        </div>
                        <div className="flex items-center gap-1 group/btn text-gray-400 group-hover:text-white transition-colors">
                          <span className="font-bengali">বিস্তারিত</span>
                          <ArrowUpRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </motion.article>
                )})}
                </AnimatePresence>
              )}
            </div>
          </div>
        )}

        {/* Photo Cards Section */}
        {activeTab === 'photocards' && (
          <div className="space-y-8">
            <div className="p-4 border-b border-gray-800 flex items-center justify-between mb-6 bg-[#111] rounded-t">
              <h2 className="text-xs font-bold text-red-500 uppercase tracking-widest flex items-center gap-2 font-bengali">
                <ImageIcon className="w-4 h-4 text-red-600" /> ফেইসবুক ফটো কার্ড
              </h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {liveNews.slice(0, 9).map(news => (
                <div key={`card-${news.id}`} className="flex flex-col gap-4">
                  <div 
                    tabIndex={0}
                    role="button"
                    aria-label={`ফটোকার্ড: ${news.title}`}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleShare(news); } }}
                    className="relative aspect-square bg-[#0f0f0f] overflow-hidden rounded-2xl group border border-gray-800/80 hover:border-gray-700 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none transition-all duration-500 shadow-2xl hover:shadow-red-600/5"
                  >
                    <img 
                      loading="lazy" 
                      src={news.image} 
                      alt="" 
                      referrerPolicy="no-referrer"
                      onError={(e) => handleImageError(e, news.title, news.category)}
                      className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-700" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                    
                    <div className="relative z-10 p-6 flex flex-col h-full">
                      <div className="flex justify-between items-start mb-auto">
                        <span className="bg-white/10 backdrop-blur-md text-white border border-white/20 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
                          {news.source}
                        </span>
                        <span className="text-white/40 text-[10px] font-bengali uppercase tracking-widest font-bold tracking-widest">NewsHub BD</span>
                      </div>
                      
                      <div className="mt-auto">
                        <h3 className="text-2xl font-bold font-bengali text-white leading-snug mb-3 drop-shadow-md">
                          "{news.title}"
                        </h3>
                        <p className="text-gray-300 font-bengali text-sm line-clamp-3 opacity-90 leading-relaxed">{news.summary}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 px-1">
                    <button 
                      onClick={() => handleShare(news)}
                      aria-label={`${news.title} শেয়ার করুন`}
                      className="flex-1 bg-[#1a1a1a] hover:bg-[#222] border border-gray-800 text-gray-300 font-bengali py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all hover:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <Share2 className="w-4 h-4" /> শেয়ার করুন
                    </button>
                    <button 
                      onClick={() => handleDownloadImage(news)}
                      aria-label={`${news.title} ফটোকার্ড সেভ করুন`}
                      className="flex-1 bg-red-600/10 hover:bg-red-600/20 border border-red-600/20 text-red-400 font-bengali py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <Download className="w-4 h-4" /> সেভ ছবি
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Media Sources Sections */}
        {(activeTab === 'bangla' || activeTab === 'english' || activeTab === 'tv' || activeTab === 'intl_tv') && (
          <div className="space-y-8">
            <div className="p-4 border-b border-gray-800 flex items-center justify-between mb-6 bg-[#111] rounded-t">
              <h2 className="text-xs font-bold text-blue-500 uppercase tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                {activeTab === 'intl_tv' ? 'আন্তর্জাতিক টিভি চ্যানেল' : activeTab === 'tv' ? 'লাইভ টিভি চ্যানেল' : activeTab === 'bangla' ? 'বাংলা পত্রিকা' : 'English Newspapers'}
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {(activeTab === 'bangla' ? banglaPapers : activeTab === 'english' ? englishPapers : activeTab === 'intl_tv' ? internationalChannels : tvChannels).map((source) => (
                <motion.button
                  key={source.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  aria-label={`${source.name} ওপেন করুন`}
                  onClick={() => {
                    if (activeTab === 'intl_tv') {
                      window.open(source.url, '_blank');
                    } else {
                      setEmbeddedUrl({ url: source.url, name: source.name });
                    }
                  }}
                  className="bg-[#111] border border-gray-800 rounded p-4 flex flex-col items-center justify-center gap-3 hover:bg-[#1a1a1a] hover:border-gray-600 hover:shadow-xl hover:shadow-blue-900/5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all group aspect-square"
                >
                  <div className="w-14 h-14 rounded-full bg-white/95 flex items-center justify-center p-2 shadow-inner group-hover:bg-white group-hover:shadow-[0_0_15px_rgba(220,38,38,0.3)] transition-all overflow-hidden border border-gray-700/50">
                    <img 
                      loading="lazy"
                      src={`https://www.google.com/s2/favicons?domain=${new URL(source.url).hostname}&sz=128`} 
                      alt="" 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain filter group-hover:brightness-110"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                    <span className="hidden text-xs font-bold text-gray-800 uppercase" aria-hidden="true">{source.logoText}</span>
                  </div>
                  <span className="font-medium text-sm text-gray-300 group-hover:text-white font-bengali">
                    {source.name}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* Article Reader Modal */}
      <AnimatePresence>
        {selectedArticle && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 md:p-8 backdrop-blur-md"
            onClick={() => closeArticle()}
          >
            <motion.div 
              initial={{ y: 50, scale: 0.95 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 20, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0f0f0f] border border-gray-800 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl relative"
            >
              <button 
                onClick={() => closeArticle()}
                className="absolute top-4 right-4 p-2 bg-black/50 backdrop-blur rounded text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors z-30 border border-white/10"
                aria-label="বন্ধ করুন"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="h-64 sm:h-80 w-full relative bg-gray-900 border-b border-gray-800">
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-[#0f0f0f]/40 to-transparent z-10 pointer-events-none"></div>
                <img 
                  loading="lazy" 
                  src={selectedArticle.image} 
                  alt="" 
                  referrerPolicy="no-referrer"
                  onError={(e) => handleImageError(e, selectedArticle.title, selectedArticle.category)}
                  className="w-full h-full object-cover" 
                />
              </div>
              
              <div className="p-6 md:p-10 font-bengali relative z-20">
                <div className="flex items-center gap-3 text-xs text-gray-500 mb-4 uppercase tracking-widest flex-wrap">
                  <span className="bg-red-600/20 text-red-500 border border-red-600/30 px-2 py-0.5 rounded font-bold">
                    {selectedArticle.source}
                  </span>
                  <span>•</span>
                  <span>{selectedArticle.time}</span>
                  
                  <div className="ml-auto flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-[#111] border border-gray-800 rounded-full px-2 py-1 mr-2" role="group" aria-label="ফন্ট সাইজ পরিবর্তন করুন">
                       <button onClick={() => setArticleTextSize('normal')} className={`p-1 rounded-full focus:outline-none focus:ring-1 focus:ring-red-500 ${articleTextSize === 'normal' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-white'}`} aria-label="ছোট ফন্ট">
                         <Type className="w-3 h-3" />
                       </button>
                       <button onClick={() => setArticleTextSize('large')} className={`p-1 rounded-full focus:outline-none focus:ring-1 focus:ring-red-500 ${articleTextSize === 'large' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-white'}`} aria-label="মাঝারি ফন্ট">
                         <Type className="w-4 h-4" />
                       </button>
                       <button onClick={() => setArticleTextSize('xlarge')} className={`p-1 rounded-full focus:outline-none focus:ring-1 focus:ring-red-500 ${articleTextSize === 'xlarge' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-white'}`} aria-label="বড় ফন্ট">
                         <Type className="w-5 h-5" />
                       </button>
                    </div>
                    <button 
                      onClick={() => handleSpeak(selectedArticle.title + ". " + selectedArticle.content)}
                      aria-label={isPlaying ? "অডিও থামান" : "খবরটি অডিও হিসেবে শুনুন"}
                      className={`px-3 py-1.5 rounded-full flex items-center gap-2 transition-colors border focus:outline-none focus:ring-2 focus:ring-red-500 ${isPlaying ? 'bg-red-600/20 text-red-500 border-red-600/30' : 'bg-[#111] text-gray-400 border-gray-800 hover:text-white hover:bg-gray-800'}`}
                    >
                      {isPlaying ? <PauseCircle className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      <span className="font-bengali font-bold hidden sm:inline" aria-hidden="true">{isPlaying ? 'থামান' : 'খবরটি শুনুন'}</span>
                    </button>
                    
                    <button 
                      onClick={() => handleShare(selectedArticle)}
                      aria-label="শেয়ার করুন"
                      className="bg-[#111] text-gray-400 border border-gray-800 hover:text-white hover:bg-gray-800 px-3 py-1.5 rounded-full flex items-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <Share2 className="w-4 h-4" />
                      <span className="font-bengali font-bold hidden sm:inline" aria-hidden="true">শেয়ার</span>
                    </button>

                    <a 
                      href={selectedArticle.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-600/10 text-blue-400 border border-blue-600/20 hover:bg-blue-600/20 px-3 py-1.5 rounded-full flex items-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ml-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span className="font-bengali font-bold hidden sm:inline">বিস্তারিত</span>
                    </a>
                  </div>
                </div>
                
                <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-6 text-gray-100">{selectedArticle.title}</h1>
                
                <div className="prose prose-lg max-w-none text-gray-300">
                  <div className="bg-gradient-to-r from-blue-900/10 to-purple-900/10 border border-blue-800/20 rounded-lg p-5 mb-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 opacity-10">
                      <Sparkles className="w-16 h-16 text-blue-400" />
                    </div>
                    <h3 className="text-blue-400 font-bold mb-2 flex items-center gap-2 text-sm uppercase tracking-widest"><Sparkles className="w-4 h-4"/> সংবাদের এআই সারসংক্ষেপ</h3>
                    <p className={`text-gray-300 font-medium italic relative z-10 ${getTextSizeClass()}`}>
                      {selectedArticle.summary}
                    </p>
                  </div>
                  <p className={`whitespace-pre-line text-gray-300 ${getTextSizeClass()}`}>
                    {selectedArticle.content}
                  </p>
                </div>

                {/* Related News Section */}
                {liveNews.filter(n => n.id !== selectedArticle.id && n.category === selectedArticle.category).length > 0 && (
                  <div className="mt-12 pt-8 border-t border-gray-800">
                    <h3 className="text-xl font-bold mb-6 text-white flex items-center gap-2 relative">
                       <span className="w-1.5 h-6 bg-red-600 rounded-full inline-block mr-1"></span>
                       সম্পর্কিত খবর
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {liveNews.filter(n => n.id !== selectedArticle.id && n.category === selectedArticle.category).slice(0, 4).map(relatedNews => (
                        <div 
                          key={`related-${relatedNews.id}`} 
                          onClick={(e) => {
                            e.stopPropagation();
                            if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                            setIsPlaying(false);
                            setSelectedArticle(relatedNews);
                            // Scroll modal to top
                            const modalContent = e.currentTarget.closest('.overflow-y-auto');
                            if (modalContent) modalContent.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="flex gap-4 bg-[#111] p-3 rounded-lg border border-gray-800 hover:border-gray-600 hover:shadow-lg hover:shadow-black/50 transition-all cursor-pointer group"
                        >
                          <div className="w-24 h-24 sm:h-20 shrink-0 rounded overflow-hidden relative border border-gray-800">
                             <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10"></div>
                             <img 
                               loading="lazy" 
                               src={relatedNews.image} 
                               alt={relatedNews.title} 
                               referrerPolicy="no-referrer"
                               onError={(e) => handleImageError(e, relatedNews.title, relatedNews.category)}
                               className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                             />
                          </div>
                          <div className="flex flex-col flex-1 justify-between">
                            <h4 className="font-bold text-sm sm:text-base text-gray-200 group-hover:text-red-400 transition-colors line-clamp-2 md:line-clamp-3 leading-snug">{relatedNews.title}</h4>
                            <div className="mt-2 flex items-center justify-between text-[10px] text-gray-500 uppercase tracking-widest font-bengali">
                               <span className="font-bold">{relatedNews.source}</span>
                               <span>{relatedNews.time}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* External Embedded Browser Modal */}
      <AnimatePresence>
        {embeddedUrl && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#050505] z-50 flex flex-col"
          >
            <div className="bg-[#0f0f0f] border-b border-gray-800 px-4 py-3 flex items-center justify-between shadow-sm z-10">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setEmbeddedUrl(null)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <div>
                  <h3 className="font-bold text-gray-200 font-bengali text-lg leading-none">{embeddedUrl.name}</h3>
                  <a href={embeddedUrl.url} target="_blank" rel="noreferrer" className="text-[10px] text-gray-500 hover:text-red-400 flex items-center gap-1 mt-1">
                    {embeddedUrl.url} <ArrowUpRight className="w-3 h-3" />
                  </a>
                </div>
              </div>
              <a 
                href={embeddedUrl.url} 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-2 bg-red-600 text-white px-4 py-1.5 rounded text-xs font-bold uppercase tracking-wider hover:bg-red-700 transition"
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>Open</span>
              </a>
            </div>
            
            <div className="flex-1 bg-[#111] relative">
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center text-gray-600 z-0">
                <Globe className="w-16 h-16 mb-4 text-gray-800" />
                <h3 className="text-xl font-bold font-bengali mb-2 text-gray-400">Loading...</h3>
                <p className="font-bengali max-w-md text-sm">
                  যদি ওয়েবসাইটটি না দেখায়, তবে সিকিউরিটি পলিসির (X-Frame-Options) কারণে ব্রাউজার এটি ব্লক করতে পারে। দয়া করে ওপরের <b>"Open"</b> বাটনে ক্লিক করুন।
                </p>
              </div>
              <iframe 
                src={embeddedUrl.url} 
                className="w-full h-full border-none relative z-10 bg-white"
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                title={embeddedUrl.name}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Bot Component */}
      <AIBot isOpen={isAIBotOpen} onClose={() => setIsAIBotOpen(false)} />

      {/* AI Bot FAB */}
      {!isAIBotOpen && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsAIBotOpen(true)}
          className="fixed bottom-32 right-4 sm:right-8 z-40 bg-red-600 hover:bg-red-700 text-white rounded-full p-4 shadow-[0_0_20px_rgba(220,38,38,0.4)] flex items-center gap-3 group transition-all"
        >
          <Bot className="w-6 h-6" />
          <span className="font-bengali font-bold hidden group-hover:block transition-all">নিউজ হাব এআই</span>
        </motion.button>
      )}

      {/* Footer Status Bar */}
      <footer className="bg-[#050505] border-t border-gray-800 px-4 md:px-8 py-3 flex flex-col md:flex-row justify-between items-center text-[10px] text-gray-600 font-bold tracking-widest uppercase mt-auto">
        <div className="flex gap-4 mb-3 md:mb-0">
          <span className="font-bengali">সংযুক্ত সংবাদপত্র: ৬৪টি</span>
          <span className="font-bengali">টিভি চ্যানেল: ২২টি</span>
        </div>
        <div className="flex gap-4 items-center flex-wrap justify-center">
          <span className="text-green-600 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse"></span> সার্ভার স্ট্যাটাস: অপটিমাল
          </span>
          <span className="font-bengali">ডেভেলপার: <a href="https://www.facebook.com/share/1LBEzTyQoF/" target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-400 hover:underline">Faisal Kabir Rabi</a></span>
          <span className="font-bengali">© ২০২৪ নিউজহাব বাংলাদেশ লি:</span>
        </div>
      </footer>

      {/* Footer Navigation Bar */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 bg-[#0a0a0a]/95 backdrop-blur-md border-t border-gray-800/50 py-2 pb-safe-offset-2 lg:hidden">
        <div className="max-w-md mx-auto px-6 flex justify-between items-center">
          <button 
            onClick={() => {
              setActiveTab('home');
              setSelectedCategory('all');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'home' && selectedCategory === 'all' ? 'text-red-500' : 'text-gray-500'}`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] font-bold font-bengali">হোম</span>
          </button>
          
          <button 
            onClick={() => {
              setActiveTab('home');
              setSelectedCategory('national');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'home' && selectedCategory === 'national' ? 'text-red-500' : 'text-gray-500'}`}
          >
            <Newspaper className="w-5 h-5" />
            <span className="text-[10px] font-bold font-bengali">জাতীয়</span>
          </button>
          
          <button 
            onClick={() => {
              setActiveTab('home');
              setSelectedCategory('international');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'home' && selectedCategory === 'international' ? 'text-red-500' : 'text-gray-500'}`}
          >
            <Globe className="w-5 h-5" />
            <span className="text-[10px] font-bold font-bengali">আন্তর্জাতিক</span>
          </button>
          
          <button 
            onClick={() => {
              setActiveTab('home');
              setSelectedCategory('sports');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'home' && selectedCategory === 'sports' ? 'text-red-500' : 'text-gray-500'}`}
          >
            <Trophy className="w-5 h-5" />
            <span className="text-[10px] font-bold font-bengali">খেলা</span>
          </button>
        </div>
      </footer>

      {/* Desktop Footer (Optional addition for completeness) */}
      <footer className="hidden lg:block bg-[#070707] border-t border-gray-900 mt-20 py-12 pb-24">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="bg-red-600 p-1.5 rounded-lg">
                  <Newspaper className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-black italic tracking-tighter text-white">LIVE<span className="text-red-600">NEWS</span></span>
              </div>
              <p className="text-gray-500 max-w-sm mb-6 font-bengali">
                বাংলাদেশের জনপ্রিয় সংবাদপত্র ও নিউজ পোর্টালগুলো থেকে সর্বশেষ সংবাদ সবার আগে পেতে ভিজিট করুন লাইভ নিউজ। ২৪ ঘণ্টা আপডেট খবর।
              </p>
              <div className="flex items-center gap-4">
                <Bot className="w-5 h-5 text-red-600" />
                <span className="text-xs font-bold text-gray-600 uppercase tracking-widest">AI Content Discovery Active</span>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-6 font-bengali">সহজ লিংক</h4>
              <ul className="space-y-4 text-gray-500 font-bengali text-sm">
                <li><button onClick={() => { setActiveTab('home'); setSelectedCategory('all'); window.scrollTo({ top: 0 }); }} className="hover:text-red-500 transition-colors">হোম</button></li>
                <li><button onClick={() => { setActiveTab('home'); setSelectedCategory('national'); window.scrollTo({ top: 0 }); }} className="hover:text-red-500 transition-colors">জাতীয় সংবাদ</button></li>
                <li><button onClick={() => { setActiveTab('home'); setSelectedCategory('international'); window.scrollTo({ top: 0 }); }} className="hover:text-red-500 transition-colors">আন্তর্জাতিক</button></li>
                <li><button onClick={() => { setActiveTab('home'); setSelectedCategory('sports'); window.scrollTo({ top: 0 }); }} className="hover:text-red-500 transition-colors">খেলাধুলা</button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-6 font-bengali">বিভাগসমূহ</h4>
              <ul className="space-y-4 text-gray-500 font-bengali text-sm">
                <li><button onClick={() => setActiveTab('papers')} className="hover:text-red-500 transition-colors">আজকের পত্রিকা</button></li>
                <li><button onClick={() => setActiveTab('tv')} className="hover:text-red-500 transition-colors">লাইভ টিভি</button></li>
                <li><button onClick={() => setActiveTab('ai')} className="hover:text-red-500 transition-colors">এআই বট</button></li>
                <li><button onClick={() => { setActiveTab('home'); setSelectedCategory('tech'); window.scrollTo({ top: 0 }); }} className="hover:text-red-500 transition-colors">প্রযুক্তি</button></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-16 pt-8 border-t border-gray-900 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-600 text-[10px] uppercase tracking-[0.2em]">© 2026 LIVE NEWS PORTAL • POWERED BY AI</p>
            <div className="flex gap-6">
              <span className="text-gray-600 text-[10px] uppercase tracking-widest cursor-pointer hover:text-gray-400">Privacy</span>
              <span className="text-gray-600 text-[10px] uppercase tracking-widest cursor-pointer hover:text-gray-400">Terms</span>
              <span className="text-gray-600 text-[10px] uppercase tracking-widest cursor-pointer hover:text-gray-400">Cookies</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
