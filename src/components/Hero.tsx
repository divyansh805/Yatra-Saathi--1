import React from 'react';
import { useApp } from '../context/AppContext';
import { Compass, ArrowRight, MapPin, Home, CheckSquare, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

// Bright, natural, high-resolution scenic road photograph
import brightHeroImage from '../assets/images/hero_bright_travel_road_1790771219371.jpg';

export const Hero: React.FC = () => {
  const { setCurrentPage, user, t } = useApp();

  const handlePlanJourney = () => {
    setCurrentPage(user ? 'dashboard' : 'login');
  };

  const handleExplore = () => {
    const featuresEl = document.getElementById('features-section');
    if (featuresEl) {
      featuresEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden bg-slate-900 text-white">
      {/* Background Image Container: Full-coverage, seamless bright scenic travel photograph */}
      <div className="absolute inset-0 z-0">
        <img
          src={brightHeroImage}
          alt="Sunlit scenic highway curving through expansive green hills"
          className="w-full h-full object-cover object-center"
          referrerPolicy="no-referrer"
        />
        {/* Subtle, uniform overlay across the entire section ensuring sharp text contrast without cutting the image */}
        <div className="absolute inset-0 bg-slate-950/45" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/50 via-slate-950/30 to-slate-950/60" />
      </div>

      {/* Decorative Subtle Travel Route Path in background */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-20 z-0"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 800"
        fill="none"
      >
        <path
          d="M-50 400C250 200 450 650 720 400C990 150 1200 550 1500 350"
          stroke="url(#heroLineGradient)"
          strokeWidth="2.5"
          strokeDasharray="6 8"
        />
        <defs>
          <linearGradient id="heroLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0D9488" stopOpacity="0" />
            <stop offset="30%" stopColor="#14B8A6" stopOpacity="0.8" />
            <stop offset="70%" stopColor="#06B6D4" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      {/* Hero Content Container */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 text-center">
        {/* Small Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-900/80 border border-teal-400/40 text-teal-300 text-xs font-semibold tracking-wider uppercase mb-6 backdrop-blur-md shadow-xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-teal-400" />
          <span>{t('hero_eyebrow')}</span>
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-6 leading-[1.15] drop-shadow-sm"
          style={{ textWrap: 'balance' }}
        >
          Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-cyan-200 to-amber-200">Yatra Saathi</span>
        </motion.h1>

        {/* Description (2-3 lines on desktop) */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-3xl mx-auto text-base sm:text-lg md:text-xl text-slate-100 leading-relaxed font-normal mb-10 text-balance drop-shadow-xs"
        >
          {t('hero_subtitle')}
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          {/* Primary CTA */}
          <button
            onClick={handlePlanJourney}
            className="w-full sm:w-auto px-7 py-3.5 text-base font-semibold text-white bg-gradient-to-r from-teal-600 via-teal-500 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 rounded-xl shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 active:scale-98 transition-all flex items-center justify-center gap-2 group cursor-pointer"
          >
            <span>{t('hero_primary_cta')}</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
          </button>

          {/* Secondary CTA */}
          <button
            onClick={handleExplore}
            className="w-full sm:w-auto px-6 py-3.5 text-base font-medium text-slate-100 hover:text-white bg-slate-900/75 hover:bg-slate-800/90 border border-slate-600/80 rounded-xl backdrop-blur-md transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <span>{t('hero_secondary_cta')}</span>
            <Compass className="w-4 h-4 text-teal-300" />
          </button>
        </motion.div>

        {/* Three Animated Travel Information Cards with Sequential Load Entrance */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4.5 max-w-4xl mx-auto">
          {/* Card 1: Destination Guide (Entrance: Slight fade + slide upward) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45, ease: 'easeOut' }}
            className="group flex items-center gap-3.5 p-3.5 rounded-xl bg-slate-900/85 border border-slate-700/80 shadow-md backdrop-blur-md text-left hover:-translate-y-1.5 hover:shadow-xl hover:border-teal-400/60 transition-all duration-300 cursor-default"
          >
            <div className="w-10 h-10 rounded-lg bg-teal-950/80 border border-teal-500/40 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:border-teal-400 transition-all duration-300">
              <MapPin className="w-5 h-5 text-teal-300 group-hover:text-teal-200 transition-colors" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white group-hover:text-teal-200 transition-colors">
                Destination Guide
              </div>
              <div className="text-xs text-slate-300">Route & advisory readiness</div>
            </div>
          </motion.div>

          {/* Card 2: Stay Insights (Entrance: Fade + slide upward with small delay) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.62, ease: 'easeOut' }}
            className="group flex items-center gap-3.5 p-3.5 rounded-xl bg-slate-900/85 border border-slate-700/80 shadow-md backdrop-blur-md text-left hover:-translate-y-1.5 hover:shadow-xl hover:border-cyan-400/60 transition-all duration-300 cursor-default"
          >
            <div className="w-10 h-10 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:border-cyan-400 transition-all duration-300">
              <Home className="w-5 h-5 text-cyan-300 group-hover:text-cyan-200 transition-colors" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white group-hover:text-cyan-200 transition-colors">
                Stay Insights
              </div>
              <div className="text-xs text-slate-300">Ground reality of lodgings</div>
            </div>
          </motion.div>

          {/* Card 3: Travel Checklist (Entrance: Fade + slide upward with another small delay) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.79, ease: 'easeOut' }}
            className="group flex items-center gap-3.5 p-3.5 rounded-xl bg-slate-900/85 border border-slate-700/80 shadow-md backdrop-blur-md text-left hover:-translate-y-1.5 hover:shadow-xl hover:border-amber-400/60 transition-all duration-300 cursor-default"
          >
            <div className="w-10 h-10 rounded-lg bg-amber-950/80 border border-amber-500/40 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:border-amber-400 transition-all duration-300">
              <CheckSquare className="w-5 h-5 text-amber-300 group-hover:text-amber-200 transition-colors" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white group-hover:text-amber-200 transition-colors">
                Travel Checklist
              </div>
              <div className="text-xs text-slate-300">Verified documents & gear</div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
