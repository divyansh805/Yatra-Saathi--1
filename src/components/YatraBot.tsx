import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  X,
  Sparkles,
  RefreshCw,
  MapPin,
  Train,
  CheckSquare,
  HelpCircle,
  Minimize2,
  Maximize2,
  Hotel,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

interface YatraBotProps {
  startingLocation: string;
  selectedDestination: string;
  selectedState: string;
  travelDate: string;
  travellers: { total: number; adults: number; children: number; seniors: number };
  preferredTransport: string;
  recommendedRoute?: any;
  selectedTripDay?: number;
  onNavigateToHotels?: () => void;
  onNavigateToChecklist?: () => void;
}

const QUICK_PROMPTS = [
  'Which train is best for this route?',
  'What should I pack for this trip?',
  'Where should I stay near the station?',
  'How early should I reach the station?',
  'Best food stops on the way?',
];

export const YatraBot: React.FC<YatraBotProps> = ({
  startingLocation,
  selectedDestination,
  selectedState,
  travelDate,
  travellers,
  preferredTransport,
  recommendedRoute,
  selectedTripDay = 1,
  onNavigateToHotels,
  onNavigateToChecklist,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome',
      role: 'assistant',
      text: `Namaste! 🙏 I am **YatraBot**, your AI travel companion for your trip from **${startingLocation || 'your origin'}** to **${selectedDestination}**.\n\nAsk me anything about trains, route transfers, station arrival times, luggage advice, packing checklists, or local travel tips!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized]);

  // Handle send message
  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputValue).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/yatrabot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: messages.map((m) => ({ role: m.role, text: m.text })),
          context: {
            startingLocation,
            destination: selectedDestination,
            state: selectedState,
            travelDate,
            travellers,
            preferredTransport,
            recommendedRoute,
            activeDay: selectedTripDay,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const botMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          role: 'assistant',
          text: data.reply || "I'm ready to help! Could you please ask that again?",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        throw new Error('API request failed');
      }
    } catch {
      const errorMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        text: `For your journey from **${startingLocation || 'your starting point'}** to **${selectedDestination}**, I recommend checking the recommended route breakdown above. Let me know if you need specific tips regarding train transfers, luggage, or packing!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button if closed or minimized */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-teal-700 to-emerald-700 hover:from-teal-800 hover:to-emerald-800 text-white rounded-full p-3.5 sm:px-5 sm:py-3.5 shadow-2xl flex items-center gap-2.5 transition-all duration-300 hover:scale-105 active:scale-95 border-2 border-white/30 cursor-pointer"
          title="Open YatraBot AI Travel Assistant"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-teal-200" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full" />
          </div>
          <span className="font-bold text-sm tracking-wide hidden sm:inline">Ask YatraBot</span>
        </motion.button>
      )}

      {/* Floating Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`fixed bottom-6 right-4 sm:right-6 z-50 bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden transition-all duration-200 ${
              isMinimized ? 'w-80 sm:w-96 h-16' : 'w-[92vw] sm:w-[420px] h-[550px] max-h-[82vh]'
            }`}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-teal-800/40 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm font-display text-white">YatraBot</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-teal-500/30 text-teal-300 font-semibold border border-teal-400/30">
                      AI Assistant
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-300 truncate max-w-[200px]">
                    {startingLocation ? `${startingLocation} → ${selectedDestination}` : selectedDestination}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 text-slate-300">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                  title={isMinimized ? 'Expand' : 'Minimize'}
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                  title="Close YatraBot"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* If not minimized, show chat body */}
            {!isMinimized && (
              <>
                {/* Context badge bar */}
                <div className="bg-slate-50 border-b border-slate-200/80 px-3.5 py-1.5 flex items-center justify-between text-[11px] text-slate-600 shrink-0">
                  <span className="flex items-center gap-1 font-medium">
                    <MapPin className="w-3 h-3 text-teal-600" />
                    <span>Trip to {selectedDestination}</span>
                  </span>
                  <div className="flex items-center gap-2">
                    {onNavigateToHotels && (
                      <button
                        onClick={onNavigateToHotels}
                        className="text-teal-700 hover:text-teal-900 font-semibold hover:underline flex items-center gap-0.5"
                      >
                        <Hotel className="w-3 h-3" /> Stays
                      </button>
                    )}
                    {onNavigateToChecklist && (
                      <button
                        onClick={onNavigateToChecklist}
                        className="text-teal-700 hover:text-teal-900 font-semibold hover:underline flex items-center gap-0.5"
                      >
                        <CheckSquare className="w-3 h-3" /> Checklist
                      </button>
                    )}
                  </div>
                </div>

                {/* Messages Scroll Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-[13px] leading-relaxed ${
                          msg.role === 'user'
                            ? 'bg-teal-700 text-white rounded-br-xs shadow-xs'
                            : 'bg-white text-slate-800 rounded-bl-xs border border-slate-200/80 shadow-xs whitespace-pre-line'
                        }`}
                      >
                        {msg.text}
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex items-center gap-2 text-xs text-slate-500 bg-white border border-slate-200/80 rounded-2xl px-3.5 py-2 w-fit shadow-xs">
                      <RefreshCw className="w-3.5 h-3.5 text-teal-600 animate-spin" />
                      <span>YatraBot is checking route details...</span>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Prompts Chips */}
                <div className="px-3 py-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
                  {QUICK_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => handleSendMessage(prompt)}
                      className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-100 hover:bg-teal-50 text-slate-600 hover:text-teal-800 border border-slate-200 text-[11px] font-medium transition-colors cursor-pointer shrink-0"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>

                {/* Input Bar */}
                <div className="p-3 bg-white border-t border-slate-200 shrink-0">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Ask about trains, luggage, routes..."
                      className="flex-1 bg-slate-100 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-teal-600 focus:ring-1 focus:ring-teal-600/20 rounded-2xl px-3.5 py-2 text-xs text-slate-800 outline-none transition-all placeholder:text-slate-400"
                    />
                    <button
                      type="submit"
                      disabled={!inputValue.trim() || isLoading}
                      className="w-9 h-9 rounded-2xl bg-teal-700 hover:bg-teal-800 disabled:opacity-40 text-white flex items-center justify-center transition-all cursor-pointer shadow-xs shrink-0"
                      title="Send message"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
