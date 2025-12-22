
import React, { useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import { 
  Target, TrendingUp, Zap, Star, 
  ShieldCheck, Search, Database, BarChart3, 
  Layers, Users, Activity, ArrowUpRight, Signal
} from 'lucide-react';
import { useLeads } from '../App';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { leads } = useLeads();

  const stats = useMemo(() => {
    const total = leads.length;
    const highValue = leads.filter(l => (l.enrichedData?.qualScore || 0) > 80).length;
    const conversion = leads.filter(l => l.status === 'Closed').length;

    return [
      { label: 'Pipeline Capacity', value: total, icon: Target, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
      { label: 'Elite Segment', value: highValue, icon: ShieldCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
      { label: 'Success Nodes', value: conversion, icon: Star, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    ];
  }, [leads]);

  const highVelocityLeads = useMemo(() => {
    return [...leads]
      .filter(l => l.enrichedData?.qualScore)
      .sort((a, b) => (b.enrichedData?.qualScore || 0) - (a.enrichedData?.qualScore || 0))
      .slice(0, 3);
  }, [leads]);

  const industryData = useMemo(() => {
    const counts: Record<string, number> = {};
    leads.forEach(l => {
      const ind = l.enrichedData?.industry || 'Unknown Sector';
      counts[ind] = (counts[ind] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [leads]);

  const COLORS = ['#22d3ee', '#818cf8', '#34d399', '#fbbf24', '#f472b6'];

  return (
    <div className="p-6 md:p-10 space-y-10 animate-in fade-in duration-700 max-w-7xl mx-auto">
      
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-3 py-1 bg-cyan-600/10 border border-cyan-500/20 rounded-xl w-fit">
            <Signal size={14} className="text-cyan-400" />
            <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Global Scan Active</span>
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter leading-none italic">Mission Control</h1>
          <p className="text-slate-400 text-lg font-medium">Platform intelligence reporting for {leads.length} active nodes.</p>
        </div>
        
        <Link to="/finder" className="px-8 py-4 bg-white text-slate-950 rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-cyan-500 hover:text-white transition-all shadow-xl shadow-cyan-600/10 flex items-center gap-3 group">
          <Search size={18} className="group-hover:scale-125 transition-transform" />
          Harvest New Leads
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2.5rem] group hover:border-cyan-500/40 transition-all shadow-2xl relative overflow-hidden backdrop-blur-xl">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${stat.bg} ${stat.color} mb-6 group-hover:rotate-6 transition-transform`}>
              <stat.icon size={28} />
            </div>
            <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">{stat.label}</h3>
            <p className="text-5xl font-black text-white mt-1 tracking-tighter">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
           <div className="bg-slate-900/50 border border-slate-800 p-10 rounded-[3rem] shadow-2xl backdrop-blur-md h-full">
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-3">
                  <TrendingUp className="text-cyan-400" size={24} />
                  Pipeline Velocity
                </h3>
              </div>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={[{n: 'Mon', v: 4}, {n: 'Tue', v: 7}, {n: 'Wed', v: 5}, {n: 'Thu', v: 9}, {n: 'Fri', v: 12}]}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.3} />
                    <XAxis dataKey="n" stroke="#475569" fontSize={10} fontWeight="900" axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }} />
                    <Area type="monotone" dataKey="v" stroke="#22d3ee" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
           </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
           <div className="bg-slate-900 border border-slate-800 p-8 rounded-[3rem] shadow-2xl h-full flex flex-col">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.4em] mb-8 flex items-center gap-3">
                <Activity className="text-indigo-400" size={18} />
                High-Velocity Signals
              </h3>
              <div className="flex-grow space-y-4">
                {highVelocityLeads.length > 0 ? highVelocityLeads.map(lead => (
                  <div key={lead.id} className="p-5 bg-slate-950/50 border border-slate-800 rounded-3xl group hover:border-cyan-500/50 transition-all">
                    <div className="flex justify-between items-start mb-2">
                       <span className="text-[9px] font-black text-emerald-500 uppercase bg-emerald-500/10 px-2 py-1 rounded-lg">Elite Fit</span>
                       <span className="text-xl font-black text-white">{lead.enrichedData?.qualScore}%</span>
                    </div>
                    <p className="text-sm font-black text-slate-200 truncate">{lead.name}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">{lead.enrichedData?.industry}</p>
                  </div>
                )) : (
                  <div className="h-full flex items-center justify-center text-slate-600 text-xs font-bold uppercase italic tracking-widest">Awaiting Enrichment...</div>
                )}
              </div>
              <Link to="/leads" className="mt-8 text-center text-[10px] font-black uppercase text-cyan-400 hover:text-white transition-colors tracking-widest flex items-center justify-center gap-2">
                Open Command Center <ArrowUpRight size={14} />
              </Link>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
