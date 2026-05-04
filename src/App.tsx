import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Newspaper, Tv, Globe, MapPin, X, ArrowUpRight, Search, Menu, Bookmark, BookmarkCheck, Share2, Image as ImageIcon, Download, Volume2, PauseCircle, Sparkles, RefreshCw, TrendingUp, Type, Coins } from 'lucide-react';
import { topNews, banglaPapers, englishPapers, tvChannels, NewsArticle, MediaSource } from './data';

const fallbackImages = [
  'https://images.unsplash.com/photo-1546422904-90eab23c3d7e?auto=format&fit=crop&q=80&w=800&h=500',
  'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=800&h=500',
  'https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&q=80&w=800&h=500',
  'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&q=80&w=800&h=500',
  'https://images.unsplash.com/photo-1526404809285-d72b53ea0cc3?auto=format&fit=crop&q=80&w=800&h=500',
  'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=800&h=500'
];

type Tab = 'home' | 'national' | 'international' | 'sports' | 'tech' | 'entertainment' | 'photocards' | 'saved' | 'bangla' | 'english' | 'tv';

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
  const [syncTime, setSyncTime] = useState('সদ্য আপডেট করা হয়েছে');
  const [liveScore, setLiveScore] = useState({ runs: 156, wickets: 4, overs: 18.2 });
  const [prayerTime, setPrayerTime] = useState('পরবর্তী নামাজ: লোড হচ্ছে...');
  const [articleTextSize, setArticleTextSize] = useState<'normal' | 'large' | 'xlarge'>('normal');

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

  React.useEffect(() => {
    const fetchRSS = async () => {
      setIsRefreshing(true);
      try {
        const rssUrl = 'https://news.google.com/rss?hl=bn&gl=BD&ceid=BD:bn';
        const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`);
        const data = await res.json();
        
        if (data.status === 'ok') {
           const fNews: NewsArticle[] = data.items.map((item: any, i: number) => {
             const sourceStr = item.title.includes(' - ') ? item.title.split(' - ').pop() : 'সংবাদ মাধ্যম';
             const titleStr = item.title.includes(' - ') ? item.title.substring(0, item.title.lastIndexOf(' - ')) : item.title;
             
             return {
                id: item.guid || `live-${i}-${Date.now()}`,
                title: titleStr,
                summary: (item.description || '').replace(/<[^>]+>/g, '').substring(0, 150) + '...',
                content: (item.content || titleStr).replace(/<[^>]+>/g, '') + `\n\nসূত্র: ${sourceStr}`,
                source: sourceStr,
                time: 'সদ্য আপডেট',
                image: fallbackImages[i % fallbackImages.length],
                category: i % 3 === 0 ? 'international' : 'national'
             };
           });
           
           setLiveNews(prev => {
              const combined = [...fNews, ...prev];
              const unique = new Map();
              combined.forEach(n => {
                 if (!unique.has(n.title)) unique.set(n.title, n);
              });
              return Array.from(unique.values()) as NewsArticle[];
           });
           
           const d = new Date();
           setSyncTime(`সর্বশেষ: ${d.toLocaleTimeString('bn-BD', {hour: '2-digit', minute:'2-digit'})}`);
        }
      } catch(e) {
        console.error("News sync failed", e);
      } finally {
        setIsRefreshing(false);
      }
    };

    fetchRSS();
    const newsInterval = setInterval(fetchRSS, 3 * 60 * 1000);

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

  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      if (isPlaying) {
        window.speechSynthesis.cancel();
        setIsPlaying(false);
      } else {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'bn-BD';
        utterance.rate = 0.9;
        utterance.onend = () => setIsPlaying(false);
        window.speechSynthesis.speak(utterance);
        setIsPlaying(true);
      }
    } else {
      alert("আপনার ব্রাউজার অডিও সাপোর্ট করে না।");
    }
  };

  const closeArticle = () => {
    setSelectedArticle(null);
    setIsPlaying(false);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  const filterNews = (category?: 'national' | 'international' | 'sports' | 'tech' | 'entertainment') => {
    let filtered = liveNews;
    
    if (activeTab === 'saved') {
      filtered = liveNews.filter(news => savedArticles.includes(news.id));
    } else if (category) {
      filtered = liveNews.filter((news) => news.category === category);
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
    <div className="flex flex-wrap md:flex-nowrap gap-4 md:gap-6 items-center w-full overflow-x-auto pb-2 md:pb-0 scrollbar-hide shrink-0">
      <button onClick={() => handleTabChange('home')} className={`font-bengali text-sm font-bold uppercase whitespace-nowrap tracking-wider transition-colors shrink-0 ${activeTab === 'home' ? 'text-white border-b-2 border-red-600 pb-1' : 'text-gray-400 hover:text-red-500 border-b-2 border-transparent pb-1'}`}>হোম</button>
      <button onClick={() => handleTabChange('national')} className={`font-bengali text-sm font-bold uppercase whitespace-nowrap tracking-wider transition-colors shrink-0 ${activeTab === 'national' ? 'text-white border-b-2 border-red-600 pb-1' : 'text-gray-400 hover:text-red-500 border-b-2 border-transparent pb-1'}`}>বাংলাদেশ</button>
      <button onClick={() => handleTabChange('international')} className={`font-bengali text-sm font-bold uppercase whitespace-nowrap tracking-wider transition-colors shrink-0 ${activeTab === 'international' ? 'text-white border-b-2 border-red-600 pb-1' : 'text-gray-400 hover:text-red-500 border-b-2 border-transparent pb-1'}`}>আন্তর্জাতিক</button>
      <button onClick={() => handleTabChange('sports')} className={`font-bengali text-sm font-bold uppercase whitespace-nowrap tracking-wider transition-colors shrink-0 ${activeTab === 'sports' ? 'text-white border-b-2 border-red-600 pb-1' : 'text-gray-400 hover:text-red-500 border-b-2 border-transparent pb-1'}`}>খেলাধুলা</button>
      <button onClick={() => handleTabChange('tech')} className={`font-bengali text-sm font-bold uppercase whitespace-nowrap tracking-wider transition-colors shrink-0 ${activeTab === 'tech' ? 'text-white border-b-2 border-red-600 pb-1' : 'text-gray-400 hover:text-red-500 border-b-2 border-transparent pb-1'}`}>প্রযুক্তি</button>
      <button onClick={() => handleTabChange('entertainment')} className={`font-bengali text-sm font-bold uppercase whitespace-nowrap tracking-wider transition-colors shrink-0 ${activeTab === 'entertainment' ? 'text-white border-b-2 border-red-600 pb-1' : 'text-gray-400 hover:text-red-500 border-b-2 border-transparent pb-1'}`}>বিনোদন</button>
      <div className="w-px h-4 bg-gray-700 shrink-0 hidden md:block"></div>
      <button onClick={() => handleTabChange('photocards')} className={`font-bengali text-sm font-bold uppercase whitespace-nowrap tracking-wider transition-colors shrink-0 flex items-center gap-1 ${activeTab === 'photocards' ? 'text-white border-b-2 border-red-600 pb-1' : 'text-gray-400 hover:text-red-500 border-b-2 border-transparent pb-1'}`}>
        <ImageIcon className="w-3.5 h-3.5" /> ফটো কার্ড
      </button>
      <button onClick={() => handleTabChange('saved')} className={`font-bengali text-sm font-bold uppercase whitespace-nowrap tracking-wider transition-colors shrink-0 flex items-center gap-1 ${activeTab === 'saved' ? 'text-white border-b-2 border-red-600 pb-1' : 'text-gray-400 hover:text-red-500 border-b-2 border-transparent pb-1'}`}>
        <Bookmark className="w-3.5 h-3.5" /> সেভ করা
      </button>
      <div className="md:hidden w-px h-4 bg-gray-700 shrink-0"></div>
      <button onClick={() => handleTabChange('bangla')} className={`font-bengali text-sm font-bold uppercase whitespace-nowrap tracking-wider transition-colors shrink-0 text-blue-400 hover:text-blue-300 ${activeTab === 'bangla' ? 'border-b-2 border-blue-500 pb-1' : 'border-b-2 border-transparent pb-1'}`}>পত্রিকা</button>
      <button onClick={() => handleTabChange('tv')} className={`font-bengali text-sm font-bold uppercase whitespace-nowrap tracking-wider transition-colors shrink-0 text-blue-400 hover:text-blue-300 ${activeTab === 'tv' ? 'border-b-2 border-blue-500 pb-1' : 'border-b-2 border-transparent pb-1'}`}>টিভি চ্যানেল</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-200 font-sans flex flex-col">
      {/* Top Utility Bar */}
      <div className="bg-[#050505] border-b border-gray-900 px-4 md:px-8 py-1.5 flex justify-between items-center text-[10px] sm:text-xs text-gray-500 font-bengali tracking-wide">
        <div className="flex items-center gap-3 md:gap-4 overflow-x-auto scrollbar-hide shrink-0">
          <span className="flex items-center gap-1 shrink-0"><MapPin className="w-3 h-3 text-red-700"/> ঢাকা, বাংলাদেশ</span>
          <span className="hidden sm:block shrink-0">📅 সোমবার, ২২ মে ২০২৪</span>
          <span className="flex items-center gap-1 shrink-0 text-yellow-500/80">
            <Coins className="w-3 h-3" /> $1 = ৳117.50
          </span>
        </div>
        <div className="flex items-center gap-3 md:gap-4 shrink-0">
          <span className="flex items-center gap-1 shrink-0">☀️ ৩২°C, রৌদ্রোজ্জ্বল</span>
          <span className="hidden lg:flex items-center gap-1 text-emerald-600/80 shrink-0">
            🕌 {prayerTime}
          </span>
          <span className="hidden md:flex items-center gap-2 text-blue-400/80 shrink-0">
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            {syncTime}
          </span>
        </div>
      </div>

      {/* Header */}
      <header className="bg-[#0f0f0f] border-b border-gray-800 px-4 md:px-8 py-4 sticky top-0 z-40 shadow-xl shadow-black/20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-red-600 text-white font-black px-3 py-1 text-xl md:text-2xl tracking-tighter italic flex items-center gap-2">
              NEWS HUB BD
            </div>
            <div className="h-6 w-[1px] bg-gray-700 mx-2 hidden md:block"></div>
            <div className="hidden md:block text-[10px] text-gray-400 uppercase tracking-widest font-bold">
              <span className="text-red-500">● LIVE</span> UPDATES
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            <NavButtons />
          </div>

          <div className="flex items-center gap-4">
            <div className={`bg-gray-800 rounded-full flex items-center border border-gray-700 transition-all ${isSearchActive ? 'w-48 px-3 py-1.5' : 'w-10 px-0 py-1.5 justify-center md:w-auto md:px-4 md:py-1.5 md:justify-start'}`}>
              <button onClick={() => setIsSearchActive(!isSearchActive)} className="md:hidden flex items-center justify-center text-gray-400 hover:text-white">
                <Search className="w-4 h-4" />
              </button>
              <Search className="w-4 h-4 text-gray-400 hidden md:block" />
              <input 
                type="text" 
                placeholder="সার্চ করুন..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`bg-transparent border-none outline-none text-sm text-gray-200 placeholder-gray-500 font-bengali ${isSearchActive ? 'ml-2 w-full block' : 'hidden md:block md:ml-2'}`}
              />
            </div>
            <button className="md:hidden p-2 rounded text-gray-400 hover:text-white" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
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
              className="text-gray-400 hover:text-white bg-[#111] px-3 py-1 rounded-full border border-gray-800 hover:border-gray-600 transition-colors shrink-0 whitespace-nowrap"
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
      <div className="bg-red-600/10 border-b border-red-600/20 py-2 px-4 md:px-8 flex items-center overflow-hidden">
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
                className="text-sm font-medium text-gray-300 truncate italic font-bengali absolute inset-0 max-w-full"
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
        {['home', 'national', 'international', 'sports', 'tech', 'entertainment', 'saved'].includes(activeTab) && (
          <div className="space-y-8">
            <div className="p-4 border-b border-gray-800 flex items-center justify-between mb-6 bg-[#111] rounded-t">
              <h2 className="text-xs font-bold text-red-500 uppercase tracking-widest flex items-center gap-2 font-bengali">
                {activeTab !== 'saved' && <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>}
                {activeTab === 'home' && 'শীর্ষ সংবাদ'}
                {activeTab === 'national' && 'জাতীয় সংবাদ'}
                {activeTab === 'international' && 'আন্তর্জাতিক সংবাদ'}
                {activeTab === 'sports' && 'খেলার খবর'}
                {activeTab === 'tech' && 'প্রযুক্তি সংবাদ'}
                {activeTab === 'entertainment' && 'বিনোদন সংবাদ'}
                {activeTab === 'saved' && 'সেভ করা খবর'}
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filterNews(activeTab === 'home' || activeTab === 'saved' ? undefined : activeTab as 'national' | 'international' | 'sports' | 'tech' | 'entertainment').length === 0 ? (
                <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-12 text-gray-500 font-bengali">
                  কোনো খবর পাওয়া যায়নি।
                </div>
              ) : filterNews(activeTab === 'home' || activeTab === 'saved' ? undefined : activeTab as 'national' | 'international' | 'sports' | 'tech' | 'entertainment').map((news) => (
                <motion.div 
                  key={news.id} 
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="bg-[#111] border border-gray-800 rounded group cursor-pointer hover:border-gray-600 hover:shadow-[0_8px_30px_rgb(0,0,0,0.5)] hover:shadow-red-900/10 transition-all duration-300 flex flex-col overflow-hidden relative"
                  onClick={() => setSelectedArticle(news)}
                >
                  <button 
                    onClick={(e) => toggleBookmark(e, news.id)}
                    className="absolute top-3 right-3 z-30 p-2 bg-black/60 rounded-full hover:bg-black/90 backdrop-blur transition-all"
                    title={savedArticles.includes(news.id) ? "রিমুভ করুন" : "সেভ করুন"}
                  >
                    {savedArticles.includes(news.id) ? (
                      <BookmarkCheck className="w-4 h-4 text-green-400" />
                    ) : (
                      <Bookmark className="w-4 h-4 text-white" />
                    )}
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleShare(news); }}
                    className="absolute top-3 right-12 z-30 p-2 bg-black/60 rounded-full hover:bg-black/90 backdrop-blur transition-all"
                    title="শেয়ার করুন"
                  >
                    <Share2 className="w-4 h-4 text-white" />
                  </button>
                  <div className="h-48 overflow-hidden relative bg-gray-900 border-b border-gray-800">
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111] to-transparent z-10 pointer-events-none"></div>
                    <img src={news.image} alt={news.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider z-20 shadow-md">
                      {news.category === 'national' ? 'বাংলাদেশ' : 'আন্তর্জাতিক'}
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold font-bengali leading-snug mb-2 line-clamp-2 text-gray-200 group-hover:text-red-400 transition-colors">{news.title}</h3>
                    <p className="text-sm font-bengali text-gray-400 line-clamp-2 mb-4">{news.summary}</p>
                    <div className="mt-auto flex items-center justify-between text-[10px] text-gray-500 italic font-bengali uppercase tracking-wider border-t border-gray-800 pt-3">
                      <span>সূত্র: <span className="font-bold text-gray-400">{news.source}</span></span>
                      <span>{news.time}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
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
                <div key={`card-${news.id}`} className="flex flex-col gap-3">
                  <div className="relative aspect-square bg-gray-900 overflow-hidden rounded-lg group shadow-lg border border-gray-800 flex flex-col justify-end">
                    <img src={news.image} alt={news.title} className="absolute inset-0 w-full h-full object-cover opacity-50" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent"></div>
                    
                    <div className="relative z-10 p-6 flex flex-col h-full">
                      <div className="flex justify-between items-start mb-auto">
                        <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest border border-red-500/30">
                          {news.source}
                        </span>
                        <span className="text-white/50 text-[10px] font-bengali uppercase tracking-widest font-bold">NewsHub BD</span>
                      </div>
                      
                      <div className="mt-auto">
                        <h3 className="text-2xl md:text-3xl font-bold font-bengali text-white leading-snug mb-4 drop-shadow-md pb-2 border-b-2 border-red-600/60">
                          "{news.title}"
                        </h3>
                        <p className="text-gray-300 font-bengali text-sm line-clamp-2">{news.summary}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleShare(news)}
                      className="flex-1 bg-[#111] hover:bg-[#1a1a1a] border border-gray-800 text-white font-bengali py-2 rounded flex items-center justify-center gap-2 transition-colors text-sm"
                    >
                      <Share2 className="w-4 h-4" /> শেয়ার করুন
                    </button>
                    <button 
                      onClick={() => alert("এই কার্ডটি ইমেজ হিসেবে ডাউনলোড করার অপশন শীঘ্রই যুক্ত করা হবে!")}
                      className="flex-1 bg-red-600/10 hover:bg-red-600/20 border border-red-600/30 text-red-500 font-bengali py-2 rounded flex items-center justify-center gap-2 transition-colors text-sm font-bold"
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
        {(activeTab === 'bangla' || activeTab === 'english' || activeTab === 'tv') && (
          <div className="space-y-8">
            <div className="p-4 border-b border-gray-800 flex items-center justify-between mb-6 bg-[#111] rounded-t">
              <h2 className="text-xs font-bold text-blue-500 uppercase tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                {activeTab === 'tv' ? 'লাইভ টিভি চ্যানেল' : activeTab === 'bangla' ? 'বাংলা পত্রিকা' : 'English Newspapers'}
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {(activeTab === 'bangla' ? banglaPapers : activeTab === 'english' ? englishPapers : tvChannels).map((source) => (
                <motion.button
                  key={source.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setEmbeddedUrl({ url: source.url, name: source.name })}
                  className="bg-[#111] border border-gray-800 rounded p-4 flex flex-col items-center justify-center gap-3 hover:bg-[#1a1a1a] hover:border-gray-600 transition-all group aspect-square"
                >
                  <div className="w-14 h-14 rounded-full bg-white/95 flex items-center justify-center p-2 shadow-inner group-hover:bg-white group-hover:shadow-[0_0_15px_rgba(220,38,38,0.3)] transition-all overflow-hidden border border-gray-700/50">
                    <img 
                      src={`https://www.google.com/s2/favicons?domain=${new URL(source.url).hostname}&sz=128`} 
                      alt={source.name} 
                      className="w-full h-full object-contain filter group-hover:brightness-110"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                    <span className="hidden text-xs font-bold text-gray-800 uppercase">{source.logoText}</span>
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
                className="absolute top-4 right-4 p-2 bg-black/50 backdrop-blur rounded text-white hover:bg-red-600 transition-colors z-30 border border-white/10"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="h-64 sm:h-80 w-full relative bg-gray-900 border-b border-gray-800">
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-[#0f0f0f]/40 to-transparent z-10 pointer-events-none"></div>
                <img src={selectedArticle.image} alt={selectedArticle.title} className="w-full h-full object-cover" />
              </div>
              
              <div className="p-6 md:p-10 font-bengali relative z-20">
                <div className="flex items-center gap-3 text-xs text-gray-500 mb-4 uppercase tracking-widest flex-wrap">
                  <span className="bg-red-600/20 text-red-500 border border-red-600/30 px-2 py-0.5 rounded font-bold">
                    {selectedArticle.source}
                  </span>
                  <span>•</span>
                  <span>{selectedArticle.time}</span>
                  
                  <div className="ml-auto flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-[#111] border border-gray-800 rounded-full px-2 py-1 mr-2">
                       <button onClick={() => setArticleTextSize('normal')} className={`p-1 rounded-full ${articleTextSize === 'normal' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-white'}`} title="Normal Size">
                         <Type className="w-3 h-3" />
                       </button>
                       <button onClick={() => setArticleTextSize('large')} className={`p-1 rounded-full ${articleTextSize === 'large' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-white'}`} title="Large Size">
                         <Type className="w-4 h-4" />
                       </button>
                       <button onClick={() => setArticleTextSize('xlarge')} className={`p-1 rounded-full ${articleTextSize === 'xlarge' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-white'}`} title="Extra Large Size">
                         <Type className="w-5 h-5" />
                       </button>
                    </div>
                    <button 
                      onClick={() => handleSpeak(selectedArticle.title + ". " + selectedArticle.content)}
                      className={`px-3 py-1.5 rounded-full flex items-center gap-2 transition-colors border ${isPlaying ? 'bg-red-600/20 text-red-500 border-red-600/30' : 'bg-[#111] text-gray-400 border-gray-800 hover:text-white hover:bg-gray-800'}`}
                    >
                      {isPlaying ? <PauseCircle className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      <span className="font-bengali font-bold hidden sm:inline">{isPlaying ? 'থামান' : 'খবরটি শুনুন'}</span>
                    </button>
                    
                    <button 
                      onClick={() => handleShare(selectedArticle)}
                      className="bg-[#111] text-gray-400 border border-gray-800 hover:text-white hover:bg-gray-800 px-3 py-1.5 rounded-full flex items-center gap-2 transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                      <span className="font-bengali font-bold hidden sm:inline">শেয়ার</span>
                    </button>
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
                             <img src={relatedNews.image} alt={relatedNews.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
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

    </div>
  );
}
