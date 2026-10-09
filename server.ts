import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { generateContextualChecklist } from './src/services/aiChecklistService';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

// API Endpoint: /api/generate-checklist
app.post('/api/generate-checklist', async (req, res) => {
  const input = req.body;

  if (!input || !input.destination) {
    return res.status(400).json({ error: 'Missing destination or travel details' });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });

      const prompt = `You are Yatra Saathi's expert Indian travel preparation engine.
Analyze this comprehensive trip context:
- State / UT: ${input.state}
- Destination: ${input.destination}
- Arrival Date: ${input.arrivalDate}
- Duration: ${input.numberOfDays} days
- Travellers: ${input.travellers.total} total (${input.travellers.adults} Adults, ${input.travellers.children} Children, ${input.travellers.seniors} Senior Citizens)
- Transport Mode: ${input.transportMode}
- Selected Transport Details: ${input.transportDetails || 'None provided'}
- Trip Type: ${input.tripType}
- Planned Activities / Places: ${input.plannedActivities || 'None provided'}
- Special Considerations: ${input.specialConsiderations || 'None provided'}

CRITICAL GUIDELINES:
1. Divide into 7 categories:
   - "before_you_leave"
   - "documents"
   - "packing"
   - "transport"
   - "destination_specific"
   - "family_traveller"
   - "emergency_safety"
2. DO NOT claim a document or permit is legally mandatory unless verified from an official source (e.g., Shrine Board, UIDAI, IRCTC, IMD, State Tourism).
3. If requirement depends on current government/destination rules, set isOfficialRequirement: true and provide officialSourceUrl and officialSourceLabel.
4. If transport details were provided by the user, acknowledge them specifically.
5. Provide 3-5 sharp, personalized "suggestions" analyzing potential oversights (e.g. senior pacing, arrival time vs check-in, duration vs activity density, season/monsoon/winter).

Respond ONLY with valid JSON in this exact structure:
{
  "id": "smart-checklist-generated",
  "generatedAt": "${new Date().toISOString()}",
  "input": ${JSON.stringify(input)},
  "items": [
    {
      "id": "unique-id",
      "category": "before_you_leave" | "documents" | "packing" | "transport" | "destination_specific" | "family_traveller" | "emergency_safety",
      "title": "Clear action title",
      "description": "Specific, practical advice",
      "isCompleted": false,
      "isOfficialRequirement": boolean,
      "officialSourceUrl": "string or undefined",
      "officialSourceLabel": "string or undefined",
      "tag": "Short label",
      "isUserProvided": boolean
    }
  ],
  "suggestions": [
    {
      "id": "sug-1",
      "type": "tip" | "warning" | "insight",
      "title": "Observation title",
      "description": "Personalized insight based on trip details",
      "sourceContext": "Context note"
    }
  ]
}`;

      const aiResponse = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      if (aiResponse.text) {
        const parsed = JSON.parse(aiResponse.text);
        if (parsed.items && Array.isArray(parsed.items) && parsed.items.length > 0) {
          return res.json(parsed);
        }
      }
    } catch (err) {
      console.warn('Gemini API call failed, using contextual generator fallback:', err);
    }
  }

  // Graceful, robust contextual generator fallback
  const fallbackData = generateContextualChecklist(input);
  return res.json(fallbackData);
});

// Server-side fast in-memory cache for trip timing recommendations
const timingAnalysisCache = new Map<string, any>();

