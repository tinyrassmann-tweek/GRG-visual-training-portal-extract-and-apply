import React, { useState, useMemo, useEffect } from "react";
import { User } from "firebase/auth";
import { UserProfile } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { 
  GraduationCap, 
  Map, 
  FileText, 
  Users, 
  Clock, 
  ShieldCheck, 
  Building2, 
  Zap,
  BookOpen,
  Award,
  Calendar,
  Layers,
  Sparkles,
  Heart,
  ExternalLink,
  Search,
  Filter,
  PlayCircle,
  CheckCircle2,
  AlertCircle,
  ChevronRight
} from "lucide-react";
import { cn } from "../lib/utils";
import { StaffAgent } from "../components/StaffAgent";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { StaffTrainingRecord } from "../types";

interface PortalCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  span?: "normal" | "tall" | "wide";
  color?: string;
  delay?: number;
  onClick?: () => void;
}

const PortalCard = ({ title, description, icon: Icon, span = "normal", color = "bg-emerald-400", delay = 0, onClick }: PortalCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      onClick={onClick}
      className={cn(
        "relative rounded-[3rem] p-8 overflow-hidden group border border-white/10 shadow-2xl transition-all hover:scale-[1.02] cursor-pointer",
        span === "tall" ? "row-span-2 min-h-[400px]" : "",
        span === "wide" ? "col-span-1 md:col-span-2" : "",
        color,
        "text-emerald-950"
      )}
    >
      <div className="flex flex-col h-full justify-between relative z-10">
        <div>
          <div className="bg-emerald-950/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md">
            <Icon className="h-7 w-7 text-emerald-950" />
          </div>
          <h3 className="text-3xl font-black mb-3 tracking-tighter uppercase leading-none">{title}</h3>
          <p className="text-emerald-950/70 font-medium leading-tight max-w-[200px]">
            {description}
          </p>
        </div>
        
        <div className="flex justify-end">
          <div className="bg-emerald-950/10 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            <Zap className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Decorative background circle */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-1/2 -translate-y-1/2 blur-2xl group-hover:bg-white/20 transition-colors"></div>
      
      {/* Plus icon like in the screenshot */}
      <div className="absolute top-8 right-8 text-emerald-950/50">
        <Sparkles className="h-6 w-6" />
      </div>
    </motion.div>
  );
};

interface TrainingModule {
  id: string;
  title: string;
  category: string;
  timeline: string;
  method: string;
  description: string;
  estimatedTime?: string;
  status: "not_started" | "in_progress" | "completed";
}

