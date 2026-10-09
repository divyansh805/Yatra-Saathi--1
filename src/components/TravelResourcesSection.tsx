import React from 'react';
import { Bus, Train, Plane, Hotel, Map, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';

export const TravelResourcesSection: React.FC = () => {
  const resources = [
    {
      title: 'Bus Booking',
      category: 'Road Transit',
      icon: Bus,
      serviceName: 'RedBus',
      url: 'https://www.redbus.in/',
      description: 'Book intercity express buses, check live seat layouts, and route timings.',
    },
    {
      title: 'Train Booking',
      category: 'Rail Network',
      icon: Train,
      serviceName: 'IRCTC Official',
      url: 'https://www.irctc.co.in/',
      description: 'Check Indian Railways train schedules, seat availability, and reservation portals.',
    },
    {
      title: 'Flight Booking',
      category: 'Air Travel',
      icon: Plane,
      serviceName: 'Air India',
      url: 'https://www.airindia.com/',
      description: 'Explore domestic and international flight connections, baggage rules, and airfare.',
    },
    {
      title: 'Hotel Booking',
      category: 'Lodging & Stays',
      icon: Hotel,
      serviceName: 'Booking.com',
      url: 'https://www.booking.com/',
      description: 'Browse verified hotel ratings, room categories, cancellations, and guest feedback.',
    },
    {
      title: 'Maps & Navigation',
      category: 'Route Exploration',
      icon: Map,
      serviceName: 'Google Maps',
      url: 'https://www.google.com/maps',
      description: 'View terrain, live highway traffic, street views, and transit connections.',
    },
  ];

  return (
    <section className="py-24 bg-[#FAF9F6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-14">
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
            Useful Travel Resources
          </h2>
          <p className="text-base text-slate-600 font-normal">
            Useful resources for planning your journey across transit, accommodation, and navigation.
          </p>
        </div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          {resources.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.a
                key={item.title}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className="group bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md hover:border-teal-400 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-700 group-hover:bg-teal-50 group-hover:text-teal-700 transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-400">
                      External Link
                    </span>
                  </div>

                  <div className="text-[11px] font-bold text-teal-700 uppercase tracking-wide mb-1">
                    {item.category}
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-teal-700 transition-colors mb-2">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed mb-4 font-normal">
                    {item.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-700 group-hover:text-teal-700 transition-colors">
                  <span>Visit {item.serviceName}</span>
                  <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </motion.a>
            );
          })}
        </div>
      </div>
    </section>
  );
};
