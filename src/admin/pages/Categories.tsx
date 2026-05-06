import React from 'react';
import { Plus, MoveVertical, Edit2, Trash2 } from 'lucide-react';

export const Categories: React.FC = () => {
  const categories = [
    { id: 1, name: 'বাংলাদেশ', count: 450, color: '#dc2626' },
    { id: 2, name: 'আন্তর্জাতিক', count: 320, color: '#2563eb' },
    { id: 3, name: 'খেলাধুলা', count: 280, color: '#16a34a' },
    { id: 4, name: 'বিনোদন', count: 190, color: '#9333ea' },
    { id: 5, name: 'তথ্যপ্রযুক্তি', count: 150, color: '#f59e0b' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-white/50 font-bengali">ক্যাটাগরিগুলো এখান থেকে ড্র্যাগ করে ক্রমানুসারে সাজাতে পারেন।</p>
        <button className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-bold rounded-2xl shadow-lg shadow-red-600/20 hover:bg-red-700 transition-all font-bengali">
          <Plus size={20} /> নতুন ক্যাটাগরি
        </button>
      </div>

      <div className="bg-[#1a1a1a] border border-white/5 rounded-3xl overflow-hidden">
        <table className="w-full text-left font-bengali">
          <thead>
            <tr className="bg-white/5 text-white/40 text-xs uppercase tracking-wider">
              <th className="px-6 py-4 font-bold">নাম</th>
              <th className="px-6 py-4 font-bold">খবরের সংখ্যা</th>
              <th className="px-6 py-4 font-bold">স্ট্যাটাস</th>
              <th className="px-6 py-4 font-bold text-right">অ্যাকশন</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {categories.map((cat) => (
              <tr key={cat.id} className="text-white hover:bg-white/[0.02] transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <MoveVertical size={16} className="text-white/20 cursor-move" />
                    <span className="font-bold flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }}></span>
                      {cat.name}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-white/50">{cat.count}টি খবর</td>
                <td className="px-6 py-4">
                   <span className="px-3 py-1 bg-green-500/10 text-green-500 text-xs font-bold rounded-full border border-green-500/10">Active</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-3 text-white/30">
                    <button className="hover:text-white transition-colors"><Edit2 size={16} /></button>
                    <button className="hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
