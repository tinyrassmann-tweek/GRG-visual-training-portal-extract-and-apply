import React, { useState } from "react";
import { User } from "firebase/auth";
import { UserProfile, VideoContext } from "../types";
import { VideoUpload } from "../components/VideoUpload";
import { motion } from "motion/react";
import { 
  AlertTriangle, 
  ShieldAlert, 
  Activity, 
  Wrench, 
  Heart, 
  Info,
  ChevronRight,
  History,
  Clock,
  CheckCircle2
} from "lucide-react";
import { cn } from "../lib/utils";

export default function IncidentReport({ user, profile }: { user: User | null, profile: UserProfile | null }) {
  const [selectedCategory, setSelectedCategory] = useState<VideoContext["incidentType"] | null>(null);
  const [showUpload, setShowUpload] = useState(false);

  const categories: { id: VideoContext["incidentType"]; title: string; icon: any; color: string; desc: string }[] = [
    { 
      id: "client", 
      title: "Client Incident", 
      icon: Heart, 
      color: "text-rose-600 bg-rose-50", 
      desc: "Medical emergencies, behavioral incidents, or client safety concerns." 
    },
    { 
      id: "staff", 
      title: "Staff Incident", 
      icon: ShieldAlert, 
      color: "text-amber-600 bg-amber-50", 
      desc: "Workplace injuries, policy violations, or staff-related safety issues." 
    },
    { 
      id: "maintenance", 
      title: "Facilities & Maintenance", 
      icon: Wrench, 
      color: "text-blue-600 bg-blue-50", 
      desc: "Pipe bursts, equipment failure, or hazardous building conditions." 
    },
    { 
      id: "positive", 
      title: "Positive Moment / Marketing", 
      icon: Activity, 
      color: "text-emerald-600 bg-emerald-50", 
      desc: "Client success stories, community events, or positive staff interactions." 
    },
    { 
      id: "other", 
      title: "General Context", 
      icon: Info, 
      color: "text-slate-600 bg-slate-50", 
      desc: "Any other situation requiring AI analysis and executive review." 
    },
  ];

  if (!user || !profile) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Secure Incident & Context Reporting</h1>
        <p className="text-slate-500">
          Powered by Think Tank Solutions AI. Every upload is immediately analyzed for compliance, safety, and executive action.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Select Reporting Category
          </h2>
          
          <div className="grid grid-cols-1 gap-3">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setShowUpload(true);
                }}
                className={cn(
                  "p-4 rounded-2xl border transition-all text-left flex items-start gap-4 group",
                  selectedCategory === cat.id 
                    ? "border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-100" 
                    : "border-slate-100 bg-white hover:border-indigo-200 hover:shadow-md"
                )}
              >
                <div className={cn("p-3 rounded-xl transition-colors", cat.color)}>
                  <cat.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-slate-900">{cat.title}</h3>
                    <ChevronRight className={cn(
                      "w-4 h-4 transition-transform",
                      selectedCategory === cat.id ? "translate-x-1 text-indigo-600" : "text-slate-300"
                    )} />
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{cat.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          {showUpload && selectedCategory ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-800">Upload Video Evidence</h2>
                <button 
                  onClick={() => setShowUpload(false)}
                  className="text-xs font-medium text-slate-400 hover:text-slate-600"
                >
                  Change Category
                </button>
              </div>
              <VideoUpload 
                incidentType={selectedCategory}
                onUploadComplete={() => {
                  // Handle post-upload logic if needed
                }}
              />
              
              <div className="mt-6 p-4 bg-indigo-900 text-white rounded-2xl shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Activity className="w-16 h-16" />
                </div>
                <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-indigo-400" />
                  AI Oversight Protocol
                </h4>
                <p className="text-[10px] text-indigo-100/80 leading-relaxed">
                  Upon upload, the Think Tank Solutions AI Agent will perform a frame-by-frame analysis. 
                  If an emergency is detected, a fail-safe alert will be dispatched to all executive staff 
                  within 60 seconds. For positive content, automated face-blurring and compliance checks 
                  will be initiated for marketing readiness.
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-12 bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200 text-center">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4">
                <Video className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-400">Awaiting Selection</h3>
              <p className="text-sm text-slate-400 max-w-xs mt-2">
                Please select a category on the left to begin the secure video intake process.
              </p>
            </div>
          )}

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-600" />
              Recent Reports
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <div className="bg-emerald-100 p-2 rounded-lg">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-slate-900">Facility Check - Room 4</p>
                  <p className="text-[10px] text-slate-500">Analyzed & Resolved by AI Agent</p>
                </div>
                <div className="text-[10px] text-slate-400 font-medium">2h ago</div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <div className="bg-amber-100 p-2 rounded-lg">
                  <Clock className="w-4 h-4 text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-slate-900">Morning Activity Event</p>
                  <p className="text-[10px] text-slate-500">Pending Marketing Compliance Review</p>
                </div>
                <div className="text-[10px] text-slate-400 font-medium">5h ago</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Video({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/>
    </svg>
  );
}
