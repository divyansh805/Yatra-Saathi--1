export type Page = 'home' | 'about' | 'contact' | 'login' | 'signup' | 'dashboard' | 'smart-destination' | 'hotels' | 'ai-trip-planner' | 'checklist';
export type Language = 'en' | 'hi';

export interface User {
  name: string;
  email: string;
  phone: string;
  preferredLanguage?: Language;
}

export interface ToastMessage {
  id: string;
  text: string;
  type?: 'success' | 'info' | 'error';
}

export interface TravellersCount {
  adults: number;
  children: number;
  seniors: number;
  total: number;
}

export interface JourneySearch {
  state: string;
  destination: string;
  destinationId: string;
  arrivalDate: string;
  travellers: TravellersCount;
  selectedLandmarkId?: string;
}

export interface DistanceInfo {
  distance: string;
  stationName?: string;
  airportName?: string;
  landmarkName?: string;
  type: 'Road distance' | 'Straight-line distance';
  travelTime?: string;
}

export interface AccommodationContact {
  phone: string;
  email: string | null;
  website: string | null;
}

export interface GroundRealityDetails {
  roadAccess: string;
  terrain: string;
  parking: string;
  familySeniorFriendly: string;
  powerBackup: string;
  elevationNotes?: string;
}

export interface AccommodationReview {
  author: string;
  rating: number;
  text: string;
  date: string;
}

export type AccommodationType = 'Hotel' | 'Guest House' | 'Homestay' | 'Lodge' | 'Resort';

export interface Accommodation {
  id: string;
  name: string;
  type: AccommodationType;
  rating: number;
  reviewCount: number;
  price: number;
  priceBasis: string;
  address: string;
  city: string;
  image: string;
  gallery: string[];
  distances: {
    railwayStation: DistanceInfo;
    busStand: DistanceInfo;
    airport: DistanceInfo;
    landmark: DistanceInfo;
  };
  contact: AccommodationContact;
  facilities: string[];
  groundReality: GroundRealityDetails;
  reviews: AccommodationReview[];
  coordinates: {
    lat: number;
    lng: number;
  };
  dataSource: string;
  lastUpdated: string;
}

export interface DestinationLandmark {
  id: string;
  name: string;
  category: string;
  description: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  typicalDriveTime?: string;
  officialSource?: string;
}

export type RestaurantPriceLevel = '₹' | '₹₹' | '₹₹₹' | '₹₹₹₹';
export type FoodType = 'Vegetarian' | 'Non-Vegetarian' | 'Vegan' | 'Mixed';

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string[];
  priceLevel: RestaurantPriceLevel;
  priceRangeText: string;
  foodType: FoodType;
  rating: number;
  reviewCount: number;
  address: string;
  city: string;
  image: string;
  distanceFromHotel: string;
  distanceFromSelectedLandmark: string;
  travelTime?: string;
  phone: string;
  website: string | null;
  openingHours: string;
  isOpenNow: boolean;
  facilities: string[];
  popularDishes: string[];
  description: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  dataSource: string;
  lastUpdated: string;
}

export interface NearbyPlace {
  id: string;
  name: string;
  category: string;
  subCategory?: 'Popular Places' | 'Hidden Gems' | 'Family Friendly' | 'Nature & Outdoors' | 'Culture & Heritage' | 'Food & Local Experiences';
  rating: number;
  reviewCount: number;
  image: string;
  location: string;
  distanceFromDestination: string;
  distanceFromHotel?: string;
  distanceFromLandmark?: string;
  description: string;
  timings: string;
  entryFee?: string;
  website: string | null;
  coordinates: {
    lat: number;
    lng: number;
  };
  practicalTips: string[];
  officialSource?: string;
}

export type DestinationCategory =
  | 'Religious'
  | 'Hill Station'
  | 'Beach'
  | 'Historical'
  | 'Wildlife'
  | 'Heritage'
  | 'City'
  | 'Cultural'
  | 'Adventure'
  | 'Nature'
  | 'Family';

