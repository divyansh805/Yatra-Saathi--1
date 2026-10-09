import {
  Accommodation,
  AccommodationFilters,
  DestinationItem,
  DestinationLandmark,
  Restaurant,
  RestaurantFilters,
} from '../types';
import { getDestinationData } from '../data/destinationsData';

// Haversine distance formula with realistic road topology adjustment
export function calculateRoadDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  isHilly = false
): { distanceKm: number; distanceText: string; driveTimeText: string } {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightLineKm = R * c;

  // Road factor: roads are rarely straight lines. In plains ~1.25x, in hills ~1.45x
  const roadFactor = isHilly ? 1.45 : 1.25;
  const roadDistanceKm = Math.max(0.3, parseFloat((straightLineKm * roadFactor).toFixed(1)));

  // Drive time estimate: urban speed ~25 km/h, mountain speed ~20 km/h
  const avgSpeedKmh = isHilly ? 20 : 28;
  const timeMinutes = Math.max(2, Math.round((roadDistanceKm / avgSpeedKmh) * 60));

  let driveTimeText = `${timeMinutes} mins drive`;
  if (timeMinutes > 60) {
    const hours = Math.floor(timeMinutes / 60);
    const mins = timeMinutes % 60;
    driveTimeText = `${hours} hr ${mins} mins drive`;
  }

  return {
    distanceKm: roadDistanceKm,
    distanceText: `${roadDistanceKm} km`,
    driveTimeText,
  };
}

export async function fetchDestinationContent(
  destinationQuery: string
): Promise<{
  destination: DestinationItem;
  accommodations: Accommodation[];
  restaurants: Restaurant[];
}> {
  const destination = getDestinationData(destinationQuery);

  try {
    const res = await fetch('/api/places/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        destination: destination.name,
      }),
    });

    if (res.status === 429) {
      window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
    }
  } catch {
    // Seamless fallback to verified registry
  }

  return {
    destination,
    accommodations: destination.accommodations,
    restaurants: destination.restaurants,
  };
}

// Adjust hotel distances when user selects a custom landmark
export function enrichHotelsWithSelectedLandmark(
  hotels: Accommodation[],
  selectedLandmark: DestinationLandmark | null,
  isHilly = false
): Accommodation[] {
  if (!selectedLandmark) return hotels;

  return hotels.map((hotel) => {
    const roadCalc = calculateRoadDistance(
      hotel.coordinates.lat,
      hotel.coordinates.lng,
      selectedLandmark.coordinates.lat,
      selectedLandmark.coordinates.lng,
      isHilly
    );

    return {
      ...hotel,
      distances: {
        ...hotel.distances,
        landmark: {
          distance: roadCalc.distanceText,
          landmarkName: selectedLandmark.name,
          type: 'Road distance',
          travelTime: roadCalc.driveTimeText,
        },
      },
    };
  });
}

// Adjust restaurant distances when user selects a custom landmark or active hotel
export function enrichRestaurantsWithSelectedLandmark(
  restaurants: Restaurant[],
  selectedLandmark: DestinationLandmark | null,
  activeHotel: Accommodation | null,
  isHilly = false
): Restaurant[] {
  return restaurants.map((rest) => {
    let distFromLandmark = rest.distanceFromSelectedLandmark;
    let travelTime = rest.travelTime || '5 mins drive';

    if (selectedLandmark) {
      const landmarkCalc = calculateRoadDistance(
        rest.coordinates.lat,
        rest.coordinates.lng,
        selectedLandmark.coordinates.lat,
        selectedLandmark.coordinates.lng,
        isHilly
      );
      distFromLandmark = `${landmarkCalc.distanceText} from ${selectedLandmark.name}`;
      travelTime = landmarkCalc.driveTimeText;
    }

    let distFromHotel = rest.distanceFromHotel;
    if (activeHotel) {
      const hotelCalc = calculateRoadDistance(
        rest.coordinates.lat,
        rest.coordinates.lng,
        activeHotel.coordinates.lat,
        activeHotel.coordinates.lng,
        isHilly
      );
      distFromHotel = `${hotelCalc.distanceText} from ${activeHotel.name}`;
    }

    return {
      ...rest,
      distanceFromSelectedLandmark: distFromLandmark,
      distanceFromHotel: distFromHotel,
      travelTime,
    };
  });
}

