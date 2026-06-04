import React, { useState, useEffect, useMemo, Component } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'motion/react';
import { Newspaper, Tv, Globe, MapPin, X, ArrowUpRight, ArrowRight, Calendar, Search, Menu, Bookmark, BookmarkCheck, Share2, Image as ImageIcon, Download, Volume2, PauseCircle, Sparkles, RefreshCw, TrendingUp, Type, Coins, Bot, ExternalLink, Home, Trophy, SlidersHorizontal, Settings2, Clock, Moon, Sun, Play, Info, ShieldCheck, LogIn, LogOut, PlusCircle, Trash2, MessageSquare, Wifi, WifiOff, User, Heart, Link, Check } from 'lucide-react';
import { topNews, banglaPapers, englishPapers, tvChannels, internationalChannels, NewsArticle, MediaSource } from './data';
import { fetchLiveNews } from './services/newsService';
import NewsRow from './components/NewsRow';
import FeedbackModal from './components/FeedbackModal';
import ArticleComments from './components/ArticleComments';
import AnalyticsTracker from './components/AnalyticsTracker';
import { LoginModal } from './components/LoginModal';
import { LoadingScreen } from './components/LoadingScreen';
import { FifaWorldCupBanner } from './components/FifaWorldCupBanner';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import jsPDF from 'jspdf';
import { toJpeg } from 'html-to-image';
import { collection, addDoc, getDocs, query, where, orderBy, limit, serverTimestamp, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import AdminApp from './admin/AdminApp';
import { AIBot } from './components/AIBot';

// Error Boundary for UI Self-Healing
interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<any, any> {
  state = { hasError: false };

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("UI Crash caught by self-healing boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md">
            <RefreshCw className="mx-auto h-12 w-12 text-red-500 mb-4 animate-spin-slow" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2 font-bengali">দুঃখিত, কিছু সমস্যা হয়েছে</h2>
            <p className="text-gray-600 mb-6 font-bengali">অ্যাপটি সঠিকভাবে লোড হতে পারছে না। আমরা এটি অটো-ফিক্স করার চেষ্টা করছি।</p>
            <button 
              onClick={() => window.location.reload()} 
              className="w-full bg-red-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center gap-2 font-bengali"
            >
              <RefreshCw size={18} /> আবার চেষ্টা করুন
            </button>
          </div>
        </div>
      );
    }
    return (this as any).props.children;
  }
}

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error Detailed: ', JSON.stringify(errInfo));
  // Not throwing here to prevent "White Screen of Death" during background listener failures
}

// Use picsum.photos for reliable, varied placeholder images
const getVarietyImage = (title: string, category: string) => {
  const normalizedCategory = category.toLowerCase();
  // We use the title hash as a seed to ensure the same news article always gets the same image
  const seedStr = title.replace(/[^a-zA-Z0-9]/g, '').substring(0, 10);
  const seed = seedStr || normalizedCategory;
  return `https://picsum.photos/seed/${seed}/800/500`;
};

const isValidImageUrl = (url: string | null | undefined): boolean => {
  if (!url) return false;
  const lower = url.toLowerCase();
  
  if (
     lower.includes('1x1') || 
     lower.includes('pixel') ||
     lower.includes('ads') || 
     lower.includes('advertisement') || 
     lower.includes('blank') ||
     (lower.includes('logo') && lower.length < 50) || // Only block if it's likely a small logo file
     (lower.includes('favicon') && lower.length < 50)
  ) {
     return false;
  }
  return true;
};

const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
  const target = e.currentTarget;
  if (target.getAttribute('data-failed-all')) return;
  
  // Use picsum for reliable fallback
  const randomSeed = Math.floor(Math.random() * 1000);
  const fallbackUrl = `https://picsum.photos/seed/fallback${randomSeed}/800/500`;
  
  target.setAttribute('data-failed-all', 'true');
  target.src = fallbackUrl;
};

// Skeleton Loader component
const Skeleton: React.FC<{ className: string }> = ({ className }) => (
  <div className={`animate-pulse bg-gray-200 dark:bg-gray-800 rounded-lg ${className}`}></div>
);

const NewsCardSkeleton = () => (
  <div className="flex flex-col gap-4">
    <Skeleton className="w-full h-48 sm:h-56 lg:h-64 rounded-3xl" />
    <div className="flex flex-col gap-2">
      <Skeleton className="w-1/4 h-4" />
      <Skeleton className="w-full h-6" />
      <Skeleton className="w-full h-6" />
      <Skeleton className="w-1/2 h-4" />
    </div>
  </div>
);

const getNoPhotoPlaceholder = () => "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MDAiIGhlaWdodD0iNTAwIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjUwMCIgZmlsbD0iIzFBMUExQSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzMzMyIgZmlsbC1vcGFjaXR5PSIwLjUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk5vIEltYWdlIEF2YWlsYWJsZTwvdGV4dD48L3N2Zz4="; 

