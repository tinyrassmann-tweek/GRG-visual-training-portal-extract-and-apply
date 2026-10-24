
export interface StaffMember {
  email: string;
  name: string;
  title: string;
  role: 'staff' | 'admin' | 'doctor' | 'applicant';
  isConsultant?: boolean;
}

export const INITIAL_STAFF: StaffMember[] = [
  { email: "mrassmann@genesisrevitalization.com", name: "Mark Anthony Rasmussen Sr.", title: "Consultant CEO (1099) via Joshua Management Group", role: "admin", isConsultant: true },
  { email: "wrahman@genesisrevitalization.com", name: "William Rassmann", title: "Executive Director", role: "admin" },
  { email: "cwalden@genesisrevitalization.com", name: "Clint Waldon", title: "Consultant COO (1099) via Joshua Management Group", role: "admin", isConsultant: true },
  { email: "fgilliam@genesisrevitalization.com", name: "Dr. Frank Gilliam", title: "Consulting Facilities Director (1099) via Joshua Management Group", role: "doctor", isConsultant: true },
  { email: "lfoster@genesisrevitalization.com", name: "Lewis Foster", title: "Consultant (1099)", role: "staff", isConsultant: true },
  { email: "fwilkes@genesisrevitalization.com", name: "Felicia Wilkes", title: "Activities Director (Training Phase)", role: "admin" },
  { email: "open-dsp-coord@genesisrevitalization.com", name: "OPEN-DSP-COORDINATOR", title: "DSP Coordinator (Hiring Opportunity)", role: "admin" },
  { email: "bwilkins@genesisrevitalization.com", name: "Benjamin Wilks", title: "BCBA (Clinical Employee)", role: "staff" },
  { email: "open-rbt@genesisrevitalization.com", name: "OPEN-RBT", title: "Registered Behavior Technician (Tentative Hire May 30)", role: "staff" },
  { email: "yfoster@genesisrevitalization.com", name: "Yvonne Foster", title: "Direct Support Professional", role: "staff" },
  { email: "sbrown@genesisrevitalization.com", name: "Sabrina Brown", title: "Direct Support Professional", role: "staff" },
  { email: "lmaclonis@genesisrevitalization.com", name: "Dr. Maclonis", title: "Consulting Coordinator via Joshua Management Group", role: "doctor", isConsultant: true },
  { email: "tcooper@genesisrevitalization.com", name: "Tanya Cooper", title: "Consulting COO via Joshua Management Group", role: "admin", isConsultant: true },
  { email: "xiomara.pacheco@gmail.com", name: "Xiomara Pacheco", title: "Interview Pending", role: "applicant" },
  { email: "applicant.2@gmail.com", name: "Tentative Hire - RBT", title: "Certification Completion Pending (May 30)", role: "applicant" },
  { email: "applicant.3@gmail.com", name: "Pending Applicant - DSP", title: "Application Held for Security Protocol", role: "applicant" }
];

export const OPEN_POSITIONS = [
  { title: "Direct Support Professional (DSP)", department: "Direct Care", type: "Full-Time/Part-Time" },
  { title: "Activities Coordinator", department: "Programs", type: "Full-Time" },
  { title: "Registered Behavior Technician (RBT)", department: "Clinical", type: "Full-Time" },
  { title: "Administrative Assistant", department: "Administration", type: "Part-Time" },
  { title: "Billing & Coding Specialist", department: "Finance", type: "Full-Time" }
];

export const TEMPORARY_PASSWORD = "thinktanksolutionsai";
export const CLIENT_ACCESS_LICENSE = "1001";
export const GRG_ACCESS_LICENSE = "1002";
