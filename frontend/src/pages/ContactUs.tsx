import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock } from 'lucide-react';

export default function ContactUs() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setName('');
    setEmail('');
    setSubject('');
    setMessage('');
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-12 bg-slate-50">
      
      {/* Header section */}
      <div className="text-center max-w-xl mx-auto space-y-3">
        <span className="bg-brand-100 text-brand-700 text-[10px] font-bold px-3 py-1.5 rounded-full border border-brand-200 uppercase tracking-wider">
          Support Center
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
          Contact CineRent Crew
        </h1>
        <p className="text-sm text-slate-500">
          Have questions about equipment deposits, logistics, or custom rental quotes? Drop us a line.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Contact Information Cards */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
            <h2 className="font-extrabold text-base text-slate-800">Support Directory</h2>

            <div className="space-y-4">
              {/* Item 1 */}
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-brand-600" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-800">General Support</h3>
                  <p className="text-xs text-slate-500 mt-0.5">For active order modifications & billing inquiries.</p>
                  <span className="text-xs text-brand-600 font-bold mt-1 block">support@cinerent.com</span>
                </div>
              </div>

              {/* Item 2 */}
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-brand-600" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-800">Hotline Helpline</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Speak with a local logistics dispatcher directly.</p>
                  <span className="text-xs text-brand-600 font-bold mt-1 block">+91 (022) 555-0199</span>
                </div>
              </div>

              {/* Item 3 */}
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-brand-600" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-800">Operations Hub</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Corporate headquarters & verification desk.</p>
                  <span className="text-xs text-slate-700 font-semibold mt-1 block">
                    Level 4, Cine Tower, Bandra West, Mumbai, MH, 400050
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex items-center gap-3">
            <Clock className="w-5 h-5 text-slate-400 shrink-0" />
            <div className="text-xs text-slate-500 leading-normal">
              <strong className="text-slate-800">Operating Hours:</strong> Mon — Sat, 9:00 AM to 7:00 PM IST. Emergency setup dispatchers on-call 24/7.
            </div>
          </div>

        </div>

        {/* Right Side: Working Contact Form */}
        <div className="lg:col-span-7 bg-white p-6 md:p-8 border border-slate-100 rounded-3xl shadow-sm space-y-6">
          <div className="space-y-1">
            <h2 className="font-extrabold text-lg text-slate-800">Send an Instant Message</h2>
            <p className="text-xs text-slate-500">We usually reply within 30 minutes during work hours.</p>
          </div>

          {submitted && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3.5 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fade-in">
              <MessageSquare className="w-4 h-4" /> Message sent successfully! Our crew will WhatsApp/email you shortly.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-brand-500"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-brand-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Custom corporate quote, bulk discount, etc."
                className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-brand-500"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Message Content</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us what equipment you need, dates, and logistics preference..."
                className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-brand-500 min-h-[120px]"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs py-3.5 rounded-xl shadow-md flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition cursor-pointer"
            >
              Send Message <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

    </div>
  );
}
