import React, { useState } from "react";
import { User } from "firebase/auth";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";
import { UserProfile, UserRole, FormSubmission } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { 
  ClipboardList, 
  FileText, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  Search,
  BookOpen,
  ArrowRight,
  Download
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { cn } from "../lib/utils";

const SOP_TEMPLATES = [
  { id: "sop-001", title: "Patient Intake Protocol", category: "Clinical", description: "Standard procedure for admitting new patients with developmental disabilities." },
  { id: "sop-002", title: "Emergency Respite Admission", category: "Emergency", description: "Protocol for rapid admission during crisis situations." },
  { id: "sop-003", title: "HIPAA Compliance Guidelines", category: "Compliance", description: "Mandatory practices for handling protected health information." },
  { id: "sop-004", title: "DSP Daily Reporting", category: "Operations", description: "Standardized daily reporting for direct support professionals." }
];

export default function Forms({ user, profile }: { user: User | null, profile: UserProfile | null }) {
  const [activeTab, setActiveTab] = useState<"intake" | "sops" | "leads">("intake");
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [aiSummary, setAiSummary] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const handleIntakeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      const submission: Omit<FormSubmission, "id"> = {
        userId: user.uid,
        formType: "intake",
        data: formData,
        submittedAt: new Date().toISOString(),
        status: "pending"
      };
      await addDoc(collection(db, "formSubmissions"), submission);
      setSuccess(true);
      setFormData({});
    } catch (err) {
      console.error("Form Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAiAssist = async () => {
    setAiLoading(true);
    try {
      const prompt = `Based on the following intake form data, provide a professional medical summary and suggest the most appropriate department for this patient: ${JSON.stringify(formData)}`;
      const response = await fetch("/api/ai-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });
      const data = await response.json();
      if (data.success) {
        setAiSummary(data.text);
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      setAiSummary("Error generating AI assistance. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-emerald-900 mb-4">Operational Forms & SOPs</h1>
        <p className="text-stone-600">Access and submit required documentation for patients and staff.</p>
      </div>

      {/* Tabs */}
      <div className="flex bg-white p-1 rounded-2xl border border-emerald-50 shadow-sm mb-12 w-fit mx-auto">
        {[
          { id: "intake", label: "Patient Intake", icon: ClipboardList },
          { id: "sops", label: "Staff SOPs", icon: BookOpen },
          { id: "leads", label: "Lead Capture", icon: FileText },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
              activeTab === tab.id ? "bg-emerald-600 text-white shadow-md" : "text-stone-500 hover:text-emerald-600"
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "intake" && (
          <motion.div 
            key="intake"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-12"
          >
            <div className="lg:col-span-2">
              <div className="bg-white p-8 rounded-3xl border border-emerald-50 shadow-sm">
                <h2 className="text-2xl font-bold text-emerald-900 mb-6">Patient Intake Form</h2>
                {success ? (
                  <div className="text-center py-12">
                    <CheckCircle2 className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-emerald-900 mb-2">Form Submitted Successfully</h3>
                    <p className="text-stone-500 mb-6">Our team will review your information and contact you shortly.</p>
                    <button onClick={() => setSuccess(false)} className="text-emerald-600 font-bold hover:underline">Submit another form</button>
                  </div>
                ) : (
                  <form onSubmit={handleIntakeSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-stone-700">Patient Full Name</label>
                        <input 
                          type="text" 
                          required
                          value={formData.patientName || ""}
                          onChange={(e) => setFormData({...formData, patientName: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-stone-700">Date of Birth</label>
                        <input 
                          type="date" 
                          required
                          value={formData.dob || ""}
                          onChange={(e) => setFormData({...formData, dob: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none" 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-stone-700">Primary Diagnosis (if known)</label>
                      <input 
                        type="text" 
                        value={formData.diagnosis || ""}
                        onChange={(e) => setFormData({...formData, diagnosis: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-stone-700">Current Medications</label>
                      <textarea 
                        value={formData.medications || ""}
                        onChange={(e) => setFormData({...formData, medications: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none h-24" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-stone-700">Special Requirements / Behavioral Notes</label>
                      <textarea 
                        value={formData.notes || ""}
                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none h-32" 
                      />
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-stone-400 bg-stone-50 p-4 rounded-xl">
                      <ShieldCheck className="h-4 w-4 text-emerald-500" />
                      This form is HIPAA compliant. Your data is encrypted and secure.
                    </div>

                    <div className="flex gap-4">
                      <button 
                        type="submit" 
                        disabled={loading}
                        className="flex-1 bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700 transition-all disabled:opacity-50"
                      >
                        {loading ? "Submitting..." : "Submit Intake Form"}
                      </button>
                      <button 
                        type="button"
                        onClick={handleAiAssist}
                        disabled={aiLoading || !formData.patientName}
                        className="bg-emerald-50 text-emerald-700 px-6 rounded-xl font-bold hover:bg-emerald-100 transition-all flex items-center gap-2 disabled:opacity-50"
                      >
                        <Sparkles className="h-5 w-5" />
                        AI Assist
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>

            <div className="space-y-8">
              <div className="bg-emerald-900 text-white p-8 rounded-3xl shadow-xl">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-emerald-400" />
                  AI Intake Summary
                </h3>
                <div className="text-sm text-emerald-100/80 leading-relaxed prose prose-invert">
                  {aiLoading ? (
                    <div className="animate-pulse space-y-2">
                      <div className="h-4 bg-emerald-800 rounded w-full"></div>
                      <div className="h-4 bg-emerald-800 rounded w-5/6"></div>
                      <div className="h-4 bg-emerald-800 rounded w-4/6"></div>
                    </div>
                  ) : aiSummary ? (
                    <ReactMarkdown>{aiSummary}</ReactMarkdown>
                  ) : (
                    <p>Fill out the form and click "AI Assist" to generate a clinical summary and department recommendation.</p>
                  )}
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-emerald-50 shadow-sm">
                <h3 className="font-bold text-emerald-900 mb-4">Form Instructions</h3>
                <ul className="space-y-3 text-sm text-stone-600">
                  <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></div> Ensure all legal names match medical records.</li>
                  <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></div> Upload any existing IEP/ISP documents if available.</li>
                  <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></div> AI summaries are for guidance only and must be verified by clinical staff.</li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "sops" && (
          <motion.div 
            key="sops"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
                <input 
                  type="text" 
                  placeholder="Search SOPs by title or category..." 
                  className="w-full pl-12 pr-4 py-3 rounded-2xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none" 
                />
              </div>
              <div className="flex gap-2">
                <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Total SOPs: {SOP_TEMPLATES.length}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {SOP_TEMPLATES.map(sop => (
                <div key={sop.id} className="bg-white p-8 rounded-3xl border border-emerald-50 shadow-sm hover:shadow-md transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      {sop.category}
                    </div>
                    <span className="text-xs text-stone-400 font-mono">{sop.id}</span>
                  </div>
                  <h3 className="text-xl font-bold text-emerald-900 mb-2">{sop.title}</h3>
                  <p className="text-stone-600 text-sm mb-6 leading-relaxed">{sop.description}</p>
                  <div className="flex gap-3">
                    <button className="flex-1 bg-emerald-600 text-white py-3 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2">
                      <FileText className="h-4 w-4" />
                      View Full SOP
                    </button>
                    <button className="bg-stone-50 text-stone-600 p-3 rounded-xl hover:bg-stone-100 transition-all">
                      <Download className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
