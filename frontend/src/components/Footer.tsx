import React from 'react';
import { Link } from 'react-router-dom';
import { Camera } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 pt-16 pb-8 border-t border-slate-900 mt-auto w-full text-xs">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-5 gap-8 pb-12 border-b border-slate-900">
        
        {/* Footer Logo & Brand */}
        <div className="md:col-span-2 space-y-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <Camera className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="font-extrabold text-base text-white tracking-tight">
              CameraRent
            </span>
          </Link>
          <p className="text-slate-500 leading-relaxed max-w-sm">
            CameraRent is a premium multivendor online marketplace where production crews can rent verified camera bodies, anamorphic lenses, lights, and grip support directly from local vetted suppliers.
          </p>
        </div>

        {/* Column 1: Rentals */}
        <div className="space-y-3">
          <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">Equipment</h4>
          <ul className="space-y-2">
            <li><Link to="/catalog?category=cameras" className="hover:text-white transition">Cameras</Link></li>
            <li><Link to="/catalog?category=lenses" className="hover:text-white transition">Lenses</Link></li>
            <li><Link to="/catalog?category=lights" className="hover:text-white transition">Lights</Link></li>
            <li><Link to="/catalog?category=audio" className="hover:text-white transition">Audio</Link></li>
          </ul>
        </div>

        {/* Column 2: Resources */}
        <div className="space-y-3">
          <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">Resources</h4>
          <ul className="space-y-2">
            <li><Link to="/policies" className="hover:text-white transition">T&C Policies</Link></li>
            <li><Link to="/policies" className="hover:text-white transition">Rental Policies</Link></li>
            <li><Link to="/faq" className="hover:text-white transition">Help FAQ</Link></li>
            <li><Link to="/vendor-onboarding" className="hover:text-white transition">Vendor Onboarding</Link></li>
          </ul>
        </div>

        {/* Column 3: Contact */}
        <div className="space-y-3">
          <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">Contact Info</h4>
          <p className="text-slate-500">CameraRent Operations Team</p>
          <p className="text-slate-500">Mumbai, Maharashtra, IN</p>
          <Link to="/contact" className="text-slate-300 font-semibold mt-1 block hover:text-brand-400">
            support@camerarent.com
          </Link>
        </div>

      </div>

      {/* Footer Bottom copyright bar */}
      <div className="max-w-7xl mx-auto px-6 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-slate-600">
        <p>© 2026 CameraRent Inc. All rights reserved.</p>
        <div className="flex gap-4">
          <Link to="/policies" className="hover:text-slate-400">Privacy Policy</Link>
          <Link to="/policies" className="hover:text-slate-400">Terms of Use</Link>
        </div>
      </div>
    </footer>
  );
}
