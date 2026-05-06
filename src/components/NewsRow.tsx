import React from "react";
import { motion } from "motion/react";
import { NewsArticle } from "../data";

interface NewsRowProps {
  title: string;
  news: NewsArticle[];
  onNewsClick?: (news: NewsArticle) => void;
}

export default function NewsRow({ title, news, onNewsClick }: NewsRowProps) {
  return (
    <div className="my-12">
      <div className="flex items-center justify-between mb-6 px-4 md:px-0">
        <h2 className="text-xl md:text-2xl font-bold font-bengali text-white flex items-center gap-3">
          <span className="w-1.5 h-8 bg-red-600 rounded-full"></span>
          {title}
        </h2>
        <button className="text-sm font-bold text-gray-400 hover:text-red-500 transition-colors uppercase tracking-widest px-4 py-1.5 rounded-full border border-white/10 hover:border-red-500/50">
          সব দেখুন
        </button>
      </div>

      {/* Horizontal scrolling container */}
      <div className="flex overflow-x-auto gap-5 pb-8 snap-x hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0 scroll-smooth">
        {news.map((item, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.05, zIndex: 10 }}
            className="flex-none w-64 md:w-80 group cursor-pointer snap-start bg-[#141414] rounded-2xl overflow-hidden border border-white/5 shadow-2xl relative"
            title={item.title}
            onClick={() => onNewsClick && onNewsClick(item)}
          >
            {/* Image Container */}
            <div className="aspect-[16/9] w-full overflow-hidden relative">
              <img 
                src={item.image} 
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity"></div>
              
              {/* Overlay info */}
              <div className="absolute top-3 left-3">
                <span className="px-2.5 py-1 bg-red-600 text-[10px] font-black uppercase text-white rounded-lg shadow-lg backdrop-blur-sm border border-white/10">
                  {item.source || 'নিউজ'}
                </span>
              </div>
            </div>

            {/* Content Area */}
            <div className="p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-[11px] text-gray-500 font-bold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></span>
                <span>{item.time || 'শীঘ্রই'}</span>
              </div>
              <h4 className="text-base font-bold line-clamp-2 text-white group-hover:text-red-500 transition-colors leading-relaxed font-bengali">
                {item.title}
              </h4>
            </div>
            
            {/* Hover Glow Effect */}
            <div className="absolute inset-0 rounded-2xl border-2 border-red-600/0 group-hover:border-red-600/20 transition-all duration-300 pointer-events-none shadow-inner"></div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
