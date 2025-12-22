
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Mail, Globe, Trash2, Send, Loader2, Bot, 
  MapPin, ExternalLink, Copy, Check, Info,
  Zap, Briefcase, ShieldCheck, Cpu,
  Facebook, Twitter, Linkedin, Sparkles, 
  Users, Clock, LayoutGrid, List, ChevronDown, 
  DollarSign, HardDrive, Rocket, Plus, FileText,
  Activity, MessageSquare, CheckCircle2, AlertTriangle, ChevronRight,
  Search, Link as LinkIcon, Landmark, TrendingUp, BarChart3, Fingerprint,
  Link2, Radio
} from 'lucide-react';
import { useLanguage, useLeads } from '../App';
import { Lead, AuditEntry } from '../types';
import { generateOutreach } from '../geminiService';
import { enrichLeadWithClay } from '../clayService';

type DataTab = 'company' | 'contact' | 'signals';

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

      <div className={`p-4 rounded-2xl bg-slate-950/40 border ${borderClass} hover:bg-slate-800/60 transition-all duration-300`}>
        <div className="flex justify-between items-start gap-4 mb-2">
          <h4 className={`text-[11px] font-black uppercase tracking-wider ${colorClass} ${entry.event.startsWith('[NOTE]') ? 'normal-case tracking-normal font-bold' : ''}`}>
            {displayEvent}
          </h4>
          <div className="flex flex-col items-end shrink-0">
            <span className="text-[10px] text-white font-black">{timeStr}</span>
            <span className="text-[8px] text-slate-600 font-bold uppercase">{dateStr}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const LeadManager: React.FC = () => {
  const { leads, updateLead, deleteLead } = useLeads();
  const { language } = useLanguage();
  const [selectedId, setSelectedId] = useState<string | null>(leads[0]?.id || null);
  const [isEnriching, setIsEnriching] = useState(false);
  const [outreachStrategy, setOutreachStrategy] = useState<string | null>(null);
  const [isGeneratingOutreach, setIsGeneratingOutreach] = useState(false);
  const [activeDataTab, setActiveDataTab] = useState<DataTab>('company');

  const selectedLead = useMemo(() => leads.find(l => l.id === selectedId), [leads, selectedId]);

  const handleStatusChange = (status: Lead['status']) => {
    if (!selectedLead) return;
    const newEntry: AuditEntry = {
      event: `Phase Shift: ${status}`,
      timestamp: new Date().toISOString(),
      type: 'info'
    };
    updateLead(selectedLead.id, { 
      status, 
      auditLog: [newEntry, ...(selectedLead.auditLog || [])] 
    });
  };

  const handleEnrich = async () => {
    if (!selectedLead || isEnriching) return;
    setIsEnriching(true);
    try {
      const data = await enrichLeadWithClay(selectedLead.name, selectedLead.website);
      const newEntry: AuditEntry = {
        event: "Neural Data Enrichment Successful",
        timestamp: new Date().toISOString(),
        type: 'success'
      };
      updateLead(selectedLead.id, { 
        enrichedData: data, 
        auditLog: [newEntry, ...(selectedLead.auditLog || [])] 
    });
    } catch (err) {
      console.error(err);
    } finally {
      setIsEnriching(false);
    }
  };

  const handleGenerateOutreach = async () => {
    if (!selectedLead) return;
    setIsGeneratingOutreach(true);
    try {
      const strategy = await generateOutreach(
        `${selectedLead.name} (${selectedLead.category}) in ${selectedLead.address}`,
        "Premium Growth & Digital Transformation Services",
        language
      );
      setOutreachStrategy(strategy);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingOutreach(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 md:p-10 max-w-7xl mx-auto h-[calc(100vh-12rem)] overflow-hidden">
      {/* Sidebar: Lead List */}
      <div className="lg:col-span-4 flex flex-col bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-slate-800 bg-slate-950/50">
           <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-white tracking-tighter uppercase">Neural Pipeline</h2>
              <div className="p-2 bg-slate-800 rounded-lg text-slate-500">
                <LayoutGrid size={16} />
              </div>
           </div>
           <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
              <input 
                type="text" 
                placeholder="Search Active Nodes..." 
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 pl-10 pr-4 text-[10px] font-black uppercase tracking-widest text-slate-400 focus:outline-none focus:border-cyan-500/50"
              />
           </div>
        </div>
        
        <div className="flex-grow overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {leads.map(lead => (
            <button
              key={lead.id}
              onClick={() => setSelectedId(lead.id)}
              className={`w-full p-5 rounded-[2rem] border transition-all text-left relative group ${
                selectedId === lead.id 
                ? 'bg-cyan-500/10 border-cyan-500/30 shadow-xl' 
                : 'bg-transparent border-transparent hover:bg-slate-800/50'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <StatusBadge status={lead.status} compact />
                {lead.enrichedData?.qualScore && (
                  <span className="text-[9px] font-black text-white bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-700">FIT: {lead.enrichedData.qualScore}%</span>
                )}
              </div>
              <h3 className={`text-sm font-black truncate ${selectedId === lead.id ? 'text-white' : 'text-slate-300'}`}>{lead.name}</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-widest">{lead.category}</p>
            </button>
          ))}
          {leads.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center p-10 space-y-4">
               <div className="w-16 h-16 bg-slate-800 rounded-3xl flex items-center justify-center text-slate-600">
                  <Plus size={32} />
               </div>
               <p className="text-xs font-black text-slate-600 uppercase tracking-widest">No nodes detected in pipeline</p>
            </div>
          )}
        </div>
      </div>

      {/* Main View: Lead Detail */}
      <div className="lg:col-span-8 flex flex-col bg-slate-950/50 border border-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
        {selectedLead ? (
          <>
            {/* Lead Header */}
            <div className="p-8 md:p-10 border-b border-slate-900 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900/20 backdrop-blur-md">
               <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter">{selectedLead.name}</h1>
                    {selectedLead.enrichedData?.qualScore && (
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                         <Activity size={12} className="text-emerald-500 animate-pulse" />
                         <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">High Probability</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-6 text-[11px] font-black uppercase tracking-widest text-slate-500">
                    <span className="flex items-center gap-2"><MapPin size={14} className="text-cyan-500" /> {selectedLead.address}</span>
                    <span className="flex items-center gap-2"><Briefcase size={14} className="text-indigo-500" /> {selectedLead.category}</span>
                  </div>
               </div>
               <StatusSelector currentStatus={selectedLead.status} onChange={handleStatusChange} />
            </div>

            {/* Content Tabs Area */}
            <div className="flex-grow overflow-y-auto p-8 md:p-10 space-y-10 custom-scrollbar">
              
              {/* Core Actions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <button 
                  onClick={handleEnrich}
                  disabled={isEnriching || selectedLead.enrichedData?.isEnriched}
                  className={`p-8 rounded-[2rem] border transition-all flex flex-col items-start gap-4 text-left group overflow-hidden relative ${
                    selectedLead.enrichedData?.isEnriched 
                    ? 'bg-emerald-500/5 border-emerald-500/20' 
                    : 'bg-slate-900 border-slate-800 hover:border-cyan-500/50'
                  }`}
                 >
                    <div className={`p-4 rounded-2xl ${selectedLead.enrichedData?.isEnriched ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400 group-hover:text-cyan-400 group-hover:scale-110 transition-all'}`}>
                      {isEnriching ? <Loader2 className="animate-spin" size={24} /> : <Cpu size={24} />}
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white uppercase tracking-wider">Neural Enrichment</h4>
                      <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-tighter">
                        {selectedLead.enrichedData?.isEnriched ? 'Advanced Intelligence Synced' : 'Sync with Clay & MadKudu APIs'}
                      </p>
                    </div>
                    <div className="absolute -bottom-4 -right-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Zap size={120} />
                    </div>
                 </button>

                 <button 
                  onClick={handleGenerateOutreach}
                  className="p-8 bg-indigo-600 rounded-[2rem] border border-indigo-500 transition-all flex flex-col items-start gap-4 text-left group hover:bg-indigo-500 shadow-xl shadow-indigo-600/20"
                 >
                    <div className="p-4 bg-white/10 rounded-2xl text-white group-hover:scale-110 transition-transform">
                      {isGeneratingOutreach ? <Loader2 className="animate-spin" size={24} /> : <Rocket size={24} />}
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white uppercase tracking-wider">Outreach Synth</h4>
                      <p className="text-[10px] text-indigo-200 font-bold uppercase mt-1 tracking-tighter">Generate Personalized Gemini Strategy</p>
                    </div>
                 </button>
              </div>

              {/* Core Metrics Summary Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                 <div className="bg-slate-900/40 border border-slate-800 rounded-[2rem] p-6 flex items-center gap-5 group hover:border-cyan-500/30 transition-all shadow-lg">
                    <div className="w-14 h-14 bg-cyan-500/10 rounded-2xl flex items-center justify-center text-cyan-400 shadow-inner group-hover:scale-110 transition-transform">
                       <DollarSign size={24} />
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Est. Revenue</p>
                       <p className="text-xl font-black text-white tracking-tighter">{selectedLead.enrichedData?.revenue || 'Analyzing...'}</p>
                    </div>
                 </div>

                 <div className="bg-slate-900/40 border border-slate-800 rounded-[2rem] p-6 flex items-center gap-5 group hover:border-indigo-500/30 transition-all shadow-lg">
                    <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 shadow-inner group-hover:scale-110 transition-transform">
                       <Users size={24} />
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Workforce</p>
                       <p className="text-xl font-black text-white tracking-tighter">{selectedLead.enrichedData?.employees || '---'} Members</p>
                    </div>
                 </div>

                 <div className="hidden lg:flex bg-slate-900/40 border border-slate-800 rounded-[2rem] p-6 items-center gap-5 group hover:border-emerald-500/30 transition-all shadow-lg">
                    <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 shadow-inner group-hover:scale-110 transition-transform">
                       <BarChart3 size={24} />
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Lead Fitment</p>
                       <p className="text-xl font-black text-white tracking-tighter">{selectedLead.enrichedData?.qualSegment || 'Baseline'}</p>
                    </div>
                 </div>
              </div>

              {/* Tabbed Intelligence Section */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                 <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-3">
                        <ShieldCheck className="text-cyan-500" size={16} /> Intelligence Manifest
                        </h3>
                    </div>

                    <div className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] flex flex-col min-h-[460px] shadow-2xl relative overflow-hidden">
                        {/* High-Fidelity Tab Switcher */}
                        <div className="flex p-2 bg-slate-950/80 border-b border-slate-800 rounded-t-[2.5rem] gap-1 z-10">
                            {(['company', 'contact', 'signals'] as DataTab[]).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveDataTab(tab)}
                                    className={`flex-1 py-4 px-2 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-500 flex flex-col items-center justify-center gap-2 relative group overflow-hidden ${
                                        activeDataTab === tab 
                                        ? 'bg-slate-800 text-cyan-400 shadow-xl border border-slate-700/50' 
                                        : 'text-slate-600 hover:text-slate-400'
                                    }`}
                                >
                                    {tab === 'company' && <Briefcase size={16} />}
                                    {tab === 'contact' && <Fingerprint size={16} />}
                                    {tab === 'signals' && <Radio size={16} />}
                                    
                                    <span className="z-10">{tab === 'company' ? 'Company Info' : tab === 'contact' ? 'Contact Details' : 'Signals'}</span>
                                    
                                    {activeDataTab === tab && (
                                      <div className="absolute bottom-0 w-12 h-1 bg-cyan-500 rounded-t-full shadow-[0_-2px_15px_rgba(6,182,212,0.9)]" />
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content Display */}
                        <div className="p-8 flex-grow animate-in fade-in slide-in-from-bottom-2 duration-500">
                            {activeDataTab === 'company' && (
                                <div className="space-y-8">
                                    <div className="grid grid-cols-2 gap-4">
                                        {[
                                          { label: 'Fiscal Stream', val: selectedLead.enrichedData?.revenue || '---', icon: Landmark, color: 'text-cyan-500' },
                                          { label: 'Asset Capacity', val: `${selectedLead.enrichedData?.employees || '---'} Members`, icon: Users, color: 'text-indigo-500' },
                                          { label: 'Industry Class', val: selectedLead.enrichedData?.industry || '---', icon: Briefcase, color: 'text-emerald-500' },
                                          { label: 'Growth Phase', val: selectedLead.enrichedData?.lastFunded || '---', icon: Rocket, color: 'text-amber-500' }
                                        ].map((item, idx) => (
                                          <div key={idx} className="p-5 bg-slate-950/40 border border-slate-800/60 rounded-3xl group hover:bg-slate-900/40 transition-all border-l-2 border-l-transparent hover:border-l-cyan-500/50">
                                            <div className="flex items-center gap-2 mb-2 opacity-50">
                                                <item.icon size={12} className={item.color} />
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
                                            </div>
                                            <p className="text-xs font-black text-white tracking-tight truncate">{item.val}</p>
                                          </div>
                                        ))}
                                    </div>
                                    <div className="pt-6 border-t border-slate-800/60">
                                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em] mb-4 flex items-center gap-2">
                                            <Cpu size={14} className="text-cyan-500" /> Operational Stack
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedLead.enrichedData?.techStack?.map((tech, i) => (
                                                <span key={i} className="px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-cyan-400 hover:border-cyan-500/30 transition-all">
                                                    {tech}
                                                </span>
                                            )) || <span className="text-[10px] text-slate-700 italic">No telemetry detected.</span>}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeDataTab === 'contact' && (
                                <div className="space-y-4">
                                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em] mb-6 flex items-center gap-2">
                                        <Link2 size={14} className="text-indigo-500" /> Connectivity Profiles
                                    </p>
                                    {[
                                        { label: 'Corporate Portal', val: selectedLead.website, icon: Globe, color: 'text-cyan-400' },
                                        { label: 'LinkedIn Entity', val: selectedLead.enrichedData?.linkedin, icon: Linkedin, color: 'text-blue-500' },
                                        { label: 'Meta Identity', val: selectedLead.enrichedData?.facebook, icon: Facebook, color: 'text-indigo-600' },
                                        { label: 'X Pulse Stream', val: selectedLead.enrichedData?.twitter, icon: Twitter, color: 'text-slate-300' },
                                    ].map((link, idx) => link.val ? (
                                        <a 
                                            key={idx} 
                                            href={link.val} 
                                            target="_blank" 
                                            className="flex items-center justify-between p-5 bg-slate-950/50 border border-slate-800/60 rounded-[1.75rem] group hover:border-indigo-500/30 hover:bg-slate-900/50 transition-all shadow-xl"
                                        >
                                            <div className="flex items-center gap-4 overflow-hidden">
                                                <div className={`p-3 bg-slate-900 rounded-2xl ${link.color} shadow-inner`}>
                                                    <link.icon size={18} />
                                                </div>
                                                <div className="overflow-hidden">
                                                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-0.5">{link.label}</span>
                                                  <span className="text-xs font-mono text-slate-300 truncate block">{link.val.replace('https://', '')}</span>
                                                </div>
                                            </div>
                                            <div className="p-2 bg-slate-800 rounded-xl opacity-0 group-hover:opacity-100 transition-all">
                                              <ExternalLink size={14} className="text-indigo-400" />
                                            </div>
                                        </a>
                                    ) : null)}
                                    {!(selectedLead.website || selectedLead.enrichedData?.linkedin) && (
                                        <div className="h-full flex flex-col items-center justify-center py-20 opacity-20">
                                            <LinkIcon size={48} className="mb-4 text-slate-600" />
                                            <p className="text-[10px] font-black uppercase tracking-widest">Connectivity Offline</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeDataTab === 'signals' && (
                                <div className="space-y-4">
                                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em] mb-6 flex items-center gap-2">
                                        <Radio size={14} className="text-amber-500" /> Real-time Buying Pulse
                                    </p>
                                    {selectedLead.enrichedData?.buyingSignals?.map((signal, i) => (
                                        <div key={i} className="p-6 bg-amber-500/5 border border-amber-500/10 rounded-3xl flex items-center gap-5 group hover:bg-amber-500/10 transition-all border-l-4 border-l-amber-500/40 shadow-inner">
                                            <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500 group-hover:scale-110 transition-transform shadow-lg shadow-amber-500/5">
                                                <TrendingUp size={18} />
                                            </div>
                                            <div className="flex-grow">
                                                <p className="text-sm font-black text-amber-400 uppercase tracking-widest italic">{signal}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">Verified Intent</p>
                                                </div>
                                            </div>
                                            <ChevronRight size={16} className="text-amber-900/50" />
                                        </div>
                                    )) || (
                                        <div className="h-full flex flex-col items-center justify-center py-20 opacity-20">
                                            <Activity size={48} className="mb-4 text-slate-600" />
                                            <p className="text-[10px] font-black uppercase tracking-widest">Telemetry Standby</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                 </div>

                 {/* Operational Stream */}
                 <div className="space-y-6">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-3">
                      <Clock className="text-indigo-500" size={16} /> Operational Lifecycle
                    </h3>
                    <div className="bg-slate-950 border border-slate-900 rounded-[2.5rem] p-8 h-full max-h-[460px] overflow-y-auto custom-scrollbar shadow-inner">
                       {selectedLead.auditLog?.map((entry, idx) => (
                         <TimelineEntry key={idx} entry={entry} isLatest={idx === 0} />
                       ))}
                       {(!selectedLead.auditLog || selectedLead.auditLog.length === 0) && (
                           <div className="flex flex-col items-center justify-center py-20 opacity-20">
                               <MessageSquare size={32} className="mb-4 text-slate-600" />
                               <p className="text-[10px] font-black uppercase tracking-widest">No Logs Detected</p>
                           </div>
                       )}
                    </div>
                 </div>
              </div>

              {/* Outreach Synthesis Output */}
              {outreachStrategy && (
                 <div className="bg-indigo-600/5 border border-indigo-500/20 rounded-[3rem] p-10 animate-in fade-in zoom-in-95 duration-500 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
                    <div className="flex items-center justify-between mb-8 relative z-10">
                       <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                          <Bot className="text-indigo-400" size={24} /> Neural Strategy Synthesis
                       </h3>
                       <button 
                        onClick={() => {
                          navigator.clipboard.writeText(outreachStrategy);
                        }}
                        className="flex items-center gap-2 px-6 py-3 bg-indigo-600 rounded-2xl text-[10px] font-black uppercase text-white hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20 active:scale-95"
                       >
                          <Copy size={12} /> Copy Intel
                       </button>
                    </div>
                    <div className="prose prose-invert prose-sm max-w-none text-slate-300 font-medium leading-relaxed relative z-10">
                       {outreachStrategy.split('\n').map((line, i) => (
                         <p key={i} className="mb-3">{line}</p>
                       ))}
                    </div>
                 </div>
              )}
            </div>

            {/* Global Control Footer */}
            <div className="p-8 border-t border-slate-900 flex justify-between items-center bg-slate-950/90 backdrop-blur-2xl">
               <button 
                onClick={() => {
                  if(confirm('Purge node from neural database?')) {
                    deleteLead(selectedLead.id);
                    setSelectedId(leads.find(l => l.id !== selectedLead.id)?.id || null);
                  }
                }}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl text-red-500 hover:bg-red-500/10 text-[10px] font-black uppercase tracking-widest transition-all border border-transparent hover:border-red-500/20"
               >
                  <Trash2 size={16} /> Purge Node
               </button>
               <div className="flex gap-4">
                  {selectedLead.website && (
                    <a href={selectedLead.website} target="_blank" className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 hover:text-white transition-all shadow-xl hover:border-cyan-500/40">
                       <Globe size={18} />
                    </a>
                  )}
                  {selectedLead.mapsUrl && (
                    <a href={selectedLead.mapsUrl} target="_blank" className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 hover:text-white transition-all shadow-xl hover:border-indigo-500/40">
                       <MapPin size={18} />
                    </a>
                  )}
               </div>
            </div>
          </>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center p-20 text-center space-y-6">
             <div className="w-24 h-24 bg-slate-900 border border-slate-800 rounded-[2.5rem] flex items-center justify-center text-slate-700 shadow-inner">
                <Users size={40} />
             </div>
             <div>
                <h3 className="text-xl font-black text-white uppercase tracking-wider italic">Awaiting Synchronization</h3>
                <p className="text-xs text-slate-600 font-bold uppercase tracking-widest mt-2 max-w-xs mx-auto leading-relaxed">Select a neural node from the pipeline to begin operational management and outreach synthesis.</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadManager;
