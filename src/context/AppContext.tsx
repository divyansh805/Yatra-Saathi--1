import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Page,
  Language,
  User,
  ToastMessage,
  Accommodation,
  Restaurant,
  NearbyPlace,
  DestinationLandmark,
  TravellersCount,
} from '../types';

export interface MyJourneyState {
  savedHotel: Accommodation | null;
  savedRestaurants: Restaurant[];
  savedPlaces: NearbyPlace[];
  savedLandmarks: DestinationLandmark[];
}

export interface ActiveJourneySearch {
  state: string;
  destination: string;
  arrivalDate: string;
  travellers: TravellersCount;
  selectedLandmarkId?: string;
}

interface AppContextType {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  user: User | null;
  loginUser: (userData: User) => void;
  logoutUser: () => void;
  toast: ToastMessage | null;
  showToast: (text: string, type?: 'success' | 'info' | 'error') => void;
  t: (key: string) => string;

  // Active Journey Search across Dashboard & Checklist
  activeSearch: ActiveJourneySearch;
  setActiveSearch: React.Dispatch<React.SetStateAction<ActiveJourneySearch>>;

  // My Journey features
  myJourney: MyJourneyState;
  toggleSaveHotel: (hotel: Accommodation) => void;
  toggleSaveRestaurant: (restaurant: Restaurant) => void;
  toggleSavePlace: (place: NearbyPlace) => void;
  toggleSaveLandmark: (landmark: DestinationLandmark) => void;
  isHotelSaved: (hotelId: string) => boolean;
  isRestaurantSaved: (restId: string) => boolean;
  isPlaceSaved: (placeId: string) => boolean;
  isLandmarkSaved: (landmarkId: string) => boolean;
  clearMyJourney: () => void;

  // Checklist completion states
  completedChecklistIds: string[];
  toggleChecklistItem: (id: string) => void;
  resetChecklist: () => void;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    nav_home: 'Home',
    nav_smart_destination: 'Smart Destination',
    nav_hotels: 'Hotels',
    nav_ai_trip_planner: 'AI Trip Planner',
    nav_checklist: 'Checklist',
    nav_about: 'About Us',
    nav_contact: 'Contact Us',
    nav_login: 'Login',
    nav_plan_journey: 'Plan My Journey',
    nav_logout: 'Logout',
    nav_dashboard: 'Dashboard',

    hero_eyebrow: 'YOUR JOURNEY, SIMPLIFIED',
    hero_title: 'Welcome to Yatra Saathi',
    hero_subtitle:
      'Yatra Saathi brings the essential pieces of your journey together — from destination preparation and accommodation insights to important travel requirements and practical information — so you can travel with greater confidence.',
    hero_primary_cta: 'Plan My Journey →',
    hero_secondary_cta: 'Explore Yatra Saathi',

