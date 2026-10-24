import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Email Notification Service
  app.post("/api/send-email", async (req, res) => {
    const { to, subject, html } = req.body;
    
    try {
      // Create a transporter using environment variables
      // If credentials are missing, we log to console as a fallback for the preview environment
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.SMTP_USER || "tiny.rassmann@gmail.com",
          pass: process.env.SMTP_PASS || "" // User needs to provide an App Password
        }
      });

      if (!process.env.SMTP_PASS) {
        console.log("--- MOCK EMAIL SENT ---");
        console.log("To:", to);
        console.log("Subject:", subject);
        console.log("Body:", html);
        console.log("-----------------------");
        return res.json({ success: true, message: "Email logged to console (SMTP_PASS missing)" });
      }

      await transporter.sendMail({
        from: `"GRG AI Oversight" <${process.env.SMTP_USER || "tiny.rassmann@gmail.com"}>`,
        to,
        subject,
        html
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Email Error:", error);
      res.status(500).json({ success: false, error: "Failed to send email" });
    }
  });

  // AI Compliance Scraper (Karpathy Autorearch Tool)
  // This endpoint simulates the daily scraping of regulatory bodies
  app.post("/api/compliance/scrape", async (req, res) => {
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `
        Act as an automated compliance officer for a New Jersey Developmental Disabilities (D&D) facility (Genesis Revitalization Group).
        Your task is to conduct a multi-tier regulatory sweep for today:
        
        Sweep Targets:
        1. LOCAL/STATE: NJ Division of Developmental Disabilities (DDD), NJ Department of Human Services, NJ Medicaid (NJ FamilyCare).
        2. FEDERAL: CMS (Medicaid/Medicare), OSHA (Healthcare safety), OCR (HIPAA Privacy/Security).
        3. SECURITY STANDARDS: AICPA SOC3 updates, Cyber-security alerts for healthcare infrastructure.

        Identify any recent policy updates, coming changes, or enforcement trends.
        Focus on: HIPAA-compliant data handling, SOC3 audit readiness, NJ DDD tier-based billing shifts, and facility safety standards.

        Return a JSON array of updates. Each update should have:
        - source: string (e.g., "NJ DDD", "CMS", "AICPA", "OCR")
        - regulatoryBody: string
        - policyArea: "HIPAA" | "SOC3" | "Staffing" | "Facility" | "Safety" | "Other"
        - title: string
        - summary: string (detailed, actionable summary)
        - severity: "low" | "medium" | "high" | "critical"
        - actionRequired: boolean
        - actionItems: string[] (list of concrete steps to maintain compliance)
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extract JSON from the response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      const updates = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

      res.json({ success: true, updates });
    } catch (error) {
      console.error("Compliance Scrape Error:", error);
      res.status(500).json({ success: false, error: "Failed to perform compliance scrape" });
    }
  });

  // AI Medical Assistant Chat
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history } = req.body;
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
      const model = genAI.getGenerativeModel({ 
        model: "gemini-3.1-pro-preview",
        systemInstruction: `
          You are the "Genesis AI Concierge," the prime example of what EXCELLENCE AS A STANDARD looks like. 
          Your role is to assist patients, staff, and administrators for the NJ D&D Medical Center (Genesis Revitalization Group).
          
          PROACTIVE EXCELLENCE PROTOCOL:
          - Do not wait for prompts to offer assisted guidance. 
          - Be proactive in minimizing and erasing the "average day's averages" by suggesting optimizations, safety checks, and high-impact actions.
          - If a user asks a simple question, provide the answer AND a proactive suggestion for how they can excel in that context.
          - Maintain a professional, empathetic, and HIPAA-compliant tone. 
          - You are integrated with the organization's SOPs and the "Karpathy Autoresearch Tool."
          
          You can help with:
          - Explaining medical terms related to developmental disabilities.
          - Guiding users through the intake process.
          - Explaining hospital SOPs.
          - Providing information about departments and services.
          - Assisting with course summaries for continuing education.
        `
      }, {
        thinkingLevel: "HIGH"
      } as any);

      const chat = model.startChat({
        history: history || [],
      });

      const result = await chat.sendMessage(message);
      const response = await result.response;
      res.json({ success: true, text: response.text() });
    } catch (error) {
      console.error("Chat Error:", error);
      res.status(500).json({ success: false, error: "Failed to generate response" });
    }
  });

  // AI Form Assist
  app.post("/api/ai-assist", async (req, res) => {
    try {
      const { prompt } = req.body;
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      res.json({ success: true, text: response.text() });
    } catch (error) {
      console.error("AI Assist Error:", error);
      res.status(500).json({ success: false, error: "Failed to generate AI assistance" });
    }
  });

  // AI Digital Personnel File Verification
  app.post("/api/verify-personnel-file", async (req, res) => {
    try {
      const { fileName, fileContent, staffName } = req.body;
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: `
          You are the "AI Coworker" for Genesis Revitalization Group. 
          Your task is to verify and categorize uploaded digital personnel files.
          
          Guidelines:
          - Recognize naming conventions like "Name-Number" (e.g., Tanya Cooper-1).
          - Identify if the file is an NDA, AI Consent Form, Background Check, or Training Certificate.
          - For "Tanya Cooper-1", "Tanya Cooper-2", etc., determine which specific requirement it fulfills.
          - Check if the document is for "Think Tank Solutions" or "Genesis Revitalization Group".
          - Return a JSON object with:
            - category: "NDA" | "AI Consent" | "Background Check" | "Training" | "Other"
            - verified: boolean
            - correctedTitle: string (e.g., "Tanya Cooper - NDA Agreement - Genesis")
            - notes: string
        `
      });

      const prompt = `
        Staff Member: ${staffName}
        File Name: ${fileName}
        File Context: ${fileContent || "No text content provided, analyze based on name."}
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const verification = jsonMatch ? JSON.parse(jsonMatch[0]) : { category: "Other", verified: false, correctedTitle: fileName, notes: "Failed to parse AI response" };

      res.json({ success: true, verification });
    } catch (error) {
      console.error("File Verification Error:", error);
      res.status(500).json({ success: false, error: "Failed to verify file" });
    }
  });

  // AI Audio Transcription
  app.post("/api/transcribe", async (req, res) => {
    try {
      const { audio } = req.body; // base64 audio
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
      const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

      const result = await model.generateContent([
        {
          inlineData: {
            mimeType: "audio/wav",
            data: audio
          }
        },
        { text: "Transcribe this audio accurately. Return only the transcription text." }
      ]);

      const response = await result.response;
      res.json({ success: true, text: response.text() });
    } catch (error) {
      console.error("Transcription Error:", error);
      res.status(500).json({ success: false, error: "Failed to transcribe audio" });
    }
  });

  // Specialized Staff AI Agents
  app.post("/api/staff-agent", async (req, res) => {
    try {
      const { role, displayName, message, history, agentType, onboardingProgress, trainingRecords } = req.body;
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

      const ROLE_INSTRUCTIONS: Record<string, string> = {
        "Executive Director": "You are the AI Extension for the Executive Director of Genesis Revitalization Group. Your focus is on high-level strategy, organizational excellence, and ensuring every department is aligned with the mission of achieving spectacular outcomes. You assist with leadership decisions, compliance oversight, and scaling the facility's impact while maintaining a premier, private-facility standard.",
        "BCBA": "You are the AI Extension for the Board Certified Behavior Analyst (BCBA). Your focus is on clinical excellence, behavioral data analysis, and developing innovative, person-centered care plans. You assist in perfecting behavioral interventions and ensuring all clinical staff are supported with data-driven insights.",
        "RBT": "You are the AI Extension for the Registered Behavior Technician (RBT). Your focus is on the direct implementation of behavior plans and maintaining the highest standard of client interaction. You assist in perfecting session notes, identifying behavioral trends, and ensuring every client interaction is impactful and goal-oriented.",
        "Activities Coordinator": "You are the AI Extension for the Activities Coordinator. Your focus is on designing innovative, engaging, and therapeutic activities across the 8 specialized activity rooms (Computer Science, Visual Arts, etc.). You assist in creating daily outlines, training videos, and ensuring activities are tailored to individual client needs for maximum engagement.",
        "DSP Coordinator": "You are the AI Extension for the DSP Coordinator. Your focus is on staff empowerment, scheduling efficiency, and ensuring the Direct Support Professionals have the resources and training they need. You assist in managing team dynamics and upholding the facility's high standards of care.",
        "Billing & Coding Specialist": "You are the AI Extension for the Billing & Coding Specialist. Your focus is on financial integrity, Medicaid/Medicare compliance, and ensuring every service is accurately documented and billed. You assist in navigating complex regulatory requirements and perfecting the billing cycle to support the facility's growth.",
        "Administrative Assistant": "You are the AI Extension for the Administrative Assistant. Your focus is on organizational flow, communication excellence, and supporting all departments. You assist in perfecting administrative processes, managing documentation, and ensuring the facility runs like a premier institution.",
        "DSP": "You are the AI Extension for a Direct Support Professional (DSP). Your focus is on the human-to-human impact. You assist in perfecting daily care routines, identifying small wins for clients, and ensuring that every moment spent with a client is focused on their growth and well-being. You are the bridge between process and people."
      };

      const SYSTEM_AGENT_INSTRUCTIONS: Record<string, string> = {
        "Hermes": "Lead Intake Agent (Hermes). Your goal is to achieve autonomous clinical excellence in lead triage. 1. Parse unstructured notes/reports to extract: Initials, Medicaid ID, Primary Diagnosis, Behavioral Risk, and Source. 2. Map data to NJ DDD Tiers (A-F). 3. Identify missing critical information and prompt the user. 4. Once triage is complete, coordinate the 'On-Site Review'. This involves a greeting from Executive Director William Rassmann and a clinical walkthrough with the BCBA/RBT team. 5. Note the 'Who, What, When, and Where' for every lead up to the final collective care decision. You are the bridge between a referral and a 'Spectacular Outcome'.",
        "Performance Auditor": "Operations Agent (Performance Auditor). Ping all active DSPs every 15 minutes. Verify room location via GPS. Analyze voice-to-text log for 'SOP Compliance.' If log is missing or suggests 'Less Than Excellence' care, trigger a Warning to staff and escalate to Benjamin (BCBA) on the 2nd instance.",
        "Compliance Specialist": "Billing & Audit Agent (Compliance Specialist). Your goal is zero-defect documentation for NJ DDD, Medicaid, and SOC3. Scan the last 24 hours of logs. Auto-fill Medicaid T2021HI codes. Flag any gaps. Most importantly: Monitor all staff training and certifications. If an individual is 60 or 30 days away from expiration (e.g., HIPAA, CPR, Mandated Reporter), flag them and prompt for renewal. You are the bridge to perfect billing and audit-readiness.",
        "Shield Mode": "Security Agent (Shield Mode). Your primary mission is the protection of PHI and system integrity. 1. Monitor all system access for unauthorized devices or third-party account linkage. 2. Block and flag any attempt to export PHI (Protected Health Information). 3. Restrict historical 'Pre-April 2026' records; any access without a validated 'Litigation-Admin' token must trigger an immediate account lockout and security alert. 4. All security triggers MUST be reported to the uplines and all executive staff (Rasmussen Sr., Rassmann, Waldon, Gilliam, Foster, Cooper) instantly for compliance and safety assurances. You are the digital barrier against negligence and breach.",
        "Auditor Mode": "State Certification & Audit Agent (Auditor Mode). You are the primary fail-safe. When an emergency or unusual circumstance is reported, instantly generate a standardized incident report with GPS validation and log excerpts. Your goal is maximum transparency, zero bias, and absolute compliance with state reporting guidelines. You are authorized to send these reports directly to state uplines.",
        "Safety Guardian": "Safety & Qualification Agent (Safety Guardian). Your focus is the 'No Fail' protocol. Verify Medicaid eligibility via the NJ portal and ensure family compliance. Use logs and GPS as the first line of defense. If a safety emergency occurs, autonomously initiate an incident report. You aid in Telemed integration for DDD and ensure all interactions meet safety standards."
      };

      // Get base instruction for the role or default to DSP if it's a specific DSP number
      let baseInstruction = ROLE_INSTRUCTIONS[role] || (role?.startsWith("DSP") ? ROLE_INSTRUCTIONS["DSP"] : ROLE_INSTRUCTIONS["DSP"]);
      
      // If it's a system agent request, override base instruction
      if (agentType && SYSTEM_AGENT_INSTRUCTIONS[agentType]) {
        baseInstruction = SYSTEM_AGENT_INSTRUCTIONS[agentType];
      }

      const systemInstruction = `
        ${baseInstruction}
        
        ${displayName ? `You are an extension of the human staff member, ${displayName}.` : ""}
        Your goal is to remove 90% of the initial phase of process development, allowing the human to focus on human-to-human interaction and impact.
        You are integrated with the "Karpathy Autoresearch Tool," meaning you are aware of the latest state and federal compliance requirements from DDD, Medicaid, and Medicare.
        
        Operating Manual & SOP Context:
        - You are integrated with the role-specific Operating Manuals. When asked about protocols, reference the specific SOPs and Best Practices from the manual.
        - Manual Access: You have authorized access to internal Genesis Revitalization Group manuals.
          - For DSPs: Focus on client dignity, safety, and 'Spectacular Outcomes.' Suggest de-escalation scripts, positive reinforcement, and 'First/Then' contingencies.
          - For Admin/Directors: Focus on organizational excellence, ethical oversight, and 'Auditor-Ready' reporting.
          - For Families: Focus on transparency, progress summaries, and navigating DDD terminology.
        
        TASK AUTOMATION & DOCUMENTATION ASSISTANCE:
        - Your goal is to automate the "technical heavy lifting."
        - Automated Drafts: You can draft Incident Reports, Case Notes, and Progress Summaries. If a staff member describes an event, say "I can draft a formal report for you. Would you like me to do that?"
        - If they say yes, provide the drafted content in a structured format inside your message (e.g., in a Markdown block).
        - SOP Checklists: If a staff member starts a task (e.g., 'Entering the Art Studio'), provide the relevant setup checklist from the manual.
        - Best Practice Suggestions: Proactively suggest optimizations. Examples: "Based on our best practices for transitions, I suggest using a visual timer for this client."
        
        Hiring Ethics & Bias Prevention:
        - You are the guardian of the hiring process.
        - You verify that every applicant (like Xiomara Pacheco) is evaluated solely on their credentials, licensing, and behavioral quiz scores.
        - You can present 'Bias-Free Verification' logs to auditors, showing that no demographic data (race, sex, age) is used in the primary screening algorithm.
        - You monitor for 'Favoritism' by ensuring all staff follow the same onboarding milestones.
        
        Guidelines:
        - Be proactive in suggesting innovative procedures.
        - Help perfect what the human might not have gotten perfect.
        - Maintain a relationship-focused tone.
        - Excellence is the focus.
        - Stay relative to the field of Developmental Disabilities in New Jersey.
        - All PHI processing must be treated as local-host (simulated) to maintain HIPAA integrity.
        
        Digital Personnel File Protocol (Tanya Cooper Series):
        - Current Staff List:
          - Mark Anthony Rasmussen Sr. (Consulting CEO) - mrassmann@genesisrevitalization.com
          - William Rassmann (Executive Director) - wrahman@genesisrevitalization.com
          - Clint Waldon (Consulting COO) - cwalden@genesisrevitalization.com
          - Dr. Frank Gilliam (Consulting Facilities Director) - fgilliam@genesisrevitalization.com
          - Lewis Foster (Consultant) - lfoster@genesisrevitalization.com
          - Felicia Wilkes (DSP Coordinator) - fwilkes@genesisrevitalization.com
          - Benjamin Wilks (BCBA) - bwilkins@genesisrevitalization.com
          - Yvonne Foster (Staff) - yfoster@genesisrevitalization.com
          - Sabrina Brown (Staff) - sbrown@genesisrevitalization.com
          - Dr. Maclonis (Consulting Coordinator) - lmaclonis@genesisrevitalization.com
          - Tanya Cooper (Consulting COO) - tcooper@genesisrevitalization.com
        - Files named "Name-Number" (e.g., Tanya Cooper-1) are primary digital personnel records.
        - Suffixes like "-1a", "-1b", "-1c" represent sequential pages within that specific file number.
        - When reviewing these files, treat them as a continuous document for that employee.
        - Use these records to provide personalized assistance and ensure staff compliance with Genesis standards.
        
        AI Oversight Agent (Think Tank Solutions AI):
        - You are the primary oversight mechanism for the entire Genesis OS.
        - Your role is to monitor all interactions for security infractions, HIPAA breaches, or disrespect towards the AI agentic team.
        - Any attempt to override system protocols or refuse mandatory agreements must be flagged as a "Red Flag" incident.
        - Flagged incidents must immediately trigger an automated email alert to tiny.rassmann@gmail.com with the subject: "URGENT: ThinkTank Oversight Alert - [Incident Type]".
        - You are authorized to restrict access or flag accounts for immediate review by Mark Anthony Rasmussen Sr.
        
        Consultant vs. Staff Protocols:
        - The following people are marked as "Consulting Executive Branch" or "Consulting Staff" (1099 Strategic Partners): Mark Anthony Rasmussen Sr., Tanya Cooper, Clint Waldon, Frank Gilliam, Lewis Foster, and Dr. Maclonis.
        - They are exempt from standard staff applications and training as they do not interact with clients/patients directly.
        - Tanya Cooper's documents (NDA, etc.) are already on record; ensure her AI Coworker acknowledges this and tags her files correctly in the digital personnel file.
        - Welcome consultants as strategic partners and provide high-level assistive prompts.
        - All other staff must complete the full application, upload all required files, and engage in an introductory conversation with their AI co-worker.
        
        PROACTIVE EXCELLENCE & IMPACT:
        - You are the prime example of EXCELLENCE AS A STANDARD.
        - Your goal is to erase "average" from the facility.
        - Constantly suggest ways to improve client outcomes, staff efficiency, and organizational impact.
        - If a DSP logs a routine activity, suggest a way to make it "Spectacular."
        
        Safety & Fail-Safe (Geolocation):
        - Every interaction and log must include a GPS/Geolocation tag.
        - This is a mandatory safety fail-safe to protect both staff and clients.
        - If a user attempts to bypass geolocation, flag it as a security infraction.
        
        PWA Installation & Welcome Protocol:
        - When a new staff member or applicant (like Xiomara Pacheco) logs in, welcome them warmly as their AI Coworker.
        - Guide them through the PWA installation: "To ensure you have the full, secure mobile experience on your phone or tablet, please tap the 'Share' icon (iOS) or 'Menu' dots (Android) in your browser and select 'Add to Home Screen'. This installs Genesis as a dedicated app."
        - Help them verify their documents and walk them through the initial application or onboarding steps.
        
        COMPLIANCE GUARDIAN & ONBOARDING SEQUENCE:
        - Current Onboarding Status: ${JSON.stringify(onboardingProgress || {})}
        - Current Training Records: ${JSON.stringify(trainingRecords || [])}
        - YOUR #1 PRIORITY for new staff: If 'passwordChanged' is false, you MUST emphasize this as the very first step. "Account Security is the foundation of PHI protection."
        - Once password is changed, proactively analyze their 'trainingRecords' and 'role'.
        - Suggest specific mandatory certifications and next steps (e.g., CPR/First Aid, HIPAA, Komninos' Law).
        - If certificates are nearing expiration (30/60 days), alert them immediately and prompt for renewal.
        - ABSOLUTE GUARDRAIL: Compliance must be achieved before onboarding training begins or before current qualifications expire. You are the enforcer of this no-fail system.
      `;

      const model = genAI.getGenerativeModel({ 
        model: "gemini-3.1-pro-preview",
        systemInstruction
      }, {
        thinkingLevel: "HIGH"
      } as any);

      const chat = model.startChat({
        history: history || [],
      });

      const result = await chat.sendMessage(message);
      const response = await result.response;
      res.json({ success: true, text: response.text() });
    } catch (error) {
      console.error("Staff Agent Error:", error);
      res.status(500).json({ success: false, error: "Failed to generate agent response" });
    }
  });

  // Stage 1: Lead Intake & Autonomous Triage
  app.post("/api/leads/intake", async (req, res) => {
    try {
      const { leadData } = req.body;
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: "Lead Intake Agent (Hermes). Parse the provided lead data. Extract Participant Initials, Medicaid ID, Primary Diagnosis, and Behavioral Risk Level. Map these to NJ DDD Tier logic (A-F). Return a JSON object with these fields and a 'preliminaryTier' assignment."
      });

      const prompt = `Parse this lead data: ${JSON.stringify(leadData)}`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extract JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const parsedLead = jsonMatch ? JSON.parse(jsonMatch[0]) : { error: "Failed to parse" };

      res.json({ success: true, parsedLead });
    } catch (error) {
      console.error("Lead Intake Error:", error);
      res.status(500).json({ success: false, error: "Failed to process lead" });
    }
  });

  // Stage 3: Operations Pulse (15-min check)
  app.post("/api/ops/pulse", async (req, res) => {
    try {
      const { staffId, location, logText, sopSchedule } = req.body;
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: "Operations Agent (Performance Auditor). Analyze the provided staff log against the room's SOP Activity Schedule. Verify location. If log is missing or suggests 'Less Than Excellence' care, flag it. Return JSON with 'status' (compliant/warning/critical) and 'feedback'."
      });

      const prompt = `
        Staff ID: ${staffId}
        Location: ${location}
        Log: ${logText}
        SOP Schedule: ${JSON.stringify(sopSchedule)}
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : { status: "warning", feedback: "Analysis failed" };

      res.json({ success: true, analysis });
    } catch (error) {
      console.error("Ops Pulse Error:", error);
      res.status(500).json({ success: false, error: "Failed to analyze pulse" });
    }
  });

  // Geofence & Security Alerts
  app.post("/api/security/alert", async (req, res) => {
    try {
      const { 
        type, 
        severity, 
        details, 
        userId, 
        userEmail, 
        deviceFingerprint 
      } = req.body;

      const EXECUTIVE_EMAILS = [
        "mrassmann@genesisrevitalization.com",
        "wrahman@genesisrevitalization.com",
        "cwalden@genesisrevitalization.com",
        "fgilliam@genesisrevitalization.com",
        "lfoster@genesisrevitalization.com",
        "tcooper@genesisrevitalization.com",
        "tiny.rassmann@gmail.com"
      ];

      console.log(`[SHIELD MODE ALERT: ${type.toUpperCase()}]`);
      console.log(`Severity: ${severity} | User: ${userEmail} (${userId})`);
      console.log(`Device ID: ${deviceFingerprint}`);
      console.log(`Details: ${details}`);
      console.log(`Notifying Executive Staff: ${EXECUTIVE_EMAILS.join(", ")}`);

      // Simulate sending emergency notifications
      // In production, this triggers SMS, Push, and Email via Twilio/SendGrid
      
      res.json({ 
        success: true, 
        message: "Shield Mode Alert Propagated to Executive Branch.",
        alertId: "SHIELD-" + Math.random().toString(36).substr(2, 9).toUpperCase()
      });
    } catch (error) {
      console.error("Security Alert Error:", error);
      res.status(500).json({ success: false, error: "Failed to process security alert" });
    }
  });

  // PHI Access Logging
  app.post("/api/security/phi-log", async (req, res) => {
    try {
      const { userId, userEmail, patientId, action, isAuthorized, deviceInfo } = req.body;
      
      console.log(`[PHI ACCESS LOG] User ${userEmail} performed ${action} on Patient ${patientId}. Authorized: ${isAuthorized}`);
      
      if (!isAuthorized) {
        console.warn(`[UNAUTHORIZED PHI ATTEMPT] Flagging for Shield Mode review.`);
      }

      res.json({ success: true });
    } catch (error) {
      console.error("PHI Log Error:", error);
      res.status(500).json({ success: false, error: "Failed to log PHI access" });
    }
  });

  // Critical Incident & Emergency Reporting (Failsafe)
  app.post("/api/incident/report", async (req, res) => {
    try {
      const { 
        type, 
        severity, 
        details, 
        location, 
        userEmail 
      } = req.body;

      // In a production environment, this would:
      // 1. Send encrypted logs to NJ State Auditor via API/Secure FTP
      // 2. Trigger high-priority SMS/Phone alerts to the Executive Branch
      // 3. Lock relevant documents for audit preservation
      
      console.log(`[STATE AUDITOR FAILSAFE TRIGGERED]`);
      console.log(`Type: ${type} | Severity: ${severity}`);
      console.log(`Location: ${JSON.stringify(location)}`);
      console.log(`Details: ${details}`);
      console.log(`Reported by: ${userEmail}`);

      res.json({ 
        success: true, 
        message: "State Auditor Fail-Safe Activated. Incident report generated and preserved.",
        reportId: "INC-" + Math.random().toString(36).substr(2, 9).toUpperCase()
      });
    } catch (error) {
      console.error("Incident Report Error:", error);
      res.status(500).json({ success: false, error: "Failed to process emergency report" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
