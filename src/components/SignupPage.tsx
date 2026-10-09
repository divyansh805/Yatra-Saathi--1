import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ArrowLeft, User, Mail, Phone, Globe, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Language } from '../types';
import loginImage from '../assets/images/login_journey_path_1790769243015.jpg';

export const SignupPage: React.FC = () => {
  const { setCurrentPage, setLanguage, loginUser, showToast } = useApp();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('en');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!fullName.trim()) {
      errs.fullName = 'Full name is required';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      errs.email = 'Email address is required';
    } else if (!emailRegex.test(email)) {
      errs.email = 'Please enter a valid email address';
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (!phone.trim()) {
      errs.phone = 'Phone number is required';
    } else if (cleanPhone.length < 10) {
      errs.phone = 'Please enter a valid 10-digit phone number';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Apply language preference
    setLanguage(selectedLanguage);

    // Save user session
    loginUser({
      name: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      preferredLanguage: selectedLanguage,
    });

    showToast('Welcome to Yatra Saathi!', 'success');
    setCurrentPage('smart-destination');
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-[#FAF9F6] flex items-center justify-center px-4 sm:px-6">
      <div className="max-w-5xl w-full bg-white rounded-3xl shadow-xl border border-slate-200/90 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[660px]">
          {/* LEFT: Branding & Traveler Assurance */}
          <div className="lg:col-span-5 relative bg-slate-950 overflow-hidden flex flex-col justify-between p-8 sm:p-10 text-white">
            <img
              src={loginImage}
              alt="Road stretching towards open horizon"
              className="absolute inset-0 w-full h-full object-cover object-center opacity-70"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-900/40" />

            <div className="relative z-10">
              <span className="text-teal-300 text-xs font-semibold uppercase tracking-wider">
                Traveler Membership
              </span>
              <h2 className="text-2xl font-display font-bold mt-2 text-white">
                Start Preparing with Confidence
              </h2>
            </div>

            <div className="relative z-10 space-y-4">
              <div className="space-y-2 text-sm text-slate-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>Personalized destination checklists</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>Unfiltered lodging ground reality</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>Verified route & transit procedures</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 text-xs text-slate-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-400" />
                <span>Zero spam · Instant access</span>
              </div>
            </div>
          </div>

          {/* RIGHT: Signup Form */}
          <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-between">
            <div>
              {/* Back to Home Button */}
              <div className="flex items-center justify-between mb-8">
                <button
                  onClick={() => setCurrentPage('home')}
                  className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-teal-700 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Home</span>
                </button>
              </div>

              {/* Headings */}
              <div className="mb-6">
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
                  Create Your Yatra Saathi Account
                </h1>
                <p className="text-sm text-slate-600 font-normal">
                  Join travelers who prepare thoroughly and explore fearlessly.
                </p>
              </div>

              {/* Signup Form */}
              <form onSubmit={handleSignup} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        if (errors.fullName) setErrors({ ...errors, fullName: '' });
                      }}
                      placeholder="e.g. Priya Sharma"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm text-slate-900 bg-slate-50/70 transition-all focus:outline-none focus:ring-2 ${
                        errors.fullName
                          ? 'border-rose-300 focus:ring-rose-500'
                          : 'border-slate-200 focus:ring-teal-500 focus:border-transparent'
                      }`}
                    />
                  </div>
                  {errors.fullName && <p className="text-xs text-rose-600 mt-1">{errors.fullName}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors({ ...errors, email: '' });
                      }}
                      placeholder="priya.sharma@example.com"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm text-slate-900 bg-slate-50/70 transition-all focus:outline-none focus:ring-2 ${
                        errors.email
                          ? 'border-rose-300 focus:ring-rose-500'
                          : 'border-slate-200 focus:ring-teal-500 focus:border-transparent'
                      }`}
                    />
                  </div>
                  {errors.email && <p className="text-xs text-rose-600 mt-1">{errors.email}</p>}
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (errors.phone) setErrors({ ...errors, phone: '' });
                      }}
                      placeholder="98765 43210"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm text-slate-900 bg-slate-50/70 transition-all focus:outline-none focus:ring-2 ${
                        errors.phone
                          ? 'border-rose-300 focus:ring-rose-500'
                          : 'border-slate-200 focus:ring-teal-500 focus:border-transparent'
                      }`}
                    />
                  </div>
                  {errors.phone && <p className="text-xs text-rose-600 mt-1">{errors.phone}</p>}
                </div>

                {/* Preferred Language (Optional) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Preferred Language (Optional)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedLanguage('en')}
                      className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        selectedLanguage === 'en'
                          ? 'bg-teal-50 border-teal-500 text-teal-800 shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Globe className="w-3.5 h-3.5 text-teal-600" />
                      <span>English</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedLanguage('hi')}
                      className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        selectedLanguage === 'hi'
                          ? 'bg-teal-50 border-teal-500 text-teal-800 shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Globe className="w-3.5 h-3.5 text-teal-600" />
                      <span>हिंदी</span>
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-semibold text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>

            {/* Bottom Link to Login */}
            <div className="pt-6 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-600">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setCurrentPage('login')}
                  className="font-bold text-teal-700 hover:text-teal-800 transition-colors underline decoration-teal-300 cursor-pointer"
                >
                  Login
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
