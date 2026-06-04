import React from 'react';
import { motion } from 'motion/react';
import { Mic, Video, Radio, Globe, Rss } from 'lucide-react';

export const LoadingScreen = ({ isDarkMode }: { isDarkMode: boolean }) => {
  return (
    <div className={`flex flex-col items-center justify-center py-20 md:py-32 w-full h-full min-h-[50vh] ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
      <div className="relative flex items-center justify-center mb-16">
        {/* Background spinning globe */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute z-0 opacity-5"
        >
          <Globe size={200} />
        </motion.div>
        
        {/* News broadcasting elements */}
        <div className="relative z-10 flex items-end justify-center gap-4 md:gap-8">
          {/* Camera Operator */}
          <motion.div
            animate={{ 
              y: [0, -5, 0],
              rotate: [-2, 2, -2]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center gap-1"
          >
            <div className="relative">
               <Video size={45} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
               {/* Camera Record Light */}
               <motion.div
                 animate={{ opacity: [1, 0, 1] }}
                 transition={{ duration: 1, repeat: Infinity }}
                 className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)]"
               ></motion.div>
            </div>
            <div className={`w-2 h-14 rounded-t-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
          </motion.div>

          {/* Reporter Microphone */}
          <motion.div
            animate={{ 
              y: [0, -10, 0],
              rotate: [0, 6, -6, 0]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="flex flex-col items-center z-20 pb-4"
          >
            <div className="relative">
              <Mic size={55} className={isDarkMode ? 'text-red-500' : 'text-red-600'} />
              {/* Glow behind mic */}
              <motion.div
                animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute inset-0 bg-red-500 rounded-full blur-md"
              ></motion.div>
            </div>
            <div className="w-2.5 h-20 bg-gradient-to-b from-gray-800 to-gray-500 mt-1 rounded-sm"></div>
            
            {/* Live Indicator box */}
            <motion.div 
               animate={{ opacity: [1, 0.7, 1], scale: [1, 1.05, 1] }}
               transition={{ duration: 1, repeat: Infinity }}
               className="mt-2 bg-red-600 border border-white/20 text-white text-[10px] sm:text-xs font-black px-3 py-1 rounded shadow-[0_0_15px_rgba(239,68,68,0.5)] tracking-widest uppercase"
            >
               LIVE
            </motion.div>
          </motion.div>

          {/* Antenna / Broadcast */}
          <motion.div
            animate={{ 
              scale: [1, 1.05, 1],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="flex flex-col items-center gap-1"
          >
            {/* Waves */}
            <div className="relative flex justify-center items-center h-12">
              <motion.div
                animate={{ opacity: [0, 1, 0], scale: [0.5, 1.3, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute"
              >
                <Rss size={35} className="text-blue-500" />
              </motion.div>
              <motion.div
                animate={{ opacity: [0, 0.5, 0], scale: [0.8, 1.6, 0.8] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                className="absolute"
              >
                <Rss size={45} className="text-blue-400/50" />
              </motion.div>
            </div>
            <Radio size={40} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
            <div className={`w-2 h-10 rounded-t-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
          </motion.div>

        </div>
      </div>

      <motion.div 
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="flex flex-col items-center gap-3 text-center"
      >
        <h3 className="text-2xl md:text-3xl font-black font-bengali tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-500">
          সংবাদ সংগ্রহ করা হচ্ছে...
        </h3>
        <p className={`text-sm md:text-base font-bengali max-w-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          আমাদের রিপোর্টাররা আপনার জন্য সর্বশেষ ও নির্ভুল খবর নিয়ে আসছেন
        </p>
      </motion.div>
    </div>
  );
};
