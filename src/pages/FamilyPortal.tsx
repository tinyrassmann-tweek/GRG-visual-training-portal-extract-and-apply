import React, { useState, useEffect } from "react";
import { User } from "firebase/auth";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { UserProfile, Appointment, UserRole } from "../types";
import { motion } from "motion/react";
import { 
  Heart, 
  Calendar, 
  MessageSquare, 
  FileText, 
  Activity, 
  ShieldCheck, 
  Sparkles,
  ChevronRight,
  Clock,
  Award
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "../lib/utils";

export default function FamilyPortal({ user, profile }: { user: User | null, profile: UserProfile | null }) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || profile?.role !== UserRole.FAMILY) return;

    // In a real app, we'd query by the linked patient ID
    // For this demo, we'll show all appointments for the family member's context
    const q = query(
      collection(db, "appointments"),
      orderBy("date", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAppointments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment)));
      setLoading(false);
    });

    return unsubscribe;
  }, [user, profile]);

  if (!user || profile?.role !== UserRole.FAMILY) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <Heart className="h-20 w-20 text-rose-200 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-emerald-900">Family Access Restricted</h2>
        <p className="text-stone-500">This portal is reserved for authorized family members and guardians.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-rose-100 p-2 rounded-lg">
            <Heart className="h-5 w-5 text-rose-600" />
          </div>
          <span className="text-rose-600 text-xs font-bold uppercase tracking-widest">Family & Guardian Portal</span>
        </div>
        <h1 className="text-4xl font-bold text-emerald-900 mb-2">Welcome, {profile.displayName}</h1>
        <p className="text-stone-500 text-lg">Stay connected to your loved one's journey at Genesis.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Daily Highlight Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-emerald-900 to-emerald-800 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Sparkles className="h-32 w-32" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-6">
                <Award className="h-5 w-5 text-emerald-400" />
                <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest">Today's Positive Breakthrough</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">"Spectacular Engagement in Visual Arts"</h3>
              <p className="text-emerald-100/80 leading-relaxed mb-8">
                Your loved one showed incredible focus today while working on a digital landscape. 
                They collaborated with a peer to select colors, demonstrating significant social growth.
              </p>
              <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-emerald-900 bg-emerald-700 flex items-center justify-center text-[10px] font-bold">
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <span className="text-xs text-emerald-300">Verified by 3 DSPs today</span>
              </div>
            </div>
          </motion.div>

          {/* Activity Feed */}
          <div className="bg-white rounded-3xl border border-emerald-50 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-emerald-50 flex justify-between items-center">
              <h2 className="text-xl font-bold text-emerald-900">Recent Activity</h2>
              <button className="text-emerald-600 text-sm font-bold hover:underline">View Full Log</button>
            </div>
            <div className="divide-y divide-emerald-50">
              {[
                { time: "10:30 AM", activity: "Visual Arts Studio", detail: "Completed digital painting module.", icon: Activity },
                { time: "1:15 PM", activity: "Physical Training Gym", detail: "Met 100% of mobility goals for the session.", icon: Calendar },
                { time: "3:00 PM", activity: "Music Hall", detail: "Participated in group rhythmic expression.", icon: Sparkles },
              ].map((item, i) => (
                <div key={i} className="p-6 flex items-center justify-between hover:bg-emerald-50/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="bg-stone-100 p-3 rounded-xl">
                      <item.icon className="h-6 w-6 text-stone-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-emerald-900">{item.activity}</h4>
                      <p className="text-sm text-stone-500">{item.detail}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-stone-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {item.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Quick Actions */}
          <div className="bg-white p-8 rounded-3xl border border-emerald-50 shadow-sm">
            <h3 className="font-bold text-emerald-900 mb-6">Family Actions</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-stone-50 hover:bg-emerald-50 transition-all group">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-5 w-5 text-emerald-600" />
                  <span className="text-sm font-bold text-stone-700">Message Care Team</span>
                </div>
                <ChevronRight className="h-4 w-4 text-stone-300 group-hover:text-emerald-600" />
              </button>
              <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-stone-50 hover:bg-emerald-50 transition-all group">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-emerald-600" />
                  <span className="text-sm font-bold text-stone-700">Review ISP Documents</span>
                </div>
                <ChevronRight className="h-4 w-4 text-stone-300 group-hover:text-emerald-600" />
              </button>
              <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-stone-50 hover:bg-emerald-50 transition-all group">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                  <span className="text-sm font-bold text-stone-700">Sign Consent Forms</span>
                </div>
                <ChevronRight className="h-4 w-4 text-stone-300 group-hover:text-emerald-600" />
              </button>
            </div>
          </div>

          {/* AI Family Assistant */}
          <div className="bg-emerald-900 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-800 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
            <h3 className="text-xl font-bold mb-4 relative z-10">Ask Your AI Assistant</h3>
            <p className="text-emerald-100/60 text-sm mb-6 relative z-10">
              Need help understanding a term or process? Your AI co-worker is here to help families navigate the system.
            </p>
            <button 
              onClick={() => {
                const event = new CustomEvent('open-staff-agent');
                window.dispatchEvent(event);
              }}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Start Conversation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
