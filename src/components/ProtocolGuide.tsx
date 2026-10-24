import React from "react";
import { BookOpen, FileText, Users, ShieldCheck, Zap } from "lucide-react";
import { motion } from "motion/react";

export const ProtocolGuide: React.FC = () => {
  return (
    <div className="bg-emerald-900 text-white rounded-[2.5rem] p-8 md:p-12 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-800 rounded-full -translate-y-1/2 translate-x-1/2 opacity-20 blur-3xl"></div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-emerald-800 rounded-2xl">
            <BookOpen className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Digital Personnel Review Protocol & SOPs</h2>
            <p className="text-emerald-300/80 text-sm">Standard Operating Procedures for AI-Human Integrated Excellence</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-800 flex items-center justify-center font-bold text-emerald-400 border border-emerald-700">01</div>
              <div>
                <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  File Naming Convention
                </h3>
                <p className="text-sm text-emerald-100/70 leading-relaxed">
                  All digital personnel files follow the <strong>"Name-Number"</strong> format (e.g., <em>Tanya Cooper-1</em>). 
                  Suffixes like <strong>-1a, -1b, -1c</strong> represent sequential pages within that specific file number. 
                  The AI Oversight Agent treats these as a continuous document for comprehensive review.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-800 flex items-center justify-center font-bold text-emerald-400 border border-emerald-700">02</div>
              <div>
                <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  AI Coworker Integration
                </h3>
                <p className="text-sm text-emerald-100/70 leading-relaxed">
                  Every staff member has an <strong>AI Extension</strong>. These agents remove 90% of process development tasks. 
                  To get the best response, provide context from the digital personnel files when prompting your AI coworker.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-800 flex items-center justify-center font-bold text-emerald-400 border border-emerald-700">03</div>
              <div>
                <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  Compliance Verification
                </h3>
                <p className="text-sm text-emerald-100/70 leading-relaxed">
                  Uploads are automatically scanned by the <strong>Smart AI Instance</strong>. 
                  Fail-safe protocols ensure that any non-compliance or "Less Than Excellence" care is flagged 
                  and reported to the Oversight Agent (tiny.rassmann@gmail.com) immediately.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-800 flex items-center justify-center font-bold text-emerald-400 border border-emerald-700">04</div>
              <div>
                <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Achieving Spectacular Outcomes
                </h3>
                <p className="text-sm text-emerald-100/70 leading-relaxed">
                  Use the AI agents to perfect session notes, identify behavioral trends, and ensure 
                  every client interaction is goal-oriented. The system is designed to amplify human impact, not replace it.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 p-6 bg-emerald-950/30 rounded-3xl border border-emerald-800/50">
          <p className="text-xs text-emerald-200/60 leading-relaxed italic text-center">
            "Excellence is not an act, but a habit. Our AI-integrated system ensures that habit is maintained across all levels of care." 
            <br />— Genesis Revitalization Group Executive Protocol
          </p>
        </div>
      </div>
    </div>
  );
};
