import React from 'react';
import { useApp } from '../context/AppContext';
import { Logo } from './Logo';
import { ArrowLeft, CheckCircle2, MapPin, Building, ShieldCheck, HeartHandshake, Compass, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import aboutVisionImage from '../assets/images/about_vision_route_1790769257961.jpg';

export const AboutPage: React.FC = () => {
  const { setCurrentPage, user } = useApp();

  const featureBoxes = [
    {
      num: '01',
      title: 'Destination Checklist',
      description:
        'Know what documents, registrations, essentials and preparations may be required before your journey.',
      icon: MapPin,
      accentBg: 'bg-teal-50 border-teal-200 text-teal-700',
    },
    {
      num: '02',
      title: 'Ground Reality of Hotels',
      description:
        'Understand practical accommodation information such as location, surroundings, nearby facilities and traveler-reported details.',
      icon: Building,
      accentBg: 'bg-sky-50 border-sky-200 text-sky-700',
    },
    {
      num: '03',
      title: 'Travel Verification',
      description:
        'Find official sources and verification information before relying on booking channels or travel arrangements.',
      icon: ShieldCheck,
      accentBg: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    },
    {
      num: '04',
      title: 'Family-Friendly Travel',
      description:
        'Highlight practical information for families, senior citizens, children and accessibility needs.',
      icon: HeartHandshake,
      accentBg: 'bg-amber-50 border-amber-200 text-amber-700',
    },
  ];

  const scatteredSources = [
    'booking platforms',
    'maps',
    'reviews',
    'official websites',
    'travel blogs',
    'local sources',
  ];

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

      {/* Centered Hero Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-20">
        <div className="inline-flex justify-center mb-6">
          <Logo variant="dark" size="lg" />
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="font-display text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-6"
          style={{ textWrap: 'balance' }}
        >
          About Yatra Saathi
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-lg sm:text-xl text-slate-700 leading-relaxed font-normal text-balance"
        >
          Yatra Saathi is a travel assistance platform designed to make unfamiliar journeys easier
          to understand and prepare for. Instead of making travelers search across multiple platforms
          for accommodation information, destination requirements, travel procedures and practical
          insights, Yatra Saathi aims to bring these pieces together into one simple experience.
        </motion.p>
      </div>

      {/* Why Yatra Saathi Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-4">
              <span className="text-teal-800 text-xs font-bold tracking-wider uppercase px-2.5 py-1 bg-teal-50 border border-teal-200 rounded-md">
                The Problem We Solve
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900">
                Why Yatra Saathi?
              </h2>
              <p className="text-slate-600 leading-relaxed text-sm sm:text-base font-normal">
                Travel information is often scattered across:
              </p>
              <ul className="space-y-2.5 pt-2">
                {scatteredSources.map((source) => (
                  <li key={source} className="flex items-center gap-3 text-sm text-slate-700 font-medium capitalize">
                    <div className="w-5 h-5 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-200">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <span>{source}</span>
                  </li>
                ))}
              </ul>
              <p className="text-slate-800 font-semibold text-sm pt-4 border-t border-slate-100">
                Yatra Saathi aims to organize these pieces so travelers can make better-informed preparations before they leave.
              </p>
            </div>

            <div className="lg:col-span-6 bg-[#0B1528] rounded-2xl p-8 text-white shadow-md relative overflow-hidden">
              <div className="flex items-center gap-2 text-teal-300 text-xs font-bold uppercase tracking-wider mb-3">
                <Compass className="w-4 h-4 text-teal-400" />
                <span>Our Core Philosophy</span>
              </div>
              <h3 className="font-display text-xl sm:text-2xl font-bold mb-4 text-white leading-snug">
                “Preparation turns apprehension into adventure.”
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-6 font-normal">
                Whether travelling across cities, mountain corridors, coastal highways, or world destinations,
                every traveler deserves truthful ground reality, verified requirements, and calm certainty before embarking.
              </p>
              <div className="flex items-center gap-3 pt-4 border-t border-slate-800 text-xs text-slate-400 font-medium">
                <span>Designed for modern discovery</span>
                <span>·</span>
                <span>Transparent & Unbiased</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* EXACTLY 4 Main Feature Boxes */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-teal-800 text-xs font-bold tracking-wider uppercase px-2.5 py-1 bg-teal-50 border border-teal-200 rounded-md">
            Four Pillars
          </span>
          <h2 className="font-display text-3xl font-extrabold text-slate-900 mt-3">
            Our Four Foundational Pillars
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {featureBoxes.map((box, idx) => {
            const Icon = box.icon;
            return (
              <motion.div
                key={box.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="bg-white rounded-2xl p-8 border border-slate-200/90 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-5">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${box.accentBg}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-2xl font-display font-extrabold text-slate-300">
                    {box.num}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  {box.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed font-normal">
                  {box.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Our Vision Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="bg-[#0B1528] rounded-3xl text-white overflow-hidden shadow-xl border border-slate-800">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-6 p-8 sm:p-12 lg:p-14 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-950/80 border border-teal-500/40 text-teal-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                <span>Our Direction</span>
              </div>

              <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
                Our Vision
              </h2>

              <p className="text-lg sm:text-xl text-slate-100 leading-relaxed font-normal">
                “Make travel information more transparent, practical and accessible so that people can spend less time figuring out the journey and more time experiencing it.”
              </p>

              <div className="pt-4">
                <button
                  onClick={() => setCurrentPage(user ? 'dashboard' : 'login')}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold text-sm hover:from-teal-400 hover:to-cyan-400 shadow-md transition-all cursor-pointer active:scale-98"
                >
                  Join Yatra Saathi Today
                </button>
              </div>
            </div>

            {/* Right Aerial Route Visual */}
            <div className="lg:col-span-6 h-72 sm:h-96 lg:h-full relative overflow-hidden">
              <img
                src={aboutVisionImage}
                alt="Scenic travel highway route"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-[#0B1528] via-[#0B1528]/30 to-transparent" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
