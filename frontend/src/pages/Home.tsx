import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, Camera, Disc, Lightbulb, Mic, Tv, Cpu, Battery, 
  Star, CheckCircle2, ArrowRight, ChevronRight, Sparkles, ShieldCheck, 
  Truck, HelpCircle, MapPin, Calendar, Heart, Award
} from 'lucide-react';
import { apiRequest } from '../utils/api';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  dailyRate: number;
  weeklyRate: number;
  depositAmount: number;
  images: string;
  category: {
    name: string;
    slug: string;
  };
  vendor: {
    name: string;
  };
}

export default function Home() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Navigation States
  const [searchText, setSearchText] = useState('');
  const [selectedCity, setSelectedCity] = useState('Mumbai');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [rentalDates, setRentalDates] = useState({ start: '', end: '' });

  // Fetch all products for front page arrivals & popular
  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await apiRequest('/products');
        setProducts(data);
      } catch (err) {
        console.error('Failed to load home products:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let query = `/catalog?city=${selectedCity}`;
    if (searchText.trim()) {
      query += `&search=${encodeURIComponent(searchText.trim())}`;
    }
    if (rentalDates.start && rentalDates.end) {
      query += `&startDate=${rentalDates.start}&endDate=${rentalDates.end}`;
    }
    navigate(query);
  };

  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case 'cameras': return <Camera className="w-5 h-5 text-brand-600" />;
      case 'lenses': return <Disc className="w-5 h-5 text-brand-600" />;
      case 'lights': return <Lightbulb className="w-5 h-5 text-brand-600" />;
      case 'audio': return <Mic className="w-5 h-5 text-brand-600" />;
      case 'support': return <Tv className="w-5 h-5 text-brand-600" />;
      case 'accessories': return <Cpu className="w-5 h-5 text-brand-600" />;
      default: return <Battery className="w-5 h-5 text-brand-600" />;
    }
  };

  // Slice list to display small grids
  const trendingProducts = products.slice(0, 5);
  const newArrivals = products.slice(5, 9);

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 space-y-16 pb-20">
      
      {/* 1. INTERACTIVE HERO SECTION */}
      <div className="max-w-7xl mx-auto px-4 pt-8">
        <div className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-slate-850 to-indigo-950 p-8 md:p-16 overflow-hidden shadow-2xl border border-white/5 text-white flex flex-col items-center text-center gap-8">
          
          {/* Animated Background Lights */}
          <div className="absolute top-0 left-1/4 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl animate-pulse-gentle"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-500/5 rounded-full blur-3xl animate-pulse-gentle delay-700"></div>

          {/* Floating Camera Badges/Visual Teasers */}
          <div className="absolute right-6 top-8 hidden xl:flex flex-col gap-3 bg-white/5 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 shadow-lg scale-90 hover:scale-95 transition-all duration-300">
            <img 
              src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=150&q=80" 
              alt="Sony FX3"
              className="w-24 h-16 object-cover rounded-lg"
            />
            <div>
              <p className="text-[10px] font-bold text-white leading-tight">Sony FX3 Cinema</p>
              <p className="text-[9px] text-amber-400 font-bold mt-0.5">From ₹120/day</p>
            </div>
          </div>

          <div className="absolute left-6 bottom-8 hidden xl:flex flex-col gap-3 bg-white/5 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 shadow-lg scale-90 hover:scale-95 transition-all duration-300">
            <img 
              src="https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=150&q=80" 
              alt="DJI Drone"
              className="w-24 h-16 object-cover rounded-lg"
            />
            <div>
              <p className="text-[10px] font-bold text-white leading-tight">DJI Inspire 3 Drone</p>
              <p className="text-[9px] text-green-400 font-bold mt-0.5">Verified Calibrated</p>
            </div>
          </div>

          {/* Hero Titles */}
          <div className="space-y-4 max-w-3xl z-10">
            <span className="inline-flex items-center gap-1.5 bg-brand-500/20 border border-brand-500/30 text-brand-300 text-[10px] font-extrabold px-3.5 py-1.5 rounded-full uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> India's Premium Creative Gear Marketplace
            </span>
            <h1 className="text-3xl md:text-6xl font-black tracking-tight leading-none font-sans">
              Own the <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-accent-400">Experience</span><br />
              Rent the <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-400 to-brand-400">Gear</span>
            </h1>
            <p className="text-xs md:text-sm text-slate-300 font-medium max-w-xl mx-auto leading-relaxed">
              Why buy when you can upgrade? Rent cameras, lenses, stabilizers, and audio packs from verified local vendors with zero cash deposit holds.
            </p>
          </div>

          {/* FLOATING SEARCH / FILTER DECK PILL */}
          <form 
            onSubmit={handleSearchSubmit} 
            className="w-full max-w-4xl bg-white text-slate-800 rounded-3xl p-3 shadow-2xl flex flex-col lg:flex-row gap-2.5 z-20 border border-slate-100"
          >
            {/* City Selector */}
            <div className="relative flex items-center px-4 py-2 hover:bg-slate-50 rounded-2xl cursor-pointer transition shrink-0 border-b lg:border-b-0 lg:border-r border-slate-100">
              <div 
                className="flex items-center gap-2 w-full justify-between lg:justify-start"
                onClick={() => setShowCityDropdown(!showCityDropdown)}
              >
                <MapPin className="w-4 h-4 text-brand-600 shrink-0" />
                <div className="text-left">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">City</span>
                  <span className="text-xs font-bold text-slate-800">{selectedCity}</span>
                </div>
              </div>
              {showCityDropdown && (
                <div className="absolute top-full left-0 mt-2 w-40 bg-white border border-slate-100 rounded-2xl shadow-xl p-2 z-50 text-xs font-bold text-slate-700 flex flex-col gap-1 text-left">
                  {['Mumbai', 'Delhi NCR', 'Bengaluru', 'Pune', 'Hyderabad'].map(city => (
                    <button
                      key={city}
                      type="button"
                      onClick={() => { setSelectedCity(city); setShowCityDropdown(false); }}
                      className="px-3.5 py-2 hover:bg-slate-50 rounded-xl text-left font-bold"
                    >
                      {city}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Date Picker Range Picker */}
            <div className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 rounded-2xl transition flex-1 border-b lg:border-b-0 lg:border-r border-slate-100">
              <Calendar className="w-4 h-4 text-brand-600 shrink-0" />
              <div className="grid grid-cols-2 gap-2 text-left w-full">
                <div>
                  <span className="text-[9px] text-slate-400 font-bold uppercase block">Rental Start</span>
                  <input
                    type="date"
                    value={rentalDates.start}
                    onChange={(e) => setRentalDates({ ...rentalDates, start: e.target.value })}
                    className="bg-transparent text-xs font-bold text-slate-800 border-none outline-none p-0 cursor-pointer w-full focus:ring-0"
                  />
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 font-bold uppercase block">Rental End</span>
                  <input
                    type="date"
                    value={rentalDates.end}
                    onChange={(e) => setRentalDates({ ...rentalDates, end: e.target.value })}
                    className="bg-transparent text-xs font-bold text-slate-800 border-none outline-none p-0 cursor-pointer w-full focus:ring-0"
                  />
                </div>
              </div>
            </div>

            {/* General Search Input */}
            <div className="flex items-center gap-2 flex-1 px-4 py-2 rounded-2xl hover:bg-slate-50 transition border-b lg:border-b-0 border-slate-100 lg:border-none">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search Sony FX3, RED, prime lenses..."
                className="bg-transparent text-xs font-semibold text-slate-800 placeholder-slate-400 border-none outline-none w-full p-0 focus:ring-0"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs px-6 py-3 rounded-2xl shadow-md shadow-brand-500/20 transition flex items-center justify-center gap-1 cursor-pointer"
            >
              Search Gear <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

        </div>
      </div>

      {/* 2. PASSIVE INCOME ASSET BANNER */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-gradient-to-r from-blue-600 to-brand-700 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 text-white shadow-lg shadow-blue-500/10 border border-blue-400/15">
          <div className="space-y-1 text-center md:text-left">
            <span className="bg-white/20 text-white text-[9px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">Passive Earning</span>
            <h3 className="text-lg md:text-xl font-extrabold tracking-tight mt-1">Fund CineRent's Creative Assets</h3>
            <p className="text-xs text-blue-100">Rent out your redundant cameras, lens scopes, or lights and secure weekly bank payouts.</p>
          </div>
          <Link
            to="/vendor-onboarding"
            className="px-5 py-2.5 bg-white text-blue-700 font-extrabold text-xs rounded-xl shadow-md hover:scale-105 transition shrink-0"
          >
            Start Renting Out
          </Link>
        </div>
      </div>

      {/* 3. CATEGORIES HORIZONTAL NAVIGATION ROW */}
      <div className="max-w-7xl mx-auto px-4 space-y-4">
        <div className="flex justify-between items-end">
          <h2 className="text-lg font-extrabold text-slate-900">Top Categories to choose from</h2>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {[
            { name: 'DSLR & Cinema', slug: 'cameras' },
            { name: 'Prime Lenses', slug: 'lenses' },
            { name: 'Studio Lights', slug: 'lights' },
            { name: 'Audio Gears', slug: 'audio' },
            { name: 'Stands & Support', slug: 'support' },
            { name: 'Creator Kits', slug: 'accessories' },
          ].map((c) => (
            <Link
              key={c.slug}
              to={`/catalog?category=${c.slug}`}
              className="bg-white border border-slate-100 hover:border-brand-200 rounded-2xl p-4 flex flex-col items-center justify-center gap-3 text-center shadow-sm group hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                {getCategoryIcon(c.slug)}
              </div>
              <span className="text-xs font-bold text-slate-700 leading-tight group-hover:text-brand-600">{c.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* 4. TRENDING ITEMS HORIZONTAL CAROUSEL */}
      <div className="max-w-7xl mx-auto px-4 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Trending Items people love to rent</h2>
            <p className="text-xs text-slate-400 mt-1">High-demand camera rigs, audio nodes, and slider accessories.</p>
          </div>
          <Link to="/catalog" className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-0.5">
            See all Products <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-64 bg-white rounded-2xl border border-slate-100 animate-pulse shadow-sm"></div>
            ))}
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-200">
            {trendingProducts.map((p) => (
              <Link
                key={p.id}
                to={`/products/${p.slug}`}
                className="w-56 h-[275px] shrink-0 bg-white border border-slate-100 rounded-3xl p-3 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="h-32 w-full rounded-2xl overflow-hidden bg-slate-100 relative group shrink-0">
                    {/* Fallback Camera Icon for Broken Images */}
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-100 text-slate-350">
                      <Camera className="w-8 h-8 opacity-40 text-slate-400" />
                    </div>
                    <img
                      src={p.images.split(',')[0]}
                      alt={p.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 z-10"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <span className="absolute top-2 left-2 bg-green-500 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-full shadow-sm z-20">
                      KYC Approved
                    </span>
                  </div>

                  <div className="space-y-1 px-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{p.category.name}</span>
                    <h3 className="text-xs font-bold text-slate-800 line-clamp-2 leading-tight h-8">{p.name}</h3>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between px-1">
                  <div>
                    <span className="text-[8px] font-bold text-slate-400 block leading-tight">From</span>
                    <span className="text-xs font-black text-slate-850">₹{p.dailyRate}<span className="text-[10px] font-normal text-slate-500">/day</span></span>
                  </div>
                  <div className="flex items-center gap-0.5 text-amber-500">
                    <Star className="w-3 h-3 fill-amber-500" />
                    <span className="text-[10px] font-bold text-slate-650">5.0</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* 5. VALUE PROPOSITION: TRANSPARENT PRICES - ZERO SURPRISES */}
      <div className="max-w-7xl mx-auto px-4 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-slate-900">Transparent Pricing. <span className="text-brand-600">Zero Surprises</span></h2>
          <p className="text-xs text-slate-500">No hidden fees, no unnecessary documentation holds, pure creator workflow.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-brand-600" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-slate-900">Zero Security Deposit</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                For creative professionals with approved KYC documents, we bypass heavy security deposits holds. Zero holds, total freedom.
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6 text-brand-600" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-slate-900">Free Logistics Returns</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                We handle the heavy lifting. Pick up your packages at Bandra hub or select direct delivery options with zero surcharge penalties.
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center shrink-0">
              <Award className="w-6 h-6 text-brand-600" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-slate-900">100% Calibrated Gear</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Every camera sensor is dust-cleaned, and lens elements are collimated before dispatching. Get verified working setups on every shoot.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 6. WHY RENTING IS BETTER */}
      <div className="max-w-7xl mx-auto px-4 space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-black text-slate-900">Why Renting is <span className="text-brand-600">better</span>?</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/40 p-8 rounded-3xl border border-indigo-100 flex flex-col justify-between h-60">
            <div>
              <h4 className="font-black text-base text-indigo-900">Upgrade to the latest Tech</h4>
              <p className="text-xs text-indigo-700/80 mt-1.5 leading-relaxed">
                Camera bodies update every 18 months. Instead of taking on high equipment depreciation costs, rent the latest Sony FX3 or RED Raptor only when you shoot.
              </p>
            </div>
            <span className="text-[10px] text-indigo-600 font-extrabold uppercase tracking-widest">Hassle-Free Updates</span>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/40 p-8 rounded-3xl border border-emerald-100 flex flex-col justify-between h-60">
            <div>
              <h4 className="font-black text-base text-emerald-900">Circular Creator Economy</h4>
              <p className="text-xs text-emerald-700/80 mt-1.5 leading-relaxed">
                Sharing equipment reduces global electronics waste. By renting from certified local filmmakers, you invest back into your creative community.
              </p>
            </div>
            <span className="text-[10px] text-emerald-600 font-extrabold uppercase tracking-widest">Good for the Planet</span>
          </div>
        </div>
      </div>

      {/* 7. NEW ARRIVALS GRID */}
      <div className="max-w-7xl mx-auto px-4 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">New Arrivals on the platform</h2>
            <p className="text-xs text-slate-400 mt-1">Freshly seeded setups ready to check out.</p>
          </div>
          <Link to="/catalog" className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-0.5">
            Browse All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-72 bg-white rounded-3xl border border-slate-100 animate-pulse shadow-sm"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {newArrivals.map((p) => (
              <Link
                key={p.id}
                to={`/products/${p.slug}`}
                className="bg-white border border-slate-100 rounded-3xl p-3.5 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col justify-between group h-[285px]"
              >
                <div>
                  <div className="h-32 w-full rounded-2xl overflow-hidden bg-slate-100 relative shrink-0">
                    {/* Fallback Camera Icon for Broken Images */}
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-100 text-slate-350">
                      <Camera className="w-8 h-8 opacity-40 text-slate-400" />
                    </div>
                    <img
                      src={p.images.split(',')[0]}
                      alt={p.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 z-10"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                  <div className="space-y-1 mt-3 px-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{p.category.name}</span>
                    <h3 className="text-xs font-bold text-slate-800 line-clamp-2 leading-tight h-8 group-hover:text-brand-650 transition">{p.name}</h3>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between mt-3 px-1">
                  <div>
                    <span className="text-[8px] font-bold text-slate-400 block leading-tight">From</span>
                    <span className="text-xs font-black text-slate-850">₹{p.dailyRate}<span className="text-[10px] font-normal text-slate-500">/day</span></span>
                  </div>
                  <span className="text-[9px] bg-slate-50 border border-slate-100 text-slate-650 font-bold px-2 py-0.5 rounded-lg capitalize">
                    {p.vendor.name.split(' ')[0]}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
