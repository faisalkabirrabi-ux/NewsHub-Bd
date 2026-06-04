import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, Trophy, Clock, Activity, Calendar } from 'lucide-react';
import { NewsArticle } from '../data';

interface FifaWorldCupBannerProps {
  news: NewsArticle[];
  onNewsClick: (article: NewsArticle) => void;
}

const mockMatches = [
  { id: 1, team1: 'Argentina', team2: 'Brazil', score1: 0, score2: 0, time: "45'", status: 'LIVE', date: 'Today' },
  { id: 2, team1: 'France', team2: 'Spain', score1: 2, score2: 1, time: "FT", status: 'FINISHED', date: 'Yesterday' },
  { id: 3, team1: 'Germany', team2: 'England', score1: 0, score2: 0, time: "20:00", status: 'UPCOMING', date: 'Today' },
];

export const FifaWorldCupBanner: React.FC<FifaWorldCupBannerProps> = ({ news, onNewsClick }) => {
  const [currentMatchIdx, setCurrentMatchIdx] = useState(0);

  // Filter FIFA news from the provided news list
  const fifaNews = news.filter(n => 
    n.title.toLowerCase().includes('fifa') || 
    n.title.includes('ফিফা') ||
    n.title.toLowerCase().includes('world cup') ||
    n.title.includes('বিশ্বকাপ') ||
    n.category === 'sports'
  ).slice(0, 5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentMatchIdx((prev) => (prev + 1) % mockMatches.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full bg-gradient-to-r from-[#003366] via-[#004b87] to-[#800020] rounded-3xl overflow-hidden shadow-2xl relative mb-8 mt-4 border border-white/10 group">
      {/* Decorative Background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full text-white fill-current">
          <pattern id="hexagons" width="10" height="17.32" patternUnits="userSpaceOnUse" patternTransform="scale(2)">
            <path d="M5,0 10,2.887 10,8.66 5,11.547 0,8.66 0,2.887Z" fill="none" stroke="currentColor" strokeWidth="0.5"/>
          </pattern>
          <rect width="100%" height="100%" fill="url(#hexagons)" />
        </svg>
      </div>

      <div className="flex flex-col lg:flex-row relative z-10">
        {/* Left Side: Live Matches */}
        <div className="flex-1 p-6 md:p-8 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-white/10">
          <div className="flex items-center gap-3 mb-6">
            <Trophy className="text-yellow-400 w-8 h-8" />
            <div>
              <h2 className="text-white text-2xl font-black italic tracking-wide">FIFA WORLD CUP</h2>
              <p className="text-white/70 text-sm font-bold tracking-widest uppercase">2026 LIVE UPDATES</p>
            </div>
          </div>

          <div className="relative h-28 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentMatchIdx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="w-full bg-black/30 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-inner"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className={`text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1
                    ${mockMatches[currentMatchIdx].status === 'LIVE' ? 'bg-red-600/20 text-red-400' : 
                      mockMatches[currentMatchIdx].status === 'FINISHED' ? 'bg-gray-600/20 text-gray-400' : 
                      'bg-blue-600/20 text-blue-400'}`}
                  >
                    {mockMatches[currentMatchIdx].status === 'LIVE' && <Activity size={12} className="animate-pulse" />}
                    {mockMatches[currentMatchIdx].status === 'UPCOMING' && <Calendar size={12} />}
                    {mockMatches[currentMatchIdx].status === 'FINISHED' && <Clock size={12} />}
                    {mockMatches[currentMatchIdx].status}
                  </span>
                  <span className="text-white/60 text-xs font-bold">{mockMatches[currentMatchIdx].date}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="text-xl md:text-2xl font-bold text-white w-2/5 text-right truncate pr-4">
                    {mockMatches[currentMatchIdx].team1}
                  </div>
                  
                  <div className="flex items-center gap-3 px-4 py-2 bg-black/40 rounded-xl">
                    <span className="text-2xl font-black text-white">{mockMatches[currentMatchIdx].status === 'UPCOMING' ? '-' : mockMatches[currentMatchIdx].score1}</span>
                    <span className="text-white/50 text-sm">{mockMatches[currentMatchIdx].time}</span>
                    <span className="text-2xl font-black text-white">{mockMatches[currentMatchIdx].status === 'UPCOMING' ? '-' : mockMatches[currentMatchIdx].score2}</span>
                  </div>

                  <div className="text-xl md:text-2xl font-bold text-white w-2/5 text-left truncate pl-4">
                    {mockMatches[currentMatchIdx].team2}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
          
          <div className="flex justify-center gap-2 mt-4">
            {mockMatches.map((_, idx) => (
              <div key={idx} className={`w-2 h-2 rounded-full transition-all ${idx === currentMatchIdx ? 'bg-yellow-400 w-6' : 'bg-white/20'}`} />
            ))}
          </div>
        </div>

        {/* Right Side: News Sidebar */}
        <div className="w-full lg:w-[400px] flex flex-col p-6 md:p-8 bg-black/20 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold text-lg flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              বিশ্বকাপের খবর
            </h3>
            <button className="text-white/50 hover:text-white transition-colors text-sm flex items-center">
              আরও <ChevronRight size={16} />
            </button>
          </div>

          <div className="flex flex-col gap-4 overflow-y-auto max-h-[200px] pr-2 custom-scrollbar">
            {fifaNews.length > 0 ? fifaNews.map((article, idx) => (
              <div 
                key={idx} 
                onClick={() => onNewsClick(article)}
                className="flex gap-4 items-center group cursor-pointer"
              >
                <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 relative">
                  <img src={article.image || 'https://images.unsplash.com/photo-1518605368461-1ffb15745e45?w=200&h=200&fit=crop'} alt="FIFA News" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="flex-1">
                  <h4 className="text-white text-sm font-bold line-clamp-2 leading-tight group-hover:text-yellow-400 transition-colors font-bengali">
                    {article.title}
                  </h4>
                  <span className="text-white/40 text-xs mt-1 block">
                    {typeof article.timestamp === 'number' ? new Date(article.timestamp).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }) : article.time || 'শীঘ্রই'}
                  </span>
                </div>
              </div>
            )) : (
               <div className="text-white/50 text-sm text-center py-8">কোন আপডেট পাওয়া যায়নি</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
