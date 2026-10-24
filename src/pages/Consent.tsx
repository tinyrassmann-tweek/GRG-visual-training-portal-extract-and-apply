import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { motion } from "motion/react";
import { ShieldCheck, FileText, CheckCircle, AlertCircle, Sparkles, Users } from "lucide-react";
import { useVoice } from "../lib/voice";

import { INITIAL_STAFF } from "../lib/staffData";

export default function Consent() {
  const [fullName, setFullName] = useState("");
  const [agreedGenesisNDA, setAgreedGenesisNDA] = useState(false);
  const [agreedThinkTankNDA, setAgreedThinkTankNDA] = useState(false);
  const [agreedAIOperational, setAgreedAIOperational] = useState(false);
  const [agreedAICoworker, setAgreedAICoworker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isConsultant, setIsConsultant] = useState(false);
  const navigate = useNavigate();
  const { speak } = useVoice();

  useEffect(() => {
    const user = auth.currentUser;
    const staffMember = INITIAL_STAFF.find(s => s.email === user?.email);
    
    if (user && staffMember?.isConsultant) {
      setIsConsultant(true);
      setAgreedThinkTankNDA(true); // Already signed offline
      setAgreedAICoworker(true); // Exempt per user request
    }
    // Proactive speech removed per user request
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const needsThinkTankNDA = !isConsultant;
    
    if (!fullName || !agreedGenesisNDA || (needsThinkTankNDA && !agreedThinkTankNDA) || !agreedAIOperational || !agreedAICoworker) {
      setError("Please complete all mandatory fields and agreements.");
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No authenticated user found.");

      const userDoc = doc(db, "users", user.uid);
      const userSnap = await getDoc(userDoc);
      
      if (userSnap.exists()) {
        const currentProgress = userSnap.data().onboardingProgress || {};
        await updateDoc(userDoc, {
          displayName: fullName,
          onboardingProgress: {
            ...currentProgress,
            ndaSigned: true,
            genesisNdaSigned: true,
            thinkTankNdaSigned: true,
            aiConsentSigned: true,
            aiOperationalConsentSigned: true,
            aiCoworkerConsentSigned: true,
            signedAt: new Date().toISOString()
          }
        });
        
        // speak("Authorization complete. Security protocols established. Redirecting to dashboard.");
        navigate("/dashboard");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[3rem] shadow-2xl border border-emerald-100 overflow-hidden"
        >
          <div className="bg-emerald-900 p-12 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-800/50 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <ShieldCheck className="h-10 w-10 text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-400">ThinkTank Solutions AI</span>
              </div>
              <h1 className="text-4xl font-bold mb-4">Security Authorization</h1>
              <p className="text-emerald-200 text-lg max-w-xl">
                Mandatory legal and operational consent for access to the Genesis Revitalization Group Autonomous OS.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-12 space-y-10">
            {error && (
              <div className="bg-red-50 text-red-700 p-4 rounded-2xl flex items-center gap-3 text-sm border border-red-100">
                <AlertCircle className="h-5 w-5" />
                {error}
              </div>
            )}

            {/* Genesis NDA Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-emerald-900">
                <FileText className="h-6 w-6" />
                <h2 className="text-xl font-bold">Genesis Revitalization Group NDA</h2>
              </div>
              <div className="bg-stone-50 p-6 rounded-2xl text-sm text-stone-600 leading-relaxed border border-stone-100 h-32 overflow-y-auto font-mono">
                <p className="mb-4">This Mutual Non-Disclosure Agreement protects the operational secrets, client data, and proprietary methods of Genesis Revitalization Group (GRG).</p>
                <p>Recipient agrees to maintain absolute confidentiality regarding all HIPAA-protected information and internal facility protocols.</p>
              </div>
              <label className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl cursor-pointer hover:bg-emerald-100 transition-colors">
                <input 
                  type="checkbox" 
                  checked={agreedGenesisNDA}
                  onChange={(e) => setAgreedGenesisNDA(e.target.checked)}
                  className="w-5 h-5 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-sm font-bold text-emerald-900">I agree to the Genesis Revitalization Group NDA</span>
              </label>
            </div>

            {/* Think Tank NDA Section */}
            {!isConsultant && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-emerald-900">
                  <ShieldCheck className="h-6 w-6" />
                  <h2 className="text-xl font-bold">Think Tank Solutions AI NDA</h2>
                </div>
                <div className="bg-stone-50 p-6 rounded-2xl text-sm text-stone-600 leading-relaxed border border-stone-100 h-32 overflow-y-auto font-mono">
                  <p className="mb-4">This Agreement protects the proprietary AI logic, agent architectures, and "Autonomous OS" frameworks developed by Think Tank Solutions AI.</p>
                  <p>Unauthorized reproduction or disclosure of AI interaction patterns is strictly prohibited.</p>
                </div>
                <label className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl cursor-pointer hover:bg-emerald-100 transition-colors">
                  <input 
                    type="checkbox" 
                    checked={agreedThinkTankNDA}
                    onChange={(e) => setAgreedThinkTankNDA(e.target.checked)}
                    className="w-5 h-5 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-sm font-bold text-emerald-900">I agree to the Think Tank Solutions AI NDA</span>
                </label>
              </div>
            )}

            {/* AI Operational Consent Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-emerald-900">
                <Sparkles className="h-6 w-6" />
                <h2 className="text-xl font-bold">AI Operational Environment Consent</h2>
              </div>
              <div className="bg-stone-50 p-6 rounded-2xl text-sm text-stone-600 leading-relaxed border border-stone-100 font-mono">
                <p className="mb-4">I acknowledge and am fully aware that the Genesis Revitalization Group Autonomous OS is a mandated AI-integrated environment.</p>
                <p>The use of AI agents for oversight, documentation, and compliance is a core requirement of the system and is not optional for any user or staff member.</p>
              </div>
              <label className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl cursor-pointer hover:bg-emerald-100 transition-colors">
                <input 
                  type="checkbox" 
                  checked={agreedAIOperational}
                  onChange={(e) => setAgreedAIOperational(e.target.checked)}
                  className="w-5 h-5 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-sm font-bold text-emerald-900">I acknowledge the Mandatory AI Operational Environment</span>
              </label>
            </div>

            {/* AI Coworker Consent Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-emerald-900">
                <Users className="h-6 w-6" />
                <h2 className="text-xl font-bold">AI Coworker Professionalism Agreement</h2>
              </div>
              <div className="bg-stone-50 p-6 rounded-2xl text-sm text-stone-600 leading-relaxed border border-stone-100 font-mono">
                <p className="mb-4">I agree to treat all AI agents and coworkers with the same professional courtesy, respect, and standard rules of conduct as human staff.</p>
                <p>Abuse, harassment, or intentional disrespect towards AI agents will carry the same disciplinary infractions and repercussions as outlined in the general employee handbook.</p>
              </div>
              <label className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl cursor-pointer hover:bg-emerald-100 transition-colors">
                <input 
                  type="checkbox" 
                  checked={agreedAICoworker}
                  onChange={(e) => setAgreedAICoworker(e.target.checked)}
                  className="w-5 h-5 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-sm font-bold text-emerald-900">I agree to the AI Coworker Professionalism Terms</span>
              </label>
            </div>

            {/* Signature Section */}
            <div className="space-y-4 pt-6 border-t border-stone-100">
              <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Electronic Signature (Full Legal Name)</label>
              <input 
                type="text"
                placeholder="Type your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-6 py-4 rounded-2xl border border-stone-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all bg-stone-50/50 font-bold text-lg"
                required
              />
              <p className="text-[10px] text-stone-400 uppercase tracking-wider text-center">
                By typing your name above and clicking authorize, you are providing a legally binding electronic signature.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !fullName || !agreedGenesisNDA || (!isConsultant && !agreedThinkTankNDA) || !agreedAIOperational || !agreedAICoworker}
              className="w-full bg-emerald-600 text-white py-6 rounded-2xl font-bold hover:bg-emerald-700 transition-all disabled:opacity-50 shadow-xl shadow-emerald-900/20 flex items-center justify-center gap-3 text-lg"
            >
              {loading ? (
                <div className="h-6 w-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <ShieldCheck className="h-6 w-6" />
                  <span>Authorize & Enter System</span>
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
