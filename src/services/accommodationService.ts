import { Accommodation, AccommodationFilters, DestinationItem } from '../types';
import { fetchDestinationContent, filterAccommodations } from './travelDataService';

export async function fetchStaysForDestination(
  destinationQuery: string,
  _arrivalDate?: string
): Promise<{ destination: DestinationItem; stays: Accommodation[] }> {
  const result = await fetchDestinationContent(destinationQuery);
  return {
    destination: result.destination,
    stays: result.accommodations,
  };
}

export { filterAccommodations };
