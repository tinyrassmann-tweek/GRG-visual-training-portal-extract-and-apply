import React, { useState } from "react";
import { User } from "firebase/auth";
import { collection, addDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import { UserProfile } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { 
  AlertTriangle, 
  ShieldAlert, 
  MapPin, 
  FileText, 
  Activity, 
  Send, 
  X,
  CheckCircle2,
  Lock,
  RefreshCw,
  ShieldCheck,
  ChevronRight
} from "lucide-react";
import { cn } from "../lib/utils";

interface IncidentIntakeProps {
  user: User | null;
  profile: UserProfile | null;
  onClose: () => void;
}

export const IncidentIntake: React.FC<IncidentIntakeProps> = ({ user, profile, onClose }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [incidentType, setIncidentType] = useState<"emergency" | "safety_breach" | "unusual_circumstance" | "compliance_gap">("emergency");
  const [severity, setSeverity] = useState<"low" | "medium" | "high" | "critical">("critical");
  const [details, setDetails] = useState("");
  const [witnesses, setWitnesses] = useState("");
  const [locationPreserved, setLocationPreserved] = useState(false);
  const [gpsData, setGpsData] = useState<{ lat: number, lng: number } | null>(null);

  const captureLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setGpsData({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationPreserved(true);
      });
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const incidentRef = collection(db, "incidentReports");
      const timestamp = new Date().toISOString();
      const reportData = {
        type: incidentType,
        severity,
        details,
        witnesses: witnesses.split(",").map(s => s.trim()).filter(s => s),
        timestamp,
        userId: user?.uid,
        userEmail: user?.email,
        location: gpsData,
        reportedToState: severity === "critical" || severity === "high",
        resolved: false
      };

      await addDoc(incidentRef, reportData);

      // Trigger server-side failsafe
      await fetch("/api/incident/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reportData)
      });

      setStep(3);
    } catch (error) {
      console.error("Incident Report Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-red-950/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl relative"
      >
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 text-stone-400 hover:text-stone-600 transition-colors"
        >
          <X className="h-6 w-6" />
        </button>

        <div className={cn(
          "p-12 h-full",
          step === 3 ? "bg-emerald-50" : ""
        )}>
          {step === 1 && (
            <div className="space-y-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="bg-red-100 p-4 rounded-3xl">
                  <ShieldAlert className="h-8 w-8 text-red-600" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-red-950">Safety Failsafe: Intake</h2>
                  <p className="text-stone-500 text-sm italic">Genesis OS mandatory state compliance protocol.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-stone-400 uppercase tracking-widest">Incident Category</label>
                  <select 
                    value={incidentType}
                    onChange={(e) => setIncidentType(e.target.value as any)}
                    className="w-full bg-stone-50 border border-stone-200 p-4 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-red-500 outline-none"
                  >
                    <option value="emergency">Life-Threatening Emergency</option>
                    <option value="safety_breach">Safety / Geofence Breach</option>
                    <option value="unusual_circumstance">Unusual Circumstance</option>
                    <option value="compliance_gap">Compliance Critical Gap</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-stone-400 uppercase tracking-widest">Acuity Level</label>
                  <select 
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as any)}
                    className="w-full bg-stone-50 border border-stone-200 p-4 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-red-500 outline-none"
                  >
                    <option value="low">LOW: Actionable</option>
                    <option value="medium">MEDIUM: Urgent</option>
                    <option value="high">HIGH: State Required</option>
                    <option value="critical">CRITICAL: Immediate Failsafe</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <button 
                  onClick={captureLocation}
                  className={cn(
                    "w-full flex items-center justify-between p-6 rounded-3xl border transition-all",
                    locationPreserved 
                      ? "bg-emerald-50 border-emerald-200 text-emerald-700" 
                      : "bg-red-50 border-red-100 text-red-700 hover:bg-red-100"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <MapPin className="h-6 w-6" />
                    <span className="font-bold">Preserve GPS Digital Signature</span>
                  </div>
                  {locationPreserved ? <CheckCircle2 className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                </button>
                <p className="text-[10px] text-stone-400 text-center uppercase tracking-widest leading-relaxed">
                  Compliance Mandate: GPS location is the primary defense against negligence claims.
                </p>
              </div>

              <button 
                onClick={() => setStep(2)}
                disabled={!locationPreserved}
                className="w-full bg-red-950 text-white py-5 rounded-2xl font-bold text-lg hover:bg-red-900 transition-all disabled:opacity-50 shadow-xl shadow-red-950/20"
              >
                Proceed to Documentation
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="bg-red-100 p-4 rounded-3xl">
                  <FileText className="h-8 w-8 text-red-600" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-red-950">Detailed Narrative</h2>
                  <p className="text-stone-500 text-sm italic">Provide zero-bias, objective facts only.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-stone-400 uppercase tracking-widest">Circumstances & Details</label>
                  <textarea 
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="Who, what, when, where. Describe precisely what occurred..."
                    className="w-full h-40 bg-stone-50 border border-stone-200 p-6 rounded-3xl text-sm font-medium focus:ring-2 focus:ring-red-500 outline-none resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-stone-400 uppercase tracking-widest">Witnesses (Comma separated)</label>
                  <input 
                    type="text"
                    value={witnesses}
                    onChange={(e) => setWitnesses(e.target.value)}
                    placeholder="Staff Initial, Guardian Name, etc."
                    className="w-full bg-stone-50 border border-stone-200 p-4 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setStep(1)}
                  className="bg-stone-100 text-stone-600 py-5 rounded-2xl font-bold hover:bg-stone-200 transition-all"
                >
                  Back
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={loading || !details.trim()}
                  className="bg-red-600 text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-red-700 transition-all shadow-xl shadow-red-600/20"
                >
                  {loading ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                  Finalize & Notify Auditor
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center space-y-8 flex flex-col items-center justify-center py-20 animate-in fade-in zoom-in">
              <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                <ShieldCheck className="h-12 w-12 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-emerald-950 mb-4">Fail-Safe Activated</h2>
                <p className="text-emerald-700 text-lg max-w-md mx-auto leading-relaxed">
                  Your report has been preserved with a GPS-validated timestamp. The State Auditor and Executive Branch have been alerted for high-priority response.
                </p>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm flex items-center gap-4">
                <Lock className="h-5 w-5 text-emerald-600" />
                <span className="text-xs font-bold text-emerald-900 uppercase tracking-widest">Document Secured for Audit Review</span>
              </div>
              <button 
                onClick={onClose}
                className="bg-emerald-900 text-white px-12 py-4 rounded-2xl font-bold hover:bg-emerald-800 transition-all"
              >
                Return to Dashboard
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
