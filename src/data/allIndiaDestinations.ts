import { DestinationItem, EmergencyContact } from '../types';

export interface StateInfo {
  name: string;
  type: 'State' | 'Union Territory';
  destinations: string[]; // names of prominent destinations
}

export const ALL_INDIAN_STATES_AND_UTS: StateInfo[] = [
  // 28 States
  {
    name: 'Andhra Pradesh',
    type: 'State',
    destinations: ['Tirupati', 'Visakhapatnam', 'Araku Valley', 'Vijayawada'],
  },
  {
    name: 'Arunachal Pradesh',
    type: 'State',
    destinations: ['Tawang', 'Ziro Valley', 'Itanagar', 'Bomdila'],
  },
  {
    name: 'Assam',
    type: 'State',
    destinations: ['Guwahati', 'Kaziranga National Park', 'Majuli Island', 'Jorhat'],
  },
  {
    name: 'Bihar',
    type: 'State',
    destinations: ['Bodh Gaya', 'Nalanda & Rajgir', 'Patna'],
  },
  {
    name: 'Chhattisgarh',
    type: 'State',
    destinations: ['Jagdalpur (Bastar)', 'Raipur', 'Chitrakote Falls'],
  },
  {
    name: 'Goa',
    type: 'State',
    destinations: ['North Goa (Calangute/Anjuna)', 'South Goa (Palolem/Colva)', 'Panaji & Old Goa'],
  },
  {
    name: 'Gujarat',
    type: 'State',
    destinations: ['Ahmedabad', 'Somnath & Gir', 'Dwarka', 'Rann of Kutch', 'Statue of Unity (Kevadia)'],
  },
  {
    name: 'Haryana',
    type: 'State',
    destinations: ['Kurukshetra', 'Gurugram', 'Panchkula & Morni Hills'],
  },
  {
    name: 'Himachal Pradesh',
    type: 'State',
    destinations: ['Manali', 'Shimla', 'Dharamshala & McLeodGanj', 'Spiti Valley', 'Dalhousie & Khajjiar'],
  },
  {
    name: 'Jharkhand',
    type: 'State',
    destinations: ['Ranchi & Hundru Falls', 'Deoghar (Baba Baidyanath)', 'Jamshedpur', 'Netarhat'],
  },
  {
    name: 'Karnataka',
    type: 'State',
    destinations: ['Hampi', 'Coorg (Madikeri)', 'Mysuru (Mysore)', 'Gokarna', 'Bengaluru'],
  },
  {
    name: 'Kerala',
    type: 'State',
    destinations: ['Munnar', 'Alleppey (Alappuzha)', 'Kochi (Cochin)', 'Wayanad', 'Thekkady', 'Varkala Beach'],
  },
  {
    name: 'Madhya Pradesh',
    type: 'State',
    destinations: ['Ujjain (Mahakaleshwar)', 'Khajuraho', 'Bhopal & Sanchi', 'Gwalior', 'Kanha & Bandhavgarh'],
  },
  {
    name: 'Maharashtra',
    type: 'State',
    destinations: ['Mumbai', 'Mahabaleshwar & Panchgani', 'Shirdi', 'Pune', 'Lonavala & Khandala', 'Aurangabad (Ajanta & Ellora)'],
  },
  {
    name: 'Manipur',
    type: 'State',
    destinations: ['Imphal', 'Loktak Lake & Keibul Lamjao'],
  },
  {
    name: 'Meghalaya',
    type: 'State',
    destinations: ['Shillong', 'Cherrapunji (Sohra)', 'Dawki & Mawlynnong'],
  },
  {
    name: 'Mizoram',
    type: 'State',
    destinations: ['Aizawl', 'Champhai', 'Reiek'],
  },
  {
    name: 'Nagaland',
    type: 'State',
    destinations: ['Kohima & Kisama', 'Dzukou Valley', 'Dimapur'],
  },
  {
    name: 'Odisha',
    type: 'State',
    destinations: ['Puri', 'Konark', 'Bhubaneswar', 'Chilika Lake'],
  },
  {
    name: 'Punjab',
    type: 'State',
    destinations: ['Amritsar', 'Patiala', 'Anandpur Sahib'],
  },
  {
    name: 'Rajasthan',
    type: 'State',
    destinations: ['Jaipur', 'Udaipur', 'Jodhpur', 'Jaisalmer', 'Pushkar', 'Mount Abu'],
  },
  {
    name: 'Sikkim',
    type: 'State',
    destinations: ['Gangtok', 'Pelling & West Sikkim', 'Lachung & Yumthang Valley'],
  },
  {
    name: 'Tamil Nadu',
    type: 'State',
    destinations: ['Ooty (Udhagamandalam)', 'Madurai', 'Rameswaram', 'Kodaikanal', 'Kanyakumari', 'Chennai & Mahabalipuram'],
  },
  {
    name: 'Telangana',
    type: 'State',
    destinations: ['Hyderabad', 'Warangal (Ramappa)', 'Nagarjuna Sagar'],
  },
  {
    name: 'Tripura',
    type: 'State',
    destinations: ['Agartala', 'Unakoti Rock Carvings'],
  },
  {
    name: 'Uttar Pradesh',
    type: 'State',
    destinations: ['Varanasi', 'Ayodhya', 'Agra', 'Mathura & Vrindavan', 'Prayagraj', 'Lucknow'],
  },
  {
    name: 'Uttarakhand',
    type: 'State',
    destinations: ['Rishikesh & Haridwar', 'Nainital', 'Mussoorie', 'Kedarnath & Badrinath (Char Dham)', 'Jim Corbett National Park'],
  },
  {
    name: 'West Bengal',
    type: 'State',
    destinations: ['Kolkata', 'Darjeeling', 'Kalimpong', 'Sundarbans Tiger Reserve', 'Digha Beach'],
  },

  // 8 Union Territories
  {
    name: 'Andaman and Nicobar Islands',
    type: 'Union Territory',
    destinations: ['Port Blair', 'Havelock Island (Swaraj Dweep)', 'Neil Island (Shaheed Dweep)'],
  },
  {
    name: 'Chandigarh',
    type: 'Union Territory',
    destinations: ['Chandigarh City'],
  },
  {
    name: 'Dadra & Nagar Haveli and Daman & Diu',
    type: 'Union Territory',
    destinations: ['Diu Island', 'Daman'],
  },
  {
    name: 'Delhi',
    type: 'Union Territory',
    destinations: ['New Delhi & Central Monuments', 'Old Delhi Heritage Hub'],
  },
  {
    name: 'Jammu & Kashmir',
    type: 'Union Territory',
    destinations: ['Vaishno Devi (Katra)', 'Srinagar', 'Gulmarg', 'Pahalgam', 'Sonamarg', 'Jammu City'],
  },
  {
    name: 'Ladakh',
    type: 'Union Territory',
    destinations: ['Leh', 'Nubra Valley', 'Pangong Tso & Changthang'],
  },
  {
    name: 'Lakshadweep',
    type: 'Union Territory',
    destinations: ['Agatti Island', 'Kavaratti Island'],
  },
  {
    name: 'Puducherry',
    type: 'Union Territory',
    destinations: ['Puducherry (White Town & Promenade)', 'Auroville'],
  },
];

export const STANDARD_EMERGENCY_CONTACTS: EmergencyContact[] = [
  {
    title: 'National Emergency Helpline (Police / Fire / Ambulance)',
    number: '112',
    category: 'police',
    source: 'Ministry of Home Affairs, Govt. of India',
    notes: 'Toll-free emergency single number operational 24x7 pan-India.',
  },
  {
    title: 'Ministry of Tourism 24x7 Multi-lingual Tourist Infoline',
    number: '1363 / 1800-111-363',
    category: 'tourism',
    source: 'Incredible India / Ministry of Tourism',
    notes: 'Free guidance in 12 languages including English, Hindi, and regional languages.',
  },
  {
    title: 'National Medical Ambulance Service',
    number: '108',
    category: 'medical',
    source: 'National Health Mission',
    notes: 'Free emergency medical ambulance dispatch.',
  },
  {
    title: 'Disaster Management Helpline (NDRF)',
    number: '1078',
    category: 'disaster',
    source: 'National Disaster Management Authority (NDMA)',
    notes: 'Weather emergency, landslide, and flood distress line.',
  },
];
