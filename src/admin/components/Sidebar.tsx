import React from 'react';
import { 
  LayoutDashboard, 
  Newspaper, 
  PlusCircle, 
  Settings, 
  Layers, 
  LogOut,
  X 
} from 'lucide-react';
import { motion } from 'motion/react';

interface SidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage, onClose }) => {
  const menuItems = [
    { id: 'dashboard', label: 'ড্যাশবোর্ড', icon: LayoutDashboard },
    { id: 'news-list', label: 'সব খবর', icon: Newspaper },
    { id: 'add-news', label: 'খবর যোগ করুন', icon: PlusCircle },
    { id: 'categories', label: 'ক্যাটাগরি', icon: Layers },
    { id: 'settings', label: 'সেটিংস', icon: Settings },
  ];

  return (
    <div className="h-full flex flex-col bg-[#1a1a1a] text-white w-64 border-r border-white/5">
      <div className="p-6 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center font-bold">A</div>
          <span className="font-bold text-xl tracking-tight">Admin<span className="text-red-600">Hub</span></span>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg md:hidden">
            <X size={20} />
          </button>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-2 mt-4">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setActivePage(item.id);
              if (onClose) onClose();
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bengali ${
              activePage === item.id 
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' 
                : 'text-white/60 hover:bg-white/5 hover:text-white'
            }`}
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-white/5">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/50 hover:bg-red-600/10 hover:text-red-500 transition-all font-bengali">
          <LogOut size={20} />
          <span>লগ আউট</span>
        </button>
      </div>
    </div>
  );
};