    tagline: 'Travel smarter. Prepare better. Journey with confidence.',
    footer_desc: 'Your companion for informed, prepared and confident travel.',
    back_to_home: 'Back to Home',
  },
  hi: {
    nav_home: 'होम',
    nav_smart_destination: 'स्मार्ट गंतव्य',
    nav_hotels: 'होटल',
    nav_ai_trip_planner: 'एआई यात्रा योजना',
    nav_checklist: 'चेकलिस्ट',
    nav_about: 'हमारे बारे में',
    nav_contact: 'संपर्क करें',
    nav_login: 'लॉग इन',
    nav_plan_journey: 'यात्रा योजना बनाएं',
    nav_logout: 'लॉग आउट',
    nav_dashboard: 'डैशबोर्ड',

    hero_eyebrow: 'आपकी यात्रा, सरल और सुगम',
    hero_title: 'यात्रा साथी में आपका स्वागत है',
    hero_subtitle:
      'यात्रा साथी आपकी यात्रा के सभी जरूरी पहलुओं को एक साथ लाता है — गंतव्य की तैयारी और ठहरने की सटीक जानकारी से लेकर जरूरी यात्रा नियम और उपयोगी परामर्श तक — ताकि आप पूरे आत्मविश्वास के साथ यात्रा कर सकें।',
    hero_primary_cta: 'यात्रा योजना बनाएं →',
    hero_secondary_cta: 'यात्रा साथी जानें',

    tagline: 'समझदारी से यात्रा करें। बेहतर तैयारी करें। आत्मविश्वास के साथ सफर करें।',
    footer_desc: 'सूचित, तैयार और निश्चिंत यात्रा के लिए आपका विश्वसनीय साथी।',
    back_to_home: 'होम पर वापस जाएं',
  },
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [language, setLanguage] = useState<Language>('en');

  // User state
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('yatrasaathi_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Active Journey Search state (shared between Dashboard & Checklist)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const [activeSearch, setActiveSearch] = useState<ActiveJourneySearch>(() => {
    try {
      const saved = localStorage.getItem('yatrasaathi_active_search');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.destination) return parsed;
      }
    } catch {
      // fallback
    }
    return {
      state: '',
      destination: '',
      arrivalDate: '',
      travellers: { adults: 1, children: 0, seniors: 0, total: 1 },
      selectedLandmarkId: '',
    };
  });

  // Save active search to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('yatrasaathi_active_search', JSON.stringify(activeSearch));
    } catch {
      // ignore
    }
  }, [activeSearch]);

  // My Journey Saved Items
  const [myJourney, setMyJourney] = useState<MyJourneyState>(() => {
    try {
      const saved = localStorage.getItem('yatrasaathi_my_journey');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return {
      savedHotel: null,
      savedRestaurants: [],
      savedPlaces: [],
      savedLandmarks: [],
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem('yatrasaathi_my_journey', JSON.stringify(myJourney));
    } catch {
      // ignore
    }
  }, [myJourney]);

  // Checklist completed IDs
  const [completedChecklistIds, setCompletedChecklistIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('yatrasaathi_checklist_progress');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return ['doc-gov-id', 'doc-booking-confirm', 'pack-docs-wallet'];
  });

  useEffect(() => {
    try {
      localStorage.setItem('yatrasaathi_checklist_progress', JSON.stringify(completedChecklistIds));
    } catch {
      // ignore
    }
  }, [completedChecklistIds]);

  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Math.random().toString();
    setToast({ id, text, type });
    setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, 4000);
  };

  const loginUser = (userData: User) => {
    setUser(userData);
    try {
      localStorage.setItem('yatrasaathi_user', JSON.stringify(userData));
    } catch {
      // ignore
    }
  };

  const logoutUser = () => {
    setUser(null);
    try {
      localStorage.removeItem('yatrasaathi_user');
    } catch {
      // ignore
    }
    setCurrentPage('home');
    showToast('Logged out successfully', 'info');
  };

  // My Journey Helpers
  const toggleSaveHotel = (hotel: Accommodation) => {
    setMyJourney((prev) => {
      const isAlready = prev.savedHotel?.id === hotel.id;
      if (isAlready) {
        showToast(`Removed "${hotel.name}" from My Journey.`, 'info');
        return { ...prev, savedHotel: null };
      } else {
        showToast(`Saved "${hotel.name}" as your Journey Stay!`, 'success');
        return { ...prev, savedHotel: hotel };
      }
    });
  };

  const toggleSaveRestaurant = (restaurant: Restaurant) => {
    setMyJourney((prev) => {
      const exists = prev.savedRestaurants.some((r) => r.id === restaurant.id);
      if (exists) {
        showToast(`Removed "${restaurant.name}" from saved dining.`, 'info');
        return {
          ...prev,
          savedRestaurants: prev.savedRestaurants.filter((r) => r.id !== restaurant.id),
        };
      } else {
        showToast(`Saved "${restaurant.name}" to My Journey!`, 'success');
        return {
          ...prev,
          savedRestaurants: [...prev.savedRestaurants, restaurant],
        };
      }
    });
  };

  const toggleSavePlace = (place: NearbyPlace) => {
    setMyJourney((prev) => {
      const exists = prev.savedPlaces.some((p) => p.id === place.id);
      if (exists) {
        showToast(`Removed "${place.name}" from saved places.`, 'info');
        return {
          ...prev,
          savedPlaces: prev.savedPlaces.filter((p) => p.id !== place.id),
        };
      } else {
        showToast(`Saved "${place.name}" to My Journey!`, 'success');
        return {
          ...prev,
          savedPlaces: [...prev.savedPlaces, place],
        };
      }
    });
  };

  const toggleSaveLandmark = (landmark: DestinationLandmark) => {
    setMyJourney((prev) => {
      const exists = prev.savedLandmarks.some((l) => l.id === landmark.id);
      if (exists) {
        showToast(`Removed "${landmark.name}" from saved landmarks.`, 'info');
        return {
          ...prev,
          savedLandmarks: prev.savedLandmarks.filter((l) => l.id !== landmark.id),
        };
      } else {
        showToast(`Saved landmark "${landmark.name}" to My Journey!`, 'success');
        return {
          ...prev,
          savedLandmarks: [...prev.savedLandmarks, landmark],
        };
      }
    });
  };

  const isHotelSaved = (hotelId: string) => myJourney.savedHotel?.id === hotelId;
  const isRestaurantSaved = (restId: string) => myJourney.savedRestaurants.some((r) => r.id === restId);
  const isPlaceSaved = (placeId: string) => myJourney.savedPlaces.some((p) => p.id === placeId);
  const isLandmarkSaved = (landmarkId: string) => myJourney.savedLandmarks.some((l) => l.id === landmarkId);

  const clearMyJourney = () => {
    setMyJourney({
      savedHotel: null,
      savedRestaurants: [],
      savedPlaces: [],
      savedLandmarks: [],
    });
    showToast('Cleared My Journey saved items.', 'info');
  };

  // Checklist Helpers
  const toggleChecklistItem = (id: string) => {
    setCompletedChecklistIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const resetChecklist = () => {
    setCompletedChecklistIds([]);
    showToast('Checklist progress reset.', 'info');
  };

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const t = (key: string): string => {
    return translations[language]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <AppContext.Provider
      value={{
        currentPage,
        setCurrentPage,
        language,
        setLanguage,
        user,
        loginUser,
        logoutUser,
        toast,
        showToast,
        t,
        activeSearch,
        setActiveSearch,
        myJourney,
        toggleSaveHotel,
        toggleSaveRestaurant,
        toggleSavePlace,
        toggleSaveLandmark,
        isHotelSaved,
        isRestaurantSaved,
        isPlaceSaved,
        isLandmarkSaved,
        clearMyJourney,
        completedChecklistIds,
        toggleChecklistItem,
        resetChecklist,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
