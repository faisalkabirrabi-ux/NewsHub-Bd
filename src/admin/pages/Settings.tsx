import React from 'react';
import { User, Bell, Shield, Smartphone, Globe, Save } from 'lucide-react';

export const Settings: React.FC = () => {
  return (
    <div className="max-w-4xl space-y-8">
      <div className="bg-[#1a1a1a] border border-white/5 rounded-3xl overflow-hidden divide-y divide-white/5">
        <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start">
          <div className="w-full md:w-1/3">
            <h3 className="text-white font-bold text-lg font-bengali">প্রোফাইল সেটিংস</h3>
            <p className="text-white/40 text-sm mt-1 font-bengali">আপনার ব্যক্তিগত তথ্য এবং পাসওয়ার্ড আপডেট করুন।</p>
          </div>
          <div className="flex-1 w-full space-y-6">
            <div className="flex items-center gap-6 pb-6 border-b border-white/5">
              <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center text-3xl font-bold">A</div>
              <button className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-xl border border-white/10 transition-colors">ফটো পরিবর্তন করুন</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div className="space-y-2">
                 <label className="text-white/40 text-[11px] font-bold uppercase tracking-wider">ফুল নেম</label>
                 <input type="text" defaultValue="Admin User" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-red-600/50" />
               </div>
               <div className="space-y-2">
                 <label className="text-white/40 text-[11px] font-bold uppercase tracking-wider">ইমেইল এড্রেস</label>
                 <input type="email" defaultValue="admin@newshub.com" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-red-600/50" />
               </div>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start">
          <div className="w-full md:w-1/3">
            <h3 className="text-white font-bold text-lg font-bengali">অ্যাপ কনফিগারেশন</h3>
            <p className="text-white/40 text-sm mt-1 font-bengali">অ্যাপের নোটিফিকেশন এবং সিকিউরিটি কন্ট্রোল করুন।</p>
          </div>
          <div className="flex-1 w-full space-y-6">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
              <div className="flex items-center gap-3">
                <Bell size={20} className="text-red-500" />
                <div>
                  <p className="text-white font-bold text-sm font-bengali">পুশ নোটিফিকেশন</p>
                  <p className="text-white/30 text-xs font-bengali">নতুন খবর সাবস্ক্রাইবারদের ফোনে পাঠান</p>
                </div>
              </div>
              <div className="w-12 h-6 bg-red-600 rounded-full flex items-center px-1">
                <div className="w-4 h-4 bg-white rounded-full ml-auto shadow-sm"></div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
              <div className="flex items-center gap-3">
                <Shield size={20} className="text-green-500" />
                <div>
                  <p className="text-white font-bold text-sm font-bengali">টু-ফ্যাক্টর অথেনটিকেশন</p>
                  <p className="text-white/30 text-xs font-bengali">অ্যাকাউন্টে বাড়তি নিরাপত্তা যোগ করুন</p>
                </div>
              </div>
              <div className="w-12 h-6 bg-white/10 rounded-full flex items-center px-1">
                <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button className="flex items-center gap-2 px-8 py-4 bg-red-600 text-white font-bold rounded-2xl shadow-xl shadow-red-600/20 hover:bg-red-700 transition-all font-bengali">
          <Save size={20} /> সেটিংস সেভ করুন
        </button>
      </div>
    </div>
  );
};
