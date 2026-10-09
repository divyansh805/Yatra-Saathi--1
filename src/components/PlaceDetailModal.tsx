import React from 'react';
import { NearbyPlace, Accommodation, Restaurant } from '../types';
import { useApp } from '../context/AppContext';
import {
  X,
  MapPin,
  Star,
  Clock,
  ExternalLink,
  Lightbulb,
  Compass,
  Bookmark,
  Check,
  Building,
  UtensilsCrossed,
} from 'lucide-react';
import { motion } from 'motion/react';

interface PlaceDetailModalProps {
  place: NearbyPlace;
  onClose: () => void;
  selectedLandmarkName?: string;
  hotelName?: string;
  nearbyRestaurants?: Restaurant[];
  nearbyHotels?: Accommodation[];
}

export const PlaceDetailModal: React.FC<PlaceDetailModalProps> = ({
  place,
  onClose,
  selectedLandmarkName,
  hotelName,
  nearbyRestaurants = [],
  nearbyHotels = [],
}) => {
  const { isPlaceSaved, toggleSavePlace } = useApp();
  const isSaved = isPlaceSaved(place.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 relative my-auto"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white backdrop-blur-md transition-colors cursor-pointer shadow-md"
          aria-label="Close place details"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Image */}
        <div className="relative h-64 bg-slate-900">
          <img
            src={place.image}
            alt={place.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold shadow-md">
              {place.category}
            </span>
          </div>
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <h2 className="font-display text-2xl font-extrabold leading-tight">
              {place.name}
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-300 mt-1">
              <MapPin className="w-3.5 h-3.5 text-teal-400" />
              <span>{place.location}</span>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Rating & Distance Badges */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#FAF9F6] border border-slate-200">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 font-bold text-amber-900 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 text-xs">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>{place.rating}</span>
              </span>
              <span className="text-xs text-slate-500">
                ({place.reviewCount.toLocaleString()} reviews)
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-teal-800 bg-teal-50 px-3 py-1 rounded-lg border border-teal-200">
              <Compass className="w-3.5 h-3.5 text-teal-700" />
              <span>{place.distanceFromDestination}</span>
            </div>
          </div>

          {/* Proximity Details (from hotel & landmark) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2">
              <Building className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-slate-400 font-medium block text-[11px]">Distance from Stay</span>
                <span className="font-bold text-slate-900 block">{place.distanceFromHotel || '1.8 km from hotel'}</span>
                <span className="text-slate-400 text-[10px] truncate block">{hotelName || 'Selected Accommodation'}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2">
              <Compass className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
              <div>
                <span className="text-slate-400 font-medium block text-[11px]">Distance from Landmark</span>
                <span className="font-bold text-slate-900 block">{place.distanceFromLandmark || '2.2 km'}</span>
                <span className="text-slate-400 text-[10px] truncate block">{selectedLandmarkName || 'Central Landmark'}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              About This Location
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed font-normal">
              {place.description}
            </p>
          </div>

          {/* Timings */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
            <Clock className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-slate-900">Visiting Hours & Schedule</div>
              <div className="text-xs text-slate-600 mt-0.5">{place.timings}</div>
            </div>
          </div>

          {/* Practical Traveler Tips */}
          {place.practicalTips && place.practicalTips.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <span>Practical Preparation Tips</span>
              </div>
              <ul className="space-y-2">
                {place.practicalTips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 shrink-0" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Nearby Restaurants Preview */}
          {nearbyRestaurants.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                <UtensilsCrossed className="w-4 h-4 text-teal-700" />
                <span>Nearby Dining Recommendations</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {nearbyRestaurants.slice(0, 2).map((r) => (
                  <div key={r.id} className="p-2.5 rounded-xl border border-slate-200 bg-white flex items-center gap-2.5">
                    <img src={r.image} alt={r.name} className="w-10 h-10 rounded-lg object-cover" />
                    <div className="truncate">
                      <div className="font-bold text-slate-900 truncate">{r.name}</div>
                      <div className="text-[11px] text-slate-500">{r.cuisine[0]} · {r.priceLevel}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Official Website */}
          {place.website && (
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Official Portal / Tourism Board</span>
              <a
                href={place.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-bold text-teal-700 hover:text-teal-800 hover:underline"
              >
                <span>Visit Official Site</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => toggleSavePlace(place)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 cursor-pointer ${
                isSaved
                  ? 'bg-teal-50 border-teal-300 text-teal-800'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {isSaved ? (
                <>
                  <Check className="w-3.5 h-3.5 text-teal-700" />
                  <span>Saved in My Journey</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Add to My Journey</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
