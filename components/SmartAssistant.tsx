
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Product } from '../types';
import { getSmartAdvice, searchLiveDeals } from '../services/geminiService';
import Button from './Button';

interface SmartAssistantProps {
  currentProducts: Product[];
}

const SmartAssistant: React.FC<SmartAssistantProps> = ({ currentProducts }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: "Hi! I'm **TagTracer AI**. Type any product above to compare live, or ask me to analyze these specific deals for you." }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      let responseContent = '';
      let sources: Array<{ title: string; uri: string }> = [];

      const queryLower = input.toLowerCase();
      if (queryLower.includes('better') || queryLower.includes('more') || queryLower.includes('other')) {
        const result = await searchLiveDeals(input);
        responseContent = result.text;
        sources = result.sources;
      } else {
        responseContent = await getSmartAdvice(input, currentProducts);
      }

      setMessages(prev => [...prev, { role: 'assistant', content: responseContent, sources }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Connection timeout. Please ensure your API key is correctly configured." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[550px] glass-card rounded-3xl overflow-hidden border border-slate-700/50">
      <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <i className="fa-solid fa-wand-magic-spark text-sm text-white"></i>
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider">Assistant</h3>
            <p className="text-[10px] text-blue-400 font-bold animate-pulse">Lumina Core v2.5</p>
          </div>
        </div>
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          <div className="w-2 h-2 rounded-full bg-slate-700"></div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[90%] p-4 rounded-2xl text-sm leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none shadow-xl shadow-blue-500/10' 
                : 'bg-slate-800/50 text-slate-300 rounded-tl-none border border-slate-700'
            }`}>
              <div className="prose prose-invert prose-xs max-w-none text-xs">
                {msg.content}
              </div>
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-700/50">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Sources:</p>
                  <div className="flex flex-wrap gap-2">
                    {msg.sources.map((s, idx) => (
                      <a 
                        key={idx} 
                        href={s.uri} 
                        target="_blank" 
                        rel="noopener" 
                        className="text-[10px] px-2 py-1 bg-slate-900 rounded-lg hover:bg-blue-600 transition-colors border border-slate-700 truncate max-w-[120px]"
                      >
                        {s.title}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-800/50 p-4 rounded-2xl rounded-tl-none border border-slate-700">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-slate-900/50 border-t border-slate-800">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="relative search-glow rounded-xl transition-all"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Lumina about these products..."
            className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-4 pl-5 pr-12 text-xs focus:outline-none placeholder-slate-600 text-slate-200"
          />
          <button 
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center text-blue-500 hover:text-white transition-all disabled:opacity-30"
            disabled={!input.trim() || isLoading}
          >
            <i className="fa-solid fa-paper-plane"></i>
          </button>
        </form>
      </div>
    </div>
  );
};

export default SmartAssistant;
