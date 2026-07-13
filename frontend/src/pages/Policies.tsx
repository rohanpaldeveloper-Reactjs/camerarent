import React from 'react';
import { ShieldCheck, CalendarRange, Scale, AlertOctagon, HelpCircle } from 'lucide-react';

export default function Policies() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-10 bg-slate-50">
      
      {/* Header */}
      <div className="space-y-3 border-b border-slate-200/60 pb-6">
        <h1 className="text-3xl font-extrabold text-slate-900 font-sans tracking-tight">
          CameraRent Terms & Policies
        </h1>
        <p className="text-sm text-slate-500">
          Last revised: July 2026. These rules establish terms of hire between Vendors, Customers, and CameraRent platform.
        </p>
      </div>

      <div className="space-y-8">
        
        {/* Section 1: Security Deposits */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex gap-3 items-center">
            <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-brand-600" />
            </div>
            <h2 className="font-extrabold text-base text-slate-800">1. Security Deposits & Holds</h2>
          </div>
          <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
            <p>
              Every equipment rental item requires a temporary security deposit to safeguard against missing parts, scratches, or late returns. 
              The exact deposit amount is computed dynamically and displayed on the checkout receipt.
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-500">
              <li>Holds are processed on dispatch day and are strictly authorization-only (not a debited charge).</li>
              <li>Upon gear return, the Vendor performs a technical check (calibration, optical testing, battery health).</li>
              <li>Once verified clear of damage, the authorization hold is fully released within <strong>24 business hours</strong>.</li>
            </ul>
          </div>
        </div>

        {/* Section 2: Rental Duration & Late Fees */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex gap-3 items-center">
            <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
              <CalendarRange className="w-5 h-5 text-brand-600" />
            </div>
            <h2 className="font-extrabold text-base text-slate-800">2. Rental Windows & Logistics</h2>
          </div>
          <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
            <p>
              Rental intervals are calculated on a calendar-day basis (inclusive of start and end dates):
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-500">
              <li><strong>Dispatch/Handover:</strong> Handover occurs at the Vendor operations hub starting at 9:00 AM on the rental start date.</li>
              <li><strong>Return Deadline:</strong> Gear must be returned to the same operations hub before 6:30 PM on the rental end date.</li>
              <li><strong>Late Handback Fee:</strong> Handbacks received after 7:00 PM on the scheduled return date will automatically trigger a late fee equivalent to 1.5x the item's standard Daily Rate.</li>
            </ul>
          </div>
        </div>

        {/* Section 3: Cancellation Requests */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex gap-3 items-center">
            <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
              <Scale className="w-5 h-5 text-brand-600" />
            </div>
            <h2 className="font-extrabold text-base text-slate-800">3. Cancellations & Refund Schedule</h2>
          </div>
          <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
            <p>
              We understand production timelines can shift. Cancellation refund levels are based on how early requests are made:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-center text-[11px]">
              <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl">
                <span className="block font-bold text-slate-700">48h+ Notice</span>
                <span className="text-xs font-black text-brand-600 block mt-1">100% Refund</span>
              </div>
              <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl">
                <span className="block font-bold text-slate-700">24h — 48h Notice</span>
                <span className="text-xs font-black text-amber-600 block mt-1">50% Refund</span>
              </div>
              <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl">
                <span className="block font-bold text-slate-700">&lt;24h Notice</span>
                <span className="text-xs font-black text-red-500 block mt-1">0% Refund</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Damage & Loss Claims */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex gap-3 items-center">
            <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
              <AlertOctagon className="w-5 h-5 text-brand-600" />
            </div>
            <h2 className="font-extrabold text-base text-slate-800">4. Damage, Damage Waivers, and Theft</h2>
          </div>
          <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
            <p>
              Customers are fully responsible for returning hired items in the exact condition they were received:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-500">
              <li><strong>Damage Assessment:</strong> Minor scuffs are logged on the pre-inspection check sheet and exempt. Internal sensor burns, lens scratches, housing cracks, or submersion damage will forfeit the security deposit.</li>
              <li><strong>Damage Waiver Protection:</strong> Customers can optionally purchase a Damage Waiver during booking checkout, limiting out-of-pocket damage liability to a maximum deductible of $150.00.</li>
              <li><strong>Loss / Theft:</strong> If items are lost, stolen, or vandalized, the customer must submit a police report (FIR) within 12 hours. The customer remains liable for the fair replacement cost of the missing items.</li>
            </ul>
          </div>
        </div>

      </div>

    </div>
  );
}
