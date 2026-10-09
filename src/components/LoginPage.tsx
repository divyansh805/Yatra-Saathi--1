import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ArrowLeft, User, Mail, Phone, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import loginImage from '../assets/images/login_journey_path_1790769243015.jpg';

export const LoginPage: React.FC = () => {
  const { setCurrentPage, loginUser, showToast } = useApp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) {
      errs.name = 'Full name is required';
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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    loginUser({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
    });

    showToast(`Welcome back, ${name.trim()}!`, 'success');
    setCurrentPage('smart-destination');
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-[#FAF9F6] flex items-center justify-center px-4 sm:px-6">
      <div className="max-w-5xl w-full bg-white rounded-3xl shadow-xl border border-slate-200/90 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[620px]">
          {/* LEFT: Travel Image & Inspiring Quote */}
          <div className="lg:col-span-6 relative bg-slate-950 overflow-hidden flex flex-col justify-between p-8 sm:p-12 text-white">
            <img
              src={loginImage}
              alt="Misty mountain sunrise road"
              className="absolute inset-0 w-full h-full object-cover object-center opacity-70"
              referrerPolicy="no-referrer"
            />
            {/* Scrim */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-900/40" />

            {/* Top brand element on image */}
            <div className="relative z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-teal-300 text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Yatra Saathi Access</span>
              </span>
            </div>

            {/* Bottom Quote & Trust Indicator */}
            <div className="relative z-10 space-y-4">
              <div className="text-2xl sm:text-3xl font-display font-bold text-white leading-tight">
                “Every journey becomes easier when you know what lies ahead.”
              </div>
              <div className="flex items-center gap-2 text-xs text-teal-200/90 font-medium">
                <ShieldCheck className="w-4 h-4 text-teal-400" />
                <span>Encrypted verification · Zero spam · Traveler-first privacy</span>
              </div>
            </div>
          </div>

          {/* RIGHT: Login Card */}
          <div className="lg:col-span-6 p-8 sm:p-12 flex flex-col justify-between">
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
              <div className="mb-8">
                <h1 className="font-display text-3xl font-bold text-slate-900 mb-2">
                  Welcome Back
                </h1>
                <p className="text-sm text-slate-600 font-normal">
                  Continue planning your journey with Yatra Saathi.
                </p>
              </div>

              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (errors.name) setErrors({ ...errors, name: '' });
                      }}
                      placeholder="e.g. Rahul Singh"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm text-slate-900 bg-slate-50/70 transition-all focus:outline-none focus:ring-2 ${
                        errors.name
                          ? 'border-rose-300 focus:ring-rose-500'
                          : 'border-slate-200 focus:ring-teal-500 focus:border-transparent'
                      }`}
                    />
                  </div>
                  {errors.name && <p className="text-xs text-rose-600 mt-1">{errors.name}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Gmail / Email
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
                      placeholder="rahul.singh@example.com"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm text-slate-900 bg-slate-50/70 transition-all focus:outline-none focus:ring-2 ${
                        errors.email
                          ? 'border-rose-300 focus:ring-rose-500'
                          : 'border-slate-200 focus:ring-teal-500 focus:border-transparent'
                      }`}
                    />
                  </div>
                  {errors.email && <p className="text-xs text-rose-600 mt-1">{errors.email}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Phone Number
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

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-semibold text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <span>Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>

            {/* Bottom Link to Signup */}
            <div className="pt-6 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-600">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setCurrentPage('signup')}
                  className="font-bold text-teal-700 hover:text-teal-800 transition-colors underline decoration-teal-300 cursor-pointer"
                >
                  Create New Account
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
