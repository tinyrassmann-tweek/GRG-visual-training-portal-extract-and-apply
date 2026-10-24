import React, { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";
import { motion } from "motion/react";
import { 
  Video, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Building2, 
  PlayCircle,
  ArrowRight,
  ShieldCheck,
  Users
} from "lucide-react";
import { format, addDays, startOfToday } from "date-fns";
import { LoadingOverlay } from "../components/LoadingOverlay";

const TIME_SLOTS = [
  "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:00 PM"
];

export default function VirtualTour() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    date: format(addDays(startOfToday(), 2), "yyyy-MM-dd"),
    time: ""
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "tourBookings"), {
        ...formData,
        status: "pending",
        createdAt: new Date().toISOString()
      });
      setSuccess(true);
    } catch (err) {
      console.error("Tour Error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
          <CheckCircle2 className="h-20 w-20 text-emerald-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-emerald-900 mb-4">Virtual Tour Booked!</h2>
          <p className="text-stone-600 mb-8">You will receive a calendar invite with the video link shortly.</p>
          <div className="bg-white p-6 rounded-2xl border border-emerald-50 text-left max-w-md mx-auto">
            <div className="flex justify-between mb-2">
              <span className="text-stone-500">Date:</span>
              <span className="font-bold">{formData.date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Time:</span>
              <span className="font-bold">{formData.time}</span>
            </div>
          </div>
          <button onClick={() => setSuccess(false)} className="mt-8 text-emerald-600 font-bold hover:underline">Book another tour</button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      {loading && <LoadingOverlay message="Securing your Virtual Tour slot..." />}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <div>
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-bold mb-6">
            <Video className="h-4 w-4" />
            Virtual Experience
          </div>
          <h1 className="text-5xl font-bold text-emerald-900 mb-6 leading-tight">
            Explore Our Facilities <span className="text-emerald-600">Virtually.</span>
          </h1>
          <p className="text-stone-600 text-lg mb-12 leading-relaxed">
            Can't make it in person? Book a guided virtual tour with one of our staff members to explore our specialized departments, respite centers, and therapeutic environments.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-emerald-50 shadow-sm">
              <PlayCircle className="h-8 w-8 text-emerald-600 mb-4" />
              <h3 className="font-bold text-emerald-900 mb-2">Guided Tours</h3>
              <p className="text-xs text-stone-500">Live video walkthroughs with staff specialists.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-emerald-50 shadow-sm">
              <Building2 className="h-8 w-8 text-emerald-600 mb-4" />
              <h3 className="font-bold text-emerald-900 mb-2">Facility Access</h3>
              <p className="text-xs text-stone-500">See our state-of-the-art medical equipment.</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-2xl border border-emerald-50">
          <h2 className="text-2xl font-bold text-emerald-900 mb-8">Book Your Tour</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Full Name</label>
              <input 
                type="text" 
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Email Address</label>
              <input 
                type="email" 
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none" 
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Select Date</label>
                <input 
                  type="date" 
                  required
                  min={format(addDays(startOfToday(), 2), "yyyy-MM-dd")}
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Select Time</label>
                <select 
                  required
                  value={formData.time}
                  onChange={(e) => setFormData({...formData, time: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                >
                  <option value="">Choose a time</option>
                  {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-900/10 flex items-center justify-center gap-2"
            >
              {loading ? "Booking..." : "Schedule Virtual Tour"}
              <ArrowRight className="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
