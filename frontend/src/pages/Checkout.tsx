import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, CheckCircle2, ShieldCheck, Mail, MessageSquare, AlertCircle } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { apiRequest } from '../utils/api';

export default function Checkout() {
  const { items, rentalTotal, depositTotal, taxTotal, grandTotal, clearCart, fetchCart } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [address, setAddress] = useState('');
  const [instructions, setInstructions] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderNum, setOrderNum] = useState('');

  useEffect(() => {
    // If not logged in, redirect
    if (!user) {
      navigate('/login');
      return;
    }
    // Fetch cart to sync state
    fetchCart();
  }, [user, navigate, fetchCart]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) {
      alert('Delivery address is required');
      return;
    }

    if (user?.kycStatus !== 'APPROVED') {
      alert('KYC Verification is required before placing rentals.');
      navigate('/dashboard');
      return;
    }

    setSubmitting(true);
    try {
      const result = await apiRequest('/orders/checkout', {
        method: 'POST',
        body: JSON.stringify({
          deliveryAddress: address,
          deliveryDetails: instructions,
        }),
      });

      setOrderNum(result.order.orderNumber);
      setSuccess(true);
      
      // Clear local cart store state
      useCartStore.setState({
        items: [],
        rentalTotal: 0,
        depositTotal: 0,
        taxTotal: 0,
        grandTotal: 0,
      });

    } catch (err: any) {
      alert(`Checkout failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Render Success Screen
  if (success) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center space-y-6">
        <div className="w-16 h-16 bg-green-500/10 border border-green-500/30 rounded-full flex items-center justify-center mx-auto text-green-400">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-100">Booking Confirmed!</h1>
          <p className="text-xs text-brand-400 font-mono font-semibold">Order: #{orderNum}</p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            Your booking has been placed and is currently awaiting administrative approval. A rental dispatch checklist will be sent prior to handover.
          </p>
        </div>

        {/* Mock WhatsApp Confirmation Alert */}
        <div className="glass-panel p-5 rounded-2xl border border-dark-border text-left space-y-3 bg-slate-950/40">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
            <MessageSquare className="w-4 h-4" /> WhatsApp Notification Sent
          </div>
          <div className="p-3 bg-dark-bg/60 border border-dark-border rounded-xl font-mono text-[10px] text-slate-300 leading-normal space-y-1.5">
            <p><strong>To:</strong> John Doe (Customer)</p>
            <p className="text-[11px] text-slate-200">
              "Hi John! Your CineRent booking <strong>#{orderNum}</strong> for total <strong>₹{grandTotal.toFixed(2)}</strong> (including ₹{depositTotal.toFixed(2)} deposit hold) has been registered. We'll update you once approved!"
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            to="/dashboard"
            className="flex-1 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold py-3.5 rounded-2xl shadow-lg transition"
          >
            Track Rentals in Dashboard
          </Link>
          <Link
            to="/"
            className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold py-3.5 rounded-2xl border border-dark-border transition"
          >
            Back to Catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 px-4 max-w-7xl mx-auto space-y-6">
      <Link to="/cart" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition font-medium">
        <ArrowLeft className="w-4 h-4" /> Back to Cart
      </Link>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Side: Delivery Details Form */}
        <form onSubmit={handleSubmit} className="w-full lg:col-span-8 glass-panel p-6 md:p-8 rounded-3xl border border-dark-border space-y-6 bg-slate-900/40">
          <h2 className="text-xl font-bold text-gray-200">Verification & Delivery Details</h2>

          {user?.kycStatus !== 'APPROVED' && (
            <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-2xl flex items-start gap-3 text-xs text-red-400 leading-relaxed">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold">KYC Verification Required</p>
                <p>Your KYC status is currently <strong>{user?.kycStatus || 'NONE'}</strong>. You must submit your ID and receive approval before rentals can be checked out.</p>
                <Link to="/dashboard" className="inline-block underline hover:text-red-300 font-bold mt-1">
                  Upload KYC Documents Now
                </Link>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] text-dark-muted font-bold uppercase tracking-wider mb-2">
                Handover / Delivery Address
              </label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter complete address for delivery/pickup coordination..."
                rows={3}
                className="w-full bg-dark-bg border border-dark-border px-4 py-3 rounded-2xl text-xs text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] text-dark-muted font-bold uppercase tracking-wider mb-2">
                Special Delivery Instructions (Optional)
              </label>
              <input
                type="text"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="E.g., call upon arrival, leave at production office reception"
                className="w-full bg-dark-bg border border-dark-border px-4 py-3 rounded-2xl text-xs text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition"
              />
            </div>
          </div>

          <div className="p-4 bg-slate-950/50 rounded-2xl border border-dark-border space-y-2 text-[10px] text-slate-500 leading-normal">
            <div className="flex items-center gap-1.5 text-slate-400 font-semibold mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-400" /> Identity Snapshot
            </div>
            <p>✔ Handover verification requires the customer to present the same original physical ID uploaded for KYC.</p>
            <p>✔ If third-party logistics/crew are picking up, written authority must be sent to the vendor via WhatsApp in advance.</p>
          </div>

          <button
            type="submit"
            disabled={submitting || user?.kycStatus !== 'APPROVED' || items.length === 0}
            className="w-full bg-brand-600 hover:bg-brand-500 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed text-white text-xs font-bold py-3.5 rounded-2xl shadow-lg transition cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Confirm Rental Booking & Authorize Deposit Hold
          </button>
        </form>

        {/* Right Side: Totals breakdown */}
        <div className="w-full lg:col-span-4 glass-panel p-6 rounded-3xl border border-dark-border space-y-6">
          <h3 className="font-bold text-base text-gray-200">Rentals Breakdown</h3>

          {/* Mini-list of items */}
          <div className="space-y-3 border-b border-dark-border pb-4">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between items-center text-xs">
                <div className="max-w-[70%]">
                  <p className="font-bold text-slate-300 line-clamp-1">{item.product.name}</p>
                  <p className="text-[10px] text-slate-500">
                    {item.rentalDays} days x {item.quantity} unit
                  </p>
                </div>
                <span className="font-semibold text-gray-200">₹{item.rentalCost.toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Rental Cost:</span>
              <span className="font-bold text-gray-200">₹{rentalTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>18% GST (Taxes):</span>
              <span className="font-bold text-gray-200">₹{taxTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-brand-400 font-bold border-b border-dashed border-dark-border pb-3">
              <span>Security Deposit (Authorize Hold):</span>
              <span>₹{depositTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-extrabold text-white pt-1">
              <span>Grand Total due:</span>
              <span>₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