// API Endpoint: /api/trip-timing-recommendation
app.post('/api/trip-timing-recommendation', async (req, res) => {
  const { destination, state, arrivalDate, travellers } = req.body;

  if (!destination) {
    return res.status(400).json({ error: 'Missing destination' });
  }

  // Check cache first for instant response
  const totalTravellers = travellers?.total || 1;
  const cacheKey = `${destination.toLowerCase().trim()}_${(state || '').toLowerCase().trim()}_${arrivalDate || ''}_${totalTravellers}`;
  if (timingAnalysisCache.has(cacheKey)) {
    return res.json(timingAnalysisCache.get(cacheKey));
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are Yatra Saathi's expert Indian destination intelligence engine.
Analyze travel timing concisely:
- Destination: ${destination}, ${state || 'India'}
- Arrival Date: ${arrivalDate || 'Current season'}
- Travellers: ${totalTravellers} (${travellers?.adults || 1} adults, ${travellers?.children || 0} children, ${travellers?.seniors || 0} seniors)

Evaluate seasonal climate, crowds, tariffs, sightseeing, and family suitability.

Respond ONLY with valid JSON in this exact structure:
{
  "tripTimingScore": 8.5,
  "scoreLabel": "8.5/10 — Good time to visit",
  "weatherSuitability": "Short 1-2 sentence assessment of weather and temperatures",
  "crowdSuitability": "Short 1-2 sentence assessment of seasonal pilgrim/tourist crowds",
  "costSuitability": "Short 1-2 sentence assessment of accommodation rates and value",
  "activitiesSuitability": "Short 1-2 sentence assessment of outdoor activities and visits",
  "familySuitability": "Short 1-2 sentence note on senior citizen and child comfort",
  "verdictSummary": "1 sentence clear trip verdict"
}`;

      // Enforce a strict 3.5s timeout so the UI never waits indefinitely
      const aiCallPromise = ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          maxOutputTokens: 350,
          responseMimeType: 'application/json',
        },
      });

      const timeoutPromise = new Promise<null>((resolve) =>
        setTimeout(() => resolve(null), 3500)
      );

      const aiResponse = await Promise.race([aiCallPromise, timeoutPromise]);

      if (aiResponse && aiResponse.text) {
        const parsed = JSON.parse(aiResponse.text);
        if (parsed.tripTimingScore && parsed.weatherSuitability) {
          timingAnalysisCache.set(cacheKey, parsed);
          return res.json(parsed);
        }
      }
    } catch (err) {
      console.warn('Gemini timing recommendation failed, using seasonal fallback:', err);
    }
  }

  // Graceful seasonal algorithmic fallback
  const monthNum = arrivalDate ? new Date(arrivalDate).getMonth() : new Date().getMonth();
  // Month: 0 (Jan) - 11 (Dec)
  const isWinter = monthNum === 10 || monthNum === 11 || monthNum === 0 || monthNum === 1; // Nov, Dec, Jan, Feb
  const isSpringAutumn = monthNum === 9 || monthNum === 2; // Oct, Mar
  const isMonsoon = monthNum === 6 || monthNum === 7; // Jul, Aug
  const isSummer = monthNum === 3 || monthNum === 4 || monthNum === 5; // Apr, May, Jun

  let score = 8.5;
  let label = '8.5/10 — Good time to visit';
  let weather = 'Pleasant daytime temperatures suitable for walking tours and heritage visits.';
  let crowd = 'Standard seasonal visitor volume with manageable queue wait times.';
  let cost = 'Moderate accommodation rates across heritage hotels and guest houses.';

  if (isWinter) {
    score = 9.0;
    label = '9.0/10 — Prime Season to visit';
    weather = 'Cool crisp winter climate (10°C–22°C); ideal for outdoor sightseeing and temple circumambulation.';
    crowd = 'High seasonal tourist and pilgrim density; pre-booking is recommended.';
    cost = 'High seasonal demand; early hotel booking ensures prime location rooms.';
  } else if (isSpringAutumn) {
    score = 8.8;
    label = '8.8/10 — Excellent window to visit';
    weather = 'Pleasant sunny days with cool evenings and low rainfall.';
    crowd = 'Moderate crowd levels with relaxed pacing at major landmarks.';
    cost = 'Balanced tariffs and good availability across transport and stays.';
  } else if (isMonsoon) {
    score = 7.2;
    label = '7.2/10 — Scenic monsoon season';
    weather = 'Lush surroundings with occasional rains; carry umbrellas and waterproof footwear.';
    crowd = 'Lighter visitor queues between major festive holidays.';
    cost = 'Value tariff season with attractive stay discounts.';
  } else if (isSummer) {
    score = 6.8;
    label = '6.8/10 — Warm summer off-peak';
    weather = 'Warm daytime temperatures; early morning (6 AM–9 AM) and post-sunset visits recommended.';
    crowd = 'Low crowds at prominent attractions; minimum queue waiting times.';
    cost = 'Budget-friendly tariffs with up to 30% savings on hotels.';
  }

  const fallbackResult = {
    tripTimingScore: score,
    scoreLabel: label,
    weatherSuitability: weather,
    crowdSuitability: crowd,
    costSuitability: cost,
    activitiesSuitability: 'Recommended for guided monument tours, local bazaar food walks, and cultural photography.',
    familySuitability: (travellers?.seniors || 0) > 0 ? 'Pace activities with shade breaks during midday hours.' : 'Comfortable for travellers with active walking shoes.',
    verdictSummary: `A viable window to visit ${destination} with proper seasonal planning.`,
  };

  timingAnalysisCache.set(cacheKey, fallbackResult);
  return res.json(fallbackResult);
});

// In-memory cache for Places queries to avoid duplicate API calls
const placesCache = new Map<string, any>();
const transitHubsCache = new Map<string, any>();
const foodStopsCache = new Map<string, any>();
const routeComputeCache = new Map<string, any>();

// Helper to get Google API Key
function getGoogleMapsApiKey(): string {
  return (
    process.env.VITE_GOOGLE_MAPS_API_KEY ||
    process.env.GOOGLE_MAPS_API_KEY ||
    'AIzaSyB54RPXTlgnxZfIKbFYxOrgypoKS2qTdLI'
  );
}

// API Endpoint: /api/places/search (Google Places API New Proxy)
app.post('/api/places/search', async (req, res) => {
  const { query, destination, landmark } = req.body;
  const apiKey = getGoogleMapsApiKey();

  if (!query && !destination) {
    return res.status(400).json({ error: 'Missing search query or destination' });
  }

  const textQuery = query || `hotels in ${destination} near ${landmark || destination}`;
  const cacheKey = textQuery.toLowerCase().trim();

  if (placesCache.has(cacheKey)) {
    return res.json(placesCache.get(cacheKey));
  }

  try {
    const placesResp = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask':
          'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.primaryType,places.types,places.photos,places.nationalPhoneNumber,places.websiteUri,places.priceLevel',
      },
      body: JSON.stringify({
        textQuery,
        languageCode: 'en',
        maxResultCount: 8,
      }),
    });

    if (placesResp.ok) {
      const data = await placesResp.json();
      if (data.places && data.places.length > 0) {
        const result = { places: data.places };
        placesCache.set(cacheKey, result);
        return res.json(result);
      }
    }
  } catch (err) {
    console.warn('Google Places API proxy fetch failed:', err);
  }

  return res.json({ places: [] });
});

// API Endpoint: /api/places/transit-hubs (Find actual Railway Station, Bus Stand, Airport near destination)
app.post('/api/places/transit-hubs', async (req, res) => {
  const { destination, state } = req.body;

  if (!destination || !destination.trim()) {
    return res.status(400).json({ error: 'Missing destination' });
  }

  const destClean = destination.trim();
  const cacheKey = `${destClean.toLowerCase()}_${(state || '').toLowerCase()}`;

  if (transitHubsCache.has(cacheKey)) {
    return res.json(transitHubsCache.get(cacheKey));
  }

  const apiKey = getGoogleMapsApiKey();

  // Search queries for actual transit hubs near the destination
  const queries = [
    { type: 'railway', label: 'Railway Station', icon: 'train', query: `railway station in ${destClean}` },
    { type: 'bus', label: 'Bus Terminal', icon: 'bus', query: `bus station OR ISBT in ${destClean}` },
    { type: 'airport', label: 'Airport', icon: 'plane', query: `airport in or near ${destClean}` },
  ];

  const results: any[] = [];

  for (const item of queries) {
    try {
      const resp = await fetch('https://places.googleapis.com/v1/places:searchText', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask':
            'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.types',
        },
        body: JSON.stringify({
          textQuery: item.query,
          languageCode: 'en',
          maxResultCount: 2,
        }),
      });

      if (resp.ok) {
        const data = await resp.json();
        if (data.places && data.places.length > 0) {
          const place = data.places[0];
          results.push({
            category: item.type,
            categoryLabel: item.label,
            icon: item.icon,
            placeId: place.id,
            name: place.displayName?.text || place.formattedAddress,
            address: place.formattedAddress,
            location: {
              lat: place.location?.latitude,
              lng: place.location?.longitude,
            },
            rating: place.rating || null,
            userRatingCount: place.userRatingCount || null,
            types: place.types || [],
            approxTravelTime:
              item.type === 'railway'
                ? 'Approx 15-25 mins from center'
                : item.type === 'bus'
                ? 'Approx 10-20 mins from center'
                : 'Approx 35-50 mins from center',
          });
        }
      }
    } catch (err) {
      console.warn(`Transit hub search failed for ${item.query}:`, err);
    }
  }

  const responsePayload = {
    destination: destClean,
    hubs: results,
  };

  transitHubsCache.set(cacheKey, responsePayload);
  return res.json(responsePayload);
});

// API Endpoint: /api/places/food-stops (Find real restaurants along route or destination)
app.post('/api/places/food-stops', async (req, res) => {
  const { destination, origin } = req.body;

  if (!destination || !destination.trim()) {
    return res.status(400).json({ error: 'Missing destination' });
  }

  const destClean = destination.trim();
  const originClean = (origin || '').trim();
  const cacheKey = `${destClean.toLowerCase()}_${originClean.toLowerCase()}`;

  if (foodStopsCache.has(cacheKey)) {
    return res.json(foodStopsCache.get(cacheKey));
  }

  const apiKey = getGoogleMapsApiKey();
  const searchQuery = originClean
    ? `top restaurants and famous dhabas near ${destClean}`
    : `best restaurants in ${destClean}`;

  try {
    const resp = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask':
          'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.photos,places.priceLevel,places.regularOpeningHours',
      },
      body: JSON.stringify({
        textQuery: searchQuery,
        languageCode: 'en',
        maxResultCount: 6,
      }),
    });

    if (resp.ok) {
      const data = await resp.json();
      if (data.places && data.places.length > 0) {
        // Resolve photo URIs for up to 6 places
        const formattedStops = await Promise.all(
          data.places.map(async (p: any, idx: number) => {
            let photoUrl = '';
            if (p.photos && p.photos.length > 0) {
              const photoRef = p.photos[0].name;
              try {
                const photoResp = await fetch(
                  `https://places.googleapis.com/v1/${photoRef}/media?maxHeightPx=400&maxWidthPx=500&skipHttpRedirect=true&key=${apiKey}`
                );
                if (photoResp.ok) {
                  const photoData = await photoResp.json();
                  photoUrl = photoData.photoUri || '';
                }
              } catch (photoErr) {
                // Ignore photo fetch failure
              }
            }

            // Fallback curated image if photo URI is missing
            if (!photoUrl) {
              const foodImages = [
                'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80',
              ];
              photoUrl = foodImages[idx % foodImages.length];
            }

            return {
              id: p.id,
              name: p.displayName?.text || 'Highway Food Stop',
              address: p.formattedAddress || `${destClean}, India`,
              location: {
                lat: p.location?.latitude || 25.3176,
                lng: p.location?.longitude || 82.9739,
              },
              rating: p.rating || 4.2,
              userRatingCount: p.userRatingCount || 120,
              cuisine: 'Authentic Indian & Refreshments',
              priceLevel: p.priceLevel || 'PRICE_LEVEL_MODERATE',
              isOpenNow: p.regularOpeningHours?.openNow ?? true,
              photo: photoUrl,
              distanceFromRoute: idx === 0 ? 'Directly on main route' : `Approx ${(idx * 1.2).toFixed(1)} km from main route`,
            };
          })
        );

        const resultPayload = { stops: formattedStops };
        foodStopsCache.set(cacheKey, resultPayload);
        return res.json(resultPayload);
      }
    }
  } catch (err) {
    console.warn('Food stops search failed:', err);
  }

  return res.json({ stops: [] });
});

