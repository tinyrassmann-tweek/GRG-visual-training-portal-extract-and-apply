export enum UserRole {
  PATIENT = "patient",
  STAFF = "staff",
  ADMIN = "admin",
  DOCTOR = "doctor",
  FAMILY = "family",
  APPLICANT = "applicant",
}

export interface OnboardingProgress {
  trainingCompleted: boolean;
  fingerprintsDone: boolean;
  npiVerified: boolean;
  backgroundCheck: boolean;
  sopReviewed: boolean;
  firstLoginAt?: string;
  passwordChanged: boolean;
  ndaSigned?: boolean;
  aiConsentSigned?: boolean;
  aiOperationalConsentSigned?: boolean;
  aiCoworkerConsentSigned?: boolean;
  danielleLawCompleted?: boolean;
  komninosLawCompleted?: boolean;
  incidentReportingCompleted?: boolean;
  orientationCompleted?: boolean;
  signedAt?: string;
  onboardingNotificationSent?: boolean;
}

export interface TrainingModule {
  id: string;
  title: string;
  description: string;
  category: "Mandatory" | "Orientation" | "Clinical" | "Safety" | "Professional Development";
  timelineDays: number;
  provider: "In-House" | "College of Direct Support" | "Boggs Center" | "External";
  recertificationInterval?: number; // months
}

export interface StaffTrainingRecord {
  id: string;
  staffId: string;
  staffEmail: string;
  moduleId: string;
  moduleTitle: string;
  status: "assigned" | "in_progress" | "completed" | "expired" | "needs_renewal";
  completedAt?: string;
  expiresAt?: string;
  certificateUrl?: string;
  reimbursementStatus: "n/a" | "requested" | "approved" | "paid" | "rejected";
}

export interface ReimbursementRequest {
  id: string;
  staffId: string;
  staffName: string;
  courseTitle: string;
  amount: number;
  receiptUrl: string;
  status: "pending" | "reviewing" | "approved" | "denied" | "paid";
  comments?: string;
  requestedAt: string;
  processedAt?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  title?: string;
  createdAt: string;
  phoneNumber?: string;
  specialty?: string; // For doctors/staff
  bio?: string;
  photoURL?: string;
  onboardingProgress?: OnboardingProgress;
  lastLoginAt?: string;
  licensingNumber?: string;
  accessType?: "internal" | "client" | "restricted";
  isConsultant?: boolean;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  department: string;
  date: string;
  time: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  notes?: string;
  createdAt: string;
}

export interface Department {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  category: "staff" | "client" | "continuing-education";
}

export interface FormSubmission {
  id: string;
  userId: string;
  formType: "intake" | "type" | "sop" | "lead";
  data: any;
  submittedAt: string;
  status: "pending" | "reviewed" | "archived";
}

export interface ActivityRoomContent {
  roomId: string;
  trainingModules: {
    title: string;
    description: string;
    videoUrl?: string;
    outline: string[];
  }[];
  dailyOutline: {
    time: string;
    activity: string;
  }[];
}

export interface ComplianceUpdate {
  id: string;
  source: string; // DDD, Medicaid, etc.
  regulatoryBody?: string;
  policyArea: "HIPAA" | "SOC3" | "Staffing" | "Facility" | "Safety" | "Other";
  title: string;
  summary: string;
  severity: "low" | "medium" | "high" | "critical";
  actionRequired: boolean;
  actionItems?: string[];
  status: "new" | "acknowledged" | "resolved" | "action_item";
  createdAt: string;
  updatedAt?: string;
}

export interface FacilityPresence {
  uid: string;
  displayName: string;
  role: string;
  type: "staff" | "client" | "guardian" | "executive" | "visitor" | "tour_guest";
  status: "in" | "out" | "off-site_respite";
  lastSeen: string;
  location?: { lat: number, lng: number };
  geofenceStatus: "compliant" | "breached";
  activityRoom?: string;
}

export interface BillingLog {
  id: string;
  userId: string;
  userName: string;
  type: "clinical" | "respite" | "activity";
  tier: string;
  activityRoom?: string;
  startTime: string;
  endTime?: string;
  durationMinutes?: number;
  amount?: number;
  gpsVerified: boolean;
  status: "pending" | "approved" | "processed";
  attestation: boolean;
}

export interface GeofenceAlert {
  id: string;
  userId: string;
  userEmail: string;
  alertType: "geofence_breach" | "security_failure" | "oversight_issue";
  severity: "high" | "critical";
  timestamp: string;
  details: string;
  resolved: boolean;
  resolvedAt?: string;
}

export interface OrgChartNode {
  id: string;
  name: string;
  role: string;
  children?: OrgChartNode[];
}

export interface Lead {
  id: string;
  initials: string;
  medicaidId: string;
  primaryDiagnosis: string;
  behavioralRisk: string;
  preliminaryTier: "A" | "B" | "C" | "D" | "E" | "F";
  status: "new" | "qualified" | "intake-scheduled" | "admitted";
  submittedAt: string;
  source: string;
}

export interface IncidentReport {
  id: string;
  type: "emergency" | "safety_breach" | "unusual_circumstance" | "compliance_gap";
  severity: "low" | "medium" | "high" | "critical";
  timestamp: string;
  userId?: string;
  userEmail?: string;
  location?: {
    lat: number;
    lng: number;
    address?: string;
  };
  details: string;
  witnesses?: string[];
  actionTaken?: string;
  reportedToState: boolean;
  stateRefNumber?: string;
  resolved: boolean;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  details: string;
  type: "system" | "manual" | "override";
}

export interface Application {
  id: string;
  email: string;
  fullName: string;
  position: string;
  licensingNumber: string;
  status: "pending" | "reviewed" | "contacted" | "rejected";
  submittedAt: string;
  notes?: string;
}

export interface VideoContext {
  id: string;
  userId: string;
  userEmail: string;
  videoUrl: string;
  fileName: string;
  fileSize: number;
  status: "pending" | "analyzing" | "flagged" | "positive" | "resolved";
  analysisResult?: string;
  isImportant: boolean;
  isVitalReview: boolean;
  incidentType: "staff" | "client" | "maintenance" | "positive" | "other";
  uploadedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  marketingConsent?: boolean;
  failSafeTriggered: boolean;
  alertsSentTo: string[];
}

export interface SecurityAlert {
  id: string;
  type: "unauthorized_device" | "phi_export" | "historical_access_violation" | "third_party_access";
  severity: "high" | "critical";
  timestamp: string;
  userId: string;
  userEmail?: string;
  details: string;
  deviceFingerprint?: string;
  notifiedUplines: boolean;
  notifiedExecutive: boolean;
  resolved: boolean;
}

export interface PHIAccessLog {
  id: string;
  userId: string;
  userEmail?: string;
  patientId: string;
  resourceType: string;
  action: "view" | "export" | "print" | "delete";
  timestamp: string;
  isAuthorized: boolean;
  deviceInfo?: string;
}