export interface EmergencyContact {
  title: string;
  number: string;
  category: 'police' | 'medical' | 'tourism' | 'disaster' | 'local';
  source: string;
  notes?: string;
}

export interface DestinationItem {
  id: string;
  name: string;
  state: string;
  region: string;
  category: DestinationCategory;
  description: string;
  climateType: 'cold' | 'tropical' | 'moderate' | 'arid' | 'hilly';
  coordinates: {
    lat: number;
    lng: number;
  };
  nearestTransit: {
    railwayStation: string;
    busStand: string;
    airport: string;
    majorLandmark: string;
  };
  landmarks: DestinationLandmark[];
  accommodations: Accommodation[];
  restaurants: Restaurant[];
  nearbyAttractions: NearbyPlace[];
  emergencyContacts: EmergencyContact[];
  officialPermits?: {
    name: string;
    isRequired: boolean;
    sourceUrl: string;
    portalName: string;
    notes: string;
  }[];
}

export interface AccommodationFilters {
  priceRanges: string[];
  types: string[];
  minRating: number | null;
  facilities: string[];
  proximity: string[];
  familySeniorFriendly?: boolean;
  parkingRequired?: boolean;
  powerBackupRequired?: boolean;
}

export interface RestaurantFilters {
  foodTypes: string[];
  priceLevels: string[];
  minRating: number | null;
  cuisines: string[];
  facilities: string[];
  proximity: string[];
}

export interface ChecklistItem {
  id: string;
  category: 'documents' | 'clothing' | 'medicines' | 'electronics' | 'essentials' | 'preparation';
  title: string;
  description: string;
  isOfficialRequirement?: boolean;
  officialSourceUrl?: string;
  officialSourceLabel?: string;
  weatherDependent?: boolean;
  recommendedFor?: string;
}

export type TransportMode =
  | 'Train'
  | 'Bus'
  | 'Flight'
  | 'Car / Personal vehicle'
  | 'Not decided'
  | '';

export type TripType =
  | 'Religious / Pilgrimage'
  | 'Family vacation'
  | 'Adventure'
  | 'Nature'
  | 'Cultural'
  | 'Business'
  | 'Mixed'
  | '';

export type SmartChecklistCategory =
  | 'before_you_leave'
  | 'documents'
  | 'packing'
  | 'transport'
  | 'destination_specific'
  | 'family_traveller'
  | 'emergency_safety';

export interface SmartChecklistItem {
  id: string;
  category: SmartChecklistCategory;
  title: string;
  description: string;
  isCompleted: boolean;
  isCustom?: boolean;
  isOfficialRequirement?: boolean;
  officialSourceUrl?: string;
  officialSourceLabel?: string;
  tag?: string;
  isUserProvided?: boolean;
}

export interface AISuggestion {
  id: string;
  type: 'tip' | 'warning' | 'insight';
  title: string;
  description: string;
  sourceContext?: string;
}

export interface SmartChecklistInput {
  state: string;
  destination: string;
  arrivalDate: string;
  numberOfDays: number;
  travellers: {
    total: number;
    adults: number;
    children: number;
    seniors: number;
  };
  transportMode: TransportMode;
  transportDetails?: string;
  ticketStatus?: string;
  tripType: TripType;
  plannedActivities?: string;
  specialConsiderations?: string;
}

export interface SmartChecklistData {
  id: string;
  generatedAt: string;
  input: SmartChecklistInput;
  items: SmartChecklistItem[];
  suggestions: AISuggestion[];
}

export interface MyJourneyPlan {
  destinationId: string;
  destinationName: string;
  stateName: string;
  arrivalDate: string;
  travellers: TravellersCount;
  selectedLandmarkId?: string;
  savedHotel?: Accommodation | null;
  savedRestaurants: Restaurant[];
  savedPlaces: NearbyPlace[];
  savedLandmarks: DestinationLandmark[];
}