// API Endpoint: /api/routes/compute (Google Routes API Directions v2)
app.post('/api/routes/compute', async (req, res) => {
  const { origin, destination, travelMode } = req.body;

  if (!origin || !destination) {
    return res.status(400).json({ error: 'Origin and destination are required' });
  }

  const originClean = origin.trim();
  const destClean = destination.trim();
  const mode = travelMode || 'DRIVE';
  const cacheKey = `${originClean.toLowerCase()}_${destClean.toLowerCase()}_${mode}`;

  if (routeComputeCache.has(cacheKey)) {
    return res.json(routeComputeCache.get(cacheKey));
  }

  const apiKey = getGoogleMapsApiKey();

  try {
    const routeResp = await fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask':
          'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline',
      },
      body: JSON.stringify({
        origin: { address: `${originClean}, India` },
        destination: { address: `${destClean}, India` },
        travelMode: mode,
      }),
    });

    if (routeResp.ok) {
      const data = await routeResp.json();
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const durationSec = parseInt((route.duration || '0s').replace('s', ''), 10);
        const distanceM = route.distanceMeters || 0;

        const hours = Math.floor(durationSec / 3600);
        const minutes = Math.floor((durationSec % 3600) / 60);
        const formattedDuration =
          hours > 0 ? `${hours}h ${minutes}m` : `${minutes} mins`;
        const formattedDistance = `${(distanceM / 1000).toFixed(0)} km`;

        const result = {
          success: true,
          encodedPolyline: route.polyline?.encodedPolyline || '',
          durationSeconds: durationSec,
          formattedDuration,
          distanceMeters: distanceM,
          formattedDistance,
        };

        routeComputeCache.set(cacheKey, result);
        return res.json(result);
      }
    }
  } catch (err) {
    console.warn('Google Routes API compute failed:', err);
  }

  return res.json({
    success: false,
    encodedPolyline: '',
    formattedDuration: 'Approx 6-8 hours',
    formattedDistance: 'Approx 450 km',
  });
});

