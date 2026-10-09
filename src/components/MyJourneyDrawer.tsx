import React from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Bookmark,
  Calendar,
  Users,
  MapPin,
  Building,
  UtensilsCrossed,
  Compass,
  Star,
  Trash2,
  Printer,
  Copy,
  Check,
  CheckSquare,
  ArrowRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MyJourneyDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  destinationName: string;
  stateName: string;
  arrivalDate: string;
  onOpenChecklist: () => void;
}

export const MyJourneyDrawer: React.FC<MyJourneyDrawerProps> = ({
  isOpen,
  onClose,
  destinationName,
  stateName,
  arrivalDate,
  onOpenChecklist,
}) => {
  const {
    myJourney,
    toggleSaveHotel,
    toggleSaveRestaurant,
    toggleSavePlace,
    toggleSaveLandmark,
    clearMyJourney,
    showToast,
    activeSearch,
  } = useApp();

  const [copied, setCopied] = React.useState(false);

  const totalItems =
    (myJourney.savedHotel ? 1 : 0) +
    myJourney.savedRestaurants.length +
    myJourney.savedPlaces.length +
    myJourney.savedLandmarks.length;

  const handleCopyItinerary = () => {
    let text = `🎒 MY YATRA SAATHI JOURNEY SUMMARY\n`;
    text += `Destination: ${destinationName}, ${stateName}\n`;
    text += `Arrival Date: ${arrivalDate}\n`;
    text += `Travellers: ${activeSearch.travellers.total} (${activeSearch.travellers.adults} Adults, ${activeSearch.travellers.children} Children, ${activeSearch.travellers.seniors} Seniors)\n\n`;

    if (myJourney.savedHotel) {
      text += `🏨 ACCOMMODATION:\n`;
      text += `• ${myJourney.savedHotel.name} (${myJourney.savedHotel.type})\n`;
      text += `  Address: ${myJourney.savedHotel.address}\n`;
      text += `  Contact: ${myJourney.savedHotel.contact.phone}\n`;
      text += `  Estimated Rate: ₹${myJourney.savedHotel.price.toLocaleString('en-IN')}\n\n`;
    }

    if (myJourney.savedLandmarks.length > 0) {
      text += `📍 KEY LANDMARKS:\n`;
      myJourney.savedLandmarks.forEach((l) => {
        text += `• ${l.name} (${l.category})\n`;
      });
      text += `\n`;
    }

    if (myJourney.savedRestaurants.length > 0) {
      text += `🍽 SAVED DINING & FOOD:\n`;
      myJourney.savedRestaurants.forEach((r) => {
        text += `• ${r.name} - ${r.cuisine.join(', ')} (${r.foodType}, ${r.priceLevel})\n`;
        text += `  Phone: ${r.phone} | Address: ${r.address}\n`;
      });
      text += `\n`;
    }

    if (myJourney.savedPlaces.length > 0) {
      text += `🧭 PLACES TO EXPLORE:\n`;
      myJourney.savedPlaces.forEach((p) => {
        text += `• ${p.name} (${p.category}) - ${p.timings}\n`;
        text += `  Location: ${p.location}\n`;
      });
      text += `\n`;
    }

    text += `Generated with Yatra Saathi: Travel smarter. Prepare better. Journey with confidence.`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast('Journey itinerary copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer Body */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-full max-w-xl bg-white h-full shadow-2xl flex flex-col z-10 overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
                  <Bookmark className="w-5 h-5 fill-teal-400" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-bold">My Journey</h2>
                  <p className="text-xs text-slate-400">
                    {destinationName}, {stateName} · {totalItems} saved {totalItems === 1 ? 'item' : 'items'}
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sub-header Journey Meta */}
            <div className="px-6 py-3 bg-[#FAF9F6] border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-4 text-slate-700">
                <span className="flex items-center gap-1.5 font-semibold">
                  <Calendar className="w-4 h-4 text-teal-700" />
                  <span>{arrivalDate}</span>
                </span>
                <span className="flex items-center gap-1.5 font-semibold">
                  <Users className="w-4 h-4 text-teal-700" />
                  <span>{activeSearch.travellers.total} Travellers</span>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyItinerary}
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-teal-700 font-medium flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                  title="Copy journey text summary"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-teal-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-teal-700 font-medium flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                  title="Print journey summary"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
              </div>
            </div>

            {/* Scrollable Items Container */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {totalItems === 0 ? (
                <div className="py-20 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
                    <Bookmark className="w-6 h-6" />
                  </div>
                  <h3 className="font-display text-base font-bold text-slate-900">
                    Your Journey is empty
                  </h3>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                    Click the bookmark icon or "Add to My Journey" on hotels, restaurants, and places to assemble your complete destination plan.
                  </p>
                </div>
              ) : (
                <>
                  {/* 1. SAVED STAY */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Building className="w-4 h-4 text-teal-700" />
                        <span>Saved Accommodation</span>
                      </h3>
                      {myJourney.savedHotel && (
                        <span className="text-[11px] font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                          Confirmed Base
                        </span>
                      )}
                    </div>

                    {myJourney.savedHotel ? (
                      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <img
                            src={myJourney.savedHotel.image}
                            alt={myJourney.savedHotel.name}
                            className="w-16 h-16 rounded-xl object-cover shrink-0"
                          />
                          <div>
                            <div className="text-sm font-bold text-slate-900">
                              {myJourney.savedHotel.name}
                            </div>
                            <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-teal-700 shrink-0" />
                              <span className="line-clamp-1">{myJourney.savedHotel.address}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1.5 text-xs">
                              <span className="font-extrabold text-slate-900">
                                ₹{myJourney.savedHotel.price.toLocaleString('en-IN')}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                · {myJourney.savedHotel.priceBasis}
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => toggleSaveHotel(myJourney.savedHotel!)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                          title="Remove stay"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="p-4 rounded-2xl border border-dashed border-slate-300 text-center text-xs text-slate-500">
                        No accommodation saved yet. Browse the Stays tab to pin your hotel.
                      </div>
                    )}
                  </div>

                  {/* 2. SAVED RESTAURANTS */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        <UtensilsCrossed className="w-4 h-4 text-teal-700" />
                        <span>Saved Dining & Food ({myJourney.savedRestaurants.length})</span>
                      </h3>
                    </div>

                    {myJourney.savedRestaurants.length > 0 ? (
                      <div className="space-y-2.5">
                        {myJourney.savedRestaurants.map((rest) => (
                          <div
                            key={rest.id}
                            className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-3">
                              <img
                                src={rest.image}
                                alt={rest.name}
                                className="w-12 h-12 rounded-xl object-cover shrink-0"
                              />
                              <div>
                                <div className="text-xs font-bold text-slate-900">
                                  {rest.name}
                                </div>
                                <div className="text-[11px] text-teal-800 font-medium">
                                  {rest.cuisine.slice(0, 2).join(', ')} · {rest.foodType}
                                </div>
                                <div className="text-[11px] text-slate-400">
                                  {rest.distanceFromSelectedLandmark}
                                </div>
                              </div>
                            </div>

                            <button
                              onClick={() => toggleSaveRestaurant(rest)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                              title="Remove restaurant"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 rounded-2xl border border-dashed border-slate-300 text-center text-xs text-slate-500">
                        No dining options saved yet. Browse the Restaurants tab to add meals.
                      </div>
                    )}
                  </div>

                  {/* 3. SAVED PLACES TO EXPLORE */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Compass className="w-4 h-4 text-emerald-700" />
                        <span>Saved Places & Attractions ({myJourney.savedPlaces.length})</span>
                      </h3>
                    </div>

                    {myJourney.savedPlaces.length > 0 ? (
                      <div className="space-y-2.5">
                        {myJourney.savedPlaces.map((place) => (
                          <div
                            key={place.id}
                            className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-3">
                              <img
                                src={place.image}
                                alt={place.name}
                                className="w-12 h-12 rounded-xl object-cover shrink-0"
                              />
                              <div>
                                <div className="text-xs font-bold text-slate-900">
                                  {place.name}
                                </div>
                                <div className="text-[11px] text-emerald-700 font-semibold">
                                  {place.category}
                                </div>
                                <div className="text-[11px] text-slate-400">
                                  {place.timings}
                                </div>
                              </div>
                            </div>

                            <button
                              onClick={() => toggleSavePlace(place)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                              title="Remove place"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 rounded-2xl border border-dashed border-slate-300 text-center text-xs text-slate-500">
                        No attractions saved yet. Save highlights in the Explore section below.
                      </div>
                    )}
                  </div>

                  {/* 4. SAVED LANDMARKS */}
                  {myJourney.savedLandmarks.length > 0 && (
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-teal-700" />
                        <span>Key Waypoints & Landmarks ({myJourney.savedLandmarks.length})</span>
                      </h3>
                      <div className="space-y-2">
                        {myJourney.savedLandmarks.map((l) => (
                          <div
                            key={l.id}
                            className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                          >
                            <div>
                              <div className="font-bold text-slate-900">{l.name}</div>
                              <div className="text-[11px] text-slate-500">{l.category}</div>
                            </div>
                            <button
                              onClick={() => toggleSaveLandmark(l)}
                              className="p-1 text-slate-400 hover:text-rose-600"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-5 bg-slate-50 border-t border-slate-200 space-y-3">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenChecklist();
                }}
                className="w-full py-3 px-4 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckSquare className="w-4 h-4" />
                <span>Prepare My Checklist for this Journey</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Changes auto-saved in your traveler session</span>
                {totalItems > 0 && (
                  <button
                    onClick={clearMyJourney}
                    className="text-rose-600 hover:underline font-semibold cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
