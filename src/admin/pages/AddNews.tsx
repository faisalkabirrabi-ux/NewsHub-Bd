import React, { useState } from 'react';
import { adminService } from '../services/api';
import { Save, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const AddNews: React.FC = () => {
  const [formData, setFormData] = useState({
    title: '',
    category: 'national',
    source: 'Admin Panel',
    image: '',
    time: 'সহজেই যোগ করা হয়েছে',
    summary: '',
    content: ''
  });
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminService.addNews(formData);
      setIsSuccess(true);
      // Also show the alert as requested in the snippet
      alert("News Added");
      
      setFormData({
        title: '',
        category: 'national',
        source: 'Admin Panel',
        image: '',
        time: 'সহজেই যোগ করা হয়েছে',
        summary: '',
        content: ''
      });
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert("Error adding news. Check console.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <AnimatePresence>
        {isSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6 bg-green-500/10 border border-green-500/20 p-4 rounded-2xl flex items-center gap-3 text-green-500"
          >
            <CheckCircle2 size={20} />
            <span className="font-bengali font-bold">খবরটি সফলভাবে যোগ করা হয়েছে!</span>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="bg-[#1a1a1a] border border-white/5 rounded-3xl p-6 md:p-8 space-y-6">
        <div className="space-y-4">
          <label className="block text-white/50 text-sm font-bold font-bengali">খবরের শিরোনাম</label>
          <input 
            required
            type="text" 
            placeholder="এখানে শিরোনাম লিখুন..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white text-lg font-bold focus:outline-none focus:border-red-600/50 font-bengali"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <label className="block text-white/50 text-sm font-bold font-bengali">ক্যাটাগরি</label>
            <select 
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-red-600/50 font-bengali"
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
            >
              <option value="national">বাংলাদেশ</option>
              <option value="international">আন্তর্জাতিক</option>
              <option value="sports">খেলাধুলা</option>
              <option value="entertainment">বিনোদন</option>
              <option value="tech">তথ্যপ্রযুক্তি</option>
            </select>
          </div>
          
          <div className="space-y-4">
            <label className="block text-white/50 text-sm font-bold font-bengali">ইমেজ ইউআরএল</label>
            <div className="relative">
              <input 
                type="text" 
                placeholder="https://..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-red-600/50 pl-12"
                value={formData.image}
                onChange={(e) => setFormData({...formData, image: e.target.value})}
              />
              <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={20} />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-white/50 text-sm font-bold font-bengali">খবরের সারসংক্ষেপ</label>
          <textarea 
            rows={3}
            placeholder="সারসংক্ষেপ লিখুন..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-red-600/50 font-bengali resize-none"
            value={formData.summary}
            onChange={(e) => setFormData({...formData, summary: e.target.value})}
          ></textarea>
        </div>

        <div className="space-y-4">
          <label className="block text-white/50 text-sm font-bold font-bengali">খবরের বিস্তারিত</label>
          <textarea 
            rows={6}
            placeholder="বিস্তারিত লিখুন..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-red-600/50 font-bengali resize-none"
            value={formData.content}
            onChange={(e) => setFormData({...formData, content: e.target.value})}
          ></textarea>
        </div>

        <div className="flex justify-end gap-4 pt-4 border-t border-white/5">
          <button 
            type="button"
            className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl transition-all font-bengali"
            onClick={() => setFormData({
              title: '',
              category: 'national',
              source: 'Admin Panel',
              image: '',
              time: 'সহজেই যোগ করা হয়েছে',
              summary: '',
              content: ''
            })}
          >
            বাতিল করুন
          </button>
          <button 
            type="submit"
            className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl shadow-xl shadow-red-600/20 transition-all font-bengali flex items-center gap-2"
          >
            <Save size={20} /> খবর প্রকাশ করুন
          </button>
        </div>
      </form>
    </div>
  );
};