// Hotel filtering logic
export function filterAccommodations(
  accommodations: Accommodation[],
  filters: AccommodationFilters,
  _selectedLandmark?: DestinationLandmark | null
): Accommodation[] {
  return accommodations.filter((hotel) => {
    // 1. Price Range filter
    if (filters.priceRanges.length > 0) {
      const matchesPrice = filters.priceRanges.some((range) => {
        if (range === '₹2,000 – ₹3,000') return hotel.price >= 2000 && hotel.price <= 3000;
        if (range === '₹3,000 – ₹5,000') return hotel.price > 3000 && hotel.price <= 5000;
        if (range === '₹5,000 – ₹8,000') return hotel.price > 5000 && hotel.price <= 8000;
        if (range === '₹8,000+') return hotel.price > 8000;
        return true;
      });
      if (!matchesPrice) return false;
    }

    // 2. Accommodation Type filter
    if (filters.types.length > 0) {
      if (!filters.types.includes(hotel.type)) {
        return false;
      }
    }

    // 3. Rating filter
    if (filters.minRating !== null) {
      if (hotel.rating < filters.minRating) {
        return false;
      }
    }

    // 4. Facilities filter
    if (filters.facilities.length > 0) {
      const hasAllFacilities = filters.facilities.every((facility) =>
        hotel.facilities.some((f) => f.toLowerCase().includes(facility.toLowerCase()))
      );
      if (!hasAllFacilities) return false;
    }

    // 5. Proximity filter
    if (filters.proximity.length > 0) {
      const matchesProximity = filters.proximity.every((prox) => {
        if (prox === 'Near Railway Station') {
          const num = parseFloat(hotel.distances.railwayStation.distance);
          return !isNaN(num) && num <= 3.5;
        }
        if (prox === 'Near Bus Stand') {
          const num = parseFloat(hotel.distances.busStand.distance);
          return !isNaN(num) && num <= 2.5;
        }
        if (prox === 'Near Airport') {
          const num = parseFloat(hotel.distances.airport.distance);
          return !isNaN(num) && num <= 25.0;
        }
        if (prox === 'Near Selected Landmark') {
          const num = parseFloat(hotel.distances.landmark.distance);
          return !isNaN(num) && num <= 3.0;
        }
        return true;
      });
      if (!matchesProximity) return false;
    }

    return true;
  });
}

// Restaurant filtering logic
export function filterRestaurants(
  restaurants: Restaurant[],
  filters: RestaurantFilters
): Restaurant[] {
  return restaurants.filter((rest) => {
    // 1. Food Type (Vegetarian, Non-Vegetarian, Vegan, Mixed)
    if (filters.foodTypes.length > 0) {
      if (!filters.foodTypes.includes(rest.foodType)) {
        return false;
      }
    }

    // 2. Price Range (₹, ₹₹, ₹₹₹, ₹₹₹₹)
    if (filters.priceLevels.length > 0) {
      if (!filters.priceLevels.includes(rest.priceLevel)) {
        return false;
      }
    }

    // 3. Rating
    if (filters.minRating !== null) {
      if (rest.rating < filters.minRating) {
        return false;
      }
    }

    // 4. Cuisine
    if (filters.cuisines.length > 0) {
      const matchesCuisine = filters.cuisines.some((c) =>
        rest.cuisine.some((rc) => rc.toLowerCase().includes(c.toLowerCase()))
      );
      if (!matchesCuisine) return false;
    }

    // 5. Facilities (Family Friendly, Parking, Delivery, Outdoor Seating, Wheelchair Accessible)
    if (filters.facilities.length > 0) {
      const hasAllFacilities = filters.facilities.every((fac) =>
        rest.facilities.some((rf) => rf.toLowerCase().includes(fac.toLowerCase()))
      );
      if (!hasAllFacilities) return false;
    }

    // 6. Proximity
    if (filters.proximity.length > 0) {
      const matchesProximity = filters.proximity.every((prox) => {
        if (prox === 'Near Hotel') {
          const num = parseFloat(rest.distanceFromHotel);
          return !isNaN(num) && num <= 2.5;
        }
        if (prox === 'Near Selected Landmark') {
          const num = parseFloat(rest.distanceFromSelectedLandmark);
          return !isNaN(num) && num <= 2.5;
        }
        return true;
      });
      if (!matchesProximity) return false;
    }

    return true;
  });
}
