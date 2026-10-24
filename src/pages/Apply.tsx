import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";
import { motion } from "motion/react";
import { UserPlus, Mail, User, Briefcase, Key, CheckCircle, AlertCircle } from "lucide-react";
import { useVoice } from "../lib/voice";
import { LoadingOverlay } from "../components/LoadingOverlay";

export default function Apply() {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [position, setPosition] = useState("");
  const [licensingNumber, setLicensingNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { speak } = useVoice();

  useEffect(() => {
    // Proactive speech removed per user request
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await addDoc(collection(db, "applications"), {
        email,
        fullName,
        position,
        licensingNumber,
        status: "pending",
        submittedAt: new Date().toISOString()
      });

      setSubmitted(true);
      // speak("Application submitted successfully. Our hiring agents have been alerted and will review your credentials.");
    } catch (err: any) {
      setError(err.message);
      // speak("Submission failed. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-12 rounded-[3rem] shadow-2xl border border-emerald-100 text-center max-w-md"
        >
          <div className="bg-emerald-100 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-bold text-emerald-900 mb-4">Interest Logged</h1>
          <p className="text-stone-500 mb-8 leading-relaxed">
            Your application for <strong>{position}</strong> has been securely transmitted to the GRG Hiring AI Agent. You will be contacted via email if your credentials match our excellence standards.
          </p>
          <button 
            onClick={() => navigate("/login")}
            className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all"
          >
            Return to Login
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4 py-12">
      {loading && <LoadingOverlay message="Transmitting Application to GRG Hiring AI..." />}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-10 rounded-[3rem] shadow-2xl border border-emerald-100 w-full max-w-xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
        
        <div className="text-center mb-10">
          <div className="bg-emerald-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <UserPlus className="h-8 w-8 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-bold text-emerald-900 leading-none">Join the Mission</h1>
          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em] mt-3">Excellence as a Standard</p>
          <p className="text-stone-400 text-sm mt-4 max-w-sm mx-auto leading-relaxed">
            Genesis Revitalization Group (GRG) utilizes merit-based AI auditing to ensure zero bias in our selection process. Your credentials are the only data that matters.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-2xl mb-6 flex items-center gap-3 text-sm border border-red-100">
            <AlertCircle className="h-5 w-5" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-400 uppercase tracking-widest ml-1">Full Name</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400 group-focus-within:text-emerald-500 transition-colors" />
              <input
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-stone-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all bg-stone-50/50"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-400 uppercase tracking-widest ml-1">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400 group-focus-within:text-emerald-500 transition-colors" />
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-stone-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all bg-stone-50/50"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-400 uppercase tracking-widest ml-1">Position of Interest</label>
            <div className="relative group">
              <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400 group-focus-within:text-emerald-500 transition-colors" />
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-stone-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all bg-stone-50/50 appearance-none"
                required
              >
                <option value="">Select Position</option>
                <option value="DSP">Direct Support Professional (DSP)</option>
                <option value="BCBA">BCBA</option>
                <option value="RBT">RBT</option>
                <option value="Admin">Administrative Assistant</option>
                <option value="Billing">Billing Specialist</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-emerald-600 uppercase tracking-widest ml-1">Licensing Number (CALN)</label>
            <div className="relative group">
              <Key className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-500" />
              <input
                type="text"
                placeholder="e.g. 1001"
                value={licensingNumber}
                onChange={(e) => setLicensingNumber(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-emerald-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all bg-emerald-50/30"
                required
              />
            </div>
          </div>

          <div className="md:col-span-2 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-bold hover:bg-emerald-700 transition-all disabled:opacity-50 shadow-xl shadow-emerald-900/20 flex items-center justify-center gap-3"
            >
              {loading ? (
                <div className="h-6 w-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <CheckCircle className="h-6 w-6" />
                  <span>Submit Initial Application</span>
                </>
              )}
            </button>
            <p className="text-center text-[10px] text-stone-400 uppercase tracking-widest mt-6">
              ThinkTank Solutions AI Security: All submissions are verified against client licensing records.
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
