import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Shield, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { apiRequest } from '../utils/api';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import DateRangePicker from '../components/DatePicker';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  specs: string; // JSON string
  dailyRate: number;
  weeklyRate: number;
  depositAmount: number;
  images: string;
  category: {
    name: string;
  };
  vendor: {
    name: string;
  };
  totalStock: number;
}

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addToCart } = useCartStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Rental Configuration
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Stock Availability State
  const [availableStock, setAvailableStock] = useState<number | null>(null);
  const [stockLoading, setStockLoading] = useState(false);
  const [stockError, setStockError] = useState<string | null>(null);

  // Fetch product detail
  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      try {
        const data = await apiRequest(`/products/${slug}`);
        setProduct(data);
      } catch (err: any) {
        setError(err.message || 'Product not found');
      } finally {
        setLoading(false);
      }
    }
    if (slug) loadProduct();
  }, [slug]);

  // Helper to format Date to YYYY-MM-DD
  const formatDateStr = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  // Fetch range-based stock availability whenever dates change
  useEffect(() => {
    async function checkRangeStock() {
      if (!product) return;
      if (!startDate || !endDate) {
        setAvailableStock(null);
        return;
      }
      setStockLoading(true);
      setStockError(null);
      try {
        const startStr = formatDateStr(startDate);
        const endStr = formatDateStr(endDate);
        const data = await apiRequest(`/products/${product.id}/stock-availability?startDate=${startStr}&endDate=${endStr}`);
        setAvailableStock(data.availableStock);
        // If current quantity is greater than available stock, automatically adjust it down (minimum 1)
        if (quantity > data.availableStock) {
          setQuantity(Math.max(1, data.availableStock));
        }
      } catch (err: any) {
        setStockError(err.message || 'Failed to check stock availability');
      } finally {
        setStockLoading(false);
      }
    }
    checkRangeStock();
  }, [startDate, endDate, product]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-4">
        <div className="text-red-500 font-bold text-lg">{error || 'Product not found'}</div>
        <Link to="/" className="inline-block text-brand-600 hover:underline">
          Return to Catalog
        </Link>
      </div>
    );
  }

  // Parse Specs
  let specsObj: { [key: string]: string } = {};
  try {
    specsObj = JSON.parse(product.specs);
  } catch (e) {
    console.error('Failed to parse specs:', e);
  }

  // Dynamic calculations for preview
  let diffDays = 0;
  let rentalCost = 0;
  let depositCost = 0;
  let taxCost = 0;
  let grandTotal = 0;

  if (startDate && endDate) {
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    let baseCost = 0;
    if (diffDays >= 7) {
      const weeks = Math.floor(diffDays / 7);
      const extraDays = diffDays % 7;
      baseCost = (weeks * product.weeklyRate) + (extraDays * product.dailyRate);
    } else {
      baseCost = diffDays * product.dailyRate;
    }

    rentalCost = baseCost * quantity;
    depositCost = product.depositAmount * quantity;
    taxCost = rentalCost * 0.18;
    grandTotal = rentalCost + depositCost + taxCost;
  }

  const handleBooking = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.kycStatus !== 'APPROVED') {
      alert('KYC Verification Required: Please submit your ID documentation in the dashboard and wait for approval before renting equipment.');
      navigate('/dashboard');
      return;
    }

    if (!startDate || !endDate) {
      alert('Please configure rental dates.');
      return;
    }

    setSubmitting(true);
    try {
      await addToCart(product.id, startDate, endDate, quantity);
      setSuccess(true);
      setTimeout(() => {
        navigate('/cart');
      }, 1500);
    } catch (err: any) {
      alert(`Booking failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-6 px-4 max-w-7xl mx-auto space-y-6 bg-slate-50">
      {/* Back Button */}
      <Link to="/catalog" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition font-semibold">
        <ArrowLeft className="w-4 h-4" /> Back to Catalog
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Media & Spec sheet */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl overflow-hidden aspect-video border border-slate-100 shadow-sm flex items-center justify-center">
            <img src={product.images.split(',')[0]} alt={product.name} className="object-cover w-full h-full" loading="lazy" />
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <h2 className="text-xl font-extrabold text-slate-800">Product Specifications</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(specsObj).map(([key, val]) => (
                <div key={key} className="bg-slate-50 border border-slate-100 px-4 py-3 rounded-2xl flex flex-col justify-between">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{key}</span>
                  <span className="text-sm font-semibold text-slate-800 mt-1">{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Setup config card */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6 relative">
            
            {/* Header info */}
            <div className="space-y-1">
              <span className="text-[10px] text-brand-600 font-extrabold uppercase tracking-widest block">
                {product.vendor.name}
              </span>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight font-sans">
                {product.name}
              </h1>
              <span className="inline-block mt-2 bg-slate-100 text-slate-700 text-xs px-3 py-1 rounded-full border border-slate-200/60 font-semibold">
                {product.category.name}
              </span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              {product.description}
            </p>

            {/* Inputs & Date Selection */}
            <div className="space-y-4 pt-4">
              <DateRangePicker
                productId={product.id}
                startDate={startDate}
                endDate={endDate}
                onChange={(start, end) => {
                  setStartDate(start);
                  setEndDate(end);
                }}
              />

              {stockError && (
                <div className="text-xs text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-100">
                  {stockError}
                </div>
              )}

              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Quantity
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={availableStock !== null && availableStock === 0}
                    className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 flex items-center justify-center font-bold"
                  >
                    -
                  </button>
                  <span className="text-sm font-bold w-4 text-center text-slate-800">
                    {availableStock !== null && availableStock === 0 ? 0 : quantity}
                  </span>
                  <button
                    onClick={() => {
                      if (availableStock !== null) {
                        setQuantity(Math.min(availableStock, quantity + 1));
                      } else {
                        setQuantity(quantity + 1);
                      }
                    }}
                    disabled={(availableStock !== null && quantity >= availableStock) || (availableStock !== null && availableStock === 0)}
                    className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 flex items-center justify-center font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Dynamic Booking Summary - No pricing */}
            {startDate && endDate && availableStock !== null && availableStock > 0 && (
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3 animate-fade-in text-xs">
                <h4 className="font-extrabold text-slate-800 border-b border-slate-250 pb-2">Booking Summary</h4>
                <div className="flex justify-between font-semibold text-slate-700">
                  <span>Selected Dates:</span>
                  <span>{new Date(startDate).toLocaleDateString()} — {new Date(endDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Duration:</span>
                  <span>{diffDays} days</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Quantity:</span>
                  <span>{quantity} unit{quantity > 1 ? 's' : ''}</span>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="space-y-3 pt-2">
              {user && user.kycStatus !== 'APPROVED' && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-2xl flex items-start gap-2.5 text-xs text-yellow-600 leading-relaxed">
                  <Shield className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>
                    <strong>KYC Submission Required:</strong> Please go to your{' '}
                    <Link to="/dashboard" className="underline hover:text-yellow-700 font-semibold">
                      dashboard
                    </Link>{' '}
                    to upload your ID card. Once approved, you can checkout rentals.
                  </p>
                </div>
              )}

              {success ? (
                <div className="w-full flex items-center justify-center gap-2 bg-green-600 text-white font-bold py-3.5 rounded-2xl shadow-md transition">
                  <CheckCircle2 className="w-5 h-5" /> Added! Redirecting...
                </div>
              ) : (
                <button
                  onClick={handleBooking}
                  disabled={submitting || !startDate || !endDate || stockLoading || (availableStock !== null && availableStock === 0)}
                  className="w-full bg-brand-600 hover:bg-brand-500 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-100 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-2xl shadow-md hover:scale-[1.01] active:scale-[0.99] border border-transparent transition cursor-pointer flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {stockLoading ? 'Verifying Dates...' : !startDate || !endDate ? 'Select Dates First' : (availableStock !== null && availableStock === 0 ? 'Unavailable' : 'Add to Rental Cart')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