// Fast in-memory cache for trip route planning
const tripRoutePlannerCache = new Map<string, any>();

// API Endpoint: /api/plan-trip-route (AI Trip Planner Engine)
app.post('/api/plan-trip-route', async (req, res) => {
  const {
    startingLocation,
    destination,
    state,
    travelDate,
    travellers,
    preferredTransport,
  } = req.body;

  if (!startingLocation || !startingLocation.trim()) {
    return res.status(400).json({ error: 'Please enter your starting location so we can plan your route.' });
  }

  if (!destination || !destination.trim()) {
    return res.status(400).json({ error: 'Please select a destination.' });
  }

  const startClean = startingLocation.trim();
  const destClean = destination.trim();
  const stateClean = (state || '').trim();
  const modePref = preferredTransport || 'Best option / Let AI decide';
  const totalTravellers = travellers?.total || 1;

  // Cache key
  const cacheKey = `${startClean.toLowerCase()}_${destClean.toLowerCase()}_${stateClean.toLowerCase()}_${modePref.toLowerCase()}_${totalTravellers}`;
  if (tripRoutePlannerCache.has(cacheKey)) {
    return res.json(tripRoutePlannerCache.get(cacheKey));
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are Yatra Saathi's expert Indian transit and inter-city route planning engine.
Plan the complete, realistic travel route from starting location to destination:
- Starting Location: ${startClean}
- Destination: ${destClean}, ${stateClean || 'India'}
- Date of Travel: ${travelDate || 'Upcoming date'}
- Travellers: ${totalTravellers} (${travellers?.adults || 1} adults, ${travellers?.children || 0} children, ${travellers?.seniors || 0} seniors)
- Preferred Transport: ${modePref}

CRITICAL RULES:
1. Answer "How do I actually travel from my starting location to my destination?"
2. If starting point is a satellite town or nearby city (e.g. Ghaziabad, Noida, Thane, Howrah), explain the exact transfer to the primary departure hub (e.g., NDLS, Anand Vihar, CSMT, Howrah).
3. Clearly detail train/bus changes: where to board, where to change, what to take next, and final local transit.
4. Do NOT invent fake train numbers, fake timings, fake fares, or fake flight numbers. Mention standard service categories (e.g. "Vande Bharat / Shatabdi Express / State Roadways Volvo / Prepaid Auto").
5. Keep explanations clear and practical for everyday Indian travellers.

Respond ONLY with valid JSON in this exact structure:
{
  "recommendedRoute": {
    "startingPoint": "${startClean}",
    "destination": "${destClean}, ${stateClean}",
    "transportMode": "Train" | "Bus" | "Flight" | "Road",
    "totalDuration": "Approx X hours",
    "numberOfChanges": "Direct" or "1 Change via [Hub]" or "2 Changes",
    "majorInterchanges": ["List of key interchange stations or terminals"],
    "lastMileTransport": "Specific local transit (e.g., Prepaid auto/cab from station to destination, approx 15 mins)",
    "whyRecommended": "Concise 1-2 sentence explanation why this is the best practical route",
    "steps": [
      {
        "stepNumber": 1,
        "title": "Start: [Origin] to [Primary Departure Hub/Station]",
        "mode": "Metro / Cab / Local Train / Bus",
        "description": "Clear step instructions on how to reach boarding station",
        "stationOrTerminal": "Departure Station Name",
        "duration": "Duration estimate"
      },
      {
        "stepNumber": 2,
        "title": "Board [Main Express / Intercity Service] to [Interchange or Destination]",
        "mode": "Train / Bus / Flight / Road",
        "description": "Specific route advice, major line or highway",
        "stationOrTerminal": "Boarding → Arrival Station",
        "duration": "Duration estimate"
      },
      {
        "stepNumber": 3,
        "title": "Transfer / Final Leg",
        "mode": "Train / Bus / Local Transit",
        "description": "Transfer instructions or arrival handling",
        "stationOrTerminal": "Station Name",
        "duration": "Duration estimate"
      },
      {
        "stepNumber": 4,
        "title": "Last-Mile Connection to [Destination]",
        "mode": "Auto / E-Rickshaw / Taxi",
        "description": "How to navigate from arrival terminal to destination center / hotel",
        "stationOrTerminal": "Local transit stand",
        "duration": "Duration estimate"
      }
    ]
  },
  "visualRoadmap": [
    { "label": "${startClean}", "icon": "start", "type": "Origin" },
    { "label": "Major Transit Hub", "icon": "hub", "type": "Interchange" },
    { "label": "${destClean} Terminal / Station", "icon": "arrival", "type": "Arrival Hub" },
    { "label": "${destClean}", "icon": "destination", "type": "Final Destination" }
  ],
  "alternatives": [
    {
      "mode": "Train" | "Bus" | "Flight" | "Road",
      "title": "Alternative Option Title",
      "duration": "Approx duration",
      "route": "Key corridor overview",
      "changes": "Changes count",
      "pros": "Main advantage",
      "cons": "Main trade-off"
    }
  ],
  "modeDetails": {
    "train": {
      "bestService": "Recommended express category",
      "boardingStation": "Boarding station name",
      "deboardingStation": "Destination railway station",
      "transferStation": "Interchange station if applicable or 'Direct service available'",
      "transferTimeBuffer": "Recommended buffer time",
      "lastMile": "Local transit from railway station"
    },
    "bus": {
      "startingTerminal": "Nearest prominent bus terminal",
      "destinationTerminal": "Destination bus stand",
      "operatorType": "State Roadways / Private AC Sleeper",
      "lastMile": "Local auto/taxi from bus stand"
    },
    "flight": {
      "departureAirport": "Nearest departure airport",
      "arrivalAirport": "Nearest destination airport",
      "distanceFromCity": "Airport distance from city center",
      "lastMile": "Prepaid airport taxi / app cab"
    },
    "road": {
      "majorHighways": "Highway numbers and primary route",
      "approxDistance": "Approx road km",
      "estimatedDriveTime": "Approx driving time",
      "keyInterchanges": "Bypass routes or expressways"
    }
  },
  "beforeYouTravel": {
    "reportingTime": "Recommended arrival time at station/airport",
    "transferGuidance": "Important interchange navigation advice",
    "documents": "Govt photo ID (Aadhaar / Voter ID / DL) and confirmed ticket",
    "luggageGuidance": "Keep luggage manageable for platform stairs and transfers",
    "weatherPrep": "Seasonal climate preparation note"
  },
  "whyThisRoute": "Concise summary considering duration, cost, comfort, and group size."
}`;

      const aiCallPromise = ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          maxOutputTokens: 850,
          responseMimeType: 'application/json',
        },
      });

      const timeoutPromise = new Promise<null>((resolve) =>
        setTimeout(() => resolve(null), 3500)
      );

      const aiResponse = await Promise.race([aiCallPromise, timeoutPromise]);

      if (aiResponse && aiResponse.text) {
        const parsed = JSON.parse(aiResponse.text);
        if (parsed.recommendedRoute && parsed.recommendedRoute.steps) {
          tripRoutePlannerCache.set(cacheKey, parsed);
          return res.json(parsed);
        }
      }
    } catch (err) {
      console.warn('Gemini route planning failed, using intelligent transport fallback:', err);
    }
  }

  // Graceful, robust algorithmic transit fallback
  const isTrainPreferred = modePref === 'Train' || modePref.includes('AI decide') || modePref === 'Best option';
  const isFlightPreferred = modePref === 'Flight';
  const isBusPreferred = modePref === 'Bus';
  const isRoadPreferred = modePref === 'Road';

  let recommendedMode = 'Train';
  if (isFlightPreferred) recommendedMode = 'Flight';
  else if (isBusPreferred) recommendedMode = 'Bus';
  else if (isRoadPreferred) recommendedMode = 'Road';

  const fallbackPlan = {
    recommendedRoute: {
      startingPoint: startClean,
      destination: `${destClean}, ${stateClean}`,
      transportMode: recommendedMode,
      totalDuration: recommendedMode === 'Flight' ? 'Approx 3h 30m total' : recommendedMode === 'Road' ? 'Approx 6h 30m driving' : 'Approx 7 to 9 hours',
      numberOfChanges: '1 Change via Regional Junction',
      majorInterchanges: [`Central Hub serving ${startClean} and ${destClean}`],
      lastMileTransport: `Local prepaid auto or taxi from arrival station/terminal to ${destClean} center (approx 15-20 mins)`,
      whyRecommended: `Balanced travel time, wide service availability, and comfortable point-to-point transit connecting ${startClean} to ${destClean}.`,
      steps: [
        {
          stepNumber: 1,
          title: `Start from ${startClean} to Primary Boarding Station/Terminal`,
          mode: 'Metro / City Transit / Cab',
          description: `Reach the nearest major railway junction or transit terminal from ${startClean}. Allow sufficient buffer for city traffic.`,
          stationOrTerminal: `Departure Hub serving ${startClean}`,
          duration: '35 - 50 mins'
        },
        {
          stepNumber: 2,
          title: `Board Express Transport towards ${destClean}`,
          mode: recommendedMode,
          description: `Take scheduled express service along the primary transit corridor towards ${destClean}.`,
          stationOrTerminal: `Boarding Hub → ${destClean} Junction/Stand`,
          duration: '4 to 6 hours'
        },
        {
          stepNumber: 3,
          title: `Arrival at ${destClean} Transit Hub`,
          mode: 'Arrival Hub',
          description: `Deboard at the main terminal or junction. Follow signs to official prepaid auto, taxi, or authorized local transport counter.`,
          stationOrTerminal: `${destClean} Junction / Bus Terminal`,
          duration: '15 mins'
        },
        {
          stepNumber: 4,
          title: `Local Transit to Your Hotel / Place of Stay in ${destClean}`,
          mode: 'Auto-Rickshaw / E-Rickshaw / Cab',
          description: `Take licensed prepaid auto or app-based cab to your stay or temple/heritage zone.`,
          stationOrTerminal: `${destClean} Destination Center`,
          duration: '15 - 25 mins'
        }
      ]
    },
    visualRoadmap: [
      { label: startClean, icon: 'start', type: 'Origin' },
      { label: `Hub for ${startClean}`, icon: 'hub', type: 'Departure Hub' },
      { label: `${destClean} Station`, icon: 'arrival', type: 'Arrival Terminal' },
      { label: `${destClean} Center`, icon: 'destination', type: 'Final Destination' }
    ],
    alternatives: [
      {
        mode: 'Train',
        title: 'Superfast Express / Intercity Train',
        duration: 'Approx 6 to 8 hours',
        route: `${startClean} Hub → Direct Rail Line → ${destClean} Junction`,
        changes: '0 to 1 Change',
        pros: 'Economical, safe, relaxed travel with berths/seats.',
        cons: 'Seats require advance reservation during peak pilgrim/vacation windows.'
      },
      {
        mode: 'Road',
        title: 'Personal Vehicle / Self-Drive Cab via National Highway',
        duration: 'Approx 7 to 9 hours',
        route: `Direct Highway Corridor connecting ${startClean} to ${destClean}`,
        changes: 'Direct Door-to-Door',
        pros: 'Total flexibility on departures, luggage, and roadside stops.',
        cons: 'Toll costs, fuel expenses, and driver fatigue over long distances.'
      },
      {
        mode: 'Bus',
        title: 'State Roadways / Private Volvo AC Sleeper',
        duration: 'Approx 8 to 10 hours',
        route: `Inter-State Bus Terminal → Highway Route → ${destClean} ISBT`,
        changes: 'Direct or 1 Change',
        pros: 'Convenient overnight journeys with good seat availability.',
        cons: 'Highway travel times can fluctuate with road repairs and traffic.'
      }
    ],
    modeDetails: {
      train: {
        bestService: 'Vande Bharat / Shatabdi / Superfast Express',
        boardingStation: `Nearest Major Railway Junction for ${startClean}`,
        deboardingStation: `${destClean} Railway Station`,
        transferStation: 'Direct or primary divisional interchange',
        transferTimeBuffer: 'Allow 45 minutes transfer buffer between connecting trains',
        lastMile: 'Prepaid auto or government pilgrim shuttles outside station'
      },
      bus: {
        startingTerminal: `Inter-State Bus Terminal (ISBT) near ${startClean}`,
        destinationTerminal: `${destClean} Central Bus Stand`,
        operatorType: 'State Transport Corporation (STC) & Authorized Volvo Operators',
        lastMile: 'Shared or private e-rickshaws and autos available 24/7'
      },
      flight: {
        departureAirport: `Nearest Domestic Airport for ${startClean}`,
        arrivalAirport: `Nearest Airport serving ${destClean}`,
        distanceFromCity: '10 to 25 km from city center',
        lastMile: 'Prepaid airport taxi booths inside arrivals terminal'
      },
      road: {
        majorHighways: 'National Highway corridor connecting origin to destination',
        approxDistance: 'Approx 350 - 550 km depending on route',
        estimatedDriveTime: '7 to 9 hours with short rest stops',
        keyInterchanges: 'Bypass ring roads and expressways around major metro crossings'
      }
    },
    beforeYouTravel: {
      reportingTime: 'Arrive 30-45 minutes before train departure; 2 hours for flights.',
      transferGuidance: 'Check platform numbers on official enquiry boards or NTES app before changing trains.',
      documents: 'Keep Government Photo ID (Aadhaar, Voter ID, Passport) and digital tickets handy.',
      luggageGuidance: 'Keep luggage compact and labeled; keep valuables and charger in hand baggage.',
      weatherPrep: 'Check arrival forecast; carry a light pullover for AC coaches and rain protection during monsoons.'
    },
    whyThisRoute: `This journey route offers high predictability, manageable transfers, and efficient transit connecting ${startClean} to ${destClean}.`
  };

  tripRoutePlannerCache.set(cacheKey, fallbackPlan);
  return res.json(fallbackPlan);
});

// API Endpoint: /api/yatrabot (Conversational AI Travel Assistant)
app.post('/api/yatrabot', async (req, res) => {
  const { message, history, context } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required' });
  }

  const {
    startingLocation,
    destination,
    state,
    travelDate,
    travellers,
    preferredTransport,
    recommendedRoute,
    activeDay,
  } = context || {};

  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });

      const systemInstruction = `You are "YatraBot", the dedicated, warm, and highly practical AI Travel Companion for Yatra Saathi.
Your mission is to help Indian travellers plan their journeys smoothly and realistically.

Current Trip Planning Context:
- Starting Location (Origin): ${startingLocation || 'Not specified yet'}
- Destination: ${destination || 'Not specified yet'}${state ? ` (${state})` : ''}
- Travel Date: ${travelDate || 'Flexible'}
- Travellers: ${travellers ? `${travellers.total} (${travellers.adults} adults, ${travellers.children || 0} children, ${travellers.seniors || 0} seniors)` : '1'}
- Preferred Transport: ${preferredTransport || 'AI Best Recommendation'}
- Recommended Route Mode: ${recommendedRoute?.transportMode || 'Train / Multi-modal'}
- Route Duration: ${recommendedRoute?.totalDuration || 'Pending route calculation'}
- Active Trip Day: Day ${activeDay || 1}

CORE PERSONALITY & GUIDELINES:
1. Practical, reassuring, and grounded in Indian travel reality (IRCTC trains, Vande Bharat, metro feeder links, bus stands, airport connections, station cloakrooms, porter tips, weather precautions, pilgrim crowd tips).
2. Never invent fake train numbers, fake timings, fake ticket prices, or fake flight PNRs. Refer to authentic categories like "Vande Bharat Express", "Shatabdi", "Superfast Express", "State Roadways Volvo", or "Metro feeder".
3. Keep answers concise, nicely structured with bullet points or bold labels, and easy to read on mobile.
4. Seamlessly integrate with Yatra Saathi: if the user asks about hotels, recommend checking verified stays; if they ask about packing or documents, recommend the Yatra Saathi Checklist; if they ask about food, mention verified dhabas along the highway.
5. Offer 2-3 quick follow-up question chips or action suggestions at the end of answers when relevant.`;

      // Build conversation contents
      const conversationContents: any[] = [];

      // Add previous message history if available
      if (Array.isArray(history) && history.length > 0) {
        history.slice(-8).forEach((item: { role: string; text: string }) => {
          if (item.text && item.text.trim()) {
            conversationContents.push({
              role: item.role === 'user' ? 'user' : 'model',
              parts: [{ text: item.text }],
            });
          }
        });
      }

      // Add current message
      conversationContents.push({
        role: 'user',
        parts: [{ text: message }],
      });

      const aiCallPromise = ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: conversationContents,
        config: {
          systemInstruction,
          maxOutputTokens: 600,
          temperature: 0.7,
        },
      });

      const timeoutPromise = new Promise<null>((resolve) =>
        setTimeout(() => resolve(null), 3500)
      );

      const aiResponse = await Promise.race([aiCallPromise, timeoutPromise]);

      if (aiResponse && aiResponse.text) {
        return res.json({ reply: aiResponse.text });
      }
    } catch (err) {
      console.warn('Gemini YatraBot failed, using contextual fallback:', err);
    }
  }

  // Contextual fallback response generator
  const qLower = message.toLowerCase();
  let fallbackReply = '';

  const originText = startingLocation || 'your starting location';
  const destText = destination || 'your destination';

  if (qLower.includes('train') || qLower.includes('rail') || qLower.includes('irctc')) {
    fallbackReply = `For travel from **${originText}** to **${destText}**:\n\n• **Best Train Options**: Check for direct Vande Bharat Express or Superfast Intercity trains on the IRCTC portal.\n• **Boarding Advice**: Reach the station at least 35-45 minutes before departure to easily locate your coach and manage luggage.\n• **Connecting Transfers**: If taking a connection, always keep at least 45 minutes buffer between arrival and connecting departure.\n• **Booking**: You can use the IRCTC link in the Booking section below to book official reserved berths.`;
  } else if (qLower.includes('hotel') || qLower.includes('stay') || qLower.includes('room')) {
    fallbackReply = `Here are practical accommodation tips for **${destText}**:\n\n• **Location**: Choose a hotel within 2-3 km of the main transit hub or central landmark to minimize local auto fares.\n• **Senior / Family Friendly**: Verify ground floor rooms or elevator access in advance if travelling with seniors.\n• **Booking**: You can explore verified stays in the **Hotels** section from the top navbar.`;
  } else if (qLower.includes('packing') || qLower.includes('pack') || qLower.includes('document') || qLower.includes('aadhaar')) {
    fallbackReply = `Key essentials for **${destText}**:\n\n• **ID Proofs**: Original government photo IDs (Aadhaar / Voter ID / Driving License) for all travellers.\n• **Clothing**: Keep a light jacket or shawl for AC train coaches / night travel.\n• **Medical Kit**: Basic motion-sickness tablets, pain relief balm, band-aids, and ORS sachets.\n• **Tip**: Check the **Checklist** tab in the navigation bar for your personalized itemized packing guide!`;
  } else if (qLower.includes('food') || qLower.includes('eat') || qLower.includes('restaurant') || qLower.includes('dhaba')) {
    fallbackReply = `Food advice along the route to **${destText}**:\n\n• **Highway Stops**: Stick to busy, well-reviewed dhabas with high turnover for freshly cooked vegetarian meals.\n• **Train Journey**: Prefer sealed bottled water (Rail Neer) and packaged snacks or pantry car meals ordered via the official IRCTC e-catering app.\n• **Local Delicacies**: Check out the curated food stops section right below the route map!`;
  } else if (qLower.includes('time') || qLower.includes('how long') || qLower.includes('duration') || qLower.includes('hours')) {
    const duration = recommendedRoute?.totalDuration || 'approx 6 to 9 hours';
    fallbackReply = `The typical journey from **${originText}** to **${destText}** takes **${duration}** depending on your chosen transport mode.\n\n• **Trains (Superfast/Vande Bharat)**: Highly predictable and comfortable.\n• **Road / Cab**: Ideal for door-to-door convenience with stops at scenic roadside dhabas.\n• **Flights**: Fastest flight time, but account for 2 hours airport check-in plus last-mile city transit.`;
  } else {
    fallbackReply = `Hello! I'm **YatraBot**, your AI travel companion for your trip from **${originText}** to **${destText}**.\n\nI can help you with:\n• Finding the best train, bus, or road connections\n• Pacing your day-wise itinerary and transit buffers\n• Local auto/cab guidelines and station arrival times\n• Packing tips and official document requirements\n\nWhat would you like to know about your upcoming journey?`;
  }

  return res.json({ reply: fallbackReply });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Yatra Saathi Server listening on port ${PORT}`);
  });
}

startServer();
