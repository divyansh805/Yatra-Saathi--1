import React from 'react';
import { ClipboardCheck, Building2, ShieldCheck, Users, ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';

export const FeaturesSection: React.FC = () => {
  const { setCurrentPage, user } = useApp();

  const features = [
    {
      id: '01',
      title: 'Destination Checklist',
      icon: ClipboardCheck,
      description:
        'Know what you need before you leave — documents, registrations, essentials and destination-specific preparation.',
      accentBg: 'bg-teal-50 text-teal-700 border-teal-200/80',
      iconHover: 'group-hover:text-teal-600',
    },
    {
      id: '02',
      title: 'Ground Reality of Hotels',
      icon: Building2,
      description:
        "Understand where your accommodation actually is, what's nearby, and practical details that booking pages may not highlight.",
      accentBg: 'bg-sky-50 text-sky-700 border-sky-200/80',
      iconHover: 'group-hover:text-sky-600',
    },
    {
      id: '03',
      title: 'Travel Verification',
      icon: ShieldCheck,
      description:
        'Find official booking channels and important verification information before making travel arrangements.',
      accentBg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      iconHover: 'group-hover:text-emerald-600',
    },
    {
      id: '04',
      title: 'Family-Friendly Travel',
      icon: Users,
      description:
        'See travel information relevant to children, senior citizens and accessibility requirements.',
      accentBg: 'bg-amber-50 text-amber-700 border-amber-200/80',
      iconHover: 'group-hover:text-amber-600',
    },
  ];

  return (
    <section id="features-section" className="py-24 bg-[#FAF9F6] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="text-teal-800 font-bold text-xs tracking-wider uppercase inline-block mb-3 px-3 py-1 rounded-full bg-teal-100/60 border border-teal-200">
            Core Assistance Capabilities
          </span>
          <h2
            className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4"
            style={{ textWrap: 'balance' }}
          >
            Travel with clarity, not confusion.
          </h2>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            Travel information is often scattered across booking platforms, maps, reviews and official websites.
            Yatra Saathi brings these essential pieces together so you can prepare with confidence.
          </p>
        </div>

        {/* 4 Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.45, delay: index * 0.1 }}
                className="group relative bg-white rounded-2xl p-7 border border-slate-200/90 shadow-xs hover:shadow-md hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Card Header with Icon & Index */}
                  <div className="flex items-center justify-between mb-6">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-transform duration-300 group-hover:scale-105 ${feature.accentBg}`}
                    >
                      <Icon className={`w-6 h-6 transition-colors duration-300 ${feature.iconHover}`} />
                    </div>
                    <span className="text-xs font-bold text-slate-400 tabular-nums">
                      {feature.id}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-teal-700 transition-colors">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-slate-600 leading-relaxed font-normal">
                    {feature.description}
                  </p>
                </div>

                {/* Subtle Interactive Action Indicator */}
                <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 group-hover:text-teal-700 transition-colors">
                    Learn preparation insight
                  </span>
                  <button
                    onClick={() => setCurrentPage(user ? 'dashboard' : 'login')}
                    className="w-8 h-8 rounded-full bg-slate-50 group-hover:bg-teal-50 flex items-center justify-center text-slate-400 group-hover:text-teal-700 transition-colors cursor-pointer"
                    aria-label={`Prepare with ${feature.title}`}
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
