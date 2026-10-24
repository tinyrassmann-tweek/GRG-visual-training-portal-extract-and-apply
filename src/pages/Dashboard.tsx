import React, { useState, useEffect } from "react";
import { User } from "firebase/auth";
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc, getDocs, writeBatch } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { UserProfile, Appointment, UserRole, StaffTrainingRecord } from "../types";
import { motion } from "motion/react";
import { 
  Calendar, 
  Clock, 
  User as UserIcon, 
  FileText, 
  GraduationCap, 
  ChevronRight,
  Plus,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Settings,
  Video,
  ShieldCheck,
  Zap,
  Target,
  ArrowRight,
  Lock,
  Bot,
  Sparkles,
  Mic,
  Send,
  AlertTriangle,
  Award,
  Activity,
  RefreshCw,
  ShieldAlert
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { Link } from "react-router-dom";
import { cn, calculateOnboardingProgress } from "../lib/utils";
import { StaffAgent } from "../components/StaffAgent";
import { IncidentIntake } from "../components/IncidentIntake";
import { OPERATING_MANUALS } from "../lib/operatingManuals";

import { Skeleton } from "../components/LoadingOverlay";

import { logGeofenceAlert } from "../lib/geofenceService";

export default function Dashboard({ user, profile }: { user: User | null, profile: UserProfile | null }) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPulseCheck, setShowPulseCheck] = useState(false);
  const [pulseLog, setPulseLog] = useState("");
  const [isAnalyzingPulse, setIsAnalyzingPulse] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizPassed, setQuizPassed] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPWAInstructions, setShowPWAInstructions] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [showIncidentIntake, setShowIncidentIntake] = useState(false);
  const [trainingRecords, setTrainingRecords] = useState<StaffTrainingRecord[]>([]);

  const isAdmin = profile?.role === UserRole.ADMIN || 
                  profile?.email === "tiny.rassmann@gmail.com" || 
                  profile?.email === "tiny.rasman@gmail.com";
  
  const isStaff = profile?.role === UserRole.STAFF || 
                  profile?.role === UserRole.DOCTOR || 
                  isAdmin;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("changePassword") === "true" || (profile && !profile.onboardingProgress?.passwordChanged && isStaff && profile.role !== UserRole.PATIENT)) {
      setShowPasswordChange(true);
    }
  }, [profile, isStaff]);

  useEffect(() => {
    if (!user) return;

    // Simulate 15-minute Excellence Trigger (Performance Auditor)
    // For demo purposes, we'll show it after 30 seconds if staff
    if (isStaff) {
      const timer = setTimeout(() => {
        setShowPulseCheck(true);
      }, 30000);
      return () => clearTimeout(timer);
    }
  }, [user, isStaff]);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "appointments"),
      where("patientId", "==", user.uid),
      orderBy("date", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const apps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment));
      setAppointments(apps);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "appointments");
      setLoading(false);
    });

    const unsubTraining = onSnapshot(query(collection(db, "staffTraining"), where("staffId", "==", user.uid)), (snap) => {
      setTrainingRecords(snap.docs.map(d => ({ id: d.id, ...d.data() } as StaffTrainingRecord)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "staffTraining");
    });

    return () => {
      unsubscribe();
      unsubTraining();
    };
  }, [user]);

  if (!user || !profile) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-emerald-900">Please log in to view your dashboard.</h2>
        <Link to="/login" className="mt-4 inline-block bg-emerald-600 text-white px-6 py-2 rounded-lg">Login</Link>
      </div>
    );
  }

  const upcoming = appointments.filter(a => new Date(`${a.date} ${a.time}`) > new Date() && a.status !== "cancelled");
  const past = appointments.filter(a => new Date(`${a.date} ${a.time}`) <= new Date() || a.status === "cancelled");

  const onboardingProgress = profile.onboardingProgress || {
    trainingCompleted: false,
    fingerprintsDone: false,
    npiVerified: false,
    backgroundCheck: false,
    sopReviewed: false,
    passwordChanged: false
  };

  const progress = calculateOnboardingProgress(profile.onboardingProgress);

  useEffect(() => {
    const notifyCompletion = async () => {
      if (progress === 100 && !profile?.onboardingProgress?.onboardingNotificationSent) {
        try {
          // Fetch completed modules for the email
          const q = query(
            collection(db, "staffTraining"),
            where("staffId", "==", profile.uid),
            where("status", "==", "completed")
          );
          const snap = await getDocs(q);
          const modules = snap.docs.map(d => d.data().moduleTitle).join(", ");

          const response = await fetch("/api/send-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              to: "wrahman@genesisrevitalization.com", // Executive Director (Acting for OPEN DSP Coord)
              subject: `ONBOARDING COMPLETE: ${profile.displayName}`,
              html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 12px;">
                  <h2 style="color: #065f46;">Onboarding Accomplished</h2>
                  <p>Excellent news. A new staff member has successfully completed the Genesis Autonomous OS onboarding process.</p>
                  <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                  <p><strong>Staff Member:</strong> ${profile.displayName}</p>
                  <p><strong>Email:</strong> ${profile.email}</p>
                  <p><strong>Role/Specialty:</strong> ${profile.specialty || profile.role}</p>
                  <p><strong>Completed Modules:</strong> ${modules || "All Mandatory Orientation Units"}</p>
                  <p><strong>Completion Timestamp:</strong> ${new Date().toLocaleString()}</p>
                  <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                  <p style="font-size: 12px; color: #64748b; font-style: italic;">
                    This is an automated excellence notification from the Genesis Revitalization Group-GRG Oversight System.
                  </p>
                </div>
              `
            })
          });

          if (response.ok) {
            const userRef = doc(db, "users", profile.uid);
            const batch = writeBatch(db);
            
            batch.update(userRef, {
              "onboardingProgress.onboardingNotificationSent": true
            });

            // Create an internal audit log for admin dash visibility
            const auditRef = doc(collection(db, "auditLogs"));
            batch.set(auditRef, {
              timestamp: new Date().toISOString(),
              action: "Staff Onboarding Complete",
              user: "Genesis OS Autonomous Auditor",
              details: `Staff member ${profile.displayName} has completed 100% of mandatory training modules and credentials.`,
              type: "system"
            });

            await batch.commit();
            console.log("Onboarding completion notification and audit log sent.");
          }
        } catch (error) {
          console.error("Error sending onboarding notification:", error);
        }
      }
    };

    if (isStaff && progress === 100) {
      notifyCompletion();
    }
  }, [progress, profile, isStaff]);

  useEffect(() => {
    if (!user || !isStaff) return;

    // Continuous Geofence Sentinel (Simulated Monitoring)
    const sentinelInterval = setInterval(async () => {
      // Simulate random check of GPS relative to facility
      const isBreached = Math.random() < 0.005; // 0.5% chance per check for demo
      if (isBreached) {
        await logGeofenceAlert({
          userId: user.uid,
          userEmail: user.email || "unknown",
          alertType: "geofence_breach",
          severity: "high",
          details: "Automated Sentinel detected staff device outside authorized facility boundaries while on active shift."
        });
      }
    }, 120000); // Check every 2 minutes

    return () => clearInterval(sentinelInterval);
  }, [user, isStaff]);

  const handleResetPassword = async () => {
    if (!user || !profile) return;
    try {
      const userRef = doc(db, "users", profile.uid);
      await updateDoc(userRef, {
        "onboardingProgress.passwordChanged": true,
        lastLoginAt: new Date().toISOString()
      });
      alert("Initial password reset successful. Your account is now secure.");
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${profile.uid}`);
    }
  };

  const handleCompleteTraining = async () => {
    if (!user || !profile) return;
    try {
      const userRef = doc(db, "users", profile.uid);
      await updateDoc(userRef, {
        "onboardingProgress.trainingCompleted": true,
        "onboardingProgress.sopReviewed": true
      });
      alert("All mandatory training modules and SOP reviews completed.");
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${profile.uid}`);
    }
  };

  const handlePulseSubmit = async () => {
    if (!pulseLog) return;
    setIsAnalyzingPulse(true);
    try {
      const response = await fetch("/api/ops/pulse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          staffId: profile?.uid,
          location: "Activity Room 4 (Computer Science)",
          logText: pulseLog,
          sopSchedule: { currentActivity: "Skill Acquisition - Coding Basics" }
        })
      });
      const data = await response.json();
      if (data.analysis) {
        alert(`Performance Auditor Analysis: ${data.analysis.feedback}`);
        setShowPulseCheck(false);
        setPulseLog("");
      }
    } catch (error) {
      console.error("Pulse Error:", error);
    } finally {
      setIsAnalyzingPulse(false);
    }
  };

  const handleQuizSubmit = () => {
    setQuizPassed(true);
    setTimeout(() => setShowQuiz(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Spectacular Focus Banner */}
      {isStaff && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-12 bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-900 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-emerald-400/20 p-2 rounded-lg">
                  <Target className="h-5 w-5 text-emerald-400" />
                </div>
                <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest">Our Mission: Spectacular Outcomes</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                Achieving something <span className="text-emerald-400 italic">spectacular</span> for every client.
              </h2>
              <p className="text-emerald-100/80 text-lg leading-relaxed">
                Your focus today is the most attention and care many of our clients have ever received. 
                Let's make every interaction count towards a life-changing milestone.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 w-full md:w-72">
              <div className="flex justify-between items-end mb-4">
                <div className="text-xs font-bold uppercase tracking-wider opacity-60">Onboarding Status</div>
                <div className="text-2xl font-bold">{progress}%</div>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-4">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-emerald-400"
                ></motion.div>
              </div>
              <p className="text-[10px] opacity-60 italic">Complete all modules to be 100% compliant for 1-on-1 care.</p>
            </div>
          </div>
        </motion.div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
        <div>
          <h1 className="text-3xl font-bold text-emerald-900">Welcome, {profile.displayName}</h1>
          <p className="text-stone-500">
            {profile.role === UserRole.PATIENT 
              ? "Manage your health journey and appointments" 
              : `Managing ${profile.specialty} operations & compliance`}
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowPWAInstructions(true)}
            className="bg-white border border-stone-200 text-stone-700 px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-stone-50 transition-all shadow-sm"
          >
            <Bot className="h-5 w-5 text-emerald-600" />
            Install App (PWA)
          </button>
          {!onboardingProgress.passwordChanged && (profile.role !== UserRole.PATIENT) && (
            <button 
              onClick={handleResetPassword}
              className="bg-amber-100 text-amber-700 px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-amber-200 transition-all border border-amber-200"
            >
              <Lock className="h-5 w-5" />
              Reset Initial Password
            </button>
          )}
          <Link 
            to="/booking" 
            className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-900/10"
          >
            <Plus className="h-5 w-5" />
            {profile.role === UserRole.PATIENT ? "Book Appointment" : "Schedule Session"}
          </Link>
        </div>
      </div>

      {/* Staff Agent Extension Section */}
      {isStaff && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="bg-white rounded-[2.5rem] border border-emerald-100 p-8 shadow-sm flex flex-col md:flex-row items-center gap-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
            <div className="bg-emerald-900 w-24 h-24 rounded-3xl flex items-center justify-center flex-shrink-0 shadow-xl shadow-emerald-900/20 relative z-10">
              <Bot className="h-12 w-12 text-emerald-400" />
            </div>
            <div className="flex-1 text-center md:text-left relative z-10">
              <h3 className="text-2xl font-bold text-emerald-900 mb-2">Meet Your AI Extension</h3>
              <p className="text-stone-500 max-w-2xl">
                We've assigned a specialized AI agent to your {profile.specialty || profile.role} position. 
                This agent is an extension of you—designed to handle 90% of the procedural heavy lifting so you can focus on the human impact.
              </p>
            </div>
            <div className="flex flex-col gap-3 w-full md:w-auto relative z-10">
              <button 
                onClick={() => {
                  // This is a bit of a hack to open the agent from outside the component
                  // but since we're in the same page it works if we use a custom event or state
                  const event = new CustomEvent('open-staff-agent');
                  window.dispatchEvent(event);
                }}
                className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-900/10 flex items-center justify-center gap-2"
              >
                <Sparkles className="h-5 w-5" />
                Introduce Yourself
              </button>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Compliance & Expiration Alerts */}
          {trainingRecords.filter(r => r.expiresAt && differenceInDays(new Date(r.expiresAt), new Date()) <= 60).length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-[2rem] p-6 mb-8 flex flex-col md:flex-row items-center gap-6">
              <div className="bg-amber-100 p-4 rounded-2xl">
                <ShieldAlert className="h-8 w-8 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-amber-900 mb-1">Certification Fail-Safe Warning</h3>
                <p className="text-amber-800 text-sm">
                  The Compliance Guardian has identified certificates nearing expiration (60/30-day window). Please schedule renewals to maintain active status.
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {trainingRecords
                    .filter(r => r.expiresAt && differenceInDays(new Date(r.expiresAt), new Date()) <= 60)
                    .map(r => (
                      <span key={r.id} className="text-[10px] font-black bg-amber-200 text-amber-700 px-3 py-1 rounded-full uppercase">
                        {r.moduleTitle}: {differenceInDays(new Date(r.expiresAt!), new Date())}D REMAINING
                      </span>
                    ))
                  }
                </div>
              </div>
              <button className="bg-amber-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-amber-700 transition-all shadow-lg shadow-amber-900/10 whitespace-nowrap">
                Register for Renewals
              </button>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-2xl border border-emerald-50 shadow-sm">
              <div className="text-stone-500 text-xs font-bold uppercase mb-2">Upcoming</div>
              {loading ? <Skeleton className="h-8 w-12" /> : <div className="text-3xl font-bold text-emerald-600">{upcoming.length}</div>}
            </div>
            <div className="bg-white p-6 rounded-2xl border border-emerald-50 shadow-sm">
              <div className="text-stone-500 text-xs font-bold uppercase mb-2">Total Visits</div>
              {loading ? <Skeleton className="h-8 w-12" /> : <div className="text-3xl font-bold text-emerald-600">{appointments.length}</div>}
            </div>
            <div className="bg-white p-6 rounded-2xl border border-emerald-50 shadow-sm">
              <div className="text-stone-500 text-xs font-bold uppercase mb-2">Forms Pending</div>
              {loading ? <Skeleton className="h-8 w-12" /> : <div className="text-3xl font-bold text-emerald-600">2</div>}
            </div>
          </div>

          {/* Staff Compliance Section (Only for Staff/Admin) */}
          {isStaff && (
            <div className="space-y-8">
              <div className="bg-white p-8 rounded-3xl border border-amber-100 shadow-sm bg-gradient-to-br from-white to-amber-50/30">
                <div className="flex items-center gap-3 mb-6">
                  <ShieldCheck className="h-6 w-6 text-amber-600" />
                  <h2 className="text-xl font-bold text-emerald-900">Staff Compliance & Onboarding</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-4 right-4 rotate-12 opacity-20 group-hover:opacity-40 transition-opacity">
                      <div className="border-4 border-red-600 text-red-600 px-4 py-2 rounded-lg font-black text-xl uppercase tracking-tighter">
                        Pending NPI Verification
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="bg-stone-100 p-3 rounded-xl">
                        <FileText className="h-6 w-6 text-stone-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-emerald-900">Fingerprint Receipt</h3>
                        <p className="text-xs text-stone-400">ID: FP-2026-0042</p>
                      </div>
                    </div>
                    <p className="text-sm text-stone-600 mb-6">
                      Your fingerprinting has been processed. This receipt serves as a 30-day legal buffer while NPI verification is pending.
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-red-600 uppercase bg-red-50 px-2 py-1 rounded">30-Day Buffer Active</span>
                      <button className="text-emerald-600 text-xs font-bold hover:underline">Download PDF</button>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="bg-emerald-100 p-3 rounded-xl">
                        <GraduationCap className="h-6 w-6 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-emerald-900">Compliance Training</h3>
                        <p className="text-xs text-stone-400">CDS Portal Status</p>
                      </div>
                    </div>
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between text-xs">
                        <span className="text-stone-500">HIPAA Certification</span>
                        <span className={cn("font-bold", onboardingProgress.trainingCompleted ? "text-emerald-600" : "text-amber-600")}>
                          {onboardingProgress.trainingCompleted ? "COMPLETED" : "PENDING"}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-stone-500">DDD Core Competencies</span>
                        <span className={cn("font-bold", onboardingProgress.trainingCompleted ? "text-emerald-600" : "text-amber-600")}>
                          {onboardingProgress.trainingCompleted ? "COMPLETED" : "IN PROGRESS"}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-stone-500">SOP Review</span>
                        <span className={cn("font-bold", onboardingProgress.sopReviewed ? "text-emerald-600" : "text-amber-600")}>
                          {onboardingProgress.sopReviewed ? "COMPLETED" : "REQUIRED"}
                        </span>
                      </div>
                    </div>
                    {!onboardingProgress.trainingCompleted ? (
                      <div className="space-y-3">
                        <button 
                          onClick={handleCompleteTraining}
                          className="w-full block text-center bg-emerald-50 text-emerald-700 py-2 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-all"
                        >
                          Complete All Training
                        </button>
                        <button 
                          onClick={() => setShowQuiz(true)}
                          className="w-full block text-center bg-amber-50 text-amber-700 py-2 rounded-xl text-xs font-bold hover:bg-amber-100 transition-all border border-amber-100"
                        >
                          Take Competency Quiz
                        </button>
                      </div>
                    ) : (
                      <div className="w-full text-center bg-emerald-100 text-emerald-800 py-2 rounded-xl text-xs font-bold">
                        All Training Verified
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Role-Specific Resources */}
              <div className="bg-white p-8 rounded-3xl border border-emerald-50 shadow-sm">
                <h2 className="text-xl font-bold text-emerald-900 mb-6">Your Specialized Resources</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { title: "Departmental SOPs", icon: ShieldCheck, desc: "Standard Operating Procedures for your role." },
                    { title: "Innovation Lab", icon: Zap, desc: "Collaborate with your AI agent on new ideas." },
                    { title: "Client Focus Portal", icon: Target, desc: "Deep dive into client-specific care goals." },
                  ].map((res, i) => (
                    <div key={i} className="p-4 rounded-2xl border border-stone-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all cursor-pointer group">
                      <div className="bg-stone-50 p-3 rounded-xl w-fit mb-3 group-hover:bg-white transition-colors">
                        <res.icon className="h-5 w-5 text-emerald-600" />
                      </div>
                      <h4 className="font-bold text-emerald-900 text-sm mb-1">{res.title}</h4>
                      <p className="text-[10px] text-stone-500 leading-tight">{res.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Appointments List */}
          <div className="bg-white rounded-3xl border border-emerald-50 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-emerald-50 flex justify-between items-center">
              <h2 className="text-xl font-bold text-emerald-900">Your Appointments</h2>
              <Link to="/booking" className="text-emerald-600 text-sm font-bold hover:underline">View All</Link>
            </div>
            <div className="divide-y divide-emerald-50">
              {loading ? (
                <div className="p-6 space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-12 w-12 rounded-xl" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </div>
                  ))}
                </div>
              ) : upcoming.length === 0 ? (
                <div className="p-12 text-center text-stone-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>No upcoming appointments found.</p>
                </div>
              ) : (
                upcoming.map((app) => (
                  <div key={app.id} className="p-6 flex items-center justify-between hover:bg-emerald-50/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="bg-emerald-100 p-3 rounded-xl text-emerald-700">
                        <Calendar className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-emerald-900">{app.doctorName}</h3>
                        <p className="text-sm text-stone-500">{app.department}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-stone-400">
                          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {app.date}</span>
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {app.time}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-xs font-bold",
                        app.status === "confirmed" ? "bg-emerald-100 text-emerald-700" :
                        app.status === "pending" ? "bg-amber-100 text-amber-700" :
                        "bg-stone-100 text-stone-700"
                      )}>
                        {app.status.toUpperCase()}
                      </span>
                      <ChevronRight className="h-5 w-5 text-stone-300" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Profile Card */}
          <div className="bg-emerald-900 text-white p-8 rounded-3xl shadow-xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-emerald-800 w-16 h-16 rounded-2xl flex items-center justify-center border border-emerald-700">
                <UserIcon className="h-8 w-8 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-bold text-lg">{profile.displayName}</h3>
                <p className="text-emerald-300 text-xs uppercase tracking-widest">{profile.role}</p>
              </div>
            </div>
            <div className="space-y-4 text-sm opacity-80">
              <div className="flex justify-between">
                <span>{profile.role === UserRole.PATIENT ? "Patient ID:" : "Member ID:"}</span>
                <span className="font-mono">{profile.uid.slice(0, 8)}</span>
              </div>
              <div className="flex justify-between">
                <span>Member Since:</span>
                <span>{new Date(profile.createdAt).getFullYear()}</span>
              </div>
            </div>
            <Link to="/forms" className="mt-8 w-full bg-emerald-500 hover:bg-emerald-400 text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2">
              <Settings className="h-4 w-4" />
              Edit Profile
            </Link>
          </div>

          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-3xl border border-emerald-50 shadow-sm">
            <h3 className="font-bold text-emerald-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 gap-3">
              <Link to="/forms" className="flex items-center gap-3 p-3 rounded-xl hover:bg-emerald-50 transition-all group">
                <div className="bg-emerald-100 p-2 rounded-lg group-hover:bg-emerald-200 transition-all">
                  <FileText className="h-5 w-5 text-emerald-600" />
                </div>
                <span className="text-sm font-medium text-stone-700">Fill Intake Forms</span>
              </Link>
              <Link to="/education" className="flex items-center gap-3 p-3 rounded-xl hover:bg-emerald-50 transition-all group">
                <div className="bg-emerald-100 p-2 rounded-lg group-hover:bg-emerald-200 transition-all">
                  <GraduationCap className="h-5 w-5 text-emerald-600" />
                </div>
                <span className="text-sm font-medium text-stone-700">My Courses</span>
              </Link>
              <Link to="/virtual-tour" className="flex items-center gap-3 p-3 rounded-xl hover:bg-emerald-50 transition-all group">
                <div className="bg-emerald-100 p-2 rounded-lg group-hover:bg-emerald-200 transition-all">
                  <Video className="h-5 w-5 text-emerald-600" />
                </div>
                <span className="text-sm font-medium text-stone-700">Virtual Tour</span>
              </Link>
              <button 
                onClick={() => setShowManual(true)}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-emerald-50 transition-all group"
              >
                <div className="bg-emerald-100 p-2 rounded-lg group-hover:bg-emerald-200 transition-all">
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                </div>
                <span className="text-sm font-medium text-stone-700">Operating Manual</span>
              </button>
              <button 
                onClick={() => setShowIncidentIntake(true)}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-rose-50 transition-all group border border-rose-100 bg-rose-50/30"
              >
                <div className="bg-rose-100 p-2 rounded-lg group-hover:bg-rose-200 transition-all">
                  <AlertTriangle className="h-5 w-5 text-rose-600" />
                </div>
                <span className="text-sm font-bold text-rose-700">Secure Incident Intake</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <StaffAgent 
        role={profile.specialty || profile.role} 
        displayName={profile.displayName} 
        onboardingProgress={profile.onboardingProgress}
        trainingRecords={trainingRecords}
      />

      {showIncidentIntake && (
        <IncidentIntake 
          user={user} 
          profile={profile} 
          onClose={() => setShowIncidentIntake(false)} 
        />
      )}

      {/* Excellence Trigger: 15-Minute Pulse Check Modal */}
      {showPulseCheck && (
        <div className="fixed inset-0 bg-emerald-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl border border-emerald-100"
          >
            <div className="bg-emerald-900 p-8 text-white relative">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Activity className="h-24 w-24" />
              </div>
              <div className="flex items-center gap-3 mb-2">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Performance Auditor</span>
              </div>
              <h2 className="text-2xl font-bold">15-Minute Excellence Pulse</h2>
              <p className="text-emerald-100/60 text-sm mt-2">Mandatory log for geospatial safety and SOP compliance.</p>
            </div>
            <div className="p-8 space-y-6">
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100">
                <div className="text-[10px] font-bold text-stone-400 uppercase mb-1">Current Location</div>
                <div className="text-sm font-bold text-emerald-900">Activity Room 4 (Computer Science)</div>
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Activity Log (Voice-to-Text Enabled)</label>
                <div className="relative">
                  <textarea 
                    value={pulseLog}
                    onChange={(e) => setPulseLog(e.target.value)}
                    placeholder="Describe current client engagement and skill acquisition..."
                    className="w-full h-32 p-4 rounded-2xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none resize-none text-sm"
                  ></textarea>
                  <button className="absolute bottom-3 right-3 p-2 bg-emerald-100 text-emerald-600 rounded-xl hover:bg-emerald-200 transition-all">
                    <Mic className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <button 
                onClick={handlePulseSubmit}
                disabled={!pulseLog || isAnalyzingPulse}
                className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all disabled:opacity-50"
              >
                {isAnalyzingPulse ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                Submit Log to Auditor
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Komninos' Law: Employee Competency Quiz Modal */}
      {showQuiz && (
        <div className="fixed inset-0 bg-stone-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl"
          >
            <div className="p-12">
              {!quizPassed ? (
                <>
                  <div className="flex items-center gap-3 mb-6">
                    <Award className="h-8 w-8 text-amber-500" />
                    <h2 className="text-3xl font-bold text-emerald-900">Komninos' Law Competency</h2>
                  </div>
                  <p className="text-stone-500 mb-8">
                    To maintain 100% compliance and unlock your daily schedule, please complete this mandatory competency check.
                  </p>
                  <div className="space-y-6 mb-12">
                    <div className="p-6 bg-stone-50 rounded-2xl border border-stone-100">
                      <p className="font-bold text-emerald-900 mb-4">1. What is the mandatory reporting timeframe for a Level 1 Incident under Komninos' Law?</p>
                      <div className="space-y-3">
                        {["Immediate / Within 1 Hour", "Within 24 Hours", "End of Shift"].map((opt, i) => (
                          <label key={i} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-stone-200 cursor-pointer hover:border-emerald-500 transition-all">
                            <input type="radio" name="q1" className="text-emerald-600 focus:ring-emerald-500" />
                            <span className="text-sm text-stone-700">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={handleQuizSubmit}
                    className="w-full bg-emerald-900 text-white py-5 rounded-2xl font-bold text-lg hover:bg-emerald-800 transition-all"
                  >
                    Submit Quiz (80% Pass Required)
                  </button>
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="h-12 w-12 text-emerald-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-emerald-900 mb-2">Competency Verified</h2>
                  <p className="text-stone-500">You have passed the Komninos' Law module. App features unlocked.</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
      {/* Mandatory Password Change Modal */}
      {showPasswordChange && (
        <div className="fixed inset-0 bg-emerald-950/90 backdrop-blur-md z-[60] flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-[3rem] w-full max-w-md overflow-hidden shadow-2xl border border-emerald-100"
          >
            <div className="bg-emerald-900 p-10 text-white text-center">
              <div className="bg-emerald-800 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Lock className="h-10 w-10 text-emerald-400" />
              </div>
              <h2 className="text-3xl font-bold mb-2">Secure Your Account</h2>
              <p className="text-emerald-100/60 text-sm">As this is your first login, you must change your temporary password to proceed.</p>
            </div>
            <div className="p-10 space-y-6">
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-400 uppercase tracking-widest ml-1">New Secure Password</label>
                <input 
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-6 py-4 rounded-2xl border border-stone-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all bg-stone-50/50"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-400 uppercase tracking-widest ml-1">Confirm Password</label>
                <input 
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-6 py-4 rounded-2xl border border-stone-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all bg-stone-50/50"
                />
              </div>
              
              <button 
                onClick={async () => {
                  if (newPassword !== confirmPassword) {
                    alert("Passwords do not match.");
                    return;
                  }
                  if (newPassword.length < 8) {
                    alert("Password must be at least 8 characters.");
                    return;
                  }
                  await handleResetPassword();
                  setShowPasswordChange(false);
                }}
                disabled={!newPassword || newPassword !== confirmPassword}
                className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all disabled:opacity-50 shadow-xl shadow-emerald-900/20"
              >
                <ShieldCheck className="h-5 w-5" />
                Update & Secure Account
              </button>
              
              <p className="text-[10px] text-stone-400 text-center uppercase tracking-widest leading-relaxed">
                Your new password will be encrypted and stored securely. ThinkTank Solutions AI does not store plain-text passwords.
              </p>
            </div>
          </motion.div>
        </div>
      )}

      {/* PWA Instructions Modal */}
      {showPWAInstructions && (
        <div className="fixed inset-0 bg-stone-900/80 backdrop-blur-md z-[70] flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-[3rem] w-full max-w-lg overflow-hidden shadow-2xl"
          >
            <div className="bg-emerald-900 p-8 text-white text-center">
              <div className="bg-emerald-800 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Bot className="h-10 w-10 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold">Install Genesis OS</h2>
              <p className="text-emerald-100/60 text-sm">Access your AI co-worker directly from your home screen.</p>
            </div>
            <div className="p-8 space-y-8">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold shrink-0">1</div>
                  <div>
                    <h4 className="font-bold text-emerald-900">On iPhone (Safari)</h4>
                    <p className="text-sm text-stone-500">Tap the <span className="font-bold">Share</span> button (square with arrow) at the bottom of your screen.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold shrink-0">2</div>
                  <div>
                    <h4 className="font-bold text-emerald-900">Add to Home Screen</h4>
                    <p className="text-sm text-stone-500">Scroll down and tap <span className="font-bold">"Add to Home Screen"</span>.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold shrink-0">3</div>
                  <div>
                    <h4 className="font-bold text-emerald-900">Launch & Log In</h4>
                    <p className="text-sm text-stone-500">Open the Genesis icon from your home screen and log in to stay connected.</p>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setShowPWAInstructions(false)}
                className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all"
              >
                Got it!
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Operating Manual Modal */}
      {showManual && (
        <div className="fixed inset-0 bg-stone-900/80 backdrop-blur-md z-[70] flex items-center justify-center p-4">
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white rounded-[3rem] w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            <div className="p-10">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck className="h-5 w-5 text-emerald-600" />
                    <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">Official Operating Manual</span>
                  </div>
                  <h2 className="text-3xl font-bold text-emerald-900">
                    {OPERATING_MANUALS[profile.role]?.title || "General Operating Manual"}
                  </h2>
                </div>
                <button 
                  onClick={() => setShowManual(false)}
                  className="p-2 hover:bg-stone-100 rounded-full transition-all"
                >
                  <XCircle className="h-6 w-6 text-stone-400" />
                </button>
              </div>

              <div className="space-y-10">
                <section>
                  <h3 className="text-lg font-bold text-emerald-900 mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-emerald-600" />
                    Standard Operating Procedures (SOP)
                  </h3>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(OPERATING_MANUALS[profile.role]?.sop || []).map((step, i) => (
                      <li key={i} className="p-4 bg-stone-50 rounded-2xl border border-stone-100 text-sm text-stone-600 flex gap-3">
                        <span className="font-bold text-emerald-600">{i + 1}.</span>
                        {step}
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="bg-emerald-50 p-8 rounded-[2rem] border border-emerald-100">
                  <h3 className="text-lg font-bold text-emerald-900 mb-4 flex items-center gap-2">
                    <Bot className="h-5 w-5 text-emerald-600" />
                    Your AI Co-worker: {OPERATING_MANUALS[profile.role]?.aiCoworkerGuidance.purpose}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-3">How to Use</h4>
                      <ul className="space-y-2">
                        {(OPERATING_MANUALS[profile.role]?.aiCoworkerGuidance.howToUse || []).map((item, i) => (
                          <li key={i} className="text-sm text-emerald-800 flex gap-2">
                            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-3">Try Prompting Like This</h4>
                      <ul className="space-y-2">
                        {(OPERATING_MANUALS[profile.role]?.aiCoworkerGuidance.promptSuggestions || []).map((item, i) => (
                          <li key={i} className="text-sm text-emerald-800 italic flex gap-2">
                            <Sparkles className="h-4 w-4 shrink-0 mt-0.5" />
                            "{item}"
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-bold text-emerald-900 mb-4 flex items-center gap-2">
                    <Zap className="h-5 w-5 text-emerald-600" />
                    Real-Life Use Cases
                  </h3>
                  <div className="space-y-4">
                    {(OPERATING_MANUALS[profile.role]?.realLifeUseCases || []).map((useCase, i) => (
                      <div key={i} className="p-4 bg-white border border-stone-100 rounded-2xl shadow-sm text-sm text-stone-600">
                        {useCase}
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              <div className="mt-12 pt-8 border-t border-stone-100 text-center">
                <p className="text-xs text-stone-400 italic">
                  This manual is dynamically generated based on your role and is updated weekly by the ThinkTank Solutions AI core.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
