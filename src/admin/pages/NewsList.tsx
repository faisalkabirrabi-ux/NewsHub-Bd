import React, { useState, useEffect } from 'react';
import { NewsCard } from '../components/NewsCard';
import { adminService } from '../services/api';
import { NewsArticle } from '../../data';
import { Filter, Search, Loader2 } from 'lucide-react';

export const NewsList: React.FC = () => {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getAllNews();
      setNews(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number | string) => {
    if (window.confirm('আপনি কি নিশ্চিত যে এই খবরটি ডিলিট করতে চান?')) {
      await adminService.deleteNews(id);
      loadNews();
    }
  };

  const filteredNews = news.filter(n => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={18} />
          <input 
            type="text" 
            placeholder="খবর খুঁজুন..."
            className="w-full bg-[#1a1a1a] border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-red-600/50 font-bengali"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white/70 hover:bg-white/10 transition-all text-sm font-bengali">
          <Filter size={18} /> ফিল্টার
        </button>
      </div>

      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <Loader2 className="text-red-600 animate-spin" size={32} />
        </div>
      ) : filteredNews.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredNews.map((item) => (
            <NewsCard 
              key={item.id} 
              news={item} 
              onEdit={() => {}} 
              onDelete={handleDelete} 
            />
          ))}
        </div>
      ) : (
        <div className="bg-[#1a1a1a] border border-white/5 rounded-3xl p-12 text-center">
          <p className="text-white/40 font-bengali text-lg">কোনো খবর পাওয়া যায়নি।</p>
        </div>
      )}
    </div>
  );
};
