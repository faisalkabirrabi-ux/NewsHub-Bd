import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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
    const currentMessages = [...messages, { role: 'user', text: userMessage }];
    
    setInput('');
    setMessages(currentMessages);
    setIsLoading(true);

    try {
      const systemInstruction = `You are a strict news processor for BOTH English and Bengali news.

Strict Rules / কঠোর নিয়ম:
- NEVER generate fake news. ALWAYS use searching for real news if needed.
- Provide real photos where possible.
- If you can't find specific news, inform the user clearly.

Final response should be helpful and in Bengali unless asked in English.
If providing a news summary, use this format:
{
  "title": "News Title",
  "summary": "Short summary",
  "content": "Detailed content",
  "source": "Source Name",
  "image_url": "Image URL if available"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: currentMessages.map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }]
        })),
        config: {
          systemInstruction,
          tools: [{
            functionDeclarations: [{
              name: "search_real_news",
              description: "Search and fetch real news articles including their real image URLs from NewsData.io API.",
              parameters: {
                type: Type.OBJECT,
                properties: {
                  query: { type: Type.STRING, description: "Search keyword or topic" },
                  language: { type: Type.STRING, description: "Language of the news: 'bn' for Bengali, 'en' for English" }
                },
                required: ["query"]
              }
            }]
          }]
        }
      });

      let text = response.text || "দুঃখিত, আমি উত্তর খুঁজে পাইনি।";
      
      // Handle tool calls if any
      const calls = response.functionCalls;
      if (calls && calls.length > 0 && calls[0].name === "search_real_news") {
        const args = calls[0].args as { query: string, language?: string };
        const NEWS_API_KEY = import.meta.env.VITE_NEWSDATA_API_KEY || 'pub_bc5de72ec8cb424e9ceecc4bec439f87';
        const url = `https://newsdata.io/api/1/news?apikey=${NEWS_API_KEY}&q=${encodeURIComponent(args.query)}&language=${args.language || 'bn'}`;
        
        const toolRes = await fetch(url);
        const toolData = await toolRes.json();
        const toolResults = { results: toolData.results || [] };

        const secondResponse = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: [
            ...currentMessages.map(m => ({
                role: m.role === 'user' ? 'user' : 'model',
                parts: [{ text: m.text }]
            })),
            { role: 'model', parts: [{ functionCall: { name: calls[0].name, args: calls[0].args, id: calls[0].id } }] },
            { role: 'user', parts: [{ functionResponse: { name: calls[0].name, response: toolResults, id: calls[0].id } }] }
          ],
          config: { systemInstruction }
        });
        text = secondResponse.text || "সংবাদ পাওয়া যায়নি।";
      }

      // Check if it's JSON-like
      const isJson = text.trim().startsWith('{') && text.trim().endsWith('}');
      
      setMessages(prev => [...prev, { role: 'model', text, isJson }]);
    } catch (error: any) {
      console.error("Gemini Error:", error);
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
