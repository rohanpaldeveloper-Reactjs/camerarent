import React, { useEffect } from 'react';
import { useCmsStore } from '../store/cmsStore';
import { ShieldCheck, Award, Truck, HelpCircle, Camera, Users, Briefcase, Heart } from 'lucide-react';

const getServiceIcon = (name: string) => {
  switch (name) {
    case 'ShieldCheck': return <ShieldCheck className="w-6 h-6 text-brand-600" />;
    case 'Award': return <Award className="w-6 h-6 text-brand-600" />;
    case 'Truck': return <Truck className="w-6 h-6 text-brand-600" />;
    case 'HelpCircle': return <HelpCircle className="w-6 h-6 text-brand-600" />;
    default: return <Camera className="w-6 h-6 text-brand-600" />;
  }
};

export default function About() {
  const { contents, fetchCms, loading } = useCmsStore();

  useEffect(() => {
    fetchCms();
  }, [fetchCms]);

  if (loading && !contents.about_page) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <p className="text-slate-500 font-semibold animate-pulse">Loading About Details...</p>
      </div>
    );
  }

  const about = contents.about_page || {
    title: 'Who We Are',
    subtitle: 'Connecting creators with state-of-the-art camera and cinema equipment.',
    description: 'CameraRent was founded to simplify filmmaking logistics.',
    content: 'We offer a secure, zero-hassle environment with pre-inspected inventory checklists.',
    bannerUrl: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1200&q=80'
  };

  const services = contents.services || [];
  const team = contents.team_members || [];
  const portfolio = contents.portfolio || [];
  const clientLogos = contents.client_logos || [];

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 space-y-16 pb-20">
      
      {/* Hero Banner */}
      <div className="relative h-[300px] md:h-[400px] bg-slate-900 overflow-hidden flex items-center justify-center text-center px-4">
        <img 
          src={about.bannerUrl} 
          alt="About Us Banner" 
          className="absolute inset-0 w-full h-full object-cover opacity-30 select-none pointer-events-none"
        />
        <div className="relative z-10 space-y-4 max-w-3xl">
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white font-sans">
            {about.title}
          </h1>
          <p className="text-sm md:text-lg text-slate-200 font-medium max-w-xl mx-auto leading-relaxed">
            {about.subtitle}
          </p>
        </div>
      </div>

      {/* Description & Core Values */}
      <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
        <div className="space-y-4">
          <h2 className="text-xl font-extrabold text-slate-900 border-b border-brand-500/20 pb-3 flex items-center gap-2">
            <Heart className="w-5 h-5 text-brand-600" /> Our Story
          </h2>
          <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-medium">
            {about.description}
          </p>
          <div 
            className="text-xs md:text-sm text-slate-500 leading-relaxed space-y-2 font-medium"
            dangerouslySetInnerHTML={{ __html: about.content }}
          />
        </div>

        {/* Services Grid */}
        <div className="space-y-6">
          <h2 className="text-xl font-extrabold text-slate-900 border-b border-brand-500/20 pb-3 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-brand-600" /> Vetted Services
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {services.map((s: any) => (
              <div key={s.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-2">
                <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center">
                  {getServiceIcon(s.iconName)}
                </div>
                <h4 className="font-bold text-xs text-slate-800 leading-tight">{s.name}</h4>
                <p className="text-[10px] text-slate-400 leading-normal font-medium">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Portfolio / Case Studies */}
      {portfolio.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 space-y-6">
          <div className="text-center space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">CREATIVE PORTFOLIO</span>
            <h2 className="text-2xl font-black text-slate-900">Portfolio & Case Studies</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolio.map((p: any) => (
              <div key={p.id} className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition group">
                <div className="h-44 bg-slate-100 relative overflow-hidden">
                  <img 
                    src={p.imageUrl} 
                    alt={p.title} 
                    className="w-full h-full object-cover group-hover:scale-102 transition duration-300"
                  />
                  <span className="absolute top-2 left-2 bg-brand-600 text-white text-[8px] font-black uppercase px-2.5 py-0.5 rounded-full">
                    {p.category}
                  </span>
                </div>
                <div className="p-5 space-y-2">
                  <h4 className="font-extrabold text-xs text-slate-800">{p.title}</h4>
                  <p className="text-[10px] text-slate-500 leading-relaxed font-medium">{p.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Creative Team */}
      {team.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 space-y-6">
          <div className="text-center space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">MEET THE TEAM</span>
            <h2 className="text-2xl font-black text-slate-900">Creative Brains Behind CameraRent</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {team.map((m: any) => (
              <div key={m.id} className="flex flex-col items-center text-center space-y-3 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <img 
                  src={m.imageUrl} 
                  alt={m.name} 
                  className="w-24 h-24 rounded-full object-cover border-2 border-slate-100 shadow-inner"
                />
                <div>
                  <h4 className="font-extrabold text-xs text-slate-800">{m.name}</h4>
                  <p className="text-[10px] text-brand-600 font-semibold">{m.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Client Logos Banner */}
      {clientLogos.length > 0 && (
        <div className="max-w-5xl mx-auto px-6 border-t border-slate-200/50 pt-12 space-y-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">TRUSTED BY TOP PRODUCTION HOUSES</p>
          <div className="flex flex-wrap items-center justify-center gap-12 opacity-60">
            {clientLogos.map((l: any) => (
              <div key={l.id} className="flex items-center gap-2">
                <img 
                  src={l.imageUrl} 
                  alt={l.name} 
                  className="h-7 object-contain rounded-md" 
                />
                <span className="font-bold text-[10px] text-slate-500 uppercase">{l.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
