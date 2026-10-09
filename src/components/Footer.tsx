import React from 'react';
import { useApp } from '../context/AppContext';
import { Logo } from './Logo';
import { Page } from '../types';
import { Mail, Phone, MapPin, Instagram, Linkedin, Twitter, ArrowUp } from 'lucide-react';

export const Footer: React.FC = () => {
  const { setCurrentPage, user } = useApp();

  const handleNav = (page: Page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#0B1528] text-slate-400 border-t border-slate-800/80 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Column 1: Brand & Tagline */}
          <div className="lg:col-span-2 space-y-4">
            <div className="inline-block cursor-pointer" onClick={() => handleNav('home')}>
              <Logo variant="light" size="md" showTagline />
            </div>
            <p className="text-sm text-slate-300 max-w-sm leading-relaxed font-normal">
              Your companion for informed, prepared and confident travel. Bringing essential destination
              guidance, accommodation clarity, and travel verification into one seamless platform.
            </p>

            {/* Social Placeholders */}
            <div className="pt-2 flex items-center gap-3">
              <a
                href="#social"
                onClick={(e) => e.preventDefault()}
                aria-label="Instagram placeholder"
                className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-teal-300 hover:border-teal-500/50 transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="#social"
                onClick={(e) => e.preventDefault()}
                aria-label="LinkedIn placeholder"
                className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-teal-300 hover:border-teal-500/50 transition-colors"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="#social"
                onClick={(e) => e.preventDefault()}
                aria-label="X (Twitter) placeholder"
                className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-teal-300 hover:border-teal-500/50 transition-colors"
              >
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Navigation Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => handleNav('home')}
                  className="hover:text-teal-300 transition-colors text-left cursor-pointer"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('about')}
                  className="hover:text-teal-300 transition-colors text-left cursor-pointer"
                >
                  About Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('contact')}
                  className="hover:text-teal-300 transition-colors text-left cursor-pointer"
                >
                  Contact Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('login')}
                  className="hover:text-teal-300 transition-colors text-left cursor-pointer"
                >
                  Login
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav(user ? 'dashboard' : 'login')}
                  className="hover:text-teal-300 transition-colors text-left font-medium text-teal-300 cursor-pointer"
                >
                  Plan My Journey
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: External Demo Travel Resources */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Resources
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a
                  href="https://www.redbus.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-teal-300 transition-colors"
                >
                  Bus Booking
                </a>
              </li>
              <li>
                <a
                  href="https://www.irctc.co.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-teal-300 transition-colors"
                >
                  Train Booking
                </a>
              </li>
              <li>
                <a
                  href="https://www.airindia.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-teal-300 transition-colors"
                >
                  Flight Booking
                </a>
              </li>
              <li>
                <a
                  href="https://www.booking.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-teal-300 transition-colors"
                >
                  Hotels
                </a>
              </li>
              <li>
                <a
                  href="https://www.google.com/maps"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-teal-300 transition-colors"
                >
                  Maps & Navigation
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Support */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Contact & Support
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <a
                  href="mailto:support@yatrasaathi.com"
                  className="hover:text-teal-300 transition-colors break-all"
                >
                  support@yatrasaathi.com
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-teal-400 shrink-0" />
                <span>+91 XXXXX XXXXX</span>
              </li>
              <li className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Pan-India Travel Network</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Back to Top */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            © 2026 Yatra Saathi. All rights reserved.
          </div>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
};
