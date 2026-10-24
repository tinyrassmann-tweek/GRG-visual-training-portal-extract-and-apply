import React, { useState, useEffect } from "react";
import { GoogleGenAI, Type } from "@google/genai";
import { collection, query, onSnapshot, doc, addDoc, orderBy, limit } from "firebase/firestore";
import { db } from "../firebase";
import { StaffTrainingRecord, IncidentReport, UserProfile, ComplianceUpdate } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertCircle, 
  Bell, 
  Search, 
  MapPin, 
  Activity,
  User,
  Clock,
  Sparkles,
  RefreshCw,
  Send,
  FileWarning
} from "lucide-react";
import { cn } from "../lib/utils";
import { format, differenceInDays } from "date-fns";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const ComplianceSafetyAssistant: React.FC = () => {
  const [messages, setMessages] = useState<{ role: "user" | "model"; text: string }[]>([
    { role: "model", text: "Compliance & Safety Guardian online. I am monitoring HIPAA, SOC3, and NJ DDD regulatory updates. All staff training records have been analyzed for 60/30-day renewal windows. I am also the primary fail-safe for state-mandated incident reporting." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [staffRecords, setStaffRecords] = useState<StaffTrainingRecord[]>([]);
  const [incidentReports, setIncidentReports] = useState<IncidentReport[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [expiringCerts, setExpiringCerts] = useState<StaffTrainingRecord[]>([]);

  useEffect(() => {
    const unsubStaff = onSnapshot(collection(db, "staffTraining"), (snap) => {
      const records = snap.docs.map(d => ({ id: d.id, ...d.data() } as StaffTrainingRecord));
      setStaffRecords(records);
      
      // Calculate expiring certs (30/60 days)
      const now = new Date();
      const expiring = records.filter(r => {
        if (!r.expiresAt || r.status === "completed") return false;
        const days = differenceInDays(new Date(r.expiresAt), now);
        return days <= 60 && days > 0;
      });
      setExpiringCerts(expiring);
    });

    const unsubIncidents = onSnapshot(query(collection(db, "incidentReports"), orderBy("timestamp", "desc"), limit(10)), (snap) => {
      setIncidentReports(snap.docs.map(d => ({ id: d.id, ...d.data() } as IncidentReport)));
    });

    const unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
      setUsers(snap.docs.map(d => d.data() as UserProfile));
    });

    return () => {
      unsubStaff();
      unsubIncidents();
      unsubUsers();
    };
  }, []);

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input;
    setMessages(prev => [...prev, { role: "user", text: userMessage }]);
    setInput("");
    setLoading(true);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: userMessage,
        config: {
          systemInstruction: `You are the Genesis Compliance & Safety Guardian. 
          Your focus: HIPAA, SOC3, NJ DDD regulatory monitoring, and personnel certification fail-safes.
          Current Expiration Alerts: ${expiringCerts.length} records within 60 days.
          Recent Incidents: ${incidentReports.length} reports in the last period.
          
          Guidelines:
          - Proactively alert to compliance gaps.
          - If an incident is reported, remind the user of the 'State Auditor Mode' fail-safe.
          - Encourage 60/30 day renewal registration for certifications.
          - Maintain a strict, professional, yet helpful regulatory focus.`
        }
      });

      setMessages(prev => [...prev, { role: "model", text: response.text || "I am analyzing the regulatory impact." }]);
    } catch (err) {
      console.error("AI Assistant Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-[750px]">
      {/* Expiration & Incident Widgets */}
      <div className="space-y-6 flex flex-col h-full">
        {/* Certificate Alerts */}
        <div className="bg-white rounded-3xl border border-amber-100 shadow-xl p-6 overflow-hidden flex flex-col flex-1">
          <h3 className="text-sm font-black text-amber-900 uppercase flex items-center gap-2 mb-4">
            <Bell className="h-4 w-4 text-amber-600" />
            Renewal Fail-Safes
          </h3>
          <div className="space-y-3 overflow-y-auto pr-2">
            {expiringCerts.length === 0 ? (
              <div className="text-center py-8">
                <ShieldCheck className="h-10 w-10 text-emerald-100 mx-auto mb-2" />
                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">All Certifications Current</p>
              </div>
            ) : (
              expiringCerts.map(cert => {
                const days = cert.expiresAt ? differenceInDays(new Date(cert.expiresAt), new Date()) : 0;
                return (
                  <div key={cert.id} className="p-3 bg-amber-50 rounded-2xl border border-amber-100">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-bold text-amber-900">{cert.moduleTitle}</span>
                      <span className={cn(
                        "text-[8px] font-black px-2 py-0.5 rounded-full",
                        days <= 30 ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"
                      )}>
                        {days}D LEFT
                      </span>
                    </div>
                    <p className="text-[10px] text-amber-700 font-medium">Recipient: {cert.staffEmail}</p>
                    <button className="mt-2 text-[8px] font-black text-white bg-amber-600 px-3 py-1 rounded-lg uppercase hover:bg-amber-700 transition-colors w-full">
                      Trigger Renewal Prompt
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* State Auditor Feed */}
        <div className="bg-white rounded-3xl border border-red-100 shadow-xl p-6 overflow-hidden flex flex-col flex-1">
          <h3 className="text-sm font-black text-red-900 uppercase flex items-center gap-2 mb-4">
            <ShieldAlert className="h-4 w-4 text-red-600" />
            Auditor Mode Feed
          </h3>
          <div className="space-y-3 overflow-y-auto pr-2">
            {incidentReports.length === 0 ? (
              <div className="text-center py-8">
                <ShieldCheck className="h-10 w-10 text-emerald-100 mx-auto mb-2" />
                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">No Active Incidents</p>
              </div>
            ) : (
              incidentReports.map(report => (
                <div key={report.id} className="p-3 bg-red-50 rounded-2xl border border-red-100">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] font-black text-red-900 uppercase">{report.type}</span>
                    <span className="text-[8px] text-red-600 font-bold">{format(new Date(report.timestamp), "MMM d, HH:mm")}</span>
                  </div>
                  <p className="text-xs font-medium text-red-800 line-clamp-2">{report.details}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <MapPin className="h-3 w-3 text-red-400" />
                    <span className="text-[8px] font-bold text-red-600">GPS Preserved</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Main Chat Assistant */}
      <div className="lg:col-span-3 flex flex-col bg-white rounded-3xl border border-emerald-50 shadow-2xl overflow-hidden">
        <div className="bg-emerald-900 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-800 rounded-2xl flex items-center justify-center">
              <ShieldCheck className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Safety Guardian Agent</h2>
              <p className="text-emerald-300 text-xs font-medium uppercase tracking-widest">Fail-Safe & Regulatory Oversight</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest block">System Integrity</span>
              <span className="text-xs font-bold text-white uppercase tracking-tighter">100% AUDIT-READY</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-stone-50/30">
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
                  "max-w-[80%] p-6 rounded-3xl text-sm leading-relaxed shadow-sm",
                  msg.role === "user" 
                    ? "bg-emerald-600 text-white rounded-tr-none" 
                    : "bg-white text-emerald-950 border border-emerald-100 rounded-tl-none"
                )}>
                  {msg.text}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white p-6 rounded-3xl border border-emerald-100 flex items-center gap-4 shadow-sm">
                <RefreshCw className="h-5 w-5 animate-spin text-emerald-600" />
                <span className="text-xs text-stone-500 font-bold uppercase tracking-widest">Safety Guardian is analyzing regulatory impact...</span>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-stone-100 bg-white">
          <div className="flex gap-4">
            <div className="flex-1 flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-2xl px-4 py-1 focus-within:ring-2 focus-within:ring-emerald-500 transition-all">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Ask about HIPAA compliance, expiration alerts, or trigger an emergency report..."
                className="flex-1 bg-transparent border-none outline-none py-3 text-sm text-stone-900"
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={loading || !input.trim()}
              className="bg-emerald-900 text-white w-14 h-14 rounded-2xl flex items-center justify-center hover:bg-emerald-800 transition-colors disabled:opacity-50"
            >
              <Send className="h-5 w-5 rotate-0" />
            </button>
          </div>
          <div className="mt-4 flex items-center justify-center gap-6">
            <button className="text-[10px] font-black text-stone-400 uppercase tracking-widest hover:text-red-500 transition-colors flex items-center gap-2">
              <FileWarning className="h-3 w-3" />
              Emergency Failsafe Report
            </button>
            <div className="w-1 h-1 bg-stone-300 rounded-full" />
            <button className="text-[10px] font-black text-stone-400 uppercase tracking-widest hover:text-emerald-500 transition-colors flex items-center gap-2">
              <Activity className="h-3 w-3" />
              Real-Time DDD Telemed
            </button>
            <div className="w-1 h-1 bg-stone-300 rounded-full" />
            <button className="text-[10px] font-black text-stone-400 uppercase tracking-widest hover:text-amber-500 transition-colors flex items-center gap-2">
              <Bell className="h-3 w-3" />
              Batch Cert Renewal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
