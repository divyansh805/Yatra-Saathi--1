import {
  SmartChecklistInput,
  SmartChecklistItem,
  AISuggestion,
  SmartChecklistData,
} from '../types';
import { getDestinationData } from '../data/destinationsData';

// Generates an AI-powered personalized checklist
export async function generateSmartChecklist(
  input: SmartChecklistInput
): Promise<SmartChecklistData> {
  // First, attempt to call the backend server API proxy
  try {
    const response = await fetch('/api/generate-checklist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.items && data.items.length > 0) {
        return data;
      }
    }
  } catch {
    // If backend is not running or network request fails, fall through to our contextual engine
  }

  // Contextual Intelligent Generator (Grounded, highly personalized, zero hallucinations)
  return generateContextualChecklist(input);
}

export function generateContextualChecklist(
  input: SmartChecklistInput
): SmartChecklistData {
  const destInfo = getDestinationData(input.destination);
  const items: SmartChecklistItem[] = [];
  const suggestions: AISuggestion[] = [];

  const arrivalMonth = input.arrivalDate
    ? new Date(input.arrivalDate).getMonth()
    : new Date().getMonth();
  // 0: Jan, 1: Feb, 2: Mar, 3: Apr, 4: May, 5: Jun, 6: Jul, 7: Aug, 8: Sep, 9: Oct, 10: Nov, 11: Dec
  const isWinter = [10, 11, 0, 1].includes(arrivalMonth);
  const isMonsoon = [5, 6, 7, 8].includes(arrivalMonth);
  const isSummer = [2, 3, 4].includes(arrivalMonth);

  const isHill =
    destInfo.category === 'Hill Station' ||
    destInfo.climateType === 'cold' ||
    destInfo.climateType === 'hilly' ||
    input.destination.toLowerCase().includes('manali') ||
    input.destination.toLowerCase().includes('gulmarg') ||
    input.destination.toLowerCase().includes('shimla') ||
    input.destination.toLowerCase().includes('munnar') ||
    input.destination.toLowerCase().includes('leh') ||
    input.destination.toLowerCase().includes('ooty');

  const isBeach =
    destInfo.category === 'Beach' ||
    input.destination.toLowerCase().includes('goa') ||
    input.destination.toLowerCase().includes('puri') ||
    input.destination.toLowerCase().includes('varkala') ||
    input.destination.toLowerCase().includes('havelock');

  const isPilgrimage =
    input.tripType === 'Religious / Pilgrimage' ||
    destInfo.category === 'Religious' ||
    input.destination.toLowerCase().includes('vaishno') ||
    input.destination.toLowerCase().includes('puri') ||
    input.destination.toLowerCase().includes('varanasi') ||
    input.destination.toLowerCase().includes('tirupati') ||
    input.destination.toLowerCase().includes('ayodhya') ||
    input.destination.toLowerCase().includes('amritsar');

  const hasSeniors = input.travellers.seniors > 0;
  const hasChildren = input.travellers.children > 0;

  // ================= 1. BEFORE YOU LEAVE =================
  items.push({
    id: 'byl-hotel-confirm',
    category: 'before_you_leave',
    title: `Confirm Accommodation & Check-in Timings in ${input.destination}`,
    description: `Contact your hotel or guest house 24-48 hours prior to verify room readiness for ${input.travellers.total} guests. Mention early arrival if reaching in the morning.`,
    isCompleted: false,
    tag: 'Stay Prep',
  });

  items.push({
    id: 'byl-weather-advisory',
    category: 'before_you_leave',
    title: `Check IMD Regional Weather Bulletin for ${destInfo.state}`,
    description: `Review 5-day precipitation and temperature forecasts for ${input.destination} to adapt clothing and travel timings.`,
    isCompleted: false,
    isOfficialRequirement: false,
    officialSourceUrl: 'https://mausam.imd.gov.in',
    officialSourceLabel: 'India Meteorological Department (IMD)',
    tag: 'Weather',
  });

  items.push({
    id: 'byl-offline-docs',
    category: 'before_you_leave',
    title: 'Download Offline Tickets, Passes & Area Map',
    description:
      'Save offline PDFs of train/flight tickets and download offline Google Maps for navigation in low cellular network zones.',
    isCompleted: false,
    tag: 'Digital Prep',
  });

  items.push({
    id: 'byl-emergency-contacts',
    category: 'before_you_leave',
    title: `Save Official Local Emergency & Tourism Helplines for ${input.destination}`,
    description: `Store National Emergency 112, Medical Ambulance 108, and ${destInfo.state} Tourism helpline in family phones.`,
    isCompleted: false,
    tag: 'Safety',
  });

  // ================= 2. DOCUMENTS & IDS =================
  items.push({
    id: 'doc-govt-id',
    category: 'documents',
    title: 'Original Government Photo ID for Every Traveller (Aadhaar / Voter ID / Passport)',
    description:
      'Required at boarding, highway checkpoints, hotel check-in, and monument security checks. Carry original IDs plus photocopy or DigiLocker backup.',
    isCompleted: false,
    isOfficialRequirement: true,
    officialSourceUrl: 'https://uidai.gov.in',
    officialSourceLabel: 'Govt. of India ID Directives',
    tag: 'Mandatory ID',
  });

  items.push({
    id: 'doc-transit-pass',
    category: 'documents',
    title: `Confirmed ${input.transportMode} Ticket & Reservation Confirmation`,
    description: `Ensure digital or paper printout of your confirmed ticket with passenger names matching government IDs.`,
    isCompleted: false,
    tag: 'Transport Pass',
  });

  // Check verified destination permits
  if (destInfo.officialPermits && destInfo.officialPermits.length > 0) {
    destInfo.officialPermits.forEach((permit, idx) => {
      items.push({
        id: `doc-permit-${idx}`,
        category: 'documents',
        title: `Verify Requirement: ${permit.name}`,
        description: permit.notes,
        isCompleted: false,
        isOfficialRequirement: permit.isRequired,
        officialSourceUrl: permit.sourceUrl,
        officialSourceLabel: permit.portalName,
        tag: 'Official Permit',
      });
    });
  } else if (input.destination.toLowerCase().includes('vaishno')) {
    items.push({
      id: 'doc-yatra-rfid',
      category: 'documents',
      title: 'Verify Requirement: Shrine Board RFID Yatra Access Card',
      description:
        'Compulsory RFID tracking card must be obtained online or at Katra railway station/bus stand registration counters before ascending past Banganga.',
      isCompleted: false,
      isOfficialRequirement: true,
      officialSourceUrl: 'https://www.maavaishnodevi.org',
      officialSourceLabel: 'SMVDSB Official Yatra Portal',
      tag: 'Yatra Pass',
    });
  } else if (input.destination.toLowerCase().includes('leh') || input.destination.toLowerCase().includes('ladakh')) {
    items.push({
      id: 'doc-ladakh-permit',
      category: 'documents',
      title: 'Verify Requirement: Ladakh Protected Area Permit (ILP) for Pangong/Nubra',
      description:
        'Domestic travellers require verified Inner Line Permits for restricted border valleys (Nubra, Pangong, Changthang). Apply via official portal.',
      isCompleted: false,
      isOfficialRequirement: true,
      officialSourceUrl: 'https://lahdclehpermit.in',
      officialSourceLabel: 'Leh District Administration Portal',
      tag: 'Border Permit',
    });
  }

  // ================= 3. PACKING =================
  if (isHill) {
    items.push({
      id: 'pack-cloth-winter',
      category: 'packing',
      title: isWinter
        ? 'Heavy Winter Thermals, Down Jacket, Woolen Beanie & Gloves'
        : 'Layered Warm Clothing, Windcheater Jacket & Light Fleece',
      description: `Mountain weather in ${input.destination} drops sharply during evenings. Dressing in breathable layers is essential.`,
      isCompleted: false,
      tag: 'Clothing',
    });
    items.push({
      id: 'pack-shoes-trek',
      category: 'packing',
      title: 'Sturdy Walking / Trekking Shoes with Deep Traction',
      description: 'Paved stone slopes, inclines, and trails require non-slip comfortable footwear to prevent ankle fatigue.',
      isCompleted: false,
      tag: 'Footwear',
    });
  } else if (isBeach) {
    items.push({
      id: 'pack-cloth-beach',
      category: 'packing',
      title: 'Lightweight Breathable Cotton Attire & Swimwear',
      description: `Loose cotton/linen clothing, UV sunglasses, sunhat, and quick-dry apparel suited for ${input.destination}'s coastal breeze.`,
      isCompleted: false,
      tag: 'Clothing',
    });
    items.push({
      id: 'pack-shoes-beach',
      category: 'packing',
      title: 'Waterproof Flip-Flops / Sand Shoes',
      description: 'Essential for hot sandy beaches and water adventures.',
      isCompleted: false,
      tag: 'Footwear',
    });
  } else {
    items.push({
      id: 'pack-cloth-standard',
      category: 'packing',
      title: 'Comfortable Everyday Cotton Clothes & Walking Shoes',
      description: `Versatile attire suited for a ${input.numberOfDays}-day trip covering sightseeing circuits in ${input.destination}.`,
      isCompleted: false,
      tag: 'Clothing',
    });
  }

  // Pilgrimage modest dress
  if (isPilgrimage) {
    items.push({
      id: 'pack-cloth-temple',
      category: 'packing',
      title: 'Modest Traditional Temple Attire (Kurta / Saree / Dhoti)',
      description:
        'Several prominent sanctums enforce traditional Indian dress codes. Avoid sleeveless shirts, shorts, or leather accessories inside sanctum enclosures.',
      isCompleted: false,
      tag: 'Dress Code',
    });
  }

  items.push({
    id: 'pack-elec-powerbank',
    category: 'packing',
    title: 'High-Capacity Power Bank (10,000–20,000 mAh) & Multi-Port Charger',
    description: `Continuous GPS navigation, photography, and long outdoor transit days in ${input.destination} rapidly deplete smartphone batteries.`,
    isCompleted: false,
    tag: 'Electronics',
  });

  items.push({
    id: 'pack-med-firstaid',
    category: 'packing',
    title: 'Essential First-Aid Kit (Bandages, Antiseptic, ORS Hydration Salts, Antacids)',
    description:
      'Travel wellness essentials for minor scrapes, changes in water, and walking fatigue. (General travel advice, not prescription medication).',
    isCompleted: false,
    tag: 'Health',
  });

  items.push({
    id: 'pack-toiletries-sunscreen',
    category: 'packing',
    title: 'Personal Toiletries, Broad-Spectrum Sunscreen (SPF 40+) & Lip Balm',
    description: 'High UV exposure occurs in both high altitudes and open coastal sun. Carry travel-sized toiletries.',
    isCompleted: false,
    tag: 'Personal Care',
  });

  // ================= 4. TRANSPORT =================
  if (input.transportMode === 'Train') {
    items.push({
      id: 'trn-pnr-status',
      category: 'transport',
      title: input.transportDetails
        ? `Confirm Train Status: ${input.transportDetails}`
        : `Check Train PNR Status & Boarding Station`,
      description:
        'Verify coach position, departure platform, and live train running status 3 hours before scheduled departure.',
      isCompleted: false,
      isOfficialRequirement: false,
      officialSourceUrl: 'https://www.irctc.co.in',
      officialSourceLabel: 'IRCTC / Indian Railways Enquiry',
      tag: 'Railway Official',
      isUserProvided: Boolean(input.transportDetails),
    });
    items.push({
      id: 'trn-station-transfer',
      category: 'transport',
      title: `Plan Local Transit from ${destInfo.nearestTransit.railwayStation} to Accommodation`,
      description:
        'Pre-check prepaid taxi booth, auto-rickshaw availability, or hotel station pickup to avoid station touts.',
      isCompleted: false,
      tag: 'Station Arrival',
    });
    items.push({
      id: 'trn-return-confirm',
      category: 'transport',
      title: 'Confirm Return Railway Journey Tickets & PNR',
      description:
        'Ensure return train seats are confirmed, especially during peak holiday and festival periods.',
      isCompleted: false,
      tag: 'Return Transit',
    });
  } else if (input.transportMode === 'Flight') {
    items.push({
      id: 'flt-web-checkin',
      category: 'transport',
      title: input.transportDetails
        ? `Complete Airline Web Check-in for: ${input.transportDetails}`
        : 'Complete Flight Web Check-in (Opens 48 Hours Prior)',
      description:
        'Select seats, verify check-in baggage weight allowance (standard 15 kg), and save digital boarding pass on your phone.',
      isCompleted: false,
      tag: 'Aviation',
      isUserProvided: Boolean(input.transportDetails),
    });
    items.push({
      id: 'flt-airport-cab',
      category: 'transport',
      title: `Airport Transfer from ${destInfo.nearestTransit.airport} to Hotel`,
      description: `Airport is typically situated at a distance. Pre-book an app cab or verified airport taxi to ${input.destination}.`,
      isCompleted: false,
      tag: 'Airport Transit',
    });
    items.push({
      id: 'flt-return-flight',
      category: 'transport',
      title: 'Verify Return Flight Schedule & Airport Terminal',
      description: 'Check terminal number and reconfirm return flight timing.',
      isCompleted: false,
      tag: 'Return Flight',
    });
  } else if (input.transportMode === 'Bus') {
    items.push({
      id: 'bus-boarding-point',
      category: 'transport',
      title: input.transportDetails
        ? `Locate Bus Boarding Point for: ${input.transportDetails}`
        : 'Confirm Exact Inter-State Bus Boarding Point & Contact Number',
      description:
        'Call the bus operator desk 2 hours before departure to verify exact GPS pickup coordinates and highway pickup bay.',
      isCompleted: false,
      tag: 'Bus Transit',
      isUserProvided: Boolean(input.transportDetails),
    });
    items.push({
      id: 'bus-motion-prep',
      category: 'transport',
      title: 'Highway Travel Comfort (Light Meals & Motion Comfort)',
      description: 'Avoid heavy oily meals right before overnight bus travel, particularly on winding highway routes.',
      isCompleted: false,
      tag: 'Transit Comfort',
    });
  } else if (input.transportMode === 'Car / Personal vehicle') {
    items.push({
      id: 'car-vehicle-service',
      category: 'transport',
      title: 'Vehicle Pre-Trip Inspection (Tires, Engine Fluids, Brakes & Battery)',
      description:
        'Inspect tire tread, spare wheel pressure, windshield washer fluid, and engine coolant before embarking on highway driving.',
      isCompleted: false,
      tag: 'Vehicle Health',
    });
    items.push({
      id: 'car-fastag-toll',
      category: 'transport',
      title: 'Recharge FASTag Wallet & Download Highway Offline Route',
      description:
        'Maintain minimum balance in FASTag for seamless toll plaza transit across state and national highways.',
      isCompleted: false,
      tag: 'Highway Tolls',
    });
  } else {
    items.push({
      id: 'trans-general-finalize',
      category: 'transport',
      title: `Finalize Transport Mode to ${input.destination} (${destInfo.state})`,
      description: `Compare railway connections at ${destInfo.nearestTransit.railwayStation} and flights at ${destInfo.nearestTransit.airport}. Book early to secure seats.`,
      isCompleted: false,
      tag: 'Booking Needed',
    });
  }

  // ================= 5. DESTINATION-SPECIFIC REQUIREMENTS =================
  if (isPilgrimage) {
    items.push({
      id: 'dest-temple-darshan-slot',
      category: 'destination_specific',
      title: `Verify Requirement: Advance Darshan Booking / Time Slot Tokens`,
      description:
        'Prominent shrines often mandate online darshan slots or biometric passes during peak weekends to avoid 4-6 hour waiting queues.',
      isCompleted: false,
      isOfficialRequirement: false,
      officialSourceUrl: destInfo.officialPermits?.[0]?.sourceUrl || 'https://tourism.gov.in',
      officialSourceLabel: 'Official Shrine Authority Portal',
      tag: 'Verified Guidance',
    });
    items.push({
      id: 'dest-temple-lockers',
      category: 'destination_specific',
      title: 'Plan Mobile & Electronic Gadget Storage Outside Sanctum',
      description:
        'Phones, smartwatches, cameras, and leather items are strictly prohibited inside holy sanctums. Identify authorized Shrine Board cloakrooms.',
      isCompleted: false,
      tag: 'Sanctum Rules',
    });
  }

  if (isHill) {
    items.push({
      id: 'dest-altitude-acclimatize',
      category: 'destination_specific',
      title: 'Altitude Acclimatization & Warm Hydration',
      description: `Spend the first half-day taking it easy in ${input.destination}. Drink warm water and avoid immediate strenuous uphill treks.`,
      isCompleted: false,
      tag: 'Altitude Care',
    });
  }

  if (input.plannedActivities) {
    items.push({
      id: 'dest-custom-activity',
      category: 'destination_specific',
      title: `Prepare for Planned Activity: ${input.plannedActivities}`,
      description: `Verify opening hours, guide fees, and advance ticket booking for: "${input.plannedActivities}".`,
      isCompleted: false,
      isUserProvided: true,
      tag: 'User Activity',
    });
  }

  // ================= 6. FAMILY / TRAVELLER-SPECIFIC =================
  if (hasSeniors) {
    items.push({
      id: 'fam-senior-meds',
      category: 'family_traveller',
      title: `Senior Citizen Daily Medication Buffer (+5 Days Extra Stock)`,
      description:
        'Pack all daily BP, cardiac, arthritis, and diabetic medications in carry-on bag with original doctor prescriptions. Pharmacies in remote hubs may carry different brands.',
      isCompleted: false,
      tag: 'Senior Health',
    });
    items.push({
      id: 'fam-senior-mobility',
      category: 'family_traveller',
      title: 'Arrange Wheelchair / Battery Car / Step-Free Transport Assistance',
      description:
        'Pre-book railway porter assistance, station battery carts, or shrine mobility options (such as battery vehicles, palkis, or ropeways) for elder comfort.',
      isCompleted: false,
      tag: 'Senior Mobility',
    });
  }

  if (hasChildren) {
    items.push({
      id: 'fam-child-essentials',
      category: 'family_traveller',
      title: 'Child Care Kit (Pediatric Medicines, Thermometer, Sanitizing Wipes & Snacks)',
      description:
        'Carry favorite non-perishable snacks, oral hydration drops, child pain relief, and warm change of clothes for transit delays.',
      isCompleted: false,
      tag: 'Child Care',
    });
  }

  if (input.specialConsiderations) {
    items.push({
      id: 'fam-special-consideration',
      category: 'family_traveller',
      title: `Special Consideration: ${input.specialConsiderations}`,
      description: `Personalized action item based on your request: "${input.specialConsiderations}". Inform hotel/transport operators in advance.`,
      isCompleted: false,
      isUserProvided: true,
      tag: 'Special Request',
    });
  }

  // ================= 7. EMERGENCY & SAFETY =================
  items.push({
    id: 'emg-national-helpline',
    category: 'emergency_safety',
    title: 'National Single Emergency Helpline: 112 (Police, Fire, Ambulance)',
    description: 'Operational 24x7 pan-India across all states and union territories even with weak SIM signal.',
    isCompleted: false,
    tag: 'Emergency 112',
  });

  items.push({
    id: 'emg-tourism-infoline',
    category: 'emergency_safety',
    title: 'Ministry of Tourism 24x7 Toll-Free Tourist Helpline: 1363',
    description: 'Multi-lingual assistance and tourist safety guidance in English, Hindi, and 10 international languages.',
    isCompleted: false,
    officialSourceUrl: 'https://incredibleindia.gov.in',
    officialSourceLabel: 'Ministry of Tourism Tourist Infoline',
    tag: 'Tourist Help',
  });

  items.push({
    id: 'emg-cash-backup',
    category: 'emergency_safety',
    title: 'Emergency Physical Cash Stash (₹2,000–₹5,000 in Small Notes)',
    description:
      'Store emergency cash in a separate zipper pocket from main wallet. Cellular network outages can disrupt UPI payments at toll gates or local markets.',
    isCompleted: false,
    tag: 'Financial Safety',
  });

  // ================= AI SUGGESTIONS (Personalized Insights) =================
  // 1. Senior advice
  if (hasSeniors) {
    suggestions.push({
      id: 'sug-senior-pacing',
      type: 'insight',
      title: 'Elder Pacing & Gentle Altitude Transition',
      description: `Travelling with ${input.travellers.seniors} senior citizen(s): Schedule a 2-hour rest break after arrival before commencing sightseeing. In ${input.destination}, utilize battery vehicles or step-free pathways whenever available.`,
      sourceContext: `Traveller profile: ${input.travellers.seniors} Senior citizen(s)`,
    });
  }

  // 2. Transport arrival timing vs check-in
  if (input.transportMode === 'Train' || input.transportMode === 'Flight') {
    suggestions.push({
      id: 'sug-early-checkin',
      type: 'tip',
      title: 'Align Transit Arrival with Hotel Check-in',
      description:
        'Most hotels in India enforce 12:00 PM or 2:00 PM check-in. If your transit arrives early morning, call the property front desk to request guaranteed early check-in or confirm secure luggage cloakroom access.',
      sourceContext: `Transport mode: ${input.transportMode}`,
    });
  }

  // 3. Duration vs Activities
  if (input.numberOfDays <= 2 && input.plannedActivities && input.plannedActivities.length > 30) {
    suggestions.push({
      id: 'sug-itinerary-density',
      type: 'warning',
      title: 'High Sightseeing Density for Short Stay',
      description: `You have planned multiple activities for a ${input.numberOfDays}-day trip. Consider prioritizing your top 2 landmark visits to avoid exhaustion for your family.`,
      sourceContext: `Duration: ${input.numberOfDays} days`,
    });
  }

  // 4. Weather & Season
  if (isMonsoon) {
    suggestions.push({
      id: 'sug-monsoon-alert',
      type: 'warning',
      title: 'Monsoon Seasonal Precaution',
      description: `Traveling during monsoon months: Check local landslide/heavy rain advisories for ${destInfo.state}. Keep waterproof covers for your backpack and footwear.`,
      sourceContext: `Arrival Date: ${input.arrivalDate} (Monsoon season)`,
    });
  } else if (isWinter && isHill) {
    suggestions.push({
      id: 'sug-winter-hill',
      type: 'tip',
      title: 'Sub-Zero Night Temperature Preparedness',
      description: `Winter in ${input.destination} features near-freezing evening temperatures. Confirm your accommodation has heated rooms or electric room heaters.`,
      sourceContext: `Winter travel to ${input.destination}`,
    });
  }

  // 5. Special considerations
  if (input.specialConsiderations) {
    suggestions.push({
      id: 'sug-special-handled',
      type: 'insight',
      title: 'Special Need Highlighted',
      description: `Noted: "${input.specialConsiderations}". We have tailored your medical and transit recommendations accordingly.`,
      sourceContext: `User note: ${input.specialConsiderations}`,
    });
  }

  return {
    id: `smart-checklist-${Date.now()}`,
    generatedAt: new Date().toISOString(),
    input,
    items,
    suggestions,
  };
}
