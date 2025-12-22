
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Search, ExternalLink, Sparkles, MessageSquare, Zap } from 'lucide-react';
import { getLogisticsInsight } from '../geminiService';
import { Message } from '../types';
import { useLanguage } from '../App';
import LiveAssistant from './LiveAssistant';

const AIAssistant: React.FC = () => {
  const { t, language } = useLanguage();
  const [mode, setMode] = useState<'chat' | 'live'>('chat');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: t('ai_header') + ". I'm ready to assist with your global logistics strategy.",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, mode]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const response = await getLogisticsInsight(input, language);
    setMessages(prev => [...prev, response]);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] max-w-5xl mx-auto p-4 md:p-8">
      {/* Mode Switcher */}
      <div className="flex gap-1 p-1 bg-slate-900 border border-slate-800 rounded-2xl mb-6 w-fit mx-auto shadow-xl">
        <button 
          onClick={() => setMode('chat')} 
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${mode === 'chat' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <MessageSquare size={18} />
          {t('nav_assistant')}
        </button>
        <button 
          onClick={() => setMode('live')} 
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${mode === 'live' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <Zap size={18} />
          Live Intelligence
        </button>
      </div>

      {mode === 'live' ? (
        <LiveAssistant />
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl flex flex-col h-full shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
          <div className="bg-slate-800/50 px-6 py-4 border-b border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                <Bot size={24} />
              </div>
              <div>
                <h2 className="font-bold text-white tracking-tight">{t('ai_header')}</h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  Gemini 3 Pro • {language.toUpperCase()}
                </p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2">
               <Sparkles size={16} className="text-blue-500" />
               <span className="text-xs text-slate-400">Optimization Active</span>
            </div>
          </div>

          <div ref={scrollRef} className="flex-grow overflow-y-auto p-8 space-y-6 scroll-smooth">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex max-w-[85%] gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center mt-1 shadow-md ${
                    msg.role === 'user' ? 'bg-slate-700' : 'bg-blue-600'
                  }`}>
                    {msg.role === 'user' ? <User size={20} className="text-slate-300" /> : <Bot size={20} className="text-white" />}
                  </div>
                  <div className="space-y-2">
                    <div className={`p-5 rounded-3xl text-sm leading-relaxed shadow-sm ${
                      msg.role === 'user' 
                        ? 'bg-blue-600 text-white rounded-tr-none' 
                        : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none'
                    }`}>
                      {msg.content}
                    </div>
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {msg.sources.map((s, i) => (
                          <a key={i} href={s.uri} target="_blank" className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 border border-slate-700 rounded-full text-[10px] text-slate-400 hover:text-white transition-all">
                            <Search size={10} />
                            {s.title}
                          </a>
                        ))}
                      </div>
                    )}
                    <span className="text-[10px] text-slate-500 px-1">{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
                  <Bot size={20} className="text-white" />
                </div>
                <div className="bg-slate-800 p-5 rounded-3xl rounded-tl-none border border-slate-700 flex items-center gap-3">
                  <Loader2 className="animate-spin text-blue-500" size={20} />
                  <span className="text-sm text-slate-400 italic">Processing spatial manifest...</span>
                </div>
              </div>
            )}
          </div>

          <div className="p-8 bg-slate-900 border-t border-slate-800">
            <div className="relative group">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                placeholder={t('ai_placeholder')}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-2xl py-5 pl-5 pr-16 focus:outline-none focus:ring-2 focus:ring-blue-600 h-20 resize-none transition-all"
              />
              <button onClick={handleSend} disabled={!input.trim() || isLoading} className="absolute right-4 top-4 bottom-4 w-12 bg-blue-600 rounded-xl flex items-center justify-center text-white hover:bg-blue-500 disabled:opacity-50 transition-all shadow-lg shadow-blue-600/20">
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAssistant;
