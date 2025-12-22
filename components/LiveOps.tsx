
import React, { useState, useEffect } from 'react';
import { Layers, Box, Truck, Ship, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface TerminalUnit {
    id: string;
    type: 'Shipment' | 'Docking' | 'Vessel';
    status: 'In-Transit' | 'Loading' | 'Pending' | 'Complete';
    zone: string;
    priority: 'Low' | 'Medium' | 'High' | 'Critical';
}

const LiveOps: React.FC = () => {
  const [units, setUnits] = useState<TerminalUnit[]>([]);

  useEffect(() => {
    const initialUnits: TerminalUnit[] = [
      { id: 'ACME-892', type: 'Shipment', status: 'In-Transit', zone: 'Sector B', priority: 'High' },
      { id: 'ACME-102', type: 'Docking', status: 'Loading', zone: 'Gate 4', priority: 'Medium' },
      { id: 'VESS-001', type: 'Vessel', status: 'Pending', zone: 'Anchorage', priority: 'Low' },
      { id: 'ACME-445', type: 'Shipment', status: 'Complete', zone: 'Sector A', priority: 'Critical' },
      { id: 'ACME-901', type: 'Shipment', status: 'Loading', zone: 'Sector B', priority: 'High' },
    ];
    setUnits(initialUnits);

    const interval = setInterval(() => {
        setUnits(prev => prev.map(u => {
            if (Math.random() > 0.8) {
                const statuses: TerminalUnit['status'][] = ['In-Transit', 'Loading', 'Pending', 'Complete'];
                return { ...u, status: statuses[Math.floor(Math.random() * statuses.length)] };
            }
            return u;
        }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Layers className="text-blue-500" />
            Live Terminal Flow
          </h1>
          <p className="text-slate-400">Monitoring all active spatial assets across the global network</p>
        </div>
        <div className="flex gap-2">
            <span className="flex items-center gap-1.5 px-3 py-1 bg-green-500/10 text-green-500 text-xs font-bold rounded-full border border-green-500/20">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" />
                NETWORK UPTIME: 100%
            </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl lg:col-span-2">
            <div className="p-4 bg-slate-800/50 border-b border-slate-700 font-medium text-slate-300 flex justify-between">
                Active Tracking
                <span className="text-xs text-slate-500">Auto-refreshing 5s</span>
            </div>
            <div className="divide-y divide-slate-800">
                {units.map((unit) => (
                    <div key={unit.id} className="p-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors group">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-blue-400 transition-colors">
                                {unit.type === 'Shipment' ? <Box size={20} /> : unit.type === 'Vessel' ? <Ship size={20} /> : <Truck size={20} />}
                            </div>
                            <div>
                                <h4 className="text-white font-mono font-medium">{unit.id}</h4>
                                <p className="text-xs text-slate-500 uppercase tracking-wider">{unit.type} &bull; {unit.zone}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="hidden sm:flex flex-col items-end">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                                    unit.priority === 'Critical' ? 'bg-red-500/10 text-red-500' :
                                    unit.priority === 'High' ? 'bg-amber-500/10 text-amber-500' :
                                    'bg-blue-500/10 text-blue-500'
                                }`}>
                                    {unit.priority} PRIORITY
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${
                                    unit.status === 'Complete' ? 'bg-emerald-500' :
                                    unit.status === 'Loading' ? 'bg-blue-500 animate-pulse' :
                                    'bg-slate-600'
                                }`} />
                                <span className="text-sm text-slate-300 min-w-[80px]">{unit.status}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        <div className="space-y-6">
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                    <AlertTriangle size={80} className="text-amber-500" />
                </div>
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <AlertTriangle size={18} className="text-amber-500" />
                    Anomaly Detection
                </h3>
                <div className="space-y-4">
                    <div className="p-3 bg-red-500/5 border border-red-500/20 rounded-xl">
                        <p className="text-xs font-bold text-red-400 mb-1">UNSCHEDULED DOWNTIME</p>
                        <p className="text-sm text-slate-300">Crane 12 in Sector B reports hydraulic pressure variance.</p>
                        <p className="text-[10px] text-slate-500 mt-2">Detected 4m ago</p>
                    </div>
                    <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                        <p className="text-xs font-bold text-amber-400 mb-1">TRAFFIC BOTTLE-NECK</p>
                        <p className="text-sm text-slate-300">Gate 4 experiencing higher than usual queue times (45m+).</p>
                        <p className="text-[10px] text-slate-500 mt-2">Detected 12m ago</p>
                    </div>
                </div>
            </div>

            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <CheckCircle2 size={18} className="text-emerald-500" />
                    Optimization Goals
                </h3>
                <div className="space-y-4">
                    <div className="space-y-1">
                        <div className="flex justify-between text-xs font-medium text-slate-400">
                            <span>Sector A Utilization</span>
                            <span>84%</span>
                        </div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 w-[84%]" />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <div className="flex justify-between text-xs font-medium text-slate-400">
                            <span>Global Latency Target</span>
                            <span>92% REACHED</span>
                        </div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 w-[92%]" />
                        </div>
                    </div>
                </div>
                <button className="w-full mt-6 py-2 bg-slate-800 text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors">
                    Re-Calculate Strategy
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default LiveOps;
