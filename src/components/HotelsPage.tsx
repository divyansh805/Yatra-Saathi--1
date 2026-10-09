import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { ALL_INDIAN_STATES_AND_UTS } from '../data/allIndiaDestinations';
import {
  getDestinationLandmarks,
  getDestinationAccommodations,
  getDestinationRestaurants,
} from '../data/landmarkHotelsDatabase';
import {
  Accommodation,
  AccommodationFilters,
  DestinationItem,
  DestinationLandmark,
  NearbyPlace,
  Restaurant,
  RestaurantFilters,
} from '../types';
import { getDestinationData } from '../data/destinationsData';
import { InteractiveMap } from './InteractiveMap';
import { GroundRealityModal } from './GroundRealityModal';
import { RestaurantCard } from './RestaurantCard';
import { RestaurantModal } from './RestaurantModal';
import { MyJourneyDrawer } from './MyJourneyDrawer';
import {
  Building,
  UtensilsCrossed,
  MapPin,
  Compass,
  SlidersHorizontal,
  Star,
  Phone,
  Globe,
  Check,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Bookmark,
  ShieldCheck,
  Car,
  ExternalLink,
  Info,
  Navigation,
  ArrowRight,
  Filter,
  CheckCircle2,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const HotelsPage: React.FC = () => {
  const {
    activeSearch,
    setActiveSearch,
    myJourney,
    toggleSaveHotel,
    isHotelSaved,
    showToast,
    setCurrentPage,
  } = useApp();

  // Active Tab: 'hotels' | 'restaurants'
  const [activeTab, setActiveTab] = useState<'hotels' | 'restaurants'>('hotels');

  // Search State: State & Destination
  const [selectedState, setSelectedState] = useState<string>(
    activeSearch.state || 'Punjab'
  );
  const [selectedDestinationName, setSelectedDestinationName] = useState<string>(
    activeSearch.destination || 'Amritsar'
  );

  // Available destinations for the selected state
  const stateDestinations = useMemo(() => {
    if (!selectedState) return [];
    const s = ALL_INDIAN_STATES_AND_UTS.find((item) => item.name === selectedState);
    return s ? s.destinations : [];
  }, [selectedState]);

  // Many meaningful landmarks for this destination
  const destinationLandmarks = useMemo(() => {
    return getDestinationLandmarks(selectedDestinationName, selectedState);
  }, [selectedDestinationName, selectedState]);

  // Selected Landmark for proximity calculation
  const [selectedLandmark, setSelectedLandmark] = useState<DestinationLandmark | null>(() => {
    return destinationLandmarks.length > 0 ? destinationLandmarks[0] : null;
  });

  // When destination changes, reset selected landmark to the first prominent one
  useEffect(() => {
    if (destinationLandmarks.length > 0) {
      // If activeSearch had a landmarkId, match it, else pick the first
      const matched = destinationLandmarks.find(
        (lm) => lm.id === activeSearch.selectedLandmarkId
      );
      setSelectedLandmark(matched || destinationLandmarks[0]);
    } else {
      setSelectedLandmark(null);
    }
  }, [selectedDestinationName, destinationLandmarks]);

  // Destination-Specific Accommodations & Restaurants
  const rawHotels = useMemo(() => {
    return getDestinationAccommodations(
      selectedDestinationName,
      selectedState,
      selectedLandmark
    );
  }, [selectedDestinationName, selectedState, selectedLandmark]);

  const rawRestaurants = useMemo(() => {
    return getDestinationRestaurants(
      selectedDestinationName,
      selectedState,
      selectedLandmark
    );
  }, [selectedDestinationName, selectedState, selectedLandmark]);

  // Filters State for Hotels
  const [hotelFilters, setHotelFilters] = useState<AccommodationFilters>({
    priceRanges: [],
    types: [],
    minRating: null,
    facilities: [],
    proximity: [],
    familySeniorFriendly: false,
    parkingRequired: false,
    powerBackupRequired: false,
  });

  // Filters State for Restaurants
  const [restaurantFilters, setRestaurantFilters] = useState<RestaurantFilters>({
    foodTypes: [],
    cuisines: [],
    priceLevels: [],
    minRating: null,
    facilities: [],
    proximity: [],
  });

  const [sortOption, setSortOption] = useState<'nearest' | 'rating' | 'priceAsc' | 'priceDesc'>('nearest');

  // Modals
  const [selectedGroundRealityHotel, setSelectedGroundRealityHotel] = useState<Accommodation | null>(null);
  const [contactModalHotel, setContactModalHotel] = useState<Accommodation | null>(null);
  const [selectedRestaurantModal, setSelectedRestaurantModal] = useState<Restaurant | null>(null);
  const [isMyJourneyDrawerOpen, setIsMyJourneyDrawerOpen] = useState(false);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Filtered & Sorted Hotels
  const filteredHotels = useMemo(() => {
    let list = [...rawHotels];

    // Filter by type
    if (hotelFilters.types.length > 0) {
      list = list.filter((h) => hotelFilters.types.includes(h.type));
    }

    // Filter by rating
    if (hotelFilters.minRating !== null && hotelFilters.minRating > 0) {
      list = list.filter((h) => h.rating >= (hotelFilters.minRating || 0));
    }

    // Filter by facilities
    if (hotelFilters.facilities.length > 0) {
      list = list.filter((h) =>
        hotelFilters.facilities.every((f) => h.facilities.includes(f))
      );
    }

    // Ground reality filters
    if (hotelFilters.parkingRequired) {
      list = list.filter((h) => h.facilities.includes('Parking') || h.groundReality.parking.toLowerCase().includes('parking'));
    }

    if (hotelFilters.familySeniorFriendly) {
      list = list.filter((h) =>
        h.groundReality.familySeniorFriendly.toLowerCase().includes('wheelchair') ||
        h.groundReality.familySeniorFriendly.toLowerCase().includes('senior') ||
        h.facilities.includes('Elevator')
      );
    }

    // Sort
    if (sortOption === 'nearest') {
      list.sort((a, b) => {
        const distA = parseFloat(a.distances?.landmark?.distance || '999');
        const distB = parseFloat(b.distances?.landmark?.distance || '999');
        return distA - distB;
      });
    } else if (sortOption === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    } else if (sortOption === 'priceAsc') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortOption === 'priceDesc') {
      list.sort((a, b) => b.price - a.price);
    }

    return list;
  }, [rawHotels, hotelFilters, sortOption]);

  // Filtered & Sorted Restaurants
  const filteredRestaurants = useMemo(() => {
    let list = [...rawRestaurants];

    if (restaurantFilters.foodTypes.length > 0) {
      list = list.filter((r) => restaurantFilters.foodTypes.includes(r.foodType));
    }

    if (restaurantFilters.minRating !== null && restaurantFilters.minRating > 0) {
      list = list.filter((r) => r.rating >= (restaurantFilters.minRating || 0));
    }

    // Sort
    if (sortOption === 'nearest') {
      list.sort((a, b) => {
        const distA = parseFloat(a.distanceFromSelectedLandmark || '999');
        const distB = parseFloat(b.distanceFromSelectedLandmark || '999');
        return distA - distB;
      });
    } else if (sortOption === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    }

    return list;
  }, [rawRestaurants, restaurantFilters, sortOption]);

  // Map representation object
  const mapDestinationObj: DestinationItem = useMemo(() => {
    const coords = selectedLandmark?.coordinates || { lat: 31.634, lng: 74.872 };
    return {
      id: selectedDestinationName.toLowerCase().replace(/[^a-z0-9]/g, ''),
      name: selectedDestinationName,
      state: selectedState,
      region: selectedState,
      category: 'Heritage',
      climateType: 'moderate',
      description: `Accommodations and dining near ${selectedLandmark?.name || selectedDestinationName}`,
      coordinates: coords,
      nearestTransit: {
        railwayStation: `${selectedDestinationName} Railway Station`,
        busStand: `${selectedDestinationName} Inter-State Bus Stand`,
        airport: `Airport serving ${selectedDestinationName}`,
        majorLandmark: selectedLandmark?.name || selectedDestinationName,
      },
      landmarks: destinationLandmarks,
      accommodations: filteredHotels,
      restaurants: filteredRestaurants,
      nearbyAttractions: [],
      officialPermits: [],
      emergencyContacts: [],
    };
  }, [selectedDestinationName, selectedState, selectedLandmark, destinationLandmarks, filteredHotels, filteredRestaurants]);

  const handleStateChange = (stateName: string) => {
    setSelectedState(stateName);
    const s = ALL_INDIAN_STATES_AND_UTS.find((item) => item.name === stateName);
    if (s && s.destinations.length > 0) {
      setSelectedDestinationName(s.destinations[0]);
      setActiveSearch((prev) => ({
        ...prev,
        state: stateName,
        destination: s.destinations[0],
      }));
    }
  };

  const handleDestinationChange = (destName: string) => {
    setSelectedDestinationName(destName);
    setActiveSearch((prev) => ({
      ...prev,
      destination: destName,
    }));
  };

  const handleLandmarkSelect = (landmark: DestinationLandmark) => {
    setSelectedLandmark(landmark);
    setActiveSearch((prev) => ({
      ...prev,
      selectedLandmarkId: landmark.id,
    }));
    showToast(`Recalculated distances from ${landmark.name}`, 'info');
  };

  const totalSavedCount =
    (myJourney.savedHotel ? 1 : 0) +
    myJourney.savedRestaurants.length +
    myJourney.savedPlaces.length;

  return (
    <div className="pt-24 pb-20 bg-[#FAF9F6] min-h-screen text-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* ================= 1. HEADER & DESTINATION + LANDMARK SELECTOR ================= */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold uppercase tracking-wider mb-2">
                <Building className="w-3.5 h-3.5 text-teal-600" />
                <span>Verified Stay & Dining Intelligence</span>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Hotels & Accommodation
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Verified hotels and dining near major landmarks in {selectedDestinationName}, {selectedState}.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsMyJourneyDrawerOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-slate-800 hover:border-teal-400 transition-colors shadow-2xs cursor-pointer"
              >
                <Bookmark className="w-4 h-4 text-teal-600 fill-teal-600" />
                <span>My Journey ({totalSavedCount})</span>
              </button>
            </div>
          </div>

          {/* Location & Landmark Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4">
            {/* 1. State */}
            <div className="lg:col-span-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                State / Union Territory
              </label>
              <div className="relative">
                <select
                  value={selectedState}
                  onChange={(e) => handleStateChange(e.target.value)}
                  className="w-full pl-3.5 pr-8 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs font-semibold text-slate-900 bg-slate-50/70 transition-all cursor-pointer appearance-none truncate"
                >
                  {ALL_INDIAN_STATES_AND_UTS.map((s) => (
                    <option key={s.name} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* 2. Destination */}
            <div className="lg:col-span-4">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Destination
              </label>
              <div className="relative">
                <select
                  value={selectedDestinationName}
                  onChange={(e) => handleDestinationChange(e.target.value)}
                  className="w-full pl-3.5 pr-8 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs font-semibold text-slate-900 bg-slate-50/70 transition-all cursor-pointer appearance-none truncate"
                >
                  {stateDestinations.map((dest) => (
                    <option key={dest} value={dest}>
                      {dest}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* 3. Choose a Landmark (Large list of meaningful landmarks) */}
            <div className="lg:col-span-5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Choose Landmark for Distance Calculation ({destinationLandmarks.length} Landmarks)
              </label>
              <div className="relative">
                <select
                  value={selectedLandmark?.id || ''}
                  onChange={(e) => {
                    const found = destinationLandmarks.find((lm) => lm.id === e.target.value);
                    if (found) handleLandmarkSelect(found);
                  }}
                  className="w-full pl-3.5 pr-8 py-3 rounded-xl border border-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs font-bold text-teal-900 bg-teal-50/60 transition-all cursor-pointer appearance-none truncate"
                >
                  {destinationLandmarks.map((lm) => (
                    <option key={lm.id} value={lm.id}>
                      📍 {lm.name} ({lm.category})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-teal-600 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Landmark Quick Chips Row */}
          {destinationLandmarks.length > 1 && (
            <div className="pt-2 border-t border-slate-100">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Popular Landmarks in {selectedDestinationName}:
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {destinationLandmarks.map((lm) => {
                  const isSelected = selectedLandmark?.id === lm.id;
                  return (
                    <button
                      key={lm.id}
                      type="button"
                      onClick={() => handleLandmarkSelect(lm)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-teal-600 text-white font-bold shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <span>{lm.name}</span>
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ================= 2. TABS & SORT CONTROLS ================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          {/* Main Tabs Switcher */}
          <div className="flex items-center gap-2 bg-slate-200/80 p-1.5 rounded-2xl w-fit">
            <button
              onClick={() => setActiveTab('hotels')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'hotels'
                  ? 'bg-white text-slate-900 shadow-xs'
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
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UtensilsCrossed className="w-4 h-4 text-amber-600" />
              <span>Restaurants & Food ({filteredRestaurants.length})</span>
            </button>
          </div>

          {/* Proximity / Sorting Dropdown */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 font-semibold hidden md:inline">Sort by:</span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as any)}
              className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 cursor-pointer shadow-2xs focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="nearest">
                Nearest to {selectedLandmark?.name ? selectedLandmark.name.slice(0, 22) + '...' : 'Landmark'}
              </option>
              <option value="rating">Highest Rating</option>
              {activeTab === 'hotels' && (
                <>
                  <option value="priceAsc">Price: Low to High</option>
                  <option value="priceDesc">Price: High to Low</option>
                </>
              )}
            </select>
          </div>
        </div>

        {/* ================= 3. CONTENT GRID: CARDS ================= */}
        {activeTab === 'hotels' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredHotels.map((hotel) => {
                const isSaved = isHotelSaved(hotel.id);
                const landmarkDist = hotel.distances?.landmark;

                return (
                  <div
                    key={hotel.id}
                    className="bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Image Banner */}
                      <div className="relative h-48 bg-slate-900 overflow-hidden">
                        <img
                          src={hotel.image}
                          alt={hotel.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 flex items-center gap-1.5">
                          <span className="px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-bold">
                            {hotel.type}
                          </span>
                        </div>

                        {/* Save to My Journey Button */}
                        <button
                          type="button"
                          onClick={() => {
                            toggleSaveHotel(hotel);
                            showToast(
                              isSaved ? 'Hotel removed from My Journey' : 'Hotel saved to My Journey',
                              'success'
                            );
                          }}
                          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all cursor-pointer ${
                            isSaved
                              ? 'bg-teal-600 text-white shadow-xs'
                              : 'bg-slate-900/60 text-white hover:bg-slate-900/80'
                          }`}
                          title="Save to My Journey"
                        >
                          <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-white' : ''}`} />
                        </button>

                        {/* Rating & Distance Overlay */}
                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                          <span className="flex items-center gap-1 font-bold bg-amber-500/90 px-2 py-0.5 rounded-lg">
                            <Star className="w-3.5 h-3.5 fill-white text-white" />
                            <span>{hotel.rating}</span>
                            <span className="text-[10px] text-amber-100 font-normal">
                              ({hotel.reviewCount})
                            </span>
                          </span>

                          {landmarkDist && (
                            <span className="bg-slate-900/80 backdrop-blur-md px-2.5 py-0.5 rounded-lg text-[11px] font-semibold text-teal-300">
                              {landmarkDist.distance} · {landmarkDist.travelTime}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-5 space-y-3">
                        <div>
                          <h3 className="font-display font-bold text-base text-slate-900 line-clamp-1">
                            {hotel.name}
                          </h3>
                          <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                            {hotel.address}
                          </p>
                        </div>

                        {/* Distance from selected landmark indicator */}
                        {landmarkDist && (
                          <div className="p-2.5 rounded-xl bg-teal-50 border border-teal-200/80 text-[11px] text-teal-900 flex items-center justify-between">
                            <span className="font-semibold truncate">
                              Near {landmarkDist.landmarkName}
                            </span>
                            <span className="font-bold shrink-0">{landmarkDist.distance}</span>
                          </div>
                        )}

                        {/* Facilities Chips */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {hotel.facilities.slice(0, 4).map((fac, fIdx) => (
                            <span
                              key={fIdx}
                              className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium"
                            >
                              {fac}
                            </span>
                          ))}
                          {hotel.facilities.length > 4 && (
                            <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-400 text-[10px]">
                              +{hotel.facilities.length - 4}
                            </span>
                          )}
                        </div>

                        {/* Pricing */}
                        <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between">
                          <div>
                            <span className="text-xs text-slate-400">Starting from</span>
                            <div className="font-extrabold text-base text-slate-900">
                              ₹{hotel.price.toLocaleString('en-IN')}
                              <span className="text-[11px] font-normal text-slate-500"> / night</span>
                            </div>
                          </div>
                          <span className="text-[10px] text-slate-400">{hotel.dataSource}</span>
                        </div>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="p-5 pt-0 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedGroundRealityHotel(hotel)}
                        className="py-2.5 px-3 rounded-xl border border-slate-200 hover:border-slate-300 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 transition-colors cursor-pointer text-center"
                      >
                        Ground Reality
                      </button>
                      <button
                        type="button"
                        onClick={() => setContactModalHotel(hotel)}
                        className="py-2.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-colors cursor-pointer text-center shadow-xs"
                      >
                        Contact & Info
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredHotels.length === 0 && (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
                <p className="text-sm text-slate-600">
                  No accommodations match the selected filters. Try clearing some filters.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ================= 4. RESTAURANTS TAB ================= */}
        {activeTab === 'restaurants' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {filteredRestaurants.map((restaurant) => (
                <RestaurantCard
                  key={restaurant.id}
                  restaurant={restaurant}
                  onViewDetails={() => setSelectedRestaurantModal(restaurant)}
                  selectedLandmarkName={selectedLandmark?.name}
                />
              ))}
            </div>

            {filteredRestaurants.length === 0 && (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
                <p className="text-sm text-slate-600">
                  No restaurants match the selected criteria.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ================= 5. INTERACTIVE MAP SECTION ================= */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-display text-xl font-bold text-slate-900">
                Interactive Map: {selectedDestinationName}
              </h3>
              <p className="text-xs text-slate-500">
                Visualizing selected landmark ({selectedLandmark?.name}) and surrounding hotels & dining.
              </p>
            </div>
            <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              Google Maps Platform Grounded
            </span>
          </div>

          <div className="rounded-2xl overflow-hidden border border-slate-200">
            <InteractiveMap
              destination={mapDestinationObj}
              accommodations={filteredHotels}
              nearbyAttractions={[]}
            />
          </div>
        </div>
      </div>

      {/* Ground Reality Modal */}
      {selectedGroundRealityHotel && (
        <GroundRealityModal
          hotel={selectedGroundRealityHotel}
          onClose={() => setSelectedGroundRealityHotel(null)}
        />
      )}

      {/* Hotel Contact Modal */}
      {contactModalHotel && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider">
                  Verified Contact & Links
                </span>
                <h3 className="font-display text-xl font-bold text-slate-900 mt-1">
                  {contactModalHotel.name}
                </h3>
                <p className="text-xs text-slate-500">{contactModalHotel.address}</p>
              </div>
              <button
                type="button"
                onClick={() => setContactModalHotel(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="font-bold text-slate-900">Official Phone Number:</div>
                <div className="text-sm font-bold text-teal-700 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-teal-600" />
                  <span>{contactModalHotel.contact.phone || 'Not publicly available'}</span>
                </div>
              </div>

              {contactModalHotel.contact.website && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="font-bold text-slate-900">Official Website:</div>
                  <a
                    href={contactModalHotel.contact.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-teal-600 hover:underline flex items-center gap-1.5 truncate"
                  >
                    <Globe className="w-4 h-4 shrink-0" />
                    <span className="truncate">{contactModalHotel.contact.website}</span>
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  </a>
                </div>
              )}

              <div className="p-3.5 rounded-xl bg-teal-50 text-teal-900 border border-teal-200 text-[11px]">
                <ShieldCheck className="w-4 h-4 text-teal-700 inline mr-1" />
                Contact details retrieved from verified hospitality registry. No hidden platform markup.
              </div>
            </div>

            <button
              type="button"
              onClick={() => setContactModalHotel(null)}
              className="w-full py-3 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Restaurant Details Modal */}
      {selectedRestaurantModal && (
        <RestaurantModal
          restaurant={selectedRestaurantModal}
          onClose={() => setSelectedRestaurantModal(null)}
        />
      )}

      {/* My Journey Drawer */}
      <MyJourneyDrawer
        isOpen={isMyJourneyDrawerOpen}
        onClose={() => setIsMyJourneyDrawerOpen(false)}
        destinationName={selectedDestinationName}
        stateName={selectedState}
        arrivalDate={activeSearch.arrivalDate || new Date().toISOString().split('T')[0]}
        onOpenChecklist={() => setCurrentPage('checklist')}
      />
    </div>
  );
};
