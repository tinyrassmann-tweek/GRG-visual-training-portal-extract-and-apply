import React, { useState, useEffect } from "react";
import { User } from "firebase/auth";
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc, orderBy, writeBatch, addDoc } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { UserProfile, Appointment, UserRole, FormSubmission, ComplianceUpdate, OrgChartNode, Lead, AuditLog, Application, FacilityPresence, BillingLog, GeofenceAlert, TrainingModule, StaffTrainingRecord, ReimbursementRequest, IncidentReport, SecurityAlert, PHIAccessLog } from "../types";
import { motion } from "motion/react";
import { 
  Users, 
  Calendar, 
  FileText, 
  ShieldCheck, 
  Search, 
  Filter, 
  Printer, 
  Trash2, 
  CheckCircle, 
  XCircle,
  MoreVertical,
  ArrowUpRight,
  Activity,
  ShieldAlert,
  Network,
  Sparkles,
  RefreshCw,
  UserPlus,
  Plus,
  History,
  Map,
  Lock,
  Eye,
  AlertTriangle,
  Key,
  HeartPulse,
  GraduationCap,
  DollarSign,
  Award,
  Zap,
  Ear
} from "lucide-react";
import { format } from "date-fns";
import { cn, calculateOnboardingProgress } from "../lib/utils";
import { LeadIntakeAssistant } from "../components/LeadIntakeAssistant";
import { ComplianceSafetyAssistant } from "../components/ComplianceSafetyAssistant";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { AnimatePresence } from "motion/react";

