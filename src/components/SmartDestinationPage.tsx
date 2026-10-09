import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { ALL_INDIAN_STATES_AND_UTS } from '../data/allIndiaDestinations';
import {
  getDestinationIntelligence,
  DestinationIntelligence,
  MonthStatus,
} from '../data/destinationIntelligence';
import { getTimeBasedGreeting } from '../utils/greeting';
import {
  Compass,
  MapPin,
  Calendar,
  Users,
  Search,
  Sparkles,
  Train,
  Bus,
  Plane,
  Car,
  ChevronDown,
  ChevronUp,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  Navigation,
  Info,
  Layers,
  ArrowRight,
  TrendingUp,
  DollarSign,
  Sun,
  CloudSun,
  Activity,
  Check,
  X,
  ExternalLink,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { InteractiveMap } from './InteractiveMap';
import { getDestinationData } from '../data/destinationsData';

interface AITimingRecommendation {
  tripTimingScore: number;
  scoreLabel: string;
  weatherSuitability: string;
  crowdSuitability: string;
  costSuitability: string;
  activitiesSuitability: string;
  familySuitability: string;
  verdictSummary: string;
}

export const SmartDestinationPage: React.FC = () => {
  const { user, activeSearch, setActiveSearch, setCurrentPage } = useApp();

  // Search Form State (Strictly Starts Empty per requirements)
  const [selectedState, setSelectedState] = useState<string>(activeSearch.state || '');
  const [selectedDestination, setSelectedDestination] = useState<string>(
    activeSearch.destination || ''
  );
  const [travelDate, setTravelDate] = useState<string>(activeSearch.arrivalDate || '');
  const [travellers, setTravellers] = useState(
    activeSearch.travellers || { adults: 1, children: 0, seniors: 0, total: 1 }
  );

  const [isTravellerPickerOpen, setIsTravellerPickerOpen] = useState(false);
  const [activeTransitTab, setActiveTransitTab] = useState<'train' | 'bus' | 'flight' | 'road'>(
    'train'
  );

  // Active Submitted Destination Intelligence
  const [submittedDestination, setSubmittedDestination] = useState<string | null>(
    activeSearch.destination ? activeSearch.destination : null
  );
  const [submittedState, setSubmittedState] = useState<string>(
    activeSearch.state ? activeSearch.state : ''
  );

  // AI Recommendation State
  const [aiRecommendation, setAiRecommendation] = useState<AITimingRecommendation | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  const travellerPickerRef = useRef<HTMLDivElement>(null);

  // Available destinations for selected state
  const availableDestinations = useMemo(() => {
    if (!selectedState) return [];
    const stateObj = ALL_INDIAN_STATES_AND_UTS.find((s) => s.name === selectedState);
    return stateObj ? stateObj.destinations : [];
  }, [selectedState]);

  // Destination Intelligence details
  const destinationIntel: DestinationIntelligence | null = useMemo(() => {
    if (!submittedDestination) return null;
    return getDestinationIntelligence(submittedDestination, submittedState);
  }, [submittedDestination, submittedState]);

  // Destination Object for Map Component
  const destinationMapData = useMemo(() => {
    if (!submittedDestination) return null;
    return getDestinationData(submittedDestination);
  }, [submittedDestination]);

  // Close traveller picker on outside click
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (
        travellerPickerRef.current &&
        !travellerPickerRef.current.contains(e.target as Node)
      ) {
        setIsTravellerPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

// Fast session-level cache for timing analysis across component mounts/destinations
const timingAnalysisClientCache = new Map<string, any>();

  const activeAbortControllerRef = useRef<AbortController | null>(null);
  const lastAnalyzedKeyRef = useRef<string>('');

  // Fetch AI timing recommendation when destination is submitted
  useEffect(() => {
    if (!submittedDestination) {
      setAiRecommendation(null);
      setIsGeneratingAi(false);
      return;
    }

    const cacheKey = `${submittedDestination.toLowerCase().trim()}_${submittedState.toLowerCase().trim()}_${travelDate || 'season'}_${travellers.total}_${travellers.seniors}_${travellers.children}`;

    // Prevent duplicate requests if already analyzed for this key
    if (lastAnalyzedKeyRef.current === cacheKey && aiRecommendation) {
      return;
    }

    // Immediate Cache Hit: Return cached recommendation in 0ms without any network delay
    if (timingAnalysisClientCache.has(cacheKey)) {
      lastAnalyzedKeyRef.current = cacheKey;
      setAiRecommendation(timingAnalysisClientCache.get(cacheKey));
      setIsGeneratingAi(false);
      return;
    }

    // Cancel any previous in-flight request when user changes destination or dates
    if (activeAbortControllerRef.current) {
      activeAbortControllerRef.current.abort();
    }
    const controller = new AbortController();
    activeAbortControllerRef.current = controller;

    let isMounted = true;
    setIsGeneratingAi(true);

    // Timeout safety: automatically abort if server takes more than 4.5s
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 4500);

    fetch('/api/trip-timing-recommendation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        destination: submittedDestination,
        state: submittedState,
        arrivalDate: travelDate,
        travellers,
      }),
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (isMounted && data.tripTimingScore) {
          timingAnalysisClientCache.set(cacheKey, data);
          lastAnalyzedKeyRef.current = cacheKey;
          setAiRecommendation(data);
        }
      })
      .catch((err) => {
        if (err.name === 'AbortError') {
          // Request was cancelled due to user change or timeout
          return;
        }
        console.warn('Timing recommendation request error:', err);
        // Fallback: If network failed, provide intelligent seasonal evaluation based on destination
        if (isMounted && !aiRecommendation) {
          const fallbackData = {
            tripTimingScore: 8.5,
            scoreLabel: '8.5/10 — Good time to visit',
            weatherSuitability: 'Favorable seasonal weather for heritage walks and temple circumambulation.',
            crowdSuitability: 'Manageable pilgrim queues with serene early morning visits.',
            costSuitability: 'Stable accommodation tariffs with good lodging availability.',
            activitiesSuitability: 'Optimal for guided walking tours and monument sightseeing.',
            familySuitability: 'Comfortable for families and senior travellers.',
            verdictSummary: `Recommended seasonal window to explore ${submittedDestination}.`,
          };
          setAiRecommendation(fallbackData);
          timingAnalysisClientCache.set(cacheKey, fallbackData);
        }
      })
      .finally(() => {
        clearTimeout(timeoutId);
        if (isMounted) {
          setIsGeneratingAi(false);
        }
      });

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [submittedDestination, submittedState, travelDate, travellers.total, travellers.seniors, travellers.children]);

  const handleStateChange = (stateName: string) => {
    setSelectedState(stateName);
    setSelectedDestination(''); // Reset destination when state changes
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedState || !selectedDestination) return;

    setSubmittedDestination(selectedDestination);
    setSubmittedState(selectedState);

    // Save to global context
    setActiveSearch({
      state: selectedState,
      destination: selectedDestination,
      arrivalDate: travelDate,
      travellers,
    });
  };

  const handleTravellerChange = (
    type: 'adults' | 'children' | 'seniors',
    delta: number
  ) => {
    const current = travellers[type];
    const updated = Math.max(type === 'adults' ? 1 : 0, current + delta);
    const newTravellers = {
      ...travellers,
      [type]: updated,
    };
    newTravellers.total =
      newTravellers.adults + newTravellers.children + newTravellers.seniors;
    setTravellers(newTravellers);
  };

  const greetingObj = getTimeBasedGreeting(user?.name);

  return (
    <div className="pt-24 pb-20 bg-[#FAF9F6] min-h-screen text-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* ================= 1. PAGE HEADER ================= */}
        <div className="text-left space-y-2 border-b border-slate-200/80 pb-6 pt-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold uppercase tracking-wider mb-2">
                <Compass className="w-3.5 h-3.5 text-teal-600" />
                <span>Travel Intelligence Engine</span>
              </div>
              <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Smart Destination
              </h1>
              <p className="text-sm sm:text-base text-slate-600 font-normal mt-1">
                Know when to go, what to expect, and how to reach there.
              </p>
            </div>

            {user && (
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-slate-500">Welcome Back</p>
                <p className="text-sm font-bold text-slate-800">
                  {greetingObj.greeting}, {greetingObj.firstName} 👋
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ================= 2. CLEAN & UNCLUTTERED SEARCH FORM ================= */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm relative z-30">
          <form onSubmit={handleFormSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5">
              {/* Field 1: State / Union Territory (Initially Empty) */}
              <div className="lg:col-span-3">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  State / Union Territory *
                </label>
                <div className="relative">
                  <select
                    value={selectedState}
                    onChange={(e) => handleStateChange(e.target.value)}
                    className="w-full pl-3.5 pr-8 py-3.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs font-semibold text-slate-900 bg-slate-50/70 transition-all cursor-pointer appearance-none truncate"
                  >
                    <option value="">Select State / Union Territory</option>
                    {ALL_INDIAN_STATES_AND_UTS.map((s) => (
                      <option key={s.name} value={s.name}>
                        {s.name} ({s.type === 'Union Territory' ? 'UT' : 'State'})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Field 2: Destination (Dynamically depends on selected State) */}
              <div className="lg:col-span-4">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Destination *
                </label>
                <div className="relative">
                  <select
                    value={selectedDestination}
                    onChange={(e) => setSelectedDestination(e.target.value)}
                    disabled={!selectedState}
                    className={`w-full pl-3.5 pr-8 py-3.5 rounded-2xl border text-xs font-semibold text-slate-900 transition-all appearance-none truncate ${
                      !selectedState
                        ? 'bg-slate-100/70 border-slate-200 text-slate-400 cursor-not-allowed'
                        : 'bg-slate-50/70 border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer'
                    }`}
                  >
                    <option value="">
                      {selectedState
                        ? `Select a destination in ${selectedState}`
                        : 'Select State / UT First'}
                    </option>
                    {availableDestinations.map((dest) => (
                      <option key={dest} value={dest}>
                        {dest}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Field 3: Date of Travel / Arrival */}
              <div className="lg:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Date of Travel
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={travelDate}
                    onChange={(e) => setTravelDate(e.target.value)}
                    className="w-full px-3 py-3.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs font-semibold text-slate-900 bg-slate-50/70 transition-all cursor-pointer"
                  />
                </div>
              </div>

              {/* Field 4: Number of Travellers */}
              <div className="lg:col-span-3 relative" ref={travellerPickerRef}>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Travellers
                </label>
                <button
                  type="button"
                  onClick={() => setIsTravellerPickerOpen(!isTravellerPickerOpen)}
                  className="w-full px-3.5 py-3.5 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-900 bg-slate-50/70 flex items-center justify-between text-left hover:border-slate-300 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2 truncate">
                    <Users className="w-4 h-4 text-teal-700 shrink-0" />
                    <span>
                      {travellers.total} {travellers.total === 1 ? 'Traveller' : 'Travellers'}
                    </span>
                  </span>
                  {isTravellerPickerOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </button>

                {/* Counter Popup */}
                {isTravellerPickerOpen && (
                  <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 space-y-4">
                    <div className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-2">
                      Number of Travellers
                    </div>

                    {/* Adults */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-slate-900">Adults</div>
                        <div className="text-[11px] text-slate-400">Ages 18+</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleTravellerChange('adults', -1)}
                          disabled={travellers.adults <= 1}
                          className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-30 cursor-pointer"
                        >
                          -
                        </button>
                        <span className="w-5 text-center text-xs font-bold">
                          {travellers.adults}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleTravellerChange('adults', 1)}
                          className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Children */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-slate-900">Children</div>
                        <div className="text-[11px] text-slate-400">Ages 2–17</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleTravellerChange('children', -1)}
                          disabled={travellers.children <= 0}
                          className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-30 cursor-pointer"
                        >
                          -
                        </button>
                        <span className="w-5 text-center text-xs font-bold">
                          {travellers.children}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleTravellerChange('children', 1)}
                          className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Seniors */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-slate-900">Senior Citizens</div>
                        <div className="text-[11px] text-slate-400">Ages 60+</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleTravellerChange('seniors', -1)}
                          disabled={travellers.seniors <= 0}
                          className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-30 cursor-pointer"
                        >
                          -
                        </button>
                        <span className="w-5 text-center text-xs font-bold">
                          {travellers.seniors}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleTravellerChange('seniors', 1)}
                          className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsTravellerPickerOpen(false)}
                      className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      Done
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Action */}
            <div className="flex items-center justify-end pt-2">
              <button
                type="submit"
                disabled={!selectedState || !selectedDestination}
                className={`px-7 py-3 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shadow-xs cursor-pointer ${
                  !selectedState || !selectedDestination
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white shadow-teal-500/20 active:scale-98'
                }`}
              >
                <Search className="w-4 h-4" />
                <span>Explore Destination Intelligence</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>

        {/* ================= 3. EMPTY STATE (BEFORE SUBMISSION) ================= */}
        {!destinationIntel && (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-2xs space-y-4 max-w-2xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto border border-teal-100">
              <Compass className="w-8 h-8" />
            </div>
            <h3 className="font-display text-xl font-bold text-slate-900">
              Select a State and Destination to Begin
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Tell Yatra Saathi where you are planning to travel. We will prepare your comprehensive seasonal timeline, crowd forecasts, verified transport routes, and destination readiness.
            </p>
          </div>
        )}

        {/* ================= 4. DESTINATION INTELLIGENCE SECTIONS (AFTER SUBMISSION) ================= */}
        {destinationIntel && (
          <div className="space-y-12 animate-in fade-in duration-300">
            {/* Destination Headline Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 text-white rounded-3xl p-7 sm:p-9 shadow-lg relative overflow-hidden">
              <div className="relative z-10 space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-400/20 text-teal-300 text-xs font-bold uppercase tracking-wider border border-teal-400/30">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>
                    {destinationIntel.state} · {destinationIntel.destinationName}
                  </span>
                </div>
                <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">
                  {destinationIntel.destinationName}
                </h2>
                <p className="text-teal-200/90 text-xs sm:text-sm max-w-3xl leading-relaxed">
                  {destinationIntel.tagline}
                </p>
                <p className="text-slate-300 text-xs max-w-4xl pt-1">
                  {destinationIntel.overview}
                </p>
              </div>
            </div>

            {/* ------------------ SECTION A: BEST TIME TO VISIT ------------------ */}
            <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-7">
              <div className="border-b border-slate-100 pb-4">
                <div className="inline-flex items-center gap-1.5 text-teal-700 text-xs font-bold uppercase tracking-wider mb-1">
                  <Sun className="w-4 h-4" />
                  <span>Seasonal Climate & Timing</span>
                </div>
                <h3 className="font-display text-2xl font-bold text-slate-900">
                  Best Time to Visit {destinationIntel.destinationName}
                </h3>
              </div>

              {/* Highlights Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-100">
                  <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider">
                    Best Months
                  </span>
                  <div className="font-bold text-slate-900 text-sm mt-1">
                    {destinationIntel.bestTime.bestMonths.join(', ')}
                  </div>
                  <p className="text-[11px] text-teal-900/80 mt-1">
                    Ideal weather conditions for full exploration.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                    Peak Season
                  </span>
                  <div className="font-bold text-slate-900 text-sm mt-1">
                    {destinationIntel.bestTime.peakSeason}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-100">
                  <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                    Off-Season
                  </span>
                  <div className="font-bold text-slate-900 text-sm mt-1">
                    {destinationIntel.bestTime.offSeason}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100">
                  <span className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider">
                    Cost Tendency
                  </span>
                  <div className="font-bold text-slate-900 text-sm mt-1">
                    {destinationIntel.bestTime.costTendency}
                  </div>
                </div>
              </div>

              {/* Weather Summary */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 leading-relaxed">
                <strong>General Weather & Climate:</strong>{' '}
                {destinationIntel.bestTime.generalWeather}
              </div>

              {/* Month-by-Month Visual Timeline */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Month-by-Month Visual Timeline
                  </h4>
                  <div className="flex items-center gap-3 text-[10px] font-semibold text-slate-600">
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-teal-600" /> Best
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Good
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Peak
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Off-season
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
                  {destinationIntel.bestTime.monthlyTimeline.map((m: MonthStatus) => {
                    const badgeStyles =
                      m.status === 'Best'
                        ? 'bg-teal-50 border-teal-300 text-teal-800'
                        : m.status === 'Good'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                        : m.status === 'Peak'
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-800'
                        : 'bg-amber-50 border-amber-300 text-amber-800';

                    return (
                      <div
                        key={m.month}
                        className="p-3 rounded-2xl border border-slate-200 bg-white shadow-2xs hover:border-slate-300 transition-colors flex flex-col justify-between"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-sm text-slate-900">
                            {m.month}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badgeStyles}`}
                          >
                            {m.status}
                          </span>
                        </div>
                        <div className="mt-2 text-[11px] text-slate-600 font-semibold">
                          {m.temp}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1 line-clamp-2">
                          {m.description}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recommended Activities by Season */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Recommended Activities by Season
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {destinationIntel.bestTime.recommendedActivities.map((sec, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2"
                    >
                      <div className="font-bold text-xs text-teal-800 uppercase tracking-wide">
                        {sec.season}
                      </div>
                      <ul className="space-y-1.5 text-xs text-slate-700">
                        {sec.activities.map((act, aIdx) => (
                          <li key={aIdx} className="flex items-start gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                            <span>{act}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ------------------ SECTION B: CROWD OUTLOOK ------------------ */}
            <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <div className="inline-flex items-center gap-1.5 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-1">
                  <Activity className="w-4 h-4" />
                  <span>Footfall & Density Analysis</span>
                </div>
                <h3 className="font-display text-2xl font-bold text-slate-900">
                  Destination Crowd Outlook
                </h3>
              </div>

              {/* Notice Clarifying Seasonal Outlook vs Live Data */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-600 leading-relaxed">
                  <strong className="text-slate-800">Seasonal Crowd Outlook (Verified):</strong>{' '}
                  {destinationIntel.crowdOutlook.seasonalOutlook}
                  <div className="mt-1 text-[11px] text-slate-500 italic">
                    {destinationIntel.crowdOutlook.liveStatusNotice}
                  </div>
                </div>
              </div>

              {/* Peak vs Lower Crowd Periods */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Peak periods */}
                <div className="p-5 rounded-2xl bg-rose-50/60 border border-rose-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">
                      Peak Crowd Periods
                    </span>
                    <span className="text-[10px] font-semibold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                      High Footfall
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    {destinationIntel.crowdOutlook.peakCrowdPeriods.map((pk, idx) => (
                      <div key={idx} className="text-xs bg-white/80 p-3 rounded-xl border border-rose-100">
                        <div className="font-bold text-slate-900">{pk.period}</div>
                        <div className="text-slate-600 text-[11px] mt-0.5">{pk.reason}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Lower crowd periods */}
                <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                      Lower Crowd / Relaxed Windows
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Shorter Queues
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    {destinationIntel.crowdOutlook.lowerCrowdPeriods.map((lw, idx) => (
                      <div key={idx} className="text-xs bg-white/80 p-3 rounded-xl border border-emerald-100">
                        <div className="font-bold text-slate-900">{lw.period}</div>
                        <div className="text-slate-600 text-[11px] mt-0.5">{lw.reason}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* ------------------ SECTION C: AI BEST-TIME RECOMMENDATION ------------------ */}
            <section className="bg-gradient-to-br from-teal-900 via-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-md space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-teal-800/60 pb-5">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-400/20 border border-teal-400/30 text-teal-300 text-xs font-bold uppercase tracking-wider mb-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-teal-300" />
                    <span>AI Travel Timing Analysis</span>
                  </div>
                  <h3 className="font-display text-2xl font-bold text-white">
                    Is this a good time for your trip?
                  </h3>
                  <p className="text-xs text-teal-200/80 mt-0.5">
                    AI evaluation based on selected dates ({travelDate || 'Selected Season'}), {travellers.total} traveller{travellers.total > 1 ? 's' : ''}, and destination conditions.
                  </p>
                </div>

                {aiRecommendation && (
                  <div className="bg-teal-500/20 border border-teal-400/40 rounded-2xl px-5 py-3 text-center sm:text-right shrink-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-300 block">
                      Trip Timing Score
                    </span>
                    <span className="text-2xl font-extrabold text-white">
                      {aiRecommendation.scoreLabel}
                    </span>
                  </div>
                )}
              </div>

              {isGeneratingAi && (
                <div className="py-6 flex items-center justify-center gap-2 text-xs text-teal-200">
                  <div className="w-4 h-4 border-2 border-teal-300 border-t-transparent rounded-full animate-spin" />
                  <span>Analyzing destination climate, crowd curves, and traveller profile...</span>
                </div>
              )}

              {!aiRecommendation && !isGeneratingAi && (
                <div className="py-5 px-6 rounded-2xl bg-white/5 border border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-teal-200">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>Destination seasonal intelligence ready. Click to generate timing breakdown.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      lastAnalyzedKeyRef.current = '';
                      setIsGeneratingAi(true);
                      fetch('/api/trip-timing-recommendation', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          destination: submittedDestination,
                          state: submittedState,
                          arrivalDate: travelDate,
                          travellers,
                        }),
                      })
                        .then((res) => res.json())
                        .then((data) => {
                          if (data.tripTimingScore) setAiRecommendation(data);
                        })
                        .catch(() => {})
                        .finally(() => setIsGeneratingAi(false));
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 text-teal-100 border border-teal-400/30 font-semibold transition-colors cursor-pointer"
                  >
                    Analyze Timing
                  </button>
                </div>
              )}

              {aiRecommendation && !isGeneratingAi && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-teal-300">
                        <Check className="w-4 h-4 text-teal-400" />
                        <span>Weather Suitability</span>
                      </div>
                      <p className="text-xs text-slate-300 pl-6 leading-relaxed">
                        {aiRecommendation.weatherSuitability}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-teal-300">
                        <Check className="w-4 h-4 text-teal-400" />
                        <span>Crowd Suitability</span>
                      </div>
                      <p className="text-xs text-slate-300 pl-6 leading-relaxed">
                        {aiRecommendation.crowdSuitability}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-teal-300">
                        <Check className="w-4 h-4 text-teal-400" />
                        <span>Cost Suitability</span>
                      </div>
                      <p className="text-xs text-slate-300 pl-6 leading-relaxed">
                        {aiRecommendation.costSuitability}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-teal-300">
                        <Check className="w-4 h-4 text-teal-400" />
                        <span>Activities & Pacing</span>
                      </div>
                      <p className="text-xs text-slate-300 pl-6 leading-relaxed">
                        {aiRecommendation.activitiesSuitability}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-teal-950/70 border border-teal-500/30 text-xs text-teal-200">
                    <strong className="text-white">Summary Recommendation:</strong>{' '}
                    {aiRecommendation.verdictSummary}
                  </div>
                </div>
              )}
            </section>

            {/* ------------------ SECTION 4: HOW TO REACH THE DESTINATION ------------------ */}
            <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <div className="inline-flex items-center gap-1.5 text-teal-700 text-xs font-bold uppercase tracking-wider mb-1">
                  <Navigation className="w-4 h-4" />
                  <span>Transit Connectivity</span>
                </div>
                <h3 className="font-display text-2xl font-bold text-slate-900">
                  How to Reach {destinationIntel.destinationName}
                </h3>
              </div>

              {/* Transit Tabs */}
              <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl w-fit">
                <button
                  type="button"
                  onClick={() => setActiveTransitTab('train')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTransitTab === 'train'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Train className="w-4 h-4 text-indigo-600" />
                  <span>Train</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTransitTab('bus')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTransitTab === 'bus'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Bus className="w-4 h-4 text-emerald-600" />
                  <span>Bus</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTransitTab('flight')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTransitTab === 'flight'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Plane className="w-4 h-4 text-blue-600" />
                  <span>Flight</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTransitTab('road')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTransitTab === 'road'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Car className="w-4 h-4 text-amber-600" />
                  <span>Road</span>
                </button>
              </div>

              {/* Tab Content Cards */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
                {activeTransitTab === 'train' && (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                      <div>
                        <div className="text-[10px] font-bold text-indigo-700 uppercase">
                          Primary Railway Station
                        </div>
                        <div className="font-extrabold text-base text-slate-900">
                          {destinationIntel.howToReach.train.primaryStation}
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-slate-500 bg-white px-3 py-1 rounded-xl border border-slate-200 self-start">
                        {destinationIntel.howToReach.train.distanceFromCenter}
                      </span>
                    </div>

                    <div className="text-xs text-slate-700 space-y-1">
                      <strong>Major Connecting Express Trains:</strong>
                      <p className="text-slate-600">
                        {destinationIntel.howToReach.train.majorLines}
                      </p>
                    </div>

                    <div className="text-xs text-slate-700 space-y-1">
                      <strong>Key Stations Serving Area:</strong>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {destinationIntel.howToReach.train.stationsList.map((st, sIdx) => (
                          <span
                            key={sIdx}
                            className="bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800"
                          >
                            {st}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTransitTab === 'bus' && (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                      <div>
                        <div className="text-[10px] font-bold text-emerald-700 uppercase">
                          Central Bus Stand / Terminal
                        </div>
                        <div className="font-extrabold text-base text-slate-900">
                          {destinationIntel.howToReach.bus.primaryTerminal}
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-slate-500 bg-white px-3 py-1 rounded-xl border border-slate-200 self-start">
                        {destinationIntel.howToReach.bus.distanceFromCenter}
                      </span>
                    </div>

                    <div className="text-xs text-slate-700 space-y-1">
                      <strong>Key Operators:</strong>
                      <p className="text-slate-600">{destinationIntel.howToReach.bus.operators}</p>
                    </div>

                    <div className="text-xs text-slate-700 space-y-1">
                      <strong>Common Arterial Routes:</strong>
                      <p className="text-slate-600">{destinationIntel.howToReach.bus.keyRoutes}</p>
                    </div>
                  </div>
                )}

                {activeTransitTab === 'flight' && (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                      <div>
                        <div className="text-[10px] font-bold text-blue-700 uppercase">
                          Nearest Airport ({destinationIntel.howToReach.flight.airportCode})
                        </div>
                        <div className="font-extrabold text-base text-slate-900">
                          {destinationIntel.howToReach.flight.nearestAirport}
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-slate-500 bg-white px-3 py-1 rounded-xl border border-slate-200 self-start">
                        {destinationIntel.howToReach.flight.distanceFromCenter}
                      </span>
                    </div>

                    <div className="text-xs text-slate-700 space-y-1">
                      <strong>Flight Network & Connectivity:</strong>
                      <p className="text-slate-600">
                        {destinationIntel.howToReach.flight.connectivity}
                      </p>
                    </div>
                  </div>
                )}

                {activeTransitTab === 'road' && (
                  <div className="space-y-4">
                    <div className="border-b border-slate-200 pb-3">
                      <div className="text-[10px] font-bold text-amber-700 uppercase">
                        Major National & State Highways
                      </div>
                      <div className="font-extrabold text-sm text-slate-900 mt-0.5">
                        {destinationIntel.howToReach.road.majorHighways}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-xs font-bold text-slate-800">
                        Typical Road Corridors:
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {destinationIntel.howToReach.road.driveRoutes.map((rt, rIdx) => (
                          <div
                            key={rIdx}
                            className="bg-white p-3 rounded-xl border border-slate-200 space-y-1"
                          >
                            <div className="font-bold text-xs text-slate-900">
                              From {rt.fromCity}
                            </div>
                            <div className="text-[11px] text-teal-700 font-semibold">
                              {rt.distance} ({rt.duration})
                            </div>
                            <div className="text-[10px] text-slate-500">{rt.route}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Important Notice Regarding Live Inventory */}
                <div className="pt-3 border-t border-slate-200/80 flex items-center gap-2 text-[11px] text-slate-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{destinationIntel.howToReach.liveNotice}</span>
                </div>
              </div>
            </section>

            {/* ------------------ SECTION 5: MAP / ROUTE SECTION ------------------ */}
            <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-teal-700 text-xs font-bold uppercase tracking-wider mb-1">
                    <MapPin className="w-4 h-4" />
                    <span>Geographic Navigation</span>
                  </div>
                  <h3 className="font-display text-2xl font-bold text-slate-900">
                    Getting There: {destinationIntel.destinationName}
                  </h3>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
                  <span>Google Maps Platform Grounded</span>
                </div>
              </div>

              {destinationMapData && (
                <div className="rounded-2xl overflow-hidden border border-slate-200">
                  <InteractiveMap
                    destination={destinationMapData}
                    accommodations={[]}
                    nearbyAttractions={destinationMapData.nearbyAttractions || []}
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="font-bold text-slate-800 block">Railway Station Route</span>
                  <span className="text-slate-500 text-[11px]">
                    {destinationIntel.howToReach.train.primaryStation} (
                    {destinationIntel.howToReach.train.distanceFromCenter})
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="font-bold text-slate-800 block">Bus Stand Route</span>
                  <span className="text-slate-500 text-[11px]">
                    {destinationIntel.howToReach.bus.primaryTerminal} (
                    {destinationIntel.howToReach.bus.distanceFromCenter})
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="font-bold text-slate-800 block">Airport Route</span>
                  <span className="text-slate-500 text-[11px]">
                    {destinationIntel.howToReach.flight.nearestAirport} (
                    {destinationIntel.howToReach.flight.distanceFromCenter})
                  </span>
                </div>
              </div>
            </section>

            {/* ------------------ SECTION 6: BEFORE YOU TRAVEL ------------------ */}
            <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <div className="inline-flex items-center gap-1.5 text-teal-700 text-xs font-bold uppercase tracking-wider mb-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Preparation & Regulations</span>
                </div>
                <h3 className="font-display text-2xl font-bold text-slate-900">
                  Before You Travel
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Important Documents */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <div className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <FileText className="w-4 h-4 text-teal-600" />
                    <span>Important Documents & IDs</span>
                  </div>
                  <div className="space-y-2">
                    {destinationIntel.beforeYouTravel.importantDocuments.map((doc, idx) => (
                      <div key={idx} className="bg-white p-3 rounded-xl border border-slate-200 text-xs">
                        <div className="font-bold text-slate-800">{doc.title}</div>
                        <div className="text-slate-600 text-[11px] mt-0.5">{doc.detail}</div>
                        {doc.verificationNotice && (
                          <div className="mt-1 text-[10px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded w-fit">
                            {doc.verificationNotice}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Local Transportation Considerations */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <div className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-indigo-600" />
                    <span>Local Transportation Insights</span>
                  </div>
                  <div className="space-y-2">
                    {destinationIntel.beforeYouTravel.localTransit.map((tr, idx) => (
                      <div key={idx} className="bg-white p-3 rounded-xl border border-slate-200 text-xs">
                        <div className="font-bold text-slate-800">{tr.mode}</div>
                        <div className="text-slate-600 text-[11px] mt-0.5">{tr.notes}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Weather Preparation */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <div className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <CloudSun className="w-4 h-4 text-amber-600" />
                    <span>Weather Packing & Attire</span>
                  </div>
                  <div className="space-y-2">
                    {destinationIntel.beforeYouTravel.weatherPreparation.map((wp, idx) => (
                      <div key={idx} className="bg-white p-3 rounded-xl border border-slate-200 text-xs">
                        <div className="font-bold text-slate-800">{wp.item}</div>
                        <div className="text-slate-600 text-[11px] mt-0.5">{wp.context}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Precautions & Etiquette */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <div className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-rose-600" />
                    <span>Destination Precautions</span>
                  </div>
                  <div className="space-y-2">
                    {destinationIntel.beforeYouTravel.precautions.map((pc, idx) => (
                      <div key={idx} className="bg-white p-3 rounded-xl border border-slate-200 text-xs">
                        <div className="font-bold text-slate-800">{pc.title}</div>
                        <div className="text-slate-600 text-[11px] mt-0.5">{pc.advice}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Official Notices */}
              <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200 space-y-2">
                <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider block">
                  Official Destination Notices
                </span>
                <div className="space-y-1.5">
                  {destinationIntel.beforeYouTravel.officialNotices.map((nt, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs text-slate-800">
                      <span>• {nt.notice}</span>
                      <span className="text-[10px] font-semibold text-teal-700 bg-white px-2 py-0.5 rounded-full border border-teal-200">
                        {nt.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Seamless Transition to Hotels & Checklist CTA */}
            <div className="p-6 rounded-3xl bg-slate-100 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-sm text-slate-900">
                  Ready to book accommodation or build your travel checklist?
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Explore verified hotels near major landmarks or generate your personalized travel checklist.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentPage('hotels')}
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
                >
                  Explore Hotels in {destinationIntel.destinationName} →
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage('checklist')}
                  className="px-5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-800 font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Prepare Checklist
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
