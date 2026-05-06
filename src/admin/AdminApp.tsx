import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { NewsList } from './pages/NewsList';
import { AddNews } from './pages/AddNews';
import { Categories } from './pages/Categories';
import { Settings } from './pages/Settings';
import { motion, AnimatePresence } from 'motion/react';

interface AdminAppProps {
  onBackToApp: () => void;
}

const AdminApp: React.FC<AdminAppProps> = ({ onBackToApp }) => {
  const [activePage, setActivePage] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard />;
      case 'news-list': return <NewsList />;
      case 'add-news': return <AddNews />;
      case 'categories': return <Categories />;
      case 'settings': return <Settings />;
      default: return <Dashboard />;
    }
  };

  const getPageTitle = () => {
    switch (activePage) {
      case 'dashboard': return 'ড্যাশবোর্ড';
      case 'news-list': return 'সব খবর';
      case 'add-news': return 'নতুন খবর যোগ';
      case 'categories': return 'ক্যাটাগরি ম্যানেজমেন্ট';
      case 'settings': return 'অ্যাপ সেটিংস';
      default: return 'এডমিন প্যানেল';
    }
  };

  return (
    <div className="flex h-screen bg-[#0f0f0f] text-white overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:block h-full">
        <Sidebar activePage={activePage} setActivePage={setActivePage} />
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 z-[100] md:hidden backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-64 z-[101] md:hidden shadow-2xl"
            >
              <Sidebar 
                activePage={activePage} 
                setActivePage={setActivePage} 
                onClose={() => setIsSidebarOpen(false)} 
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar 
          onMenuClick={() => setIsSidebarOpen(true)} 
          title={getPageTitle()} 
        />
        
        <main className="flex-1 overflow-y-auto bg-[#0a0a0a] p-4 md:p-8">
          <div className="max-w-6xl mx-auto pb-12">
            <button 
              onClick={onBackToApp}
              className="mb-6 text-white/40 hover:text-red-500 text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-colors"
            >
              ← Back to Live Site
            </button>
            {renderPage()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminApp;
