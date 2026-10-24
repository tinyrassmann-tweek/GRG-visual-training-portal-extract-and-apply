import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "../firebase";
import { UserRole, UserProfile } from "../types";
import { motion } from "motion/react";
import { UserPlus, Mail, Lock, User, AlertCircle, Key, ShieldCheck } from "lucide-react";
import { cn } from "../lib/utils";
import { useVoice } from "../lib/voice";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [licensingNumber, setLicensingNumber] = useState("");
  const [role, setRole] = useState<UserRole>(UserRole.PATIENT);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { speak } = useVoice();

  useEffect(() => {
    // Proactive speech removed per user request
  }, []);

  const validateLicensing = async (license: string) => {
    const q = query(
      collection(db, "licensing"), 
      where("licensingNumber", "==", license),
      where("active", "==", true)
    );
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // Validate licensing number first
      const isValidLicense = await validateLicensing(licensingNumber);
      if (!isValidLicense) {
        const msg = "Invalid or inactive licensing number. Please contact ThinkTank Solutions AI.";
        setError(msg);
        // speak(msg);
        setLoading(false);
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      await updateProfile(user, { displayName });
      
      const profile: UserProfile = {
        uid: user.uid,
        email: user.email || "",
        displayName,
        role,
        createdAt: new Date().toISOString(),
        licensingNumber,
        accessType: "client",
        onboardingProgress: {
          trainingCompleted: false,
          fingerprintsDone: false,
          npiVerified: false,
          backgroundCheck: false,
          sopReviewed: false,
          passwordChanged: false,
        }
      };
      
      await setDoc(doc(db, "users", user.uid), profile);
      speak("Account created successfully. Welcome to the ecosystem. Please log in to continue.");
      navigate("/login");
    } catch (err: any) {
      setError(err.message);
      speak("Signup failed. " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-12 bg-stone-50">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-emerald-100 w-full max-w-md relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600"></div>

        <div className="text-center mb-8">
          <div className="bg-emerald-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
            <UserPlus className="h-10 w-10 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-bold text-emerald-900 tracking-tight">Request Access</h1>
          <p className="text-stone-500 text-sm mt-2 font-medium">Join the GRG Ecosystem</p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-red-50 text-red-700 p-4 rounded-2xl mb-6 flex items-start gap-3 text-sm border border-red-100"
          >
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleSignup} className="space-y-5">
          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-400 uppercase tracking-widest ml-1">Full Name</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400 group-focus-within:text-emerald-500 transition-colors" />
              <input
                type="text"
                placeholder="John Doe"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-stone-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all bg-stone-50/50"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-400 uppercase tracking-widest ml-1">Work Email</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400 group-focus-within:text-emerald-500 transition-colors" />
              <input
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-stone-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all bg-stone-50/50"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-400 uppercase tracking-widest ml-1">Licensing Number</label>
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

          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-400 uppercase tracking-widest ml-1">Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400 group-focus-within:text-emerald-500 transition-colors" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-stone-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all bg-stone-50/50"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-400 uppercase tracking-widest ml-1">I am a...</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole(UserRole.PATIENT)}
                className={cn(
                  "py-3 rounded-2xl text-sm font-bold border transition-all",
                  role === UserRole.PATIENT ? "bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-900/20" : "bg-white text-stone-500 border-stone-200 hover:bg-stone-50"
                )}
              >
                Patient
              </button>
              <button
                type="button"
                onClick={() => setRole(UserRole.STAFF)}
                className={cn(
                  "py-3 rounded-2xl text-sm font-bold border transition-all",
                  role === UserRole.STAFF ? "bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-900/20" : "bg-white text-stone-500 border-stone-200 hover:bg-stone-50"
                )}
              >
                Staff
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all disabled:opacity-50 shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 group"
          >
            {loading ? (
              <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <span>Request Access</span>
                <ShieldCheck className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <p className="text-center mt-8 text-sm text-stone-500">
          Already have an account?{" "}
          <Link to="/login" className="text-emerald-600 font-bold hover:underline">
            Login here
          </Link>
        </p>

        <div className="mt-6 pt-6 border-t border-stone-100 text-center">
          <p className="text-xs text-stone-400">
            Looking for a position at GRG?{" "}
            <Link to="/apply" className="text-emerald-600 font-bold hover:underline">
              Apply here
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
