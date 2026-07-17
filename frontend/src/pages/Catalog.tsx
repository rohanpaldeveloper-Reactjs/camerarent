import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Search, Calendar, ArrowLeft, Camera, Disc, Lightbulb, 
  Mic, Tv, Monitor, Battery, Cpu, Grid, ChevronRight
} from 'lucide-react';
import { apiRequest } from '../utils/api';

interface Category {
  id: string;
  name: string;
  slug: string;
}

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

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Read initial filter values from URL search parameters
  const categoryParam = searchParams.get('category') || 'all';
  const subcategoryParam = searchParams.get('subcategory') || 'All';
  const searchParam = searchParams.get('search') || '';
  const startParam = searchParams.get('startDate') || '';
  const endParam = searchParams.get('endDate') || '';

  // Local state sync with URL params
  const [search, setSearch] = useState(searchParam);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [selectedSubcategory, setSelectedSubcategory] = useState(subcategoryParam);
  const [startDate, setStartDate] = useState(startParam);
  const [endDate, setEndDate] = useState(endParam);

  // Sync state if URL changes
  useEffect(() => {
    setSearch(searchParams.get('search') || '');
    setSelectedCategory(searchParams.get('category') || 'all');
    setSelectedSubcategory(searchParams.get('subcategory') || 'All');
    setStartDate(searchParams.get('startDate') || '');
    setEndDate(searchParams.get('endDate') || '');
  }, [searchParams]);

  // Fetch Categories
  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await apiRequest('/products/categories');
        setCategories(data);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    }
    loadCategories();
  }, []);

  // Fetch products and update URL params when states change
  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      try {
        let queryParams: string[] = [];
        let urlParams: { [key: string]: string } = {};

        if (search) {
          queryParams.push(`search=${encodeURIComponent(search)}`);
          urlParams.search = search;
        }
        if (selectedCategory !== 'all') {
          queryParams.push(`category=${selectedCategory}`);
          urlParams.category = selectedCategory;

          if (selectedSubcategory !== 'All') {
            queryParams.push(`subcategory=${encodeURIComponent(selectedSubcategory)}`);
            urlParams.subcategory = selectedSubcategory;
          }
        }
        if (startDate) {
          queryParams.push(`startDate=${startDate}`);
          urlParams.startDate = startDate;
        }
        if (endDate) {
          queryParams.push(`endDate=${endDate}`);
          urlParams.endDate = endDate;
        }

        // Set URL Search Params to persist state
        setSearchParams(urlParams, { replace: true });

        const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
        const data = await apiRequest(`/products${queryString}`);
        setProducts(data);
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setLoading(false);
      }
    }

    const delayDebounce = setTimeout(() => {
      loadProducts();
    }, 200);

    return () => clearTimeout(delayDebounce);
  }, [search, selectedCategory, selectedSubcategory, startDate, endDate, setSearchParams]);

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('all');
    setSelectedSubcategory('All');
    setStartDate('');
    setEndDate('');
    setSearchParams({}, { replace: true });
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

  const getSubcategoriesForCategory = (slug: string) => {
    if (slug === 'cameras') {
      return ['All', 'Mirrorless Camera', 'Cinema Camera', 'Drone Camera', 'Action Camera'];
    }
    if (slug === 'lights') {
      return ['All', 'Continuous Lights', 'Strobe Lights', 'Accessories'];
    }
    return [];
  };

  return (
    <div className="space-y-8 bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 space-y-6">
        
        {/* Navigation Breadcrumb back to Home */}
        <Link to="/" className="inline-flex items-center gap-2 text-xs text-slate-500 hover:text-slate-800 transition font-bold">
          <ArrowLeft className="w-4 h-4" /> Back to Homepage
        </Link>

        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-slate-900 font-sans tracking-tight">
            Equipment Rental Catalog
          </h1>
          <p className="text-xs text-slate-500">
             Browse our vetted multivendor gear list. Configure dates to verify live availability.
          </p>
        </div>

        {/* 1. Category Selector */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex items-center justify-between overflow-x-auto gap-4 scrollbar-none">
          <button
            onClick={() => { setSelectedCategory('all'); setSelectedSubcategory('All'); }}
            className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition min-w-[70px] cursor-pointer ${
              selectedCategory === 'all' ? 'bg-brand-50 border border-brand-200' : 'hover:bg-slate-50 border border-transparent'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
              <Grid className="w-5 h-5 text-slate-700" />
            </div>
            <span className="text-xs font-bold text-slate-700">All Gear</span>
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => { setSelectedCategory(cat.slug); setSelectedSubcategory('All'); }}
              className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition min-w-[80px] cursor-pointer ${
                selectedCategory === cat.slug ? 'bg-brand-50 border border-brand-200' : 'hover:bg-slate-50 border border-transparent'
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                {getCategoryIcon(cat.slug)}
              </div>
              <span className="text-xs font-bold text-slate-700">{cat.name}</span>
            </button>
          ))}

          {/* Static categories */}
          {['Monitors', 'Rigs', 'Batteries'].map((catName) => (
            <button
              key={catName}
              onClick={() => { setSelectedCategory(catName.toLowerCase()); setSelectedSubcategory('All'); }}
              className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition min-w-[80px] cursor-pointer ${
                selectedCategory === catName.toLowerCase() ? 'bg-brand-50 border border-brand-200' : 'hover:bg-slate-50 border border-transparent'
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                {catName === 'Monitors' ? <Monitor className="w-5 h-5 text-slate-700" /> :
                 catName === 'Rigs' ? <Tv className="w-5 h-5 text-slate-700" /> :
                 <Battery className="w-5 h-5 text-slate-700" />}
              </div>
              <span className="text-xs font-bold text-slate-700">{catName}</span>
            </button>
          ))}
        </div>

        {/* Subcategory Selector (Pills) */}
        {selectedCategory !== 'all' && getSubcategoriesForCategory(selectedCategory).length > 0 && (
          <div className="flex flex-wrap gap-2 py-1 items-center">
            {getSubcategoriesForCategory(selectedCategory).map((sub) => (
              <button
                key={sub}
                onClick={() => setSelectedSubcategory(sub)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-150 cursor-pointer ${
                  selectedSubcategory === sub
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-200/80 text-slate-700 hover:bg-slate-300/80'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        )}

        {/* 2. Filter Bar */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Sony FX3, RED, prime lenses..."
              className="w-full bg-slate-50 border border-slate-200 pl-11 pr-4 py-3 rounded-2xl text-xs focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-slate-800 transition"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-bold uppercase">Rent Dates:</span>
              <input
                type="date"
                value={startDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-[11px] text-slate-700 focus:outline-none focus:border-brand-500"
              />
              <span className="text-slate-400">—</span>
              <input
                type="date"
                value={endDate}
                min={startDate || new Date().toISOString().split('T')[0]}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-[11px] text-slate-700 focus:outline-none focus:border-brand-500"
              />
            </div>
            {(selectedCategory !== 'all' || search !== '' || startDate !== '' || endDate !== '') && (
              <button
                onClick={clearFilters}
                className="text-xs text-red-500 hover:text-red-600 font-bold hover:underline cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* 3. Product Catalog Grid */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-extrabold text-slate-900 font-sans">
              Showing {products.length} Gear Items
            </h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="h-64 bg-white border border-slate-100 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 bg-white border border-slate-100 rounded-3xl p-6">
              <p className="text-slate-500 font-semibold text-sm">No equipment matching the filter settings was found.</p>
              <button onClick={clearFilters} className="text-brand-600 hover:underline font-bold text-xs mt-2 cursor-pointer">
                Clear search criteria
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {products.map((product) => (
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
                      loading="lazy"
                    />
                    <span className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-md text-[11px] text-white font-bold px-2 py-0.5 rounded-full border border-white/5 uppercase">
                      {product.category.name}
                    </span>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                    <div className="space-y-1">
                      <span className="text-xs text-brand-600 font-extrabold uppercase tracking-wider block">
                        {product.vendor.name}
                      </span>
                      <h3 className="font-extrabold text-xs text-slate-800 line-clamp-1 group-hover:text-brand-600 transition">
                        {product.name}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-50 flex justify-between items-center">
                      <span className="text-xs font-bold text-brand-600">Available for rent</span>
                      <span className="text-xs text-slate-400 font-bold flex items-center gap-0.5 group-hover:text-brand-600 transition">
                        Rent Gear <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
