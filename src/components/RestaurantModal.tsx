import React from 'react';
import { Restaurant } from '../types';
import { useApp } from '../context/AppContext';
import {
  X,
  Star,
  MapPin,
  Phone,
  Globe,
  Clock,
  ExternalLink,
  UtensilsCrossed,
  Bookmark,
  Check,
  Building,
  Compass,
} from 'lucide-react';
import { motion } from 'motion/react';

interface RestaurantModalProps {
  restaurant: Restaurant;
  onClose: () => void;
  selectedLandmarkName?: string;
  hotelName?: string;
}

export const RestaurantModal: React.FC<RestaurantModalProps> = ({
  restaurant,
  onClose,
  selectedLandmarkName,
  hotelName,
}) => {
  const { isRestaurantSaved, toggleSaveRestaurant } = useApp();
  const isSaved = isRestaurantSaved(restaurant.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden relative my-8"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-slate-900/60 text-white hover:bg-slate-900 backdrop-blur-xs transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Image */}
        <div className="h-64 relative bg-slate-900 overflow-hidden">
          <img
            src={restaurant.image}
            alt={restaurant.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

          <div className="absolute bottom-4 left-6 right-6 text-white flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-md bg-teal-600 text-xs font-bold shadow-xs">
                  {restaurant.foodType}
                </span>
                <span className="px-2.5 py-0.5 rounded-md bg-white/20 backdrop-blur-xs text-xs font-bold">
                  {restaurant.priceLevel} ({restaurant.priceRangeText})
                </span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">
                {restaurant.name}
              </h2>
            </div>

            <div className="bg-white/95 text-slate-900 px-3 py-1.5 rounded-xl font-bold text-sm flex items-center gap-1 shadow-md">
              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
              <span>{restaurant.rating}</span>
              <span className="text-xs text-slate-500 font-normal">
                ({restaurant.reviewCount})
              </span>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Cuisine & Description */}
          <div>
            <div className="text-xs font-bold text-teal-700 uppercase tracking-wider mb-1">
              {restaurant.cuisine.join(' · ')}
            </div>
            <p className="text-sm text-slate-600 leading-relaxed font-normal">
              {restaurant.description}
            </p>
          </div>

          {/* Practical Distances */}
          <div className="bg-[#FAF9F6] p-4 rounded-2xl border border-slate-200/90 space-y-2">
            <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Transit & Landmark Proximity
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white border border-slate-200/80 flex items-start gap-2.5">
                <Compass className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                <div>
                  <div className="text-slate-400 font-medium text-[11px]">Selected Landmark</div>
                  <div className="font-bold text-slate-900 mt-0.5">{selectedLandmarkName || 'Central Landmark'}</div>
                  <div className="text-teal-700 font-semibold text-[11px] mt-0.5">
                    {restaurant.distanceFromSelectedLandmark}
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white border border-slate-200/80 flex items-start gap-2.5">
                <Building className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-slate-400 font-medium text-[11px]">Distance from Stay</div>
                  <div className="font-bold text-slate-900 mt-0.5">{hotelName || 'Selected Accommodation'}</div>
                  <div className="text-blue-700 font-semibold text-[11px] mt-0.5">
                    {restaurant.distanceFromHotel}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Popular Dishes */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <UtensilsCrossed className="w-4 h-4 text-teal-700" />
              <span>Recommended Signature Dishes</span>
            </h4>
            <div className="flex flex-wrap gap-2">
              {restaurant.popularDishes.map((dish) => (
                <span
                  key={dish}
                  className="px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-xs font-semibold"
                >
                  {dish}
                </span>
              ))}
            </div>
          </div>

          {/* Facilities & Amenities */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Dining Facilities & Highlights
            </h4>
            <div className="flex flex-wrap gap-2">
              {restaurant.facilities.map((fac) => (
                <span
                  key={fac}
                  className="px-3 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium"
                >
                  ✓ {fac}
                </span>
              ))}
            </div>
          </div>

          {/* Contact Details */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 text-xs">
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-teal-700 shrink-0" />
              <span className="text-slate-700 font-medium">{restaurant.address}</span>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-teal-700 shrink-0" />
              <span className="text-slate-900 font-bold">{restaurant.phone}</span>
              <span className="text-slate-400 font-normal">(Public Business Phone)</span>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-teal-700 shrink-0" />
              <span className="text-slate-700 font-medium">{restaurant.openingHours}</span>
            </div>

            {restaurant.website && (
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-teal-700 shrink-0" />
                <a
                  href={restaurant.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-700 font-bold hover:underline flex items-center gap-1"
                >
                  <span>Official Website / Menu</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>

          {/* Bottom Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
            <div className="text-[11px] text-slate-400">
              Source: {restaurant.dataSource} · {restaurant.lastUpdated}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => toggleSaveRestaurant(restaurant)}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 cursor-pointer ${
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
                type="button"
                onClick={onClose}
                className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