export default function Admin({ user, profile }: { user: User | null, profile: UserProfile | null }) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [complianceUpdates, setComplianceUpdates] = useState<ComplianceUpdate[]>([]);
  const [orgChart, setOrgChart] = useState<OrgChartNode | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [licensing, setLicensing] = useState<any[]>([]);
  const [accessLogs, setAccessLogs] = useState<any[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [facilityPresence, setFacilityPresence] = useState<FacilityPresence[]>([]);
  const [billingLogs, setBillingLogs] = useState<BillingLog[]>([]);
  const [geofenceAlerts, setGeofenceAlerts] = useState<GeofenceAlert[]>([]);
  const [trainingModules, setTrainingModules] = useState<TrainingModule[]>([]);
  const [staffTrainingRecords, setStaffTrainingRecords] = useState<StaffTrainingRecord[]>([]);
  const [reimbursementRequests, setReimbursementRequests] = useState<ReimbursementRequest[]>([]);
  const [incidentReports, setIncidentReports] = useState<IncidentReport[]>([]);
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([]);
  const [phiAccessLogs, setPhiAccessLogs] = useState<PHIAccessLog[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "appointments" | "users" | "forms" | "compliance" | "orgchart" | "leads" | "audit" | "roadmap" | "licensing" | "access-logs" | "applications" | "facility" | "billing" | "alerts" | "staff-dev" | "safety" | "security">("overview");
  const [userViewMode, setUserViewMode] = useState<"table" | "cards">("table");
  const [leadViewMode, setLeadViewMode] = useState<"table" | "assistant">("table");
  const [searchTerm, setSearchTerm] = useState("");
  const [isScraping, setIsScraping] = useState(false);
  const [isParsingLead, setIsParsingLead] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedAppointments, setSelectedAppointments] = useState<string[]>([]);

  const isAdmin = profile?.role === UserRole.ADMIN || 
                  profile?.email === "tiny.rassmann@gmail.com" || 
                  profile?.email === "tiny.rasman@gmail.com";

  const isLitigationAdmin = profile?.email === "l.foster@genesisrevitalization.com";

  useEffect(() => {
    if (!user || !isAdmin) return;

    const unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
      setUsers(snap.docs.map(d => d.data() as UserProfile));
    }, (err) => handleFirestoreError(err, OperationType.LIST, "users"));

    const unsubApps = onSnapshot(query(collection(db, "appointments"), orderBy("createdAt", "desc")), (snap) => {
      setAppointments(snap.docs.map(d => ({ id: d.id, ...d.data() } as Appointment)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, "appointments"));

    const unsubForms = onSnapshot(query(collection(db, "formSubmissions"), orderBy("submittedAt", "desc")), (snap) => {
      setSubmissions(snap.docs.map(d => ({ id: d.id, ...d.data() } as FormSubmission)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, "formSubmissions"));

    const unsubCompliance = onSnapshot(query(collection(db, "complianceUpdates"), orderBy("createdAt", "desc")), (snap) => {
      setComplianceUpdates(snap.docs.map(d => ({ id: d.id, ...d.data() } as ComplianceUpdate)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, "complianceUpdates"));

    const unsubLeads = onSnapshot(query(collection(db, "leads"), orderBy("submittedAt", "desc")), (snap) => {
      setLeads(snap.docs.map(d => ({ id: d.id, ...d.data() } as Lead)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, "leads"));

    const unsubAudit = onSnapshot(query(collection(db, "auditLogs"), orderBy("timestamp", "desc")), (snap) => {
      setAuditLogs(snap.docs.map(d => ({ id: d.id, ...d.data() } as AuditLog)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, "auditLogs"));

    const unsubOrg = onSnapshot(doc(db, "orgChart", "current"), (snap) => {
      if (snap.exists()) {
        setOrgChart(snap.data() as OrgChartNode);
      }
    }, (err) => handleFirestoreError(err, OperationType.GET, "orgChart/current"));

    const unsubLicensing = onSnapshot(collection(db, "licensing"), (snap) => {
      setLicensing(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => handleFirestoreError(err, OperationType.LIST, "licensing"));

    const unsubAccessLogs = onSnapshot(query(collection(db, "accessLogs"), orderBy("timestamp", "desc")), (snap) => {
      setAccessLogs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => handleFirestoreError(err, OperationType.LIST, "accessLogs"));

    const unsubApplications = onSnapshot(query(collection(db, "applications"), orderBy("submittedAt", "desc")), (snap) => {
      setApplications(snap.docs.map(d => ({ id: d.id, ...d.data() } as Application)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, "applications"));

    const unsubFacility = onSnapshot(collection(db, "facilityPresence"), (snap) => {
      setFacilityPresence(snap.docs.map(d => ({ uid: d.id, ...d.data() } as FacilityPresence)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, "facilityPresence"));

    const unsubBilling = onSnapshot(query(collection(db, "billingLogs"), orderBy("startTime", "desc")), (snap) => {
      setBillingLogs(snap.docs.map(d => ({ id: d.id, ...d.data() } as BillingLog)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, "billingLogs"));

    const unsubAlerts = onSnapshot(query(collection(db, "geofenceAlerts"), orderBy("timestamp", "desc")), (snap) => {
      setGeofenceAlerts(snap.docs.map(d => ({ id: d.id, ...d.data() } as GeofenceAlert)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, "geofenceAlerts"));

    const unsubModules = onSnapshot(collection(db, "trainingModules"), (snap) => {
      setTrainingModules(snap.docs.map(d => ({ id: d.id, ...d.data() } as TrainingModule)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, "trainingModules"));

    const unsubStaffTraining = onSnapshot(collection(db, "staffTraining"), (snap) => {
      setStaffTrainingRecords(snap.docs.map(d => ({ id: d.id, ...d.data() } as StaffTrainingRecord)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, "staffTraining"));

    const unsubReimbursements = onSnapshot(query(collection(db, "reimbursementRequests"), orderBy("requestedAt", "desc")), (snap) => {
      setReimbursementRequests(snap.docs.map(d => ({ id: d.id, ...d.data() } as ReimbursementRequest)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, "reimbursementRequests"));

    const unsubIncidents = onSnapshot(query(collection(db, "incidentReports"), orderBy("timestamp", "desc")), (snap) => {
      setIncidentReports(snap.docs.map(d => ({ id: d.id, ...d.data() } as IncidentReport)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, "incidentReports"));

    const unsubSecurityAlerts = onSnapshot(query(collection(db, "securityAlerts"), orderBy("timestamp", "desc")), (snap) => {
      setSecurityAlerts(snap.docs.map(d => ({ id: d.id, ...d.data() } as SecurityAlert)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, "securityAlerts"));

    const unsubPhiLogs = onSnapshot(query(collection(db, "phiAccessLogs"), orderBy("timestamp", "desc")), (snap) => {
      setPhiAccessLogs(snap.docs.map(d => ({ id: d.id, ...d.data() } as PHIAccessLog)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, "phiAccessLogs"));

    setLoading(false);
    return () => {
      unsubUsers();
      unsubApps();
      unsubForms();
      unsubCompliance();
      unsubLeads();
      unsubAudit();
      unsubOrg();
      unsubLicensing();
      unsubAccessLogs();
      unsubApplications();
      unsubFacility();
      unsubBilling();
      unsubAlerts();
      unsubModules();
      unsubStaffTraining();
      unsubReimbursements();
      unsubIncidents();
      unsubSecurityAlerts();
      unsubPhiLogs();
    };
  }, [user, profile]);

  const handleUpdateStatus = async (id: string, status: string) => {
    await updateDoc(doc(db, "appointments", id), { status });
  };

  const handleBulkUpdateStatus = async (status: Appointment["status"]) => {
    if (selectedAppointments.length === 0) return;
    
    try {
      const batch = writeBatch(db);
      selectedAppointments.forEach((id) => {
        const appRef = doc(db, "appointments", id);
        batch.update(appRef, { status });
      });
      await batch.commit();
      setSelectedAppointments([]);
    } catch (error) {
      console.error("Error updating appointments:", error);
      alert("Failed to update appointments. Please try again.");
    }
  };

  const toggleSelectAll = () => {
    if (selectedAppointments.length === filteredAppointments.length) {
      setSelectedAppointments([]);
    } else {
      setSelectedAppointments(filteredAppointments.map(a => a.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedAppointments(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleDelete = async (id: string, coll: string) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      await deleteDoc(doc(db, coll, id));
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const runComplianceScrape = async () => {
    setIsScraping(true);
    try {
      const response = await fetch("/api/compliance/scrape", { method: "POST" });
      const data = await response.json();
      if (data.updates) {
        const batch = writeBatch(db);
        data.updates.forEach((update: any) => {
          const newDoc = doc(collection(db, "complianceUpdates"));
          batch.set(newDoc, {
            ...update,
            status: "new",
            createdAt: new Date().toISOString()
          });
        });
        
        // Add audit log
        const auditRef = doc(collection(db, "auditLogs"));
        batch.set(auditRef, {
          timestamp: new Date().toISOString(),
          action: "Compliance Scrape",
          user: profile?.displayName || "System",
          details: `Automated scrape of DDD/Medicaid/Medicare completed. ${data.updates.length} updates found.`,
          type: "system"
        });

        await batch.commit();
      }
    } catch (error) {
      console.error("Research Error:", error);
    } finally {
      setIsScraping(false);
    }
  };

  const handleIntakeLead = async (leadRaw: any) => {
    setIsParsingLead(true);
    try {
      const response = await fetch("/api/leads/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadData: leadRaw })
      });
      const data = await response.json();
      if (data.parsedLead) {
        const batch = writeBatch(db);
        const leadRef = doc(collection(db, "leads"));
        batch.set(leadRef, {
          ...data.parsedLead,
          status: "new",
          submittedAt: new Date().toISOString(),
          source: "Hospital Discharge"
        });

        // Add audit log
        const auditRef = doc(collection(db, "auditLogs"));
        batch.set(auditRef, {
          timestamp: new Date().toISOString(),
          action: "Lead Intake Triage",
          user: "Hermes AI Agent",
          details: `Lead for ${data.parsedLead.initials} parsed and assigned Tier ${data.parsedLead.preliminaryTier}.`,
          type: "system"
        });

        await batch.commit();
        alert(`Lead parsed successfully. Assigned Tier: ${data.parsedLead.preliminaryTier}`);
      }
    } catch (error) {
      console.error("Intake Error:", error);
    } finally {
      setIsParsingLead(false);
    }
  };

  const handleBatchOnboard = async () => {
    // ... (existing code)
  };

  const seedLicensing = async () => {
    try {
      const batch = writeBatch(db);
      const grgRef = doc(collection(db, "licensing"));
      batch.set(grgRef, {
        clientName: "Genesis Revitalization Group",
        licensingNumber: "1001",
        authorizedDomains: ["genesisrevitalization.com", "genesisrev.org"],
        active: true,
        createdAt: new Date().toISOString()
      });
      
      const ttRef = doc(collection(db, "licensing"));
      batch.set(ttRef, {
        clientName: "ThinkTank Solutions AI",
        licensingNumber: "9999",
        authorizedDomains: ["thinktanksolutionsai.co.site"],
        active: true,
        createdAt: new Date().toISOString()
      });

      await batch.commit();
      alert("Licensing data seeded successfully.");
    } catch (err) {
      console.error("Seeding error:", err);
      alert("Failed to seed licensing data.");
    }
  };

  const resolveGeofenceAlert = async (alertId: string) => {
    try {
      await updateDoc(doc(db, "geofenceAlerts", alertId), {
        resolved: true,
        resolvedAt: new Date().toISOString()
      });
      
      // Auto-log the resolution to the audit trail
      await addDoc(collection(db, "auditLogs"), {
        timestamp: new Date().toISOString(),
        action: "GEOFENCE_ALERT_RESOLVED",
        user: profile?.displayName || "Admin",
        details: `Alert ${alertId} was reviewed and marked as resolved by executive branch.`,
        type: "system"
      });
    } catch (error) {
      console.error("Error resolving alert:", error);
    }
  };

  const handleRectification = async (alertData: GeofenceAlert) => {
    // Initiate automated rectification steps
    alert(`Initiating Rectification Protocol for ${alertData.alertType}: Notifying Uplines and flagging account ${alertData.userEmail} for review.`);
    // This could also trigger a cloud function to send emails or lock accounts
  };

  const seedStaffDevelopment = async () => {
    try {
      const batch = writeBatch(db);
      
      const modules = [
        { title: "Danielle's Law (Life-Threantening Emergencies)", category: "Mandatory", timelineDays: 30, provider: "College of Direct Support", description: "Mandatory training for identifying and responding to life-threatening emergencies." },
        { title: "Stephen Komninos' Law", category: "Mandatory", timelineDays: 30, provider: "College of Direct Support", description: "Oversight and reporting requirements for staff working with individuals with developmental disabilities." },
        { title: "Incident Reporting & Review", category: "Mandatory", timelineDays: 30, provider: "In-House", description: "Detailed review of agency procedures on recording and reporting unusual incidents." },
        { title: "Genesis Mission & Values Orientation", category: "Orientation", timelineDays: 30, provider: "In-House", description: "Deep dive into Exellence as a Standard, human rights, and personnel policies." },
        { title: "Medication Administration (Online + Practicum)", category: "Clinical", timelineDays: 0, provider: "In-House", description: "Required prior to administering any medications. Includes competency assessment." },
        { title: "CPR & Standard First Aid", category: "Safety", timelineDays: 0, provider: "External", recertificationInterval: 24, description: "Nationally accredited training. Required prior to sole responsibility." },
        { title: "Preventing Abuse, Neglect & Exploitation (PANE)", category: "Mandatory", timelineDays: 60, provider: "College of Direct Support", description: "Foundational training on protecting individuals from maltreatment." },
        { title: "Basic Safety & Risk Management", category: "Safety", timelineDays: 60, provider: "In-House", description: "Home, community, and vehicle safety protocols balancing risk with individual choice." },
        { title: "Dual Diagnosis & Crisis Intervention", category: "Clinical", timelineDays: 120, provider: "Boggs Center", description: "Understanding behavior and effective supports for complex clinical needs." },
        { title: "Trauma-Informed Supports", category: "Clinical", timelineDays: 180, provider: "In-House", description: "Best practices for supporting individuals with trauma history." }
      ];

      modules.forEach((mod) => {
        const modRef = doc(collection(db, "trainingModules"));
        batch.set(modRef, { ...mod, createdAt: new Date().toISOString() });
      });

      await batch.commit();
      alert("Staff Development modules seeded successfully.");
    } catch (error) {
      console.error("Seeding Error:", error);
    }
  };

  if (!user || !isAdmin) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <ShieldCheck className="h-20 w-20 text-red-200 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-emerald-900">Access Denied</h2>
        <p className="text-stone-500">You do not have administrative privileges to view this page.</p>
      </div>
    );
  }

  const filteredAppointments = appointments.filter(a => 
    a.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statsData = [
    { name: "Confirmed", value: appointments.filter(a => a.status === "confirmed").length },
    { name: "Pending", value: appointments.filter(a => a.status === "pending").length },
    { name: "Cancelled", value: appointments.filter(a => a.status === "cancelled").length },
    { name: "Completed", value: appointments.filter(a => a.status === "completed").length },
  ];

  const COLORS = ["#10b981", "#f59e0b", "#ef4444", "#3b82f6"];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12 print:hidden">
        <div>
          <h1 className="text-3xl font-bold text-emerald-900">Admin Command Center</h1>
          <p className="text-stone-500">Manage patients, staff, and hospital operations</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handlePrint}
            className="bg-white border border-stone-200 text-stone-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-stone-50 transition-all shadow-sm"
          >
            <Printer className="h-4 w-4" />
            Print Audit Report
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-200 mb-8 overflow-x-auto print:hidden">
        {[
          { id: "overview", label: "Overview", icon: Activity },
          { id: "leads", label: "Lead Intake", icon: UserPlus },
          { id: "appointments", label: "Appointments", icon: Calendar },
          { id: "users", label: "Users & Staff", icon: Users },
          { id: "forms", label: "Form Submissions", icon: FileText },
          { id: "compliance", label: "Compliance (AI)", icon: ShieldAlert },
          { id: "facility", label: "Facility Tracking", icon: Map },
          { id: "billing", label: "Billing & Tiers", icon: FileText },
          { id: "alerts", label: "Geofence Alerts", icon: AlertTriangle },
          { id: "security", label: "Security (Shield Mode)", icon: Lock },
          { id: "safety", label: "Safety & Compliance", icon: ShieldCheck },
          { id: "orgchart", label: "Org Chart", icon: Network },
          { id: "licensing", label: "Licensing", icon: Key },
          { id: "staff-dev", label: "Staff Development", icon: GraduationCap },
          { id: "applications", label: "Applications", icon: UserPlus },
          { id: "access-logs", label: "Access Logs", icon: History },
          { id: "audit", label: "Audit Trail", icon: History },
          { id: "roadmap", label: "Audit Roadmap", icon: Map },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "px-6 py-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap",
              activeTab === tab.id ? "border-emerald-600 text-emerald-600" : "border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300"
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "overview" && (
          <motion.div 
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {geofenceAlerts.filter(a => a.severity === "critical").length > 0 && (
                <div className="md:col-span-4 bg-red-50 border border-red-100 p-6 rounded-3xl flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-red-600 flex items-center justify-center text-white animate-pulse">
                      <ShieldAlert className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="text-red-900 font-black text-xl">CRITICAL SECURITY BREACH DETECTED</div>
                      <div className="text-red-700 text-sm font-bold uppercase tracking-widest animate-bounce">Geofencing Failure - Immediate Rectification Required</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setActiveTab("alerts")}
                    className="bg-red-600 text-white px-8 py-3 rounded-2xl font-black text-sm hover:bg-red-700 shadow-xl shadow-red-200"
                  >
                    DEPLOY INTERVENTION
                  </button>
                </div>
              )}
              <div className="bg-white p-6 rounded-2xl border border-emerald-50 shadow-sm">
                <div className="text-stone-500 text-xs font-bold uppercase mb-2">Total Patients</div>
                <div className="text-3xl font-bold text-emerald-600">{users.filter(u => u.role === UserRole.PATIENT).length}</div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-emerald-50 shadow-sm">
                <div className="text-stone-500 text-xs font-bold uppercase mb-2">Active Staff</div>
                <div className="text-3xl font-bold text-emerald-600">{users.filter(u => u.role !== UserRole.PATIENT).length}</div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-emerald-50 shadow-sm">
                <div className="text-stone-500 text-xs font-bold uppercase mb-2">Appointments</div>
                <div className="text-3xl font-bold text-emerald-600">{appointments.length}</div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-emerald-50 shadow-sm">
                <div className="text-stone-500 text-xs font-bold uppercase mb-2">Forms Received</div>
                <div className="text-3xl font-bold text-emerald-600">{submissions.length}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-3xl border border-emerald-50 shadow-sm h-[400px]">
                <h3 className="font-bold text-emerald-900 mb-6">Appointment Status Distribution</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statsData}
                      cx="50%"
                      cy="45%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white p-8 rounded-3xl border border-emerald-50 shadow-sm h-[400px]">
                <h3 className="font-bold text-emerald-900 mb-6">Recent Activity</h3>
                <div className="space-y-4 overflow-y-auto h-[300px] pr-2">
                  {appointments.slice(0, 10).map((app, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-stone-50 rounded-xl text-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        <span>{app.patientName} booked with {app.doctorName}</span>
                      </div>
                      <span className="text-xs text-stone-400">{format(new Date(app.createdAt), "MMM d, HH:mm")}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "appointments" && (
          <motion.div 
            key="appointments"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center print:hidden">
              <div className="flex flex-1 gap-4 items-center w-full">
                <div className="relative flex-1 md:max-w-96">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                  <input 
                    type="text" 
                    placeholder="Search patients, doctors, or departments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                
                {selectedAppointments.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100"
                  >
                    <span className="text-xs font-bold text-emerald-700 whitespace-nowrap">
                      {selectedAppointments.length} selected
                    </span>
                    <div className="h-4 w-[1px] bg-emerald-200 mx-1" />
                    <select 
                      onChange={(e) => handleBulkUpdateStatus(e.target.value as any)}
                      className="text-xs font-bold bg-white border border-emerald-200 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-emerald-500"
                      defaultValue=""
                    >
                      <option value="" disabled>Update Status...</option>
                      <option value="pending">PENDING</option>
                      <option value="confirmed">CONFIRMED</option>
                      <option value="completed">COMPLETED</option>
                      <option value="cancelled">CANCELLED</option>
                    </select>
                    <button 
                      onClick={() => setSelectedAppointments([])}
                      className="text-stone-400 hover:text-stone-600 p-1"
                    >
                      <XCircle className="h-4 w-4" />
                    </button>
                  </motion.div>
                )}
              </div>
              <div className="flex gap-2">
                <button className="p-2 rounded-lg border border-stone-200 hover:bg-stone-50"><Filter className="h-5 w-5 text-stone-500" /></button>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-emerald-50 shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-stone-50 text-stone-500 text-xs font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4 w-10">
                      <input 
                        type="checkbox" 
                        checked={filteredAppointments.length > 0 && selectedAppointments.length === filteredAppointments.length}
                        onChange={toggleSelectAll}
                        className="rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                      />
                    </th>
                    <th className="px-6 py-4">Patient</th>
                    <th className="px-6 py-4">Doctor</th>
                    <th className="px-6 py-4">Department</th>
                    <th className="px-6 py-4">Date & Time</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right print:hidden">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-50">
                  {filteredAppointments.map((app) => (
                    <tr 
                      key={app.id} 
                      className={cn(
                        "hover:bg-emerald-50/20 transition-colors",
                        selectedAppointments.includes(app.id) && "bg-emerald-50/40"
                      )}
                    >
                      <td className="px-6 py-4">
                        <input 
                          type="checkbox" 
                          checked={selectedAppointments.includes(app.id)}
                          onChange={() => toggleSelect(app.id)}
                          className="rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                        />
                      </td>
                      <td className="px-6 py-4 font-bold text-emerald-900">{app.patientName}</td>
                      <td className="px-6 py-4 text-stone-600">{app.doctorName}</td>
                      <td className="px-6 py-4">
                        <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md text-xs font-semibold">
                          {app.department}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-stone-500">
                        <div>{app.date}</div>
                        <div className="text-xs">{app.time}</div>
                      </td>
                      <td className="px-6 py-4">
                        <select 
                          value={app.status}
                          onChange={(e) => handleUpdateStatus(app.id, e.target.value)}
                          className={cn(
                            "text-xs font-bold px-2 py-1 rounded-full border-none focus:ring-0 cursor-pointer print:appearance-none",
                            app.status === "confirmed" ? "bg-emerald-100 text-emerald-700" :
                            app.status === "pending" ? "bg-amber-100 text-amber-700" :
                            app.status === "cancelled" ? "bg-red-100 text-red-700" :
                            "bg-blue-100 text-blue-700"
                          )}
                        >
                          <option value="pending">PENDING</option>
                          <option value="confirmed">CONFIRMED</option>
                          <option value="completed">COMPLETED</option>
                          <option value="cancelled">CANCELLED</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-right print:hidden">
                        <button 
                          onClick={() => handleDelete(app.id, "appointments")}
                          className="text-stone-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === "users" && (
          <motion.div 
            key="users"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-emerald-900">Users & Staff</h2>
                <p className="text-stone-500 text-sm">Manage patient accounts and staff profiles</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-stone-100 p-1 rounded-xl flex">
                  <button 
                    onClick={() => setUserViewMode("table")}
                    className={cn(
                      "px-4 py-2 rounded-lg text-xs font-bold transition-all",
                      userViewMode === "table" ? "bg-white text-emerald-600 shadow-sm" : "text-stone-500 hover:text-stone-700"
                    )}
                  >
                    Table
                  </button>
                  <button 
                    onClick={() => setUserViewMode("cards")}
                    className={cn(
                      "px-4 py-2 rounded-lg text-xs font-bold transition-all",
                      userViewMode === "cards" ? "bg-white text-emerald-600 shadow-sm" : "text-stone-500 hover:text-stone-700"
                    )}
                  >
                    Cards
                  </button>
                </div>
                <button 
                  onClick={handleBatchOnboard}
                  className="bg-emerald-600 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-700"
                >
                  <Users className="h-4 w-4" />
                  Batch Onboard 11 Staff
                </button>
              </div>
            </div>

            {userViewMode === "table" ? (
              <div className="bg-white rounded-3xl border border-emerald-50 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-stone-50 text-stone-500 text-xs font-bold uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Name</th>
                      <th className="px-6 py-4">Email</th>
                      <th className="px-6 py-4">Role</th>
                      <th className="px-6 py-4">Onboarding</th>
                      <th className="px-6 py-4">Last Login</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-50">
                    {users.map((u) => {
                      const progress = calculateOnboardingProgress(u.onboardingProgress);
                      return (
                        <tr key={u.uid} className="hover:bg-emerald-50/20 transition-colors">
                          <td className="px-6 py-4 font-bold text-emerald-900">{u.displayName}</td>
                          <td className="px-6 py-4 text-stone-600">{u.email}</td>
                          <td className="px-6 py-4">
                            <span className={cn(
                              "text-[10px] font-bold px-2 py-1 rounded-full uppercase",
                              u.role === UserRole.ADMIN ? "bg-purple-100 text-purple-700" :
                              u.role === UserRole.DOCTOR ? "bg-emerald-100 text-emerald-700" :
                              u.role === UserRole.STAFF ? "bg-blue-100 text-blue-700" :
                              "bg-stone-100 text-stone-600"
                            )}>
                              {u.role}
                            </span>
                            <div className="text-[10px] text-stone-400 mt-1">{u.specialty}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                                <div 
                                  className={cn(
                                    "h-full transition-all",
                                    progress === 100 ? "bg-emerald-500" : "bg-amber-500"
                                  )} 
                                  style={{ width: `${progress}%` }}
                                ></div>
                              </div>
                              <span className={cn(
                                "text-[10px] font-bold",
                                progress === 100 ? "text-emerald-600" : "text-amber-600"
                              )}>
                                {progress}%
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-xs text-stone-500">
                            {u.lastLoginAt ? format(new Date(u.lastLoginAt), "MMM d, HH:mm") : "Never"}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button 
                              onClick={() => handleDelete(u.uid, "users")}
                              className="text-stone-300 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {users.map((u) => {
                  const progress = calculateOnboardingProgress(u.onboardingProgress);
                  const isOnboarded = progress === 100;
                  
                  return (
                    <motion.div 
                      key={u.uid}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white rounded-3xl border border-emerald-50 shadow-sm p-6 hover:shadow-md transition-all relative overflow-hidden group"
                    >
                      {isOnboarded && (
                        <div className="absolute top-0 right-0 p-2">
                          <CheckCircle className="h-5 w-5 text-emerald-500" />
                        </div>
                      )}
                      
                      <div className="flex items-center gap-4 mb-6">
                        <div className="bg-emerald-50 w-12 h-12 rounded-2xl flex items-center justify-center text-emerald-600 font-bold shrink-0">
                          {u.displayName.charAt(0)}
                        </div>
                        <div className="overflow-hidden">
                          <h3 className="font-bold text-emerald-900 truncate">{u.displayName}</h3>
                          <p className="text-[10px] text-stone-400 truncate">{u.email}</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className={cn(
                            "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase",
                            u.role === UserRole.ADMIN ? "bg-purple-100 text-purple-700" :
                            u.role === UserRole.DOCTOR ? "bg-emerald-100 text-emerald-700" :
                            u.role === UserRole.STAFF ? "bg-blue-100 text-blue-700" :
                            "bg-stone-100 text-stone-600"
                          )}>
                            {u.role}
                          </span>
                          <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">{u.specialty || "General"}</span>
                        </div>

                        {(u.role === UserRole.STAFF || u.role === UserRole.ADMIN || u.role === UserRole.DOCTOR) && (
                          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100">
                            <div className="flex justify-between items-end mb-2">
                              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Onboarding Progress</span>
                              <span className={cn(
                                "text-sm font-black",
                                isOnboarded ? "text-emerald-600" : "text-amber-600"
                              )}>{progress}%</span>
                            </div>
                            <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                              <div 
                                className={cn(
                                  "h-full transition-all duration-1000",
                                  isOnboarded ? "bg-emerald-500" : "bg-amber-500"
                                )} 
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            {isOnboarded ? (
                              <p className="text-[9px] text-emerald-600 mt-2 font-bold flex items-center gap-1">
                                <ShieldCheck className="h-3 w-3" /> All Modules Complete
                              </p>
                            ) : (
                              <p className="text-[9px] text-amber-600 mt-2 font-bold italic">
                                Credentials Verification Pending
                              </p>
                            )}
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2">
                          <div className="flex flex-col">
                            <span className="text-[9px] text-stone-400 uppercase font-black tracking-tighter">Last Active</span>
                            <span className="text-xs font-bold text-stone-600">{u.lastLoginAt ? format(new Date(u.lastLoginAt), "MMM d, HH:mm") : "Never"}</span>
                          </div>
                          <div className="flex gap-2">
                            <button className="p-2 rounded-xl border border-stone-100 text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all">
                              <MoreVertical className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete(u.uid, "users")}
                              className="p-2 rounded-xl border border-stone-100 text-stone-400 hover:text-red-500 hover:bg-red-50 transition-all"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "forms" && (
          <motion.div 
            key="forms"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-emerald-900">Form Submissions</h2>
            <div className="bg-white rounded-3xl border border-emerald-50 shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-stone-50 text-stone-500 text-xs font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Submitted At</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-50">
                  {submissions.map((form) => (
                    <tr key={form.id} className="hover:bg-emerald-50/20 transition-colors">
                      <td className="px-6 py-4 font-bold text-emerald-900 uppercase">{form.formType}</td>
                      <td className="px-6 py-4 text-stone-600">{format(new Date(form.submittedAt), "MMM d, yyyy HH:mm")}</td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "text-[10px] font-bold px-2 py-1 rounded-full uppercase",
                          form.status === "pending" ? "bg-amber-100 text-amber-700" :
                          form.status === "reviewed" ? "bg-emerald-100 text-emerald-700" :
                          "bg-stone-100 text-stone-600"
                        )}>
                          {form.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleDelete(form.id, "formSubmissions")}
                          className="text-stone-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === "compliance" && (
          <motion.div 
            key="compliance"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-emerald-900">Karpathy Autorearch Tool</h2>
                <p className="text-stone-500 text-sm">Automated regulatory compliance monitoring (DDD, Medicaid, Medicare)</p>
              </div>
              <button 
                onClick={runComplianceScrape}
                disabled={isScraping}
                className="bg-emerald-600 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-700 disabled:opacity-50"
              >
                <RefreshCw className={cn("h-4 w-4", isScraping && "animate-spin")} />
                {isScraping ? "Scraping Agencies..." : "Run Daily Scrape"}
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {complianceUpdates.map((update) => (
                <div key={update.id} className="bg-white p-6 rounded-2xl border border-emerald-50 shadow-sm flex justify-between items-start">
                  <div className="flex gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                      update.severity === "critical" ? "bg-red-100 text-red-600" :
                      update.severity === "high" ? "bg-orange-100 text-orange-600" :
                      "bg-emerald-100 text-emerald-600"
                    )}>
                      <ShieldAlert className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-stone-400">{update.source}</span>
                        {update.regulatoryBody && (
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
                            {update.regulatoryBody}
                          </span>
                        )}
                        {update.policyArea && (
                          <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-bold uppercase">
                            {update.policyArea}
                          </span>
                        )}
                        <span className={cn(
                          "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase",
                          update.severity === "critical" ? "bg-red-100 text-red-700" : 
                          update.severity === "high" ? "bg-orange-100 text-orange-700" :
                          "bg-stone-100 text-stone-600"
                        )}>
                          {update.severity}
                        </span>
                      </div>
                      <h3 className="font-bold text-emerald-900 mb-2">{update.title}</h3>
                      <p className="text-sm text-stone-600 leading-relaxed mb-4">{update.summary}</p>
                      
                      {update.actionItems && update.actionItems.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-[10px] font-black text-stone-900 uppercase tracking-widest flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-emerald-600" />
                            Action Items for Resolution
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {update.actionItems.map((item, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-xs text-stone-500 bg-stone-50 p-2 rounded-lg border border-stone-100">
                                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                                {item}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-stone-400 mb-4">{format(new Date(update.createdAt), "MMM d, yyyy")}</div>
                    {update.actionRequired && (
                      <span className="bg-red-50 text-red-600 text-[10px] font-bold px-3 py-1 rounded-full border border-red-100">
                        ACTION REQUIRED
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {complianceUpdates.length === 0 && (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-stone-200">
                  <Sparkles className="h-12 w-12 text-stone-200 mx-auto mb-4" />
                  <p className="text-stone-400">No compliance updates found. Run a scrape to check for new regulations.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === "leads" && (
          <motion.div 
            key="leads"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-emerald-900">Lead Intake & Autonomous Triage</h2>
                <p className="text-stone-500 text-sm">Hermes AI Agent parsing hospital discharge notes and assigning NJCAT Tiers</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-stone-100 p-1 rounded-xl flex">
                  <button 
                    onClick={() => setLeadViewMode("table")}
                    className={cn(
                      "px-4 py-2 rounded-lg text-xs font-bold transition-all",
                      leadViewMode === "table" ? "bg-white text-emerald-600 shadow-sm" : "text-stone-500 hover:text-stone-700"
                    )}
                  >
                    Lead Bank
                  </button>
                  <button 
                    onClick={() => setLeadViewMode("assistant")}
                    className={cn(
                      "px-4 py-2 rounded-lg text-xs font-bold transition-all",
                      leadViewMode === "assistant" ? "bg-white text-emerald-600 shadow-sm" : "text-stone-500 hover:text-stone-700"
                    )}
                  >
                    AI Assistant
                  </button>
                </div>
              </div>
            </div>

            {leadViewMode === "table" ? (
              <div className="bg-white rounded-3xl border border-emerald-50 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-stone-50 text-stone-500 text-xs font-bold uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Initials</th>
                      <th className="px-6 py-4">Medicaid ID</th>
                      <th className="px-6 py-4">Diagnosis</th>
                      <th className="px-6 py-4">Risk Level</th>
                      <th className="px-6 py-4">Tier Assignment</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-50">
                    {leads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-emerald-50/20 transition-colors">
                        <td className="px-6 py-4 font-bold text-emerald-900">{lead.initials}</td>
                        <td className="px-6 py-4 text-stone-600 font-mono">{lead.medicaidId}</td>
                        <td className="px-6 py-4 text-xs text-stone-500">{lead.primaryDiagnosis}</td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "text-[10px] font-bold px-2 py-1 rounded-full uppercase",
                            lead.behavioralRisk.toLowerCase().includes("high") ? "bg-red-100 text-red-700" : "bg-stone-100 text-stone-600"
                          )}>
                            {lead.behavioralRisk}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-black text-emerald-600">Tier {lead.preliminaryTier}</span>
                            {["D", "E", "F"].includes(lead.preliminaryTier) && (
                              <AlertTriangle className="h-4 w-4 text-amber-500" />
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 uppercase">
                            {lead.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => handleDelete(lead.id, "leads")}
                            className="text-stone-300 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <LeadIntakeAssistant />
            )}
          </motion.div>
        )}

        {activeTab === "licensing" && (
          <motion.div 
            key="licensing"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-emerald-900">Licensing Management</h2>
                <p className="text-stone-500 text-sm">Manage client licensing numbers and authorized domains</p>
              </div>
              <button 
                onClick={seedLicensing}
                className="bg-emerald-600 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-700"
              >
                <Sparkles className="h-4 w-4" />
                Seed Initial Licensing
              </button>
            </div>
            <div className="bg-white rounded-3xl border border-emerald-50 shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-stone-50 text-stone-500 text-xs font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Client Name</th>
                    <th className="px-6 py-4">License #</th>
                    <th className="px-6 py-4">Authorized Domains</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-50">
                  {licensing.map((l) => (
                    <tr key={l.id} className="hover:bg-emerald-50/20 transition-colors">
                      <td className="px-6 py-4 font-bold text-emerald-900">{l.clientName}</td>
                      <td className="px-6 py-4 font-mono text-emerald-600">{l.licensingNumber}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {l.authorizedDomains?.map((d: string) => (
                            <span key={d} className="bg-stone-100 text-stone-600 px-2 py-0.5 rounded text-[10px] font-medium">
                              {d}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "text-[10px] font-bold px-2 py-1 rounded-full uppercase",
                          l.active ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                        )}>
                          {l.active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleDelete(l.id, "licensing")}
                          className="text-stone-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === "applications" && (
          <motion.div 
            key="applications"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-emerald-900">Applicant Tracking</h2>
                <p className="text-stone-500 text-sm">Review initial interest and position applications</p>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-emerald-50 shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-stone-50 text-stone-500 text-xs font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Applicant</th>
                    <th className="px-6 py-4">Position</th>
                    <th className="px-6 py-4">CALN</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Submitted</th>
                    <th className="px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-50">
                  {applications.map((app) => (
                    <tr key={app.id} className="hover:bg-emerald-50/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-emerald-900">{app.fullName}</div>
                        <div className="text-xs text-stone-500">{app.email}</div>
                      </td>
                      <td className="px-6 py-4 text-stone-600 font-medium">{app.position}</td>
                      <td className="px-6 py-4 text-xs font-mono text-stone-400">{app.licensingNumber}</td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "text-[10px] font-bold px-2 py-1 rounded-full uppercase",
                          app.status === "pending" ? "bg-amber-100 text-amber-700" :
                          app.status === "reviewed" ? "bg-blue-100 text-blue-700" :
                          app.status === "contacted" ? "bg-emerald-100 text-emerald-700" :
                          "bg-red-100 text-red-700"
                        )}>
                          {app.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-stone-400">
                        {format(new Date(app.submittedAt), "MMM d, yyyy")}
                      </td>
                      <td className="px-6 py-4">
                        <button className="text-emerald-600 hover:text-emerald-700 font-bold text-xs uppercase tracking-wider">
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === "access-logs" && (
          <motion.div 
            key="access-logs"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-emerald-900">Access & Security Logs</h2>
            <div className="bg-white rounded-3xl border border-emerald-50 shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-stone-50 text-stone-500 text-xs font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">User Email</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Timestamp</th>
                    <th className="px-6 py-4">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-50">
                  {accessLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-emerald-50/20 transition-colors">
                      <td className="px-6 py-4 font-medium text-emerald-900">{log.email}</td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "text-[10px] font-bold px-2 py-1 rounded-full uppercase",
                          log.status === "success" ? "bg-emerald-100 text-emerald-700" :
                          log.status === "flagged" ? "bg-amber-100 text-amber-700" :
                          "bg-red-100 text-red-700"
                        )}>
                          {log.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-stone-500">
                        {format(new Date(log.timestamp), "MMM d, HH:mm:ss")}
                      </td>
                      <td className="px-6 py-4 text-xs text-stone-600 max-w-xs truncate">
                        {log.details}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
        {activeTab === "audit" && (
          <motion.div 
            key="audit"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-emerald-900">Tamper-Proof Audit Trail</h2>
                <p className="text-stone-500 text-sm">Immutable record of every AI trigger, manual log, and system override</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    const event = new CustomEvent('open-staff-agent', { detail: { agentType: "Auditor Mode" } });
                    window.dispatchEvent(event);
                  }}
                  className="bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-lg"
                >
                  <Sparkles className="h-4 w-4" />
                  Verify Hiring Process (AI Audit)
                </button>
                <button 
                  onClick={() => {
                    const event = new CustomEvent('open-staff-agent', { detail: { agentType: "Shield Mode" } });
                    window.dispatchEvent(event);
                  }}
                  className="bg-stone-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-black transition-all"
                >
                  <ShieldCheck className="h-4 w-4" />
                  Activate Shield Mode
                </button>
                <button className="bg-white border border-stone-200 text-stone-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-stone-50 transition-all">
                  <Printer className="h-4 w-4" />
                  Export for State Review
                </button>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-emerald-50 shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-stone-50 text-stone-500 text-xs font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Timestamp</th>
                    <th className="px-6 py-4">Action</th>
                    <th className="px-6 py-4">User/Agent</th>
                    <th className="px-6 py-4">Details</th>
                    <th className="px-6 py-4">Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-50">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-emerald-50/20 transition-colors">
                      <td className="px-6 py-4 text-xs text-stone-400 font-mono">
                        {format(new Date(log.timestamp), "yyyy-MM-dd HH:mm:ss")}
                      </td>
                      <td className="px-6 py-4 font-bold text-emerald-900">{log.action}</td>
                      <td className="px-6 py-4 text-stone-600">{log.user}</td>
                      <td className="px-6 py-4 text-xs text-stone-500 max-w-md">{log.details}</td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "text-[10px] font-bold px-2 py-1 rounded-full uppercase",
                          log.type === "system" ? "bg-blue-50 text-blue-700" :
                          log.type === "override" ? "bg-red-50 text-red-700" :
                          "bg-stone-50 text-stone-600"
                        )}>
                          {log.type}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === "roadmap" && (
          <motion.div 
            key="roadmap"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            <div className="bg-emerald-900 text-white p-12 rounded-[3rem] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-800/50 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
              <div className="relative z-10">
                <h2 className="text-4xl font-bold mb-4">Autonomous OS Roadmap</h2>
                <p className="text-emerald-200 max-w-2xl text-lg">
                  Visualizing the "Migration in Progress" dashboard for state walk-throughs and audit readiness.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { 
                  title: "Stage 1: Lead Intake", 
                  status: "Active", 
                  desc: "Hermes Agent parsing unstructured discharge notes into structured JSON.",
                  icon: UserPlus,
                  color: "emerald",
                  agent: "Hermes"
                },
                { 
                  title: "Stage 2: Onboarding", 
                  status: "Active", 
                  desc: "TiBa creating Digital Personnel Files with NPI Buffer verification.",
                  icon: ShieldCheck,
                  color: "blue",
                  agent: "Safety Guardian"
                },
                { 
                  title: "Stage 3: Safety Pulse", 
                  status: "Active", 
                  desc: "Performance Auditor pings DSPs every 15 mins for geospatial safety.",
                  icon: Activity,
                  color: "amber",
                  agent: "Performance Auditor"
                },
                { 
                  title: "Stage 4: Tier Billing", 
                  status: "In Progress", 
                  desc: "Billing Agent scanning logs for acuity evidence and auto-filing claims.",
                  icon: FileText,
                  color: "purple",
                  agent: "Compliance Specialist"
                },
                { 
                  title: "Data Firewall", 
                  status: "Secured", 
                  desc: "Strict separation between Pre-2026 legacy data and current operations.",
                  icon: Lock,
                  color: "red",
                  agent: "Shield Mode"
                },
                { 
                  title: "Audit Trail", 
                  status: "Live", 
                  desc: "Immutable GitHub-linked commit logs for every system action.",
                  icon: History,
                  color: "stone"
                }
              ].map((item, i) => (
                <div 
                  key={i} 
                  onClick={() => {
                    if (item.agent) {
                      const event = new CustomEvent('open-staff-agent', { detail: { agentType: item.agent } });
                      window.dispatchEvent(event);
                    }
                  }}
                  className="bg-white p-8 rounded-3xl border border-stone-100 shadow-sm hover:shadow-md transition-all group cursor-pointer"
                >
                  <div className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform",
                    `bg-${item.color}-50 text-${item.color}-600`
                  )}>
                    <item.icon className="h-8 w-8" />
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-emerald-900 text-lg">{item.title}</h3>
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-1 rounded-full uppercase",
                      item.status === "Active" ? "bg-emerald-100 text-emerald-700" :
                      item.status === "In Progress" ? "bg-amber-100 text-amber-700" :
                      item.status === "Secured" ? "bg-blue-100 text-blue-700" :
                      "bg-stone-100 text-stone-600"
                    )}>
                      {item.status}
                    </span>
                  </div>
                  <p className="text-sm text-stone-500 leading-relaxed">{item.desc}</p>
                  {item.agent && (
                    <div className="mt-4 flex items-center gap-1 text-[10px] font-bold text-emerald-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                      <Sparkles className="h-3 w-3" />
                      Open {item.agent} Agent
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Litigation Archive (Lockdown Section) */}
            <div className="bg-stone-50 p-12 rounded-[3rem] border border-stone-200 border-dashed">
              <div className="flex items-center gap-4 mb-8">
                <Lock className="h-8 w-8 text-stone-400" />
                <h2 className="text-2xl font-bold text-stone-800">Litigation Archive (Pre-April 2026)</h2>
              </div>
              
              {!isLitigationAdmin ? (
                <div className="bg-white p-12 rounded-3xl border border-red-100 text-center">
                  <ShieldAlert className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-red-900 mb-2">Access Restricted</h3>
                  <p className="text-stone-500 max-w-md mx-auto">
                    This archive contains sensitive legacy data. Access is strictly limited to the Litigation Administrator (Lanee Foster).
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-emerald-600" />
                      <span className="font-bold text-emerald-900">Archive Access Granted (Lanee Foster)</span>
                    </div>
                    <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-emerald-700">
                      Open Archive Explorer
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      "2024-2025 Incident Reports",
                      "Legacy Billing Records",
                      "Historical Digital Personnel Files",
                      "Previous Facility SOPs"
                    ].map((file, i) => (
                      <div key={i} className="bg-white p-4 rounded-xl border border-stone-200 flex items-center justify-between group hover:border-emerald-300 transition-all cursor-pointer">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-stone-400 group-hover:text-emerald-500" />
                          <span className="text-sm font-medium text-stone-700">{file}</span>
                        </div>
                        <Eye className="h-4 w-4 text-stone-300 group-hover:text-emerald-500" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
        {activeTab === "facility" && (
          <motion.div 
            key="facility"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-emerald-900">Live Facility Oversight</h2>
                <p className="text-stone-500 text-sm">Real-time GPS & Geofencing tracking for all staff, clients, and visitors</p>
              </div>
              <div className="flex gap-4 items-center">
                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-100 rounded-full">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Local Server Sync: Active</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1 space-y-4">
                {[
                  { label: "Direct Support Staff", count: facilityPresence.filter(p => p.type === "staff" && p.status === "in").length, total: users.filter(u => u.role === "staff").length, icon: Users, color: "blue" },
                  { label: "Clients On-Site", count: facilityPresence.filter(p => p.type === "client" && p.status === "in").length, total: users.filter(u => u.role === "patient").length, icon: HeartPulse, color: "emerald" },
                  { label: "Off-Site Respite", count: facilityPresence.filter(p => p.status === "off-site_respite").length, icon: Map, color: "amber" },
                  { label: "Site Visitors", count: facilityPresence.filter(p => p.type === "visitor" || p.type === "tour_guest").length, icon: Eye, color: "purple" }
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-4 rounded-2xl border border-stone-100 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className={cn("p-2 rounded-lg bg-stone-50", `text-${stat.color}-600`)}>
                        <stat.icon className="h-5 w-5" />
                      </div>
                      <span className="text-2xl font-bold text-stone-900">{stat.count}{stat.total ? `/${stat.total}` : ""}</span>
                    </div>
                    <div className="text-xs font-medium text-stone-500 uppercase tracking-wider">{stat.label}</div>
                  </div>
                ))}
              </div>

              <div className="lg:col-span-3 bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden flex flex-col h-[600px]">
                <div className="p-4 border-b bg-stone-50 flex justify-between items-center">
                  <div className="flex items-center gap-2 font-bold text-emerald-900">
                    <Map className="h-5 w-5" />
                    Interactive Facility Map (GPS Failsafe)
                  </div>
                  <div className="text-xs text-stone-400">Resolution: 1.5m | Geofence Radius: 200m</div>
                </div>
                <div className="flex-1 bg-stone-100 relative overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 opacity-20 pointer-events-none">
                    <div className="absolute inset-0 border-2 border-emerald-500/20 rounded-full w-[400px] h-[400px] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-ping" />
                    <div className="absolute left-1/2 top-1/2 w-4 h-4 bg-emerald-600 rounded-full -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <div className="text-stone-400 text-sm flex flex-col items-center gap-2">
                    <Map className="h-8 w-8 opacity-20" />
                    <span>Real-time Spatial Overlay (PWA Geofencing Active)</span>
                  </div>
                  
                  {/* Presence Markers (Simulated Mapping) */}
                  {facilityPresence.filter(p => p.status === "in").map((p, i) => (
                    <motion.div
                      key={p.uid}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute"
                      style={{ 
                        left: `${50 + (Math.random() * 40 - 20)}%`, 
                        top: `${50 + (Math.random() * 40 - 20)}%` 
                      }}
                    >
                      <div className="group relative">
                        <div className={cn(
                          "w-3 h-3 rounded-full border-2 border-white shadow-sm cursor-help",
                          p.geofenceStatus === "breached" ? "bg-red-500 animate-bounce" : "bg-emerald-500"
                        )} />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-stone-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10">
                          {p.displayName} ({p.activityRoom || "Main Lobby"})
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="p-4 border-t overflow-x-auto">
                    <div className="flex gap-4">
                        {facilityPresence.map((p) => (
                            <div key={p.uid} className="flex-shrink-0 flex items-center gap-3 bg-stone-50 px-3 py-2 rounded-xl border border-stone-200">
                                <div className={cn("w-2 h-2 rounded-full", p.status === "in" ? "bg-emerald-500" : "bg-stone-300")} />
                                <div>
                                    <div className="text-[10px] font-bold text-stone-900 truncate max-w-[100px]">{p.displayName}</div>
                                    <div className="text-[8px] text-stone-400 tracking-tighter uppercase">{p.type} • {p.status}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "billing" && (
          <motion.div 
            key="billing"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-emerald-900">AI Billing & Tier Tracking</h2>
                <p className="text-stone-500 text-sm">Automated reconciliation of activity hours, GPS verification, and NJCAT Tiers</p>
              </div>
              <div className="flex gap-2">
                <button className="bg-white border border-stone-200 text-stone-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-stone-50 transition-all font-bold text-sm">
                  <Printer className="h-4 w-4" />
                  Generate Managed Care Report
                </button>
                <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-emerald-700 transition-all font-bold text-sm">
                  <CheckCircle className="h-4 w-4" />
                  Approve All Verified Logs
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: "Billable (Verified)", value: `$${billingLogs.filter(b => b.gpsVerified).reduce((acc, b) => acc + (b.amount || 0), 0).toLocaleString()}`, desc: "GPS & PWA Authenticated", icon: ShieldCheck, color: "emerald" },
                { title: "Pending Review", value: `$${billingLogs.filter(b => !b.gpsVerified).reduce((acc, b) => acc + (b.amount || 0), 0).toLocaleString()}`, desc: "Missing Spatial Evidence", icon: AlertTriangle, color: "amber" },
                { title: "Total Revenue Forecast", value: `$${billingLogs.reduce((acc, b) => acc + (b.amount || 0), 0).toLocaleString()}`, desc: "Current Month Estimate", icon: BarChart, color: "blue" }
              ].map((stat, i) => (
                <div key={i} className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={cn("p-3 rounded-2xl bg-stone-50", `text-${stat.color}-600`)}>
                      <stat.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="text-2xl font-black text-stone-900">{stat.value}</div>
                      <div className="text-xs font-bold text-stone-400 uppercase tracking-tight">{stat.title}</div>
                    </div>
                  </div>
                  <div className="text-[10px] text-stone-400 italic">Source: {stat.desc}</div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-stone-50 text-stone-500 text-xs font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Client/User</th>
                    <th className="px-6 py-4">Activity Room / Tier</th>
                    <th className="px-6 py-4">Duration</th>
                    <th className="px-6 py-4">GPS Verified</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-50">
                  {billingLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-emerald-50/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-emerald-900">{log.userName}</div>
                        <div className="text-[10px] text-stone-400 uppercase">{log.type}</div>
                      </td>
                      <td className="px-6 py-4 text-stone-600 font-medium">
                        <div className="flex items-center gap-2">
                           <span className="bg-stone-100 px-2 py-0.5 rounded text-xs">{log.activityRoom || "General"}</span>
                           <span className="text-emerald-600 font-black">Tier {log.tier}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-stone-500 font-mono">
                        {log.durationMinutes}m ({format(new Date(log.startTime), "HH:mm")} - {log.endTime ? format(new Date(log.endTime), "HH:mm") : "..."})
                      </td>
                      <td className="px-6 py-4">
                        {log.gpsVerified ? (
                          <div className="flex items-center gap-1 text-emerald-600 font-bold text-[10px]">
                            <ShieldCheck className="h-3 w-3" />
                            AUTHENTICATED
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-amber-500 font-bold text-[10px]">
                            <AlertTriangle className="h-3 w-3" />
                            MANUAL LOG
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 font-bold text-emerald-900">${log.amount}</td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "text-[10px] font-bold px-2 py-1 rounded-full uppercase",
                          log.status === "approved" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                        )}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {billingLogs.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-20 text-stone-400 italic">No billing logs detected for current cycle.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === "alerts" && (
          <motion.div 
            key="alerts"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-red-900">Security & Oversite Alarms</h2>
                <p className="text-stone-500 text-sm">High-criticality alerts triggering executive branch notification</p>
              </div>
              <button 
                onClick={() => {
                  const event = new CustomEvent('open-staff-agent', { detail: { agentType: "Executive Guard" } });
                  window.dispatchEvent(event);
                }}
                className="bg-red-600 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-red-700 shadow-lg shadow-red-200"
              >
                <ShieldAlert className="h-4 w-4" />
                Contact Executive Branch
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {geofenceAlerts.map((alert) => (
                <div key={alert.id} className={cn(
                  "p-6 rounded-3xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all hover:scale-[1.01]",
                  alert.severity === "critical" ? "bg-red-50 border-red-100" : "bg-orange-50 border-orange-100"
                )}>
                  <div className="flex gap-6 items-start">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm",
                      alert.severity === "critical" ? "bg-red-600 text-white" : "bg-orange-500 text-white"
                    )}>
                      <AlertTriangle className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">{format(new Date(alert.timestamp), "MMM d, HH:mm:ss")}</span>
                        <span className={cn(
                          "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase",
                          alert.severity === "critical" ? "bg-red-600 text-white" : "bg-orange-500 text-white"
                        )}>
                          {alert.severity}
                        </span>
                      </div>
                      <h3 className="text-xl font-black text-stone-900 mb-1">{alert.alertType.replace("_", " ")}</h3>
                      <p className="text-sm text-stone-600 leading-relaxed max-w-xl">{alert.details}</p>
                      <div className="mt-2 text-xs font-bold text-stone-400">User: {alert.userEmail}</div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 w-full md:w-auto">
                    {!alert.resolved ? (
                      <>
                        <button 
                          onClick={() => handleRectification(alert)}
                          className={cn(
                            "px-6 py-3 rounded-xl font-bold transition-all shadow-sm",
                            alert.severity === "critical" ? "bg-red-600 text-white hover:bg-red-700" : "bg-orange-500 text-white hover:bg-orange-600"
                          )}
                        >
                          INITIATE RECTIFICATION
                        </button>
                        <button 
                          onClick={() => resolveGeofenceAlert(alert.id)}
                          className="px-6 py-3 rounded-xl font-bold bg-white text-stone-700 border border-stone-200 hover:bg-stone-50 transition-all shadow-sm"
                        >
                          MARK RESOLVED
                        </button>
                      </>
                    ) : (
                      <div className="flex items-center gap-2 text-emerald-600 font-bold px-6 py-3">
                        <ShieldCheck className="h-5 w-5" />
                        RESOLVED
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {geofenceAlerts.length === 0 && (
                <div className="text-center py-24 bg-white rounded-[3rem] border border-dashed border-stone-200">
                    <ShieldCheck className="h-16 w-16 text-emerald-100 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-emerald-900">Security Standards: COMPLIANT</h3>
                    <p className="text-stone-400 mt-2">Zero active geofence breaches or security failures detected.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
        {activeTab === "staff-dev" && (
          <motion.div 
            key="staff-dev"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-emerald-900">Staff Development & Certification</h2>
                <p className="text-stone-500 text-sm">Managing mandatory training, continued education, and growth-based reimbursements.</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={seedStaffDevelopment}
                  className="bg-white border border-stone-200 text-stone-700 px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-stone-50 transition-all font-bold text-sm"
                >
                  <RefreshCw className="h-4 w-4" />
                  Seed DDD Mandates
                </button>
                <button className="bg-emerald-600 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-700 shadow-lg shadow-emerald-200">
                  <Plus className="h-4 w-4" />
                  Create Custom Module
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: "Overall Compliance", value: `${Math.round((staffTrainingRecords.filter(r => r.status === 'completed').length / (users.filter(u => u.role === 'staff').length * trainingModules.filter(m => m.category === 'Mandatory').length || 1)) * 100)}%`, icon: Award, color: "emerald", desc: "Mandatory training metrics" },
                { label: "Pending Renewals", value: staffTrainingRecords.filter(r => r.status === 'needs_renewal').length, icon: AlertTriangle, color: "amber", desc: "Certifications expiring < 30 days" },
                { label: "Reimbursement Fund", value: `$${reimbursementRequests.filter(r => r.status === 'approved' || r.status === 'paid').reduce((acc, r) => acc + r.amount, 0).toLocaleString()}`, icon: DollarSign, color: "blue", desc: "Year-to-date growth investment" }
              ].map((stat, i) => (
                <div key={i} className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm relative overflow-hidden group">
                  <div className={cn("absolute top-0 right-0 w-24 h-24 rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl opacity-10", `bg-${stat.color}-500`)}></div>
                  <div className="flex items-center gap-4 relative z-10">
                    <div className={cn("p-3 rounded-2xl", `bg-${stat.color}-50 text-${stat.color}-600`)}>
                      <stat.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="text-2xl font-black text-stone-900">{stat.value}</div>
                      <div className="text-xs font-bold text-stone-400 uppercase tracking-tight">{stat.label}</div>
                    </div>
                  </div>
                  <p className="mt-4 text-[10px] text-stone-400 italic">{stat.desc}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               {/* Training Modules List */}
               <div className="bg-white rounded-[2rem] border border-stone-100 shadow-sm overflow-hidden h-[500px] flex flex-col">
                  <div className="p-6 border-b bg-stone-50 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-emerald-900">
                      <GraduationCap className="h-5 w-5" />
                      Global Training Catalog
                    </div>
                    <span className="text-[10px] bg-stone-200 text-stone-600 px-2 py-0.5 rounded-full font-bold">{trainingModules.length} Modules</span>
                  </div>
                  <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {trainingModules.map((mod) => (
                      <div key={mod.id} className="p-4 rounded-xl border border-stone-50 hover:border-emerald-100 hover:bg-emerald-50/10 transition-all flex justify-between items-start group">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-stone-800 text-sm group-hover:text-emerald-700 transition-colors">{mod.title}</h4>
                            <span className={cn(
                              "text-[8px] font-bold px-1.5 py-0.5 rounded uppercase",
                              mod.category === "Mandatory" ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
                            )}>{mod.category}</span>
                          </div>
                          <p className="text-[10px] text-stone-500 leading-tight max-w-sm line-clamp-1 group-hover:line-clamp-none transition-all">{mod.description}</p>
                          <div className="flex items-center gap-3 text-[9px] text-stone-400 font-bold uppercase tracking-tighter">
                            <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {mod.provider}</span>
                            <span className="flex items-center gap-1"><History className="h-3 w-3" /> {mod.timelineDays === 0 ? "Prerequisite" : `${mod.timelineDays} Days From Hire`}</span>
                          </div>
                        </div>
                        <button className="p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white rounded-lg border border-stone-100">
                          <Eye className="h-4 w-4 text-emerald-600" />
                        </button>
                      </div>
                    ))}
                  </div>
               </div>

               {/* Reimbursement Requests */}
               <div className="bg-white rounded-[2rem] border border-stone-100 shadow-sm overflow-hidden h-[500px] flex flex-col">
                  <div className="p-6 border-b bg-stone-50 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-emerald-900">
                      <DollarSign className="h-5 w-5" />
                      Growth & Reimbursement Claims
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {reimbursementRequests.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-stone-400 space-y-2 italic">
                        <Zap className="h-12 w-12 opacity-20" />
                        <p>No investment claims pending.</p>
                      </div>
                    ) : (
                      reimbursementRequests.map((req) => (
                        <div key={req.id} className="p-4 rounded-2xl border border-stone-100 bg-stone-50/30">
                          <div className="flex justify-between items-start mb-2">
                             <div>
                                <h4 className="font-bold text-stone-900 text-sm">{req.courseTitle}</h4>
                                <p className="text-xs text-stone-500">{req.staffName}</p>
                             </div>
                             <div className="text-right">
                                <span className="font-bold text-emerald-600">${req.amount}</span>
                                <div className={cn(
                                  "text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase block",
                                  req.status === 'pending' ? "bg-amber-100 text-amber-700" :
                                  req.status === 'approved' ? "bg-emerald-100 text-emerald-700" :
                                  "bg-stone-200 text-stone-600"
                                )}>{req.status}</div>
                             </div>
                          </div>
                          <div className="flex gap-2 mt-4">
                            <button className="flex-1 bg-white border border-stone-200 py-1.5 rounded-lg text-[10px] font-bold hover:bg-stone-50 transition-colors">View Receipt</button>
                            {req.status === 'pending' && (
                              <button className="flex-1 bg-emerald-600 text-white py-1.5 rounded-lg text-[10px] font-bold hover:bg-emerald-700 transition-colors">Approve Claim</button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
               </div>
            </div>

            {/* Compliance Matrix */}
            <div className="bg-white rounded-[2rem] border border-stone-100 shadow-sm overflow-hidden">
               <div className="p-6 border-b bg-stone-50 flex items-center justify-between">
                  <h3 className="font-bold text-emerald-900">Staff Compliance Matrix (April 2026 Audit View)</h3>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-1.5 text-xs text-stone-500">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div> Complete
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-stone-500">
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div> Pending
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-stone-500">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div> Overdue
                    </div>
                  </div>
               </div>
               <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                   <thead className="bg-stone-50/50 text-stone-400 text-[10px] font-black uppercase tracking-widest border-b">
                     <tr>
                       <th className="px-6 py-4">Staff Member</th>
                       {trainingModules.filter(m => m.category === 'Mandatory').map(m => (
                         <th key={m.id} className="px-4 py-4 text-center max-w-[80px] truncate">{m.title}</th>
                       ))}
                       <th className="px-6 py-4 text-right">Status</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-stone-50">
                     {users.filter(u => u.role === UserRole.STAFF).map((staff) => {
                        const mandatoryModules = trainingModules.filter(m => m.category === 'Mandatory');
                        const completedCount = staffTrainingRecords.filter(r => r.staffId === staff.uid && r.status === 'completed' && mandatoryModules.some(m => m.id === r.moduleId)).length;
                        const isCompliant = completedCount === mandatoryModules.length;

                        return (
                          <tr key={staff.uid} className="hover:bg-emerald-50/10 transition-colors">
                            <td className="px-6 py-4">
                              <div className="font-bold text-stone-800 text-sm">{staff.displayName}</div>
                              <div className="text-[10px] text-stone-400">{staff.email}</div>
                            </td>
                            {mandatoryModules.map(m => {
                              const record = staffTrainingRecords.find(r => r.staffId === staff.uid && r.moduleId === m.id);
                              return (
                                <td key={m.id} className="px-4 py-4 text-center">
                                  <div className={cn(
                                    "w-3 h-3 rounded-full mx-auto",
                                    record?.status === 'completed' ? "bg-emerald-500" :
                                    record?.status === 'in_progress' ? "bg-amber-500" :
                                    "bg-red-400 opacity-20"
                                  )}></div>
                                </td>
                              );
                            })}
                            <td className="px-6 py-4 text-right">
                              <span className={cn(
                                "text-[10px] font-black px-2 py-1 rounded-full uppercase",
                                isCompliant ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                              )}>{isCompliant ? "Compliant" : "Deficient"}</span>
                            </td>
                          </tr>
                        );
                     })}
                   </tbody>
                 </table>
               </div>
            </div>
          </motion.div>
        )}

        {activeTab === "safety" && (
          <motion.div 
            key="safety"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-12"
          >
            <ComplianceSafetyAssistant />

            <div className="bg-white rounded-[2rem] border border-stone-100 shadow-sm overflow-hidden">
               <div className="p-6 border-b bg-stone-50 flex items-center justify-between">
                  <h3 className="font-bold text-emerald-900 uppercase tracking-tight flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5 text-emerald-600" />
                    Critical Incident Log (Failsafe Mode)
                  </h3>
                  <button className="text-[10px] font-black bg-red-600 text-white px-4 py-2 rounded-xl uppercase tracking-widest hover:bg-red-700 transition-colors">
                    Emergency Auditor Sync
                  </button>
               </div>
               <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                   <thead className="bg-stone-50/50 text-stone-400 text-[10px] font-black uppercase tracking-widest border-b">
                     <tr>
                       <th className="px-6 py-4">Timestamp & GPS</th>
                       <th className="px-6 py-4">Type</th>
                       <th className="px-6 py-4">Reporter</th>
                       <th className="px-6 py-4">Details</th>
                       <th className="px-6 py-4">Auditor Status</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-stone-50">
                     {incidentReports.length === 0 ? (
                       <tr>
                         <td colSpan={5} className="px-6 py-12 text-center text-stone-400 font-bold uppercase text-[10px] tracking-widest">
                           No emergency incidents recorded in the 2026 Audit cycle.
                         </td>
                       </tr>
                     ) : (
                       incidentReports.map((report) => (
                         <tr key={report.id} className="hover:bg-red-50/10 transition-colors">
                           <td className="px-6 py-4">
                             <div className="font-bold text-stone-800 text-sm whitespace-nowrap">{format(new Date(report.timestamp), "MMM d, yyyy HH:mm:ss")}</div>
                             {report.location && (
                               <div className="text-[10px] text-emerald-600 font-black tracking-tighter">
                                 Lat: {report.location.lat.toFixed(4)}, Lng: {report.location.lng.toFixed(4)}
                               </div>
                             )}
                           </td>
                           <td className="px-6 py-4">
                             <span className={cn(
                               "text-[10px] font-black px-2 py-1 rounded-full uppercase",
                               report.severity === 'critical' ? "bg-red-100 text-red-700" :
                               report.severity === 'high' ? "bg-orange-100 text-orange-700" :
                               "bg-stone-100 text-stone-700"
                             )}>{report.type}</span>
                           </td>
                           <td className="px-6 py-4">
                             <div className="font-bold text-stone-800 text-sm">{report.userEmail || "Anonymous System Trace"}</div>
                           </td>
                           <td className="px-6 py-4">
                             <p className="text-xs text-stone-600 max-w-md line-clamp-2">{report.details}</p>
                           </td>
                           <td className="px-6 py-4">
                             <div className="flex items-center gap-2">
                               <div className={cn(
                                 "w-2 h-2 rounded-full",
                                 report.reportedToState ? "bg-emerald-500" : "bg-stone-300"
                               )}></div>
                               <span className="text-[10px] font-black uppercase text-stone-500">
                                 {report.reportedToState ? `SYNCED: ${report.stateRefNumber || "PENDING REF"}` : "INTERNAL ONLY"}
                               </span>
                             </div>
                           </td>
                         </tr>
                       ))
                     )}
                   </tbody>
                 </table>
               </div>
            </div>
          </motion.div>
        )}
        {activeTab === "security" && (
          <motion.div
            key="security"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            {/* Shield Mode HUD */}
            <div className="bg-red-950 rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl shadow-red-950/20">
              <div className="absolute top-0 right-0 w-96 h-96 bg-red-600 rounded-full blur-[120px] opacity-20 -translate-y-1/2 translate-x-1/2" />
              
              <div className="flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
                <div className="max-w-2xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-red-600 p-2 rounded-lg">
                      <Lock className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-xs font-black tracking-[0.3em] uppercase text-red-400">Think Tank Security OS</span>
                  </div>
                  <h2 className="text-5xl font-black mb-6 tracking-tight italic uppercase">Shield Mode: Active</h2>
                  <p className="text-red-100/60 leading-relaxed text-lg italic">
                    "Zero-Trust Architecture deployed. Monitoring millions of data points across 16 S. Rhode Island Ave and remote access nodes. Any breach of PHI integrity or unauthorized device detection triggers immediate Executive Alert protocols."
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                  <div className="bg-white/5 border border-white/10 backdrop-blur-md p-6 rounded-[2rem] text-center">
                    <div className="text-[10px] font-black text-red-400 uppercase mb-2 tracking-widest">Active Alerts</div>
                    <div className="text-4xl font-black tracking-tighter">{securityAlerts.filter(a => !a.resolved).length}</div>
                  </div>
                  <div className="bg-white/5 border border-white/10 backdrop-blur-md p-6 rounded-[2rem] text-center">
                    <div className="text-[10px] font-black text-red-400 uppercase mb-2 tracking-widest">PHI Logs (24h)</div>
                    <div className="text-4xl font-black tracking-tighter">{phiAccessLogs.length}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               {/* Critical Alerts Feed */}
               <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-stone-200 overflow-hidden shadow-sm">
                  <div className="p-8 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
                    <h3 className="font-black text-lg text-stone-800 uppercase tracking-tight flex items-center gap-3">
                      <ShieldAlert className="h-5 w-5 text-red-600" />
                      Critical Security Alerts
                    </h3>
                  </div>
                  <div className="divide-y divide-stone-100">
                    {securityAlerts.length === 0 ? (
                      <div className="p-20 text-center text-stone-400 italic font-medium uppercase text-xs tracking-widest">No security breaches detected. Integrity at 100%.</div>
                    ) : (
                      securityAlerts.map(alert => (
                        <div key={alert.id} className={cn(
                          "p-8 transition-colors flex gap-6",
                          !alert.resolved ? "bg-red-50/30" : ""
                        )}>
                          <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm",
                            alert.severity === 'critical' ? "bg-red-100 text-red-600" : "bg-orange-100 text-orange-600"
                          )}>
                            <AlertTriangle className="h-6 w-6" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[10px] font-black uppercase text-stone-400 tracking-widest">
                                {format(new Date(alert.timestamp), "MMM d, HH:mm:ss")} • {alert.type.replace(/_/g, ' ')}
                              </span>
                              <span className={cn(
                                "text-[10px] font-black px-2 py-0.5 rounded-full uppercase",
                                alert.resolved ? "bg-emerald-100 text-emerald-700" : "bg-red-600 text-white animate-pulse"
                              )}>
                                {alert.resolved ? "RESOLVED" : "BREACH UNRESOLVED"}
                              </span>
                            </div>
                            <h4 className="font-bold text-stone-900 mb-1">{alert.userEmail}</h4>
                            <p className="text-sm text-stone-500 mb-4">{alert.details}</p>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                <div className={cn("w-2 h-2 rounded-full", alert.notifiedExecutive ? "bg-emerald-500" : "bg-stone-300")}></div>
                                <span className="text-[10px] font-black uppercase text-stone-500">Exec Notified</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className={cn("w-2 h-2 rounded-full", alert.notifiedUplines ? "bg-emerald-500" : "bg-stone-300")}></div>
                                <span className="text-[10px] font-black uppercase text-stone-500">Upline Synced</span>
                              </div>
                            </div>
                          </div>
                          {!alert.resolved && (
                            <button 
                              onClick={async () => {
                                await updateDoc(doc(db, "securityAlerts", alert.id), { resolved: true });
                              }}
                              className="self-start bg-red-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-red-700 transition-all"
                            >
                              Resolve
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
               </div>

               {/* PHI Access Audit */}
               <div className="bg-white rounded-[2.5rem] border border-stone-200 overflow-hidden shadow-sm h-fit">
                  <div className="p-8 border-b border-stone-100 bg-stone-50/50">
                    <h3 className="font-black text-lg text-stone-800 uppercase tracking-tight flex items-center gap-3">
                      <FileText className="h-5 w-5 text-emerald-600" />
                      PHI Access Monitor
                    </h3>
                  </div>
                  <div className="divide-y divide-stone-100 max-h-[600px] overflow-y-auto">
                    {phiAccessLogs.map(log => (
                      <div key={log.id} className="p-6 hover:bg-stone-50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] font-black uppercase text-stone-400">
                            {format(new Date(log.timestamp), "HH:mm:ss")}
                          </span>
                          <span className={cn(
                            "text-[10px] font-black px-2 py-0.5 rounded-full uppercase",
                            log.isAuthorized ? "text-emerald-600" : "bg-red-100 text-red-600"
                          )}>
                            {log.action}
                          </span>
                        </div>
                        <div className="text-xs font-bold text-stone-800 truncate mb-1">{log.userEmail}</div>
                        <div className="text-[10px] text-stone-500">Target: PID_{log.patientId.substr(0,8)}</div>
                      </div>
                    ))}
                  </div>
               </div>
            </div>

            {/* Historical PHI Repository (Restricted) */}
            <div className="bg-white rounded-[2.5rem] border border-stone-200 overflow-hidden shadow-sm">
                <div className="p-12">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-2xl font-black text-stone-900 mb-2 uppercase tracking-tight">Historical PHI Repository</h3>
                      <p className="text-stone-500 text-sm italic">Restricted records prior to April 2026. Litigation use only.</p>
                    </div>
                    <div className={cn(
                      "px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2",
                      isLitigationAdmin ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                    )}>
                      {isLitigationAdmin ? <ShieldCheck className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                      {isLitigationAdmin ? "Authorization: LITIGATION-ADMIN" : "Authorization Required: UNAUTHORIZED"}
                    </div>
                  </div>

                  {!isLitigationAdmin ? (
                    <div className="bg-stone-50 rounded-3xl p-12 text-center border-2 border-dashed border-stone-200">
                      <div className="bg-white w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <Lock className="h-8 w-8 text-stone-300" />
                      </div>
                      <h4 className="text-lg font-bold text-stone-800 mb-2 uppercase">Access Denied</h4>
                      <p className="text-sm text-stone-500 mb-6 max-w-md mx-auto">
                        Your account credentials do not possess the <span className="font-black text-red-600 uppercase">Litigation-Admin</span> security token required to unseal pre-migration records.
                      </p>
                      <button 
                        onClick={async () => {
                          const alertData: Omit<SecurityAlert, 'id'> = {
                            type: 'historical_access_violation',
                            severity: 'high',
                            timestamp: new Date().toISOString(),
                            userId: profile?.uid || "unknown",
                            userEmail: profile?.email || "unknown",
                            details: "Unauthorized attempt to access Restricted Historical Records.",
                            notifiedUplines: true,
                            notifiedExecutive: true,
                            resolved: false
                          };
                          await addDoc(collection(db, "securityAlerts"), alertData);
                          // Trigger executive alert
                          await fetch("/api/security/alert", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(alertData)
                          });
                          alert("ACCESS DENIED: PHI Protection Protocol Activated. Security Uplines have been notified.");
                        }}
                        className="bg-stone-900 text-white px-8 py-4 rounded-xl font-bold text-sm tracking-widest uppercase hover:bg-black transition-all"
                      >
                        Request Emergency Access
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       {/* Mock historical records for the litigation admin */}
                       {[1, 2, 3, 4].map(i => (
                         <div key={i} className="p-6 bg-stone-50 rounded-2xl border border-stone-100 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="bg-white p-3 rounded-xl shadow-sm">
                                <FileText className="h-6 w-6 text-emerald-600" />
                              </div>
                              <div>
                                <div className="text-sm font-bold text-stone-900 uppercase">Archive_Record_2025_{i}.bak</div>
                                <div className="text-[10px] text-stone-500 font-bold uppercase tracking-widest">Encrypted PHI Bundle</div>
                              </div>
                            </div>
                            <button className="text-stone-400 hover:text-emerald-600">
                              <Eye className="h-5 w-5" />
                            </button>
                         </div>
                       ))}
                    </div>
                  )}
                </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
