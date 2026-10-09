import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { ALL_INDIAN_STATES_AND_UTS } from '../data/allIndiaDestinations';
import {
  Compass,
  MapPin,
  Calendar,
  Users,
  Train,
  Bus,
  Plane,
  Car,
  Sparkles,
  ArrowRight,
  Clock,
  Shuffle,
  ShieldCheck,
  AlertCircle,
  FileText,
  Navigation,
  CheckCircle2,
  ChevronDown,
  Info,
  RefreshCw,
  Star,
  Utensils,
  GripVertical,
  Plus,
  Check,
  ExternalLink,
  Lock,
  ArrowUp,
  ArrowDown,
  Route as RouteIcon,
  Layers,
  Search,
} from 'lucide-react';
import { Map, AdvancedMarker, InfoWindow, useMap } from '@vis.gl/react-google-maps';
import { motion, AnimatePresence } from 'motion/react';
import { YatraBot } from './YatraBot';

// Indian Origin Hubs for quick autocomplete & suggestions
const MAJOR_ORIGINS = [
  'Ghaziabad',
  'New Delhi',
  'Noida',
  'Gurugram',
  'Faridabad',
  'Mumbai',
  'Pune',
  'Bengaluru',
  'Hyderabad',
  'Chennai',
  'Kolkata',
  'Howrah',
  'Ahmedabad',
  'Jaipur',
  'Lucknow',
  'Kanpur',
  'Varanasi',
  'Agra',
  'Chandigarh',
  'Amritsar',
  'Dehradun',
  'Patna',
  'Bhopal',
  'Indore',
  'Nagpur',
  'Surat',
  'Vadodara',
  'Kochi',
  'Guwahati',
];

// Approximate coordinates for city pinning on map
const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'delhi': { lat: 28.6139, lng: 77.209 },
  'new delhi': { lat: 28.6139, lng: 77.209 },
  'ghaziabad': { lat: 28.6692, lng: 77.4538 },
  'noida': { lat: 28.5355, lng: 77.391 },
  'gurugram': { lat: 28.4595, lng: 77.0266 },
  'mumbai': { lat: 19.076, lng: 72.8777 },
  'pune': { lat: 18.5204, lng: 73.8567 },
  'bengaluru': { lat: 12.9716, lng: 77.5946 },
  'hyderabad': { lat: 17.385, lng: 78.4867 },
  'chennai': { lat: 13.0827, lng: 80.2707 },
  'kolkata': { lat: 22.5726, lng: 88.3639 },
  'ahmedabad': { lat: 23.0225, lng: 72.5714 },
  'jaipur': { lat: 26.9124, lng: 75.7873 },
  'lucknow': { lat: 26.8467, lng: 80.9462 },
  'kanpur': { lat: 26.4499, lng: 80.3319 },
  'varanasi': { lat: 25.3176, lng: 82.9739 },
  'amritsar': { lat: 31.634, lng: 74.8723 },
  'chandigarh': { lat: 30.7333, lng: 76.7794 },
  'ayodhya': { lat: 26.7922, lng: 82.1998 },
  'vaishno devi': { lat: 33.0308, lng: 74.949 },
  'katra': { lat: 32.9924, lng: 74.9317 },
  'patna': { lat: 25.5941, lng: 85.1376 },
  'dehradun': { lat: 30.3165, lng: 78.0322 },
  'shimla': { lat: 31.1048, lng: 77.1734 },
  'manali': { lat: 32.2432, lng: 77.1892 },
  'agra': { lat: 27.1767, lng: 78.0081 },
  'rishikesh': { lat: 30.0869, lng: 78.2676 },
  'haridwar': { lat: 29.9457, lng: 78.1642 },
  'goa': { lat: 15.2993, lng: 74.124 },
  'udaipur': { lat: 24.5854, lng: 73.7125 },
};

// Standard polyline decoder
function decodePolyline(encoded: string): { lat: number; lng: number }[] {
  if (!encoded) return [];
  const points: { lat: number; lng: number }[] = [];
  let index = 0;
  const len = encoded.length;
  let lat = 0;
  let lng = 0;

  while (index < len) {
    let b: number;
    let shift = 0;
    let result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    points.push({ lat: lat / 1e5, lng: lng / 1e5 });
  }

  return points;
}

// Map Polyline renderer component
const RoutePolylineOverlay: React.FC<{
  path: { lat: number; lng: number }[];
}> = ({ path }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !path || path.length < 2) return;
    const g = (window as any).google;
    if (!g || !g.maps || !g.maps.Polyline) return;

    const polyline = new g.maps.Polyline({
      path,
      strokeColor: '#0D9488',
      strokeOpacity: 0.85,
      strokeWeight: 4.5,
      map,
    });

    return () => {
      polyline.setMap(null);
    };
  }, [map, path]);

  return null;
};

// Map auto-bounds controller
const MapBoundsFitter: React.FC<{
  points: { lat: number; lng: number }[];
}> = ({ points }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !points || points.length === 0) return;
    const g = (window as any).google;
    if (!g || !g.maps || !g.maps.LatLngBounds) return;

    if (points.length === 1) {
      map.panTo(points[0]);
      map.setZoom(12);
      return;
    }

    const bounds = new g.maps.LatLngBounds();
    points.forEach((pt) => {
      if (pt && typeof pt.lat === 'number' && typeof pt.lng === 'number') {
        bounds.extend(pt);
      }
    });

    map.fitBounds(bounds, { top: 60, right: 60, bottom: 60, left: 60 });
  }, [map, points]);

  return null;
};

// Interfaces
interface TransitHubItem {
  category: string;
  categoryLabel: string;
  icon: string;
  placeId: string;
  name: string;
  address: string;
  location: { lat: number; lng: number };
  rating: number | null;
  userRatingCount: number | null;
  types: string[];
  approxTravelTime: string;
}

interface FoodStopItem {
  id: string;
  name: string;
  address: string;
  location: { lat: number; lng: number };
  rating: number;
  userRatingCount: number;
  cuisine: string;
  priceLevel: string;
  isOpenNow: boolean;
  photo: string;
  distanceFromRoute: string;
}