// Hero Banner Component
const HeroBanner: React.FC<{ news: NewsArticle; onMoreInfo: (n: NewsArticle) => void; onPlay: (n: NewsArticle) => void; isPlaying?: boolean }> = ({ news, onMoreInfo, onPlay, isPlaying }) => (
  <div className="relative w-full h-[70vh] md:h-[85vh] overflow-hidden">
    {/* Background Image */}
    <motion.img 
      initial={{ scale: 1.1 }}
      animate={{ scale: 1 }}
      transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
      src={news.image} 
      alt={news.title}
      className="absolute inset-0 w-full h-full object-cover"
    />
    {/* Overlays */}
    <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-[#0f0f0f]/40 to-transparent"></div>
    <div className="absolute inset-0 bg-gradient-to-r from-[#0f0f0f] via-transparent to-transparent"></div>
    
    {/* Content */}
    <div className="absolute bottom-0 left-0 w-full p-6 pb-20 md:p-16 md:pb-36 flex flex-col gap-4 md:gap-6 z-30 max-w-4xl">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex items-center gap-2"
      >
        <span className="text-white/80 text-xs md:text-sm font-bold uppercase tracking-widest flex items-center gap-2">
          {news.source} • {news.time}
          <span className="hidden sm:inline w-1 h-1 bg-white/30 rounded-full"></span>
          <span className="hidden sm:inline text-white/50 text-[10px]">{calculateReadTimeBengali(news.title, news.content || news.summary)}</span>
        </span>
      </motion.div>
      
      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-4xl md:text-7xl font-black text-white leading-[1.1] font-bengali drop-shadow-2xl"
      >
        {news.title}
      </motion.h1>
      
      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-gray-300 text-sm md:text-lg line-clamp-2 md:line-clamp-3 max-w-2xl font-bengali leading-relaxed"
      >
        {news.summary}
      </motion.p>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex items-center gap-3 mt-4"
      >
        <button 
          onClick={() => onPlay(news)}
          className={`px-6 md:px-8 py-3 rounded-lg font-bold flex items-center gap-2 transition-all shadow-xl group ${isPlaying ? 'bg-red-600 text-white animate-pulse' : 'bg-white text-black hover:bg-white/90'}`}
        >
          {isPlaying ? (
            <PauseCircle size={20} fill="currentColor" className="group-hover:scale-110 transition-transform" />
          ) : (
            <Play size={20} fill="currentColor" className="group-hover:scale-110 transition-transform" />
          )}
          <span className="font-bengali text-sm md:text-base">{isPlaying ? 'থামান' : 'শুনুন'}</span>
        </button>
        <button 
          onClick={() => onMoreInfo(news)}
          className="bg-gray-500/30 text-white px-6 md:px-8 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-gray-500/40 backdrop-blur-md transition-all border border-white/10 group"
        >
          <Info size={20} className="group-hover:rotate-12 transition-transform" />
          <span className="font-bengali">বিস্তারিত</span>
        </button>
      </motion.div>
    </div>
  </div>
);

// News Card Component
const NewsCard: React.FC<{ 
  news: NewsArticle; 
  onNewsClick: (n: NewsArticle) => void; 
  onShareClick: (n: NewsArticle) => void;
  onDownloadClick: (n: NewsArticle) => void;
  isSaved: boolean;
  onToggleBookmark: (e: React.MouseEvent, id: string) => void;
  onDismiss?: (e: React.MouseEvent, id: string) => void;
  index?: number;
}> = ({ news, onNewsClick, onShareClick, onDownloadClick, isSaved, onToggleBookmark, onDismiss, index = 0 }) => {
  const { likes, shares } = React.useMemo(() => ({
    likes: convertToBengaliDigit(Math.floor(Math.random() * 500) + 50),
    shares: convertToBengaliDigit(Math.floor(Math.random() * 100) + 10)
  }), [news.id]);

  const handleDragEnd = (_event: any, info: any) => {
    const threshold = 100;
    if (Math.abs(info.offset.x) > threshold) {
      if (onDismiss) onDismiss(_event, news.id);
    }
  };

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7deg", "-7deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7deg", "7deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only apply on desktop
    if (window.innerWidth < 768) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const [contextMenu, setContextMenu] = React.useState<{ x: number, y: number } | null>(null);
  const [copied, setCopied] = React.useState(false);

  // Long press for mobile
  const timerRef = React.useRef<NodeJS.Timeout>();

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    timerRef.current = setTimeout(() => {
      setContextMenu({ x: touch.clientX - rect.left, y: touch.clientY - rect.top });
    }, 500); // 500ms long press
  };

  const handleTouchEnd = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    setContextMenu({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleCopy = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(news.url && news.url !== '#' ? news.url : window.location.href);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setContextMenu(null);
    }, 1500);
  };

  React.useEffect(() => {
    if (contextMenu) {
      const hide = () => setContextMenu(null);
      const timer = setTimeout(() => {
         document.addEventListener('click', hide);
         document.addEventListener('touchstart', hide);
      }, 100);
      return () => {
        clearTimeout(timer);
        document.removeEventListener('click', hide);
        document.removeEventListener('touchstart', hide);
      };
    }
  }, [contextMenu]);

  return (
  <motion.article 
    layout
    initial={{ opacity: 0, scale: 0.95, y: 20 }}
    animate={{ opacity: 1, scale: 1, y: 0, transition: { delay: index * 0.05, duration: 0.4 } }}
    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
    whileTap={{ scale: 0.98 }}
    className="group relative flex flex-col skeuo-card overflow-hidden cursor-pointer"
    style={{ rotateX, rotateY, transformPerspective: 1000 }}
    onMouseMove={handleMouseMove}
    onMouseLeave={handleMouseLeave}
    onContextMenu={handleContextMenu}
    onTouchStart={handleTouchStart}
    onTouchEnd={handleTouchEnd}
    onTouchMove={handleTouchEnd}
    onClick={() => onNewsClick(news)}
    drag={onDismiss ? "x" : false}
    dragConstraints={{ left: 0, right: 0 }}
    dragElastic={0.8}
    onDragEnd={handleDragEnd}
  >
    <div className="aspect-[16/9] w-full overflow-hidden relative rounded-t-xl z-0">
      {contextMenu && (
        <div 
           className="absolute z-50 bg-white dark:bg-[#1a1a1a] shadow-2xl rounded-xl border border-gray-200 dark:border-white/10 p-1.5 min-w-[140px]"
           style={{ left: Math.min(contextMenu.x, 200), top: Math.min(contextMenu.y, 150) }}
           onClick={(e) => e.stopPropagation()}
           onTouchStart={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleCopy}
            className="w-full flex items-center justify-between gap-3 px-3 py-2 text-sm font-bengali font-bold rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-gray-800 dark:text-gray-200"
          >
            {copied ? (
              <>
                <span className="text-green-500">কপি হয়েছে</span>
                <Check size={16} className="text-green-500" />
              </>
            ) : (
              <>
                <span>লিংক কপি করুন</span>
                <Link size={16} />
              </>
            )}
          </button>
        </div>
      )}
      <img 
        src={news.image} 
        alt={news.title}
        onError={handleImageError}
        loading="lazy"
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity"></div>
      
      <div className="absolute top-3 left-3 z-10">
        <span className="px-2.5 py-1 bg-red-600 text-[10px] font-black uppercase text-white rounded-lg shadow-lg backdrop-blur-sm border border-white/10">
          {news.source}
        </span>
      </div>

      <div className="absolute top-3 right-3 z-10 flex gap-2">
        <motion.button 
          whileTap={{ scale: 0.85 }}
          onClick={(e: React.MouseEvent) => { e.stopPropagation(); onToggleBookmark(e, news.id); }}
          className={`p-2 rounded-xl backdrop-blur-md skeuo-btn relative overflow-hidden flex items-center justify-center w-8 h-8 ${isSaved ? 'text-red-500' : 'text-gray-400 hover:text-white'}`}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {isSaved ? (
              <motion.div
                key="saved"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1.1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 8, mass: 0.8 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <BookmarkCheck size={16} fill="currentColor" strokeWidth={2.5} />
              </motion.div>
            ) : (
              <motion.div
                key="unsaved"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <Bookmark size={16} strokeWidth={2.5} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </div>

    <div className="p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2 text-[11px] text-gray-500 font-bold uppercase tracking-wider">
         <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></span>
         <span>{news.time}</span>
         <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
         <span className="text-[10px] opacity-80">{calculateReadTimeBengali(news.title, news.summary)}</span>
      </div>
      
      <h3 className="text-base md:text-lg font-bold font-bengali text-white line-clamp-2 leading-relaxed group-hover:text-red-500 transition-colors">
        {news.title}
      </h3>
      
      <p className="text-xs font-bengali text-gray-400 opacity-60 line-clamp-2 leading-relaxed group-hover:opacity-100 transition-opacity">
        {news.summary}
      </p>

      <div className="pt-2 flex items-center justify-between mt-auto">
         <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-gray-400 font-bengali text-xs">
              <Heart size={14} className="text-red-500" />
              <span>{likes}</span>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); onShareClick(news); }}
              className="flex items-center gap-1.5 p-1.5 px-2 rounded-xl bg-white/5 hover:bg-red-600 hover:text-white text-gray-400 transition-all border border-white/5 font-bengali text-xs"
            >
              <Share2 size={14} />
              <span>{shares}</span>
            </button>
         </div>
         
         <button className="text-[11px] font-black uppercase tracking-widest text-red-600 flex items-center gap-1 group/btn">
            বিস্তারিত <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
         </button>
      </div>
    </div>
  </motion.article>
  );
};

// Administrative features moved to AdminApp
const convertToBengaliDigit = (num: number) => {
  const digits: { [key: string]: string } = {
    '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
    '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'
  };
  return num.toString().split('').map(d => digits[d] || d).join('');
};

const calculateReadTimeBengali = (title: string, content: string) => {
  const text = title + " " + (content || "");
  const wordCount = text.trim().split(/\s+/).length;
  const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 250));
  return `${convertToBengaliDigit(readTimeMinutes)} মিনিট পড়ার সময়`;
};

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

type Tab = 'home' | 'national' | 'international' | 'sports' | 'tech' | 'entertainment' | 'visa' | 'photocards' | 'saved' | 'bangla' | 'english' | 'tv' | 'intl_tv' | 'ai';

const rssCache = new Map<string, { data: any, timestamp: number }>();
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

