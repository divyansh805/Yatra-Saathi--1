import React from 'react';
import { Compass, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';

export const HowItWorksSection: React.FC = () => {
  const { setCurrentPage, user } = useApp();

  const steps = [
    {
      number: '01',
      title: 'Tell Us About Your Journey',
      description: 'Choose destination, dates and travel requirements.',
      icon: Compass,
      tag: 'Step 1: Input',
    },
    {
      number: '02',
      title: 'Get Practical Insights',
      description:
        'Receive organized information about accommodation, destination requirements and important travel details.',
      icon: Sparkles,
      tag: 'Step 2: Synthesis',
    },
    {
      number: '03',
      title: 'Travel Prepared',
      description:
        'Follow your personalized checklist and verify important arrangements before travelling.',
      icon: CheckCircle2,
      tag: 'Step 3: Confidence',
    },
  ];

  return (
    <section className="py-24 bg-white relative border-y border-stone-200/80 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="text-teal-800 font-bold text-xs tracking-wider uppercase inline-block mb-3 px-3 py-1 rounded-full bg-teal-100/60 border border-teal-200">
            Simple 3-Step Process
          </span>
          <h2
            className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4"
            style={{ textWrap: 'balance' }}
          >
            How Yatra Saathi Works
          </h2>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            From initial thought to actual departure, we guide your travel preparation in three clear, stress-free stages.
          </p>
        </div>

        {/* Steps Grid with Visual Journey Connecting Path */}
        <div className="relative">
          {/* Desktop Visual Journey Connecting Path Line */}
          <div className="hidden lg:block absolute top-24 left-[16%] right-[16%] h-0.5 pointer-events-none -z-0">
            <div className="w-full h-full border-t-2 border-dashed border-teal-300" />
            <div className="absolute -top-1.5 left-1/3 w-3 h-3 rounded-full bg-teal-600 ring-4 ring-teal-100" />
            <div className="absolute -top-1.5 left-2/3 w-3 h-3 rounded-full bg-cyan-600 ring-4 ring-cyan-100" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.45, delay: idx * 0.12 }}
                  className="bg-[#FAF9F6] hover:bg-white rounded-2xl p-8 border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Step Badge & Icon Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-13 h-13 rounded-xl bg-white border border-teal-200 shadow-xs flex items-center justify-center text-teal-700">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-3xl font-extrabold font-display text-slate-300 tabular-nums">
                        {step.number}
                      </span>
                    </div>

                    <div className="text-xs font-bold text-teal-800 tracking-wide uppercase mb-2">
                      {step.tag}
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 mb-3">
                      {step.title}
                    </h3>

                    <p className="text-sm text-slate-600 leading-relaxed mb-6 font-normal">
                      {step.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-200/70 flex items-center text-xs font-semibold text-slate-500">
                    <span>Stage {idx + 1} of 3</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Bottom Action Prompter */}
        <div className="mt-16 text-center">
          <button
            onClick={() => setCurrentPage(user ? 'dashboard' : 'login')}
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl shadow-xs transition-all cursor-pointer group active:scale-98"
          >
            <span>Ready to plan? Get started with Yatra Saathi</span>
            <ArrowRight className="w-4 h-4 text-teal-300 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
};
