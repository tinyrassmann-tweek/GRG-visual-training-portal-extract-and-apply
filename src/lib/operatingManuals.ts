import { UserRole } from "../types";

export interface OperatingManual {
  role: UserRole | string;
  title: string;
  sop: string[];
  aiCoworkerGuidance: {
    purpose: string;
    howToUse: string[];
    promptSuggestions: string[];
  };
  realLifeUseCases: string[];
  bestPractices?: string[];
}

export const OPERATING_MANUALS: Record<string, OperatingManual> = {
  [UserRole.STAFF]: {
    role: UserRole.STAFF,
    title: "Direct Support Professional (DSP) Operating Manual",
    sop: [
      "Prioritize client safety and dignity in all interactions.",
      "Document all behavioral incidents and positive breakthroughs immediately.",
      "Maintain active engagement during activity room sessions.",
      "Follow individual service plans (ISPs) strictly while encouraging autonomy.",
      "Incident Reporting: All Level 1 incidents (injury, elopement) must be reported within 1 hour.",
      "Confidentiality: Never discuss client details in public areas; all PHI must be handled within secure Genesis modules."
    ],
    bestPractices: [
      "Use 'First/Then' contingencies during transitions.",
      "Environment Check: Ensure 8activity rooms are set up for success (cleared paths, accessible tools) before clients enter.",
      "Documentation: Focus on objective, measurable behaviors (e.g., 'Client gestured for help' vs 'Client was happy')."
    ],
    aiCoworkerGuidance: {
      purpose: "Your AI co-worker is a permanent extension of your role, designed to handle the 'technical heavy lifting' so you can focus on human connection.",
      howToUse: [
        "Use the microphone to speak naturally while your hands are busy with clients.",
        "Ask for immediate SOP clarifications if you're unsure of a protocol.",
        "Request 'De-escalation Scripts' when a client is showing signs of distress."
      ],
      promptSuggestions: [
        "How should I handle a client refusing to transition from the Music Hall?",
        "Summarize the key safety protocols for the Home Ec Kitchen.",
        "Give me a positive reinforcement script for a client who just completed a puzzle."
      ]
    },
    realLifeUseCases: [
      "Hands-free documentation: Speak your notes while assisting a client.",
      "Instant training: Ask 'What is the standard of excellence for this room?' while standing in it.",
      "Emotional support: Ask for a 'moment of zen' or a quick tip on staying patient during high-stress shifts."
    ]
  },
  [UserRole.ADMIN]: {
    role: UserRole.ADMIN,
    title: "Executive Director & Admin Operating Manual",
    sop: [
      "Ensure facility-wide compliance with NJ DDD regulations.",
      "Monitor audit logs for system integrity and ethical AI usage.",
      "Oversee the hiring process to ensure zero bias and maximum diversity.",
      "Review high-severity compliance alerts from the Karpathy Autoresearch tool."
    ],
    aiCoworkerGuidance: {
      purpose: "Your AI co-worker is a strategic partner that automates administrative overhead and ensures ethical compliance.",
      howToUse: [
        "Ask for high-level summaries of facility performance.",
        "Use the AI to verify that hiring decisions align with ethical standards.",
        "Request 'Auditor-Ready' reports for state certifications."
      ],
      promptSuggestions: [
        "Show me the audit logs for the last 24 hours.",
        "Verify that there is no bias in the current applicant screening process.",
        "What are the top 3 compliance risks identified this week?"
      ]
    },
    realLifeUseCases: [
      "State Audits: Let the AI present the 'Audit Trail' and 'Hiring Ethics' logs directly to the certifier.",
      "Strategic Growth: Ask the AI to identify patterns in lead intake to improve admission rates.",
      "Ethical Oversight: Use the AI to 'Red Team' internal processes for potential bias."
    ]
  },
  [UserRole.FAMILY]: {
    role: UserRole.FAMILY,
    title: "Family & Guardian Operating Manual",
    sop: [
      "Stay informed about your loved one's progress and daily activities.",
      "Communicate concerns or updates to the staff via the secure portal.",
      "Review and sign necessary consent forms digitally."
    ],
    aiCoworkerGuidance: {
      purpose: "Your AI assistant helps you navigate the complex world of DDD services and keeps you connected to your loved one's journey.",
      howToUse: [
        "Ask for explanations of medical or regulatory terminology.",
        "Request updates on your loved one's scheduled activities.",
        "Get help filling out complex intake or renewal forms."
      ],
      promptSuggestions: [
        "What did my loved one do in the Art Studio today?",
        "Explain the 'Tier Assignment' process in simple terms.",
        "How do I update my contact information?"
      ]
    },
    realLifeUseCases: [
      "Peace of Mind: Get a summary of the day's positive moments.",
      "Advocacy: Use the AI to prepare for ISP meetings by summarizing progress.",
      "Education: Learn about new resources available for families in NJ."
    ]
  }
};
