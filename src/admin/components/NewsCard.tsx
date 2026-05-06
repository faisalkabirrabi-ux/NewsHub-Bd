import React from 'react';
import { NewsArticle } from '../../data';
import { Edit3, Trash2, ExternalLink, Calendar } from 'lucide-react';

interface NewsCardProps {
  news: NewsArticle;
  onEdit: (news: NewsArticle) => void;
  onDelete: (id: number | string) => void;
}

export const NewsCard: React.FC<NewsCardProps> = ({ news, onEdit, onDelete }) => {
  return (
    <div className="bg-[#1a1a1a] border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all group">
      <div className="flex gap-4 p-4">
        <div className="w-24 h-24 md:w-32 md:h-24 flex-shrink-0 bg-white/5 rounded-xl overflow-hidden relative">
          <img 
            src={news.image || 'https://images.unsplash.com/photo-1585829365234-781fcd04c838?w=800&q=80'} 
            alt={news.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-2 left-2 px-2 py-0.5 bg-red-600 rounded text-[10px] text-white font-bold uppercase">
            {news.category}
          </div>
        </div>
        
        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
          <div>
            <h3 className="text-white font-bold font-bengali text-sm md:text-base line-clamp-2 leading-tight">
              {news.title}
            </h3>
            <div className="flex items-center gap-3 mt-2 text-white/40 text-[11px] md:text-xs">
              <span className="flex items-center gap-1"><Calendar size={12} /> {news.time}</span>
              <span className="flex items-center gap-1"><ExternalLink size={12} /> {news.source}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mt-3">
            <button 
              onClick={() => onEdit(news)}
              className="flex-1 flex items-center justify-center gap-2 py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-lg transition-colors border border-white/5"
            >
              <Edit3 size={14} /> এডিট
            </button>
            <button 
              onClick={() => onDelete(news.id)}
              className="flex items-center justify-center p-2 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white rounded-lg transition-all border border-red-600/10"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
