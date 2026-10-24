import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Bot, Send, User, Sparkles, X, Minimize2, Maximize2, Zap, Settings, Volume2, 
  FastForward, Mic, MicOff, Phone, PhoneOff, Wrench, FileText, ClipboardCheck, 
  BookOpen, Brain
} from "lucide-react";
import { cn } from "../lib/utils";
import Markdown from "react-markdown";
import { useVoice } from "../lib/voice";
import { doc, getDoc, setDoc, updateDoc, arrayUnion, onSnapshot } from "firebase/firestore";
import { db, auth } from "../firebase";
import { OPERATING_MANUALS } from "../lib/operatingManuals";

interface Message {
  role: "user" | "model";
  parts: { text: string }[];
  timestamp?: string;
}

interface StaffAgentProps {
  role: string;
  displayName: string;
  initialAgentType?: string;
  onboardingProgress?: any;
  trainingRecords?: any[];
}

export const StaffAgent: React.FC<StaffAgentProps> = ({ role, displayName, initialAgentType, onboardingProgress, trainingRecords }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showTools, setShowTools] = useState(false);
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [agentType, setAgentType] = useState(initialAgentType);
  const [agentName, setAgentName] = useState(`${role} Assistant`);
  const [personality, setPersonality] = useState("Professional & Efficient");
  const [proactiveTip, setProactiveTip] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { 
    voiceName, setVoiceName, speed, setSpeed, speak, 
    isListening, startListening, stopListening,
    startVapiCall, stopVapiCall, isVapiActive,
    isVoiceEnabled, setIsVoiceEnabled
  } = useVoice();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user || !isOpen) return;

    const chatRef = doc(db, "chatHistory", user.uid + "_" + (agentType || "staff"));
    const unsubscribe = onSnapshot(chatRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setHistory(data.messages || []);
      }
    });

    return unsubscribe;
  }, [isOpen, agentType]);

  useEffect(() => {
    const handleOpen = (e: any) => {
      setIsOpen(true);
      if (e.detail?.agentType) {
        setAgentType(e.detail.agentType);
      }
    };
    window.addEventListener('open-staff-agent', handleOpen);
    return () => window.removeEventListener('open-staff-agent', handleOpen);
  }, []);

  useEffect(() => {
    // Proactive Excellence: Show a tip every 2 minutes or on open
    const showTip = () => {
      const manual = OPERATING_MANUALS[role];
      if (manual) {
        const tips = [...manual.aiCoworkerGuidance.promptSuggestions, ...manual.realLifeUseCases];
        const randomTip = tips[Math.floor(Math.random() * tips.length)];
        setProactiveTip(randomTip);
      }
    };

    if (isOpen) {
      showTip();
      const interval = setInterval(showTip, 120000);
      return () => clearInterval(interval);
    }
  }, [isOpen, role]);

  const handleSend = async (overrideMessage?: string) => {
    const textToSend = overrideMessage || message;
    const user = auth.currentUser;
    if (!textToSend.trim() || isLoading || !user) return;

    const timestamp = new Date().toISOString();
    const userMessage: Message = { 
      role: "user", 
      parts: [{ text: textToSend }],
      timestamp 
    };
    
    // Optimistic update
    setHistory(prev => [...prev, userMessage]);
    if (!overrideMessage) setMessage("");
    setIsLoading(true);

    try {
      const chatRef = doc(db, "chatHistory", user.uid + "_" + (agentType || "staff"));
      const chatSnap = await getDoc(chatRef);
      
      if (!chatSnap.exists()) {
        await setDoc(chatRef, {
          userId: user.uid,
          agentType: agentType || "staff",
          messages: [userMessage],
          updatedAt: timestamp
        });
      } else {
        await updateDoc(chatRef, {
          messages: arrayUnion(userMessage),
          updatedAt: timestamp
        });
      }

      const response = await fetch("/api/staff-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          displayName,
          message: textToSend,
          history: history.slice(-10).map(m => ({
            role: m.role,
            parts: m.parts
          })),
          agentType,
          agentName,
          personality,
          onboardingProgress,
          trainingRecords
        }),
      });

      const data = await response.json();
      if (data.success) {
        const modelMessage: Message = { 
          role: "model", 
          parts: [{ text: data.text }],
          timestamp: new Date().toISOString()
        };
        
        await updateDoc(chatRef, {
          messages: arrayUnion(modelMessage),
          updatedAt: new Date().toISOString()
        });
        
        speak(data.text);
      }
    } catch (error) {
      console.error("Agent Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening((text) => {
        handleSend(text);
      });
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="bg-emerald-600 text-white p-4 rounded-full shadow-2xl hover:bg-emerald-700 transition-all flex items-center gap-2 group"
          >
            <Bot className="h-6 w-6" />
            <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 whitespace-nowrap font-bold">
              Talk to your AI Extension
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: 100, opacity: 0, scale: 0.9 }}
            animate={{ 
              y: 0, 
              opacity: 1, 
              scale: 1,
              height: isMinimized ? "64px" : "600px",
              width: isMinimized ? "400px" : "400px"
            }}
            exit={{ y: 100, opacity: 0, scale: 0.9 }}
            className="bg-white rounded-[2rem] shadow-2xl border border-emerald-100 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-emerald-900 p-4 flex items-center justify-between text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
              <div className="flex items-center gap-3 relative z-10">
                <div className="bg-emerald-500/20 p-2 rounded-xl">
                  <Bot className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <div className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Genesis AI Extension</div>
                  <div className="text-sm font-bold truncate max-w-[150px]">{agentName}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 relative z-10">
                <button 
                  onClick={isVapiActive ? stopVapiCall : startVapiCall}
                  className={cn(
                    "p-1.5 rounded-lg transition-all",
                    isVapiActive ? "bg-red-500 text-white animate-pulse" : "hover:bg-white/10"
                  )}
                  title={isVapiActive ? "End Voice Call" : "Start Voice Call"}
                >
                  {isVapiActive ? <PhoneOff className="h-4 w-4" /> : <Phone className="h-4 w-4" />}
                </button>
                <button 
                  onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
                  className={cn(
                    "p-1.5 rounded-lg transition-all",
                    isVoiceEnabled ? "bg-emerald-500 text-white" : "hover:bg-white/10 text-white/50"
                  )}
                  title={isVoiceEnabled ? "Disable AI Voice" : "Enable AI Voice"}
                >
                  <Volume2 className={cn("h-4 w-4", !isVoiceEnabled && "opacity-50")} />
                </button>
                <button 
                  onClick={() => {
                    setShowTools(!showTools);
                    setShowSettings(false);
                  }}
                  className={cn("p-1.5 rounded-lg transition-colors", showTools ? "bg-white/20" : "hover:bg-white/10")}
                  title="Task Automation Tools"
                >
                  <Wrench className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => {
                    setShowSettings(!showSettings);
                    setShowTools(false);
                  }}
                  className={cn("p-1.5 rounded-lg transition-colors", showSettings ? "bg-white/20" : "hover:bg-white/10")}
                >
                  <Settings className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {showTools ? (
                  <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-stone-50">
                    <div className="flex items-center justify-between gap-3 mb-2">
                       <div>
                         <h3 className="text-xl font-bold text-emerald-900">Task Automation Hub</h3>
                         <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">Genesis AI Toolbox</p>
                       </div>
                       <div className="bg-emerald-100 p-2 rounded-xl">
                         <Zap className="h-5 w-5 text-emerald-600" />
                       </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      <button 
                        onClick={() => {
                          handleSend("Draft a formal incident report based on a recent event I describe.");
                          setShowTools(false);
                        }}
                        className="bg-white border border-stone-200 p-4 rounded-2xl flex items-start gap-4 hover:border-emerald-400 hover:shadow-md transition-all text-left group"
                      >
                        <div className="bg-stone-50 p-2 rounded-xl group-hover:bg-emerald-50 transition-colors">
                          <FileText className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                          <div className="font-bold text-emerald-900 text-sm">Draft Incident Report</div>
                          <p className="text-[10px] text-stone-500">Automated documentation for state & facility compliance.</p>
                        </div>
                      </button>

                      <button 
                        onClick={() => {
                          handleSend("What are the core SOPs and Best Practices for my role as " + role + "?");
                          setShowTools(false);
                        }}
                        className="bg-white border border-stone-200 p-4 rounded-2xl flex items-start gap-4 hover:border-emerald-400 hover:shadow-md transition-all text-left group"
                      >
                        <div className="bg-stone-50 p-2 rounded-xl group-hover:bg-emerald-50 transition-colors">
                          <BookOpen className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                          <div className="font-bold text-emerald-900 text-sm">Access Operating Manual</div>
                          <p className="text-[10px] text-stone-500">Instant retrieval of role-specific protocols.</p>
                        </div>
                      </button>

                      <button 
                        onClick={() => {
                          handleSend("Give me a 'Spectacular Outcome' suggestion for my next client session.");
                          setShowTools(false);
                        }}
                        className="bg-white border border-stone-200 p-4 rounded-2xl flex items-start gap-4 hover:border-emerald-400 hover:shadow-md transition-all text-left group"
                      >
                        <div className="bg-stone-50 p-2 rounded-xl group-hover:bg-emerald-50 transition-colors">
                          <Brain className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                          <div className="font-bold text-emerald-900 text-sm">Best Practice Advisor</div>
                          <p className="text-[10px] text-stone-500">AI-driven optimizations for high-impact care.</p>
                        </div>
                      </button>

                      <button 
                        onClick={() => {
                          handleSend("Check my current onboarding tasks and training status.");
                          setShowTools(false);
                        }}
                        className="bg-white border border-stone-200 p-4 rounded-2xl flex items-start gap-4 hover:border-emerald-400 hover:shadow-md transition-all text-left group"
                      >
                        <div className="bg-stone-50 p-2 rounded-xl group-hover:bg-emerald-50 transition-colors">
                          <ClipboardCheck className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                          <div className="font-bold text-emerald-900 text-sm">Compliance Check</div>
                          <p className="text-[10px] text-stone-500">Verify your licensing and mandatory certifications.</p>
                        </div>
                      </button>
                    </div>

                    <p className="text-[10px] text-stone-400 italic text-center px-6">
                      These tools use your AI extension to automate repetitive tasks, ensuring excellence is your standard of execution.
                    </p>

                    <button 
                      onClick={() => setShowTools(false)}
                      className="w-full bg-emerald-900 text-white py-4 rounded-xl font-bold hover:bg-emerald-800 transition-all shadow-lg"
                    >
                      Return to Interaction
                    </button>
                  </div>
                ) : showSettings ? (
                  <div className="flex-1 p-8 space-y-6 overflow-y-auto bg-stone-50">
                    <h3 className="text-xl font-bold text-emerald-900">Agent Configuration</h3>
                    
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">Agent Identity</label>
                        <input 
                          type="text"
                          value={agentName}
                          onChange={(e) => setAgentName(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                          placeholder="Name your agent..."
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">Personality Profile</label>
                        <select 
                          value={personality}
                          onChange={(e) => setPersonality(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm bg-white"
                        >
                          <option>Professional & Efficient</option>
                          <option>Warm & Empathetic</option>
                          <option>Strict & Compliance-Focused</option>
                          <option>Creative & Innovative</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">Voice Selection</label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { name: 'Kore', label: 'Professional (M)' },
                            { name: 'Aoede', label: 'Natural (F)' },
                            { name: 'Charon', label: 'Deep (M)' },
                            { name: 'Fenrir', label: 'Bold (M)' }
                          ].map(v => (
                            <button
                              key={v.name}
                              disabled={!isVoiceEnabled}
                              onClick={() => setVoiceName(v.name)}
                              className={cn(
                                "px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2",
                                !isVoiceEnabled ? "opacity-30 cursor-not-allowed" :
                                voiceName === v.name 
                                  ? "bg-emerald-600 text-white border-emerald-600" 
                                  : "bg-white text-stone-600 border-stone-200 hover:border-emerald-300"
                              )}
                            >
                              <Volume2 className="h-3 w-3" />
                              {v.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">Speech Rate ({speed}x)</label>
                        <div className="flex items-center gap-4">
                          <FastForward className="h-4 w-4 text-stone-400" />
                          <input 
                            type="range"
                            min="0.5"
                            max="2.0"
                            step="0.1"
                            value={speed}
                            disabled={!isVoiceEnabled}
                            onChange={(e) => setSpeed(parseFloat(e.target.value))}
                            className={cn("flex-1 accent-emerald-600", !isVoiceEnabled && "opacity-30")}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-emerald-900">AI Voice Output</h4>
                        <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">Enable automated speech feedback</p>
                      </div>
                      <button
                        onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
                        className={cn(
                          "w-12 h-6 rounded-full relative transition-all duration-300",
                          isVoiceEnabled ? "bg-emerald-600" : "bg-stone-300"
                        )}
                      >
                        <div className={cn(
                          "absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300",
                          isVoiceEnabled ? "left-7" : "left-1"
                        )} />
                      </button>
                    </div>

                    <button 
                      onClick={() => setShowSettings(false)}
                      className="w-full bg-emerald-900 text-white py-4 rounded-xl font-bold hover:bg-emerald-800 transition-all shadow-lg"
                    >
                      Save & Return to Chat
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Messages */}
                    <div 
                      ref={scrollRef}
                      className="flex-1 overflow-y-auto p-6 space-y-4 bg-stone-50/50"
                    >
                      {proactiveTip && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl mb-4 flex gap-3 items-start"
                        >
                          <Sparkles className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                          <div>
                            <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Proactive Excellence Tip</div>
                            <p className="text-xs text-emerald-800 italic">"{proactiveTip}"</p>
                            <button 
                              onClick={() => handleSend(proactiveTip)}
                              className="mt-2 text-[10px] font-bold text-emerald-600 hover:underline"
                            >
                              Execute this action →
                            </button>
                          </div>
                          <button 
                            onClick={() => setProactiveTip(null)}
                            className="text-emerald-300 hover:text-emerald-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </motion.div>
                      )}

                      {history.length === 0 && (
                        <div className="text-center py-10">
                          <div className="bg-emerald-100 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4">
                            <Sparkles className="h-8 w-8 text-emerald-600" />
                          </div>
                          <h4 className="font-bold text-emerald-900 mb-2">Welcome, {displayName}</h4>
                          <p className="text-stone-500 text-sm px-6">
                            I am {agentName}, your specialized AI extension. 
                            I'm here to help you perfect your processes and maximize your impact.
                          </p>
                        </div>
                      )}

                      {history.map((msg, i) => (
                        <div
                          key={i}
                          className={cn(
                            "flex gap-3",
                            msg.role === "user" ? "flex-row-reverse" : "flex-row"
                          )}
                        >
                          <div className={cn(
                            "w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0",
                            msg.role === "user" ? "bg-stone-200" : "bg-emerald-900"
                          )}>
                            {msg.role === "user" ? <User className="h-4 w-4 text-stone-600" /> : <Bot className="h-4 w-4 text-emerald-400" />}
                          </div>
                          <div className={cn(
                            "max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed",
                            msg.role === "user" 
                              ? "bg-emerald-600 text-white rounded-tr-none" 
                              : "bg-white border border-stone-100 text-stone-800 shadow-sm rounded-tl-none"
                          )}>
                            <Markdown>{msg.parts[0].text}</Markdown>
                          </div>
                        </div>
                      ))}
                      {(isLoading || isVapiActive) && (
                        <div className="flex gap-3">
                          <div className="w-8 h-8 rounded-xl bg-emerald-900 flex items-center justify-center">
                            <Bot className="h-4 w-4 text-emerald-400" />
                          </div>
                          <div className="bg-white border border-stone-100 p-4 rounded-2xl rounded-tl-none shadow-sm">
                            <div className="flex gap-1.5 items-center">
                              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce"></div>
                              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest ml-2">Genesis AI is thinking...</span>
                            </div>
                            {isVapiActive && <p className="text-[10px] text-emerald-600 font-bold mt-1">Voice Call Active...</p>}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Input */}
                    <div className="p-4 bg-white border-t border-stone-100">
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyPress={(e) => e.key === "Enter" && handleSend()}
                            placeholder={isListening ? "Listening..." : isVapiActive ? "Speak naturally..." : "Type a message..."}
                            disabled={isVapiActive}
                            className={cn(
                              "w-full bg-stone-50 border border-stone-200 rounded-2xl py-3 pl-4 pr-12 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all",
                              (isListening || isVapiActive) && "border-emerald-500 ring-2 ring-emerald-500/20"
                            )}
                          />
                          <button
                            onClick={() => handleSend()}
                            disabled={!message.trim() || isLoading || isVapiActive}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-emerald-600 text-white p-2 rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-all"
                          >
                            <Send className="h-4 w-4" />
                          </button>
                        </div>
                        <button
                          onClick={toggleListening}
                          disabled={isVapiActive}
                          className={cn(
                            "p-3 rounded-2xl transition-all flex items-center justify-center",
                            isListening 
                              ? "bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/20" 
                              : "bg-emerald-100 text-emerald-600 hover:bg-emerald-200 disabled:opacity-50"
                          )}
                        >
                          {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                        </button>
                      </div>
                      <div className="mt-2 flex items-center justify-center gap-1.5 text-[10px] text-stone-400 font-bold uppercase tracking-widest">
                        <Zap className="h-3 w-3 text-amber-400 fill-amber-400" />
                        Powered by Genesis AI Extension
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
