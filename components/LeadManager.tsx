
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Mail, Globe, Star, Trash2, Send, Loader2, Bot, 
  MapPin, Phone, Calendar, ExternalLink, Copy, Check, Info,
  ChevronLeft, Tag, Hash, Zap, TrendingUp, Users as UsersIcon, Briefcase, Linkedin, ShieldCheck, Cpu,
  Facebook, Twitter, Share2, BarChart3, BrainCircuit, Navigation, Link as LinkIcon, AlertTriangle, X, Search as SearchIcon,
  Layers, Database, MessageSquare, CheckCircle2, Sparkles, TrendingDown, Landmark, Users, Clock, Filter, LayoutGrid, List, ChevronDown, 
  DollarSign, HardDrive, Rocket, Twitter as TwitterIcon, Plus, FileText, ClipboardList
} from 'lucide-react';
import { useLanguage, useLeads } from '../App';
import { Lead, AuditEntry, EnrichedData } from '../types';
import { generateOutreach, calculateLeadScore } from '../geminiService';
import { enrichLeadWithClay } from '../clayService';

type DataTab = 'company' | 'contact' | 'signals';

// Status Configuration for consistent styling
const STATUS_CONFIG: Record<Lead['status'], { label: string; icon: any; color: string; bg: string; border: string; glow: string }> = {
  'New': { 
    label: 'New Lead', 
    icon: Sparkles, 
    color: 'text-cyan-400', 
    bg: 'bg-cyan-500/10', 
    border: 'border-cyan-500/20', 
    glow: 'shadow-[0_0_15px_rgba(34,211,238,0.15)]' 
  },
  'Contacted': { 
    label: 'Contacted', 
    icon: Send, 
    color: 'text-indigo-400', 
    bg: 'bg-indigo-500/10', 
    border: 'border-indigo-500/20', 
    glow: 'shadow-[0_0_15px_rgba(99,102,241,0.15)]' 
  },
  'Replied': { 
    label: 'Replied', 
    icon: MessageSquare, 
    color: 'text-emerald-400', 
    bg: 'bg-emerald-500/10', 
    border: 'border-emerald-500/20', 
    glow: 'shadow-[0_0_15px_rgba(16,185,129,0.15)]' 
  },
  'Closed': { 
    label: 'Closed', 
    icon: CheckCircle2, 
    color: 'text-slate-400', 
    bg: 'bg-slate-800/50', 
    border: 'border-slate-700/50', 
    glow: '' 
  }
};