const MANDATED_TRAININGS: TrainingModule[] = [
  // Prior to Services
  { id: "ddd-prereq-roles", title: "SC Roles and Responsibilities", category: "Core Prerequisites", timeline: "Prior to Service", method: "College of Direct Support", description: "Foundational overview of Support Coordination roles.", status: "not_started" },
  { id: "ddd-prereq-system", title: "Overview of DDD System", category: "Core Prerequisites", timeline: "Prior to Service", method: "College of Direct Support", description: "Navigating the New Jersey Division of Developmental Disabilities structure.", status: "not_started" },
  { id: "irecord-p1", title: "Getting Started with iRecord Pt 1", category: "Technical", timeline: "Prior to Service", method: "College of Direct Support", description: "Initial setup and navigation of the iRecord platform.", status: "not_started" },
  { id: "irecord-p2", title: "Getting Started with iRecord Pt 2", category: "Technical", timeline: "Prior to Service", method: "College of Direct Support", description: "Advanced data entry and module management in iRecord.", status: "not_started" },
  { id: "pc-planning", title: "Person-Centered Planning", category: "Clinical", timeline: "Prior to Service", method: "Boggs Center", description: "Live 2-day training on community supports connection.", status: "not_started" },
  { id: "danielles-law", title: "Danielle's Law", category: "Safety & Legal", timeline: "Prior to Service", method: "College of Direct Support", description: "Mandatory training on life-threatening emergencies response.", status: "not_started" },
  { id: "komninos-law", title: "Stephen Komninos' Law", category: "Safety & Legal", timeline: "Prior to Service", method: "College of Direct Support", description: "Protocols for resident safety and abuse prevention.", status: "not_started" },
  { id: "incident-reporting-v1", title: "Incident Reporting (Provider)", category: "Compliance", timeline: "Prior to Service", method: "Agency Developed", description: "Internal protocols for reporting unusual circumstances.", status: "not_started" },
  
  // Within 90 Days
  { id: "pane-training", title: "Preventing Abuse, Neglect & Exploitation (PANE)", category: "Safety & Legal", timeline: "Within 90 Days", method: "College of Direct Support", description: "CDS Maltreatment Prevention and Response modules.", status: "not_started" },
  { id: "agency-orientation", title: "Provider-Developed Orientation", category: "Onboarding", timeline: "Within 90 Days", method: "Agency Developed", description: "Mission, philosophy, personnel policies, and safety.", status: "not_started" },
  { id: "medicaid-eligibility", title: "Medicaid: Eligibility & Helpdesk", category: "Compliance", timeline: "Within 90 Days", method: "College of Direct Support", description: "Understanding Medicaid requirements for individuals served.", status: "not_started" },
  { id: "dd-history", title: "DD and Community Integration: History", category: "Culture", timeline: "Within 90 Days", method: "College of Direct Support", description: "Brief history of developmental disabilities advocacy.", status: "not_started" },
  { id: "self-directed", title: "Intro to Self-Directed Services", category: "Technical", timeline: "Within 90 Days", method: "College of Direct Support", description: "Designing paths for individualized care and self-directed options.", status: "not_started" },
  
  // Later Timelines
  { id: "hcbs-rules", title: "HCBS Rules into Practice", category: "Compliance", timeline: "Within 120 Days", method: "College of Direct Support", description: "Home and Community-Based Services Settings Final Rule.", status: "not_started" },
  { id: "fiscal-intermediary", title: "Fiscal Intermediary Choices", category: "Technical", timeline: "Within 120 Days", method: "College of Direct Support", description: "Understanding options and roles of fiscal intermediaries.", status: "not_started" },
  { id: "crisis-resources", title: "Crisis and Emergency Resources", category: "Safety & Legal", timeline: "Within 120 Days", method: "College of Direct Support", description: "Identification and utilization of state emergency resources.", status: "not_started" },
  { id: "njcat-overview", title: "NJCAT and PCPT Overview", category: "Technical", timeline: "Within 120 Days", method: "College of Direct Support", description: "Comprehensive Assessment Tool and Person-Centered Planning Tool review.", status: "not_started" },
  { id: "navigating-conflict", title: "Navigating Conflict for SCs", category: "Professional Skill", timeline: "Within 180 Days", method: "College of Direct Support", description: "Conflict resolution and mediation techniques.", status: "not_started" },
  { id: "trauma-informed", title: "Trauma-Informed Supports", category: "Clinical", timeline: "Within 240 Days", method: "College of Direct Support", description: "Basic introduction to trauma-informed care principles.", status: "not_started" },
  { id: "assistive-tech", title: "Assistive Technology", category: "Technical", timeline: "Within 1 Year", method: "College of Direct Support", description: "Integrating tech solutions into service plans.", status: "not_started" },
];

