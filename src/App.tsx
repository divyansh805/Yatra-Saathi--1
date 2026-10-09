import React, { useState, useEffect } from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { FeaturesSection } from './components/FeaturesSection';
import { HowItWorksSection } from './components/HowItWorksSection';
import { TravelResourcesSection } from './components/TravelResourcesSection';
import { AboutPage } from './components/AboutPage';
import { ContactPage } from './components/ContactPage';
import { LoginPage } from './components/LoginPage';
import { SignupPage } from './components/SignupPage';
import { SmartDestinationPage } from './components/SmartDestinationPage';
import { HotelsPage } from './components/HotelsPage';
import { AITripPlannerPage } from './components/AITripPlannerPage';
import { ChecklistPage } from './components/ChecklistPage';
import { Footer } from './components/Footer';
import { Toast } from './components/Toast';

const GOOGLE_MAPS_API_KEY =
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY ||
  'AIzaSyB54RPXTlgnxZfIKbFYxOrgypoKS2qTdLI';

const AppContent: React.FC = () => {
  const { currentPage } = useApp();
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  useEffect(() => {
    const handleQuotaExceeded = () => {
      setQuotaExceeded(true);
    };
    window.addEventListener('gmp-quota-exceeded', handleQuotaExceeded);
    return () => {
      window.removeEventListener('gmp-quota-exceeded', handleQuotaExceeded);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-800 selection:bg-teal-500 selection:text-white">
      {/* Tier 1 & 2 Quota Defense Notice */}
      {quotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      {/* Global Top Navbar */}
      <Navbar />

      {/* Main Page Content Body */}
      <main className="flex-1">
        {currentPage === 'home' && (
          <>
            <Hero />
            <FeaturesSection />
            <HowItWorksSection />
            <TravelResourcesSection />
          </>
        )}

        {currentPage === 'about' && <AboutPage />}

        {currentPage === 'contact' && <ContactPage />}

        {currentPage === 'login' && <LoginPage />}

        {currentPage === 'signup' && <SignupPage />}

        {(currentPage === 'smart-destination' || currentPage === 'dashboard') && (
          <SmartDestinationPage />
        )}

        {currentPage === 'hotels' && <HotelsPage />}

        {currentPage === 'ai-trip-planner' && <AITripPlannerPage />}

        {currentPage === 'checklist' && <ChecklistPage />}
      </main>

      {/* Global Consistent Footer */}
      <Footer />

      {/* Interactive System Toast */}
      <Toast />
    </div>
  );
};

export default function App() {
  return (
    <APIProvider apiKey={GOOGLE_MAPS_API_KEY} libraries={['marker', 'places']}>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </APIProvider>
  );
}