// Animated Bangladesh Flag Component
const BDFlag = () => (
  <motion.div
    animate={{ 
      rotate: [0, 2, -2, 0],
      skewX: [0, 3, -3, 0],
      y: [0, -1, 1, 0]
    }}
    transition={{ 
      duration: 4, 
      repeat: Infinity, 
      ease: "easeInOut" 
    }}
    className="relative flex-shrink-0 w-6 h-4 md:w-8 md:h-[22px] bg-[#006a4e] rounded-[1px] shadow-[0_2px_10px_rgba(0,106,78,0.2)] ml-2.5 overflow-hidden flex items-center group-hover:scale-110 transition-transform cursor-pointer"
  >
    <div className="absolute w-[40%] aspect-square bg-[#f42a41] rounded-full left-[25%]" />
    <motion.div 
      animate={{ x: [-40, 60] }}
      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-full h-full opacity-30"
    />
  </motion.div>
);

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [savedArticles, setSavedArticles] = useState<string[]>(() => {
    const saved = localStorage.getItem('savedArticles');
    return saved ? JSON.parse(saved) : [];
  });
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTickerIndex, setCurrentTickerIndex] = useState(0);

  const [liveNews, setLiveNews] = useState<NewsArticle[]>(topNews);
  const [pendingNews, setPendingNews] = useState<NewsArticle[]>([]);
  const [dismissedNewsIds, setDismissedNewsIds] = useState<Set<string>>(new Set());
  const liveNewsRef = React.useRef(liveNews);
  React.useEffect(() => {
    liveNewsRef.current = liveNews;
  }, [liveNews]);

  const [isRefreshing, setIsRefreshing] = useState(true);
  const [isScraping, setIsScraping] = useState(false);
  const [isGHSynced, setIsGHSynced] = useState(false);
  const [syncTime, setSyncTime] = useState('সদ্য আপডেট করা হয়েছে');
  const [prayerTime, setPrayerTime] = useState('পরবর্তী নামাজ: লোড হচ্ছে...');
  const [currentDateString, setCurrentDateString] = useState('');
  const [currentTimeString, setCurrentTimeString] = useState('');
  const [articleTextSize, setArticleTextSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [lineSpacing, setLineSpacing] = useState<'tight' | 'normal' | 'relaxed'>('normal');
  const [readerTheme, setReaderTheme] = useState<'dark' | 'light' | 'sepia'>('dark');
  const [isReaderSettingsOpen, setIsReaderSettingsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Auth & Admin State
  const [user, setUser] = useState<any | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [activeUsersCount, setActiveUsersCount] = useState(0);
  const isOnline = useOnlineStatus();
  
  // Persist saved articles
  useEffect(() => {
    localStorage.setItem('savedArticles', JSON.stringify(savedArticles));
  }, [savedArticles]);
  
  // Firestore News
  const [dbNews, setDbNews] = useState<NewsArticle[]>([]);

  // Auth Effect
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currUser) => {
      setUser(currUser);
      if (currUser) {
        // Simple admin check: if email is user's or specific one
        setIsAdmin(currUser.email === 'faisalkabirrabi@gmail.com' || currUser.email?.includes('admin'));
      } else {
        setIsAdmin(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Real-time active users for admin
  useEffect(() => {
    if (!isAdmin) return;

    // Filter sessions active in the last 2 minutes
    const q = query(
      collection(db, 'sessions'),
      where('isOnline', '==', true)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setActiveUsersCount(snapshot.size);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'sessions');
    });

    return () => unsubscribe();
  }, [isAdmin]);

  // Firestore News Listener
  useEffect(() => {
    const q = query(collection(db, 'articles'), orderBy('publishedAt', 'desc'), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const articles = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as any[];
      setDbNews(articles);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'articles');
    });
    return () => unsubscribe();
  }, []);

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setSelectedCategory('all');
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      // Add custom parameters to handle common WebView issues
      provider.setCustomParameters({ prompt: 'select_account' });
      
      await signInWithPopup(auth, provider);
      setIsAuthModalOpen(false);
    } catch (error: any) {
      console.error("Login failed:", error);
      if (error.code === 'auth/network-request-failed') {
        alert("নেটওয়ার্ক সমস্যা! আপনার ইন্টারনেট কানেকশন চেক করুন অথবা কিছুক্ষণ পর আবার চেষ্টা করুন।");
      } else if (error.code === 'auth/popup-blocked') {
        alert("পপ-আপ উইন্ডো ব্লক করা হয়েছে। দয়া করে ব্রাউজার সেটিংসে পপ-আপ এলাউ করুন।");
      } else {
        alert("লগইন করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।");
      }
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  // Helper to format relative time in Bengali
  const getRelativeTimeBengali = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'এই মুহূর্তে';
    if (minutes < 60) return `${convertToBengaliDigit(minutes)} মিনিট আগে`;
    if (hours < 24) return `${convertToBengaliDigit(hours)} ঘণ্টা আগে`;
    if (days === 1) return '১ দিন আগে';
    if (days < 7) return `${convertToBengaliDigit(days)} দিন আগে`;
    return 'পুরাতন খবর';
  };

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

  const getReaderStyles = () => {
    let classes = "";
    
    // Font size
    switch(articleTextSize) {
      case 'large': classes += ' text-xl'; break;
      case 'xlarge': classes += ' text-2xl'; break;
      default: classes += ' text-lg';
    }

    // Line spacing
    switch(lineSpacing) {
      case 'tight': classes += ' leading-snug'; break;
      case 'relaxed': classes += ' leading-loose'; break;
      default: classes += ' leading-relaxed';
    }

    // Theme (applied to content container)
    switch(readerTheme) {
      case 'light': classes += ' text-gray-900'; break;
      case 'sepia': classes += ' text-[#433422]'; break;
      default: classes += ' text-gray-100';
    }

    return classes;
  };

  const getThemeBg = () => {
    switch(readerTheme) {
      case 'light': return 'bg-white';
      case 'sepia': return 'bg-[#f4ecd8]';
      default: return 'bg-[#0f0f0f]';
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

  const fetchRSS = React.useCallback(async (isBackground = false) => {
    if (!isBackground) {
      setIsRefreshing(true);
    }
    setIsScraping(true);
    try {
      // Fetching multiple categories for better coverage
      const categories = [
        // Google News General
        { url: 'https://news.google.com/rss?hl=bn&gl=BD&ceid=BD:bn', cat: 'national' },
        { url: 'https://news.google.com/rss/headlines/section/topic/WORLD?hl=bn&gl=BD&ceid=BD:bn', cat: 'international' },
        { url: 'https://news.google.com/rss/headlines/section/topic/SPORTS?hl=bn&gl=BD&ceid=BD:bn', cat: 'sports' },
        { url: 'https://news.google.com/rss/headlines/section/topic/TECHNOLOGY?hl=bn&gl=BD&ceid=BD:bn', cat: 'tech' },
        { url: 'https://news.google.com/rss/headlines/section/topic/ENTERTAINMENT?hl=bn&gl=BD&ceid=BD:bn', cat: 'entertainment' },
        { url: 'https://news.google.com/rss/search?q=ভিসা+পাসপোর্ট+ইমিগ্রেশন&hl=bn&gl=BD&ceid=BD:bn', cat: 'visa' },
        // Top Newspapers
        { url: 'https://www.prothomalo.com/feed', cat: 'national' },
        { url: 'https://www.jagonews24.com/rss/rss.xml', cat: 'national' },
        
        // Television Channels
        { url: 'https://www.channelionline.com/feed', cat: 'tv' },
        { url: 'http://feeds.bbci.co.uk/news/world/rss.xml', cat: 'international' },
        { url: 'http://rss.cnn.com/rss/edition_world.rss', cat: 'international' },
        { url: 'https://www.aljazeera.com/xml/rss/all.xml', cat: 'international' },
        { url: 'https://www.thedailystar.net/rss.xml', cat: 'english' },
        { url: 'https://en.prothomalo.com/feed', cat: 'english' }
      ];



      // Try dynamic News API fetch first (GNews)
      const liveNewsPromise = async () => {
        try {
           const itemsBn = await fetchLiveNews('bd');
           const itemsEn = await fetchLiveNews('english');
           const items = [...itemsBn, ...itemsEn];
           return items.map(item => {
             const hasTimestamp = item.timestamp && !isNaN(item.timestamp);
             const ts = hasTimestamp ? item.timestamp! : Date.now();
             
             let finalImage = item.image;
             if (!isValidImageUrl(finalImage)) {
               finalImage = getVarietyImage(item.title, item.category);
             }

             return {
               ...item, 
               image: finalImage,
               isTopSource: true,
               timestamp: ts,
               time: item.time || getRelativeTimeBengali(ts)
             };
           });
        } catch (e) {
           console.warn('Live API fetch failed', e);
           return [];
        }
      };

      // Try direct GitHub JSON fetch from multiple possible locations
      const ghSources = [
        '/api/news',
        'https://raw.githubusercontent.com/faisalkabir/my-news-portal/main/news.json',
        'https://raw.githubusercontent.com/faisalkabir/my-news-portal/main/data.json',
        'https://raw.githubusercontent.com/faisalkabirrabi-ux/my-news-portal/main/news.json',
        'https://raw.githubusercontent.com/faisalkabirrabi-ux/my-news-portal/main/data.json',
        'https://faisalkabirrabi-ux.github.io/my-news-portal/news.json',
        'https://faisalkabirrabi-ux.github.io/my-news-portal/data.json'
      ];

      console.log("Starting GitHub Sync...");
      let ghSuccessCount = 0;

      const ghPromises = ghSources.map(async (ghUrl) => {
        try {
          const cacheKey = ghUrl;
          let ghData;

          if (rssCache.has(cacheKey)) {
            const cached = rssCache.get(cacheKey)!;
            if (Date.now() - cached.timestamp < CACHE_DURATION_MS) {
              ghData = cached.data;
            }
          }

          if (!ghData) {
            const ghRes = await fetch(`${ghUrl}?nocache=${Date.now()}-${Math.random()}`); 
            if (ghRes.ok) {
              ghData = await ghRes.json();
              rssCache.set(cacheKey, { data: ghData, timestamp: Date.now() });
            }
          }

          if (ghData) {
            console.log(`Successfully fetched from ${ghUrl}`, ghData);
            
            let ghMappedNews: NewsArticle[] = [];
            
            if (Array.isArray(ghData)) {
              ghMappedNews = ghData.map((item: any, i: number) => {
                const cat = (item.category || item.news_category || 'national').toLowerCase();
                const itemTimeStr = item.time || item.date || item.pubDate || '';
                let itemTimestamp = Date.now(); 
                
                if (itemTimeStr) {
                  const parsed = new Date(itemTimeStr).getTime();
                  if (!isNaN(parsed) && parsed > 0) itemTimestamp = parsed;
                }

                let finalImage = item.image || item.news_image;
                if (!isValidImageUrl(finalImage)) {
                  finalImage = getVarietyImage(item.title || '', cat);
                }

                return {
                  id: item.id || `gh-arr-${i}-${Date.now()}`,
                  title: item.title || item.news_title || 'শিরোনাম নেই',
                  summary: item.summary || item.description || 'সারসংক্ষেপ নেই',
                  content: item.content || item.summary || '',
                  source: item.source || 'গিটহাব আপডেট',
                  time: getRelativeTimeBengali(item.timestamp || itemTimestamp),
                  image: finalImage,
                  category: cat as any,
                  url: item.url || item.link || '#',
                  timestamp: item.timestamp || itemTimestamp,
                  isTopSource: true
                };
              });
            } else if (typeof ghData === 'object' && ghData !== null) {
              Object.entries(ghData).forEach(([key, items]) => {
                if (Array.isArray(items)) {
                  const cat = key.toLowerCase();
                  const mapped = items.map((item: any, i: number) => {
                    const itemTimeStr = item.time || item.date || item.pubDate || '';
                    let itemTimestamp = Date.now();
                    
                    if (itemTimeStr) {
                      const parsed = new Date(itemTimeStr).getTime();
                      if (!isNaN(parsed) && parsed > 0) itemTimestamp = parsed;
                    }

                    let finalImage = item.image || item.news_image;
                    if (!isValidImageUrl(finalImage)) {
                      finalImage = getVarietyImage(item.title || '', cat);
                    }

                    return {
                      id: item.id || `gh-obj-${cat}-${i}-${Date.now()}`,
                      title: item.title || item.news_title || 'শিরোনাম নেই',
                      summary: item.summary || item.description || 'সারসংক্ষেপ নেই',
                      content: item.content || item.summary || '',
                      source: item.source || (cat === 'bangla' ? 'সংবাদ মাধ্যম' : 'গিটহাব'),
                      time: getRelativeTimeBengali(itemTimestamp),
                      image: finalImage,
                      category: cat as any,
                      url: item.url || item.link || '#',
                      timestamp: itemTimestamp,
                      isTopSource: true
                    };
                  });
                  ghMappedNews = [...ghMappedNews, ...mapped];
                }
              });
            }

            return ghMappedNews;
          }
        } catch (err) {
          console.warn(`GH Sync attempt failed for ${ghUrl}`, err);
        }
        return [];
      });

      const rssPromises = categories.map(async (feed) => {
        try {
          let data;
          const cacheKey = feed.url;

          if (rssCache.has(cacheKey)) {
            const cached = rssCache.get(cacheKey)!;
            if (Date.now() - cached.timestamp < CACHE_DURATION_MS) {
              data = cached.data;
            }
          }

          if (!data) {
            const cacheBuster = `t=${Date.now()}`;
            const finalUrl = feed.url.includes('?') ? `${feed.url}&${cacheBuster}` : `${feed.url}?${cacheBuster}`;
            const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(finalUrl)}`);
            data = await res.json();
            
            if (data && data.status === 'ok') {
               rssCache.set(cacheKey, { data, timestamp: Date.now() });
            }
          }
          
          if (data && data.status === 'ok') {
             return data.items.map((item: any, i: number) => {
               const rawTitle = item.title || '';
               let sourceStr = rawTitle.includes(' - ') ? rawTitle.split(' - ').pop() : (feed.cat === 'tv' ? 'টিভি নিউজ' : 'সংবাদ মাধ্যম');
               if (sourceStr && sourceStr.toLowerCase().includes('google news')) sourceStr = (feed.cat === 'tv' ? 'টিভি নিউজ' : 'সংবাদ মাধ্যম');
               const titleStr = rawTitle.includes(' - ') ? rawTitle.substring(0, rawTitle.lastIndexOf(' - ')) : (rawTitle || 'শিরোনাম নেই');
               
               const topSources = ['Prothom Alo', 'Somoy TV', 'Jamuna TV', 'The Daily Star', 'প্রথম আলো', 'সময় টেলিভিশন', 'যমুনা টেলিভিশন', 'ইত্তেফাক', 'ইত্তেফাক ডটকম', 'বাংলাদেশ প্রতিদিন', 'কালের কণ্ঠ', 'চ্যানেল আই', 'NTV', 'একাত্তর টিভি'];
               const isTopSource = topSources.some(s => sourceStr.toLowerCase().includes(s.toLowerCase()));

               let originalImage = '';
               if (item.enclosure && item.enclosure.link) {
                 originalImage = item.enclosure.link;
               } else if (item.thumbnail) {
                 originalImage = item.thumbnail;
               } else {
                 const searchTarget = (item.description || '') + ' ' + (item.content || '');
                 const imgMatch = searchTarget.match(/<img[^>]+src=["']([^"']+)["']/i);
                 if (imgMatch && imgMatch[1]) {
                   originalImage = imgMatch[1];
                   if (originalImage.startsWith('//')) originalImage = 'https:' + originalImage;
                 }
               }

               let itemTimestamp = new Date(item.pubDate).getTime();
               if (isNaN(itemTimestamp) || itemTimestamp <= 0) {
                 itemTimestamp = Date.now();
               }

               let finalImage = originalImage;
               if (!isValidImageUrl(finalImage)) {
                 finalImage = getVarietyImage(titleStr, feed.cat);
               }

               return {
                  id: item.guid || `live-${feed.cat}-${i}-${Date.now()}`,
                  title: titleStr,
                  summary: (item.description || '').replace(/<[^>]+>/g, '').substring(0, 150) + '...',
                  content: (item.content || titleStr).replace(/<[^>]+>/g, '') + `\n\nসূত্র: ${sourceStr}`,
                  source: sourceStr,
                  time: getRelativeTimeBengali(itemTimestamp),
                  image: finalImage,
                  category: feed.cat,
                  url: item.link,
                  timestamp: itemTimestamp,
                  isTopSource: isTopSource
               };
             });
          }
        } catch (e) {
          console.warn(`Failed to fetch ${feed.cat} news`, e);
        }
        return [];
      });

      // Helper to process and update state with new chunks of news incrementally
      const processNewsChunk = (newArticles: NewsArticle[], isBackgroundProcess: boolean) => {
        if (newArticles.length === 0) return;
        
        const freshUnique = new Map();
        newArticles.forEach(n => {
          const rawNTitle = n.title || 'শিরোনাম নেই';
          const key = `${rawNTitle.trim().toLowerCase()}-${n.source}`;
          if (!freshUnique.has(key)) freshUnique.set(key, n);
        });
        const deduplicated = Array.from(freshUnique.values()) as NewsArticle[];

        const now = Date.now();
        const fortyEightHoursAgo = now - (48 * 60 * 60 * 1000); 
        
        const prev = liveNewsRef.current;
        const combined = [...deduplicated, ...prev];
        const unique = new Map();
        
        combined.forEach(n => {
           // Filter out news older than 48 hours
           if (n.timestamp && n.timestamp < fortyEightHoursAgo) return;

           // Robust deduplication key: title without source suffix
           const rawNTitle = n.title || 'শিরোনাম নেই';
           const titleKey = rawNTitle.split(' - ')[0].trim().toLowerCase()
                                  .replace(/[।\s]/g, ''); // Remove Bengali full stops and spaces
           
           // Keep the version with the highest timestamp (latest)
           if (!unique.has(titleKey)) {
             unique.set(titleKey, n);
           } else {
             const existing = unique.get(titleKey);
             if ((n.timestamp || 0) > (existing.timestamp || 0)) {
               unique.set(titleKey, n);
             }
           }
        });

        // Sort primarily by timestamp (latest first)
        const sorted = Array.from(unique.values()).sort((a: any, b: any) => {
           return (b.timestamp || 0) - (a.timestamp || 0);
        });

        const trulyUniqueIds = new Set();
        const finalUnique = sorted.filter((n: any) => {
           if (trulyUniqueIds.has(n.id)) return false;
           trulyUniqueIds.add(n.id);
           return true;
        }).slice(0, 100) as NewsArticle[];

        if (isBackgroundProcess) {
            const prevIds = new Set(prev.map(n => n.id));
            const newFetched = finalUnique.filter(n => !prevIds.has(n.id));
            if (newFetched.length > 0) {
               setPendingNews(p => {
                  const pUnique = new Map();
                  [...newFetched, ...p].forEach(n => pUnique.set(n.id, n));
                  return Array.from(pUnique.values());
               });
            }
        } else {
            setLiveNews(finalUnique);
        }
        
        const d = new Date();
        setSyncTime(`সদ্য আপডেট: ${d.toLocaleTimeString('bn-BD', {hour: '2-digit', minute:'2-digit'})}`);
      };

      // 1. Process Live API News & GitHub Data first to show updates instantly
      const apiNews = await liveNewsPromise();
      const ghResults = await Promise.all(ghPromises);
      const flatGhNews = ghResults.flat();
      const initialFastNews = [...apiNews, ...flatGhNews];
      let hasFastNews = false;
      if (initialFastNews.length > 0) {
         hasFastNews = true;
         if (flatGhNews.length > 0) {
            ghSuccessCount++;
            setIsGHSynced(true);
         }
         processNewsChunk(initialFastNews, isBackground);
         // Turn off the refreshing spinner since fast news is loaded
         setIsRefreshing(false);
      }
      
      // 2. Let RSS load in background and append when ready
      Promise.all(rssPromises).then(rssResults => {
         const flatRssNews = rssResults.flat();
         if (flatRssNews.length > 0) {
             processNewsChunk(flatRssNews, isBackground);
         }
      }).catch(e => {
         console.error("RSS sync error", e);
      }).finally(() => {
         if (!hasFastNews) {
            setIsRefreshing(false);
         }
         setTimeout(() => setIsScraping(false), 2000);
      });

    } catch(e) {
      console.error("News sync failed", e);
      setIsRefreshing(false);
      setIsScraping(false);
    }
  }, []);

  React.useEffect(() => {
    fetchRSS();
    
    // Auto-refresh when user returns to the app
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log("App became visible, refreshing news...");
        fetchRSS();
      }
    };

    const handleFocus = () => {
      console.log("Window focused, refreshing news...");
      fetchRSS();
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    // Refresh every 3 minutes for background updates
    const newsInterval = setInterval(() => fetchRSS(true), 3 * 60 * 1000);

    return () => {
       window.removeEventListener('visibilitychange', handleVisibilityChange);
       window.removeEventListener('focus', handleFocus);
       clearInterval(newsInterval);
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

    const updateDateTime = () => {
      const d = new Date();
      const dayName = days[d.getDay()];
      const dateNum = engToBnNum(d.getDate().toString());
      const monthName = months[d.getMonth()];
      const yearNum = engToBnNum(d.getFullYear().toString());
      
      setCurrentDateString(`${dayName}, ${dateNum} ${monthName} ${yearNum}`);
      setCurrentTimeString(engToBnNum(d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })).replace('AM', 'এএম').replace('PM', 'পিএম'));
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
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

  const handleDownloadPDF = async () => {
    const element = document.getElementById('article-content-to-pdf');
    if (!element) return;
    
    // Add temporary styling to format for PDF properly
    const originalStyle = element.style.cssText;
    element.style.padding = '20px';
    element.style.background = '#ffffff'; // force white background for PDF
    element.style.color = '#000000'; // force black text
    element.style.width = '800px';

    const actionButtons = element.querySelectorAll('.pdf-exclude');
    actionButtons.forEach((btn: any) => btn.style.display = 'none');

    try {
      const imgDataUrl = await toJpeg(element, {
        quality: 1.0,
        backgroundColor: '#ffffff',
        pixelRatio: 2,
        style: {
          transform: 'none',
        }
      });
      
      const img = new Image();
      img.src = imgDataUrl;
      await new Promise((resolve) => { img.onload = resolve; });

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [img.width, img.height]
      });

      pdf.addImage(imgDataUrl, 'JPEG', 0, 0, img.width, img.height);
      pdf.save(`newshub-${selectedArticle?.id || 'article'}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('পিডিএফ ডাউনলোড করতে সমস্যা হয়েছে।');
    } finally {
      element.style.cssText = originalStyle;
      actionButtons.forEach((btn: any) => btn.style.display = '');
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

  useEffect(() => {
    const handleVoicesChanged = () => {
      window.speechSynthesis.getVoices();
    };
    if ('speechSynthesis' in window) {
      window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
      // Initial trigger
      window.speechSynthesis.getVoices();
    }
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
      }
    };
  }, []);

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
        
        // Find a Bengali voice if available
        const voices = window.speechSynthesis.getVoices();
        const bnVoice = voices.find(v => v.lang.includes('bn') || v.name.includes('Bengali'));
        if (bnVoice) {
          utterance.voice = bnVoice;
        }

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

    filtered = filtered.filter(news => !dismissedNewsIds.has(news.id));

    return filtered;
  };

  const handleDismissNews = (e: React.MouseEvent, id: string) => {
     e.stopPropagation();
     setDismissedNewsIds(prev => {
       const next = new Set(prev);
       next.add(id);
       return next;
     });
  };

  const toggleBookmark = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (savedArticles.includes(id)) {
      setSavedArticles(savedArticles.filter(savedId => savedId !== id));
    } else {
      setSavedArticles([...savedArticles, id]);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
  };

  const navItems: {id: Tab, label: string, icon: any}[] = useMemo(() => [
    {id: 'home', label: 'হোম', icon: Home},
    {id: 'bangla', label: 'পত্রিকা', icon: Newspaper},
    {id: 'tv', label: 'লাইভ টিভি', icon: Tv},
    {id: 'intl_tv', label: 'আন্তর্জাতিক', icon: Globe},
    {id: 'english', label: 'English', icon: Type},
    {id: 'national', label: 'বাংলাদেশ', icon: MapPin},
    {id: 'international', label: 'বিশ্ব', icon: Globe},
    {id: 'sports', label: 'খেলাধুলা', icon: Trophy},
    {id: 'tech', label: 'প্রযুক্তি', icon: Sparkles},
    {id: 'entertainment', label: 'বিনোদন', icon: Tv},
    {id: 'visa', label: 'ভিসা', icon: ExternalLink},
    {id: 'saved', label: 'সেভ করা', icon: Bookmark},
    {id: 'ai', label: 'এআই বট', icon: Bot},
  ], []);

  const renderNavButtons = () => {
    return (
      <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-4 px-4 md:mx-0 md:px-0 hide-scrollbar scroll-smooth">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => { handleTabChange(item.id as Tab); }}
            className={`px-4 py-2.5 rounded-2xl text-[13px] font-bold transition-all flex items-center gap-2 whitespace-nowrap group active:scale-95 ${
              activeTab === item.id 
                ? 'skeuo-inset text-red-600 dark:text-red-500 font-extrabold scale-100' 
                : 'skeuo-btn text-gray-700 dark:text-gray-300'
            }`}
          >
            <item.icon size={17} strokeWidth={activeTab === item.id ? 3 : 2} className={activeTab === item.id ? 'text-red-600' : 'text-red-600'} />
            <span className="font-bengali">{item.label}</span>
          </button>
        ))}
        {/* Subtle end spacer for better scroll feeling */}
        <div className="w-4 flex-shrink-0 md:hidden"></div>
      </div>
    );
  };

  const allFilteredNewsForDisplay = filterNews(
    activeTab === 'saved' || activeTab === 'english' || activeTab === 'bangla'
      ? undefined 
      : (activeTab === 'home' 
          ? (selectedCategory === 'all' ? undefined : selectedCategory)
          : activeTab
        )
  );
  
  const displayNews = (activeTab === 'home' && selectedCategory === 'all')
    ? allFilteredNewsForDisplay.filter(n => !allFilteredNewsForDisplay.filter(top => top.isTopSource).slice(0, 4).some(top => top.id === n.id))
    : allFilteredNewsForDisplay;

  if (isAdminPanelOpen) {
    return <AdminApp onBackToApp={() => setIsAdminPanelOpen(false)} />;
  }

  return (
    <ErrorBoundary>
      <div className={`min-h-screen font-bengali transition-colors duration-500 overflow-x-hidden ${isDarkMode ? 'bg-[#151515] text-white' : 'bg-[#e6e6e6] text-gray-900'}`}>
      <AnalyticsTracker />
      {/* Top Utility Bar */}
      <div className={`px-4 md:px-8 py-2 flex justify-between items-center text-[10px] sm:text-xs font-bengali transition-all border-b ${isDarkMode ? 'bg-[#050505] border-white/5 text-gray-500' : 'bg-gray-100 border-gray-200 text-gray-600 shadow-sm'}`}>
        <div className="flex items-center gap-3 md:gap-6 overflow-x-auto scrollbar-hide shrink-0">
          <span className="hidden sm:inline-flex items-center gap-1.5 shrink-0"><Calendar className="w-3 h-3 text-red-600" /> {currentDateString}</span>
          <span className={`flex items-center gap-1.5 shrink-0 font-bold ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
            <Clock className="w-3 h-3 text-red-600" /> {currentTimeString}
          </span>
          <span className={`hidden lg:flex items-center gap-1.5 shrink-0 font-bold ${isDarkMode ? 'text-emerald-500/80' : 'text-emerald-700'}`}>
            🕌 {prayerTime}
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button 
            onClick={() => fetchRSS()}
            disabled={isRefreshing}
            className={`flex items-center gap-2 px-3 py-1 rounded-full transition-all shrink-0 font-black uppercase text-[9px] tracking-widest ${isDarkMode ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/20'}`}
          >
            {isRefreshing ? <RefreshCw className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
            <span>{isRefreshing ? 'লোডিং...' : 'আপডেট'}</span>
          </button>
        </div>
      </div>

      {/* Header */}
      <header className={`sticky top-0 z-[100] backdrop-blur-xl border-b transition-all duration-500 py-3 ${isDarkMode ? 'bg-[#151515]/80 border-white/5 shadow-2xl' : 'bg-[#e6e6e6]/80 border-gray-300 shadow-sm'}`}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div 
                  onClick={() => handleTabChange('home')}
                  className="flex items-center gap-2 md:gap-3 cursor-pointer group"
                >
                  <div className="p-2 bg-red-600 rounded-xl shadow-lg">
                     <Newspaper className="text-white w-5 h-5 md:w-6 md:h-6" strokeWidth={2.5} />
                  </div>
                  <div className="flex flex-col">
                     <div className="flex items-center font-sans font-black text-xl md:text-2xl tracking-tighter uppercase select-none">
                        <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>News</span>
                        <span className="bg-[#FF9900] text-black px-1.5 py-0.5 rounded ml-0.5 shadow-sm transform -rotate-1">Hub</span>
                        <BDFlag />
                     </div>
                  </div>
                </div>
            </div>
            
            <div className="flex items-center gap-2 md:gap-3">
              {isAdmin && (
                <button 
                  onClick={() => setIsAdminPanelOpen(true)}
                  className="p-2 md:p-2.5 rounded-xl skeuo-btn text-red-600 transition-all relative"
                >
                  <ShieldCheck size={20} />
                  {activeUsersCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[8px] font-black px-1 rounded-full shadow-lg animate-pulse">
                      {activeUsersCount}
                    </span>
                  )}
                </button>
              )}

              {user ? (
                <div className="flex items-center gap-2 group relative">
                  <img 
                    src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || 'User'}`} 
                    alt="Profile" 
                    className="w-9 h-9 rounded-xl skeuo-card p-[2px] transition-all cursor-pointer" 
                  />
                  <div className="absolute top-full right-0 mt-2 w-48 bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl p-2 opacity-0 group-hover:opacity-100 transition-all pointer-events-none group-hover:pointer-events-auto z-[210]">
                    <p className="px-4 py-2 text-[10px] font-bold text-gray-500 border-b border-white/5 truncate">{user.email}</p>
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-3 text-xs font-bold text-red-500 hover:bg-white/5 rounded-xl transition-all"
                    >
                      <LogOut size={14} /> লগআউট করুন
                    </button>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => setIsAuthModalOpen(true)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all skeuo-btn`}
                >
                  <LogIn size={16} />
                  <span className="hidden sm:inline font-bengali">লগইন</span>
                </button>
              )}

              <button 
                onClick={() => setIsSearchActive(!isSearchActive)}
                className={`p-2 md:p-2.5 rounded-xl transition-all skeuo-btn`}
              >
                <Search size={20} />
              </button>

              <button 
                className={`md:hidden p-2.5 rounded-xl transition-all skeuo-btn`}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          <div className="hidden md:block w-full">
             {renderNavButtons()}
          </div>
        </div>
      </header>

      {/* Persistent Horizontal Navigation for Mobile */}
      <div className={`md:hidden sticky top-[68px] z-[80] backdrop-blur-xl border-b transition-all ${isDarkMode ? 'bg-[#0a0a0a]/95 border-white/5' : 'bg-white/98 border-gray-100 shadow-sm'}`}>
        <div className="px-4 py-2.5 overflow-hidden">
          {renderNavButtons()}
        </div>
      </div>


      {/* Breaking Ticker */}
      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`md:hidden fixed inset-x-0 top-[68px] z-[90] p-4 border-b ${isDarkMode ? 'bg-[#0a0a0a] border-white/5' : 'bg-white border-gray-200'} shadow-xl flex flex-col gap-4`}
          >
             <button onClick={() => { setIsDarkMode(!isDarkMode); setIsMobileMenuOpen(false); }} className={`flex items-center gap-3 p-3 rounded-xl border ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}>
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />} 
                <span className="font-bengali font-bold">{isDarkMode ? 'লাইট মোড' : 'ডার্ক মোড'}</span>
             </button>
             <button onClick={() => { setIsFeedbackModalOpen(true); setIsMobileMenuOpen(false); }} className={`flex items-center gap-3 p-3 rounded-xl border ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}>
                <MessageSquare size={18} />
                <span className="font-bengali font-bold">মতামত দিন</span>
             </button>
             <button onClick={() => { alert('Privacy Policy: We respect your privacy. No personal data is stored without consent.'); setIsMobileMenuOpen(false); }} className={`flex items-center gap-3 p-3 rounded-xl border ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}>
                <ShieldCheck size={18} />
                <span className="font-bengali font-bold">প্রাইভেসি পলিসি</span>
             </button>
          </motion.div>
        )}
      </AnimatePresence>

      {liveNews.length > 0 && (
        <div 
          className={`border-b py-2 px-4 md:px-8 flex items-center overflow-hidden transition-colors ${isDarkMode ? 'bg-red-600/5 border-white/5' : 'bg-red-50 border-gray-200'}`}
        >
          <div className="flex items-center gap-2 mr-4 shrink-0">
            <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded shadow-lg uppercase tracking-widest">ব্রেকিং</span>
          </div>
          <div className="flex-1 relative h-5">
            <AnimatePresence mode="popLayout">
              {liveNews[currentTickerIndex % liveNews.length] && (
                <motion.p
                  key={currentTickerIndex % liveNews.length}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  className={`text-sm font-bold truncate font-bengali absolute inset-0 cursor-pointer hover:text-red-600 transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                  onClick={() => setSelectedArticle(liveNews[currentTickerIndex % liveNews.length])}
                >
                  {liveNews[currentTickerIndex % liveNews.length].title}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className={`flex-1 w-full ${activeTab === 'home' ? 'max-w-full px-0' : 'max-w-7xl mx-auto px-4 md:px-8'} pb-8 flex flex-col items-stretch`}>
        {isRefreshing && liveNews.length === 0 && activeTab !== 'ai' ? (
          <LoadingScreen isDarkMode={isDarkMode} />
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeTab}-${selectedCategory}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col flex-1 w-full"
            >
        {/* News Feed Sections */}
        {['home', 'national', 'international', 'sports', 'tech', 'entertainment', 'visa', 'saved', 'english', 'bangla'].includes(activeTab) && (
          <div className="flex flex-col gap-0">
             {activeTab === 'home' && selectedCategory === 'all' && (
                <>
                  {/* Hero Section */}
                  {liveNews.length > 0 && (
                    <HeroBanner 
                      news={dbNews.length > 0 ? dbNews[0] : liveNews[0]} 
                      onMoreInfo={(n) => setSelectedArticle(n)} 
                      onPlay={(n) => handleSpeak(n.title + ". " + (n.content || n.summary))}
                      isPlaying={isPlaying}
                    />
                  )}

                  <div className="max-w-7xl mx-auto w-full px-4 md:px-8 -mt-16 md:-mt-24 relative z-20 space-y-12 pb-20">
                    {/* FIFA 2026 Banner */}
                    <FifaWorldCupBanner news={liveNews} onNewsClick={setSelectedArticle} />

                    {/* Quick Access Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <motion.div 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleTabChange('bangla')}
                        className="skeuo-card p-5 md:p-8 flex items-center justify-between cursor-pointer overflow-hidden relative group"
                      >
                         <div className="relative z-10">
                            <h4 className="text-gray-900 dark:text-white font-black text-lg md:text-2xl font-bengali leading-tight">আজকের<br/>পত্রিকা</h4>
                            <p className="text-red-600 text-xs mt-1 md:mt-2 font-bold uppercase tracking-widest">All Newspapers</p>
                         </div>
                         <Newspaper size={48} className="text-gray-300 dark:text-gray-700 absolute -right-2 -bottom-2 group-hover:scale-110 transition-transform md:w-20 md:h-20" />
                      </motion.div>

                      <motion.div 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleTabChange('tv')}
                        className="skeuo-card p-5 md:p-8 flex items-center justify-between cursor-pointer overflow-hidden relative group"
                      >
                         <div className="relative z-10">
                            <h4 className="text-gray-900 dark:text-white font-black text-lg md:text-2xl font-bengali leading-tight">লাইভ<br/>টিভি</h4>
                            <p className="text-red-600 text-xs mt-1 md:mt-2 font-bold uppercase tracking-widest flex items-center gap-1.5">
                               <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span> Live News TV
                            </p>
                         </div>
                         <Tv size={48} className="text-gray-300 dark:text-gray-700 absolute -right-2 -bottom-2 group-hover:scale-110 transition-transform md:w-20 md:h-20" />
                      </motion.div>
                    </div>

                    {/* Trending Now */}
                    <NewsRow 
                      title="এখন ট্রেন্ডিং" 
                      news={liveNews.filter(n => n.isTopSource).slice(0, 10)} 
                      onNewsClick={setSelectedArticle}
                    />

                    {/* Firestore Admin News */}
                    {dbNews.length > 0 && (
                       <NewsRow 
                         title="সরাসরি আপডেট" 
                         news={dbNews} 
                         onNewsClick={setSelectedArticle}
                       />
                    )}

                    {/* Categories Rows */}
                    {['national', 'sports', 'tech', 'entertainment'].map(cat => {
                       const catNews = liveNews.filter(n => n.category === cat).slice(0, 10);
                       if (catNews.length === 0) return null;
                       return (
                        <div key={cat}>
                          <NewsRow 
                            title={cat === 'national' ? 'জাতীয় সংবাদ' : cat === 'sports' ? 'খেলাধুলা' : cat === 'tech' ? 'বিজ্ঞান ও প্রযুক্তি' : 'বিনোদন'} 
                            news={catNews} 
                            onNewsClick={setSelectedArticle}
                          />
                        </div>
                       );
                    })}
                  </div>
                </>
             )}

             {/* Standard Grid for other tabs or filtered home */}
             {((activeTab !== 'home') || (activeTab === 'home' && selectedCategory !== 'all')) && (
                <>
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-2xl md:text-4xl font-black font-bengali text-white flex items-center gap-4">
                      <span className="w-2 h-10 bg-red-600 rounded-full"></span>
                      {activeTab === 'home' ? (selectedCategory === 'all' ? 'প্রধান সংবাদ' : selectedCategory) : (activeTab === 'national' ? 'বাংলাদেশ' : activeTab === 'international' ? 'আন্তর্জাতিক' : activeTab === 'sports' ? 'খেলাধুলা' : activeTab === 'tech' ? 'প্রযুক্তি' : activeTab === 'entertainment' ? 'বিনোদন' : activeTab === 'visa' ? 'ভিসা ও তথ্য' : activeTab === 'saved' ? 'আপনার নির্বাচিত সংবাদ' : activeTab === 'english' ? 'English News' : 'পত্রিকা')}
                    </h3>
                  </div>

                  {displayNews.length > 0 ? (
                    <motion.div 
                      variants={containerVariants}
                      initial="hidden"
                      animate="show"
                      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8"
                    >
                      <AnimatePresence>
                        {displayNews.map((news, index) => (
                          <NewsCard 
                             key={news.id} 
                             news={news} 
                             index={index}
                             onNewsClick={setSelectedArticle} 
                             onShareClick={handleShare}
                             onDownloadClick={handleDownloadImage}
                             isSaved={savedArticles.includes(news.id)}
                             onToggleBookmark={toggleBookmark}
                             onDismiss={handleDismissNews}
                          />
                        ))}
                      </AnimatePresence>
                    </motion.div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-32 text-center">
                      <div className="w-20 h-20 mb-6 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center shadow-inner">
                        <Search className="w-10 h-10 text-gray-400 dark:text-white/30" />
                      </div>
                      <h3 className={`text-2xl font-bold font-bengali ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3`}>কোনো খবর পাওয়া যায়নি</h3>
                      <p className={`font-bengali text-base ${isDarkMode ? 'text-white/60' : 'text-gray-500'}`}>আপনার অনুসন্ধানের সাথে মিলে এমন কোনো খবর পাওয়া যায়নি।</p>
                    </div>
                  )}
                </>
             )}
          </div>
        )}
        
        {activeTab === 'ai' && (
          <div className="pt-8">
            <AIBot />
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
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {liveNews.filter(n => !!n.image).slice(0, 12).map((news, idx) => (
                <div key={`card-${news.id}-${idx}`} className="flex flex-col gap-5">
                  <div 
                    className="relative aspect-square bg-[#141414] overflow-hidden rounded-[2.5rem] group border border-white/5 hover:border-red-600/30 transition-all duration-700 shadow-2xl cursor-pointer"
                    onClick={() => handleShare(news)}
                  >
                    <img 
                      src={news.image} 
                      alt={news.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-60"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                    
                    <div className="relative z-10 p-8 flex flex-col h-full">
                      <div className="flex justify-between items-start mb-auto">
                        <div className="p-3 bg-red-600 rounded-2xl shadow-xl shadow-red-600/30">
                          <Newspaper size={20} className="text-white" />
                        </div>
                        <span className="bg-black/40 backdrop-blur-md text-white border border-white/10 text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em] shadow-2xl">
                          {news.source}
                        </span>
                      </div>
                      
                      <div className="mt-auto">
                        <div className="w-10 h-1 bg-red-600 rounded-full mb-4 group-hover:w-20 transition-all duration-500"></div>
                        <h3 className="text-2xl md:text-3xl font-black font-bengali text-white leading-tight mb-4 group-hover:text-red-500 transition-colors">
                          {news.title}
                        </h3>
                        <p className="text-gray-400 font-bengali text-sm md:text-base line-clamp-3 opacity-80 leading-relaxed group-hover:opacity-100 transition-opacity">
                          {news.summary}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 px-2">
                    <button 
                      onClick={() => handleShare(news)}
                      className="flex-1 bg-white text-black font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all hover:bg-red-600 hover:text-white shadow-xl"
                    >
                      <Share2 className="w-5 h-5" /> শেয়ার
                    </button>
                    <button 
                      onClick={() => handleDownloadImage(news)}
                      className="p-4 bg-white/5 border border-white/10 text-white rounded-2xl hover:bg-white/10 transition-all shadow-xl"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Media Sources Sections */}
        {(activeTab === 'bangla' || activeTab === 'english' || activeTab === 'tv' || activeTab === 'intl_tv') && (
          <div className="space-y-10">
            <div className="flex flex-col gap-2">
               <h2 className="text-2xl md:text-3xl font-black font-bengali text-white flex items-center gap-4">
                 <span className="w-1.5 h-8 bg-blue-600 rounded-full"></span>
                 {activeTab === 'intl_tv' ? 'আন্তর্জাতিক টিভি' : activeTab === 'tv' ? 'লাইভ টিভি' : activeTab === 'bangla' ? 'বাংলা পত্রিকা' : 'English Papers'}
               </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
              {(activeTab === 'bangla' ? banglaPapers : activeTab === 'english' ? englishPapers : activeTab === 'intl_tv' ? internationalChannels : tvChannels).map((source) => (
                <motion.button
                  key={source.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  aria-label={`${source.name} ওপেন করুন`}
                  onClick={() => {
                    window.open(source.url, '_blank');
                  }}
                  className="bg-[#141414] border border-white/5 rounded-2xl p-5 flex flex-col items-center justify-center gap-4 hover:bg-[#1a1a1a] hover:border-blue-600/30 transition-all group aspect-square relative"
                >
                  <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center p-2 shadow-xl group-hover:shadow-blue-600/20 transition-all overflow-hidden border border-white/10">
                    {source.logo ? (
                      <img 
                        src={source.logo} 
                        alt={source.name} 
                        className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" 
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span className="text-sm font-black text-gray-900 uppercase" aria-hidden="true">{source.logoText || source.name.substring(0,2)}</span>
                    )}
                  </div>
                  <span className="font-bold text-[13px] text-gray-400 group-hover:text-white font-bengali text-center leading-tight">
                    {source.name}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>
        )}
          </motion.div>
          </AnimatePresence>
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
              className="bg-[#0f0f0f] border border-gray-800 rounded-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl relative"
            >
              {/* Sticky Reader Header */}
              <div className={`sticky top-0 z-[100] border-b backdrop-blur-xl px-4 md:px-8 py-3 flex items-center justify-between transition-colors duration-500 ${readerTheme === 'dark' ? 'bg-[#0f0f0f]/90 border-white/5' : (readerTheme === 'sepia' ? 'bg-[#f4ecd8]/90 border-orange-200' : 'bg-white/90 border-gray-200')}`}>
                <div className="flex items-center gap-3">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <div className="w-6 h-6 bg-red-600 rounded flex items-center justify-center shadow-lg shadow-red-600/20">
                        <Newspaper size={14} className="text-white" />
                      </div>
                      <span className={`font-black text-xs uppercase tracking-tighter ${readerTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>NewsHub</span>
                    </div>
                  </div>
                  <div className={`w-px h-6 mx-1 ${readerTheme === 'dark' ? 'bg-white/10' : 'bg-gray-200'}`}></div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest ${readerTheme === 'dark' ? 'bg-red-600/20 text-red-500 border border-red-600/30' : 'bg-red-600 text-white'}`}>
                    {selectedArticle.source}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                   {/* Reader Settings */}
                   <div className="relative">
                      <button 
                        onClick={() => setIsReaderSettingsOpen(!isReaderSettingsOpen)}
                        className={`p-2 rounded-xl transition-all border ${isReaderSettingsOpen ? 'bg-red-600 border-red-600 text-white' : (readerTheme === 'dark' ? 'bg-white/5 border-white/10 text-gray-400 hover:text-white' : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200')}`}
                        aria-label="পঠন সেটিংস"
                        title="পঠন সেটিংস"
                      >
                        <Settings2 className="w-4 h-4" />
                      </button>

                      <AnimatePresence>
                        {isReaderSettingsOpen && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 10 }}
                            className={`absolute top-full right-0 mt-3 w-64 p-4 rounded-2xl border shadow-2xl z-50 ${readerTheme === 'dark' ? 'bg-[#1a1a1a] border-gray-800' : 'bg-white border-gray-200'}`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="space-y-4 font-bengali text-left">
                              <div>
                                <span className={`text-[10px] font-black uppercase tracking-widest mb-2 block ${readerTheme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>ফন্ট সাইজ</span>
                                <div className="flex items-center justify-between bg-black/20 rounded-xl p-1">
                                  <button onClick={() => setArticleTextSize('normal')} className={`flex-1 flex justify-center p-2 rounded-lg transition-all ${articleTextSize === 'normal' ? 'bg-red-600 text-white' : 'text-gray-500'}`}><Type className="w-3 h-3"/></button>
                                  <button onClick={() => setArticleTextSize('large')} className={`flex-1 flex justify-center p-2 rounded-lg transition-all ${articleTextSize === 'large' ? 'bg-red-600 text-white' : 'text-gray-500'}`}><Type className="w-4 h-4"/></button>
                                  <button onClick={() => setArticleTextSize('xlarge')} className={`flex-1 flex justify-center p-2 rounded-lg transition-all ${articleTextSize === 'xlarge' ? 'bg-red-600 text-white' : 'text-gray-500'}`}><Type className="w-5 h-5"/></button>
                                </div>
                              </div>
                              <div>
                                <span className={`text-[10px] font-black uppercase tracking-widest mb-2 block ${readerTheme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>লাইন স্পেসিং</span>
                                <div className="flex items-center justify-between bg-black/20 rounded-xl p-1">
                                  <button onClick={() => setLineSpacing('tight')} className={`flex-1 flex justify-center p-2 rounded-lg transition-all ${lineSpacing === 'tight' ? 'bg-red-600 text-white' : 'text-gray-500'}`}><SlidersHorizontal className="w-4 h-4 rotate-90"/></button>
                                  <button onClick={() => setLineSpacing('normal')} className={`flex-1 flex justify-center p-2 rounded-lg transition-all ${lineSpacing === 'normal' ? 'bg-red-600 text-white' : 'text-gray-500'}`}><SlidersHorizontal className="w-4 h-4 rotate-90 scale-y-125"/></button>
                                  <button onClick={() => setLineSpacing('relaxed')} className={`flex-1 flex justify-center p-2 rounded-lg transition-all ${lineSpacing === 'relaxed' ? 'bg-red-600 text-white' : 'text-gray-500'}`}><SlidersHorizontal className="w-4 h-4 rotate-90 scale-y-150"/></button>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                  <button 
                    onClick={() => handleSpeak(selectedArticle.title + ". " + selectedArticle.content)}
                    className={`flex items-center gap-2 p-2 px-3 rounded-xl transition-all border ${isPlaying ? 'bg-red-600 border-red-600 text-white' : (readerTheme === 'dark' ? 'bg-white/5 border-white/10 text-gray-400 hover:text-white' : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200')}`}
                  >
                    {isPlaying ? <PauseCircle className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    <span className="text-[10px] font-bold uppercase tracking-wider font-bengali">{isPlaying ? 'বন্ধ করুন' : 'শুনুন'}</span>
                  </button>

                  <button 
                    onClick={() => handleShare(selectedArticle)}
                    className={`p-2 rounded-xl transition-all border pdf-exclude ${readerTheme === 'dark' ? 'bg-white/5 border-white/10 text-gray-400 hover:text-white' : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'}`}
                  >
                    <Share2 className="w-4 h-4" />
                  </button>

                  <button 
                    onClick={handleDownloadPDF}
                    className={`p-2 rounded-xl transition-all border pdf-exclude ${readerTheme === 'dark' ? 'bg-white/5 border-white/10 text-gray-400 hover:text-white' : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'}`}
                    title="পিডিএফ ডাউনলোড করুন"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  <button 
                    onClick={() => closeArticle()}
                    className="p-2 bg-red-600 rounded-xl text-white hover:bg-red-700 transition-colors focus:ring-2 focus:ring-red-500 pdf-exclude"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div id="article-content-to-pdf" className={`p-6 md:p-12 font-bengali relative z-20 transition-colors duration-500 ${getThemeBg()}`}>
                <div className="flex items-center gap-3 text-[10px] md:text-xs text-gray-500 mb-6 uppercase tracking-[0.2em] font-bold">
                  <span className="flex items-center gap-2 bg-red-600/10 text-red-500 px-2 py-0.5 rounded-full"><Clock size={12}/> {selectedArticle.time}</span>
                  <span className="opacity-30">•</span>
                  <span className="flex items-center gap-2 bg-blue-600/10 text-blue-500 px-2 py-0.5 rounded-full"><User size={12}/> {selectedArticle.author || 'By Staff Writer'}</span>
                  <span className="opacity-30">•</span>
                  <span className="flex items-center gap-2 bg-emerald-600/10 text-emerald-500 px-2 py-0.5 rounded-full"><Clock size={12}/> {calculateReadTimeBengali(selectedArticle.title, selectedArticle.content)}</span>
                  <span className="opacity-30">•</span>
                  <span>{selectedArticle.category === 'national' ? 'জাতীয়' : selectedArticle.category === 'international' ? 'আন্তর্জাতিক' : selectedArticle.category}</span>
                </div>
                
                <h1 className={`text-2xl md:text-5xl font-black leading-[1.2] mb-8 transition-colors duration-500 drop-shadow-sm ${readerTheme === 'dark' ? 'text-white' : (readerTheme === 'sepia' ? 'text-[#3E2723]' : 'text-gray-900')}`}>
                  {selectedArticle.title}
                </h1>

                {selectedArticle.image && (
                  <div className="w-full mb-8 rounded-2xl overflow-hidden shadow-2xl relative group">
                    <img 
                      src={selectedArticle.image} 
                      alt={selectedArticle.title} 
                      onError={handleImageError}
                      className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  </div>
                )}
                
                <div className={`max-w-none transition-colors duration-500 ${readerTheme === 'dark' ? 'text-gray-300' : (readerTheme === 'sepia' ? 'text-[#433422]' : 'text-gray-800')}`}>
                  <div className={`${readerTheme === 'dark' ? 'bg-white/5 border-white/5 shadow-none' : (readerTheme === 'sepia' ? 'bg-[#efe6d1] border-[#e0d6bc]' : 'bg-gray-50 border-gray-200')} border rounded-2xl p-6 mb-10 relative overflow-hidden transition-all text-left group`}>
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Sparkles className={`w-24 h-24 ${readerTheme === 'dark' ? 'text-white' : 'text-black'}`} />
                    </div>
                    <h3 className={`${readerTheme === 'dark' ? 'text-red-500' : 'text-red-600'} font-black mb-3 flex items-center gap-2 text-[11px] uppercase tracking-[0.2em]`}><Sparkles className="w-4 h-4 animate-pulse"/> এআই সারসংক্ষেপ</h3>
                    <p className={`font-bold italic relative z-10 transition-all ${getReaderStyles()} ${readerTheme === 'dark' ? 'text-white' : (readerTheme === 'sepia' ? 'text-[#3E2723]' : 'text-gray-900')}`}>
                      {selectedArticle.summary}
                    </p>
                  </div>
                  <p className={`whitespace-pre-line text-left transition-all leading-relaxed ${getReaderStyles()}`}>
                    {selectedArticle.content}
                  </p>
                </div>

                {/* Source and Link */}
                <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-red-600/20">
                         <Newspaper size={24} />
                      </div>
                      <div>
                         <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none mb-1">প্রকাশকাল</p>
                         <p className={`font-bold text-sm ${readerTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{selectedArticle.source} • {selectedArticle.time}</p>
                      </div>
                   </div>
                   
                   {selectedArticle.url && selectedArticle.url !== '#' && (
                     <button 
                        onClick={() => window.open(selectedArticle.url, '_blank')}
                        className="pdf-exclude w-full sm:w-auto px-6 py-3 bg-red-600 text-white font-black rounded-2xl hover:bg-red-700 transition-all shadow-xl flex items-center justify-center gap-2 group"
                     >
                        মূল সংবাদটি পড়ুন <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                     </button>
                   )}
                </div>

                {/* Article Comments */}
                <div className="pdf-exclude">
                  <ArticleComments 
                    articleId={selectedArticle.id} 
                    articleTitle={selectedArticle.title} 
                  />
                </div>

                {/* Related News Section */}
                {liveNews.filter(n => n.id !== selectedArticle.id && n.category === selectedArticle.category).length > 0 && (
                  <div className="mt-12 pt-8 border-t border-gray-800 pdf-exclude">
                    <h3 className={`text-xl font-bold mb-6 flex items-center gap-2 relative ${readerTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                       <span className="w-1.5 h-6 bg-red-600 rounded-full inline-block mr-1"></span>
                       সম্পর্কিত খবর
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {liveNews.filter(n => n.id !== selectedArticle.id && n.category === selectedArticle.category).slice(0, 4).map((relatedNews, idx) => (
                        <div 
                          key={`related-${relatedNews.id}-${idx}`} 
                          onClick={(e) => {
                            e.stopPropagation();
                            if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                            setIsPlaying(false);
                            setSelectedArticle(relatedNews);
                            // Scroll modal to top
                            const modalContent = e.currentTarget.closest('.overflow-y-auto');
                            if (modalContent) modalContent.scrollTo({ top: 0, behavior: 'smooth' });
                            setIsReaderSettingsOpen(false);
                          }}
                          className={`${readerTheme === 'dark' ? 'bg-[#111] border-gray-800 text-gray-200' : 'bg-white border-gray-200 text-gray-900'} flex gap-4 p-3 rounded-2xl border hover:border-gray-600 hover:shadow-lg transition-all cursor-pointer group h-full overflow-hidden`}
                        >
                          <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-gray-900">
                             <img 
                               src={relatedNews.image} 
                               alt={relatedNews.title} 
                               className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                               onError={handleImageError}
                             />
                          </div>
                          <div className="flex flex-col flex-1 justify-between py-1">
                            <h4 className="font-bold text-sm text-gray-200 group-hover:text-red-400 transition-colors line-clamp-3 leading-snug">{relatedNews.title}</h4>
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



      {/* Footer Status Bar */}
      <footer className="bg-[#050505] border-t border-gray-800 px-4 md:px-8 py-3 flex flex-col md:flex-row justify-between items-center text-[10px] text-gray-600 font-bold tracking-widest uppercase mt-auto mb-4">
        <div className="flex gap-4 mb-3 md:mb-0 items-center">
          <span className="font-bengali">সংযুক্ত সংবাদপত্র: ৬৪টি</span>
          <span className="font-bengali">টিভি চ্যানেল: ২২টি</span>
          <button 
            onClick={() => setIsFeedbackModalOpen(true)}
            className="flex items-center gap-1.5 text-red-500 hover:text-red-400 transition-colors ml-4 border-l border-white/10 pl-4"
          >
            <MessageSquare size={12} />
            <span className="font-bengali">মতামত দিন</span>
          </button>
        </div>
        <div className="flex gap-4 items-center flex-wrap justify-center">
          <span className={`${isOnline ? 'text-green-600' : 'text-orange-500'} flex items-center gap-1`}>
            {isOnline ? (
              <>
                <Wifi size={10} />
                <span className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse"></span> সার্ভার স্ট্যাটাস: অপটিমাল
              </>
            ) : (
              <>
                <WifiOff size={10} />
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span> অফলাইন মোড সক্রিয়
              </>
            )}
          </span>
          <span className="font-bengali">ডেভেলপার: <a href="https://www.facebook.com/share/1LBEzTyQoF/" target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-400 hover:underline">Faisal Kabir Rabi</a></span>
          <span className="font-bengali">© ২০২৪ নিউজহাব বাংলাদেশ লি:</span>
        </div>
      </footer>

      {/* Desktop Footer (Optional addition for completeness) */}
      <footer className="hidden lg:block bg-[#070707] border-t border-gray-900 mt-20 py-12 pb-12">
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
                <li><button onClick={() => setIsFeedbackModalOpen(true)} className="hover:text-red-500 transition-colors flex items-center gap-2"><MessageSquare size={14} /> মতামত দিন</button></li>
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
              <span onClick={() => alert('Privacy Policy: All news content is sourced from public feeds. Personal data is not shared.')} className="text-gray-600 text-[10px] uppercase tracking-widest cursor-pointer hover:text-red-500 transition-colors">Privacy</span>
              <span onClick={() => alert('Terms of Service: By using this app, you agree to read news responsibly and respect the copyright of respective news owners.')} className="text-gray-600 text-[10px] uppercase tracking-widest cursor-pointer hover:text-red-500 transition-colors">Terms</span>
              <span onClick={() => alert('Cookie Policy: We use strictly necessary cookies to save your preferences like dark mode and saved articles.')} className="text-gray-600 text-[10px] uppercase tracking-widest cursor-pointer hover:text-red-500 transition-colors">Cookies</span>
            </div>
          </div>
        </div>
      </footer>

      <FeedbackModal 
        isOpen={isFeedbackModalOpen} 
        onClose={() => setIsFeedbackModalOpen(false)} 
      />

      <LoginModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        isDarkMode={isDarkMode}
        onGoogleLogin={handleLogin}
      />

      {/* Background Update Toast */}
      <AnimatePresence>
        {pendingNews.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className={`fixed bottom-24 md:bottom-10 left-1/2 -translate-x-1/2 z-[200] max-w-sm w-full px-4`}
          >
            <div className={`p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-4 border ${isDarkMode ? 'bg-[#1e1e1e] border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-600/20 rounded-full">
                  <RefreshCw size={18} className="text-red-500" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">{pendingNews.length}টি নতুন খবর</h4>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>তাজা খবর দেখতে রিফ্রেশ করুন</p>
                </div>
              </div>
              <button 
                onClick={() => {
                   setLiveNews(prev => {
                       const combinedPending = [...pendingNews, ...prev];
                       const unique = new Map();
                       combinedPending.forEach(n => unique.set(n.id, n));
                       const sorted = Array.from(unique.values()).sort((a: any, b: any) => (b.timestamp || 0) - (a.timestamp || 0));
                       return sorted.slice(0, 100);
                   });
                   setPendingNews([]);
                   window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${isDarkMode ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'}`}
              >
                রিফ্রেশ
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin Panel Modal removed to use full page view */}
    </div>
    </ErrorBoundary>
  );
}
