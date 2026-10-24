import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword } from "firebase/auth";
import { collection, addDoc, query, where, getDocs, doc, updateDoc, getDoc, setDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "../firebase";
import { motion, AnimatePresence } from "motion/react";
import { LogIn, Mail, Lock, Chrome, AlertCircle, ShieldCheck, Key, Volume2 } from "lucide-react";
import { useVoice } from "../lib/voice";
import { INITIAL_STAFF, TEMPORARY_PASSWORD, CLIENT_ACCESS_LICENSE, GRG_ACCESS_LICENSE } from "../lib/staffData";
import { LoadingOverlay } from "../components/LoadingOverlay";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [licensingNumber, setLicensingNumber] = useState("");
  const [showLicensing, setShowLicensing] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { speak } = useVoice();

  useEffect(() => {
    // Proactive speech removed per user request
  }, []);

  const logAccess = async (userEmail: string, status: "success" | "failure" | "flagged", details: string) => {
    try {
      await addDoc(collection(db, "accessLogs"), {
        email: userEmail,
        action: "login_attempt",
        timestamp: new Date().toISOString(),
        status,
        details,
        userAgent: navigator.userAgent,
      });
    } catch (err) {
      console.error("Logging error:", err);
    }
  };

  const isThinkTankEmail = (email: string) => {
    const ttDomains = ["thinktanksolutionsai.com", "thinktanksolutionsai.co.site"];
    const ttEmails = ["tiny.rassmann@gmail.com", "tiny.rasman@gmail.com"];
    const domain = email.split("@")[1];
    return ttDomains.includes(domain) || ttEmails.includes(email);
  };

  const validateLicensing = async (email: string, license: string) => {
    if (isThinkTankEmail(email)) return true;
    if (license === CLIENT_ACCESS_LICENSE || license === GRG_ACCESS_LICENSE) return true; // Built-in defaults
    
    const q = query(
      collection(db, "licensing"), 
      where("licensingNumber", "==", license),
      where("active", "==", true)
    );
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return false;
    }

    const licenseData = querySnapshot.docs[0].data();
    const domain = email.split("@")[1];
    
    // If it's a Gmail/Google address and not ThinkTank, it's flagged but allowed for 1 day
    if (domain === "gmail.com" || domain === "google.com") {
      return "flagged";
    }

    // Check if domain is authorized for this license
    if (licenseData.authorizedDomains && !licenseData.authorizedDomains.includes(domain)) {
      return false;
    }

    return true;
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1. Check if we need licensing number
      const isStaffEmail = INITIAL_STAFF.some(s => s.email === email);
      const isTT = isThinkTankEmail(email);

      if (!isTT && !isStaffEmail && !licensingNumber) {
        setShowLicensing(true);
        speak("Please provide your client access licensing number to proceed.");
        setLoading(false);
        return;
      }

      // 2. Validate Licensing
      const isSpecialAccount = isTT || email === "tcooper@genesisrevitalization.com" || email === "mrassmann@genesisrevitalization.com" || email === "tiny.rassmann@gmail.com";
      
      if (!isSpecialAccount) {
        if (licensingNumber !== CLIENT_ACCESS_LICENSE) {
          const licenseStatus = await validateLicensing(email, licensingNumber);
          if (licenseStatus === false) {
            const msg = "Invalid licensing number or unauthorized domain.";
            setError(msg);
            speak(msg);
            await logAccess(email, "failure", msg);
            setLoading(false);
            return;
          }
        }
      }

      // 3. Authenticate or Create Staff/Applicant Account
      let userCredential;
      try {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } catch (authErr: any) {
        // If user doesn't exist and it's a staff/applicant email or special account with temp password, create it
        const canAutoCreate = (isStaffEmail || isTT) && password === TEMPORARY_PASSWORD;
        
        if (authErr.code === "auth/user-not-found" || authErr.code === "auth/invalid-credential" || authErr.code === "auth/invalid-email") {
          if (canAutoCreate) {
            userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const staffInfo = INITIAL_STAFF.find(s => s.email === email);
            
            // Initialize User Profile
            await setDoc(doc(db, "users", userCredential.user.uid), {
              uid: userCredential.user.uid,
              email: email,
              displayName: staffInfo?.name || (isTT ? "Administrator" : email.split('@')[0]),
              role: isTT ? "admin" : (staffInfo?.role || "staff"),
              title: staffInfo?.title || (isTT ? "System Administrator" : "Staff"),
              createdAt: new Date().toISOString(),
              accessType: isTT ? "internal" : "client",
              licensingNumber: licensingNumber || CLIENT_ACCESS_LICENSE,
              onboardingProgress: {
                trainingCompleted: false,
                passwordChanged: false,
                ndaSigned: false,
                genesisNdaSigned: true, // Auto-signed for special accounts to speed up demo
                thinkTankNdaSigned: true,
                aiConsentSigned: true,
                aiOperationalConsentSigned: true,
                aiCoworkerConsentSigned: true
              }
            });
          } else {
            throw authErr;
          }
        } else {
          throw authErr;
        }
      }

      const user = userCredential.user;

      // 4. Update Profile
      const userDoc = doc(db, "users", user.uid);
      const userSnap = await getDoc(userDoc);
      
      const accessType = isThinkTankEmail(email) ? "internal" : (licensingNumber === CLIENT_ACCESS_LICENSE ? "client" : "restricted");
      
      const updateData: any = {
        lastLoginAt: new Date().toISOString(),
        accessType,
        licensingNumber: licensingNumber || null,
      };

      if (userSnap.exists()) {
        await updateDoc(userDoc, updateData);
        const profile = userSnap.data();
        
        // Check for mandatory signatures
        if (!profile.onboardingProgress?.genesisNdaSigned || !profile.onboardingProgress?.aiOperationalConsentSigned || !profile.onboardingProgress?.aiCoworkerConsentSigned) {
          speak("Welcome. Before proceeding, you must review and sign the mandatory NDA and AI Consent forms for system security.");
          navigate("/consent");
        } else if (profile.onboardingProgress && !profile.onboardingProgress.passwordChanged && password === TEMPORARY_PASSWORD) {
          speak("Welcome. As this is your first login, please change your password immediately for security.");
          navigate("/dashboard?changePassword=true");
        } else {
          speak("Login successful. Welcome back.");
          navigate("/dashboard");
        }
      } else if (isStaffEmail) {
        // Fallback for newly created staff
        speak("Welcome to the Genesis Platform. Please sign the mandatory agreements to begin.");
        navigate("/consent");
      }

      await logAccess(email, "success", `Login successful via email. Access: ${accessType}`);
      
    } catch (err: any) {
      setError(err.message);
      speak("Login failed. " + err.message);
      await logAccess(email, "failure", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const email = user.email || "";

      if (isThinkTankEmail(email)) {
        speak("Welcome back, ThinkTank Administrator.");
        navigate("/dashboard");
        await logAccess(email, "success", "ThinkTank Admin Google Login");
        return;
      }

      // Use default CALN if none provided (1001)
      const activeLicense = licensingNumber || CLIENT_ACCESS_LICENSE;

      const licenseStatus = await validateLicensing(email, activeLicense);
      if (!licenseStatus) {
        setError("Invalid licensing number for this Google account.");
        speak("Access denied. Invalid licensing number.");
        await logAccess(email, "failure", `Invalid CALN (${activeLicense}) for Google Login`);
        return;
      }

      speak("Google access authorized. Welcome to the Genesis Platform.");
      navigate("/dashboard");
      await logAccess(email, "flagged", `Google Login with CALN ${activeLicense} - Authorized Access`);

    } catch (err: any) {
      setError(err.message);
      speak("Google authentication failed.");
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-12 bg-stone-50 relative">
      {loading && <LoadingOverlay message="Authenticating with Genesis Secure Node..." />}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-emerald-100 w-full max-w-md relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600"></div>
        
        <div className="text-center mb-8">
          <div className="bg-emerald-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
            <ShieldCheck className="h-10 w-10 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-bold text-emerald-900 tracking-tight">Secure Access</h1>
          <p className="text-stone-500 text-sm mt-2 font-medium">ThinkTank Solutions AI Licensing Portal</p>
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

        <form onSubmit={handleEmailLogin} className="space-y-5">
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
            <label className="text-xs font-bold text-stone-400 uppercase tracking-widest ml-1">Secure Password</label>
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

          <AnimatePresence>
            {(showLicensing || licensingNumber) && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-1 overflow-hidden"
              >
                <label className="text-xs font-bold text-emerald-600 uppercase tracking-widest ml-1">Client Access Licensing Number</label>
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
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all disabled:opacity-50 shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 group"
          >
            {loading ? (
              <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <span>Authorize Access</span>
                <LogIn className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="relative my-10">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-stone-100"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
            <span className="px-4 bg-white text-stone-400">Verification Methods</span>
          </div>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full bg-white border border-stone-200 text-stone-700 py-4 rounded-2xl font-bold hover:bg-stone-50 transition-all flex items-center justify-center gap-3 shadow-sm hover:shadow-md"
        >
          <Chrome className="h-5 w-5 text-emerald-600" />
          <span>Verify with Google</span>
        </button>

        <div className="mt-10 p-4 bg-stone-50 rounded-2xl border border-stone-100">
          <p className="text-center text-xs text-stone-500 leading-relaxed">
            Access is strictly monitored. Unauthorized attempts are logged and reported to ThinkTank Solutions AI Security.
          </p>
        </div>

        <p className="text-center mt-8 text-sm text-stone-500">
          New client?{" "}
          <Link to="/signup" className="text-emerald-600 font-bold hover:underline">
            Request Licensing
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
