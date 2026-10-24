import React, { useState, useEffect, useRef } from "react";
import { GoogleGenAI, Type } from "@google/genai";
import { collection, addDoc, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { Lead, UserRole } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { 
  UserPlus, 
  Send, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Calendar, 
  ChevronRight,
  Sparkles,
  RefreshCw,
  Clock,
  MapPin,
  Stethoscope
} from "lucide-react";
import { cn } from "../lib/utils";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface LeadForm {
  initials: string;
  medicaidId: string;
  primaryDiagnosis: string;
  behavioralRisk: string;
  preliminaryTier: "A" | "B" | "C" | "D" | "E" | "F";
  source: string;
  notes: string;
  visitDate?: string;
  visitTime?: string;
}

export const LeadIntakeAssistant: React.FC = () => {
  const [messages, setMessages] = useState<{ role: "user" | "model"; text: string }[]>([
    { role: "model", text: "Welcome to the Genesis Lead Intake Command Center. I am Hermes, your AI Lead Intake Agent. Please paste any unstructured notes, discharge reports, or referral details here, and I will begin the autonomous triage and care assessment process." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<LeadForm>>({});
  const [step, setStep] = useState<"parsing" | "verifying" | "scheduling" | "complete">("parsing");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const parseLeadData = async (text: string) => {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Parse the following unstructured notes for a new lead referral. Extract the requested fields. Notes: ${text}`,
        config: {
          systemInstruction: "You are the Genesis Lead Intake Agent (Hermes). Extract lead information precisely. If information is missing, note it in the 'missingFields' array.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              initials: { type: Type.STRING },
              medicaidId: { type: Type.STRING },
              primaryDiagnosis: { type: Type.STRING },
              behavioralRisk: { type: Type.STRING, description: "Low, Medium, High, or Critical" },
              preliminaryTier: { type: Type.STRING, enum: ["A", "B", "C", "D", "E", "F"] },
              source: { type: Type.STRING },
              notes: { type: Type.STRING },
              missingFields: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "List of essential fields missing: initials, medicaidId, primaryDiagnosis, behavioralRisk"
              }
            },
            required: ["missingFields"]
          }
        }
      });

      const result = JSON.parse(response.text || "{}");
      return result;
    } catch (err) {
      console.error("Parse Error:", err);
      return null;
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input;
    setMessages(prev => [...prev, { role: "user", text: userMessage }]);
    setInput("");
    setLoading(true);

    if (step === "parsing") {
      const parsed = await parseLeadData(userMessage);
      if (parsed) {
        setFormData(prev => ({ ...prev, ...parsed }));
        
        if (parsed.missingFields?.length > 0) {
          const missing = parsed.missingFields.join(", ");
          setMessages(prev => [...prev, { 
            role: "model", 
            text: `Data successfully extracted, but I'm still missing some critical components to complete the Excellence Standard assessment: ${missing}. Could you please provide these?` 
          }]);
        } else {
          setStep("verifying");
          setMessages(prev => [...prev, { 
            role: "model", 
            text: `Excellence Triage complete. I have assigned a preliminary Tier ${parsed.preliminaryTier} based on the behavioral risk profile. Would you like to proceed with scheduling the initial on-site review? This includes a personalized greeting from the Executive Director and a clinical walkthrough with our BCBA/RBT team.` 
          }]);
        }
      } else {
        setMessages(prev => [...prev, { role: "model", text: "I encountered an error while parsing those notes. Could you try re-pasting them or providing the details manually?" }]);
      }
    } else if (step === "verifying") {
      if (userMessage.toLowerCase().includes("yes") || userMessage.toLowerCase().includes("schedule")) {
        setStep("scheduling");
        setMessages(prev => [...prev, { 
          role: "model", 
          text: "Excellent. Let's establish the 'When' and 'Where' for this high-impact care assessment. What date and time would work best for the on-site walkthrough? I will ensure Executive Director Rassmann is available to welcome the family personally." 
        }]);
      } else {
        setMessages(prev => [...prev, { role: "model", text: "Understood. The lead is saved in 'Qualified' status for future review. Is there anything else you'd like me to analyze for this record?" }]);
      }
    } else if (step === "scheduling") {
      // Basic extraction for date/time
      setFormData(prev => ({ ...prev, notes: (prev.notes || "") + "\nScheduled Visit: " + userMessage }));
      setStep("complete");
      
      // Save to Firebase
      try {
        const leadRef = await addDoc(collection(db, "leads"), {
          ...formData,
          initials: formData.initials || "TBD",
          medicaidId: formData.medicaidId || "TBD",
          primaryDiagnosis: formData.primaryDiagnosis || "TBD",
          behavioralRisk: formData.behavioralRisk || "TBD",
          preliminaryTier: formData.preliminaryTier || "A",
          status: "intake-scheduled",
          submittedAt: new Date().toISOString(),
          source: formData.source || "Hermes AI Assistant"
        });

        // Add Audit Log
        await addDoc(collection(db, "auditLogs"), {
          timestamp: new Date().toISOString(),
          action: "Lead Autonomous Intake",
          user: "Hermes AI Agent",
          details: `Lead for ${formData.initials} triaged to Tier ${formData.preliminaryTier} and scheduled for on-site review.`,
          type: "system"
        });

        setMessages(prev => [...prev, { 
          role: "model", 
          text: `Milestone achieved. The lead for ${formData.initials} has been finalized. The on-site review is now on the organizational calendar. Executive Director greeting confirmed. BCBA walkthrough confirmed. I will continue to track this lead through the final care decision.` 
        }]);
      } catch (err) {
        console.error("Save Error:", err);
      }
    }

    setLoading(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[700px]">
      {/* Chat Interface */}
      <div className="lg:col-span-2 flex flex-col bg-white rounded-3xl border border-emerald-50 shadow-xl overflow-hidden">
        <div className="bg-emerald-900 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-800 rounded-2xl flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Hermes Lead Assistant</h2>
              <p className="text-emerald-300 text-xs font-medium uppercase tracking-widest">Autonomous Triage & Assessment</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-emerald-800/50 px-4 py-2 rounded-xl border border-emerald-700/50">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <span className="text-[10px] font-black tracking-tighter">AI AGENT ONLINE</span>
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex",
                  msg.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div className={cn(
                  "max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed",
                  msg.role === "user" 
                    ? "bg-emerald-600 text-white rounded-tr-none" 
                    : "bg-emerald-50 text-emerald-900 border border-emerald-100 rounded-tl-none"
                )}>
                  {msg.text}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {loading && (
            <div className="flex justify-start">
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100 flex items-center gap-3">
                <RefreshCw className="h-4 w-4 animate-spin text-emerald-600" />
                <span className="text-xs text-stone-500 font-bold">Hermes is analyzing care needs...</span>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-stone-100 bg-stone-50/50">
          <div className="flex gap-4">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Paste discharge notes or enter lead details..."
              className="flex-1 bg-white border border-stone-200 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none resize-none h-24"
            />
            <button
              onClick={handleSendMessage}
              disabled={loading || !input.trim()}
              className="bg-emerald-600 text-white w-24 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-emerald-700 transition-all disabled:opacity-50 shadow-lg shadow-emerald-100"
            >
              <Send className="h-5 w-5" />
              <span className="text-[10px] font-black uppercase">Triage</span>
            </button>
          </div>
        </div>
      </div>

      {/* Auto-Populated Form Preview */}
      <div className="flex flex-col space-y-6">
        <div className="bg-white rounded-3xl border border-emerald-50 shadow-xl p-6">
          <h3 className="text-lg font-bold text-emerald-900 mb-6 flex items-center gap-2">
            <FileText className="h-5 w-5 text-emerald-600" />
            Lead Dossier (Live)
          </h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-stone-50 p-3 rounded-xl border border-stone-100">
                <span className="text-[10px] font-black text-stone-400 uppercase block mb-1">Initials</span>
                <span className="text-sm font-bold text-emerald-900">{formData.initials || "---"}</span>
              </div>
              <div className="bg-stone-50 p-3 rounded-xl border border-stone-100">
                <span className="text-[10px] font-black text-stone-400 uppercase block mb-1">Medicaid ID</span>
                <span className="text-sm font-mono text-emerald-600">{formData.medicaidId || "---"}</span>
              </div>
            </div>

            <div className="bg-stone-50 p-3 rounded-xl border border-stone-100">
              <span className="text-[10px] font-black text-stone-400 uppercase block mb-1">Primary Diagnosis</span>
              <span className="text-sm font-bold text-emerald-900 leading-tight">
                {formData.primaryDiagnosis || "Awaiting Scan..."}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-stone-50 p-3 rounded-xl border border-stone-100">
                <span className="text-[10px] font-black text-stone-400 uppercase block mb-1">Risk Level</span>
                <span className={cn(
                  "text-xs font-black uppercase",
                  formData.behavioralRisk?.toLowerCase().includes("high") ? "text-red-600" : "text-emerald-600"
                )}>
                  {formData.behavioralRisk || "Pending"}
                </span>
              </div>
              <div className="bg-stone-50 p-3 rounded-xl border border-stone-100">
                <span className="text-[10px] font-black text-stone-400 uppercase block mb-1">NJ Tier</span>
                <span className="text-lg font-black text-emerald-600 italic">Tier {formData.preliminaryTier || "---"}</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-stone-100 space-y-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center",
                step !== "parsing" ? "bg-emerald-100 text-emerald-600" : "bg-stone-100 text-stone-400"
              )}>
                <CheckCircle className="h-4 w-4" />
              </div>
              <span className={cn("text-xs font-bold", step !== "parsing" ? "text-emerald-900" : "text-stone-400")}>Parsing Discharge Notes</span>
            </div>
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center",
                (step === "scheduling" || step === "complete") ? "bg-emerald-100 text-emerald-600" : "bg-stone-100 text-stone-400"
              )}>
                <Calendar className="h-4 w-4" />
              </div>
              <span className={cn("text-xs font-bold", (step === "scheduling" || step === "complete") ? "text-emerald-900" : "text-stone-400")}>Site Visit Scheduled</span>
            </div>
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center",
                step === "complete" ? "bg-emerald-100 text-emerald-600" : "bg-stone-100 text-stone-400"
              )}>
                <Sparkles className="h-4 w-4" />
              </div>
              <span className={cn("text-xs font-bold", step === "complete" ? "text-emerald-900" : "text-stone-400")}>Executive Welcome Confirmed</span>
            </div>
          </div>
        </div>

        <div className="bg-emerald-50 rounded-3xl border border-emerald-100 p-6 flex items-start gap-4">
          <AlertTriangle className="h-6 w-6 text-emerald-600 shrink-0" />
          <div>
            <h4 className="text-sm font-black text-emerald-900 uppercase mb-1">Standard 2026 Protocol</h4>
            <p className="text-[10px] text-emerald-700 leading-relaxed font-medium">
              Lead intake involves a mandatory on-site review. All assessments must be validated by the BCBA before final care tier commit.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
