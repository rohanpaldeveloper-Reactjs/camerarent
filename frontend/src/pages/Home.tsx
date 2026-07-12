import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, Camera, Disc, Lightbulb, Mic, Tv, Cpu, Battery, Monitor,
  Star, CheckCircle2, ArrowRight, ChevronRight, MessageSquare
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
  const [searchText, setSearchText] = useState('');

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
    if (searchText.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(searchText.trim())}`);
    } else {
      navigate('/catalog');
    }
  };

  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case 'cameras': return <Camera className="w-5 h-5 text-slate-700" />;
      case 'lenses': return <Disc className="w-5 h-5 text-slate-700" />;
      case 'lights': return <Lightbulb className="w-5 h-5 text-slate-700" />;
      case 'audio': return <Mic className="w-5 h-5 text-slate-700" />;
      case 'support': return <Tv className="w-5 h-5 text-slate-700" />;
      case 'accessories': return <Cpu className="w-5 h-5 text-slate-700" />;
      default: return <Battery className="w-5 h-5 text-slate-700" />;
    }
  };

  // Slice list to display small grids
  const newArrivals = products.slice(0, 4);
  const popularProducts = products.slice(4, 8);

  return (
    <div className="space-y-16 bg-slate-50 min-h-screen">
      
      {/* 1. Header Hero Promo Banner */}
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <div className="promo-purple-gradient rounded-3xl p-8 md:p-12 relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-8 shadow-xl border border-indigo-400/20 text-white">
          <div className="space-y-4 z-10 max-w-xl text-center md:text-left">
            <span className="bg-white/20 border border-white/10 text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
              Exclusive Creator Deal
            </span>
            <h1 className="text-3xl md:text-5xl font-sans font-extrabold tracking-tight leading-tight">
              CAMERA RENTAL
            </h1>
            <p className="text-sm md:text-base text-indigo-100 font-medium">
              Trusted Partners for Creators. Get <strong className="text-amber-400">10% OFF</strong> your first booking.
            </p>

            {/* Embedded Search bar inside Hero */}
            <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-md mx-auto md:mx-0 pt-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Search Sony FX3, RED, prime lenses..."
                  className="w-full bg-white border border-slate-100 pl-10 pr-4 py-2.5 rounded-xl text-xs focus:outline-none text-slate-800 shadow-sm"
                />
              </div>
              <button 
                type="submit"
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition cursor-pointer"
              >
                Search
              </button>
            </form>
          </div>

          <div className="z-10 flex gap-3">
            <Link 
              to="/catalog"
              className="bg-white hover:bg-slate-50 text-indigo-700 text-xs font-bold px-6 py-3.5 rounded-2xl shadow-md transition-all duration-200 cursor-pointer hover:scale-[1.02] flex items-center gap-1.5"
            >
              Browse Catalog <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-white/5 rounded-full blur-2xl"></div>
          <div className="absolute top-0 left-1/3 w-40 h-40 bg-indigo-500/20 rounded-full blur-xl"></div>
        </div>
      </div>

      {/* 2. Category Navigation (Lands on Catalog page with filter active) */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex items-center justify-between overflow-x-auto gap-4 scrollbar-none">
          <Link
            to="/catalog"
            className="flex flex-col items-center gap-2 p-3 rounded-2xl hover:bg-slate-50 border border-transparent transition min-w-[75px]"
          >
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
              <GridIcon className="w-5 h-5 text-slate-700" />
            </div>
            <span className="text-xs font-bold text-slate-700">All Gear</span>
          </Link>

          {['cameras', 'lenses', 'lights', 'audio', 'support', 'accessories'].map((slug) => (
            <Link
              key={slug}
              to={`/catalog?category=${slug}`}
              className="flex flex-col items-center gap-2 p-3 rounded-2xl hover:bg-slate-50 border border-transparent transition min-w-[85px]"
            >
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                {getCategoryIcon(slug)}
              </div>
              <span className="text-xs font-bold text-slate-700 capitalize">{slug}</span>
            </Link>
          ))}

          {/* Additional static categories */}
          {['Monitors', 'Rigs', 'Batteries'].map((catName) => (
            <Link
              key={catName}
              to={`/catalog?category=${catName.toLowerCase()}`}
              className="flex flex-col items-center gap-2 p-3 rounded-2xl hover:bg-slate-50 transition min-w-[85px] opacity-75 hover:opacity-100"
            >
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                {catName === 'Monitors' ? <Monitor className="w-5 h-5 text-slate-700" /> :
                 catName === 'Rigs' ? <Tv className="w-5 h-5 text-slate-700" /> :
                 <Battery className="w-5 h-5 text-slate-700" />}
              </div>
              <span className="text-xs font-bold text-slate-700">{catName}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* 3. New Arrivals (4 columns - smaller, modern cards) */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 font-sans">New Arrivals</h2>
            <p className="text-xs text-slate-500 mt-0.5">Explore the latest industry-standard releases.</p>
          </div>
          <Link 
            to="/catalog"
            className="text-xs text-brand-600 hover:text-brand-700 font-bold flex items-center gap-1 hover:underline cursor-pointer"
          >
            See All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 bg-white border border-slate-100 rounded-3xl animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {newArrivals.map((product) => (
              <Link 
                key={product.id}
                to={`/products/${product.slug}`}
                className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-brand-500/25 transition-all duration-300 group flex flex-col justify-between"
              >
                {/* Compact aspect crop */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                  <img 
                    src={product.images.split(',')[0]} 
                    alt={product.name} 
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-2 left-2 bg-brand-600 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                    NEW
                  </span>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[9px] text-brand-600 font-extrabold uppercase tracking-wider block">
                      {product.vendor.name}
                    </span>
                    <h3 className="font-extrabold text-xs text-slate-800 line-clamp-1 group-hover:text-brand-600 transition">
                      {product.name}
                    </h3>
                  </div>

                  <div className="pt-2 border-t border-slate-50 flex justify-between items-center">
                    <div>
                      <p className="text-[8px] text-slate-400 uppercase font-semibold">Rate/Day</p>
                      <p className="text-xs font-black text-slate-900">${product.dailyRate}</p>
                    </div>
                    <span className="text-[9px] text-slate-400 font-bold flex items-center gap-0.5 group-hover:text-brand-600 transition">
                      Rent <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* 4. Partner/Brands */}
      <div className="bg-slate-100/50 py-10 border-y border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-base font-extrabold text-slate-900 uppercase tracking-widest">Partner Brands</h2>
            <p className="text-xs text-slate-500">Authorized dealer setups from premium manufacturers.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-6 items-center">
            {['Sony', 'Canon', 'RED', 'Zeiss', 'Aputure', 'Sennheiser', 'ARRI'].map((brand) => (
              <Link 
                key={brand}
                to={`/catalog?search=${brand.toLowerCase()}`}
                className="w-16 h-16 rounded-full bg-white border border-slate-200/60 shadow-sm flex items-center justify-center font-extrabold text-slate-400 text-xs hover:text-slate-700 hover:scale-105 transition cursor-pointer"
              >
                {brand}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Popular Products (4 columns - smaller, modern cards) */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 font-sans">Popular Products</h2>
            <p className="text-xs text-slate-500 mt-0.5">Most hired camera bodies and lenses this month.</p>
          </div>
          <Link 
            to="/catalog"
            className="text-xs text-brand-600 hover:text-brand-700 font-bold flex items-center gap-1 hover:underline cursor-pointer"
          >
            See All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 bg-white border border-slate-100 rounded-3xl animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {popularProducts.map((product) => (
              <Link 
                key={product.id}
                to={`/products/${product.slug}`}
                className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-brand-500/25 transition-all duration-300 group flex flex-col justify-between"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                  <img 
                    src={product.images.split(',')[0]} 
                    alt={product.name} 
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[9px] text-brand-600 font-extrabold uppercase tracking-wider block">
                      {product.vendor.name}
                    </span>
                    <h3 className="font-extrabold text-xs text-slate-800 line-clamp-1 group-hover:text-brand-600 transition">
                      {product.name}
                    </h3>
                  </div>

                  <div className="pt-2 border-t border-slate-50 flex justify-between items-center">
                    <div>
                      <p className="text-[8px] text-slate-400 uppercase font-semibold">Rate/Day</p>
                      <p className="text-xs font-black text-slate-900">${product.dailyRate}</p>
                    </div>
                    <span className="text-[9px] text-slate-400 font-bold flex items-center gap-0.5 group-hover:text-brand-600 transition">
                      Rent <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* 6. "Unlock 10% Off" Banner */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-3xl p-8 text-center text-white relative overflow-hidden shadow-xl border border-indigo-500/20">
          <div className="space-y-4 max-w-xl mx-auto z-10 relative">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Unlock 10% Off On Your First Rental
            </h2>
            <p className="text-xs text-indigo-200">
              Submit your profile verification today and enjoy 10% off coupon sent instantly to your WhatsApp account.
            </p>
            <button 
              onClick={() => navigate('/signup')}
              className="bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-lg shadow-brand-500/20 transition cursor-pointer"
            >
              Claim Here!
            </button>
          </div>
          <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full blur-2xl"></div>
        </div>
      </div>

      {/* 7. Value Badges */}
      <div className="max-w-7xl mx-auto px-4 text-center space-y-8">
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-slate-900 font-sans">Trusted by Professionals Across the Globe</h2>
          <p className="text-xs text-slate-500">Why filmmakers choose CineRent for gear rentals.</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { metric: '8.0+', title: 'Best Experience', desc: '8 years serving production crews', icon: <Star className="w-5 h-5 text-brand-600" /> },
            { metric: 'Fast Handover', title: 'Pick up on schedule', desc: 'Zero queue handover check sheets', icon: <CheckCircle2 className="w-5 h-5 text-brand-600" /> },
            { metric: '100% Vetted', title: 'Large Catalog', desc: 'Top suppliers verified gear lists', icon: <Tv className="w-5 h-5 text-brand-600" /> },
            { metric: '24/7 Crew', title: 'Dedicated Support', desc: 'Live troubleshooting support helpline', icon: <MessageSquare className="w-5 h-5 text-brand-600" /> },
          ].map((item, idx) => (
            <div key={idx} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4 hover:border-brand-300 transition duration-300">
              <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center mx-auto">
                {item.icon}
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-slate-900">{item.metric}</h3>
                <p className="text-xs font-bold text-slate-600">{item.title}</p>
                <p className="text-[10px] text-slate-400">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 8. Getting Started Steps */}
      <div className="max-w-7xl mx-auto px-4 space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 font-sans">Getting started with Camerarent</h2>
            <p className="text-xs text-slate-500 mt-0.5">Simple 4-step workflow to rent equipment.</p>
          </div>
          <span className="bg-brand-100 text-brand-700 text-[10px] font-bold px-3 py-1.5 rounded-full border border-brand-200">
            How It Works
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { step: '1', title: 'Choose Your Gear', desc: 'Explore cameras, zoom lenses, and rigs in the catalog.' },
            { step: '2', title: 'Check Use Duration', desc: 'Select dates and see verified real-time availability.' },
            { step: '3', title: 'Pick Up Your Gear', desc: 'Collect directly or coordinate delivery with the supplier.' },
            { step: '4', title: 'Return the Gear', desc: 'Handback equipment on return date to get deposit refund.' },
          ].map((item, idx) => (
            <div key={idx} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-3 relative overflow-hidden group hover:border-brand-400 transition duration-300">
              <span className="text-3xl font-extrabold text-brand-100 group-hover:text-brand-300 transition duration-300 block">{item.step}</span>
              <h3 className="text-sm font-bold text-slate-800">{item.title}</h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 9. Client Logo Wall */}
      <div className="max-w-7xl mx-auto px-4 py-6 text-center space-y-4">
        <p className="text-[10px] text-slate-400 uppercase font-extrabold tracking-widest">Our Vetted Partners & Clients</p>
        <div className="flex flex-wrap justify-center gap-8 items-center opacity-40 grayscale hover:opacity-75 transition-all">
          {['Amazon', 'Netflix', 'Google', 'Byjus', 'HP', 'Disney', 'Warner Bros'].map((c) => (
            <span key={c} className="text-sm font-black text-slate-500 font-mono tracking-wider">{c}</span>
          ))}
        </div>
      </div>

      {/* 10. Client Testimonials */}
      <div className="max-w-7xl mx-auto px-4 space-y-8">
        <div className="text-center space-y-1">
          <h2 className="text-xl font-extrabold text-slate-900 font-sans">Client Testimonials</h2>
          <p className="text-xs text-slate-500">Read what professional filmmakers say about us.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              quote: "“CineRent completely solved our last-minute lens availability crisis for our commercial shoot. The Sony GM zoom lenses arrived fully calibrated, clean, and exact on schedule. Outstanding service!”",
              author: "Sarah Jenkins",
              role: "Director of Photography, Visuals Co.",
              rating: 5,
            },
            {
              quote: "“The double-booking date checker is bulletproof. I rented a RED Komodo pack for overlapping dates across two local sets, and everything transitioned without a single inventory double-booking glitch.”",
              author: "Michael Chang",
              role: "Creative Director, Studio Eight",
              rating: 5,
            },
          ].map((t, idx) => (
            <div key={idx} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex gap-1">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed italic">{t.quote}</p>
              <div>
                <p className="text-xs font-bold text-slate-800">{t.author}</p>
                <p className="text-[10px] text-slate-500">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>



    </div>
  );
}

function GridIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="7" height="7" x="3" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="14" rx="1" />
      <rect width="7" height="7" x="3" y="14" rx="1" />
    </svg>
  );
}
