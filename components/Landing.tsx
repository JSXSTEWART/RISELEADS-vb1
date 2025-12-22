
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search, Zap, Globe, Shield, Target, MousePointer2 } from 'lucide-react';
import { useLanguage } from '../App';

const Landing: React.FC = () => {
  const { t } = useLanguage();
  return (
    <div className="relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none opacity-20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-600 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 left-0 w-80 h-80 bg-indigo-600 rounded-full blur-[100px]" />
      </div>

      <section className="relative pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-400 text-xs font-bold uppercase tracking-widest mb-8 animate-pulse">
            <Zap size={14} />
            {t('hero_badge')}
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter mb-8 leading-[0.9]">
            {t('hero_title_1')} <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-indigo-500">
              {t('hero_title_2')}
            </span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
            {t('hero_desc')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link to="/finder" className="w-full sm:w-auto px-10 py-5 bg-cyan-600 text-white rounded-2xl font-black text-lg hover:bg-cyan-500 shadow-2xl shadow-cyan-600/30 transition-all flex items-center justify-center gap-2 group">
              {t('btn_start')}
              <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <button className="w-full sm:w-auto px-10 py-5 bg-slate-900 text-white border border-slate-800 rounded-2xl font-black text-lg hover:bg-slate-800 transition-all">
              {t('btn_demo')}
            </button>
          </div>
        </div>
      </section>

      <section className="relative py-24 bg-slate-900/30 backdrop-blur-xl border-y border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { icon: Search, title: 'AI Discovery', desc: 'Real-time extraction from Google Maps with deep business intelligence.' },
              { icon: Target, title: 'Targeted Lists', desc: 'Filter leads by rating, niche, and location to find those who need you most.' },
              { icon: MousePointer2, title: 'One-Click Outreach', desc: 'Generate high-converting personalized messages instantly with Gemini Pro.' },
            ].map((feature, i) => (
              <div key={i} className="group">
                <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center mb-6 border border-slate-700 group-hover:border-cyan-500 transition-colors">
                  <feature.icon className="text-cyan-400" size={28} />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
