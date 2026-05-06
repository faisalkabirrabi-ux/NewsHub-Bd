import React from 'react';
import { 
  Users, 
  Newspaper, 
  Eye, 
  TrendingUp,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import { motion } from 'motion/react';

export const Dashboard: React.FC = () => {
  const stats = [
    { label: 'মোট খবর', value: '১,২৪০', icon: Newspaper, color: 'bg-blue-500', trend: '+১২%' },
    { label: 'আজকের পাঠক', value: '৪৫,২০০', icon: Eye, color: 'bg-green-500', trend: '+১৮%' },
    { label: 'নতুন ইউজার', value: '৮৫০', icon: Users, color: 'bg-purple-500', trend: '+৫%' },
    { label: 'এনগেজমেন্ট', value: '২৪.৫%', icon: TrendingUp, color: 'bg-red-500', trend: '+৯%' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={i} 
            className="bg-[#1a1a1a] p-6 rounded-3xl border border-white/5 relative overflow-hidden group hover:border-white/10 transition-all shadow-2xl"
          >
            <div className={`w-12 h-12 ${stat.color} rounded-2xl mb-4 flex items-center justify-center text-white shadow-lg`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-white/40 text-xs font-bold uppercase tracking-wider font-bengali">{stat.label}</p>
              <h3 className="text-white text-3xl font-black mt-1 font-bengali">{stat.value}</h3>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="text-green-500 text-xs font-bold flex items-center gap-1 bg-green-500/10 px-2 py-0.5 rounded-full">
                  <ArrowUpRight size={12} /> {stat.trend}
                </span>
                <span className="text-white/20 text-[10px] font-bold uppercase">vs last week</span>
              </div>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
              <stat.icon size={120} />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-[#1a1a1a] rounded-3xl border border-white/5 p-6 md:p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-white text-xl font-bold font-bengali">সাম্প্রতিক কার্যক্রম</h3>
            <button className="text-red-500 text-sm font-bold hover:underline">সব দেখুন</button>
          </div>
          
          <div className="space-y-6">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="flex gap-4 items-start group">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0 border border-white/5">
                  <Clock size={18} className="text-white/30" />
                </div>
                <div className="flex-1 border-b border-white/5 pb-6 last:border-0">
                  <p className="text-white/90 text-sm font-medium font-bengali leading-relaxed">
                    <span className="text-red-500 font-bold">এডমিন</span> একটি নতুন খবর প্রকাশ করেছেন: 
                    <span className="text-white/50 italic ml-1">"বাংলাদেশে বিনিয়োগ বাড়াতে চায় জাপান..."</span>
                  </p>
                  <p className="text-white/30 text-[11px] mt-1.5 uppercase tracking-widest font-bold">৩ মিনিট আগে</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Categories Performance */}
        <div className="bg-[#1a1a1a] rounded-3xl border border-white/5 p-6 md:p-8">
          <h3 className="text-white text-xl font-bold mb-8 font-bengali">ক্যাটাগরি পারফরম্যান্স</h3>
          <div className="space-y-6">
            {[
              { name: 'আন্তর্জাতিক', value: 85, color: 'bg-red-600' },
              { name: 'খেলাধুলা', value: 65, color: 'bg-blue-600' },
              { name: 'রাজনীতি', value: 45, color: 'bg-yellow-600' },
              { name: 'বিনোদন', value: 30, color: 'bg-purple-600' },
            ].map((cat, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white/70 font-bengali">{cat.name}</span>
                  <span className="text-white font-bold">{cat.value}%</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${cat.value}%` }}
                    transition={{ delay: 0.5 + (i * 0.1), duration: 1 }}
                    className={`h-full ${cat.color}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
