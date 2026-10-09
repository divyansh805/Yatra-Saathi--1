import React, { useState } from 'react';
import { Accommodation } from '../types';
import {
  X,
  MapPin,
  Train,
  Bus,
  Plane,
  Flag,
  Phone,
  Mail,
  Globe,
  ShieldCheck,
  Check,
  Star,
  Car,
  Mountain,
  Users,
  Zap,
  Info,
  ExternalLink,
} from 'lucide-react';
import { motion } from 'motion/react';

interface GroundRealityModalProps {
  hotel: Accommodation;
  onClose: () => void;
}

export const GroundRealityModal: React.FC<GroundRealityModalProps> = ({ hotel, onClose }) => {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  const photos = hotel.gallery && hotel.gallery.length > 0 ? hotel.gallery : [hotel.image];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 relative my-auto"
      >
        {/* Sticky Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white backdrop-blur-md transition-colors cursor-pointer shadow-md"
          aria-label="Close Ground Reality report"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Gallery Header */}
        <div className="relative h-64 sm:h-80 bg-slate-900">
          <img
            src={photos[selectedPhotoIndex]}
            alt={hotel.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

          {/* Top Pill & Badges */}
          <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-teal-600 text-white text-xs font-bold shadow-md">
              {hotel.type}
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-900/80 text-teal-300 text-xs font-semibold backdrop-blur-md border border-teal-500/30">
              Verified Ground Reality
            </span>
          </div>

          {/* Photo Switcher Thumbnails if multiple photos */}
          {photos.length > 1 && (
            <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2 overflow-x-auto pb-1">
              {photos.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedPhotoIndex(idx)}
                  className={`w-14 h-11 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                    selectedPhotoIndex === idx
                      ? 'border-teal-400 scale-105 shadow-md'
                      : 'border-white/60 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Body Content */}
        <div className="p-6 sm:p-8 space-y-8">
          {/* Title & Price Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900">
                {hotel.name}
              </h2>
              <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                <MapPin className="w-4 h-4 text-teal-700 shrink-0" />
                <span>{hotel.address}</span>
              </div>
              <div className="flex items-center gap-3 mt-3 text-xs">
                <span className="inline-flex items-center gap-1 font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>{hotel.rating}</span>
                </span>
                <span className="text-slate-500">
                  Based on {hotel.reviewCount.toLocaleString()} verified traveler ratings
                </span>
              </div>
            </div>

            <div className="sm:text-right shrink-0 bg-slate-50 sm:bg-transparent p-4 sm:p-0 rounded-2xl border sm:border-0 border-slate-200">
              <div className="text-xs text-slate-500 font-medium">Estimated Pricing</div>
              <div className="text-2xl font-extrabold text-slate-900">
                ₹{hotel.price.toLocaleString('en-IN')}
              </div>
              <div className="text-xs text-slate-500">{hotel.priceBasis}</div>
            </div>
          </div>

          {/* Ground Reality Assessment Grid */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-teal-700" />
                <h3 className="font-display text-lg font-bold text-slate-900">
                  Ground Reality & Practical Details
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-slate-400">
                {hotel.dataSource}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Road Access */}
              <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-slate-200/90 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center shrink-0">
                  <Car className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                    Road Access & Last Mile
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {hotel.groundReality.roadAccess}
                  </p>
                </div>
              </div>

              {/* Terrain & Incline */}
              <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-slate-200/90 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-200 text-sky-700 flex items-center justify-center shrink-0">
                  <Mountain className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                    Terrain & Incline
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {hotel.groundReality.terrain}
                  </p>
                </div>
              </div>

              {/* Parking Feasibility */}
              <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-slate-200/90 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0">
                  <Car className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                    Parking Feasibility
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {hotel.groundReality.parking}
                  </p>
                </div>
              </div>

              {/* Family & Senior Citizen Friendliness */}
              <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-slate-200/90 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                    Family & Senior Friendliness
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {hotel.groundReality.familySeniorFriendly}
                  </p>
                </div>
              </div>

              {/* Power Backup */}
              <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-slate-200/90 flex items-start gap-3 md:col-span-2">
                <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center shrink-0">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                    Electrical & Power Backup
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {hotel.groundReality.powerBackup}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Practical Distances Breakdown */}
          <div>
            <h3 className="font-display text-lg font-bold text-slate-900 mb-3">
              Practical Transit & Landmark Distances
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                <div className="flex items-center gap-2 text-blue-700 text-xs font-bold mb-1">
                  <Train className="w-4 h-4" />
                  <span>Railway Station</span>
                </div>
                <div className="text-base font-extrabold text-slate-900">
                  {hotel.distances.railwayStation.distance}
                </div>
                <div className="text-[11px] text-slate-500 truncate" title={hotel.distances.railwayStation.stationName}>
                  {hotel.distances.railwayStation.stationName}
                </div>
                <div className="text-[10px] text-teal-700 font-semibold mt-1">
                  {hotel.distances.railwayStation.type}
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                <div className="flex items-center gap-2 text-amber-700 text-xs font-bold mb-1">
                  <Bus className="w-4 h-4" />
                  <span>Bus Stand</span>
                </div>
                <div className="text-base font-extrabold text-slate-900">
                  {hotel.distances.busStand.distance}
                </div>
                <div className="text-[11px] text-slate-500 truncate" title={hotel.distances.busStand.stationName}>
                  {hotel.distances.busStand.stationName}
                </div>
                <div className="text-[10px] text-teal-700 font-semibold mt-1">
                  {hotel.distances.busStand.type}
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                <div className="flex items-center gap-2 text-purple-700 text-xs font-bold mb-1">
                  <Plane className="w-4 h-4" />
                  <span>Airport</span>
                </div>
                <div className="text-base font-extrabold text-slate-900">
                  {hotel.distances.airport.distance}
                </div>
                <div className="text-[11px] text-slate-500 truncate" title={hotel.distances.airport.airportName}>
                  {hotel.distances.airport.airportName}
                </div>
                <div className="text-[10px] text-teal-700 font-semibold mt-1">
                  {hotel.distances.airport.type}
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                <div className="flex items-center gap-2 text-rose-700 text-xs font-bold mb-1">
                  <Flag className="w-4 h-4" />
                  <span>Major Landmark</span>
                </div>
                <div className="text-base font-extrabold text-slate-900">
                  {hotel.distances.landmark.distance}
                </div>
                <div className="text-[11px] text-slate-500 truncate" title={hotel.distances.landmark.landmarkName}>
                  {hotel.distances.landmark.landmarkName}
                </div>
                <div className="text-[10px] text-teal-700 font-semibold mt-1">
                  {hotel.distances.landmark.type}
                </div>
              </div>
            </div>
          </div>

          {/* Available Facilities Checklist */}
          <div>
            <h3 className="font-display text-lg font-bold text-slate-900 mb-3">
              Available Facilities
            </h3>
            <div className="flex flex-wrap gap-2">
              {hotel.facilities.map((fac) => (
                <span
                  key={fac}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700"
                >
                  <Check className="w-3.5 h-3.5 text-teal-600" />
                  <span>{fac}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Contact Details & Official Links */}
          <div className="p-6 rounded-2xl bg-[#0B1528] text-white space-y-4">
            <h3 className="font-display text-lg font-bold">
              Official Property Contact Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-slate-400">Contact</div>
                  <div className="font-semibold text-white mt-0.5">{hotel.contact.phone}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-slate-400">Email</div>
                  <div className="font-semibold text-white mt-0.5">
                    {hotel.contact.email || 'Email not publicly available'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-slate-400">Official Website</div>
                  {hotel.contact.website ? (
                    <a
                      href={hotel.contact.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-teal-300 hover:underline flex items-center gap-1 mt-0.5"
                    >
                      <span>Visit Site</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <div className="text-slate-400 mt-0.5">Not available</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Traveler Reviews Highlights */}
          {hotel.reviews && hotel.reviews.length > 0 && (
            <div>
              <h3 className="font-display text-lg font-bold text-slate-900 mb-3">
                Authentic Traveler Observations
              </h3>
              <div className="space-y-3">
                {hotel.reviews.map((rev, i) => (
                  <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-slate-900">{rev.author}</span>
                      <div className="flex items-center gap-1 text-xs text-amber-800">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span>{rev.rating}/5</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-normal">
                      "{rev.text}"
                    </p>
                    <div className="text-[10px] text-slate-400 mt-1">{rev.date}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer Transparency Notice */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-teal-700" />
              <span>{hotel.dataSource} · {hotel.lastUpdated}</span>
            </span>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Close Ground Reality
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
