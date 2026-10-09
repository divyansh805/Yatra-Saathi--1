import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Accommodation,
  AccommodationFilters,
  DestinationItem,
  DestinationLandmark,
  NearbyPlace,
  Restaurant,
  RestaurantFilters,
  TravellersCount,
} from '../types';
import {
  ALL_INDIAN_STATES_AND_UTS,
  INDIAN_DESTINATIONS,
  getDestinationData,
} from '../data/destinationsData';
import {
  enrichHotelsWithSelectedLandmark,
  enrichRestaurantsWithSelectedLandmark,
  filterAccommodations,
  filterRestaurants,
} from '../services/travelDataService';
import { getTimeBasedGreeting } from '../utils/greeting';
import { InteractiveMap } from './InteractiveMap';
import { GroundRealityModal } from './GroundRealityModal';
import { PlaceDetailModal } from './PlaceDetailModal';
import { RestaurantCard } from './RestaurantCard';
import { RestaurantModal } from './RestaurantModal';
import { MyJourneyDrawer } from './MyJourneyDrawer';
import {
  Search,
  Calendar,
  Users,
  MapPin,
  Star,
  Train,
  Bus,
  Plane,
  Flag,
  Phone,
  Mail,
  Globe,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  X,
  ExternalLink,
  ShieldCheck,
  Compass,
  ArrowRight,
  Info,
  Check,
  RotateCcw,
  UtensilsCrossed,
  Building,
  Bookmark,
  CheckSquare,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const DashboardPage: React.FC = () => {
  const {
    user,
    showToast,
    activeSearch,
    setActiveSearch,
    myJourney,
    toggleSaveHotel,
    isHotelSaved,
    setCurrentPage,
  } = useApp();

  // Active Tab: 'hotels' | 'restaurants'
  const [activeTab, setActiveTab] = useState<'hotels' | 'restaurants'>('hotels');

  // Search Hierarchy State (State -> Destination)
  const [selectedState, setSelectedState] = useState<string>(
    activeSearch.state || 'Jammu & Kashmir'
  );
  const [destinationQuery, setDestinationQuery] = useState<string>(
    activeSearch.destination || 'Vaishno Devi (Katra)'
  );
  const [selectedDestination, setSelectedDestination] = useState<DestinationItem>(() =>
    getDestinationData(activeSearch.destination || 'Vaishno Devi (Katra)')
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Landmark Selection State (DYNAMIC: User Chooses Landmark)
  const [selectedLandmark, setSelectedLandmark] = useState<DestinationLandmark | null>(() => {
    return selectedDestination.landmarks && selectedDestination.landmarks.length > 0
      ? selectedDestination.landmarks[0]
      : null;
  });

  // Date & Travellers State
  const todayStr = new Date().toISOString().split('T')[0];
  const [arrivalDate, setArrivalDate] = useState<string>(activeSearch.arrivalDate);
  const [travellers, setTravellers] = useState<TravellersCount>(activeSearch.travellers);
  const [isTravellerPickerOpen, setIsTravellerPickerOpen] = useState(false);

  // Search State
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(true);

  // Hotel Filters
  const [hotelFilters, setHotelFilters] = useState<AccommodationFilters>({
    priceRanges: [],
    types: [],
    minRating: null,
    facilities: [],
    proximity: [],
  });

  // Restaurant Filters
  const [restaurantFilters, setRestaurantFilters] = useState<RestaurantFilters>({
    foodTypes: [],
    priceLevels: [],
    minRating: null,
    cuisines: [],
    facilities: [],
    proximity: [],
  });

  // Mobile Filter Drawer Toggle
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Modals & Drawers
  const [selectedGroundRealityHotel, setSelectedGroundRealityHotel] = useState<Accommodation | null>(null);
  const [selectedNearbyPlace, setSelectedNearbyPlace] = useState<NearbyPlace | null>(null);
  const [contactModalHotel, setContactModalHotel] = useState<Accommodation | null>(null);
  const [selectedRestaurantModal, setSelectedRestaurantModal] = useState<Restaurant | null>(null);
  const [isMyJourneyDrawerOpen, setIsMyJourneyDrawerOpen] = useState(false);

  // Attraction sub-category filter
  const [selectedAttractionCategory, setSelectedAttractionCategory] = useState<string>('All');

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const travellerContainerRef = useRef<HTMLDivElement>(null);

  // Available destinations for the selected state
  const stateDestinations = useMemo(() => {
    const s = ALL_INDIAN_STATES_AND_UTS.find((item) => item.name === selectedState);
    return s ? s.destinations : [selectedDestination.name];
  }, [selectedState, selectedDestination.name]);

  // Listen for navbar tab switch events
  useEffect(() => {
    const handleTabSwitch = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail === 'hotels') {
        setActiveTab('hotels');
      }
    };
    window.addEventListener('nav-switch-tab', handleTabSwitch);
    return () => window.removeEventListener('nav-switch-tab', handleTabSwitch);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
      if (
        travellerContainerRef.current &&
        !travellerContainerRef.current.contains(e.target as Node)
      ) {
        setIsTravellerPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update selected destination & landmark when destinationQuery or active destination changes
  const applyDestinationChange = (dest: DestinationItem) => {
    setSelectedDestination(dest);
    setSelectedState(dest.state);
    setDestinationQuery(dest.name);

    const defaultLandmark = dest.landmarks && dest.landmarks.length > 0 ? dest.landmarks[0] : null;
    setSelectedLandmark(defaultLandmark);

    setActiveSearch((prev) => ({
      ...prev,
      state: dest.state,
      destination: dest.name,
      arrivalDate,
      travellers,
      selectedLandmarkId: defaultLandmark?.id,
    }));
  };

  const handleStateSelect = (newState: string) => {
    setSelectedState(newState);
    const s = ALL_INDIAN_STATES_AND_UTS.find((item) => item.name === newState);
    if (s && s.destinations.length > 0) {
      const firstDestName = s.destinations[0];
      const newDest = getDestinationData(firstDestName);
      applyDestinationChange(newDest);
    }
  };

  // Re-calculate hotels enriched with the user-selected landmark
  const isHilly = selectedDestination.climateType === 'cold' || selectedDestination.climateType === 'hilly';

  const enrichedHotels = useMemo(() => {
    return enrichHotelsWithSelectedLandmark(
      selectedDestination.accommodations,
      selectedLandmark,
      isHilly
    );
  }, [selectedDestination.accommodations, selectedLandmark, isHilly]);

  const filteredHotels = useMemo(() => {
    return filterAccommodations(enrichedHotels, hotelFilters, selectedLandmark);
  }, [enrichedHotels, hotelFilters, selectedLandmark]);

  // Re-calculate restaurants enriched with the user-selected landmark & active hotel
  const activeHotel = myJourney.savedHotel || (enrichedHotels.length > 0 ? enrichedHotels[0] : null);

  const enrichedRestaurants = useMemo(() => {
    return enrichRestaurantsWithSelectedLandmark(
      selectedDestination.restaurants,
      selectedLandmark,
      activeHotel,
      isHilly
    );
  }, [selectedDestination.restaurants, selectedLandmark, activeHotel, isHilly]);

  const filteredRestaurantsList = useMemo(() => {
    return filterRestaurants(enrichedRestaurants, restaurantFilters);
  }, [enrichedRestaurants, restaurantFilters]);

  // Handle Search Submission
  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!destinationQuery.trim()) {
      showToast('Please specify a destination in India.', 'error');
      return;
    }
    if (!arrivalDate) {
      showToast('Please select your date of arrival.', 'error');
      return;
    }

    setIsSearching(true);
    setIsDropdownOpen(false);
    setIsTravellerPickerOpen(false);

    try {
      const dest = getDestinationData(destinationQuery);
      applyDestinationChange(dest);
      setHasSearched(true);
      showToast(`Showing verified stays, dining, and landmarks for ${dest.name}.`, 'success');
    } catch {
      showToast('Error retrieving stays for destination.', 'error');
    } finally {
      setTimeout(() => {
        setIsSearching(false);
      }, 350);
    }
  };

  const updateTravellerCount = (
    key: 'adults' | 'children' | 'seniors',
    delta: number
  ) => {
    const currentVal = travellers[key];
    const newVal = Math.max(0, currentVal + delta);
    if (key === 'adults' && newVal === 0 && travellers.seniors === 0) {
      return;
    }
    const updated = {
      ...travellers,
      [key]: newVal,
    };
    updated.total = updated.adults + updated.children + updated.seniors;
    setTravellers(updated);
  };

  // Hotel Filter Toggles
  const toggleHotelFilter = (
    category: keyof AccommodationFilters,
    value: string | number
  ) => {
    if (category === 'minRating') {
      setHotelFilters((prev) => ({
        ...prev,
        minRating: prev.minRating === value ? null : (value as number),
      }));
    } else {
      setHotelFilters((prev) => {
        const arr = (prev[category] as string[]) || [];
        const exists = arr.includes(value as string);
        const newArr = exists
          ? arr.filter((x) => x !== value)
          : [...arr, value as string];
        return {
          ...prev,
          [category]: newArr,
        };
      });
    }
  };

  const clearAllHotelFilters = () => {
    setHotelFilters({
      priceRanges: [],
      types: [],
      minRating: null,
      facilities: [],
      proximity: [],
    });
    showToast('Hotel filters cleared.', 'info');
  };

  // Restaurant Filter Toggles
  const toggleRestaurantFilter = (
    category: keyof RestaurantFilters,
    value: string | number
  ) => {
    if (category === 'minRating') {
      setRestaurantFilters((prev) => ({
        ...prev,
        minRating: prev.minRating === value ? null : (value as number),
      }));
    } else {
      setRestaurantFilters((prev) => {
        const arr = (prev[category] as string[]) || [];
        const exists = arr.includes(value as string);
        const newArr = exists
          ? arr.filter((x) => x !== value)
          : [...arr, value as string];
        return {
          ...prev,
          [category]: newArr,
        };
      });
    }
  };

  const clearAllRestaurantFilters = () => {
    setRestaurantFilters({
      foodTypes: [],
      priceLevels: [],
      minRating: null,
      cuisines: [],
      facilities: [],
      proximity: [],
    });
    showToast('Restaurant filters cleared.', 'info');
  };

  // Filter destination suggestions based on autocomplete query
  const filteredSuggestions = useMemo(() => {
    const q = destinationQuery.toLowerCase().trim();
    if (!q) return INDIAN_DESTINATIONS;
    return INDIAN_DESTINATIONS.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.state.toLowerCase().includes(q) ||
        d.category.toLowerCase().includes(q)
    );
  }, [destinationQuery]);

  // Attractions filtered by category
  const filteredAttractions = useMemo(() => {
    if (selectedAttractionCategory === 'All') {
      return selectedDestination.nearbyAttractions;
    }
    return selectedDestination.nearbyAttractions.filter(
      (a) =>
        a.subCategory === selectedAttractionCategory ||
        a.category.toLowerCase().includes(selectedAttractionCategory.toLowerCase())
    );
  }, [selectedDestination.nearbyAttractions, selectedAttractionCategory]);

  const totalSavedCount =
    (myJourney.savedHotel ? 1 : 0) +
    myJourney.savedRestaurants.length +
    myJourney.savedPlaces.length +
    myJourney.savedLandmarks.length;

  return (
    <div className="pt-28 pb-24 bg-[#FAF9F6] min-h-screen text-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcoming Top Banner */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold uppercase tracking-wider mb-2">
                <Compass className="w-3.5 h-3.5 text-teal-600" />
                <span>Pan-India Destination Preparation</span>
              </div>
              <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                {user ? getTimeBasedGreeting(user.name).fullGreeting : 'Plan Your Journey'}
              </h1>
              <p className="text-base text-slate-600 mt-1 font-normal">
                {user
                  ? 'Ready to plan your next journey?'
                  : "Tell us where you're going, when you're arriving, and who's travelling with you."}
              </p>
            </div>

            {/* Quick Action Pill: My Journey Drawer & Checklist Link */}
            <div className="flex items-center gap-3 self-start sm:self-center">
              <button
                type="button"
                onClick={() => setIsMyJourneyDrawerOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-teal-400 text-xs font-bold text-slate-800 transition-colors cursor-pointer"
              >
                <Bookmark className="w-4 h-4 text-teal-600 fill-teal-600" />
                <span>My Journey ({totalSavedCount})</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentPage('checklist')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold hover:bg-teal-100 transition-colors cursor-pointer shadow-2xs"
              >
                <CheckSquare className="w-4 h-4 text-teal-700" />
                <span>Checklist</span>
              </button>
            </div>
          </div>
        </div>

        {/* 1. MAIN JOURNEY SEARCH FORM (STATE → DESTINATION → DATE → TRAVELLERS) */}
        <div id="smart-destination-section" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-md mb-8 relative z-30">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4">
              {/* Field 1: State / UT Selection (3 Cols) */}
              <div className="lg:col-span-3">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  State / Union Territory *
                </label>
                <div className="relative">
                  <select
                    value={selectedState}
                    onChange={(e) => handleStateSelect(e.target.value)}
                    className="w-full pl-3.5 pr-8 py-3.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs font-semibold text-slate-900 bg-slate-50/70 transition-all cursor-pointer appearance-none truncate"
                  >
                    {ALL_INDIAN_STATES_AND_UTS.map((s) => (
                      <option key={s.name} value={s.name}>
                        {s.name} ({s.type === 'Union Territory' ? 'UT' : 'State'})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Field 2: Destination Select / Autocomplete (4 Cols) */}
              <div className="lg:col-span-4 relative" ref={searchContainerRef}>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Where do you want to travel? *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-teal-700">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={destinationQuery}
                    onChange={(e) => {
                      setDestinationQuery(e.target.value);
                      setIsDropdownOpen(true);
                    }}
                    onFocus={() => setIsDropdownOpen(true)}
                    placeholder="Search a destination in India"
                    className="w-full pl-11 pr-10 py-3.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs font-semibold text-slate-900 bg-slate-50/70 transition-all"
                  />
                  {destinationQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setDestinationQuery('');
                        setIsDropdownOpen(true);
                      }}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Autocomplete Suggestions Dropdown */}
                {isDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 max-h-80 overflow-y-auto z-50 p-2 space-y-2">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 pt-1">
                      Destinations in {selectedState} & across India
                    </div>

                    {/* Pre-populated destinations in currently selected state */}
                    <div className="space-y-1">
                      <div className="text-[10px] font-bold text-teal-800 uppercase px-3 py-1 bg-teal-50/80 rounded-md">
                        Prominent in {selectedState}
                      </div>
                      {stateDestinations.map((dName) => (
                        <button
                          key={dName}
                          type="button"
                          onClick={() => {
                            const d = getDestinationData(dName);
                            applyDestinationChange(d);
                            setIsDropdownOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-800 hover:bg-slate-100 flex items-center justify-between transition-colors cursor-pointer"
                        >
                          <span className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-teal-600" />
                            <span>{dName}</span>
                          </span>
                          <span className="text-[10px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md">
                            Select
                          </span>
                        </button>
                      ))}
                    </div>

                    {/* General Search Matches across all of India */}
                    {filteredSuggestions.length > 0 && (
                      <div className="space-y-1 pt-1 border-t border-slate-100">
                        <div className="text-[10px] font-bold text-slate-400 uppercase px-3 py-1">
                          Other Popular Hubs
                        </div>
                        {filteredSuggestions.slice(0, 5).map((dest) => (
                          <button
                            key={dest.id}
                            type="button"
                            onClick={() => {
                              applyDestinationChange(dest);
                              setIsDropdownOpen(false);
                            }}
                            className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-800 hover:bg-slate-100 flex items-center justify-between transition-colors cursor-pointer"
                          >
                            <span className="flex items-center gap-2">
                              <Compass className="w-3.5 h-3.5 text-teal-600" />
                              <span>{dest.name}</span>
                            </span>
                            <span className="text-[10px] text-slate-400 font-normal">
                              {dest.state} · {dest.category}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Field 3: Date of Arrival (2.5 Cols) */}
              <div className="lg:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Date of Arrival *
                </label>
                <div className="relative">
                  <input
                    type="date"
                    min={todayStr}
                    value={arrivalDate}
                    onChange={(e) => setArrivalDate(e.target.value)}
                    className="w-full px-3 py-3.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs font-semibold text-slate-900 bg-slate-50/70 transition-all cursor-pointer"
                  />
                </div>
              </div>

              {/* Field 4: Travellers (2 Cols) */}
              <div className="lg:col-span-2 relative" ref={travellerContainerRef}>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Travellers *
                </label>
                <button
                  type="button"
                  onClick={() => setIsTravellerPickerOpen(!isTravellerPickerOpen)}
                  className="w-full px-3 py-3.5 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-900 bg-slate-50/70 flex items-center justify-between text-left hover:border-slate-300 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-1.5 truncate">
                    <Users className="w-4 h-4 text-teal-700 shrink-0" />
                    <span className="truncate">
                      {travellers.total} {travellers.total === 1 ? 'Guest' : 'Guests'}
                    </span>
                  </span>
                  {isTravellerPickerOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>

                {/* Traveller Counter Popup */}
                {isTravellerPickerOpen && (
                  <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 space-y-4">
                    <div className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-2">
                      Family Members Travelling
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
                          onClick={() => updateTravellerCount('adults', -1)}
                          className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-100"
                        >
                          -
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-slate-900">
                          {travellers.adults}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateTravellerCount('adults', 1)}
                          className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-100"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Children */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-slate-900">Children</div>
                        <div className="text-[11px] text-slate-400">Ages 2-17</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateTravellerCount('children', -1)}
                          className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-100"
                        >
                          -
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-slate-900">
                          {travellers.children}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateTravellerCount('children', 1)}
                          className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-100"
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
                          onClick={() => updateTravellerCount('seniors', -1)}
                          className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-100"
                        >
                          -
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-slate-900">
                          {travellers.seniors}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateTravellerCount('seniors', 1)}
                          className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-100"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsTravellerPickerOpen(false)}
                      className="w-full py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors"
                    >
                      Done
                    </button>
                  </div>
                )}
              </div>

              {/* Field 5: Action Button (1 Col) */}
              <div className="lg:col-span-1 flex items-end">
                <button
                  type="submit"
                  disabled={isSearching}
                  className="w-full py-3.5 px-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center cursor-pointer"
                  title="Search destination"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick State & Destination Chips */}
            <div className="pt-2 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
              <span className="font-semibold text-slate-700">Quick explore:</span>
              {[
                { name: 'Vaishno Devi (Katra)', state: 'Jammu & Kashmir' },
                { name: 'Puri', state: 'Odisha' },
                { name: 'Jaipur', state: 'Rajasthan' },
                { name: 'Munnar', state: 'Kerala' },
                { name: 'Varanasi', state: 'Uttar Pradesh' },
                { name: 'North Goa (Calangute/Anjuna)', state: 'Goa' },
              ].map((item) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => {
                    const d = getDestinationData(item.name);
                    applyDestinationChange(d);
                  }}
                  className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                    destinationQuery.toLowerCase().includes(item.name.toLowerCase())
                      ? 'bg-teal-50 text-teal-800 border-teal-300'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </form>
        </div>

        {/* 2. CHOOSE A LANDMARK — DYNAMIC LANDMARK SELECTOR (Section 3) */}
        <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-7 shadow-lg mb-8 relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1.5 max-w-xl">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-300 uppercase tracking-wider">
                <Flag className="w-3.5 h-3.5" />
                <span>Custom Landmark Proximity Engine</span>
              </div>
              <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight">
                Choose a Landmark in {selectedDestination.name}
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                Select the landmark that matters most for your trip. All accommodation and restaurant cards will dynamically recalculate verified road distances and drive times from this point.
              </p>
            </div>

            {/* Landmark Selector Dropdown */}
            <div className="w-full md:w-80 shrink-0">
              <label className="block text-[11px] font-bold text-teal-200 uppercase tracking-wider mb-1.5">
                📍 Active Landmark Reference
              </label>
              <div className="relative">
                <select
                  value={selectedLandmark?.id || ''}
                  onChange={(e) => {
                    const lm = selectedDestination.landmarks.find((l) => l.id === e.target.value) || null;
                    setSelectedLandmark(lm);
                    showToast(`Distances recalculated from ${lm?.name}.`, 'info');
                  }}
                  className="w-full pl-3.5 pr-8 py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-teal-400 cursor-pointer appearance-none"
                >
                  {selectedDestination.landmarks.map((lm) => (
                    <option key={lm.id} value={lm.id} className="bg-slate-900 text-white">
                      {lm.name} ({lm.category})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-teal-300 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {selectedLandmark && (
                <div className="mt-2 text-[11px] text-teal-200/90 flex items-center justify-between">
                  <span>Drive typical: {selectedLandmark.typicalDriveTime || 'Varies by route'}</span>
                  <span className="text-[10px] text-slate-400">Verified coords</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 3. TWO MAJOR TABS: HOTELS & RESTAURANTS (Section 4) */}
        <div id="hotels-section" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 scroll-mt-24">
          {/* Main Tabs Switcher */}
          <div className="flex items-center gap-2 bg-slate-200/80 p-1.5 rounded-2xl w-fit">
            <button
              onClick={() => setActiveTab('hotels')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'hotels'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building className="w-4 h-4 text-teal-600" />
              <span>Hotels & Accommodation ({filteredHotels.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('restaurants')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'restaurants'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UtensilsCrossed className="w-4 h-4 text-amber-600" />
              <span>Restaurants & Food ({filteredRestaurantsList.length})</span>
            </button>
          </div>

          {/* Quick info / Mobile Filter Trigger */}
          <div className="flex items-center gap-3">
            <div className="text-xs text-slate-500 hidden sm:block">
              {activeTab === 'hotels'
                ? `Destination: ${selectedDestination.name}, ${selectedDestination.state}`
                : `Verified Dining in ${selectedDestination.name}`}
            </div>

            <button
              type="button"
              onClick={() => setIsMobileFiltersOpen(true)}
              className="lg:hidden flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-teal-600" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* 4. MAIN CONTENT GRID: FILTERS & CARDS */}
        <div className="pt-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* ================= LEFT: FILTERS SIDEBAR (4 Cols) ================= */}
            <div className="hidden lg:block lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-6 sticky top-20">
              {activeTab === 'hotels' ? (
                /* HOTEL FILTERS (Section 5) */
                <>
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                      <SlidersHorizontal className="w-4 h-4 text-teal-700" />
                      <span>Filter Accommodations</span>
                    </div>
                    <button
                      onClick={clearAllHotelFilters}
                      className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Clear</span>
                    </button>
                  </div>

                  {/* 1. Price Range */}
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
                      Price Range
                    </h3>
                    <div className="space-y-2">
                      {['₹2,000 – ₹3,000', '₹3,000 – ₹5,000', '₹5,000 – ₹8,000', '₹8,000+'].map((range) => (
                        <label
                          key={range}
                          className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer hover:text-slate-900"
                        >
                          <input
                            type="checkbox"
                            checked={hotelFilters.priceRanges.includes(range)}
                            onChange={() => toggleHotelFilter('priceRanges', range)}
                            className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300"
                          />
                          <span>{range}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* 2. Accommodation Type */}
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
                      Accommodation Type
                    </h3>
                    <div className="space-y-2">
                      {['Hotel', 'Guest House', 'Homestay', 'Lodge', 'Resort'].map((type) => (
                        <label
                          key={type}
                          className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer hover:text-slate-900"
                        >
                          <input
                            type="checkbox"
                            checked={hotelFilters.types.includes(type)}
                            onChange={() => toggleHotelFilter('types', type)}
                            className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300"
                          />
                          <span>{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* 3. Rating */}
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
                      Rating
                    </h3>
                    <div className="space-y-1.5">
                      {[
                        { label: '4★ & above', val: 4 },
                        { label: '3★ & above', val: 3 },
                        { label: 'Any rating', val: 0 },
                      ].map((r) => {
                        const selected =
                          (r.val === 0 && hotelFilters.minRating === null) ||
                          hotelFilters.minRating === r.val;
                        return (
                          <button
                            key={r.label}
                            type="button"
                            onClick={() => toggleHotelFilter('minRating', r.val === 0 ? 0 : r.val)}
                            className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center justify-between ${
                              selected
                                ? 'bg-teal-50 text-teal-800 font-bold border border-teal-200'
                                : 'text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            <span>{r.label}</span>
                            {selected && <Check className="w-3.5 h-3.5 text-teal-600" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 4. Facilities */}
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
                      Facilities
                    </h3>
                    <div className="space-y-2">
                      {[
                        'Parking',
                        'Wi-Fi',
                        'Restaurant',
                        'Family rooms',
                        'Elevator',
                        'Air conditioning',
                      ].map((fac) => (
                        <label
                          key={fac}
                          className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer hover:text-slate-900"
                        >
                          <input
                            type="checkbox"
                            checked={hotelFilters.facilities.includes(fac)}
                            onChange={() => toggleHotelFilter('facilities', fac)}
                            className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300"
                          />
                          <span>{fac}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* 5. Proximity */}
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
                      Proximity
                    </h3>
                    <div className="space-y-2">
                      {[
                        'Near Railway Station',
                        'Near Bus Stand',
                        'Near Airport',
                        'Near Selected Landmark',
                      ].map((prox) => (
                        <label
                          key={prox}
                          className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer hover:text-slate-900"
                        >
                          <input
                            type="checkbox"
                            checked={hotelFilters.proximity.includes(prox)}
                            onChange={() => toggleHotelFilter('proximity', prox)}
                            className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300"
                          />
                          <span>{prox}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                /* RESTAURANT FILTERS (Section 6) */
                <>
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                      <SlidersHorizontal className="w-4 h-4 text-amber-600" />
                      <span>Filter Food & Dining</span>
                    </div>
                    <button
                      onClick={clearAllRestaurantFilters}
                      className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Clear</span>
                    </button>
                  </div>

                  {/* 1. Food Type */}
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
                      Food Type
                    </h3>
                    <div className="space-y-2">
                      {['Vegetarian', 'Non-Vegetarian', 'Vegan', 'Mixed'].map((type) => (
                        <label
                          key={type}
                          className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer hover:text-slate-900"
                        >
                          <input
                            type="checkbox"
                            checked={restaurantFilters.foodTypes.includes(type)}
                            onChange={() => toggleRestaurantFilter('foodTypes', type)}
                            className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300"
                          />
                          <span>{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* 2. Price Range */}
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
                      Price Range
                    </h3>
                    <div className="grid grid-cols-4 gap-1.5">
                      {(['₹', '₹₹', '₹₹₹', '₹₹₹₹'] as const).map((lvl) => {
                        const checked = restaurantFilters.priceLevels.includes(lvl);
                        return (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() => toggleRestaurantFilter('priceLevels', lvl)}
                            className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                              checked
                                ? 'bg-teal-50 text-teal-900 border-teal-300 shadow-2xs'
                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {lvl}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 3. Rating */}
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
                      Rating
                    </h3>
                    <div className="space-y-1.5">
                      {[
                        { label: '4★ & above', val: 4 },
                        { label: '3★ & above', val: 3 },
                        { label: 'Any rating', val: 0 },
                      ].map((r) => {
                        const selected =
                          (r.val === 0 && restaurantFilters.minRating === null) ||
                          restaurantFilters.minRating === r.val;
                        return (
                          <button
                            key={r.label}
                            type="button"
                            onClick={() => toggleRestaurantFilter('minRating', r.val === 0 ? 0 : r.val)}
                            className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center justify-between ${
                              selected
                                ? 'bg-teal-50 text-teal-800 font-bold border border-teal-200'
                                : 'text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            <span>{r.label}</span>
                            {selected && <Check className="w-3.5 h-3.5 text-teal-600" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 4. Facilities */}
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
                      Dining Facilities
                    </h3>
                    <div className="space-y-2">
                      {[
                        'Family Friendly',
                        'Parking',
                        'Delivery',
                        'Outdoor Seating',
                        'Wheelchair Accessible',
                      ].map((fac) => (
                        <label
                          key={fac}
                          className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer hover:text-slate-900"
                        >
                          <input
                            type="checkbox"
                            checked={restaurantFilters.facilities.includes(fac)}
                            onChange={() => toggleRestaurantFilter('facilities', fac)}
                            className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300"
                          />
                          <span>{fac}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* 5. Proximity */}
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
                      Distance Proximity
                    </h3>
                    <div className="space-y-2">
                      {['Near Hotel', 'Near Selected Landmark'].map((prox) => (
                        <label
                          key={prox}
                          className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer hover:text-slate-900"
                        >
                          <input
                            type="checkbox"
                            checked={restaurantFilters.proximity.includes(prox)}
                            onChange={() => toggleRestaurantFilter('proximity', prox)}
                            className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300"
                          />
                          <span>{prox}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* ================= RIGHT: RESULTS LIST (8 Cols) ================= */}
            <div className="lg:col-span-8 space-y-6">
              {activeTab === 'hotels' ? (
                /* ================= HOTEL CARDS LIST ================= */
                filteredHotels.length > 0 ? (
                  filteredHotels.map((hotel) => {
                    const isSaved = isHotelSaved(hotel.id);
                    return (
                      <motion.div
                        key={hotel.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col md:flex-row group"
                      >
                        {/* Image Container */}
                        <div className="md:w-72 h-52 md:h-auto relative shrink-0 bg-slate-900 overflow-hidden">
                          <img
                            src={hotel.image}
                            alt={hotel.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute top-3 left-3 flex items-center gap-1.5">
                            <span className="px-2.5 py-1 rounded-lg bg-slate-900/80 text-white text-[11px] font-bold backdrop-blur-xs">
                              {hotel.type}
                            </span>
                          </div>

                          <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-lg text-xs font-bold text-slate-900 flex items-center gap-1 shadow-xs">
                            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                            <span>{hotel.rating}</span>
                            <span className="text-[10px] text-slate-500 font-normal">
                              ({hotel.reviewCount})
                            </span>
                          </div>
                        </div>

                        {/* Card Details */}
                        <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                          <div>
                            {/* Title & Price Header */}
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                              <div>
                                <h3 className="font-display text-xl font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                                  {hotel.name}
                                </h3>
                                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                                  <MapPin className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                                  <span className="line-clamp-1">{hotel.address}</span>
                                </div>
                              </div>

                              <div className="flex items-center sm:flex-col sm:items-end justify-between gap-1 shrink-0">
                                <div className="text-xl font-extrabold text-slate-900">
                                  ₹{hotel.price.toLocaleString('en-IN')}
                                </div>
                                <div className="text-[10px] text-slate-500 font-medium">
                                  {hotel.priceBasis}
                                </div>
                              </div>
                            </div>

                            {/* PRACTICAL DISTANCES ROW (WITH USER-SELECTED LANDMARK) */}
                            <div className="bg-[#FAF9F6] p-3 rounded-2xl border border-slate-200/80 my-3">
                              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                                <span>Verified Road Distances</span>
                                {hotel.distances.landmark.travelTime && (
                                  <span className="text-teal-700 font-semibold lowercase">
                                    {hotel.distances.landmark.travelTime} to landmark
                                  </span>
                                )}
                              </div>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                                <div className="flex items-center gap-1.5">
                                  <Train className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                  <div className="truncate">
                                    <span className="font-bold text-slate-800">
                                      {hotel.distances.railwayStation.distance}
                                    </span>
                                    <span className="text-[10px] text-slate-400 block truncate">Railway</span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5">
                                  <Bus className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                  <div className="truncate">
                                    <span className="font-bold text-slate-800">
                                      {hotel.distances.busStand.distance}
                                    </span>
                                    <span className="text-[10px] text-slate-400 block truncate">Bus Stand</span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5">
                                  <Plane className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                                  <div className="truncate">
                                    <span className="font-bold text-slate-800">
                                      {hotel.distances.airport.distance}
                                    </span>
                                    <span className="text-[10px] text-slate-400 block truncate">Airport</span>
                                  </div>
                                </div>

                                {/* USER-SELECTED LANDMARK DISTANCE */}
                                <div className="flex items-center gap-1.5 bg-teal-50/70 p-1 rounded-lg border border-teal-200/70">
                                  <Flag className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                                  <div className="truncate">
                                    <span className="font-bold text-teal-950">
                                      {hotel.distances.landmark.distance}
                                    </span>
                                    <span className="text-[10px] text-teal-700 block truncate" title={hotel.distances.landmark.landmarkName}>
                                      {selectedLandmark?.name ? selectedLandmark.name.slice(0, 12) + '...' : 'Landmark'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Facilities Chips */}
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {hotel.facilities.slice(0, 4).map((f) => (
                                <span
                                  key={f}
                                  className="px-2 py-0.5 rounded-md bg-slate-100 text-[11px] font-medium text-slate-600"
                                >
                                  {f}
                                </span>
                              ))}
                              {hotel.facilities.length > 4 && (
                                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[11px] font-semibold text-slate-500">
                                  +{hotel.facilities.length - 4} more
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Footer Actions & Public Contact */}
                          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                            {/* Property Contact & Website */}
                            <div className="flex items-center gap-3 text-xs text-slate-600">
                              <span className="inline-flex items-center gap-1 font-medium">
                                <Phone className="w-3 h-3 text-slate-400" />
                                <span>{hotel.contact.phone}</span>
                              </span>
                              {hotel.contact.website && (
                                <a
                                  href={hotel.contact.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-teal-700 hover:text-teal-800 hover:underline flex items-center gap-0.5"
                                >
                                  <span>Official Web</span>
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              )}
                            </div>

                            {/* Buttons */}
                            <div className="flex items-center gap-2">
                              {/* Add to My Journey Bookmark Button */}
                              <button
                                type="button"
                                onClick={() => toggleSaveHotel(hotel)}
                                className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                                  isSaved
                                    ? 'bg-teal-50 border-teal-300 text-teal-800'
                                    : 'bg-white border-slate-200 text-slate-400 hover:text-teal-600'
                                }`}
                                title={isSaved ? 'Saved in My Journey' : 'Save stay to My Journey'}
                              >
                                {isSaved ? <Check className="w-4 h-4 text-teal-700" /> : <Bookmark className="w-4 h-4" />}
                              </button>

                              <button
                                type="button"
                                onClick={() => setContactModalHotel(hotel)}
                                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                              >
                                Property Contact
                              </button>

                              <button
                                type="button"
                                onClick={() => setSelectedGroundRealityHotel(hotel)}
                                className="px-4 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                              >
                                <span>View Ground Reality</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
                      <Info className="w-6 h-6" />
                    </div>
                    <h3 className="font-display text-lg font-bold text-slate-900">
                      No stays match your active filters
                    </h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Try expanding your price range or clearing proximity filters to see available properties.
                    </p>
                    <button
                      onClick={clearAllHotelFilters}
                      className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Reset All Filters
                    </button>
                  </div>
                )
              ) : (
                /* ================= RESTAURANT CARDS LIST (Section 8, 10) ================= */
                filteredRestaurantsList.length > 0 ? (
                  filteredRestaurantsList.map((restaurant) => (
                    <RestaurantCard
                      key={restaurant.id}
                      restaurant={restaurant}
                      onViewDetails={(r) => setSelectedRestaurantModal(r)}
                      selectedLandmarkName={selectedLandmark?.name}
                      hotelName={activeHotel?.name}
                    />
                  ))
                ) : (
                  <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
                      <UtensilsCrossed className="w-6 h-6" />
                    </div>
                    <h3 className="font-display text-lg font-bold text-slate-900">
                      No dining options match your active filters
                    </h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Try clearing food type or cuisine filters to discover authentic regional eateries in {selectedDestination.name}.
                    </p>
                    <button
                      onClick={clearAllRestaurantFilters}
                      className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Reset Food Filters
                    </button>
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        {/* 5. INTERACTIVE MAP SECTION */}
        <div className="pt-12">
          <InteractiveMap
            destination={selectedDestination}
            accommodations={filteredHotels}
            nearbyAttractions={selectedDestination.nearbyAttractions}
            onSelectHotel={(hId) => {
              const h = enrichedHotels.find((x) => x.id === hId);
              if (h) setSelectedGroundRealityHotel(h);
            }}
            onSelectPlace={(pId) => {
              const p = selectedDestination.nearbyAttractions.find((x) => x.id === pId);
              if (p) setSelectedNearbyPlace(p);
            }}
          />
        </div>

        {/* 6. DESTINATION INTELLIGENCE — "EXPLORE [DESTINATION]" (Sections 11, 12, 13) */}
        <div className="pt-14">
          <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold uppercase tracking-wider mb-2">
                <Compass className="w-3.5 h-3.5 text-emerald-600" />
                <span>Destination Intelligence</span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900">
                Explore {selectedDestination.name}
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Verified attractions, timings, entry notes, and authentic lesser-known recommendations.
              </p>
            </div>

            {/* Category Filter Chips */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                'All',
                'Popular Places',
                'Hidden Gems',
                'Family Friendly',
                'Nature & Outdoors',
                'Culture & Heritage',
                'Food & Local Experiences',
              ].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedAttractionCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedAttractionCategory === cat
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAttractions.map((place) => (
              <div
                key={place.id}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  {/* Image */}
                  <div className="h-44 relative bg-slate-900 overflow-hidden">
                    <img
                      src={place.image}
                      alt={place.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-bold shadow-xs">
                        {place.category}
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-3 bg-white/95 px-2 py-0.5 rounded-lg text-xs font-bold text-slate-900 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                      <span>{place.rating}</span>
                      <span className="text-[10px] text-slate-500">
                        ({place.reviewCount.toLocaleString()})
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 space-y-3">
                    <div>
                      <h3 className="font-display text-lg font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                        {place.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                        <span className="line-clamp-1">{place.location}</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 flex items-center justify-between">
                      <span className="font-semibold text-slate-500">Distance from Center:</span>
                      <span className="font-bold text-slate-900">
                        {place.distanceFromDestination}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-normal">
                      {place.description}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <button
                    type="button"
                    onClick={() => setSelectedNearbyPlace(place)}
                    className="w-full py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Explore Place</span>
                    <ArrowRight className="w-3.5 h-3.5 text-teal-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ground Reality Modal (Section 16) */}
      <AnimatePresence>
        {selectedGroundRealityHotel && (
          <GroundRealityModal
            hotel={selectedGroundRealityHotel}
            onClose={() => setSelectedGroundRealityHotel(null)}
          />
        )}
      </AnimatePresence>

      {/* Nearby Place Detail Modal (Sections 13, 14) */}
      <AnimatePresence>
        {selectedNearbyPlace && (
          <PlaceDetailModal
            place={selectedNearbyPlace}
            onClose={() => setSelectedNearbyPlace(null)}
            selectedLandmarkName={selectedLandmark?.name}
            hotelName={activeHotel?.name}
            nearbyRestaurants={selectedDestination.restaurants}
            nearbyHotels={selectedDestination.accommodations}
          />
        )}
      </AnimatePresence>

      {/* Restaurant Detail Modal (Sections 8, 10) */}
      <AnimatePresence>
        {selectedRestaurantModal && (
          <RestaurantModal
            restaurant={selectedRestaurantModal}
            onClose={() => setSelectedRestaurantModal(null)}
            selectedLandmarkName={selectedLandmark?.name}
            hotelName={activeHotel?.name}
          />
        )}
      </AnimatePresence>

      {/* My Journey Drawer (Section 14) */}
      <MyJourneyDrawer
        isOpen={isMyJourneyDrawerOpen}
        onClose={() => setIsMyJourneyDrawerOpen(false)}
        destinationName={selectedDestination.name}
        stateName={selectedDestination.state}
        arrivalDate={arrivalDate}
        onOpenChecklist={() => {
          setIsMyJourneyDrawerOpen(false);
          setCurrentPage('checklist');
        }}
      />

      {/* Property Contact Dialog */}
      <AnimatePresence>
        {contactModalHotel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative"
            >
              <button
                onClick={() => setContactModalHotel(null)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-xs font-bold text-teal-700 uppercase tracking-wide mb-1">
                Property Contact Information
              </div>
              <h3 className="font-display text-xl font-bold text-slate-900 mb-2">
                {contactModalHotel.name}
              </h3>
              <p className="text-xs text-slate-500 mb-6">
                Official front desk contact and portal links for inquiries and bookings.
              </p>

              <div className="space-y-4 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                  <Phone className="w-4 h-4 text-teal-700" />
                  <div>
                    <div className="text-slate-400 font-medium">Property Contact (Front Desk)</div>
                    <div className="font-bold text-slate-900 text-sm mt-0.5">
                      {contactModalHotel.contact.phone}
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                  <Mail className="w-4 h-4 text-teal-700" />
                  <div>
                    <div className="text-slate-400 font-medium">Public Business Email</div>
                    <div className="font-bold text-slate-900 mt-0.5">
                      {contactModalHotel.contact.email || 'Email not publicly available'}
                    </div>
                  </div>
                </div>

                {contactModalHotel.contact.website && (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                    <Globe className="w-4 h-4 text-teal-700" />
                    <div>
                      <div className="text-slate-400 font-medium">Official Portal</div>
                      <a
                        href={contactModalHotel.contact.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold text-teal-700 hover:underline flex items-center gap-1 mt-0.5"
                      >
                        <span>Visit Official Website</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-5 mt-5 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Source: Public Hospitality Registry
                </span>
                <button
                  onClick={() => setContactModalHotel(null)}
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
