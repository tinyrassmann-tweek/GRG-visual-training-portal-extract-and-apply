import React, { useState, useEffect } from "react";
import { User } from "firebase/auth";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { UserProfile, UserRole, Appointment } from "../types";
import { motion } from "motion/react";
import { Calendar, Clock, Stethoscope, User as UserIcon, CheckCircle2, AlertCircle } from "lucide-react";
import { format, addDays, startOfToday } from "date-fns";
import { useNavigate } from "react-router-dom";
import { cn } from "../lib/utils";

const DEPARTMENTS = [
  "Computer Science Lab",
  "Visual Arts Studio",
  "Workplace Readiness Center",
  "Physical Training Gym",
  "Music & Performance Hall",
  "Culinary Arts Kitchen",
  "Sensory Integration Room",
  "Life Skills Lab"
];

const TIME_SLOTS = [
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "01:00 PM", "01:30 PM",
  "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM",
  "04:00 PM", "04:30 PM"
];

export default function Booking({ user, profile }: { user: User | null, profile: UserProfile | null }) {
  const [doctors, setDoctors] = useState<UserProfile[]>([]);
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState<UserProfile | null>(null);
  const [selectedDate, setSelectedDate] = useState(format(addDays(startOfToday(), 1), "yyyy-MM-dd"));
  const [selectedTime, setSelectedTime] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctors = async () => {
      const q = query(collection(db, "users"), where("role", "==", UserRole.DOCTOR));
      const snap = await getDocs(q);
      const docs = snap.docs.map(d => d.data() as UserProfile);
      setDoctors(docs);
    };
    fetchDoctors();
  }, []);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedDoctor || !selectedTime) return;

    setLoading(true);
    try {
      const appointment: Omit<Appointment, "id"> = {
        patientId: user.uid,
        patientName: profile?.displayName || "Patient",
        doctorId: selectedDoctor.uid,
        doctorName: selectedDoctor.displayName,
        department: selectedDept,
        date: selectedDate,
        time: selectedTime,
        status: "pending",
        notes,
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, "appointments"), appointment);
      setSuccess(true);
      setTimeout(() => navigate("/dashboard"), 3000);
    } catch (err) {
      console.error("Booking Error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-emerald-900">Please log in to book an appointment.</h2>
        <button onClick={() => navigate("/login")} className="mt-4 bg-emerald-600 text-white px-6 py-2 rounded-lg">Login</button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
          <CheckCircle2 className="h-20 w-20 text-emerald-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-emerald-900 mb-4">Appointment Requested!</h2>
          <p className="text-stone-600 mb-8">Your request has been sent to the medical team. You will receive a confirmation shortly.</p>
          <div className="bg-white p-6 rounded-2xl border border-emerald-50 text-left max-w-md mx-auto">
            <div className="flex justify-between mb-2">
              <span className="text-stone-500">Doctor:</span>
              <span className="font-bold">{selectedDoctor?.displayName}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-stone-500">Date:</span>
              <span className="font-bold">{selectedDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Time:</span>
              <span className="font-bold">{selectedTime}</span>
            </div>
          </div>
          <p className="mt-8 text-sm text-stone-400">Redirecting to dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-emerald-900 mb-4">Book an Appointment</h1>
        <p className="text-stone-600">Select a department and specialist to schedule your visit.</p>
      </div>

      <form onSubmit={handleBooking} className="space-y-8">
        {/* Step 1: Department */}
        <div className="bg-white p-8 rounded-3xl border border-emerald-50 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-emerald-100 p-2 rounded-lg">
              <Stethoscope className="h-6 w-6 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-emerald-900">1. Select Department</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {DEPARTMENTS.map(dept => (
              <button
                key={dept}
                type="button"
                onClick={() => { setSelectedDept(dept); setSelectedDoctor(null); }}
                className={cn(
                  "px-4 py-3 rounded-xl text-sm font-bold border transition-all",
                  selectedDept === dept ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-stone-500 border-stone-200 hover:bg-stone-50"
                )}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Doctor */}
        {selectedDept && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-8 rounded-3xl border border-emerald-50 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-emerald-100 p-2 rounded-lg">
                <UserIcon className="h-6 w-6 text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold text-emerald-900">2. Choose Specialist</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {doctors.filter(d => d.specialty === selectedDept || !d.specialty).map(doc => (
                <button
                  key={doc.uid}
                  type="button"
                  onClick={() => setSelectedDoctor(doc)}
                  className={cn(
                    "p-4 rounded-2xl border transition-all text-left flex items-center gap-4",
                    selectedDoctor?.uid === doc.uid ? "bg-emerald-50 border-emerald-600 ring-1 ring-emerald-600" : "bg-white border-stone-200 hover:bg-stone-50"
                  )}
                >
                  <div className="bg-stone-100 w-12 h-12 rounded-full flex items-center justify-center">
                    <UserIcon className="h-6 w-6 text-stone-400" />
                  </div>
                  <div>
                    <div className="font-bold text-emerald-900">{doc.displayName}</div>
                    <div className="text-xs text-stone-500 uppercase">{doc.specialty || "General Specialist"}</div>
                  </div>
                </button>
              ))}
              {doctors.filter(d => d.specialty === selectedDept).length === 0 && (
                <div className="col-span-full p-8 text-center text-stone-400 border-2 border-dashed border-stone-100 rounded-2xl">
                  No specialists currently available for this department.
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Step 3: Date & Time */}
        {selectedDoctor && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-8 rounded-3xl border border-emerald-50 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-emerald-100 p-2 rounded-lg">
                <Calendar className="h-6 w-6 text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold text-emerald-900">3. Date & Time</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-2">Select Date</label>
                <input
                  type="date"
                  min={format(addDays(startOfToday(), 1), "yyyy-MM-dd")}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-2">Select Time</label>
                <div className="grid grid-cols-3 gap-2">
                  {TIME_SLOTS.map(time => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setSelectedTime(time)}
                      className={cn(
                        "py-2 rounded-lg text-xs font-bold border transition-all",
                        selectedTime === time ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-stone-500 border-stone-200 hover:bg-stone-50"
                      )}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-6">
              <label className="block text-sm font-bold text-stone-700 mb-2">Additional Notes (Optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Reason for visit, symptoms, or special requirements..."
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none h-32"
              />
            </div>
          </motion.div>
        )}

        {selectedTime && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-bold text-lg hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-900/20 disabled:opacity-50"
          >
            {loading ? "Processing..." : "Confirm Appointment Request"}
          </motion.button>
        )}
      </form>
    </div>
  );
}
