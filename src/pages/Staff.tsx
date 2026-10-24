import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { UserProfile, UserRole, StaffTrainingRecord } from "../types";
import { motion } from "motion/react";
import { 
  Users, 
  Stethoscope, 
  Award, 
  Mail, 
  Phone, 
  Search, 
  ChevronRight,
  User as UserIcon,
  ShieldCheck,
  FileText,
  CheckCircle2,
  Clock,
  X,
  GraduationCap,
  BookOpen,
  Sparkles,
  DollarSign
} from "lucide-react";
import { AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";
import { ProtocolGuide } from "../components/ProtocolGuide";
import { INITIAL_STAFF } from "../lib/staffData";

export default function Staff() {
  const [staff, setStaff] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "executive" | "doctor" | "dsp">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStaff, setSelectedStaff] = useState<UserProfile | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [staffTraining, setStaffTraining] = useState<StaffTrainingRecord[]>([]);

  useEffect(() => {
    if (selectedStaff) {
      const fetchTraining = async () => {
        const q = query(collection(db, "staffTraining"), where("staffId", "==", selectedStaff.uid.startsWith("pending") ? selectedStaff.email : selectedStaff.uid));
        const snap = await getDocs(q);
        setStaffTraining(snap.docs.map(d => ({ id: d.id, ...d.data() } as StaffTrainingRecord)));
      };
      fetchTraining();
    }
  }, [selectedStaff]);

  useEffect(() => {
    const fetchStaff = async () => {
      const q = query(collection(db, "users"), where("role", "!=", UserRole.PATIENT));
      const snap = await getDocs(q);
      const docs = snap.docs.map(d => d.data() as UserProfile);
      
      // Merge with INITIAL_STAFF to show pending onboarding
      const allStaff = [...docs];
      INITIAL_STAFF.forEach(initial => {
        if (!docs.some(d => d.email === initial.email)) {
          allStaff.push({
            uid: `pending-${initial.email}`,
            email: initial.email,
            displayName: initial.name,
            role: initial.role as UserRole,
            title: initial.title,
            isConsultant: initial.isConsultant,
            createdAt: new Date().toISOString(),
            onboardingProgress: {
              trainingCompleted: false,
              passwordChanged: false,
              ndaSigned: false,
              aiConsentSigned: false,
              fingerprintsDone: false,
              npiVerified: false,
              backgroundCheck: false,
              sopReviewed: false
            }
          });
        }
      });

      setStaff(allStaff);
      setLoading(false);
    };
    fetchStaff();
  }, []);

  const handleVerifyFile = async (fileName: string) => {
    if (!selectedStaff) return;
    setVerifying(true);
    setVerificationResult(null);
    
    try {
      const response = await fetch("/api/verify-personnel-file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName,
          staffName: selectedStaff.displayName
        })
      });
      const data = await response.json();
      if (data.success) {
        setVerificationResult(data.verification);
      }
    } catch (err) {
      console.error("Verification error:", err);
    } finally {
      setVerifying(false);
    }
  };

  const filteredStaff = staff.filter(s => {
    const matchesSearch = s.displayName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         s.specialty?.toLowerCase().includes(searchTerm.toLowerCase());
    if (filter === "all") return matchesSearch;
    if (filter === "executive") return matchesSearch && s.role === UserRole.ADMIN;
    if (filter === "doctor") return matchesSearch && s.role === UserRole.DOCTOR;
    if (filter === "dsp") return matchesSearch && s.role === UserRole.STAFF;
    return matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-emerald-900 mb-4">Our Dedicated Personnel</h1>
        <p className="text-stone-600 max-w-2xl mx-auto">
          Meet the executive leadership, activity coordinators, and direct support professionals (DSPs) who make Genesis Revitalization Group a center of excellence.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-6 justify-between items-center mb-12">
        <div className="flex bg-white p-1 rounded-2xl border border-emerald-50 shadow-sm overflow-x-auto w-full md:w-auto">
          {[
            { id: "all", label: "All Staff" },
            { id: "executive", label: "Executive Team" },
            { id: "doctor", label: "Activity Coordinators" },
            { id: "dsp", label: "DSP Listing" },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={cn(
                "px-6 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
                filter === tab.id ? "bg-emerald-600 text-white shadow-md" : "text-stone-500 hover:text-emerald-600"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
          <input
            type="text"
            placeholder="Search by name or specialty..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white h-80 rounded-3xl animate-pulse border border-stone-100"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {filteredStaff.map((person, i) => (
            <motion.div
              key={person.uid}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-3xl overflow-hidden border border-emerald-50 shadow-sm hover:shadow-xl transition-all group"
            >
              <div className="h-48 bg-stone-100 relative overflow-hidden">
                {person.photoURL ? (
                  <img src={person.photoURL} alt={person.displayName} className="w-full h-full object-cover transition-transform group-hover:scale-110" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-300">
                    <UserIcon className="h-20 w-20" />
                  </div>
                )}
                <div className="absolute top-4 right-4 group-hover:scale-105 transition-transform">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm",
                    person.role === UserRole.ADMIN && person.isConsultant ? "bg-indigo-600 text-white" :
                    person.role === UserRole.ADMIN ? "bg-purple-600 text-white" :
                    person.role === UserRole.DOCTOR ? "bg-emerald-600 text-white" :
                    person.role === UserRole.APPLICANT ? "bg-stone-500 text-white" :
                    "bg-amber-500 text-white"
                  )}>
                    {person.role === UserRole.ADMIN && person.isConsultant ? "Consulting Executive Branch" :
                     person.role === UserRole.ADMIN ? "Executive" : 
                     person.role === UserRole.DOCTOR ? "Coordinator" : 
                     person.role === UserRole.APPLICANT ? "Applicant" :
                     "DSP"}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-emerald-900 mb-1">{person.displayName}</h3>
                <p className="text-xs text-emerald-600 font-bold uppercase tracking-wide mb-4">
                  {person.specialty || (person.role === UserRole.ADMIN ? "Administration" : "Direct Support")}
                </p>
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-stone-500 text-xs">
                    <Mail className="h-3 w-3" />
                    {person.email}
                  </div>
                  {person.phoneNumber && (
                    <div className="flex items-center gap-2 text-stone-500 text-xs">
                      <Phone className="h-3 w-3" />
                      {person.phoneNumber}
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => setSelectedStaff(person)}
                  className="w-full bg-stone-50 text-emerald-700 py-2 rounded-xl text-sm font-bold hover:bg-emerald-50 transition-all flex items-center justify-center gap-2"
                >
                  Digital Personnel File <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Personnel File Modal */}
      <AnimatePresence>
        {selectedStaff && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row h-[90vh] md:h-auto max-h-[90vh]"
            >
              <div className="w-full md:w-80 bg-stone-50 p-8 border-r border-stone-100 flex flex-col items-center text-center relative">
                <button 
                  onClick={() => setSelectedStaff(null)}
                  className="absolute top-6 left-6 p-2 rounded-full hover:bg-stone-200 transition-all md:hidden"
                >
                  <X className="h-6 w-6 text-stone-500" />
                </button>
                
                <div className="w-32 h-32 rounded-3xl bg-white shadow-inner mb-6 flex items-center justify-center overflow-hidden border-4 border-white">
                  {selectedStaff.photoURL ? (
                    <img src={selectedStaff.photoURL} alt={selectedStaff.displayName} className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="h-16 w-16 text-stone-200" />
                  )}
                </div>
                
                <h2 className="text-2xl font-bold text-emerald-900 mb-1">{selectedStaff.displayName}</h2>
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-6 px-4 bg-emerald-50 py-1 rounded-full">
                  {selectedStaff.isConsultant ? "Consulting Executive Branch" : selectedStaff.title || selectedStaff.specialty}
                </p>
                
                <div className="w-full space-y-4 text-left">
                  <div className="p-4 bg-white rounded-2xl border border-stone-100">
                    <div className="text-[10px] font-bold text-stone-400 uppercase mb-1">Genesis Email</div>
                    <div className="text-sm font-medium text-emerald-800 break-all">{selectedStaff.email}</div>
                  </div>
                  <div className="p-4 bg-white rounded-2xl border border-stone-100">
                    <div className="text-[10px] font-bold text-stone-400 uppercase mb-1">Employee ID</div>
                    <div className="text-sm font-medium text-stone-800 font-mono">GRG-{selectedStaff.uid.slice(-6).toUpperCase()}</div>
                  </div>
                </div>

                <div className="mt-auto pt-8 w-full">
                  <button 
                    onClick={() => setSelectedStaff(null)}
                    className="w-full py-3 rounded-xl bg-emerald-900 text-white font-bold hover:bg-emerald-800 transition-all hidden md:block"
                  >
                    Close Digital File
                  </button>
                </div>
              </div>

              <div className="flex-1 p-8 md:p-12 overflow-y-auto relative">
                <button 
                  onClick={() => {
                    setSelectedStaff(null);
                    setVerificationResult(null);
                  }}
                  className="absolute top-8 right-8 p-2 rounded-full hover:bg-stone-100 transition-all hidden md:block"
                >
                  <X className="h-6 w-6 text-stone-300" />
                </button>

                <div className="mb-10">
                  <h3 className="text-xl font-bold text-emerald-900 mb-2 flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-emerald-600" />
                    Compliance & Onboarding Progress
                  </h3>
                  <p className="text-stone-500 text-sm">Real-time tracking of state and federal requirements.</p>
                </div>

                {selectedStaff.uid.startsWith("pending") && (
                  <div className="mb-8 p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-center gap-3">
                    <Clock className="h-5 w-5 text-amber-600" />
                    <span className="text-sm font-bold text-amber-900">Pending Initial Login & Authorization</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
                  {[
                    { label: "NDA Agreement", status: selectedStaff.onboardingProgress?.ndaSigned, icon: FileText },
                    { label: "AI Consent Form", status: selectedStaff.onboardingProgress?.aiConsentSigned, icon: Sparkles },
                    { label: "Fingerprinting", status: selectedStaff.onboardingProgress?.fingerprintsDone, icon: FileText },
                    { label: "NPI Verification", status: selectedStaff.onboardingProgress?.npiVerified, icon: ShieldCheck },
                    { label: "Background Check", status: selectedStaff.onboardingProgress?.backgroundCheck, icon: Search },
                    { label: "Initial Login", status: !!selectedStaff.lastLoginAt, icon: Clock },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 rounded-2xl border border-stone-100 bg-stone-50/50">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "p-2 rounded-lg",
                          item.status ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"
                        )}>
                          {item.icon && <item.icon className="h-4 w-4" />}
                        </div>
                        <span className="text-sm font-bold text-stone-700">{item.label}</span>
                      </div>
                      {item.status ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-amber-200 border-t-amber-500 animate-spin"></div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Digital Personnel File Section */}
                <div className="mb-10">
                  <h3 className="text-xl font-bold text-emerald-900 mb-6 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-emerald-600" />
                    Digital Personnel File (AI Coworker Verified)
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Simulated Files for Tanya Cooper Series */}
                    {(selectedStaff.displayName.includes("Cooper") || selectedStaff.displayName.includes("Tanya")) && (
                      <>
                        <div className="p-4 bg-white border border-stone-100 rounded-2xl flex items-center justify-between group hover:border-emerald-200 transition-all">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-stone-50 rounded-xl text-stone-400 group-hover:text-emerald-500 transition-colors">
                              <FileText className="h-6 w-6" />
                            </div>
                            <div>
                              <div className="text-sm font-bold text-stone-800">Tonya Cooper-1.pdf</div>
                              <div className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">AI Verified: NDA Agreement - Genesis</div>
                            </div>
                          </div>
                          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        </div>
                        <div className="p-4 bg-white border border-stone-100 rounded-2xl flex items-center justify-between group hover:border-emerald-200 transition-all">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-stone-50 rounded-xl text-stone-400 group-hover:text-emerald-500 transition-colors">
                              <FileText className="h-6 w-6" />
                            </div>
                            <div>
                              <div className="text-sm font-bold text-stone-800">Tonya Cooper-2.pdf</div>
                              <div className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">AI Verified: AI Consent Form - ThinkTank</div>
                            </div>
                          </div>
                          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        </div>
                      </>
                    )}

                    <div className="p-8 border-2 border-dashed border-stone-200 rounded-[2rem] text-center hover:border-emerald-300 transition-all group cursor-pointer">
                      <div className="bg-stone-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-emerald-50 transition-colors">
                        <FileText className="h-8 w-8 text-stone-300 group-hover:text-emerald-500" />
                      </div>
                      <p className="text-sm font-bold text-stone-500 group-hover:text-emerald-700">Upload New Digital Personnel Document</p>
                      <p className="text-[10px] text-stone-400 mt-1 uppercase tracking-widest">AI Coworker will automatically categorize and verify</p>
                      
                      <div className="mt-6 flex flex-wrap justify-center gap-2">
                        {["NDA", "AI Consent", "Background", "Training"].map(tag => (
                          <button 
                            key={tag}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleVerifyFile(`${selectedStaff.displayName}-${tag}.pdf`);
                            }}
                            className="px-3 py-1 bg-stone-100 text-stone-500 rounded-full text-[10px] font-bold hover:bg-emerald-600 hover:text-white transition-all"
                          >
                            Simulate {tag} Upload
                          </button>
                        ))}
                      </div>
                    </div>

                    {verifying && (
                      <div className="p-6 bg-emerald-900 text-white rounded-3xl flex items-center gap-4 animate-pulse">
                        <div className="h-6 w-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <div className="text-sm font-bold">AI Coworker is verifying document authenticity and compliance...</div>
                      </div>
                    )}

                    {verificationResult && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-6 bg-emerald-50 border border-emerald-100 rounded-3xl"
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                          <h4 className="font-bold text-emerald-900">AI Verification Complete</h4>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-stone-500">Corrected Title:</span>
                            <span className="font-bold text-emerald-800">{verificationResult.correctedTitle}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-stone-500">Category:</span>
                            <span className="font-bold text-emerald-800">{verificationResult.category}</span>
                          </div>
                          <div className="mt-4 p-3 bg-white rounded-xl text-xs text-stone-600 border border-emerald-50">
                            {verificationResult.notes}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>

                <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 mb-10">
                  <h4 className="font-bold text-emerald-900 mb-4 flex items-center gap-2">
                    <Award className="h-5 w-5 text-emerald-600" />
                    Professional Bio & Focus
                  </h4>
                  <p className="text-sm text-emerald-800/80 leading-relaxed italic">
                    {selectedStaff.bio || `Committed to achieving spectacular outcomes for our clients through dedicated ${selectedStaff.specialty || "Direct Support"} and person-centered care.`}
                  </p>
                </div>

                <div className="mb-10">
                  <h3 className="text-xl font-bold text-emerald-900 mb-6 flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-emerald-600" />
                    Training & Professional Growth
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {staffTraining.length > 0 ? (
                      staffTraining.map((record) => (
                        <div key={record.id} className="p-4 rounded-2xl border border-stone-100 bg-white shadow-sm flex items-center justify-between">
                          <div>
                            <div className="text-sm font-bold text-stone-900">{record.moduleTitle}</div>
                            <div className="text-[10px] text-stone-400 font-bold uppercase tracking-tight">
                              Completed: {record.completedAt ? new Date(record.completedAt).toLocaleDateString() : "Pending"}
                            </div>
                          </div>
                          <div className={cn(
                            "px-2 py-0.5 rounded-full text-[8px] font-black uppercase",
                            record.status === 'completed' ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                          )}>
                            {record.status}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-2 p-8 border-2 border-dashed border-stone-200 rounded-[2rem] text-center">
                        <p className="text-sm font-bold text-stone-400 italic">No training records found. Initializing onboarding path...</p>
                        <button className="mt-4 px-6 py-2 bg-emerald-600 text-white rounded-xl font-bold text-xs hover:bg-emerald-700 transition-all">
                          Assign Mandates (April 2026 Batch)
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 p-6 bg-blue-50/50 rounded-3xl border border-blue-100">
                    <div className="flex items-center gap-3 mb-2">
                      <DollarSign className="h-5 w-5 text-blue-600" />
                      <h4 className="font-bold text-blue-900 text-sm">Education Reimbursement Plan</h4>
                    </div>
                    <p className="text-xs text-blue-800 leading-relaxed">
                      Genesis Revitalization Group encourages proactive professional development. Staff are eligible for reimbursement for approved external certifications that align with our "Excellence as a Standard" philosophy.
                    </p>
                    <button className="mt-4 text-xs font-bold text-blue-600 hover:underline">View Eligibility Requirements & Submit Request</button>
                  </div>
                </div>

                <div className="mt-10 flex gap-4">
                  <button className="flex-1 bg-white border border-stone-200 text-stone-700 py-3 rounded-xl font-bold text-sm hover:bg-stone-50 transition-all">
                    Download Full Dossier
                  </button>
                  <button className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-900/10">
                    Verify Credentials
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="mt-20 mb-32">
        <ProtocolGuide />
      </div>

      {/* Affiliations & Partnerships */}
      <div className="mt-32">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-emerald-900">Our Affiliations & Partnerships</h2>
          <p className="text-stone-500 text-sm">Collaborating with leading institutions to provide superior care.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex items-center gap-2 font-bold text-stone-400">
              <ShieldCheck className="h-8 w-8" />
              <span className="text-xl">PARTNER {i}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
