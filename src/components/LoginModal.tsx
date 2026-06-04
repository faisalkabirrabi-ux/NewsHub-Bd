import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User, ArrowRight, Github } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  onGoogleLogin?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, isDarkMode, onGoogleLogin }) => {
  const [isLogin, setIsLogin] = useState(true);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className={`relative w-full max-w-md overflow-hidden rounded-3xl shadow-2xl ${
              isDarkMode ? 'bg-[#1a1a1a] text-white' : 'bg-white text-gray-900'
            }`}
          >
            {/* Close Button */}
            <button 
              onClick={onClose}
              className={`absolute top-4 right-4 p-2 rounded-full z-10 transition-colors ${
                isDarkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <X className="w-5 h-5" />
            </button>

            {/* Decorative Top Background */}
            <div className="relative h-32 bg-gradient-to-br from-red-500 to-orange-500 overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
              <motion.div 
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 90, 0]
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute -top-10 -right-10 w-40 h-40 bg-white/20 rounded-full blur-2xl"
              />
              <motion.div 
                animate={{ 
                  scale: [1, 1.5, 1],
                  rotate: [0, -90, 0]
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute -bottom-10 -left-10 w-32 h-32 bg-orange-500/40 rounded-full blur-xl"
              />
            </div>

            {/* Content Container */}
            <div className="px-8 pt-8 pb-10">
              <div className="mb-8">
                <h2 className="text-3xl font-black mb-2 flex items-center gap-2">
                  {isLogin ? 'স্বাগতম' : 'অ্যাকাউন্ট তৈরি করুন'}
                  <motion.span
                    animate={{ rotate: [0, 20, 0, 20, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                    className="inline-block origin-bottom-right"
                  >
                    👋
                  </motion.span>
                </h2>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {isLogin 
                    ? 'আপনার পছন্দের খবর পড়তে লগইন করুন' 
                    : 'নতুন অ্যাকাউন্ট তৈরি করে আমাদের সাথে যুক্ত হোন'}
                </p>
              </div>

              {/* Form container with AnimatePresence for smooth swap */}
              <div className="relative">
                <AnimatePresence mode="wait">
                  <motion.form
                    key={isLogin ? 'login' : 'register'}
                    initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col gap-4"
                    onSubmit={(e) => { e.preventDefault(); onClose(); }}
                  >
                    {!isLogin && (
                      <div className="space-y-1">
                        <label className={`text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>সম্পূর্ণ নাম</label>
                        <div className="relative group">
                          <User className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${isDarkMode ? 'text-gray-500 group-focus-within:text-red-400' : 'text-gray-400 group-focus-within:text-red-500'}`} />
                          <input 
                            type="text"
                            placeholder="আপনার নাম"
                            className={`w-full pl-10 pr-4 py-3 rounded-xl outline-none transition-all ${
                              isDarkMode 
                                ? 'bg-[#2a2a2a] focus:bg-[#333] border border-transparent focus:border-red-500/50' 
                                : 'bg-gray-100 focus:bg-white border border-transparent focus:border-red-500/30 focus:ring-4 focus:ring-red-500/10'
                            }`}
                          />
                        </div>
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className={`text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>ইমেইল ঠিকানা</label>
                      <div className="relative group">
                        <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${isDarkMode ? 'text-gray-500 group-focus-within:text-red-400' : 'text-gray-400 group-focus-within:text-red-500'}`} />
                        <input 
                          type="email"
                          placeholder="আপনার ইমেইল"
                          className={`w-full pl-10 pr-4 py-3 rounded-xl outline-none transition-all ${
                            isDarkMode 
                              ? 'bg-[#2a2a2a] focus:bg-[#333] border border-transparent focus:border-red-500/50' 
                              : 'bg-gray-100 focus:bg-white border border-transparent focus:border-red-500/30 focus:ring-4 focus:ring-red-500/10'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className={`text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>পাসওয়ার্ড</label>
                      <div className="relative group">
                        <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${isDarkMode ? 'text-gray-500 group-focus-within:text-red-400' : 'text-gray-400 group-focus-within:text-red-500'}`} />
                        <input 
                          type="password"
                          placeholder="••••••••"
                          className={`w-full pl-10 pr-4 py-3 rounded-xl outline-none transition-all ${
                            isDarkMode 
                              ? 'bg-[#2a2a2a] focus:bg-[#333] border border-transparent focus:border-red-500/50' 
                              : 'bg-gray-100 focus:bg-white border border-transparent focus:border-red-500/30 focus:ring-4 focus:ring-red-500/10'
                          }`}
                        />
                      </div>
                    </div>

                    {isLogin && (
                      <div className="flex justify-end">
                        <a href="#" className={`text-xs font-medium hover:underline ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>পাসওয়ার্ড ভুলে গেছেন?</a>
                      </div>
                    )}

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full mt-4 bg-gradient-to-r from-red-600 to-orange-500 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-red-500/30 font-bengali"
                    >
                      {isLogin ? 'লগইন করুন' : 'অ্যাকাউন্ট তৈরি করুন'}
                      <ArrowRight className="w-5 h-5" />
                    </motion.button>
                  </motion.form>
                </AnimatePresence>
              </div>

              <div className="mt-8">
                <div className="relative flex items-center mb-6">
                  <div className={`flex-grow border-t ${isDarkMode ? 'border-white/10' : 'border-gray-200'}`}></div>
                  <span className={`flex-shrink-0 mx-4 text-xs font-medium uppercase font-bengali ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>অথবা এর মাধ্যমে চালিয়ে যান</span>
                  <div className={`flex-grow border-t ${isDarkMode ? 'border-white/10' : 'border-gray-200'}`}></div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <motion.button 
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={onGoogleLogin}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium transition-colors ${
                      isDarkMode ? 'bg-[#2a2a2a] hover:bg-[#333] text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                    }`}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Google
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium transition-colors ${
                      isDarkMode ? 'bg-[#2a2a2a] hover:bg-[#333] text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                    }`}
                  >
                    <Github className="w-5 h-5" />
                    GitHub
                  </motion.button>
                </div>
              </div>

              <div className="mt-8 text-center">
                <p className={`text-sm font-bengali ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {isLogin ? "অ্যাকাউন্ট নেই?" : "ইতিমধ্যেই অ্যাকাউন্ট আছে?"}
                  <button 
                    onClick={() => setIsLogin(!isLogin)}
                    className={`ml-1.5 font-semibold hover:underline ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}
                  >
                    {isLogin ? 'সাইন আপ' : 'লগইন'}
                  </button>
                </p>
              </div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
