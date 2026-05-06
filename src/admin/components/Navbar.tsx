import React from 'react';
import { Search, Bell, User, Menu } from 'lucide-react';

interface NavbarProps {
  onMenuClick: () => void;
  title: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuClick, title }) => {
  return (
    <header className="h-16 bg-[#121212] border-b border-white/5 px-4 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="p-2 hover:bg-white/5 rounded-lg md:hidden text-white/70"
        >
          <Menu size={24} />
        </button>
        <h2 className="text-white font-bold text-lg md:text-xl font-bengali">{title}</h2>
      </div>

      <div className="hidden md:flex items-center bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 w-64 lg:w-96">
        <Search size={18} className="text-white/30" />
        <input 
          type="text" 
          placeholder="এখানে খুঁজুন..." 
          className="bg-transparent border-none focus:outline-none text-white text-sm px-3 w-full font-bengali"
        />
      </div>

      <div className="flex items-center gap-3">
        <button className="p-2 hover:bg-white/5 rounded-lg text-white/50 relative">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-600 rounded-full"></span>
        </button>
        <div className="flex items-center gap-3 pl-3 border-l border-white/5">
          <div className="text-right hidden sm:block">
            <p className="text-white text-sm font-bold leading-tight">এডমিন</p>
            <p className="text-white/40 text-[10px] uppercase tracking-wider">Super Admin</p>
          </div>
          <div className="w-9 h-9 bg-red-600/20 border border-red-600/30 rounded-full flex items-center justify-center text-red-500">
            <User size={20} />
          </div>
        </div>
      </div>
    </header>
  );
};
