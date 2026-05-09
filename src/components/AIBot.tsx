import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Send, Bot, User, Loader2 } from 'lucide-react';

interface Message {
  role: 'user' | 'model';
  text: string;
  isJson?: boolean;
}

export function AIBot() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'স্বাগতম! আমি আপনার নিউজ এআই বট। আপনি কোন ধরনের খবর জানতে চান?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    const currentMessages = [...messages, { role: 'user' as const, text: userMessage }];
    
    setInput('');
    setMessages(currentMessages);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: currentMessages }),
      });

      if (!response.ok) {
        throw new Error('AI Server responded with an error');
      }

      const data = await response.json();
      const text = data.text || "দুঃখিত, আমি উত্তর খুঁজে পাইনি।";
      
      // Look for JSON block in the response text
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const isJson = !!jsonMatch;
      const finalText = jsonMatch ? jsonMatch[0] : text;
      
      setMessages(prev => [...prev, { role: 'model', text: finalText, isJson }]);
    } catch (error: any) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: 'দুঃখিত, সংযোগ বিচ্ছিন্ন হয়েছে। দয়া করে আবার চেষ্টা করুন।' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderJsonNews = (jsonText: string) => {
    try {
      const data = JSON.parse(jsonText);
      return (
        <div className="flex flex-col gap-4 mt-2">
           <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            {data.image_url && data.image_url !== 'null' && (
              <img 
                src={data.image_url} 
                alt={data.title} 
                className="w-full h-40 object-cover rounded-lg mb-4" 
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
            )}
            <h4 className="text-white font-bold mb-2">{data.title}</h4>
            <p className="text-gray-300 text-sm mb-3 font-bengali leading-relaxed">{data.summary}</p>
            <div className="text-xs text-gray-500 uppercase flex justify-between">
              <span>{data.source || 'News'}</span>
            </div>
          </div>
        </div>
      );
    } catch(e) {
      return <p className="font-bengali text-sm md:text-base leading-relaxed">{jsonText}</p>;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col h-[70vh] bg-[#0a0a0a] rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative">
      <div className="p-6 bg-red-600 border-b border-white/10 flex items-center gap-4">
        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
          <Bot className="w-7 h-7 text-red-600" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-white font-bengali">এআই সংবাদ সহকারী</h2>
          <p className="text-white/80 text-sm font-bengali mt-1">পড়ুন, খুঁজুন এবং জানুন</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10">
        {messages.map((msg, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            key={i} 
            className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-red-600' : 'bg-white/10'}`}>
                {msg.role === 'user' ? <User size={16} className="text-white" /> : <Bot size={16} className="text-white" />}
              </div>
              <div className={`p-4 rounded-2xl flex flex-col ${msg.role === 'user' ? 'bg-red-600/20 text-white rounded-tr-sm border border-red-500/20' : 'bg-white/5 text-gray-200 rounded-tl-sm border border-white/10'}`}>
                {msg.isJson ? renderJsonNews(msg.text) : (
                  <p className="font-bengali text-sm md:text-base leading-relaxed">{msg.text}</p>
                )}
              </div>
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex w-full justify-start">
             <div className="flex gap-3">
               <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-white/10">
                  <Bot size={16} className="text-white" />
               </div>
               <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center">
                 <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
               </div>
             </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-[#141414] border-t border-white/10">
        <div className="flex items-center gap-3 bg-white/5 rounded-2xl p-2 border border-white/10">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="সংবাদ অনুসন্ধান করুন..."
            className="flex-1 bg-transparent border-none text-white focus:outline-none px-4 font-bengali placeholder-gray-500"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="bg-red-600 p-3 rounded-xl hover:bg-red-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};