const StatusBadge: React.FC<{ status: Lead['status']; compact?: boolean }> = ({ status, compact }) => {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;
  
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${config.bg} ${config.border} ${config.color} ${config.glow} transition-all duration-300`}>
      <Icon size={compact ? 10 : 12} />
      <span className={`${compact ? 'text-[8px]' : 'text-[10px]'} font-black uppercase tracking-widest`}>{config.label}</span>
    </div>
  );
};

const StatusSelector: React.FC<{ currentStatus: Lead['status']; onChange: (s: Lead['status']) => void }> = ({ currentStatus, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeConfig = STATUS_CONFIG[currentStatus];
  const ActiveIcon = activeConfig.icon;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full md:w-64 px-6 py-4 rounded-[1.5rem] bg-slate-950 border transition-all duration-300 group ${activeConfig.border} ${activeConfig.glow} hover:bg-slate-900`}
      >
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-xl ${activeConfig.bg} border ${activeConfig.border} flex items-center justify-center ${activeConfig.color} group-hover:scale-110 transition-transform`}>
            <ActiveIcon size={18} />
          </div>
          <div className="text-left">
            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest leading-none mb-1">State Controller</p>
            <p className={`text-xs font-black uppercase tracking-wider ${activeConfig.color}`}>{activeConfig.label}</p>
          </div>
        </div>
        <ChevronDown size={16} className={`text-slate-600 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-3 p-2 bg-slate-900 border border-slate-800 rounded-[2rem] shadow-2xl z-50 animate-in slide-in-from-top-2 duration-300 backdrop-blur-xl">
          {(Object.keys(STATUS_CONFIG) as Lead['status'][]).map((status) => {
            const config = STATUS_CONFIG[status];
            const Icon = config.icon;
            const isSelected = status === currentStatus;
            
            return (
              <button
                key={status}
                onClick={() => {
                  onChange(status);
                  setIsOpen(false);
                }}
                className={`flex items-center gap-4 w-full p-4 rounded-[1.25rem] transition-all group ${isSelected ? 'bg-slate-800' : 'hover:bg-slate-800/50'}`}
              >
                <div className={`w-10 h-10 rounded-xl ${config.bg} border ${config.border} flex items-center justify-center ${config.color} group-hover:scale-110 transition-transform`}>
                  <Icon size={18} />
                </div>
                <div className="text-left">
                   <p className={`text-xs font-black uppercase tracking-wider ${isSelected ? config.color : 'text-slate-400'}`}>{config.label}</p>
                   <p className="text-[9px] font-bold text-slate-600 uppercase tracking-tighter">Transition To Phase</p>
                </div>
                {isSelected && <Check size={14} className="ml-auto text-emerald-500" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

const TimelineEntry: React.FC<{ entry: AuditEntry; isLatest: boolean }> = ({ entry, isLatest }) => {
  const Icon = entry.type === 'success' ? CheckCircle2 : entry.type === 'alert' ? AlertTriangle : entry.event.startsWith('[NOTE]') ? FileText : Info;
  const colorClass = entry.type === 'success' ? 'text-emerald-400' : entry.type === 'alert' ? 'text-red-400' : entry.event.startsWith('[NOTE]') ? 'text-amber-400' : 'text-cyan-400';
  const dotColorClass = entry.type === 'success' ? 'bg-emerald-500' : entry.type === 'alert' ? 'bg-red-500' : entry.event.startsWith('[NOTE]') ? 'bg-amber-500' : 'bg-cyan-500';
  const borderClass = entry.type === 'success' ? 'border-emerald-500/20' : entry.type === 'alert' ? 'border-red-500/20' : entry.event.startsWith('[NOTE]') ? 'border-amber-500/20' : 'border-cyan-500/20';
  
  const date = new Date(entry.timestamp);
  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateStr = date.toLocaleDateString([], { month: 'short', day: 'numeric' });

  const displayEvent = entry.event.startsWith('[NOTE] ') ? entry.event.replace('[NOTE] ', '') : entry.event;

  return (
    <div className="relative pl-10 pb-8 group last:pb-2">
      <div className="absolute left-[15px] top-[26px] bottom-0 w-px bg-slate-800 group-last:hidden" />
      
      <div className={`absolute left-0 top-0 w-8 h-8 rounded-xl border-2 border-slate-900 ${dotColorClass} bg-slate-950 flex items-center justify-center z-10 shadow-lg transition-transform duration-300 group-hover:scale-110`}>
        <Icon size={14} className="text-white" />
        {isLatest && <div className={`absolute inset-0 rounded-xl ${dotColorClass} animate-ping opacity-20`} />}
      </div>

      <div className={`p-4 rounded-2xl bg-slate-900/40 border ${borderClass} hover:bg-slate-800/60 transition-all duration-300`}>
        <div className="flex justify-between items-start gap-4 mb-2">
          <h4 className={`text-[11px] font-black uppercase tracking-wider ${colorClass} ${entry.event.startsWith('[NOTE]') ? 'normal-case tracking-normal font-bold' : ''}`}>
            {displayEvent}
          </h4>
          <div className="flex flex-col items-end shrink-0">
            <span className="text-[10px] text-white font-black">{timeStr}</span>
            <span className="text-[8px] text-slate-600 font-bold uppercase">{dateStr}</span>
          </div>
        </div>
        {isLatest && !entry.event.startsWith('[NOTE]') && (
          <div className="mt-2 flex items-center gap-1.5">
            <div className="w-1 h-1 bg-cyan-500 rounded-full animate-pulse" />
            <span className="text-[8px] font-black text-cyan-500 uppercase tracking-widest">Active State</span>
          </div>
        )}
      </div>
    </div>
  );
};

const LeadManager: React.FC = () => {
  const { language } = useLanguage();
  const { leads, updateLead, deleteLead } = useLeads();
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'kanban'>('grid');
  const [filterQuery, setFilterQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnriching, setIsEnriching] = useState(false);
  const [aiScript, setAiScript] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [activeDataTab, setActiveDataTab] = useState<DataTab>('company');
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');

  const selectedLead = useMemo(() => leads.find(l => l.id === selectedLeadId), [leads, selectedLeadId]);

  const filteredLeads = useMemo(() => {
    return leads
      .filter(l => l.name.toLowerCase().includes(filterQuery.toLowerCase()) || l.category.toLowerCase().includes(filterQuery.toLowerCase()))
      .sort((a, b) => (b.enrichedData?.qualScore || 0) - (a.enrichedData?.qualScore || 0));
  }, [leads, filterQuery]);

  const handleEnrich = async (lead: Lead) => {
    setIsEnriching(true);
    try {
      const enriched = await enrichLeadWithClay(lead.name, lead.website);
      updateLead(lead.id, { 
        enrichedData: enriched,
        auditLog: [{ event: 'Intelligence Data Harvested', timestamp: new Date().toISOString(), type: 'success' }, ...lead.auditLog || []]
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsEnriching(false);
    }
  };

  const handleGenerateScript = async (lead: Lead) => {
    setIsGenerating(true);
    setAiScript('');
    try {
      const script = await generateOutreach(`${lead.name} (${lead.enrichedData?.industry || lead.category})`, "Digital Enterprise Strategy", language);
      setAiScript(script);
      updateLead(lead.id, { auditLog: [{ event: 'Outreach Protocol Compiled', timestamp: new Date().toISOString(), type: 'info' }, ...lead.auditLog || []] });
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddNote = () => {
    if (!newNoteContent.trim() || !selectedLead) return;
    const newEntry: AuditEntry = {
      event: `[NOTE] ${newNoteContent.trim()}`,
      timestamp: new Date().toISOString(),
      type: 'info'
    };
    updateLead(selectedLead.id, {
      auditLog: [newEntry, ...(selectedLead.auditLog || [])]
    });
    setNewNoteContent('');
    setIsNoteModalOpen(false);
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10 selection:bg-cyan-500/30">
      
      {/* Note Modal */}
      {isNoteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl" onClick={() => setIsNoteModalOpen(false)} />
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-950/40">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shadow-lg shadow-amber-500/10">
                  <FileText size={22} />
                </div>
                <div>
                  <h3 className="text-white font-black text-sm uppercase tracking-widest">Manual Intel Entry</h3>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">Append findings to Mission Log</p>
                </div>
              </div>
              <button onClick={() => setIsNoteModalOpen(false)} className="p-3 text-slate-500 hover:text-white transition-colors bg-slate-800 rounded-xl">
                <X size={20} />
              </button>
            </div>
            <div className="p-8">
              <div className="relative">
                <textarea
                  autoFocus
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  placeholder="Type notes here..."
                  className="w-full h-48 bg-slate-950/50 border border-slate-800 rounded-3xl p-6 text-sm text-slate-200 focus:outline-none focus:border-amber-500/40 transition-all resize-none font-medium leading-relaxed"
                />
                <div className="absolute bottom-4 right-6 text-[9px] font-black text-slate-700 uppercase tracking-widest">Protocol Input v1.0</div>
              </div>
            </div>
            <div className="p-8 bg-slate-950/40 border-t border-slate-800 flex justify-end gap-4">
               <button onClick={() => setIsNoteModalOpen(false)} className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors">Discard</button>
               <button 
                onClick={handleAddNote}
                disabled={!newNoteContent.trim()}
                className="px-10 py-4 bg-amber-600 text-white rounded-[1.25rem] text-[10px] font-black uppercase tracking-widest hover:bg-amber-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-xl shadow-amber-600/20 flex items-center gap-3"
               >
                 <Plus size={16} /> Commit Entry
               </button>
            </div>
          </div>
        </div>
      )}

      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-3 py-1 bg-indigo-600/10 border border-indigo-500/20 rounded-xl w-fit">
            <Layers size={14} className="text-indigo-400" />
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Pipeline Controller</span>
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter leading-none">Active Inventory</h1>
        </div>

        <div className="flex flex-wrap items-center gap-4">
           <div className="relative group">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
              <input 
                type="text" 
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder="Filter nodes..."
                className="bg-slate-900 border border-slate-800 rounded-2xl py-3 pl-12 pr-6 text-xs font-black text-slate-400 w-64 focus:border-cyan-500/40 focus:outline-none transition-all"
              />
           </div>
           <div className="flex bg-slate-900 border border-slate-800 rounded-2xl p-1">
              <button onClick={() => setViewMode('grid')} className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/20' : 'text-slate-500 hover:text-white'}`}>
                <List size={20} />
              </button>
              <button onClick={() => setViewMode('kanban')} className={`p-2.5 rounded-xl transition-all ${viewMode === 'kanban' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/20' : 'text-slate-500 hover:text-white'}`}>
                <LayoutGrid size={20} />
              </button>
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className={`${selectedLead ? 'lg:col-span-4' : 'lg:col-span-12'} transition-all duration-700`}>
          {viewMode === 'grid' ? (
            <div className="bg-slate-900 border border-slate-800 rounded-[3rem] overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-800/30 text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">
                    <tr>
                      <th className="px-8 py-6">Identity</th>
                      <th className="px-8 py-6">Qual</th>
                      {!selectedLead && <th className="px-8 py-6">Status</th>}
                      <th className="px-8 py-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    {filteredLeads.map(lead => (
                      <tr 
                        key={lead.id} 
                        onClick={() => { setSelectedLeadId(lead.id); setAiScript(''); }}
                        className={`group cursor-pointer hover:bg-slate-800/30 transition-all ${selectedLeadId === lead.id ? 'bg-cyan-500/10' : ''}`}
                      >
                        <td className="px-8 py-6">
                           <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black border-2 transition-all ${selectedLeadId === lead.id ? 'bg-cyan-600 text-white border-cyan-400' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>
                                {lead.name[0]}
                              </div>
                              <div className="overflow-hidden">
                                <p className="text-sm font-black text-white truncate">{lead.name}</p>
                                <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest mt-0.5">{lead.category}</p>
                              </div>
                           </div>
                        </td>
                        <td className="px-8 py-6">
                           <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-[10px] font-black border-2 ${
                             (lead.enrichedData?.qualScore || 0) > 80 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-500'
                           }`}>
                             {lead.enrichedData?.qualScore || '--'}
                           </div>
                        </td>
                        {!selectedLead && (
                           <td className="px-8 py-6">
                             <StatusBadge status={lead.status} compact />
                           </td>
                        )}
                        <td className="px-8 py-6 text-right">
                          <button onClick={(e) => { e.stopPropagation(); deleteLead(lead.id); if(selectedLeadId === lead.id) setSelectedLeadId(null); }} className="p-3 text-slate-800 hover:text-red-500 transition-colors">
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {(Object.keys(STATUS_CONFIG) as Lead['status'][]).map(stage => (
                <div key={stage} className="bg-slate-900/40 border border-slate-800 rounded-[2.5rem] p-6 space-y-6">
                   <div className="flex justify-between items-center px-2">
                      <h3 className={`text-xs font-black uppercase tracking-widest ${STATUS_CONFIG[stage].color}`}>{stage}</h3>
                      <span className="text-[10px] font-black text-slate-500 bg-slate-800 px-2 py-0.5 rounded-lg">{leads.filter(l => l.status === stage).length}</span>
                   </div>
                   <div className="space-y-4">
                     {leads.filter(l => l.status === stage).map(lead => (
                       <div key={lead.id} onClick={() => setSelectedLeadId(lead.id)} className={`p-5 bg-slate-900 border border-slate-800 rounded-3xl hover:border-cyan-500/50 cursor-pointer transition-all ${selectedLeadId === lead.id ? 'border-cyan-500/50 shadow-lg' : ''}`}>
                          <p className="text-xs font-black text-white truncate">{lead.name}</p>
                          <div className="flex justify-between items-center mt-3">
                             <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{lead.category}</span>
                             <div className="w-6 h-6 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-[8px] font-black text-cyan-400">
                                {lead.enrichedData?.qualScore || '--'}
                             </div>
                          </div>
                       </div>
                     ))}
                   </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedLead && (
          <div className="lg:col-span-8 animate-in slide-in-from-right-8 duration-700">
            <div className="bg-slate-900 border border-slate-800 rounded-[3.5rem] overflow-hidden shadow-2xl flex flex-col h-full border-t-cyan-500/40 border-t-4">
              <div className="bg-slate-800/20 p-10 border-b border-slate-800/50 flex flex-col md:flex-row justify-between gap-10">
                <div className="space-y-6 flex-grow">
                   <div className="flex items-center gap-3">
                      <span className="px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 rounded-full">
                        {selectedLead.enrichedData?.industry || selectedLead.category}
                      </span>
                      <button onClick={() => setSelectedLeadId(null)} className="md:hidden ml-auto p-2 bg-slate-800 rounded-xl text-slate-500"><X size={20}/></button>
                   </div>
                   <h2 className="text-5xl font-black text-white tracking-tighter italic">{selectedLead.name}</h2>
                   <div className="flex items-center gap-4">
                      <a href={selectedLead.website} target="_blank" className="flex items-center gap-2 text-xs font-black text-slate-500 hover:text-cyan-400 transition-colors uppercase tracking-widest">
                         <Globe size={14} className="text-cyan-500" /> Web Matrix
                      </a>
                      <div className="h-4 w-px bg-slate-800" />
                      <p className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <MapPin size={14} /> {selectedLead.enrichedData?.location || 'Uncharted Sector'}
                      </p>
                   </div>
                </div>

                <div className={`flex flex-col items-center p-8 rounded-[2.5rem] border-2 transition-all ${
                    selectedLead.enrichedData?.qualSegment === 'Very Good' ? 'bg-emerald-500/5 border-emerald-500 text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.15)]' : 'bg-slate-800 border-slate-700 text-slate-600'
                  }`}>
                    <ShieldCheck size={40} className="mb-4" />
                    <span className="text-2xl font-black text-white leading-none">{selectedLead.enrichedData?.qualScore || '--'}%</span>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] mt-3">{selectedLead.enrichedData?.qualSegment || 'Awaiting Sync'}</span>
                </div>
              </div>

              <div className="p-10 space-y-12 overflow-y-auto max-h-[600px] scroll-smooth custom-scrollbar">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Operational Lifecycle</p>
                    <StatusSelector 
                      currentStatus={selectedLead.status} 
                      onChange={(s) => updateLead(selectedLead.id, { 
                        status: s,
                        auditLog: [{ event: `Pipeline Re-Vector: ${s}`, timestamp: new Date().toISOString(), type: 'info' }, ...selectedLead.auditLog || []]
                      })} 
                    />
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {(Object.keys(STATUS_CONFIG) as Lead['status'][]).map(s => (
                      <div key={s} className={`w-3 h-1 rounded-full ${selectedLead.status === s ? 'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]' : 'bg-slate-800'}`} />
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                   {/* Tabbed Enriched Data Section */}
                   <div className="space-y-6">
                      <div className="flex bg-slate-950/50 p-1 rounded-2xl border border-slate-800 overflow-hidden">
                        {[
                          { id: 'company', label: 'Info', icon: Briefcase },
                          { id: 'contact', label: 'Matrix', icon: Globe },
                          { id: 'signals', label: 'Signals', icon: Zap }
                        ].map((tab) => (
                          <button
                            key={tab.id}
                            onClick={() => setActiveDataTab(tab.id as DataTab)}
                            className={`flex-grow flex items-center justify-center gap-2 py-3 px-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                              activeDataTab === tab.id 
                                ? 'bg-slate-800 text-cyan-400 shadow-xl' 
                                : 'text-slate-600 hover:text-slate-300'
                            }`}
                          >
                            <tab.icon size={12} />
                            {tab.label}
                          </button>
                        ))}
                      </div>

                      <div className="min-h-[200px] animate-in fade-in duration-500">
                        {activeDataTab === 'company' && (
                          <div className="grid grid-cols-2 gap-4">
                            {[
                              { label: 'Revenue', val: selectedLead.enrichedData?.revenue || 'Unknown', icon: DollarSign, color: 'text-emerald-500' },
                              { label: 'Employees', val: selectedLead.enrichedData?.employees?.toString() || 'Unknown', icon: Users, color: 'text-cyan-500' },
                              { label: 'Funding', val: selectedLead.enrichedData?.lastFunded || 'Stable', icon: Rocket, color: 'text-amber-500' },
                              { label: 'Infrastructure', val: 'Legacy System', icon: HardDrive, color: 'text-indigo-500' }
                            ].map((item, idx) => (
                              <div key={idx} className="bg-slate-900/40 p-4 border border-slate-800 rounded-2xl group hover:border-slate-700 transition-all">
                                <div className="flex items-center gap-2 mb-2">
                                  <item.icon size={12} className={item.color} />
                                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{item.label}</span>
                                </div>
                                <p className="text-xs font-black text-white truncate">{item.val}</p>
                              </div>
                            ))}
                            <div className="col-span-2 space-y-3 pt-2">
                              <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em]">Technology Stack</span>
                              <div className="flex flex-wrap gap-2">
                                {selectedLead.enrichedData?.techStack?.map(t => (
                                  <span key={t} className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-lg text-[10px] font-bold text-slate-400">{t}</span>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {activeDataTab === 'contact' && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 gap-3">
                              {[
                                { label: 'Corporate Web', val: selectedLead.website, icon: Globe, color: 'text-cyan-400' },
                                { label: 'LinkedIn Entity', val: selectedLead.enrichedData?.linkedin, icon: Linkedin, color: 'text-blue-500' },
                                { label: 'Facebook Meta', val: selectedLead.enrichedData?.facebook, icon: Facebook, color: 'text-blue-600' },
                                { label: 'X Pulse', val: selectedLead.enrichedData?.twitter, icon: TwitterIcon, color: 'text-slate-200' }
                              ].map((link, idx) => (
                                link.val ? (
                                  <a key={idx} href={link.val} target="_blank" className="flex items-center justify-between p-4 bg-slate-900/40 border border-slate-800 rounded-2xl group hover:border-cyan-500/30 transition-all">
                                    <div className="flex items-center gap-3">
                                      <div className={`p-2 bg-slate-950 rounded-xl ${link.color}`}>
                                        <link.icon size={14} />
                                      </div>
                                      <span className="text-[10px] font-black text-white uppercase tracking-widest">{link.label}</span>
                                    </div>
                                    <ExternalLink size={14} className="text-slate-600 group-hover:text-cyan-400 transition-colors" />
                                  </a>
                                ) : null
                              ))}
                            </div>
                          </div>
                        )}

                        {activeDataTab === 'signals' && (
                          <div className="space-y-4">
                            <h3 className="text-xs font-black text-slate-600 uppercase tracking-[0.5em] flex items-center gap-3">
                              <Zap size={18} className="text-amber-500" /> Behavioral Triggers
                            </h3>
                            <div className="flex flex-col gap-3">
                              {selectedLead.enrichedData?.buyingSignals?.length > 0 ? selectedLead.enrichedData.buyingSignals.map(s => (
                                <div key={s} className="px-5 py-4 bg-slate-900/60 border border-slate-800 rounded-2xl flex items-center gap-4 group hover:border-amber-500/30 transition-all border-l-4 border-l-amber-500/40">
                                    <div className="w-8 h-8 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500">
                                      <Sparkles size={14} />
                                    </div>
                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{s}</span>
                                </div>
                              )) : (
                                  <div className="p-10 text-center bg-slate-950/20 rounded-3xl border border-dashed border-slate-800">
                                    <p className="text-[10px] text-slate-700 uppercase font-black italic tracking-widest">Awaiting market signal synchronization...</p>
                                  </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                   </div>

                   <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <h3 className="text-xs font-black text-slate-600 uppercase tracking-[0.5em] flex items-center gap-3">
                           <Clock size={18} className="text-indigo-400" /> Mission Log
                        </h3>
                      </div>
                      
                      <div className="flex flex-col gap-6">
                        <div className="flex flex-col max-h-[320px] overflow-y-auto pr-4 custom-scrollbar">
                          {selectedLead.auditLog?.length > 0 ? (
                            selectedLead.auditLog.map((entry, idx) => (
                              <TimelineEntry 
                                key={idx} 
                                entry={entry} 
                                isLatest={idx === 0} 
                              />
                            ))
                          ) : (
                            <div className="p-10 text-center bg-slate-950/20 rounded-3xl border border-dashed border-slate-800">
                               <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.3em]">No Log Data Recorded</p>
                            </div>
                          )}
                        </div>

                        {/* Prominent Action Button */}
                        <button 
                          onClick={() => setIsNoteModalOpen(true)}
                          className="w-full flex items-center justify-center gap-3 py-5 rounded-[1.5rem] bg-slate-900 border border-slate-800 group hover:border-amber-500/40 transition-all shadow-2xl overflow-hidden relative"
                        >
                          <div className="absolute inset-0 animate-shine pointer-events-none" />
                          <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                             <Plus size={16} />
                          </div>
                          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-amber-500 transition-colors">Initialize Protocol Entry</span>
                        </button>
                      </div>
                   </div>
                </div>

                <div className="pt-10 border-t border-slate-800/50 space-y-8">
                   <div className="flex justify-between items-center">
                      <h3 className="text-xs font-black text-slate-600 uppercase tracking-[0.5em] flex items-center gap-3">
                        <Bot size={22} className="text-indigo-400" /> Neural Outreach synthesis
                      </h3>
                      {aiScript && (
                         <button onClick={() => { navigator.clipboard.writeText(aiScript); setCopiedField('script'); setTimeout(() => setCopiedField(null), 2000); }} className="text-[10px] font-black uppercase text-indigo-400 hover:text-white transition-colors">
                            {copiedField === 'script' ? 'Copied' : 'Copy Strategy'}
                         </button>
                      )}
                   </div>

                   {isGenerating ? (
                     <div className="bg-slate-950 p-16 rounded-[3rem] border border-slate-800 flex flex-col items-center justify-center gap-6">
                       <Loader2 className="animate-spin text-indigo-500" size={40} />
                       <p className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] animate-pulse">Encoding Market Context...</p>
                     </div>
                   ) : aiScript ? (
                     <div className="bg-slate-950 p-10 rounded-[3rem] border border-slate-800 relative shadow-2xl overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 blur-3xl rounded-full" />
                        <div className="text-sm text-slate-300 font-mono leading-relaxed whitespace-pre-wrap">{aiScript}</div>
                     </div>
                   ) : (
                     <div className="p-16 text-center bg-slate-800/10 rounded-[3rem] border-2 border-dashed border-slate-800 group hover:border-indigo-500/30 transition-all">
                        {selectedLead.enrichedData?.isEnriched ? (
                           <button onClick={() => handleGenerateScript(selectedLead)} className="px-10 py-5 bg-white text-slate-950 font-black text-sm uppercase tracking-widest rounded-[1.5rem] hover:bg-cyan-500 hover:text-white transition-all shadow-2xl flex items-center gap-4 mx-auto">
                              <Bot size={20} /> Synthesize Outreach Strategy
                           </button>
                        ) : (
                           <button onClick={() => handleEnrich(selectedLead)} disabled={isEnriching} className="px-10 py-5 bg-indigo-600 text-white font-black text-sm uppercase tracking-widest rounded-[1.5rem] hover:bg-indigo-500 transition-all flex items-center gap-4 mx-auto shadow-2xl shadow-indigo-600/20">
                              {isEnriching ? <Loader2 className="animate-spin" size={20} /> : <Database size={20} />}
                              Initialize Corporate Enrichment
                           </button>
                        )}
                     </div>
                   )}
                </div>
              </div>

              <div className="p-10 bg-slate-800/30 border-t border-slate-800 flex gap-6 mt-auto">
                <button className="flex-grow bg-white text-slate-950 py-6 rounded-[1.5rem] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-4 hover:bg-cyan-500 hover:text-white transition-all shadow-2xl group active:scale-95">
                  <Mail size={22} className="group-hover:translate-x-1 transition-transform" />
                  Initiate Outreach Procedure
                </button>
                <div className="flex gap-3">
                   <a href={selectedLead.enrichedData?.linkedin} target="_blank" className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center text-slate-500 hover:text-blue-400 hover:border-blue-400/30 transition-all active:scale-95">
                      <Linkedin size={24} />
                   </a>
                   <button onClick={() => { deleteLead(selectedLead.id); setSelectedLeadId(null); }} className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center text-slate-700 hover:text-red-500 hover:border-red-500/30 transition-all active:scale-95">
                      <Trash2 size={24} />
                   </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadManager;
