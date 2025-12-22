
import React, { useState } from 'react';
import { Search, MapPin, Loader2, Sparkles, Plus, ExternalLink, Info, Check, BrainCircuit } from 'lucide-react';
import { useLanguage, useLeads } from '../App';
import { searchLocalLeads } from '../geminiService';
import ReactMarkdown from 'react-markdown';
import { Lead } from '../types';

const LeadFinder: React.FC = () => {
  const { t } = useLanguage();
  const { addLead, leads } = useLeads();
  const [niche, setNiche] = useState('');
  const [location, setLocation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<{ text: string, sources: any[] } | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!niche || !location) return;
    setIsLoading(true);
    try {
      const data = await searchLocalLeads(niche, location);
      setResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveLead = (source: any) => {
    const maps = source.maps;
    if (!maps) return;

    const id = maps.uri || Math.random().toString(36).substr(2, 9);
    
    // Fix: Added missing required property 'auditLog' to satisfy the Lead interface.
    const newLead: Lead = {
      id: id,
      name: maps.title || "Local Business",
      address: maps.address || location || "Regional Entity", 
      website: maps.uri,
      mapsUrl: maps.uri,
      status: 'New',
      category: niche || 'Local Business',
      savedAt: new Date().toISOString(),
      rating: undefined,
      reviews: undefined,
      auditLog: [],
    };

    addLead(newLead);
    setSavedIds(prev => new Set(prev).add(id));
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Sparkles className="text-cyan-400" />
          {t('finder_title')}
        </h1>
        <p className="text-slate-400 mt-2">{t('finder_subtitle')}</p>
      </header>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              type="text"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              placeholder={t('search_placeholder')}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-2xl py-4 l-12 pr-4 focus:outline-none focus:ring-2 focus:ring-cyan-600 transition-all"
            />
          </div>
          <div className="flex-grow relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder={t('location_placeholder')}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-cyan-600 transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="bg-cyan-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-cyan-500 disabled:opacity-50 transition-all shadow-lg shadow-cyan-600/20 flex items-center justify-center gap-2 min-w-[180px]"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
            {t('btn_search')}
          </button>
        </form>
      </div>

      {results && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-slate-200 prose prose-invert max-w-none shadow-xl border-t-2 border-t-cyan-500/20">
               <div className="flex items-center gap-3 mb-6">
                 <BrainCircuit className="text-cyan-500" size={24} />
                 <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">AI Narrative Analysis</span>
               </div>
               <ReactMarkdown>{results.text}</ReactMarkdown>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl h-fit">
              <h3 className="text-white font-bold mb-6 flex items-center gap-2">
                <Info size={18} className="text-cyan-400" />
                Verified Entities
              </h3>
              <div className="space-y-4">
                {results.sources.map((source: any, i: number) => {
                  const id = source.maps?.uri || i.toString();
                  const isSaved = savedIds.has(id) || leads.some(l => l.id === id);

                  return (
                    <div key={i} className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700 hover:border-cyan-500 transition-colors group">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[9px] font-black text-cyan-500 uppercase tracking-widest bg-cyan-500/10 px-2 py-0.5 rounded-lg border border-cyan-500/10">Google Intelligence</span>
                        <a href={source.maps?.uri} target="_blank" className="text-slate-500 hover:text-white transition-colors">
                          <ExternalLink size={14} />
                        </a>
                      </div>
                      <p className="text-sm text-white font-bold group-hover:text-cyan-400 transition-colors">{source.maps?.title || "Local Business"}</p>
                      {source.maps?.uri && (
                        <p className="text-[10px] text-slate-500 truncate mt-1 italic font-medium opacity-60">{source.maps.uri}</p>
                      )}
                      <button 
                        onClick={() => handleSaveLead(source)}
                        disabled={isSaved}
                        className={`mt-4 w-full flex items-center justify-center gap-2 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${
                          isSaved 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-slate-700 hover:bg-cyan-600 text-white border border-slate-600'
                        }`}
                      >
                        {isSaved ? <Check size={14} /> : <Plus size={14} />}
                        {isSaved ? 'In Pipeline' : 'Harvest Lead'}
                      </button>
                    </div>
                  );
                })}
                {results.sources.length === 0 && (
                  <div className="text-center py-10 opacity-40">
                    <p className="text-xs font-bold uppercase tracking-widest">No distinct entities mapped</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadFinder;
