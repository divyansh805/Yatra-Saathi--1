import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Map,
  AdvancedMarker,
  InfoWindow,
  useMap,
} from '@vis.gl/react-google-maps';
import { Accommodation, DestinationItem, NearbyPlace } from '../types';
import { Compass, RefreshCw, Star, MapPin, Building, Train, Bus, Plane } from 'lucide-react';

interface InteractiveMapProps {
  destination: DestinationItem;
  accommodations: Accommodation[];
  nearbyAttractions: NearbyPlace[];
  selectedHotelId?: string;
  onSelectHotel?: (hotelId: string) => void;
  onSelectPlace?: (placeId: string) => void;
}

interface ActiveInfoData {
  type: 'destination' | 'hotel' | 'transit' | 'attraction';
  position: { lat: number; lng: number };
  title: string;
  subtitle?: string;
  extra?: string;
  price?: number;
  rating?: number;
  reviews?: number;
  id?: string;
  transitType?: string;
}

// Controller to smoothly adjust map bounds and recenter
function MapRecenterController({
  destination,
  resetTrigger,
}: {
  destination: DestinationItem;
  resetTrigger: number;
}) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    map.panTo({
      lat: destination.coordinates.lat,
      lng: destination.coordinates.lng,
    });
    map.setZoom(13);
  }, [map, destination, resetTrigger]);

  return null;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  destination,
  accommodations,
  nearbyAttractions,
  selectedHotelId,
  onSelectHotel,
  onSelectPlace,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'hotels' | 'transit' | 'attractions'>('all');
  const [activeInfo, setActiveInfo] = useState<ActiveInfoData | null>(null);
  const [resetCount, setResetCount] = useState(0);

  // Close info window when destination changes
  useEffect(() => {
    setActiveInfo(null);
  }, [destination]);

  // Derived transit hubs
  const transitHubs = useMemo(() => {
    return [
      {
        id: 'transit-train',
        name: destination.nearestTransit.railwayStation,
        type: 'Railway Station',
        icon: '🚆',
        iconComp: Train,
        color: '#2563EB',
        position: {
          lat: destination.coordinates.lat + 0.012,
          lng: destination.coordinates.lng - 0.015,
        },
      },
      {
        id: 'transit-bus',
        name: destination.nearestTransit.busStand,
        type: 'Bus Stand',
        icon: '🚌',
        iconComp: Bus,
        color: '#D97706',
        position: {
          lat: destination.coordinates.lat - 0.008,
          lng: destination.coordinates.lng + 0.011,
        },
      },
      {
        id: 'transit-flight',
        name: destination.nearestTransit.airport,
        type: 'Airport',
        icon: '✈️',
        iconComp: Plane,
        color: '#7C3AED',
        position: {
          lat: destination.coordinates.lat - 0.035,
          lng: destination.coordinates.lng - 0.025,
        },
      },
    ];
  }, [destination]);

  const handleResetView = useCallback(() => {
    setResetCount((prev) => prev + 1);
    setActiveInfo(null);
  }, []);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col">
      {/* Map Control Header */}
      <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/60">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Google Maps Ground & Transit Explorer
            </h3>
            <p className="text-[11px] text-slate-500">
              Interactive Google Maps intelligence for {destination.name}, {destination.state}
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 text-xs">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Points
          </button>
          <button
            onClick={() => setActiveFilter('hotels')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
              activeFilter === 'hotels'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Stays ({accommodations.length})
          </button>
          <button
            onClick={() => setActiveFilter('transit')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
              activeFilter === 'transit'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Transit Hubs
          </button>
          <button
            onClick={() => setActiveFilter('attractions')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
              activeFilter === 'attractions'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Attractions ({nearbyAttractions.length})
          </button>
          <button
            onClick={handleResetView}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors ml-1 cursor-pointer"
            title="Reset to Destination Center"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Map Container - Strict explicit height (CF2) */}
      <div className="relative w-full h-[400px] sm:h-[460px] z-0">
        <Map
          mapId="DEMO_MAP_ID"
          defaultCenter={{
            lat: destination.coordinates.lat,
            lng: destination.coordinates.lng,
          }}
          defaultZoom={13}
          gestureHandling="greedy"
          disableDefaultUI={false}
          style={{ width: '100%', height: '100%' }}
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
        >
          <MapRecenterController
            destination={destination}
            resetTrigger={resetCount}
          />

          {/* 1. Destination Center Marker */}
          <AdvancedMarker
            position={{
              lat: destination.coordinates.lat,
              lng: destination.coordinates.lng,
            }}
            title={destination.name}
            onClick={() =>
              setActiveInfo({
                type: 'destination',
                position: destination.coordinates,
                title: destination.name,
                subtitle: `${destination.state}, India`,
                extra: 'Primary Journey Destination',
              })
            }
          >
            <div className="bg-slate-900 text-teal-300 border-2 border-teal-500 rounded-full w-9 h-9 flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-transform">
              <MapPin className="w-5 h-5 text-teal-400" />
            </div>
          </AdvancedMarker>

          {/* 2. Hotel & Accommodation Markers */}
          {(activeFilter === 'all' || activeFilter === 'hotels') &&
            accommodations.map((hotel) => {
              const isSelected = hotel.id === selectedHotelId;
              return (
                <AdvancedMarker
                  key={`hotel-${hotel.id}`}
                  position={{
                    lat: hotel.coordinates.lat,
                    lng: hotel.coordinates.lng,
                  }}
                  title={hotel.name}
                  onClick={() => {
                    setActiveInfo({
                      type: 'hotel',
                      position: hotel.coordinates,
                      title: hotel.name,
                      subtitle: hotel.address,
                      price: hotel.price,
                      rating: hotel.rating,
                      reviews: hotel.reviewCount,
                      extra: hotel.type,
                      id: hotel.id,
                    });
                    if (onSelectHotel) onSelectHotel(hotel.id);
                  }}
                >
                  <div
                    className={`cursor-pointer px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all hover:scale-105 border ${
                      isSelected
                        ? 'bg-teal-700 text-white border-teal-500 ring-2 ring-teal-400'
                        : 'bg-white text-slate-900 border-teal-600 hover:border-teal-700'
                    }`}
                  >
                    <span>🏨</span>
                    <span>₹{hotel.price}</span>
                  </div>
                </AdvancedMarker>
              );
            })}

          {/* 3. Transit Hub Markers */}
          {(activeFilter === 'all' || activeFilter === 'transit') &&
            transitHubs.map((hub) => (
              <AdvancedMarker
                key={hub.id}
                position={hub.position}
                title={hub.name}
                onClick={() =>
                  setActiveInfo({
                    type: 'transit',
                    position: hub.position,
                    title: hub.name,
                    subtitle: hub.type,
                    transitType: hub.type,
                    extra: `Transit Hub for ${destination.name}`,
                  })
                }
              >
                <div
                  className="w-8 h-8 rounded-full bg-white border-2 flex items-center justify-center shadow-md cursor-pointer hover:scale-110 transition-transform text-sm"
                  style={{ borderColor: hub.color, color: hub.color }}
                >
                  {hub.icon}
                </div>
              </AdvancedMarker>
            ))}

          {/* 4. Nearby Attractions */}
          {(activeFilter === 'all' || activeFilter === 'attractions') &&
            nearbyAttractions.map((place) => (
              <AdvancedMarker
                key={`attraction-${place.id}`}
                position={{
                  lat: place.coordinates.lat,
                  lng: place.coordinates.lng,
                }}
                title={place.name}
                onClick={() => {
                  setActiveInfo({
                    type: 'attraction',
                    position: place.coordinates,
                    title: place.name,
                    subtitle: place.category,
                    rating: place.rating,
                    reviews: place.reviewCount,
                    extra: place.distanceFromDestination,
                    id: place.id,
                  });
                  if (onSelectPlace) onSelectPlace(place.id);
                }}
              >
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white border-2 border-emerald-400 flex items-center justify-center shadow-md cursor-pointer hover:scale-110 transition-transform text-xs">
                  🏔️
                </div>
              </AdvancedMarker>
            ))}

          {/* Dynamic Interactive InfoWindow */}
          {activeInfo && (
            <InfoWindow
              position={activeInfo.position}
              onCloseClick={() => setActiveInfo(null)}
              maxWidth={260}
            >
              <div className="p-1 text-slate-800 font-sans">
                {activeInfo.type === 'destination' && (
                  <div>
                    <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider block">
                      Target Destination
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm mt-0.5">
                      {activeInfo.title}
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {activeInfo.subtitle}
                    </p>
                  </div>
                )}

                {activeInfo.type === 'hotel' && (
                  <div>
                    <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider block">
                      {activeInfo.extra || 'Hotel'}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm mt-0.5">
                      {activeInfo.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                      {activeInfo.subtitle}
                    </p>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                      <div className="text-xs font-bold text-slate-900">
                        ₹{activeInfo.price} <span className="font-normal text-slate-500 text-[10px]">/ night</span>
                      </div>
                      {activeInfo.rating && (
                        <div className="flex items-center gap-0.5 text-xs text-amber-600 font-semibold">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>{activeInfo.rating}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeInfo.type === 'transit' && (
                  <div>
                    <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">
                      {activeInfo.transitType}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm mt-0.5">
                      {activeInfo.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {activeInfo.extra}
                    </p>
                  </div>
                )}

                {activeInfo.type === 'attraction' && (
                  <div>
                    <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                      {activeInfo.subtitle}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm mt-0.5">
                      {activeInfo.title}
                    </h4>
                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100 text-[11px]">
                      <span className="text-slate-600 font-medium">
                        {activeInfo.extra}
                      </span>
                      {activeInfo.rating && (
                        <div className="flex items-center gap-0.5 text-amber-600 font-semibold">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>{activeInfo.rating}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </InfoWindow>
          )}
        </Map>

        {/* Floating Map Legend */}
        <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-xs p-2.5 rounded-xl border border-slate-200/90 shadow-md text-[11px] space-y-1.5 pointer-events-auto z-10">
          <div className="font-bold text-slate-900 mb-1">Google Maps Indicators</div>
          <div className="flex items-center gap-2 text-slate-700">
            <span className="w-3.5 h-3.5 rounded-full bg-slate-900 text-[9px] flex items-center justify-center text-teal-300">📍</span>
            <span>Destination Center</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700">
            <span className="w-3.5 h-3.5 rounded bg-teal-600 text-[9px] flex items-center justify-center text-white">🏨</span>
            <span>Verified Accommodation</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700">
            <span className="w-3.5 h-3.5 rounded bg-blue-600 text-[9px] flex items-center justify-center text-white">🚆</span>
            <span>Railway Station</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700">
            <span className="w-3.5 h-3.5 rounded bg-amber-600 text-[9px] flex items-center justify-center text-white">🚌</span>
            <span>Bus Terminal</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700">
            <span className="w-3.5 h-3.5 rounded bg-emerald-600 text-[9px] flex items-center justify-center text-white">🏔️</span>
            <span>Nearby Attraction</span>
          </div>
        </div>
      </div>
    </div>
  );
};
