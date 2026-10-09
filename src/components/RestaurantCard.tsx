import React from 'react';
import { Restaurant } from '../types';
import { useApp } from '../context/AppContext';
import {
  Star,
  MapPin,
  Phone,
  ExternalLink,
  Clock,
  Compass,
  Building,
  Bookmark,
  Check,
  UtensilsCrossed,
  ArrowRight,
} from 'lucide-react';
import { motion } from 'motion/react';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onViewDetails: (restaurant: Restaurant) => void;
  selectedLandmarkName?: string;
  hotelName?: string;
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({
  restaurant,
  onViewDetails,
  selectedLandmarkName,
  hotelName,
}) => {
  const { isRestaurantSaved, toggleSaveRestaurant } = useApp();
  const isSaved = isRestaurantSaved(restaurant.id);

  const getVegBadge = () => {
    switch (restaurant.foodType) {
      case 'Vegetarian':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-300 text-[11px] font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
            <span>Pure Veg</span>
          </span>
        );
      case 'Non-Vegetarian':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-300 text-[11px] font-bold">
            <span className="w-2 h-2 rounded-full bg-amber-700 inline-block" />
            <span>Non-Veg Available</span>
          </span>
        );
      case 'Vegan':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-300 text-[11px] font-bold">
            <span className="w-2 h-2 rounded-full bg-teal-600 inline-block" />
            <span>Vegan Options</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-semibold">
            <UtensilsCrossed className="w-3 h-3 text-slate-500" />
            <span>Multi-Cuisine</span>
          </span>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col md:flex-row group w-full"
    >
      {/* Restaurant Image: 30-35% on Desktop, top on mobile */}
      <div className="w-full md:w-[32%] lg:w-[30%] min-h-[200px] md:min-h-full relative shrink-0 bg-slate-900 overflow-hidden">
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          {getVegBadge()}
        </div>

        <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-lg text-xs font-bold text-slate-900 flex items-center gap-1 shadow-xs">
          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
          <span>{restaurant.rating}</span>
          <span className="text-[10px] text-slate-500 font-normal">
            ({restaurant.reviewCount})
          </span>
        </div>

        <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-xs text-white px-2 py-0.5 rounded-md text-[11px] font-bold">
          {restaurant.priceLevel} ({restaurant.priceRangeText})
        </div>
      </div>

      {/* Restaurant Details: 65-70% on Desktop, with min-width 0 to prevent squeezing/overflow */}
      <div className="p-5 sm:p-6 w-full md:w-[68%] lg:w-[70%] min-w-0 flex-1 flex flex-col justify-between space-y-4">
        <div className="min-w-0">
          {/* Header: Name, Cuisine, Bookmark */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2 min-w-0">
            <div className="min-w-0 flex-1 pr-2">
              <h3 className="font-display text-lg sm:text-xl font-bold text-slate-900 group-hover:text-teal-700 transition-colors break-words leading-snug">
                {restaurant.name}
              </h3>
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                <span className="text-xs font-medium text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100 break-words">
                  {restaurant.cuisine.join(' · ')}
                </span>
                {restaurant.isOpenNow && (
                  <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Open Now
                  </span>
                )}
              </div>
            </div>

            {/* Bookmark to My Journey */}
            <button
              onClick={() => toggleSaveRestaurant(restaurant)}
              className={`self-start p-2 rounded-xl border transition-all cursor-pointer shrink-0 ${
                isSaved
                  ? 'bg-teal-50 border-teal-300 text-teal-800'
                  : 'bg-white border-slate-200 text-slate-400 hover:text-teal-600 hover:border-teal-200'
              }`}
              title={isSaved ? 'Saved in My Journey' : 'Save restaurant to My Journey'}
            >
              {isSaved ? <Check className="w-4 h-4 text-teal-700" /> : <Bookmark className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex items-start gap-1.5 text-xs text-slate-500 mt-1 mb-3 min-w-0">
            <MapPin className="w-3.5 h-3.5 text-teal-700 shrink-0 mt-0.5" />
            <span className="break-words line-clamp-2">{restaurant.address}</span>
          </div>

          {/* DYNAMIC DISTANCE ROW */}
          <div className="bg-[#FAF9F6] p-3 rounded-2xl border border-slate-200/80 mb-3 space-y-1.5">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Verified Distance & Travel Times
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {/* Distance from Selected Landmark */}
              <div className="flex items-start gap-2">
                <Compass className="w-3.5 h-3.5 text-teal-700 mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold text-slate-800 block">
                    {restaurant.distanceFromSelectedLandmark}
                  </span>
                  <span className="text-[10px] text-slate-400 block truncate">
                    Landmark: {selectedLandmarkName || 'Center'}
                  </span>
                </div>
              </div>

              {/* Distance from Hotel */}
              <div className="flex items-start gap-2">
                <Building className="w-3.5 h-3.5 text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold text-slate-800 block">
                    {restaurant.distanceFromHotel}
                  </span>
                  <span className="text-[10px] text-slate-400 block truncate">
                    From Stay: {hotelName || 'Nearest Verified Stay'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Popular Dishes */}
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Popular Dishes:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {restaurant.popularDishes.slice(0, 3).map((dish) => (
                <span
                  key={dish}
                  className="px-2 py-0.5 rounded-md bg-slate-100 text-[11px] font-medium text-slate-700"
                >
                  {dish}
                </span>
              ))}
              {restaurant.popularDishes.length > 3 && (
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[11px] font-medium text-slate-500">
                  +{restaurant.popularDishes.length - 3} more
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          {/* Public Phone and Hours */}
          <div className="flex items-center gap-3 text-xs text-slate-600">
            <span className="inline-flex items-center gap-1 font-medium">
              <Phone className="w-3 h-3 text-slate-400" />
              <span>{restaurant.phone}</span>
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-slate-500">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>{restaurant.openingHours}</span>
            </span>
            {restaurant.website && (
              <a
                href={restaurant.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-700 hover:text-teal-800 hover:underline flex items-center gap-0.5"
              >
                <span>Website</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            )}
          </div>

          {/* Button: View Restaurant */}
          <button
            type="button"
            onClick={() => onViewDetails(restaurant)}
            className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer ml-auto"
          >
            <span>View Restaurant</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
