import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { apiRequest } from '../utils/api';
import { 
  User, ShieldCheck, Clock, Calendar, AlertTriangle, FileText, Send, RefreshCw, XCircle 
} from 'lucide-react';

export default function Dashboard() {
  const { user, refreshProfile } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [kycUrl, setKycUrl] = useState('');
  const [submittingKyc, setSubmittingKyc] = useState(false);

  // Cancellation request modal/inline state
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [submittingCancel, setSubmittingCancel] = useState(false);

  // Profile Edit State
  const [editProfileMode, setEditProfileMode] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    password: '',
  });
  const [submittingProfile, setSubmittingProfile] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  // Update profile form fields when user store value changes
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        password: '',
      });
    }
  }, [user]);

  const loadOrders = async () => {
    setLoadingOrders(true);
    try {
      const data = await apiRequest('/orders');
      setOrders(data);
    } catch (err) {
      console.error('Failed to load customer orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleKycSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kycUrl) return;

    setSubmittingKyc(true);
    try {
      await apiRequest('/auth/kyc', {
        method: 'PUT',
        body: JSON.stringify({ kycDocUrl: kycUrl }),
      });
      alert('KYC documents submitted successfully for review.');
      setKycUrl('');
      refreshProfile(); // refresh store status
    } catch (err: any) {
      alert(`KYC submission failed: ${err.message}`);
    } finally {
      setSubmittingKyc(false);
    }
  };

  const handleRequestCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancellingOrderId || !cancelReason) return;

    setSubmittingCancel(true);
    try {
      await apiRequest(`/orders/${cancellingOrderId}/cancel`, {
        method: 'POST',
        body: JSON.stringify({ reason: cancelReason }),
      });
      alert('Cancellation requested successfully.');
      setCancellingOrderId(null);
      setCancelReason('');
      loadOrders(); // reload
    } catch (err: any) {
      alert(`Request failed: ${err.message}`);
    } finally {
      setSubmittingCancel(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingProfile(true);
    try {
      await apiRequest('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({
          name: profileForm.name,
          email: profileForm.email,
          phone: profileForm.phone || null,
          password: profileForm.password || undefined,
        }),
      });
      alert('Profile details updated successfully!');
      setEditProfileMode(false);
      refreshProfile();
    } catch (err: any) {
      alert(`Update failed: ${err.message}`);
    } finally {
      setSubmittingProfile(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'PLACED': return 'bg-blue-50 text-blue-600 border border-blue-200';
      case 'APPROVED': return 'bg-indigo-50 text-indigo-600 border border-indigo-200';
      case 'DISPATCHED': return 'bg-cyan-50 text-cyan-600 border border-cyan-200';
      case 'ACTIVE': return 'bg-amber-50 text-amber-600 border border-amber-200 animate-pulse';
      case 'RETURNED': return 'bg-teal-50 text-teal-600 border border-teal-200';
      case 'COMPLETED': return 'bg-green-50 text-green-600 border border-green-200';
      case 'CANCELLED': return 'bg-red-50 text-red-600 border border-red-200';
      default: return 'bg-slate-50 text-slate-600 border border-slate-200';
    }
  };

  return (
    <div className="py-6 px-4 max-w-7xl mx-auto space-y-8 bg-slate-50 min-h-screen text-slate-800">
      {/* Dashboard Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200/60">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 font-sans">
            Customer Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">Manage KYC verification status, edit profile info, and track active bookings.</p>
        </div>
        <button
          onClick={() => { refreshProfile(); loadOrders(); }}
          className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-800 transition flex items-center gap-2 text-xs font-semibold cursor-pointer shadow-sm w-full sm:w-auto justify-center"
        >
          <RefreshCw className="w-4 h-4" /> Refresh Status
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Orders list */}
        <div className="lg:col-span-8 space-y-6">
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-brand-600" /> Booking History & Approvals
          </h2>

          {loadingOrders ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-40 bg-white animate-pulse rounded-2xl border border-slate-100 shadow-sm"></div>
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white text-center py-16 rounded-3xl border border-slate-100 shadow-sm p-6">
              <Clock className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-500">No rentals booked yet.</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Configure your gear, select dates, and complete checkout to see your bookings list here.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {orders.map((order) => (
                <div key={order.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-5">
                  {/* Order Top Bar */}
                  <div className="flex flex-wrap justify-between items-center gap-3 pb-4 border-b border-slate-100">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-brand-600 font-mono">#{order.orderNumber}</p>
                      <p className="text-[10px] text-slate-400">Placed: {new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2">
                      {order.cancellation && (
                        <span className="bg-red-50 text-red-600 border border-red-200 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">
                          Cancel: {order.cancellation.status}
                        </span>
                      )}
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${getStatusBadgeClass(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-4">
                    {order.items.map((item: any) => (
                      <div key={item.id} className="flex gap-4 items-center justify-between">
                        <div className="flex gap-3 items-center">
                          <img
                            src={item.product.images.split(',')[0]}
                            alt={item.product.name}
                            className="w-12 h-12 object-cover rounded-lg bg-slate-100 border border-slate-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-800 truncate">{item.product.name}</p>
                            <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <Calendar className="w-3.5 h-3.5" />
                              {new Date(item.startDate).toLocaleDateString()} — {new Date(item.endDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs font-bold text-slate-500">Qty: {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Summary Bottom */}
                  <div className="pt-4 border-t border-slate-100 flex justify-between items-center flex-wrap gap-4 text-xs">
                    <div>
                      <p className="text-slate-500">Delivery Address: <strong className="text-slate-800">{order.deliveryAddress}</strong></p>
                    </div>

                    {/* Cancellation Actions */}
                    {order.status !== 'CANCELLED' && order.status !== 'DISPATCHED' && order.status !== 'ACTIVE' && order.status !== 'COMPLETED' && !order.cancellation && (
                      <button
                        onClick={() => setCancellingOrderId(order.id)}
                        className="text-xs text-red-500 hover:text-red-600 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                      >
                        <XCircle className="w-4 h-4" /> Request Cancellation
                      </button>
                    )}
                  </div>

                  {/* Cancellation Form */}
                  {cancellingOrderId === order.id && (
                    <form onSubmit={handleRequestCancel} className="mt-4 p-4 rounded-2xl bg-red-50 border border-red-100 space-y-3">
                      <div>
                        <label className="block text-[10px] text-red-600 font-bold uppercase tracking-wider mb-2">
                          Reason for Cancellation
                        </label>
                        <textarea
                          value={cancelReason}
                          onChange={(e) => setCancelReason(e.target.value)}
                          placeholder="Please explain why you need to cancel this booking..."
                          rows={2}
                          className="w-full bg-white border border-red-200 px-3 py-2 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-red-500"
                          required
                        />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => setCancellingOrderId(null)}
                          className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-slate-200 transition"
                        >
                          Close
                        </button>
                        <button
                          type="submit"
                          disabled={submittingCancel}
                          className="bg-red-600 hover:bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                        >
                          Submit Request
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: KYC & Profile Cards */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* KYC Status card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <h3 className="font-extrabold text-base text-slate-800 flex items-center gap-2">
              <FileText className="w-5 h-5 text-brand-600" /> KYC Verification
            </h3>

            {user?.kycStatus === 'APPROVED' && (
              <div className="bg-green-50 border border-green-200 p-4 rounded-2xl space-y-3 text-center">
                <ShieldCheck className="w-10 h-10 text-green-600 mx-auto" />
                <div>
                  <h4 className="font-bold text-sm text-green-700">KYC Verified - Account Active</h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                    Your identity verification is complete. You have full access to rent and checkout equipment.
                  </p>
                </div>
              </div>
            )}

            {user?.kycStatus === 'PENDING' && (
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-2xl space-y-3 text-center">
                <Clock className="w-10 h-10 text-yellow-600 mx-auto animate-pulse" />
                <div>
                  <h4 className="font-bold text-sm text-yellow-700">Pending Review</h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                    Your KYC document has been uploaded and is being reviewed by the operations team. Standard review time takes &lt; 2 hours.
                  </p>
                </div>
              </div>
            )}

            {(user?.kycStatus === 'NONE' || user?.kycStatus === 'REJECTED') && (
              <div className="space-y-4">
                {user?.kycStatus === 'REJECTED' && (
                  <div className="bg-red-50 border border-red-200 p-3.5 rounded-2xl flex items-start gap-2 text-xs text-red-600">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <p><strong>KYC Rejected:</strong> Please re-upload a clear copy of your national identity card.</p>
                  </div>
                )}

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs text-slate-500 leading-normal space-y-2 font-medium">
                  <p className="text-slate-800 font-bold">Why is verification required?</p>
                  <p>High-end camera rental values can range from ₹80,000 to ₹12,00,000. Verification is a standard safety measure for rental businesses to protect against theft or fraud.</p>
                </div>

                <form onSubmit={handleKycSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">
                      National ID Image URL
                    </label>
                    <input
                      type="url"
                      value={kycUrl}
                      onChange={(e) => setKycUrl(e.target.value)}
                      placeholder="https://placehold.co/600x400/png?text=My+ID+Card"
                      className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-brand-500"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submittingKyc || !kycUrl}
                    className="w-full bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold py-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-brand-500/10"
                  >
                    <Send className="w-3.5 h-3.5" /> Submit for Approval
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Profile Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-base text-slate-800 flex items-center gap-2">
                <User className="w-5 h-5 text-brand-600" /> Profile Details
              </h3>
              {!editProfileMode && (
                <button
                  onClick={() => setEditProfileMode(true)}
                  className="text-xs font-bold text-brand-600 hover:text-brand-700 hover:underline"
                >
                  Edit Profile
                </button>
              )}
            </div>

            {editProfileMode ? (
              <form onSubmit={handleProfileUpdate} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-slate-800 focus:outline-none focus:border-brand-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-slate-800 focus:outline-none focus:border-brand-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1.5">Phone Number</label>
                  <input
                    type="text"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    placeholder="+919999999999"
                    className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-slate-800 focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1.5">New Password (leave empty to keep current)</label>
                  <input
                    type="password"
                    value={profileForm.password}
                    onChange={(e) => setProfileForm({ ...profileForm, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-slate-800 focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditProfileMode(false)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2.5 rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingProfile}
                    className="flex-1 bg-brand-600 hover:bg-brand-500 text-white font-bold py-2.5 rounded-xl shadow-md transition"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3.5 text-xs text-slate-600">
                <div className="flex justify-between py-1.5 border-b border-slate-50">
                  <span className="text-slate-400 font-medium">Name</span>
                  <span className="font-bold text-slate-800">{user?.name}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-50">
                  <span className="text-slate-400 font-medium">Email</span>
                  <span className="font-semibold text-slate-700 font-mono">{user?.email}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-50">
                  <span className="text-slate-400 font-medium">Phone</span>
                  <span className="font-bold text-slate-800">{user?.phone || 'Not Added'}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-400 font-medium">Account Role</span>
                  <span className="font-mono text-brand-600 font-bold uppercase tracking-wider">{user?.role}</span>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
