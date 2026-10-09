import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  ALL_INDIAN_STATES_AND_UTS,
  getDestinationData,
} from '../data/destinationsData';
import {
  SmartChecklistInput,
  SmartChecklistItem,
  SmartChecklistData,
  SmartChecklistCategory,
  AISuggestion,
  TransportMode,
  TripType,
} from '../types';
import { generateSmartChecklist } from '../services/aiChecklistService';
import { getTimeBasedGreeting } from '../utils/greeting';
import {
  CheckSquare,
  Sparkles,
  Calendar,
  Users,
  MapPin,
  ExternalLink,
  ShieldCheck,
  Phone,
  RotateCcw,
  Check,
  ChevronDown,
  Clock,
  Luggage,
  FileText,
  Compass,
  ArrowRight,
  ArrowLeft,
  Trash2,
  Edit2,
  Plus,
  Train,
  Plane,
  Bus,
  Car,
  HelpCircle,
  Lightbulb,
  AlertTriangle,
  Info,
  CheckCircle2,
  X,
  Printer,
  Copy,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const CATEGORY_META: Record<
  SmartChecklistCategory,
  { label: string; icon: React.FC<{ className?: string }>; color: string; bgColor: string }
> = {
  transport: {
    label: 'Transport',
    icon: Train,
    color: 'text-indigo-700',
    bgColor: 'bg-indigo-50 border-indigo-200',
  },
  before_you_leave: {
    label: 'Before You Leave',
    icon: Clock,
    color: 'text-amber-700',
    bgColor: 'bg-amber-50 border-amber-200',
  },
  documents: {
    label: 'Documents & IDs',
    icon: FileText,
    color: 'text-blue-700',
    bgColor: 'bg-blue-50 border-blue-200',
  },
  packing: {
    label: 'Packing',
    icon: Luggage,
    color: 'text-teal-700',
    bgColor: 'bg-teal-50 border-teal-200',
  },
  destination_specific: {
    label: 'Destination-Specific Requirements',
    icon: Compass,
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50 border-emerald-200',
  },
  family_traveller: {
    label: 'Family & Traveller Preparation',
    icon: Users,
    color: 'text-purple-700',
    bgColor: 'bg-purple-50 border-purple-200',
  },
  emergency_safety: {
    label: 'Emergency & Safety',
    icon: ShieldCheck,
    color: 'text-rose-700',
    bgColor: 'bg-rose-50 border-rose-200',
  },
};

const initialEmptyForm: SmartChecklistInput = {
  state: '',
  destination: '',
  arrivalDate: '',
  numberOfDays: 0,
  travellers: {
    total: 0,
    adults: 0,
    children: 0,
    seniors: 0,
  },
  transportMode: '',
  transportDetails: '',
  ticketStatus: '',
  tripType: '',
  plannedActivities: '',
  specialConsiderations: '',
};

export const ChecklistPage: React.FC = () => {
  const { showToast, setCurrentPage, user } = useApp();

  // 1. FORM STATE - STRICTLY STARTS EMPTY
  const [formData, setFormData] = useState<SmartChecklistInput>(initialEmptyForm);

  // 2. CHECKLIST DATA - STRICTLY NULL BY DEFAULT (NO PRELOADED FAKE AYODHYA TRIP)
  const [checklistData, setChecklistData] = useState<SmartChecklistData | null>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditingTrip, setIsEditingTrip] = useState(false);
  // Steps: 1: Destination, 2: Dates, 3: Travellers, 4: Transport, 5: Trip Type & Plans, 6: Review
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Edit/Add Custom Item Modal State
  const [editingItem, setEditingItem] = useState<SmartChecklistItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newItemCategory, setNewItemCategory] = useState<SmartChecklistCategory>('packing');
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemDesc, setNewItemDesc] = useState('');

  // Destination options for currently selected state
  const stateDestinations = useMemo(() => {
    if (!formData.state) return [];
    const s = ALL_INDIAN_STATES_AND_UTS.find((item) => item.name === formData.state);
    return s ? s.destinations : [];
  }, [formData.state]);

  // Handle State selection (resets destination so user actively picks)
  const handleStateChange = (newState: string) => {
    setFormData((prev) => ({
      ...prev,
      state: newState,
      destination: '', // Initially empty
    }));
  };

  // Stepper for travellers
  const updateTravellerCount = (key: 'adults' | 'children' | 'seniors', delta: number) => {
    setFormData((prev) => {
      const current = prev.travellers[key];
      const next = Math.max(0, current + delta);
      const updatedTravellers = {
        ...prev.travellers,
        [key]: next,
      };
      updatedTravellers.total =
        updatedTravellers.adults + updatedTravellers.children + updatedTravellers.seniors;
      return {
        ...prev,
        travellers: updatedTravellers,
      };
    });
  };

  // Generate Smart Checklist with AI
  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!formData.state.trim()) {
      showToast('Please select a State or Union Territory.', 'error');
      setCurrentStep(1);
      return;
    }
    if (!formData.destination.trim()) {
      showToast('Please select or specify a destination.', 'error');
      setCurrentStep(1);
      return;
    }
    if (!formData.arrivalDate) {
      showToast('Please select your arrival date.', 'error');
      setCurrentStep(2);
      return;
    }
    if (formData.numberOfDays <= 0) {
      showToast('Trip duration must be at least 1 day.', 'error');
      setCurrentStep(2);
      return;
    }
    if (formData.travellers.total <= 0) {
      showToast('Please select at least 1 traveller.', 'error');
      setCurrentStep(3);
      return;
    }
    if (!formData.transportMode) {
      showToast('Please select your transport mode.', 'error');
      setCurrentStep(4);
      return;
    }
    if (!formData.tripType) {
      showToast('Please select your trip type.', 'error');
      setCurrentStep(5);
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateSmartChecklist(formData);
      setChecklistData(result);
      setIsEditingTrip(false);
      showToast(`Smart AI Checklist generated for ${formData.destination}!`, 'success');
    } catch {
      showToast('Failed to generate checklist. Please try again.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  // Toggle item complete status
  const handleToggleItem = (itemId: string) => {
    if (!checklistData) return;
    setChecklistData((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        items: prev.items.map((item) =>
          item.id === itemId ? { ...item, isCompleted: !item.isCompleted } : item
        ),
      };
    });
  };

  // Delete item
  const handleDeleteItem = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!checklistData) return;
    setChecklistData((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        items: prev.items.filter((item) => item.id !== itemId),
      };
    });
    showToast('Item removed from checklist.', 'info');
  };

  // Edit item submit
  const handleSaveEditedItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !checklistData) return;

    setChecklistData((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        items: prev.items.map((item) => (item.id === editingItem.id ? editingItem : item)),
      };
    });
    setEditingItem(null);
    showToast('Checklist item updated.', 'success');
  };

  // Add custom item submit
  const handleAddCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemTitle.trim() || !checklistData) return;

    const newItem: SmartChecklistItem = {
      id: `custom-${Date.now()}`,
      category: newItemCategory,
      title: newItemTitle.trim(),
      description: newItemDesc.trim() || 'Custom item added by traveller.',
      isCompleted: false,
      isCustom: true,
      tag: 'My Custom Item',
      isUserProvided: true,
    };

    setChecklistData((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        items: [newItem, ...prev.items],
      };
    });

    setNewItemTitle('');
    setNewItemDesc('');
    setIsAddModalOpen(false);
    showToast('New item added to checklist!', 'success');
  };

  // Reset checklist progress
  const handleResetChecklist = () => {
    if (!checklistData) return;
    setChecklistData((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        items: prev.items.map((i) => ({ ...i, isCompleted: false })),
      };
    });
    showToast('Checklist marked items reset.', 'info');
  };

  // Mark all completed
  const handleMarkAllComplete = () => {
    if (!checklistData) return;
    setChecklistData((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        items: prev.items.map((i) => ({ ...i, isCompleted: true })),
      };
    });
    showToast('All items marked complete!', 'success');
  };

  // Calculate Readiness score & Category progress
  const { totalItems, completedItems, readinessScore, categoryBreakdown } = useMemo(() => {
    if (!checklistData || checklistData.items.length === 0) {
      return {
        totalItems: 0,
        completedItems: 0,
        readinessScore: 0,
        categoryBreakdown: [],
      };
    }

    const total = checklistData.items.length;
    const completed = checklistData.items.filter((i) => i.isCompleted).length;
    const score = Math.round((completed / total) * 100);

    const categories: SmartChecklistCategory[] = [
      'transport',
      'before_you_leave',
      'documents',
      'packing',
      'destination_specific',
      'family_traveller',
      'emergency_safety',
    ];

    const breakdown = categories.map((cat) => {
      const inCat = checklistData.items.filter((i) => i.category === cat);
      const done = inCat.filter((i) => i.isCompleted).length;
      const pct = inCat.length > 0 ? Math.round((done / inCat.length) * 100) : 100;
      return {
        category: cat,
        label: CATEGORY_META[cat].label,
        total: inCat.length,
        completed: done,
        percentage: pct,
        isAllDone: done === inCat.length && inCat.length > 0,
      };
    });

    return {
      totalItems: total,
      completedItems: completed,
      readinessScore: score,
      categoryBreakdown: breakdown,
    };
  }, [checklistData]);

  // Copy full checklist to clipboard
  const handleCopyChecklist = () => {
    if (!checklistData) return;
    let text = `YATRA SAATHI - SMART TRAVEL CHECKLIST\n`;
    text += `Traveller: ${user?.name || 'Verified Traveller'}\n`;
    text += `Destination: ${checklistData.input.destination}, ${checklistData.input.state}\n`;
    text += `Arrival Date: ${checklistData.input.arrivalDate} (${checklistData.input.numberOfDays} Days)\n`;
    text += `Travellers: ${checklistData.input.travellers.total} (${checklistData.input.travellers.adults} Adults, ${checklistData.input.travellers.children} Children, ${checklistData.input.travellers.seniors} Seniors)\n`;
    text += `Transport: ${checklistData.input.transportMode} ${checklistData.input.transportDetails ? `(${checklistData.input.transportDetails})` : ''} ${checklistData.input.ticketStatus ? `[Status: ${checklistData.input.ticketStatus}]` : ''}\n`;
    text += `Readiness: ${readinessScore}% (${completedItems}/${totalItems} completed)\n\n`;

    const categories: SmartChecklistCategory[] = [
      'transport',
      'before_you_leave',
      'documents',
      'packing',
      'destination_specific',
      'family_traveller',
      'emergency_safety',
    ];

    categories.forEach((cat) => {
      const itemsInCat = checklistData.items.filter((i) => i.category === cat);
      if (itemsInCat.length > 0) {
        text += `== ${CATEGORY_META[cat].label.toUpperCase()} ==\n`;
        itemsInCat.forEach((i) => {
          text += `[${i.isCompleted ? 'X' : ' '}] ${i.title}\n    ${i.description}\n`;
          if (i.isOfficialRequirement && i.officialSourceLabel) {
            text += `    * Verified Source: ${i.officialSourceLabel}\n`;
          }
        });
        text += `\n`;
      }
    });

    navigator.clipboard.writeText(text);
    showToast('Checklist copied to clipboard!', 'success');
  };

  const handlePrint = () => {
    window.print();
  };

  const greetingObj = getTimeBasedGreeting(user?.name);

  return (
    <div className="pt-28 pb-24 bg-[#FAF9F6] min-h-screen text-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* ================= TOP HEADER WITH "← BACK TO HOME" ================= */}
        <div className="flex items-center justify-between gap-4 border-b border-slate-200/90 pb-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold uppercase tracking-wider mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>Smart AI Travel Preparation</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {user ? `${greetingObj.greeting}, ${greetingObj.firstName}! 👋` : 'Your Travel Checklist'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              Prepare before you leave. Travel with confidence.
            </p>
          </div>

          <button
            onClick={() => setCurrentPage('dashboard')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:text-teal-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer shrink-0"
            title="Return to User Dashboard Home"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600" />
            <span>Back to Home</span>
          </button>
        </div>

        {/* ================= 1. EMPTY STATE / TRIP INPUT WIZARD ================= */}
        {(!checklistData || isEditingTrip) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-md space-y-6"
          >
            {/* Friendly Greeting as requested: "Tell us about your journey, and Yatra Saathi will prepare everything you need before you travel." */}
            <div className="p-4.5 rounded-2xl bg-teal-50/70 border border-teal-200/80 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-teal-950">
                  Tell us about your journey, and Yatra Saathi will prepare everything you need before you travel.
                </h3>
                <p className="text-xs text-teal-800 mt-0.5 leading-relaxed">
                  Enter your travel details step-by-step. Our AI travel assistant will generate your customized preparation, packing, verified transport checkpoints, and official destination rules.
                </p>
              </div>
            </div>

            {/* Clean Step-by-Step Wizard Form */}
            <div className="space-y-6">
              {/* Wizard Step Progress Tracker */}
              <div className="space-y-2.5 pb-2 border-b border-slate-100">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-teal-700 uppercase tracking-wider">
                    {currentStep <= 5 ? `Step ${currentStep} of 5` : 'Review Trip Details'}
                  </span>
                  <span className="font-semibold text-slate-500">
                    {currentStep === 1 && 'Where are you going?'}
                    {currentStep === 2 && 'When are you travelling?'}
                    {currentStep === 3 && 'Who is travelling with you?'}
                    {currentStep === 4 && 'How will you travel?'}
                    {currentStep === 5 && 'What type of trip are you planning?'}
                    {currentStep === 6 && 'Review Before Generation'}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${(Math.min(currentStep, 5) / 5) * 100}%` }}
                  />
                </div>

                {/* Step indicator tabs */}
                <div className="grid grid-cols-6 gap-1.5 pt-1">
                  {[
                    { num: 1, title: 'Destination' },
                    { num: 2, title: 'Dates' },
                    { num: 3, title: 'Travellers' },
                    { num: 4, title: 'Transport' },
                    { num: 5, title: 'Trip Type' },
                    { num: 6, title: 'Review' },
                  ].map((s) => {
                    const isDone = s.num < currentStep;
                    const isCurrent = s.num === currentStep;
                    return (
                      <button
                        key={s.num}
                        type="button"
                        onClick={() => {
                          if (s.num <= currentStep) {
                            setCurrentStep(s.num);
                          }
                        }}
                        className={`py-1 px-1 rounded-lg text-center text-[11px] font-semibold transition-all truncate ${
                          isCurrent
                            ? 'bg-teal-600 text-white font-bold shadow-xs'
                            : isDone
                            ? 'bg-teal-50 text-teal-800 hover:bg-teal-100 cursor-pointer'
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        {isDone ? '✓ ' : ''}{s.title}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ================= STEP 1 — DESTINATION ================= */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                      Where are you going?
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                      Select your State or Union Territory first, then choose your destination.
                    </p>
                  </div>

                  <div className="space-y-5 max-w-2xl">
                    {/* State / Union Territory (Initially empty) */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        State / Union Territory *
                      </label>
                      <div className="relative">
                        <select
                          value={formData.state}
                          onChange={(e) => handleStateChange(e.target.value)}
                          className="w-full pl-4 pr-10 py-3.5 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-900 bg-slate-50/70 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer appearance-none shadow-2xs"
                        >
                          <option value="">Select State / Union Territory</option>
                          {ALL_INDIAN_STATES_AND_UTS.map((s) => (
                            <option key={s.name} value={s.name}>
                              {s.name} ({s.type === 'Union Territory' ? 'UT' : 'State'})
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    {/* Destination (Only appears/enables after State is chosen) */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Destination *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-teal-700">
                          <MapPin className="w-4 h-4" />
                        </div>
                        {formData.state ? (
                          <select
                            value={formData.destination}
                            onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                            className="w-full pl-10 pr-10 py-3.5 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-900 bg-slate-50/70 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer appearance-none shadow-2xs"
                          >
                            <option value="">Select Destination in {formData.state}</option>
                            {stateDestinations.map((dest) => (
                              <option key={dest} value={dest}>
                                {dest}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <div className="w-full pl-10 pr-4 py-3.5 rounded-2xl border border-slate-200 text-sm font-medium text-slate-400 bg-slate-100 cursor-not-allowed">
                            Select State / Union Territory first
                          </div>
                        )}
                        {formData.state && (
                          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        )}
                      </div>

                      {/* Prominent destination chips once state is selected */}
                      {formData.state && stateDestinations.length > 0 && (
                        <div className="mt-3">
                          <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                            Destinations in {formData.state}:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {stateDestinations.map((dest) => (
                              <button
                                key={dest}
                                type="button"
                                onClick={() => setFormData({ ...formData, destination: dest })}
                                className={`text-xs px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                                  formData.destination === dest
                                    ? 'bg-teal-600 text-white border-teal-600 font-bold shadow-xs'
                                    : 'bg-white text-slate-700 border-slate-200 hover:border-teal-400 hover:bg-teal-50/40'
                                }`}
                              >
                                {dest}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Step 1 Actions */}
                  <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                    {checklistData && isEditingTrip ? (
                      <button
                        type="button"
                        onClick={() => setIsEditingTrip(false)}
                        className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                      >
                        Cancel
                      </button>
                    ) : (
                      <div />
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        if (!formData.state.trim()) {
                          showToast('Please select a State or Union Territory.', 'error');
                          return;
                        }
                        if (!formData.destination.trim()) {
                          showToast('Please select a destination.', 'error');
                          return;
                        }
                        setCurrentStep(2);
                      }}
                      className="px-6 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 active:scale-98 transition-all flex items-center gap-2 cursor-pointer ml-auto"
                    >
                      <span>Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* ================= STEP 2 — DATES ================= */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                      When are you travelling?
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                      Specify your arrival date and expected duration of stay in {formData.destination}.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl">
                    {/* Arrival Date (Starts empty) */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Arrival Date *
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          value={formData.arrivalDate}
                          onChange={(e) => setFormData({ ...formData, arrivalDate: e.target.value })}
                          className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-900 bg-slate-50/70 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer shadow-2xs"
                        />
                      </div>
                    </div>

                    {/* Trip Duration (Starts empty / 0) */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Trip Duration *
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              numberOfDays: Math.max(0, prev.numberOfDays - 1),
                            }))
                          }
                          className="w-12 h-12 rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 text-xl font-bold hover:bg-slate-100 flex items-center justify-center cursor-pointer transition-colors shadow-2xs"
                        >
                          −
                        </button>
                        <div className="flex-1 py-3 text-center font-bold text-sm bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 shadow-2xs">
                          {formData.numberOfDays === 0
                            ? 'Select Days'
                            : `${formData.numberOfDays} ${formData.numberOfDays === 1 ? 'Day' : 'Days'}`}
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              numberOfDays: Math.min(30, prev.numberOfDays + 1),
                            }))
                          }
                          className="w-12 h-12 rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 text-xl font-bold hover:bg-slate-100 flex items-center justify-center cursor-pointer transition-colors shadow-2xs"
                        >
                          +
                        </button>
                      </div>

                      {/* Quick preset buttons */}
                      <div className="flex items-center gap-1.5 mt-2.5">
                        {[2, 3, 4, 7, 10].map((d) => (
                          <button
                            key={d}
                            type="button"
                            onClick={() => setFormData({ ...formData, numberOfDays: d })}
                            className={`text-xs px-2.5 py-1 rounded-lg border cursor-pointer transition-colors ${
                              formData.numberOfDays === d
                                ? 'bg-teal-600 text-white border-teal-600 font-bold'
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            {d} {d === 1 ? 'day' : 'days'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Step 2 Actions */}
                  <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer flex items-center gap-1.5"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (!formData.arrivalDate) {
                          showToast('Please select your arrival date.', 'error');
                          return;
                        }
                        if (formData.numberOfDays <= 0) {
                          showToast('Please specify a trip duration of at least 1 day.', 'error');
                          return;
                        }
                        setCurrentStep(3);
                      }}
                      className="px-6 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 active:scale-98 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <span>Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* ================= STEP 3 — TRAVELLERS ================= */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                      Who is travelling with you?
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                      Select the number of travellers. At least one traveller is required before continuing.
                    </p>
                  </div>

                  {/* Total Travellers Banner (starts at 0) */}
                  <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-between max-w-2xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold shadow-xs">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-teal-950">
                          Total Travellers: {formData.travellers.total}
                        </div>
                        <div className="text-xs text-teal-800">
                          {formData.travellers.adults} Adults · {formData.travellers.children} Children · {formData.travellers.seniors} Senior Citizens
                        </div>
                      </div>
                    </div>
                    <span className="text-2xl font-black text-teal-900 px-3.5 py-1 bg-white rounded-xl border border-teal-200 shadow-2xs">
                      {formData.travellers.total}
                    </span>
                  </div>

                  {/* Separate controls for Adults, Children, Senior Citizens (All start at 0) */}
                  <div className="space-y-3.5 max-w-2xl">
                    {/* Adults */}
                    <div className="p-4 rounded-2xl border border-slate-200 bg-white flex items-center justify-between shadow-2xs">
                      <div>
                        <div className="text-sm font-bold text-slate-900">Adults</div>
                        <div className="text-xs text-slate-500">Ages 18 and above</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => updateTravellerCount('adults', -1)}
                          className="w-10 h-10 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center text-lg font-bold text-slate-700 hover:bg-slate-100 shadow-2xs cursor-pointer"
                        >
                          −
                        </button>
                        <span className="w-8 text-center text-base font-extrabold text-slate-900">
                          {formData.travellers.adults}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateTravellerCount('adults', 1)}
                          className="w-10 h-10 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center text-lg font-bold text-slate-700 hover:bg-slate-100 shadow-2xs cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Children */}
                    <div className="p-4 rounded-2xl border border-slate-200 bg-white flex items-center justify-between shadow-2xs">
                      <div>
                        <div className="text-sm font-bold text-slate-900">Children</div>
                        <div className="text-xs text-slate-500">Ages 2 – 17 years</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => updateTravellerCount('children', -1)}
                          className="w-10 h-10 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center text-lg font-bold text-slate-700 hover:bg-slate-100 shadow-2xs cursor-pointer"
                        >
                          −
                        </button>
                        <span className="w-8 text-center text-base font-extrabold text-slate-900">
                          {formData.travellers.children}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateTravellerCount('children', 1)}
                          className="w-10 h-10 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center text-lg font-bold text-slate-700 hover:bg-slate-100 shadow-2xs cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Senior Citizens */}
                    <div className="p-4 rounded-2xl border border-slate-200 bg-white flex items-center justify-between shadow-2xs">
                      <div>
                        <div className="text-sm font-bold text-slate-900">Senior Citizens</div>
                        <div className="text-xs text-slate-500">Ages 60 and above</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => updateTravellerCount('seniors', -1)}
                          className="w-10 h-10 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center text-lg font-bold text-slate-700 hover:bg-slate-100 shadow-2xs cursor-pointer"
                        >
                          −
                        </button>
                        <span className="w-8 text-center text-base font-extrabold text-slate-900">
                          {formData.travellers.seniors}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateTravellerCount('seniors', 1)}
                          className="w-10 h-10 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center text-lg font-bold text-slate-700 hover:bg-slate-100 shadow-2xs cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Step 3 Actions */}
                  <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer flex items-center gap-1.5"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (formData.travellers.total <= 0) {
                          showToast('At least one traveller must be selected before continuing.', 'error');
                          return;
                        }
                        setCurrentStep(4);
                      }}
                      className="px-6 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 active:scale-98 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <span>Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* ================= STEP 4 — TRANSPORT ================= */}
              {currentStep === 4 && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                      How will you travel?
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                      Nothing is selected automatically. Select how you plan to reach {formData.destination || 'your destination'}.
                    </p>
                  </div>

                  {/* Transport Choices (Nothing selected automatically) */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 max-w-3xl">
                    {[
                      { mode: 'Train' as TransportMode, label: 'Train', icon: '🚆' },
                      { mode: 'Bus' as TransportMode, label: 'Bus', icon: '🚌' },
                      { mode: 'Flight' as TransportMode, label: 'Flight', icon: '✈️' },
                      { mode: 'Car / Personal vehicle' as TransportMode, label: 'Personal Vehicle', icon: '🚗' },
                      { mode: 'Not decided' as TransportMode, label: 'Not Decided', icon: '❓' },
                    ].map((item) => {
                      const isSelected = formData.transportMode === item.mode;
                      return (
                        <button
                          key={item.mode}
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              transportMode: item.mode,
                              ticketStatus: item.mode === 'Not decided' || item.mode === 'Car / Personal vehicle' ? '' : formData.ticketStatus,
                            })
                          }
                          className={`p-4 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2 ${
                            isSelected
                              ? 'bg-teal-50 border-teal-600 text-teal-950 font-bold shadow-xs ring-2 ring-teal-500/20'
                              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <span className="text-3xl">{item.icon}</span>
                          <span className="text-xs font-bold leading-tight">{item.label}</span>
                          {isSelected && (
                            <span className="w-2 h-2 rounded-full bg-teal-600 mt-0.5" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* TRAIN SPECIFIC FIELDS */}
                  {formData.transportMode === 'Train' && (
                    <div className="p-4.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 max-w-2xl animate-in fade-in duration-200">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Train Number / Name (Optional)
                        </label>
                        <input
                          type="text"
                          value={formData.transportDetails}
                          onChange={(e) => setFormData({ ...formData, transportDetails: e.target.value })}
                          placeholder="e.g. 22439 Vande Bharat Express / Rajdhani Express"
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                          Ticket Status
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {['Confirmed', 'RAC', 'Waiting', 'Not Booked'].map((status) => (
                            <button
                              key={status}
                              type="button"
                              onClick={() => setFormData({ ...formData, ticketStatus: status })}
                              className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer text-center ${
                                formData.ticketStatus === status
                                  ? 'bg-teal-600 text-white border-teal-600 font-bold shadow-xs'
                                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* BUS SPECIFIC FIELDS */}
                  {formData.transportMode === 'Bus' && (
                    <div className="p-4.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 max-w-2xl animate-in fade-in duration-200">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Bus Operator / Type (Optional)
                        </label>
                        <input
                          type="text"
                          value={formData.transportDetails}
                          onChange={(e) => setFormData({ ...formData, transportDetails: e.target.value })}
                          placeholder="e.g. UPSRTC Volvo Sleeper, Zingbus, KSRTC Airavat"
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                          Ticket Status
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {['Confirmed', 'Waiting', 'Not Booked'].map((status) => (
                            <button
                              key={status}
                              type="button"
                              onClick={() => setFormData({ ...formData, ticketStatus: status })}
                              className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer text-center ${
                                formData.ticketStatus === status
                                  ? 'bg-teal-600 text-white border-teal-600 font-bold shadow-xs'
                                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* FLIGHT SPECIFIC FIELDS */}
                  {formData.transportMode === 'Flight' && (
                    <div className="p-4.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 max-w-2xl animate-in fade-in duration-200">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Airline / Flight Number (Optional)
                        </label>
                        <input
                          type="text"
                          value={formData.transportDetails}
                          onChange={(e) => setFormData({ ...formData, transportDetails: e.target.value })}
                          placeholder="e.g. IndiGo 6E 214, Air India AI-202"
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                          Ticket / Web Check-in Status
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {['Confirmed', 'Web Check-in Pending', 'Not Booked'].map((status) => (
                            <button
                              key={status}
                              type="button"
                              onClick={() => setFormData({ ...formData, ticketStatus: status })}
                              className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer text-center ${
                                formData.ticketStatus === status
                                  ? 'bg-teal-600 text-white border-teal-600 font-bold shadow-xs'
                                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 4 Actions */}
                  <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer flex items-center gap-1.5"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (!formData.transportMode) {
                          showToast('Please select how you will travel (or select Not Decided).', 'error');
                          return;
                        }
                        setCurrentStep(5);
                      }}
                      className="px-6 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 active:scale-98 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <span>Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* ================= STEP 5 — TRIP TYPE & SPECIAL PLANS ================= */}
              {currentStep === 5 && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                      What type of trip are you planning?
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                      Choose your trip genre and share any specific places or traveller requirements.
                    </p>
                  </div>

                  <div className="space-y-5 max-w-3xl">
                    {/* Trip Type (Nothing selected automatically) */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Trip Type *
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                        {[
                          { type: 'Religious / Pilgrimage' as TripType, label: 'Religious / Pilgrimage', icon: '🙏' },
                          { type: 'Family vacation' as TripType, label: 'Family Vacation', icon: '👨‍👩‍👧‍👦' },
                          { type: 'Nature' as TripType, label: 'Nature', icon: '🌲' },
                          { type: 'Adventure' as TripType, label: 'Adventure', icon: '🧗' },
                          { type: 'Cultural' as TripType, label: 'Culture & Heritage', icon: '🏛️' },
                          { type: 'Business' as TripType, label: 'Business', icon: '💼' },
                          { type: 'Mixed' as TripType, label: 'Mixed', icon: '✨' },
                        ].map((item) => {
                          const isSelected = formData.tripType === item.type;
                          return (
                            <button
                              key={item.type}
                              type="button"
                              onClick={() => setFormData({ ...formData, tripType: item.type })}
                              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                                isSelected
                                  ? 'bg-teal-50 border-teal-600 text-teal-950 font-bold shadow-xs ring-1 ring-teal-500/30'
                                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              <span className="text-xl">{item.icon}</span>
                              <span className="text-xs font-semibold leading-tight">{item.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Places / activities you want to visit (Optional) */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Places / activities you want to visit (Optional)
                      </label>
                      <input
                        type="text"
                        value={formData.plannedActivities}
                        onChange={(e) => setFormData({ ...formData, plannedActivities: e.target.value })}
                        placeholder="e.g. Visit Ram Mandir, evening aarti, local handicraft market, boating..."
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-900 bg-slate-50/70 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-2xs"
                      />
                    </div>

                    {/* Special requirements or considerations (Optional) */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Special requirements or considerations (Optional)
                      </label>
                      <input
                        type="text"
                        value={formData.specialConsiderations}
                        onChange={(e) =>
                          setFormData({ ...formData, specialConsiderations: e.target.value })
                        }
                        placeholder="e.g. Travelling with elderly parents, need wheelchair-friendly locations, want peaceful places..."
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-900 bg-slate-50/70 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-2xs"
                      />
                    </div>
                  </div>

                  {/* Step 5 Actions */}
                  <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(4)}
                      className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer flex items-center gap-1.5"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (!formData.tripType) {
                          showToast('Please select your trip type.', 'error');
                          return;
                        }
                        setCurrentStep(6); // Go to Review
                      }}
                      className="px-6 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 active:scale-98 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <span>Review Trip Details</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* ================= STEP 6 — REVIEW BEFORE AI GENERATION ================= */}
              {currentStep === 6 && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100/70 border border-teal-200 text-teal-800 text-xs font-bold uppercase tracking-wider mb-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-700" />
                      <span>Ready for AI Analysis</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                      YOUR TRIP DETAILS
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                      Please review the exact details you entered. Our AI will generate your personalized travel checklist using only your actual input.
                    </p>
                  </div>

                  {/* Structured Review Summary Card */}
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 sm:p-6 space-y-4 max-w-3xl">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      {/* Destination */}
                      <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                        <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1">
                          Destination
                        </span>
                        <span className="text-sm font-extrabold text-slate-900">
                          {formData.destination}, {formData.state}
                        </span>
                      </div>

                      {/* Dates & Duration */}
                      <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                        <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1">
                          Arrival & Duration
                        </span>
                        <span className="text-sm font-extrabold text-slate-900">
                          {formData.arrivalDate} · {formData.numberOfDays} {formData.numberOfDays === 1 ? 'Day' : 'Days'}
                        </span>
                      </div>

                      {/* Travellers */}
                      <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                        <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1">
                          Travellers ({formData.travellers.total} Total)
                        </span>
                        <span className="text-xs font-bold text-slate-800">
                          Adults: {formData.travellers.adults} · Children: {formData.travellers.children} · Senior Citizens: {formData.travellers.seniors}
                        </span>
                      </div>

                      {/* Transport */}
                      <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                        <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1">
                          Transport
                        </span>
                        <span className="text-xs font-bold text-slate-800">
                          {formData.transportMode}
                          {formData.transportDetails && ` (${formData.transportDetails})`}
                          {formData.ticketStatus && ` · Status: ${formData.ticketStatus}`}
                        </span>
                      </div>

                      {/* Trip Type */}
                      <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                        <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1">
                          Trip Type
                        </span>
                        <span className="text-xs font-bold text-slate-800">
                          {formData.tripType}
                        </span>
                      </div>

                      {/* Special Plans */}
                      <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                        <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1">
                          Special Plans & Activities
                        </span>
                        <span className="text-xs font-medium text-slate-800">
                          {formData.plannedActivities || 'None specified'}
                        </span>
                      </div>
                    </div>

                    {/* Special requirements note */}
                    {formData.specialConsiderations && (
                      <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs text-xs">
                        <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1">
                          Special Requirements / Considerations
                        </span>
                        <span className="text-slate-800">{formData.specialConsiderations}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions: Edit Details or Generate */}
                  <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer flex items-center gap-1.5 w-full sm:w-auto justify-center"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Edit Details</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleGenerate}
                      disabled={isGenerating}
                      className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-teal-600 via-teal-500 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-bold text-xs shadow-md shadow-teal-600/20 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
                    >
                      {isGenerating ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Generating Personalized Checklist...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Generate My Smart Checklist</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ================= 2. GENERATED CHECKLIST VIEW ================= */}
        {checklistData && !isEditingTrip && (
          <div className="space-y-8">
            {/* TRIP SUMMARY HEADER */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 text-white rounded-3xl p-6 sm:p-7 shadow-lg relative overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-400/20 border border-teal-400/30 text-teal-300 text-xs font-bold uppercase tracking-wider">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>My Trip Summary</span>
                  </div>

                  <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">
                    {checklistData.input.destination}, {checklistData.input.state}
                  </h2>

                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-teal-400" />
                      <span>
                        <strong>Arrival:</strong> {checklistData.input.arrivalDate} ({checklistData.input.numberOfDays} Days)
                      </span>
                    </span>

                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-teal-400" />
                      <span>
                        <strong>Travellers:</strong> {checklistData.input.travellers.total} ({checklistData.input.travellers.adults}A, {checklistData.input.travellers.children}C, {checklistData.input.travellers.seniors}S)
                      </span>
                    </span>

                    <span className="flex items-center gap-1.5">
                      <Train className="w-3.5 h-3.5 text-teal-400" />
                      <span>
                        <strong>Transport:</strong> {checklistData.input.transportMode}
                        {checklistData.input.transportDetails && ` (${checklistData.input.transportDetails})`}
                        {checklistData.input.ticketStatus && ` [${checklistData.input.ticketStatus}]`}
                      </span>
                    </span>
                  </div>

                  <p className="text-xs text-teal-200 font-medium pt-1">
                    “Your personalized checklist is ready.”
                  </p>
                </div>

                {/* PDF & Utility Action Buttons */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    onClick={() => {
                      setIsEditingTrip(true);
                      setCurrentStep(1);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Trip Details</span>
                  </button>

                  {/* PRINT BUTTON */}
                  <button
                    onClick={handlePrint}
                    className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white transition-colors cursor-pointer flex items-center gap-1.5"
                    title="Print checklist"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Print</span>
                  </button>

                  {/* COPY BUTTON */}
                  <button
                    onClick={handleCopyChecklist}
                    className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white transition-colors cursor-pointer flex items-center gap-1.5"
                    title="Copy full checklist text"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Copy</span>
                  </button>
                </div>
              </div>
            </div>

            {/* TRAVEL READINESS SCORE */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-md space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900">Travel Readiness</h3>
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-teal-50 text-teal-700 border border-teal-200">
                      {completedItems} of {totalItems} completed
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {readinessScore === 100
                      ? 'Congratulations! You are 100% prepared for your journey.'
                      : 'Complete your packing, official verification, and tickets to maximize peace of mind.'}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-3xl font-extrabold text-teal-800">
                      {readinessScore}%
                    </div>
                    <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                      Prepared
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleMarkAllComplete}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                    >
                      Mark All
                    </button>
                    <button
                      onClick={handleResetChecklist}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-500 hover:bg-slate-50 cursor-pointer"
                      title="Reset completed items"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${readinessScore}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="bg-gradient-to-r from-teal-500 to-cyan-500 h-full rounded-full"
                />
              </div>

              {/* Category Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-2">
                {categoryBreakdown.map((cat) => (
                  <div
                    key={cat.category}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      cat.isAllDone
                        ? 'bg-teal-50/70 border-teal-200 text-teal-800'
                        : 'bg-slate-50/70 border-slate-200/80 text-slate-600'
                    }`}
                  >
                    <div className="text-[11px] font-bold truncate">{cat.label}</div>
                    <div className="text-xs font-extrabold mt-0.5">
                      {cat.completed}/{cat.total}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI SUGGESTIONS CALLOUT */}
            {checklistData.suggestions && checklistData.suggestions.length > 0 && (
              <div className="bg-amber-50/80 border border-amber-200/80 rounded-3xl p-5 sm:p-6 space-y-3">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                  <Lightbulb className="w-4 h-4 text-amber-600" />
                  <span>AI Ground Insights for {checklistData.input.destination}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-amber-900">
                  {checklistData.suggestions.map((sug) => (
                    <div
                      key={sug.id}
                      className="p-3 bg-white/80 rounded-xl border border-amber-200/50 shadow-2xs"
                    >
                      <span className="font-bold text-amber-950 block mb-0.5">{sug.title}</span>
                      <p className="text-amber-900/90 leading-relaxed">{sug.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CHECKLIST SECTIONS */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-xl font-bold text-slate-900">
                  Detailed Checklist
                </h3>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-2xs cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Custom Item</span>
                </button>
              </div>

              {/* Categorized Items */}
              {([
                'transport',
                'before_you_leave',
                'documents',
                'packing',
                'destination_specific',
                'family_traveller',
                'emergency_safety',
              ] as SmartChecklistCategory[]).map((catKey) => {
                const itemsInCat = checklistData.items.filter((i) => i.category === catKey);
                if (itemsInCat.length === 0) return null;

                const meta = CATEGORY_META[catKey];
                const IconComponent = meta.icon;
                const completedInCat = itemsInCat.filter((i) => i.isCompleted).length;

                return (
                  <div
                    key={catKey}
                    className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-4"
                  >
                    {/* Category Header */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center ${meta.bgColor}`}
                        >
                          <IconComponent className={`w-4 h-4 ${meta.color}`} />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-slate-900">{meta.label}</h4>
                        </div>
                      </div>

                      <span className="text-xs font-semibold text-slate-500">
                        {completedInCat} of {itemsInCat.length} done
                      </span>
                    </div>

                    {/* Items List */}
                    <div className="space-y-2.5">
                      {itemsInCat.map((item) => {
                        return (
                          <div
                            key={item.id}
                            onClick={() => handleToggleItem(item.id)}
                            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                              item.isCompleted
                                ? 'bg-slate-50/70 border-slate-200 opacity-75'
                                : 'bg-white border-slate-200/90 hover:border-teal-400 hover:shadow-2xs'
                            }`}
                          >
                            {/* Checkbox */}
                            <div className="pt-0.5 shrink-0">
                              <div
                                className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                                  item.isCompleted
                                    ? 'bg-teal-600 text-white'
                                    : 'border-2 border-slate-300 hover:border-teal-500'
                                }`}
                              >
                                {item.isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                              </div>
                            </div>

                            {/* Item Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <span
                                  className={`text-xs font-bold ${
                                    item.isCompleted ? 'line-through text-slate-500' : 'text-slate-900'
                                  }`}
                                >
                                  {item.title}
                                </span>

                                {/* Tag */}
                                {item.tag && (
                                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                                    {item.tag}
                                  </span>
                                )}

                                {/* Official requirement badge */}
                                {item.isOfficialRequirement && (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-300">
                                    <ShieldCheck className="w-3 h-3 text-amber-700" />
                                    <span>Verified Official Requirement</span>
                                  </span>
                                )}

                                {item.isUserProvided && (
                                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-purple-100 text-purple-800">
                                    👤 Custom
                                  </span>
                                )}
                              </div>

                              <p
                                className={`text-xs leading-relaxed ${
                                  item.isCompleted ? 'text-slate-400' : 'text-slate-600'
                                }`}
                              >
                                {item.description}
                              </p>

                              {/* Official verification link if provided */}
                              {item.officialSourceUrl && (
                                <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                                  <a
                                    href={item.officialSourceUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-700 hover:text-teal-800 hover:underline"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                    <span>
                                      Verify on {item.officialSourceLabel || 'Official Portal'}
                                    </span>
                                  </a>
                                </div>
                              )}
                            </div>

                            {/* Item actions: Edit & Delete */}
                            <div
                              className="flex items-center gap-1 shrink-0 pt-0.5"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={() => setEditingItem(item)}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                                title="Edit item"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => handleDeleteItem(item.id, e)}
                                className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                title="Delete item"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= ADD CUSTOM ITEM MODAL ================= */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-slate-200 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-base text-slate-900">Add Custom Checklist Item</h3>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddCustomItem} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value as SmartChecklistCategory)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    {Object.entries(CATEGORY_META).map(([key, meta]) => (
                      <option key={key} value={key}>
                        {meta.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Item Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={newItemTitle}
                    onChange={(e) => setNewItemTitle(e.target.value)}
                    placeholder="e.g. Carry portable oxygen can / walking stick"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Notes / Description (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={newItemDesc}
                    onChange={(e) => setNewItemDesc(e.target.value)}
                    placeholder="Add details or special reminders..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs"
                  >
                    Add Item
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================= EDIT ITEM MODAL ================= */}
        {editingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-slate-200 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-base text-slate-900">Edit Checklist Item</h3>
                <button
                  onClick={() => setEditingItem(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveEditedItem} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Item Title
                  </label>
                  <input
                    type="text"
                    required
                    value={editingItem.title}
                    onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={editingItem.description}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, description: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingItem(null)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
