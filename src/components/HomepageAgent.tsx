import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Bot, X, MessageSquare, Sparkles, Volume2, ShieldCheck, Phone, PhoneOff } from "lucide-react";
import { useVoice } from "../lib/voice";
import { cn } from "../lib/utils";

export const HomepageAgent: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasWelcomed, setHasWelcomed] = useState(false);
  const { speak, isSpeaking, startVapiCall, stopVapiCall, isVapiActive, isVoiceEnabled, setIsVoiceEnabled } = useVoice();

  useEffect(() => {
    if (isOpen && !hasWelcomed && !isVapiActive && isVoiceEnabled) {
      speak("Welcome to Genesis Revitalization Group. I am your AI concierge. How can I assist you with our services, licensing, or application process today?");
      setHasWelcomed(true);
    }
  }, [isOpen, hasWelcomed, speak, isVapiActive, isVoiceEnabled]);

  return (
    <div className="fixed bottom-8 left-8 z-50">
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => setIsOpen(true)}
            className="bg-emerald-600 text-white p-5 rounded-full shadow-2xl flex items-center gap-3 group border-4 border-white"
          >
            <div className="relative">
              <Bot className="h-7 w-7" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-emerald-600 animate-pulse"></div>
            </div>
            <span className="font-bold pr-2">Ask Genesis AI</span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: 100, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 100, opacity: 0, scale: 0.9 }}
            className="bg-white rounded-[2.5rem] shadow-2xl border border-emerald-100 w-[350px] overflow-hidden flex flex-col"
          >
            <div className="bg-emerald-900 p-6 text-white relative">
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <button 
                  onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
                  className={cn(
                    "p-2 rounded-full transition-all",
                    isVoiceEnabled ? "bg-emerald-500 text-white" : "hover:bg-white/10 text-white/40"
                  )}
                  title={isVoiceEnabled ? "Disable AI Voice" : "Enable AI Voice"}
                >
                  <Volume2 className={cn("h-4 w-4", !isVoiceEnabled && "opacity-50")} />
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-emerald-500/20 p-3 rounded-2xl">
                  <Bot className="h-8 w-8 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Genesis AI Concierge</h3>
                  <div className="flex items-center gap-2 text-[10px] text-emerald-400 uppercase tracking-widest font-bold">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                    {isVapiActive ? "Voice Call Active" : "Live & Speaking"}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 space-y-6">
              <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 relative">
                <div className="absolute -top-3 left-6 bg-white px-3 py-1 rounded-full border border-emerald-100 text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                  AI Greeting
                </div>
                <p className="text-emerald-900 text-sm leading-relaxed font-medium">
                  {isVapiActive 
                    ? "I am listening... Speak naturally to ask about our services or application process."
                    : "Hello! I am the Genesis AI concierge. I can help you navigate our specialized services, explain our licensing model, or guide you through the staff application process."}
                </p>
                {(isSpeaking || isVapiActive) && (
                  <div className="mt-4 flex gap-1 justify-center">
                    {[1, 2, 3, 4, 5].map(i => (
                      <motion.div
                        key={i}
                        animate={{ height: [4, 12, 4] }}
                        transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                        className="w-1 bg-emerald-400 rounded-full"
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <button
                  onClick={isVapiActive ? stopVapiCall : startVapiCall}
                  className={cn(
                    "w-full flex items-center justify-center gap-3 p-4 rounded-2xl border transition-all font-bold",
                    isVapiActive 
                      ? "bg-red-50 border-red-200 text-red-600 hover:bg-red-100" 
                      : "bg-emerald-600 border-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-900/20"
                  )}
                >
                  {isVapiActive ? (
                    <>
                      <PhoneOff className="h-5 w-5" />
                      End Voice Conversation
                    </>
                  ) : (
                    <>
                      <Phone className="h-5 w-5" />
                      Start Natural Voice Call
                    </>
                  )}
                </button>

                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-2 mt-4">Quick Assistance</p>
                {[
                  { icon: ShieldCheck, text: "How do I apply for a position?", link: "/signup" },
                  { icon: Sparkles, text: "Tell me about AI Licensing", link: "/forms" },
                  { icon: MessageSquare, text: "Request Client Information", link: "/forms" }
                ].map((item, i) => (
                  <button
                    key={i}
                    className="w-full flex items-center gap-3 p-4 bg-stone-50 rounded-2xl border border-stone-100 hover:border-emerald-200 hover:bg-emerald-50 transition-all text-left group"
                  >
                    <item.icon className="h-5 w-5 text-emerald-600 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-bold text-stone-700">{item.text}</span>
                  </button>
                ))}
              </div>

              <div className="pt-4 border-t border-stone-100 flex items-center justify-center gap-2 text-[10px] text-stone-400 font-bold uppercase tracking-widest">
                <Volume2 className="h-3 w-3 text-emerald-500" />
                {isVapiActive ? "High-Performance Voice Active" : "Natural Voice Enabled"}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
