import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { GoogleGenAI, Type, FunctionDeclaration } from '@google/genai';

let aiInstance: any = null;
const getAiInstance = () => {
  if (!aiInstance) {
    if (typeof process !== 'undefined' && process.env && process.env.GEMINI_API_KEY) {
       aiInstance = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    } else {
       // Fallback or warning if key is missing
       aiInstance = new GoogleGenAI({ apiKey: "mock" });
    }
  }
  return aiInstance;
};

const fetchNewsDecl: FunctionDeclaration = {
  name: "search_real_news",
  description: "Search and fetch real news articles including their real image URLs from NewsData.io API.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      query: { type: Type.STRING, description: "Search keyword or topic" },
      language: { type: Type.STRING, description: "Language of the news: 'en' for English, 'bn' for Bengali" }
    },
    required: ["query", "language"]
  }
};

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
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const ai = getAiInstance();
      if (!ai || ai.apiKey === "mock") {
         throw new Error("GEMINI_API_KEY is missing or invalid");
      }

      const systemInstruction = `You are a strict news processor for BOTH English and Bengali news.

Strict Rules / কঠোর নিয়ম:
- NEVER generate fake news. ALWAYS use the 'search_real_news' tool first.
- NEVER generate fake images.
- Provide real photos using the 'image_url' returned by the tool.

Final response MUST be exactly this JSON format:
{
  "title": "News Title / নিউজ টাইটেল",
  "summary": "Short summary / সংক্ষিপ্ত সারাংশ",
  "content": "Detailed content / বিস্তারিত কনটেন্ট",
  "source": "Source Name / সোর্স নাম",
  "date": "Date / তারিখ",
  "image_url": "The real image_url from the API tool result"
}`;

      let contents: any[] = [{ role: 'user', parts: [{ text: userMessage }] }];

      let response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: contents,
        config: {
          systemInstruction,
          tools: [{ functionDeclarations: [fetchNewsDecl] }],
        }
      });

      if (response.functionCalls && response.functionCalls.length > 0) {
        const call = response.functionCalls[0];
        if (call.name === "search_real_news") {
           const query = call.args?.query || '';
           const language = call.args?.language || 'bn';
           const API_KEY = 'pub_bc5de72ec8cb424e9ceecc4bec439f87';
           
           contents.push({ role: 'model', parts: [{ functionCall: call }] });
           
           try {
             let url = `https://newsdata.io/api/1/news?apikey=${API_KEY}&q=${encodeURIComponent(query)}&language=${language}`;
             const apiRes = await fetch(url);
             const apiData = await apiRes.json();
             
             contents.push({
               role: 'user', 
               parts: [{ 
                 functionResponse: {
                   name: call.name, 
                   response: { results: apiData.results || [] } 
                 } 
               }]
             });

             response = await ai.models.generateContent({
               model: 'gemini-3.1-flash-lite',
               contents: contents,
               config: {
                 systemInstruction,
                 responseMimeType: "application/json"
               }
             });
           } catch(apiErr) {
             console.error("API Fetch Error:", apiErr);
           }
        }
      }

      if (response.text) {
        setMessages(prev => [...prev, { role: 'model', text: response.text, isJson: true }]);
      }
    } catch (error: any) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: 'দুঃখিত, কোনো একটি সমস্যা হয়েছে। আবার চেষ্টা করুন।' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderJsonNews = (jsonText: string) => {
    try {
      let data = JSON.parse(jsonText);
      if (data.news && Array.isArray(data.news)) data = data.news;
      const items = Array.isArray(data) ? data : [data];

      if (items.length > 0 && items[0].title && items[0].summary) {
        return (
          <div className="flex flex-col gap-4 mt-2">
            {items.map((item: any, idx: number) => (
              <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-4">
                {item.image_url && item.image_url !== 'null' && item.image_url.trim() !== '' && (
                  <img 
                    src={item.image_url} 
                    alt={item.title} 
                    className="w-full h-40 object-cover rounded-lg mb-4" 
                    referrerPolicy="no-referrer"
                  />
                )}
                <h4 className="text-white font-bold mb-2">{item.title}</h4>
                <p className="text-gray-300 text-sm mb-3 font-bengali leading-relaxed">{item.summary}</p>
                {item.content && <p className="text-gray-400 text-xs mb-3 font-bengali leading-relaxed">{item.content}</p>}
                <div className="text-xs text-gray-500 uppercase tracking-wider flex justify-between">
                  <span>{item.source || 'News'}</span>
                </div>
              </div>
            ))}
          </div>
        );
      }
    } catch(e) {
      // fallback
    }
    return <pre className="bg-black/50 p-4 rounded-xl overflow-x-auto text-xs text-green-400 font-mono mt-2">{jsonText}</pre>;
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
                {msg.isJson ? (
                  <>
                    <p className="text-sm opacity-80 mb-2">সংবাদ সংগ্রহ করা হয়েছে:</p>
                    {renderJsonNews(msg.text)}
                  </>
                ) : (
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
