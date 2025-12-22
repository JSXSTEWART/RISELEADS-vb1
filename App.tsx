
import React, { useState, createContext, useContext, useEffect, useCallback } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { 
  Search, Users, Settings, Menu, Bell, Globe, 
  LayoutDashboard, BrainCircuit, Command, User,
  LogOut, HelpCircle, Sparkles, MessageSquare, Activity, X, Trash2
} from 'lucide-react';
import LeadFinder from './components/LeadFinder';
import LeadManager from './components/LeadManager';
import Dashboard from './components/Dashboard';
import AIAssistant from './components/AIAssistant';
import { Language, Lead, LeadsContextType, Notification } from './types';
import { translations } from './i18n';

const LanguageContext = createContext<any>(undefined);
const LeadsContext = createContext<LeadsContextType | undefined>(undefined);

export const useLanguage = () => useContext(LanguageContext);
export const useLeads = () => useContext(LeadsContext)!;

const Header: React.FC<{ onMenuClick: () => void }> = ({ onMenuClick }) => {
  const { language, setLanguage } = useLanguage();
  const { notifications, markNotificationRead, clearNotifications } = useLeads();
  const [showNotifs, setShowNotifs] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="h-20 bg-slate-950/80 border-b border-slate-900 backdrop-blur-2xl sticky top-0 z-[50] px-6 md:px-10 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <button onClick={onMenuClick} className="md:hidden p-3 bg-slate-900 rounded-2xl text-slate-400 hover:text-white shadow-xl">
          <Menu size={24} />
        </button>
        <div className="relative group hidden lg:block">
           <Command className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
           <input 
            type="text" 
            placeholder="Search Intelligence Database..." 
            className="bg-slate-900 border border-slate-800 rounded-2xl py-3 pl-12 pr-6 text-xs font-black text-slate-400 w-80 focus:outline-none focus:border-cyan-500/40 transition-all"
           />
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-6">
        <div className="hidden sm:flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
           <Activity size={12} className="text-emerald-500 animate-pulse" />
           <span className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em]">Neural Link Stable</span>
        </div>

        <div className="relative">
          <button 
            onClick={() => setShowNotifs(!showNotifs)}
            className="p-3 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 hover:text-white relative shadow-xl transition-all active:scale-95"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-cyan-600 rounded-full border-2 border-slate-950 text-[10px] font-black flex items-center justify-center text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 mt-4 w-80 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl z-[100] overflow-hidden animate-in slide-in-from-top-2">
              <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
                <span className="text-xs font-black uppercase tracking-widest text-white">Alert Center</span>
                <button onClick={clearNotifications} className="text-[10px] font-bold text-slate-500 hover:text-white uppercase tracking-tighter">Clear All</button>
              </div>
              <div className="max-h-96 overflow-y-auto divide-y divide-slate-800">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-600 font-bold uppercase tracking-widest">No active alerts</div>
                ) : (
                  notifications.map(n => (
                    <div 
                      key={n.id} 
                      onClick={() => markNotificationRead(n.id)}
                      className={`p-4 hover:bg-slate-800 cursor-pointer transition-colors ${!n.read ? 'bg-cyan-500/5' : ''}`}
                    >
                      <div className="flex gap-3">
                        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.type === 'alert' ? 'bg-red-500' : n.type === 'success' ? 'bg-emerald-500' : 'bg-cyan-500'}`} />
                        <div>
                          <p className="text-xs font-black text-white">{n.title}</p>
                          <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-1">{n.message}</p>
                          <p className="text-[8px] text-slate-700 font-black uppercase mt-2">{new Date(n.timestamp).toLocaleTimeString()}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="relative group/lang">
          <button className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-white transition-all bg-slate-900 border border-slate-800 rounded-2xl font-black text-[10px] uppercase tracking-widest">
            <Globe size={16} />
            {language.toUpperCase()}
          </button>
          <div className="absolute right-0 mt-3 w-40 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl opacity-0 scale-95 group-hover/lang:opacity-100 group-hover/lang:scale-100 pointer-events-none group-hover/lang:pointer-events-auto transition-all py-3 z-[60]">
            {(['en', 'es', 'zh'] as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`w-full text-left px-5 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-colors ${language === lang ? 'text-cyan-400' : 'text-slate-500'}`}
              >
                {lang === 'en' ? 'English' : lang === 'es' ? 'Español' : 'Chinese'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};

const Sidebar: React.FC<{ isOpen: boolean; setIsOpen: (v: boolean) => void }> = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const navItems = [
    { path: '/', label: 'Mission Control', icon: LayoutDashboard },
    { path: '/finder', label: 'Lead Discovery', icon: Search },
    { path: '/leads', label: 'Active Pipeline', icon: Users },
    { path: '/assistant', label: 'Neural Strategy', icon: MessageSquare },
  ];

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60] md:hidden" onClick={() => setIsOpen(false)} />
      )}
      <aside className={`fixed top-0 left-0 bottom-0 w-80 bg-slate-950 border-r border-slate-900 flex flex-col z-[70] transition-transform duration-500 md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-8 border-b border-slate-900">
          <Link to="/" onClick={() => setIsOpen(false)} className="flex items-center gap-4 group">
            <div className="w-12 h-12 bg-cyan-600 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-all shadow-xl shadow-cyan-600/20">
              <BrainCircuit className="text-white" size={28} />
            </div>
            <div>
              <span className="text-2xl font-black text-white tracking-tighter block leading-none">RISE<span className="text-cyan-500">LEADS</span></span>
              <span className="text-[10px] text-slate-600 font-black uppercase tracking-[0.3em] mt-2 block">Enterprise OS 4.0</span>
            </div>
          </Link>
        </div>
        <nav className="flex-grow p-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-4 px-5 py-4 rounded-[1.25rem] text-sm font-black transition-all relative group ${
                location.pathname === item.path
                  ? 'bg-cyan-600/10 text-cyan-400 border border-cyan-500/20 shadow-xl'
                  : 'text-slate-500 hover:bg-slate-900 hover:text-white border border-transparent'
              }`}
            >
              <item.icon size={20} />
              {item.label}
              {location.pathname === item.path && (
                <div className="absolute right-4 w-1.5 h-1.5 bg-cyan-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
              )}
            </Link>
          ))}
        </nav>
        <div className="p-6">
           <div className="bg-slate-900 rounded-3xl p-5 border border-slate-800 space-y-4">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-slate-800 rounded-xl border border-slate-700 flex items-center justify-center">
                    <User className="text-slate-600" size={18} />
                 </div>
                 <div>
                    <p className="text-xs font-black text-white">Elite User</p>
                    <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Verified Session</p>
                 </div>
              </div>
           </div>
        </div>
      </aside>
    </>
  );
};

const App: React.FC = () => {
  const [language, setLanguage] = useState<Language>('en');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const savedLeads = localStorage.getItem('rise_leads_os_v4');
    if (savedLeads) setLeads(JSON.parse(savedLeads));
  }, []);

  useEffect(() => {
    localStorage.setItem('rise_leads_os_v4', JSON.stringify(leads));
  }, [leads]);

  const addLead = useCallback((lead: Lead) => {
    setLeads(prev => {
      const isDuplicate = prev.some(l => l.name === lead.name || (lead.website && l.website === lead.website));
      if (isDuplicate) {
        addNotification('Sync Warning', `Duplicate lead detected: ${lead.name}`, 'info');
        return prev;
      }
      addNotification('Lead Discovered', `${lead.name} added to pipeline.`, 'success');
      return [lead, ...prev];
    });
  }, []);

  const updateLead = useCallback((id: string, updates: Partial<Lead>) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
  }, []);

  const deleteLead = useCallback((id: string) => {
    setLeads(prev => prev.filter(l => l.id !== id));
  }, []);

  const addNotification = (title: string, message: string, type: Notification['type']) => {
    const newNotif: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      title, message, type, read: false, timestamp: new Date()
    };
    setNotifications(prev => [newNotif, ...prev].slice(0, 20));
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearNotifications = () => setNotifications([]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: (k: any) => translations[language][k] }}>
      <LeadsContext.Provider value={{ 
        leads, addLead, updateLead, deleteLead, 
        notifications, markNotificationRead, clearNotifications 
      }}>
        <Router>
          <div className="min-h-screen bg-slate-950 text-slate-200 flex selection:bg-cyan-500/30">
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            <div className="flex-grow flex flex-col md:ml-80 min-h-screen relative">
              <Header onMenuClick={() => setIsSidebarOpen(true)} />
              <main className="flex-grow pb-20">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/finder" element={<LeadFinder />} />
                  <Route path="/leads" element={<LeadManager />} />
                  <Route path="/assistant" element={<AIAssistant />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
              <footer className="p-10 border-t border-slate-900 bg-slate-950 flex flex-col md:flex-row justify-between items-center gap-6">
                <p className="text-slate-700 text-[10px] font-black uppercase tracking-[0.5em]">&copy; 2025 RISE LEADS &bull; ELITE OS</p>
                <div className="flex gap-8 text-[10px] font-black text-slate-600 tracking-widest uppercase">
                  <span className="flex items-center gap-2 text-cyan-500"><Sparkles size={14} /> Neural Core Online</span>
                </div>
              </footer>
            </div>
          </div>
        </Router>
      </LeadsContext.Provider>
    </LanguageContext.Provider>
  );
};

export default App;