export default function TrainingPortal({ user, profile }: { user: User | null, profile: UserProfile | null }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [trainingRecords, setTrainingRecords] = useState<StaffTrainingRecord[]>([]);

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(query(collection(db, "staffTraining"), where("staffId", "==", user.uid)), (snap) => {
      setTrainingRecords(snap.docs.map(d => ({ id: d.id, ...d.data() } as StaffTrainingRecord)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, "staffTraining"));
    return unsub;
  }, [user]);

  const categories = useMemo(() => ["All", ...Array.from(new Set(MANDATED_TRAININGS.map(t => t.category)))], []);

  const filteredTrainings = useMemo(() => {
    return MANDATED_TRAININGS.filter(t => {
      const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === "All" || t.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-stone-950 text-white selection:bg-emerald-400 selection:text-emerald-950">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16 px-4">
          <div className="max-w-2xl border-l-4 border-emerald-400 pl-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-emerald-400 p-2 rounded-lg">
                <GraduationCap className="h-6 w-6 text-emerald-950" />
              </div>
              <span className="text-xs font-black tracking-[0.3em] uppercase text-emerald-400">Genesis Education OS</span>
            </div>
            <h1 className="text-7xl font-black tracking-tight leading-[0.85] uppercase italic">
              Life Tech <span className="text-emerald-400">Pro</span>
            </h1>
            <p className="mt-8 text-stone-400 text-lg leading-relaxed italic max-w-xl">
              Internalized excellence and compliance. Every module is a brick in the foundation of life-changing care. 
              PWA-Secured container for HIPAA-compliant mentorship.
            </p>
          </div>
          
          <div className="flex gap-4">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 px-8 py-6 rounded-[2rem] text-center">
              <div className="text-[10px] font-black text-emerald-400 uppercase mb-1 tracking-widest">Compliance Status</div>
              <div className="text-4xl font-black tracking-tighter">94%</div>
            </div>
            <div className="bg-white/5 backdrop-blur-md border border-white/10 px-8 py-6 rounded-[2rem] text-center">
              <div className="text-[10px] font-black text-emerald-400 uppercase mb-1 tracking-widest">Next Training</div>
              <div className="text-4xl font-black tracking-tighter italic">2D</div>
            </div>
          </div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
          {/* Main Hero Card (Tall) */}
          <PortalCard 
            span="tall"
            title="Team Updates"
            description="Weekly syncs, site-specific mentorship, and real-time operational shifts."
            icon={Calendar}
            color="bg-emerald-400"
            delay={0.1}
            onClick={() => {
              document.getElementById('on-demand')?.scrollIntoView({ behavior: 'smooth' });
            }}
          />

          {/* Training Modules */}
          <PortalCard 
            title="Employee Handbook"
            description="Standard Operating Procedures and Personnel Excellence guidelines."
            icon={FileText}
            color="bg-emerald-400"
            delay={0.2}
            onClick={() => {
              setActiveCategory("Onboarding");
              document.getElementById('on-demand')?.scrollIntoView({ behavior: 'smooth' });
            }}
          />
          
          <PortalCard 
            title="Project Reports"
            description="Impact analysis and quarterly mentoring outcomes."
            icon={Layers}
            color="bg-emerald-400"
            delay={0.3}
            onClick={() => {
              setActiveCategory("Professional Skill");
              document.getElementById('on-demand')?.scrollIntoView({ behavior: 'smooth' });
            }}
          />

          <PortalCard 
            title="Hiring"
            description="New hire onboarding, background checks, and NPI verification."
            icon={Users}
            color="bg-emerald-400"
            delay={0.4}
            onClick={() => {
              setActiveCategory("Onboarding");
              document.getElementById('on-demand')?.scrollIntoView({ behavior: 'smooth' });
            }}
          />

          {/* Row 2 */}
          <PortalCard 
            title="Annual Report"
            description="State and Federal compliance prerequisites review (DDD/State)."
            icon={ShieldCheck}
            color="bg-emerald-400"
            delay={0.5}
            onClick={() => {
              setActiveCategory("Compliance");
              document.getElementById('on-demand')?.scrollIntoView({ behavior: 'smooth' });
            }}
          />

          <PortalCard 
            title="New Products"
            description="Continuous clinical training on new protocols and tools."
            icon={Zap}
            color="bg-emerald-400"
            delay={0.6}
            onClick={() => {
              setActiveCategory("Clinical");
              document.getElementById('on-demand')?.scrollIntoView({ behavior: 'smooth' });
            }}
          />

          <PortalCard 
            title="Company Culture"
            description="The Genesis Standard. Values, Ethics, and the Spectacular benchmark."
            icon={Heart}
            color="bg-emerald-400"
            delay={0.7}
            onClick={() => {
              setActiveCategory("Culture");
              document.getElementById('on-demand')?.scrollIntoView({ behavior: 'smooth' });
            }}
          />

          <div className="col-span-1 md:col-span-2 lg:col-span-1 flex flex-col gap-6">
            <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] flex-1 group hover:border-emerald-400/50 transition-colors cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <BookOpen className="h-6 w-6 text-emerald-400" />
                <ExternalLink className="h-4 w-4 text-white/20 group-hover:text-emerald-400 transition-colors" />
              </div>
              <h4 className="font-black text-lg uppercase tracking-tight">College of Direct Support</h4>
              <p className="text-xs text-stone-500 mt-2">External state-mandated certifications and enrollments.</p>
            </div>
            
            <div className="bg-emerald-950 border border-emerald-900 p-8 rounded-[2.5rem] flex-1 flex items-center gap-6 group hover:border-emerald-400/50 transition-colors cursor-pointer">
               <div className="bg-emerald-400 p-3 rounded-2xl w-12 h-12 flex items-center justify-center shrink-0">
                 <Building2 className="h-6 w-6 text-emerald-950" />
               </div>
               <div>
                  <h4 className="font-black text-lg uppercase tracking-tight text-white">On-Site Mentoring</h4>
                  <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Quarterly Intensive</p>
               </div>
            </div>
          </div>
        </div>

        {/* On-Demand Training Section */}
        <div id="on-demand" className="mt-32 scroll-mt-24">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 px-4">
            <div className="max-w-xl">
              <h2 className="text-5xl font-black uppercase tracking-tighter mb-4">On-Demand Training</h2>
              <p className="text-stone-400 font-medium">
                Comprehensive repository of mandated required training. Categorized by core topic to ensure 
                seamless accessibility for weekly, monthly, and annual mentoring sessions.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              {/* Search Bar */}
              <div className="relative group flex-1 sm:w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500 group-focus-within:text-emerald-400 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search modules..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 outline-none focus:border-emerald-400/50 transition-all text-sm"
                />
              </div>
              
              {/* Category Filter */}
              <div className="relative group">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500" />
                <select 
                  value={activeCategory}
                  onChange={(e) => setActiveCategory(e.target.value)}
                  className="appearance-none bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-10 outline-none focus:border-emerald-400/50 transition-all text-sm cursor-pointer"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat} className="bg-stone-900">{cat}</option>
                  ))}
                </select>
                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500 rotate-90" />
              </div>
            </div>
          </div>

          {/* Training Modules Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 px-4 overflow-hidden">
            <AnimatePresence mode="popLayout">
              {filteredTrainings.map((module, idx) => (
                <motion.div
                  key={module.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className="bg-white/5 border border-white/10 p-6 rounded-[2rem] group hover:bg-white/10 hover:border-emerald-400/30 transition-all flex flex-col justify-between min-h-[220px]"
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest px-2 py-1 bg-emerald-400/10 rounded-md">
                        {module.category}
                      </span>
                      {module.status === "completed" ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                      ) : module.status === "in_progress" ? (
                        <Clock className="h-5 w-5 text-orange-400 animate-pulse" />
                      ) : (
                        <div className="h-2 w-2 rounded-full bg-stone-700" />
                      )}
                    </div>
                    <h4 className="text-xl font-black uppercase tracking-tight mb-2 group-hover:text-emerald-400 transition-colors leading-none">
                      {module.title}
                    </h4>
                    <p className="text-xs text-stone-500 line-clamp-2 mb-4 leading-relaxed">
                      {module.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-white/5 pt-4">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-stone-600 uppercase font-black tracking-tighter">Timeline</span>
                      <span className="text-[10px] font-bold text-stone-300">{module.timeline}</span>
                    </div>
                    <button className="bg-emerald-400 text-emerald-950 p-2 rounded-full transform translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                      <PlayCircle className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {filteredTrainings.length === 0 && (
              <div className="col-span-full py-20 text-center">
                <AlertCircle className="h-12 w-12 text-stone-800 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-stone-600">No modules found matching your criteria.</h3>
                <p className="text-stone-700 mt-1">Try adjusting your search or category filter.</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Info / Security Note */}
        <div className="mt-20 px-8 flex flex-col md:flex-row items-center justify-between gap-8 opacity-40 hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-4">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">PWA CONTAINERIZED SECURE ACCESS • NO DATA EXFILTRATION PROHIBITED</span>
          </div>
          <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-stone-500">
            <span>HIPAA Compliant</span>
            <span>DDD Verified</span>
            <span>Medicaid Standard 2026.04</span>
          </div>
        </div>
      </div>
      {profile && (
        <StaffAgent 
          role={profile.specialty || profile.role} 
          displayName={profile.displayName} 
          onboardingProgress={profile.onboardingProgress}
          trainingRecords={trainingRecords}
        />
      )}
    </div>
  );
}