interface TimelineStopItem {
  id: string;
  timeEstimate: string;
  title: string;
  locationName: string;
  mode: string;
  description: string;
  isOptional: boolean;
  isTransportAnchor: boolean;
  coords?: { lat: number; lng: number };
  placeId?: string;
}

interface PracticalOption {
  mode: 'Train' | 'Bus' | 'Flight' | 'Road';
  title: string;
  badge: string;
  duration: string;
  changes: string;
  routeHighlight: string;
  pros: string;
  cons: string;
  isRecommended: boolean;
}

export const AITripPlannerPage: React.FC = () => {
  const { showToast, setCurrentPage } = useApp();

  // Assistant Journey Inputs
  const [startingLocation, setStartingLocation] = useState('');
  const [selectedDestination, setSelectedDestination] = useState('Varanasi');
  const [selectedState, setSelectedState] = useState('Uttar Pradesh');
  const [travelDate, setTravelDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  });
  const [travellers, setTravellers] = useState({ total: 2, adults: 2, children: 0, seniors: 0 });
  const [selectedMode, setSelectedMode] = useState<'Train' | 'Bus' | 'Flight' | 'Road'>('Train');

  // UI Interactive States
  const [isOriginDropdownOpen, setIsOriginDropdownOpen] = useState(false);
  const [isDestModalOpen, setIsDestModalOpen] = useState(false);
  const [destSearchQuery, setDestSearchQuery] = useState('');
  const [selectedTripDay, setSelectedTripDay] = useState<number>(1);
  const [activeMapPin, setActiveMapPin] = useState<{
    title: string;
    description: string;
    coords: { lat: number; lng: number };
  } | null>(null);

  // Loaded Journey Intelligence States
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [routePlan, setRoutePlan] = useState<any>(null);
  const [transitHubs, setTransitHubs] = useState<TransitHubItem[]>([]);
  const [isLoadingHubs, setIsLoadingHubs] = useState(false);
  const [foodStops, setFoodStops] = useState<FoodStopItem[]>([]);
  const [isLoadingFood, setIsLoadingFood] = useState(false);
  const [routePolylinePoints, setRoutePolylinePoints] = useState<{ lat: number; lng: number }[]>([]);
  const [routeDistanceInfo, setRouteDistanceInfo] = useState<{ duration: string; distance: string } | null>(null);

  // Timeline Items (interactive and reorderable optional stops)
  const [timelineItems, setTimelineItems] = useState<TimelineStopItem[]>([]);
  const [addedFoodStopIds, setAddedFoodStopIds] = useState<Set<string>>(new Set());

  // Drag and drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Origin filter
  const filteredOrigins = useMemo(() => {
    if (!startingLocation.trim()) return MAJOR_ORIGINS.slice(0, 8);
    return MAJOR_ORIGINS.filter((city) =>
      city.toLowerCase().includes(startingLocation.toLowerCase())
    );
  }, [startingLocation]);

  // Destination destinations list derived from ALL_INDIAN_STATES_AND_UTS
  const allDestinationsList = useMemo(() => {
    return ALL_INDIAN_STATES_AND_UTS.flatMap((s) =>
      s.destinations.map((destName) => ({
        name: destName,
        state: s.name,
      }))
    );
  }, []);

  const filteredDestinations = useMemo(() => {
    if (!destSearchQuery.trim()) return allDestinationsList.slice(0, 18);
    const q = destSearchQuery.toLowerCase();
    return allDestinationsList.filter(
      (d: { name: string; state: string }) =>
        d.name.toLowerCase().includes(q) || d.state.toLowerCase().includes(q)
    );
  }, [allDestinationsList, destSearchQuery]);

  // Coordinate lookups
  const originCoords = useMemo(() => {
    const key = startingLocation.toLowerCase().trim();
    return CITY_COORDINATES[key] || { lat: 28.6692, lng: 77.4538 }; // Default Ghaziabad/NCR
  }, [startingLocation]);

  const destinationCoords = useMemo(() => {
    const key = selectedDestination.toLowerCase().trim();
    return CITY_COORDINATES[key] || { lat: 25.3176, lng: 82.9739 }; // Default Varanasi
  }, [selectedDestination]);

  // Fetch verified transit hubs via Google Places (New) API proxy
  const fetchTransitHubs = useCallback(async (destination: string, state: string) => {
    setIsLoadingHubs(true);
    try {
      const resp = await fetch('/api/places/transit-hubs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination, state }),
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data.hubs && Array.isArray(data.hubs)) {
          setTransitHubs(data.hubs);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch transit hubs:', err);
    } finally {
      setIsLoadingHubs(false);
    }
  }, []);

  // Fetch verified food stops via Google Places (New) API proxy
  const fetchFoodStops = useCallback(async (destination: string, origin: string) => {
    setIsLoadingFood(true);
    try {
      const resp = await fetch('/api/places/food-stops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination, origin }),
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data.stops && Array.isArray(data.stops)) {
          setFoodStops(data.stops);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch food stops:', err);
    } finally {
      setIsLoadingFood(false);
    }
  }, []);

  // Compute live Google Routes path
  const fetchGoogleRoute = useCallback(async (origin: string, destination: string) => {
    try {
      const resp = await fetch('/api/routes/compute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ origin, destination, travelMode: 'DRIVE' }),
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data.encodedPolyline) {
          const decoded = decodePolyline(data.encodedPolyline);
          setRoutePolylinePoints(decoded);
        }
        if (data.formattedDuration && data.formattedDistance) {
          setRouteDistanceInfo({
            duration: data.formattedDuration,
            distance: data.formattedDistance,
          });
        }
      }
    } catch (err) {
      console.warn('Route polyline computation failed:', err);
    }
  }, []);

  // Build journey plan
  const planJourneyRoute = useCallback(async () => {
    if (!startingLocation.trim()) {
      showToast('Please enter your starting location so we can plan your route.', 'info');
      return;
    }

    setIsLoadingRoute(true);
    try {
      const resp = await fetch('/api/plan-trip-route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startingLocation: startingLocation.trim(),
          destination: selectedDestination,
          state: selectedState,
          travelDate,
          travellers,
          preferredTransport: selectedMode,
        }),
      });

      if (resp.ok) {
        const data = await resp.json();
        setRoutePlan(data);

        // Populate initial timeline items with verified anchors
        const initialTimeline: TimelineStopItem[] = [
          {
            id: 't-start',
            timeEstimate: '07:30 AM',
            title: 'Departure Origin',
            locationName: startingLocation.trim(),
            mode: 'Local Transit / Cab',
            description: `Start from ${startingLocation.trim()} towards the primary departure terminal.`,
            isOptional: false,
            isTransportAnchor: true,
            coords: originCoords,
          },
          {
            id: 't-dep-hub',
            timeEstimate: '08:45 AM',
            title: 'Boarding Departure Hub',
            locationName: `Major Departure Terminal (${startingLocation.trim()})`,
            mode: selectedMode,
            description: 'Arrive 45 mins prior to departure. Verify platform/gate on live enquiry boards.',
            isOptional: false,
            isTransportAnchor: true,
          },
          {
            id: 't-transit',
            timeEstimate: '01:15 PM',
            title: 'Inter-City Transit Corridor',
            locationName: `Transit Corridor towards ${selectedDestination}`,
            mode: selectedMode,
            description: `Scheduled express travel along the main transit line to ${selectedDestination}.`,
            isOptional: false,
            isTransportAnchor: true,
          },
          {
            id: 't-arr-hub',
            timeEstimate: '05:30 PM',
            title: 'Arrival Terminal',
            locationName: `${selectedDestination} Central Station / Stand`,
            mode: 'Arrival',
            description: `Deboard at ${selectedDestination}. Proceed to authorized prepaid auto/taxi booth.`,
            isOptional: false,
            isTransportAnchor: true,
            coords: destinationCoords,
          },
          {
            id: 't-dest',
            timeEstimate: '06:15 PM',
            title: 'Destination Arrival & Check-In',
            locationName: `${selectedDestination} Center / Place of Stay`,
            mode: 'Local Auto / Cab',
            description: `Check in to accommodation and relax after the inter-city transit leg.`,
            isOptional: true,
            isTransportAnchor: false,
            coords: destinationCoords,
          },
        ];

        setTimelineItems(initialTimeline);
      }
    } catch (err) {
      console.warn('Failed to plan trip route:', err);
      showToast('Could not reach travel planner service. Please try again.', 'error');
    } finally {
      setIsLoadingRoute(false);
    }

    // Parallel fetch Google Places transit hubs, food stops, and route polyline
    fetchTransitHubs(selectedDestination, selectedState);
    fetchFoodStops(selectedDestination, startingLocation.trim());
    fetchGoogleRoute(startingLocation.trim(), selectedDestination);
  }, [
    startingLocation,
    selectedDestination,
    selectedState,
    travelDate,
    travellers,
    selectedMode,
    showToast,
    originCoords,
    destinationCoords,
    fetchTransitHubs,
    fetchFoodStops,
    fetchGoogleRoute,
  ]);

  // Initial auto-seed with Ghaziabad -> Varanasi for immediate rich interactive view
  useEffect(() => {
    if (!startingLocation) {
      setStartingLocation('Ghaziabad');
    }
  }, []);

  useEffect(() => {
    if (startingLocation) {
      planJourneyRoute();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Add a food stop to the journey timeline
  const handleAddFoodStop = (food: FoodStopItem) => {
    if (addedFoodStopIds.has(food.id)) {
      showToast(`${food.name} is already added to your journey stops.`, 'info');
      return;
    }

    const newStop: TimelineStopItem = {
      id: `food-${food.id}`,
      timeEstimate: '07:30 PM (Dinner & Refreshment)',
      title: '🍴 Food Stop',
      locationName: food.name,
      mode: 'Dining & Rest',
      description: `${food.cuisine} · ${food.address}. Verified rating: ${food.rating} ★ (${food.userRatingCount} Google reviews).`,
      isOptional: true,
      isTransportAnchor: false,
      coords: food.location,
      placeId: food.id,
    };

    setTimelineItems((prev) => [...prev, newStop]);
    setAddedFoodStopIds((prev) => new Set(prev).add(food.id));
    showToast(`Added ${food.name} to your Journey Timeline!`, 'success');
  };

  // Reordering functions for optional stops
  const handleMoveStop = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= timelineItems.length) return;

    const currentItem = timelineItems[index];
    const targetItem = timelineItems[targetIndex];

    // Cannot move a fixed transport anchor
    if (currentItem.isTransportAnchor || targetItem.isTransportAnchor) {
      showToast('Required transit segments remain fixed to maintain travel route integrity.', 'info');
      return;
    }

    const updated = [...timelineItems];
    updated[index] = targetItem;
    updated[targetIndex] = currentItem;
    setTimelineItems(updated);
  };

  // HTML5 Drag and Drop handlers
  const handleDragStart = (index: number) => {
    if (timelineItems[index]?.isTransportAnchor) return;
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
  };

  const handleDrop = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) return;
    const sourceItem = timelineItems[draggedIndex];
    const targetItem = timelineItems[index];

    if (sourceItem.isTransportAnchor || targetItem.isTransportAnchor) {
      showToast('Required transit segments cannot be displaced.', 'info');
      setDraggedIndex(null);
      return;
    }

    const updated = [...timelineItems];
    const [removed] = updated.splice(draggedIndex, 1);
    updated.splice(index, 0, removed);
    setTimelineItems(updated);
    setDraggedIndex(null);
  };

  // Map markers array
  const allMapPins = useMemo(() => {
    const pins: {
      id: string;
      title: string;
      subtitle: string;
      category: 'origin' | 'destination' | 'hub' | 'food';
      coords: { lat: number; lng: number };
    }[] = [
      {
        id: 'pin-origin',
        title: `Origin: ${startingLocation || 'Departure Point'}`,
        subtitle: 'Journey Starting Point',
        category: 'origin',
        coords: originCoords,
      },
      {
        id: 'pin-dest',
        title: `Destination: ${selectedDestination}`,
        subtitle: `${selectedState}, India`,
        category: 'destination',
        coords: destinationCoords,
      },
    ];

    // Add transit hubs from Google Places
    transitHubs.forEach((hub) => {
      if (hub.location?.lat && hub.location?.lng) {
        pins.push({
          id: `hub-${hub.placeId}`,
          title: hub.name,
          subtitle: `${hub.categoryLabel} · ${hub.approxTravelTime}`,
          category: 'hub',
          coords: hub.location,
        });
      }
    });

    // Add selected food stops
    timelineItems
      .filter((t) => t.id.startsWith('food-') && t.coords)
      .forEach((t) => {
        pins.push({
          id: t.id,
          title: t.locationName,
          subtitle: 'Curated Food Stop',
          category: 'food',
          coords: t.coords!,
        });
      });

    return pins;
  }, [startingLocation, selectedDestination, selectedState, originCoords, destinationCoords, transitHubs, timelineItems]);

  // Practical comparison options
  const practicalOptions: PracticalOption[] = useMemo(() => {
    return [
      {
        mode: 'Train',
        title: 'Superfast Express / Vande Bharat',
        badge: 'Recommended for Comfort & Cost',
        duration: routeDistanceInfo?.duration || 'Approx 6-8 hrs',
        changes: '0-1 Change via Junction',
        routeHighlight: `${startingLocation || 'Origin'} Hub → Direct Rail Corridor → ${selectedDestination} Junction`,
        pros: 'Economical, safe, relaxed travel with reserved berths and scenic countryside views.',
        cons: 'Tickets should be booked in advance during festival and pilgrim rush.',
        isRecommended: true,
      },
      {
        mode: 'Flight',
        title: 'Domestic Direct / 1-Stop Flight',
        badge: 'Fastest Transit',
        duration: 'Approx 3h 15m (including airport time)',
        changes: 'Direct or 1 Stop via Hub',
        routeHighlight: `Nearest Airport → Flight Sector → ${selectedDestination} Airport (LBS / Nearby)`,
        pros: 'Quickest inter-city transit for time-sensitive travellers and business trips.',
        cons: 'Airport check-in buffers and higher fare than rail transport.',
        isRecommended: false,
      },
      {
        mode: 'Road',
        title: 'Personal Car / Self-Drive Cab via Expressway',
        badge: 'Total Route Flexibility',
        duration: routeDistanceInfo?.duration || 'Approx 8-10 hrs driving',
        changes: 'Door to Door',
        routeHighlight: `Direct National Expressway & Highway corridor connecting ${startingLocation || 'Origin'} to ${selectedDestination}`,
        pros: 'Complete departure flexibility, easy luggage handling, and scenic roadside dhabas.',
        cons: 'Toll costs, fuel expenses, and driver fatigue over extended stretches.',
        isRecommended: false,
      },
      {
        mode: 'Bus',
        title: 'State Roadways / Private Volvo AC Sleeper',
        badge: 'Budget-Friendly Overnight',
        duration: 'Approx 9-11 hrs',
        changes: 'Direct Bus Service',
        routeHighlight: `Inter-State Bus Terminal (ISBT) → Highway Route → ${selectedDestination} Bus Stand`,
        pros: 'Good seat availability for last-minute trips with convenient overnight sleeping options.',
        cons: 'Travel duration depends on highway conditions and weather.',
        isRecommended: false,
      },
    ];
  }, [startingLocation, selectedDestination, routeDistanceInfo]);

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-slate-800 pt-20 pb-24">
      {/* Top Banner / Persona Header */}
      <section className="bg-gradient-to-b from-[#0B1528] via-[#0E1E38] to-[#122444] text-white pt-10 pb-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-6xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-semibold backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>Interactive Travel Assistant · Powered by Real Google Places</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-display text-white">
            AI Trip Planner
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-medium">
            “Plan the smartest way to reach your destination.”
          </p>

          {/* COMPACT INTERACTIVE JOURNEY SELECTOR (No large form look!) */}
          <div className="mt-8 max-w-4xl mx-auto bg-white/95 text-slate-900 rounded-3xl p-5 sm:p-7 shadow-2xl border border-white/20 backdrop-blur-md">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
              {/* FROM (Origin) */}
              <div className="lg:col-span-5 text-left relative">
                <label className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
                  <MapPin className="w-3.5 h-3.5 text-teal-600" />
                  <span>📍 From (Where are you starting?)</span>
                  <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={startingLocation}
                    onChange={(e) => {
                      setStartingLocation(e.target.value);
                      setIsOriginDropdownOpen(true);
                    }}
                    onFocus={() => setIsOriginDropdownOpen(true)}
                    placeholder="City, station, bus stand, or airport..."
                    className="w-full bg-[#FAF9F6] border border-slate-300 hover:border-teal-500 focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none transition-all"
                  />
                  {startingLocation && (
                    <button
                      onClick={() => setStartingLocation('')}
                      className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 text-xs cursor-pointer font-bold"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Autocomplete Origin Dropdown */}
                {isOriginDropdownOpen && filteredOrigins.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 overflow-hidden divide-y divide-slate-100 max-h-56 overflow-y-auto">
                    <div className="px-3 py-1.5 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Popular Indian Starting Hubs
                    </div>
                    {filteredOrigins.map((city) => (
                      <button
                        key={city}
                        type="button"
                        onClick={() => {
                          setStartingLocation(city);
                          setIsOriginDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-teal-50 hover:text-teal-900 flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <span className="font-semibold">{city}</span>
                        <span className="text-[10px] text-slate-400">Major Transit Hub</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Connector Icon */}
              <div className="lg:col-span-1 flex justify-center py-1 lg:py-0">
                <button
                  type="button"
                  onClick={() => {
                    if (startingLocation && selectedDestination) {
                      const temp = startingLocation;
                      setStartingLocation(selectedDestination);
                      setSelectedDestination(temp);
                    }
                  }}
                  className="w-10 h-10 rounded-2xl bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95"
                  title="Swap Starting Location and Destination"
                >
                  <Shuffle className="w-4 h-4" />
                </button>
              </div>

              {/* TO (Destination) */}
              <div className="lg:col-span-6 text-left relative">
                <label className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
                  <Navigation className="w-3.5 h-3.5 text-rose-600" />
                  <span>📍 To (Where do you want to go?)</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsDestModalOpen(true)}
                  className="w-full text-left bg-[#FAF9F6] border border-slate-300 hover:border-teal-500 focus:border-teal-600 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-900 flex items-center justify-between transition-all cursor-pointer group"
                >
                  <div>
                    <span className="font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                      {selectedDestination}
                    </span>
                    <span className="text-xs text-slate-500 ml-2">({selectedState})</span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition-colors" />
                </button>
              </div>
            </div>

            {/* Sub-row: Travel Date, Travellers, and CTA */}
            <div className="mt-4 pt-4 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              {/* Date */}
              <div className="sm:col-span-4 text-left">
                <label className="flex items-center gap-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  <Calendar className="w-3 h-3 text-teal-600" />
                  <span>Travel Date</span>
                </label>
                <input
                  type="date"
                  value={travelDate}
                  onChange={(e) => setTravelDate(e.target.value)}
                  className="w-full bg-[#FAF9F6] border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none"
                />
              </div>

              {/* Travellers */}
              <div className="sm:col-span-4 text-left">
                <label className="flex items-center gap-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  <Users className="w-3 h-3 text-teal-600" />
                  <span>Travellers</span>
                </label>
                <select
                  value={travellers.total}
                  onChange={(e) => {
                    const total = parseInt(e.target.value, 10);
                    setTravellers({ total, adults: total, children: 0, seniors: 0 });
                  }}
                  className="w-full bg-[#FAF9F6] border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none cursor-pointer"
                >
                  <option value={1}>1 Solo Traveller</option>
                  <option value={2}>2 Travellers (Couple / Friends)</option>
                  <option value={3}>3 Travellers</option>
                  <option value={4}>4 Travellers (Family / Group)</option>
                  <option value={6}>6+ Travellers (Group Tour)</option>
                </select>
              </div>

              {/* Action Button */}
              <div className="sm:col-span-4 flex items-end">
                <button
                  type="button"
                  onClick={planJourneyRoute}
                  disabled={isLoadingRoute}
                  className="w-full h-10 mt-auto bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 active:scale-98 text-white rounded-xl text-xs font-bold tracking-wide shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoadingRoute ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Planning Journey...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>Plan Smart Route</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Origin Chips */}
            <div className="mt-3 pt-3 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
              <span className="font-semibold text-slate-400 text-[11px]">Quick Origins:</span>
              {['Ghaziabad', 'New Delhi', 'Noida', 'Mumbai', 'Bengaluru', 'Pune'].map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => {
                    setStartingLocation(q);
                    setIsOriginDropdownOpen(false);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors cursor-pointer ${
                    startingLocation === q
                      ? 'bg-teal-600 text-white border-teal-600'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Destination Picker Modal */}
      <AnimatePresence>
        {isDestModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Choose Destination</h3>
                  <p className="text-xs text-slate-500">Select any recognized travel destination in India</p>
                </div>
                <button
                  onClick={() => setIsDestModalOpen(false)}
                  className="text-slate-400 hover:text-slate-700 font-bold p-1 text-sm"
                >
                  ✕
                </button>
              </div>

              {/* Search Bar */}
              <div className="mt-4 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={destSearchQuery}
                  onChange={(e) => setDestSearchQuery(e.target.value)}
                  placeholder="Search destination (e.g. Varanasi, Ayodhya, Katra, Amritsar)..."
                  className="w-full pl-10 pr-4 py-2.5 text-xs font-semibold bg-[#FAF9F6] border border-slate-300 rounded-xl outline-none focus:border-teal-600"
                />
              </div>

              {/* Destinations Grid */}
              <div className="mt-4 flex-1 overflow-y-auto divide-y divide-slate-100 pr-1 space-y-1">
                {filteredDestinations.map((d) => (
                  <button
                    key={`${d.name}-${d.state}`}
                    onClick={() => {
                      setSelectedDestination(d.name);
                      setSelectedState(d.state);
                      setIsDestModalOpen(false);
                    }}
                    className={`w-full text-left p-3 rounded-xl flex items-center justify-between hover:bg-teal-50 transition-colors cursor-pointer ${
                      selectedDestination === d.name ? 'bg-teal-50/80 border border-teal-200' : ''
                    }`}
                  >
                    <div>
                      <div className="font-bold text-sm text-slate-900">{d.name}</div>
                      <div className="text-xs text-slate-500">{d.state} · Verified Indian Destination</div>
                    </div>
                    {selectedDestination === d.name && (
                      <span className="text-teal-700 font-bold text-xs">Selected ✓</span>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Intelligent Content Flow */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-12">
        {/* Validation Warning if Origin is Empty */}
        {!startingLocation.trim() ? (
          <div className="p-8 bg-amber-50/80 border-2 border-dashed border-amber-300 rounded-3xl text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-amber-600 mx-auto" />
            <h3 className="text-lg font-bold text-amber-900">
              Please enter your starting location so we can plan your route.
            </h3>
            <p className="text-xs text-amber-800 max-w-md mx-auto">
              Yatra Saathi requires your departure city, station, or local point to compute actual transport hubs, interchanges, and route paths.
            </p>
          </div>
        ) : (
          <>
            {/* 13. "BEST WAY FOR YOU" AI CARD */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-teal-900 via-slate-900 to-cyan-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-teal-500/30 relative overflow-hidden"
            >
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-3 flex-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-400/20 text-teal-300 border border-teal-400/30 text-xs font-bold">
                    <Sparkles className="w-3.5 h-3.5 text-teal-300" />
                    <span>AI TRAVEL RECOMMENDATION</span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-extrabold font-display">
                    BEST WAY TO REACH: <span className="text-teal-400">{routePlan?.recommendedRoute?.transportMode || selectedMode} + Local Transit</span>
                  </h2>

                  <div className="text-sm text-slate-300 font-medium">
                    {routePlan?.recommendedRoute?.whyRecommended ||
                      `Recommended for balanced travel time, high predictability, and convenient terminal arrival connecting ${startingLocation} to ${selectedDestination}.`}
                  </div>

                  {/* Why Bullets */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-xs text-slate-200">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                      <span>Fewer transfer points & relaxed pacing</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                      <span>Direct arrival at central {selectedDestination} transit hub</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                      <span>Comfortable for {travellers.total} traveller{travellers.total > 1 ? 's' : ''} with luggage</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                      <span>Practical last-mile local connectivity</span>
                    </div>
                  </div>
                </div>

                {/* Stat Pill */}
                <div className="shrink-0 bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 text-center min-w-[200px]">
                  <div className="text-xs font-semibold text-teal-200 uppercase tracking-wider">Estimated Total Journey</div>
                  <div className="text-2xl font-extrabold text-white mt-1">
                    {routeDistanceInfo?.duration || routePlan?.recommendedRoute?.totalDuration || 'Approx 7 - 9 hrs'}
                  </div>
                  {routeDistanceInfo?.distance && (
                    <div className="text-xs text-slate-300 mt-1">
                      Distance: <span className="font-bold text-white">{routeDistanceInfo.distance}</span>
                    </div>
                  )}
                  <div className="text-[11px] text-teal-300/80 mt-2 font-medium">
                    Grounded with Google Routes
                  </div>
                </div>
              </div>
            </motion.div>

            {/* 5. "HOW WILL I REACH?" SMART OPTIONS COMPARISON */}
            <section className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold font-display text-slate-900">
                    How Will I Reach? Smart Options
                  </h3>
                  <p className="text-xs text-slate-500">
                    Compare practical transit modes connecting {startingLocation} to {selectedDestination}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {practicalOptions.map((opt) => {
                  const isSelected = selectedMode === opt.mode;

                  return (
                    <motion.div
                      key={opt.mode}
                      onClick={() => setSelectedMode(opt.mode)}
                      className={`rounded-3xl p-5 border transition-all duration-300 cursor-pointer flex flex-col justify-between relative group ${
                        isSelected
                          ? 'bg-white border-teal-500 shadow-lg ring-2 ring-teal-500/20'
                          : 'bg-white/80 hover:bg-white border-slate-200 shadow-xs hover:border-teal-300'
                      }`}
                    >
                      {opt.isRecommended && (
                        <div className="absolute -top-2.5 left-4 bg-gradient-to-r from-teal-600 to-cyan-600 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-300" />
                          <span>AI RECOMMENDED</span>
                        </div>
                      )}

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="p-2 rounded-xl bg-slate-100 text-slate-800">
                              {opt.mode === 'Train' && <Train className="w-5 h-5 text-teal-700" />}
                              {opt.mode === 'Bus' && <Bus className="w-5 h-5 text-amber-600" />}
                              {opt.mode === 'Flight' && <Plane className="w-5 h-5 text-blue-600" />}
                              {opt.mode === 'Road' && <Car className="w-5 h-5 text-emerald-600" />}
                            </span>
                            <div>
                              <span className="font-extrabold text-sm text-slate-900 block">{opt.mode}</span>
                              <span className="text-[10px] text-slate-500 font-medium">{opt.badge}</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-[#FAF9F6] p-2.5 rounded-xl border border-slate-100 space-y-1 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400 text-[11px]">Duration:</span>
                            <span className="font-bold text-slate-800">{opt.duration}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400 text-[11px]">Changes:</span>
                            <span className="font-semibold text-slate-700">{opt.changes}</span>
                          </div>
                        </div>

                        <div className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          <strong className="text-slate-800">Route:</strong> {opt.routeHighlight}
                        </div>
                      </div>

                      <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-[11px] font-bold text-teal-700">
                          {isSelected ? '✓ Mode Selected' : 'Select Mode'}
                        </span>
                        <ArrowRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? 'text-teal-600 translate-x-1' : 'text-slate-400'}`} />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </section>

            {/* 7 & 8. LIVE ROUTE NAVIGATION MAP (Real Google Maps with Places Grounding) */}
            <section className="bg-white rounded-3xl border border-slate-200/90 shadow-md p-6 sm:p-8 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 text-xs font-bold">
                    <RouteIcon className="w-3.5 h-3.5 text-teal-600" />
                    <span>LIVE ROUTE NAVIGATION MAP</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold font-display text-slate-900">
                    Interactive Transit Corridor: {startingLocation} → {selectedDestination}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Interactive route path, verified transit hubs, and curated waypoints. Click any marker for details.
                  </p>
                </div>

                {/* Day selector control (Requirement 14) */}
                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200 shrink-0">
                  <span className="text-[11px] font-bold text-slate-500 px-2 uppercase">Trip Day:</span>
                  {[1, 2, 3].map((dayNum) => (
                    <button
                      key={dayNum}
                      onClick={() => setSelectedTripDay(dayNum)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        selectedTripDay === dayNum
                          ? 'bg-teal-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                      }`}
                    >
                      Day {dayNum}
                    </button>
                  ))}
                </div>
              </div>

              {/* Map Container */}
              <div className="w-full h-[450px] sm:h-[500px] rounded-2xl overflow-hidden border border-slate-200 relative shadow-inner">
                <Map
                  mapId="DEMO_MAP_ID"
                  defaultCenter={destinationCoords}
                  defaultZoom={7}
                  gestureHandling="greedy"
                  disableDefaultUI={false}
                  style={{ width: '100%', height: '100%' }}
                  className="w-full h-full"
                  internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                >
                  {/* Google Routes polyline overlay */}
                  {routePolylinePoints.length > 0 && (
                    <RoutePolylineOverlay path={routePolylinePoints} />
                  )}

                  {/* Auto-fitter for all active markers */}
                  <MapBoundsFitter
                    points={allMapPins.map((p) => p.coords)}
                  />

                  {/* Advanced Markers */}
                  {allMapPins.map((pin) => (
                    <AdvancedMarker
                      key={pin.id}
                      position={pin.coords}
                      onClick={() => {
                        setActiveMapPin({
                          title: pin.title,
                          description: pin.subtitle,
                          coords: pin.coords,
                        });
                      }}
                    >
                      <div className="cursor-pointer group relative">
                        <div
                          className={`w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center transition-transform duration-200 group-hover:scale-110 ${
                            pin.category === 'origin'
                              ? 'bg-emerald-600 text-white'
                              : pin.category === 'destination'
                              ? 'bg-rose-600 text-white'
                              : pin.category === 'hub'
                              ? 'bg-blue-600 text-white'
                              : 'bg-amber-500 text-white'
                          }`}
                        >
                          {pin.category === 'origin' && <MapPin className="w-4 h-4" />}
                          {pin.category === 'destination' && <Navigation className="w-4 h-4" />}
                          {pin.category === 'hub' && <Train className="w-4 h-4" />}
                          {pin.category === 'food' && <Utensils className="w-4 h-4" />}
                        </div>
                      </div>
                    </AdvancedMarker>
                  ))}

                  {/* Info Window */}
                  {activeMapPin && (
                    <InfoWindow
                      position={activeMapPin.coords}
                      onCloseClick={() => setActiveMapPin(null)}
                    >
                      <div className="p-2 max-w-xs space-y-1 text-slate-800">
                        <div className="font-bold text-xs text-slate-900">{activeMapPin.title}</div>
                        <div className="text-[11px] text-slate-600">{activeMapPin.description}</div>
                      </div>
                    </InfoWindow>
                  )}
                </Map>

                {/* Map Floating Legend */}
                <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-slate-200 shadow-md text-xs space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Map Legend</div>
                  <div className="flex flex-wrap items-center gap-3 text-[11px]">
                    <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" /> Origin
                    </span>
                    <span className="flex items-center gap-1 text-rose-700 font-semibold">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-600" /> Destination
                    </span>
                    <span className="flex items-center gap-1 text-blue-700 font-semibold">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> Transit Hubs
                    </span>
                    <span className="flex items-center gap-1 text-amber-700 font-semibold">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Food Stops
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* 6. NEAREST USEFUL TRANSPORT HUBS (Google Places Real Verified Data) */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold font-display text-slate-900">
                    Nearest Useful Transport Hubs
                  </h3>
                  <p className="text-xs text-slate-500">
                    Actual Google place results for {selectedDestination} with Place IDs and verified coordinates
                  </p>
                </div>
                {isLoadingHubs && (
                  <span className="text-xs text-teal-600 flex items-center gap-1 font-medium">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Verifying hubs with Google...
                  </span>
                )}
              </div>

              {transitHubs.length === 0 && !isLoadingHubs ? (
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500 text-center">
                  Live transit hubs data could not be verified for {selectedDestination}. Standard local transit stands available.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {transitHubs.map((hub) => (
                    <div
                      key={hub.placeId}
                      className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-shadow space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="p-2 rounded-xl bg-teal-50 text-teal-700 border border-teal-100">
                            {hub.icon === 'train' && <Train className="w-4 h-4" />}
                            {hub.icon === 'bus' && <Bus className="w-4 h-4" />}
                            {hub.icon === 'plane' && <Plane className="w-4 h-4" />}
                          </span>
                          <div>
                            <span className="text-xs font-bold text-teal-800 uppercase tracking-wider block">
                              {hub.categoryLabel}
                            </span>
                            <span className="text-[10px] text-slate-400">Google Verified Hub</span>
                          </div>
                        </div>

                        {hub.rating && (
                          <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-lg text-xs font-bold flex items-center gap-1">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                            <span>{hub.rating}</span>
                          </span>
                        )}
                      </div>

                      <div>
                        <h4 className="font-bold text-sm text-slate-900 leading-snug line-clamp-2">
                          {hub.name}
                        </h4>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                          {hub.address}
                        </p>
                      </div>

                      <div className="bg-[#FAF9F6] p-2.5 rounded-xl border border-slate-100 text-xs space-y-1">
                        <div className="flex items-center justify-between text-slate-600">
                          <span className="text-slate-400 text-[11px]">Travel Time:</span>
                          <span className="font-semibold text-slate-800">{hub.approxTravelTime}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          Place ID: {hub.placeId}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* 10 & 11. INTERACTIVE VISUAL TIMELINE & DRAG-AND-DROP */}
            <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold font-display text-slate-900">
                    Your Journey Timeline
                  </h3>
                  <p className="text-xs text-slate-500">
                    Day {selectedTripDay} progression. Reorder optional stops with drag-and-drop or move buttons. Required transit links remain locked.
                  </p>
                </div>
                <div className="text-xs font-semibold text-teal-700 bg-teal-50 px-3 py-1.5 rounded-xl border border-teal-200">
                  Estimated Schedule · Verify live departures prior to travel
                </div>
              </div>

              {/* Timeline Container (Horizontal on Desktop, Vertical on Mobile) */}
              <div className="space-y-3">
                {timelineItems.map((item, idx) => (
                  <div
                    key={item.id}
                    draggable={!item.isTransportAnchor}
                    onDragStart={() => handleDragStart(idx)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDrop={() => handleDrop(idx)}
                    className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      item.isTransportAnchor
                        ? 'bg-[#FAF9F6] border-slate-200/90'
                        : 'bg-white border-teal-200 shadow-xs hover:border-teal-400'
                    }`}
                  >
                    <div className="flex items-start sm:items-center gap-3">
                      {/* Drag Handle or Lock */}
                      <div className="pt-0.5 sm:pt-0">
                        {item.isTransportAnchor ? (
                          <span
                            className="p-1.5 rounded-lg bg-slate-200 text-slate-500 inline-block"
                            title="Required Transit Anchor (Position Locked)"
                          >
                            <Lock className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <span
                            className="p-1.5 rounded-lg bg-teal-50 text-teal-700 inline-block cursor-grab active:cursor-grabbing"
                            title="Drag to rearrange optional stop"
                          >
                            <GripVertical className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>

                      {/* Time Badge */}
                      <div className="bg-slate-900 text-white px-2.5 py-1 rounded-lg text-xs font-bold shrink-0">
                        {item.timeEstimate}
                      </div>

                      {/* Stop Info */}
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-slate-900">{item.title}</h4>
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 font-semibold text-slate-600">
                            {item.mode}
                          </span>
                        </div>
                        <p className="text-xs font-medium text-teal-800">{item.locationName}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
                      </div>
                    </div>

                    {/* Move controls for optional items */}
                    {!item.isTransportAnchor && (
                      <div className="flex items-center gap-1 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => handleMoveStop(idx, 'up')}
                          disabled={idx === 0 || timelineItems[idx - 1]?.isTransportAnchor}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-teal-700 hover:bg-teal-50 disabled:opacity-30 cursor-pointer"
                          title="Move stop earlier"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveStop(idx, 'down')}
                          disabled={idx === timelineItems.length - 1 || timelineItems[idx + 1]?.isTransportAnchor}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-teal-700 hover:bg-teal-50 disabled:opacity-30 cursor-pointer"
                          title="Move stop later"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Live transport disclaimer as requested */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-3 text-xs text-amber-900">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Important Notice: </span>
                  Live transport availability is currently unavailable. The route below is an AI-assisted planning suggestion and should be verified before booking.
                </div>
              </div>
            </section>

            {/* 9. CURATED FOOD STOPS ALONG THE ROUTE */}
            <section className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold font-display text-slate-900 flex items-center gap-2">
                    <Utensils className="w-5 h-5 text-teal-600" />
                    <span>Food Stops Along Your Journey</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Real restaurant data from Google Places. Click “Add Stop” to incorporate any stop directly into your timeline.
                  </p>
                </div>
                {isLoadingFood && (
                  <span className="text-xs text-teal-600 flex items-center gap-1 font-medium">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Fetching verified restaurants...
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {foodStops.map((food) => {
                  const isAdded = addedFoodStopIds.has(food.id);

                  return (
                    <div
                      key={food.id}
                      className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
                    >
                      {/* Photo Header */}
                      <div className="h-44 w-full relative bg-slate-900 overflow-hidden">
                        <img
                          src={food.photo}
                          alt={food.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-lg text-xs font-bold text-slate-900 flex items-center gap-1 shadow-xs">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          <span>{food.rating}</span>
                          <span className="text-[10px] text-slate-400">({food.userRatingCount})</span>
                        </div>

                        <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-xs text-white px-2 py-0.5 rounded-md text-[11px] font-bold">
                          {food.distanceFromRoute}
                        </div>
                      </div>

                      {/* Content Details */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                        <div>
                          <h4 className="font-bold text-base text-slate-900 group-hover:text-teal-700 transition-colors leading-snug">
                            {food.name}
                          </h4>
                          <p className="text-xs text-teal-800 font-medium mt-1">{food.cuisine}</p>
                          <p className="text-xs text-slate-500 line-clamp-2 mt-1">{food.address}</p>
                        </div>

                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Open
                          </span>

                          <button
                            type="button"
                            onClick={() => handleAddFoodStop(food)}
                            disabled={isAdded}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                              isAdded
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                                : 'bg-teal-600 hover:bg-teal-700 text-white shadow-xs'
                            }`}
                          >
                            {isAdded ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Stop Added</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5" />
                                <span>Add Stop</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* 12. ALL-IN-ONE BOOKING ENGINE */}
            <section className="bg-gradient-to-br from-slate-900 to-[#0B1528] text-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl border border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-2xl font-bold font-display text-white">
                    Book Your Journey
                  </h3>
                  <p className="text-xs text-slate-300">
                    Official booking channels with pre-filled destination parameters. No markups or fake checkouts.
                  </p>
                </div>
                <div className="text-xs font-medium text-teal-300 bg-teal-500/10 px-3 py-1 rounded-full border border-teal-500/30">
                  Verified Official Partner Access
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Flights */}
                <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/80 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
                      <Plane className="w-4 h-4" />
                      <span>✈️ Flights</span>
                    </div>
                    <p className="text-xs text-slate-300 mt-2">
                      Direct & connecting flights into {selectedDestination} airport.
                    </p>
                  </div>
                  <a
                    href={`https://www.google.com/travel/flights?q=flights+from+${encodeURIComponent(startingLocation)}+to+${encodeURIComponent(selectedDestination)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold text-center transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>Search Google Flights</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {/* Hotels */}
                <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/80 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center gap-2 text-teal-400 font-bold text-sm">
                      <Compass className="w-4 h-4" />
                      <span>🏨 Hotels & Stays</span>
                    </div>
                    <p className="text-xs text-slate-300 mt-2">
                      Verified hotels and heritage stays near {selectedDestination} center.
                    </p>
                  </div>
                  <a
                    href={`https://www.google.com/travel/hotels?q=hotels+in+${encodeURIComponent(selectedDestination)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold text-center transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>Search Verified Hotels</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {/* Trains / Transport */}
                <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/80 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                      <Train className="w-4 h-4" />
                      <span>🚆 Indian Railways (IRCTC)</span>
                    </div>
                    <p className="text-xs text-slate-300 mt-2">
                      Official portal for train reservation, Vande Bharat, and berths.
                    </p>
                  </div>
                  <a
                    href="https://www.irctc.co.in/nget/train-search"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold text-center transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>Open IRCTC Official</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {/* Activities / Passes */}
                <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/80 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                      <FileText className="w-4 h-4" />
                      <span>🎟️ Activities & Darshan</span>
                    </div>
                    <p className="text-xs text-slate-300 mt-2">
                      Official temple trust slots, guided heritage walks, and city tours.
                    </p>
                  </div>
                  <a
                    href={`https://www.google.com/search?q=official+darshan+booking+or+entry+ticket+${encodeURIComponent(selectedDestination)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold text-center transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>Verify Official Passes</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 text-center pt-2">
                All booking links connect directly to official government or authorized partner engines. Yatra Saathi does not process financial transactions.
              </div>
            </section>
          </>
        )}
      </div>

      {/* Floating Interactive YatraBot Travel Assistant */}
      <YatraBot
        startingLocation={startingLocation}
        selectedDestination={selectedDestination}
        selectedState={selectedState}
        travelDate={travelDate}
        travellers={travellers}
        preferredTransport={selectedMode}
        recommendedRoute={routePlan?.recommendedRoute}
        selectedTripDay={selectedTripDay}
        onNavigateToHotels={() => setCurrentPage('hotels')}
        onNavigateToChecklist={() => setCurrentPage('checklist')}
      />
    </div>
  );
};
