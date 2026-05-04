import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

interface Message {
  id: string;
  role: 'user' | 'bot';
  text: string;
  isError?: boolean;
}

interface AIBotProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AIBot({ isOpen, onClose }: AIBotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'bot',
      text: 'হ্যালো! আমি নিউজ হাব এআই। দেশ-বিদেশের যেকোনো খবর বা তথ্য জানতে আমাকে প্রশ্ন করতে পারেন।'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize Gemini API
  // NOTE: apiKey will be read from process.env.GEMINI_API_KEY if configured in Vite properly
  // Since we are in Vite, if process.env is not available, we should use import.meta.env
  // Wait, the skill says:
  // "Const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  // Do NOT use: apiKey: (import.meta as any).env.VITE_GEMINI_API_KEY"
  
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: inputValue.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Build history for context
      const chatHistory = messages.map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.text}`).join('\n');
      const prompt = `Conversation history:\n${chatHistory}\n\nUser: ${userMessage.text}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: prompt,
        config: {
          systemInstruction: 'You are a helpful and highly knowledgeable news assistant for a Bangladeshi news portal called "News Hub". You can provide accurate news and information about national (Bangladesh) and international events. Answer in Bengali language unless asked otherwise. Be concise, objective, and provide accurate information. If you need to search for the latest news, use your built-in Google Search tool.',
          tools: [{ googleSearch: {} }],
        }
      });

      const text = response.text || "দুঃখিত, আমি এই মুহূর্তে উত্তর দিতে পারছি না।";

      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'bot',
          text
        }
      ]);
    } catch (error) {
      console.error('Error generating content:', error);
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'bot',
          text: 'দুঃখিত, কোনো একটি সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।',
          isError: true
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-32 right-4 sm:right-8 w-[90vw] sm:w-[400px] h-[500px] max-h-[80vh] bg-[#111] border border-gray-800 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-800 bg-[#1a1a1a] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-red-600/20 flex items-center justify-center text-red-500 relative">
                <Bot className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-[#1a1a1a] rounded-full"></span>
              </div>
              <div>
                <h3 className="font-bengali font-bold text-gray-100 flex items-center gap-1.5">
                  নিউজ হাব এআই <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
                </h3>
                <p className="text-xs text-gray-400 font-bengali">স্মার্ট নিউজ অ্যাসিস্ট্যান্ট</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0a0a0a] scrollbar-hide">
            {messages.map((message) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'bot' && (
                  <div className="w-6 h-6 rounded-full bg-red-600/20 flex items-center justify-center text-red-500 shrink-0 mt-1">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm font-bengali leading-relaxed ${
                    message.role === 'user'
                      ? 'bg-red-600 text-white rounded-tr-sm'
                      : message.isError
                      ? 'bg-red-950/50 border border-red-900/50 text-red-200 rounded-tl-sm'
                      : 'bg-[#1a1a1a] border border-gray-800 text-gray-200 rounded-tl-sm'
                  }`}
                >
                  {message.text}
                </div>
                {message.role === 'user' && (
                  <div className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 shrink-0 mt-1">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </motion.div>
            ))}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3 justify-start"
              >
                <div className="w-6 h-6 rounded-full bg-red-600/20 flex items-center justify-center text-red-500 shrink-0 mt-1">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-red-500 animate-spin" />
                  <span className="text-xs text-gray-400 font-bengali">খুঁজছে...</span>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-800 bg-[#1a1a1a] shrink-0">
            <div className="relative flex items-center">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="আপনার যা জানার আছে লিখুন..."
                className="w-full bg-[#0a0a0a] border border-gray-700 rounded-full pl-4 pr-12 py-3 text-sm text-gray-200 placeholder-gray-500 font-bengali focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="absolute right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 disabled:opacity-50 disabled:hover:bg-red-600 transition-colors flex items-center justify-center"
              >
                <Send className="w-4 h-4 ml-[-2px] mb-[-1px]" />
              </button>
            </div>
            <div className="text-center mt-2">
              <span className="text-[10px] text-gray-500 font-bengali">এআই মাঝে মাঝে ভুল তথ্য দিতে পারে।</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
