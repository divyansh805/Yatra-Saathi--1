import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ArrowLeft, Mail, Phone, MapPin, Instagram, Linkedin, Twitter, Send, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

export const ContactPage: React.FC = () => {
  const { setCurrentPage } = useApp();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setErrorMsg('Please fill in all required fields (Name, Email, Message).');
      return;
    }
    setErrorMsg('');
    setSubmitted(true);
  };

  const handleReset = () => {
    setFormData({ name: '', email: '', subject: '', message: '' });
    setSubmitted(false);
  };

  return (
    <div className="pt-28 pb-20 bg-[#FAF9F6] min-h-screen">
      {/* Top Bar Navigation */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <button
          onClick={() => setCurrentPage('home')}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-teal-700 transition-colors py-2 px-3 rounded-lg hover:bg-slate-200/60 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>
      </div>

      {/* Hero Header */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
        <span className="text-teal-800 text-xs font-bold tracking-wider uppercase inline-block mb-2 px-3 py-1 bg-teal-100/60 border border-teal-200 rounded-full">
          Connect With Us
        </span>
        <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
          We're Here to Help
        </h1>
        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
          Have a question, suggestion or feedback about Yatra Saathi? We'd love to hear from you.
        </p>
      </div>

      {/* Two Column Layout */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* LEFT: Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-5 bg-[#0B1528] text-white rounded-3xl p-8 sm:p-10 shadow-lg flex flex-col justify-between"
          >
            <div>
              <h2 className="font-display text-2xl font-bold mb-3 text-white">
                Contact Information
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed mb-8 font-normal">
                Our support and feedback desk is dedicated to improving travel preparation and sharing transparent destination guidance.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-300 shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 uppercase font-semibold">Email</div>
                    <a
                      href="mailto:support@yatrasaathi.com"
                      className="text-sm text-white font-medium hover:text-teal-300 transition-colors"
                    >
                      support@yatrasaathi.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-300 shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 uppercase font-semibold">Phone</div>
                    <div className="text-sm text-white font-medium">+91 XXXXX XXXXX</div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-300 shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 uppercase font-semibold">Location</div>
                    <div className="text-sm text-white font-medium">India</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Placeholders */}
            <div className="pt-8 mt-8 border-t border-slate-800">
              <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-3">
                Follow Updates
              </div>
              <div className="flex items-center gap-3">
                <a
                  href="#social-ig"
                  onClick={(e) => e.preventDefault()}
                  aria-label="Instagram"
                  className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-teal-600/30 border border-slate-700 hover:border-teal-400/50 flex items-center justify-center text-slate-300 hover:text-teal-300 transition-colors"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a
                  href="#social-li"
                  onClick={(e) => e.preventDefault()}
                  aria-label="LinkedIn"
                  className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-teal-600/30 border border-slate-700 hover:border-teal-400/50 flex items-center justify-center text-slate-300 hover:text-teal-300 transition-colors"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
                <a
                  href="#social-x"
                  onClick={(e) => e.preventDefault()}
                  aria-label="X Twitter"
                  className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-teal-600/30 border border-slate-700 hover:border-teal-400/50 flex items-center justify-center text-slate-300 hover:text-teal-300 transition-colors"
                >
                  <Twitter className="w-4 h-4" />
                </a>
              </div>
            </div>
          </motion.div>

          {/* RIGHT: Send Us a Message Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-7 bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/90 shadow-sm"
          >
            <h2 className="font-display text-2xl font-bold text-slate-900 mb-2">
              Send Us a Message
            </h2>
            <p className="text-sm text-slate-600 mb-8 font-normal">
              Fill in your inquiry details below. Our team reviews feedback for platform expansion.
            </p>

            {submitted ? (
              <div className="p-8 rounded-2xl bg-teal-50 border border-teal-200 text-center space-y-4 animate-in fade-in duration-300">
                <div className="w-14 h-14 bg-teal-600 text-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-teal-900">Message Received!</h3>
                <p className="text-teal-800 text-sm max-w-md mx-auto leading-relaxed">
                  Thank you! Your message has been recorded. Our team will get back to you shortly.
                </p>
                <div className="pt-2">
                  <button
                    onClick={handleReset}
                    className="px-5 py-2 text-xs font-semibold text-teal-800 bg-white border border-teal-300 rounded-lg hover:bg-teal-50 transition-colors cursor-pointer"
                  >
                    Send Another Inquiry
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {errorMsg && (
                  <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
                    {errorMsg}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Aditi Sharma"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm text-slate-900 placeholder:text-slate-400 bg-slate-50/70 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="aditi@example.com"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm text-slate-900 placeholder:text-slate-400 bg-slate-50/70 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Destination suggestion, hotel verification inquiry, etc."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm text-slate-900 placeholder:text-slate-400 bg-slate-50/70 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Message *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="How can Yatra Saathi assist you?"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm text-slate-900 placeholder:text-slate-400 bg-slate-50/70 transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <Send className="w-4 h-4 text-teal-400" />
                  <span>Send Message</span>
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};
