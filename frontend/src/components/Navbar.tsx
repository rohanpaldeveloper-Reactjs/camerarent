import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Camera, Grid, BarChart2, ChevronDown, PhoneCall, Menu, X } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useCmsStore } from '../store/cmsStore';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const { items, fetchCart } = useCartStore();
  const { contents } = useCmsStore();
  const navigate = useNavigate();
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navMenu = [
    { label: 'Home', path: '/' },
    { label: 'Catalog', path: '/catalog' },
    { label: 'About Us', path: '/about' },
    { label: 'Contact', path: '/contact' }
  ];

  // Load cart count on mount / user change
  useEffect(() => {
    if (user) {
      fetchCart();
    }
  }, [user, fetchCart]);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const totalCartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 md:px-6 py-4 flex items-center justify-between shadow-sm">
      {/* Brand Logo */}
      <Link to="/" className="flex items-center gap-2 group shrink-0">
        <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-500 flex items-center justify-center shadow-md shadow-brand-500/20 group-hover:scale-105 transition-all">
          <Camera className="w-5 h-5 text-white" />
        </div>
        <span className="font-sans font-extrabold text-lg md:text-xl tracking-tight text-slate-800">
          Camera<span className="text-brand-600">Rent</span>
        </span>
      </Link>

      {/* Desktop Nav Links */}
      <div className="hidden lg:flex items-center gap-6">
        {navMenu.map((item: any, idx: number) => (
          <Link
            key={idx}
            to={item.path}
            className="text-sm text-slate-600 hover:text-brand-600 transition font-semibold"
          >
            {item.label}
          </Link>
        ))}

        {user && user.role === 'ADMIN' && (
          <Link to="/admin" className="flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-700 transition font-semibold">
            <BarChart2 className="w-4 h-4" />
            Admin
          </Link>
        )}

        {user && user.role === 'CUSTOMER' && (
          <Link to="/dashboard" className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-brand-600 transition font-semibold">
            <User className="w-4 h-4" />
            Dashboard
          </Link>
        )}
      </div>

      {/* Action Buttons & Hamburger */}
      <div className="flex items-center gap-3">
        {user ? (
          <>
            {/* Cart Button */}
            {user.role !== 'VENDOR' && (
              <Link to="/cart" className="relative p-2 rounded-xl hover:bg-slate-50 text-slate-600 hover:text-brand-600 transition-all">
                <ShoppingCart className="w-5 h-5" />
                {totalCartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-brand-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse-gentle">
                    {totalCartCount}
                  </span>
                )}
              </Link>
            )}

            {/* Profile Info - Desktop */}
            <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-slate-100">
              <div className="text-right">
                <p className="text-xs font-bold text-slate-800">{user.name}</p>
                <span className="text-[10px] text-brand-600 font-mono tracking-wider uppercase font-bold">{user.role}</span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-600 transition cursor-pointer"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </>
        ) : (
          <div className="hidden sm:flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-semibold text-slate-600 hover:text-slate-900 px-4 py-2 hover:bg-slate-50 rounded-xl transition"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-md shadow-brand-500/20 hover:scale-[1.02] transition"
            >
              Sign Up
            </Link>
          </div>
        )}

        {/* Mobile Menu Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl hover:bg-slate-50 text-slate-600 lg:hidden focus:outline-none transition cursor-pointer"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border-b border-slate-100 shadow-xl z-50 p-6 flex flex-col gap-6 lg:hidden animate-fade-in">
          {/* Main Links */}
          <div className="flex flex-col gap-4">
            {navMenu.map((item: any, idx: number) => (
              <Link
                key={idx}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-bold text-slate-700 hover:text-brand-600 transition"
              >
                {item.label}
              </Link>
            ))}

            {user && user.role === 'ADMIN' && (
              <Link 
                to="/admin" 
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 text-sm font-bold text-brand-600 hover:text-brand-700 transition"
              >
                <BarChart2 className="w-4 h-4" /> Admin
              </Link>
            )}

            {user && user.role === 'CUSTOMER' && (
              <Link 
                to="/dashboard" 
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-brand-600 transition"
              >
                <User className="w-4 h-4" /> Dashboard
              </Link>
            )}
          </div>

          {/* Auth links / Profile mobile */}
          <div className="pt-6 border-t border-slate-100 flex flex-col gap-3">
            {user ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-800">{user.name}</p>
                  <span className="text-[10px] text-brand-600 font-bold uppercase tracking-wider">{user.role}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 font-bold py-2 px-3 rounded-lg hover:bg-red-50 transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center text-xs font-bold text-slate-600 hover:text-slate-800 py-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 py-3 rounded-xl transition shadow-md"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
