import React from "react";
import { motion } from "motion/react";
import { 
  GraduationCap, 
  BookOpen, 
  Award, 
  Clock, 
  Users, 
  CheckCircle2, 
  ArrowRight,
  PlayCircle,
  FileText,
  Calendar
} from "lucide-react";
import { Link } from "react-router-dom";

import { User } from "firebase/auth";
import { UserProfile } from "../types";

const COURSES = [
  {
    id: "ddd-001",
    title: "Danielle's Law (2026 Version)",
    description: "Life-threatening emergency response training for DSPs. Mandatory state requirement for all staff as of April 2026.",
    instructor: "NJDHS Provider Training",
    duration: "4 Hours",
    credits: "Mandatory",
    category: "staff-training",
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800",
    cdsLink: "https://nj.gov/humanservices/ddd/providers/training/"
  },
  {
    id: "ddd-002",
    title: "Stephen Komninos' Law Overview",
    description: "Understanding the oversight and incident reporting mandates for developmental disability services in New Jersey.",
    instructor: "Genesis Compliance Team",
    duration: "2 Hours",
    credits: "Mandatory",
    category: "staff-training",
    image: "https://images.unsplash.com/photo-1581056771107-24ca5f033842?auto=format&fit=crop&q=80&w=800",
    cdsLink: "https://nj.gov/humanservices/ddd/providers/training/"
  },
  {
    id: "genesis-001",
    title: "Genesis Excellence: Mission & Values",
    description: "Deep dive into 'Excellence as a Standard', human rights, and person-centered care philosophy.",
    instructor: "Mark Anthony Rasmussen Sr.",
    duration: "6 Hours",
    credits: "Genesis Core",
    category: "staff-training",
    image: "https://picsum.photos/seed/excellence/800/600",
    cdsLink: "#"
  },
  {
    id: "ce-001",
    title: "Advanced Autism Spectrum Care",
    description: "In-depth training on the latest behavioral interventions and support strategies for ASD.",
    instructor: "Dr. Sarah Jenkins",
    duration: "12 Hours",
    credits: "4.5 CEUs",
    category: "continuing-education",
    image: "https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&q=80&w=800",
    cdsLink: "https://nj.gov/humanservices/ddd/providers/training/"
  }
];

export default function Education({ user, profile }: { user: User | null, profile: UserProfile | null }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-bold mb-4">
            <GraduationCap className="h-4 w-4" />
            Learning Management System
          </div>
          <h1 className="text-4xl font-bold text-emerald-900 mb-4">Continuing Education & Training</h1>
          <p className="text-stone-600">
            Empowering our staff, clients, and community through specialized education and professional development programs.
          </p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white p-4 rounded-2xl border border-emerald-50 shadow-sm text-center min-w-[120px]">
            <div className="text-2xl font-bold text-emerald-600">24</div>
            <div className="text-[10px] text-stone-400 uppercase font-bold">Active Courses</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-emerald-50 shadow-sm text-center min-w-[120px]">
            <div className="text-2xl font-bold text-emerald-600">1.2k</div>
            <div className="text-[10px] text-stone-400 uppercase font-bold">Enrolled</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-emerald-50 shadow-sm">
            <h3 className="font-bold text-emerald-900 mb-4">Categories</h3>
            <div className="space-y-2">
              {["All Courses", "Continuing Education", "Staff Training", "Client Programs", "Family Resources"].map(cat => (
                <button key={cat} className="w-full text-left px-4 py-2 rounded-xl text-sm font-medium text-stone-600 hover:bg-emerald-50 hover:text-emerald-700 transition-all">
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-emerald-900 text-white p-8 rounded-3xl shadow-xl">
            <h3 className="font-bold text-lg mb-4">Certification Tracking</h3>
            <p className="text-sm text-emerald-100/80 mb-6 leading-relaxed">
              Staff members can track their CEU progress and mandatory compliance certifications directly from their portal.
            </p>
            <Link to="/dashboard" className="w-full bg-emerald-500 hover:bg-emerald-400 text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-sm">
              View My Progress
            </Link>
          </div>
        </div>

        {/* Course Grid */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-8">
          {COURSES.map((course, i) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-3xl overflow-hidden border border-emerald-50 shadow-sm hover:shadow-xl transition-all group"
            >
              <div className="h-48 relative overflow-hidden">
                <img src={course.image} alt={course.title} className="w-full h-full object-cover transition-transform group-hover:scale-110" referrerPolicy="no-referrer" />
                <div className="absolute top-4 right-4">
                  <span className="bg-white/90 backdrop-blur-md text-emerald-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase shadow-sm">
                    {course.credits}
                  </span>
                </div>
              </div>
              <div className="p-8">
                <div className="flex items-center gap-2 text-emerald-600 text-[10px] font-bold uppercase tracking-widest mb-2">
                  <BookOpen className="h-3 w-3" />
                  {course.category.replace("-", " ")}
                </div>
                <h3 className="text-xl font-bold text-emerald-900 mb-2">{course.title}</h3>
                <p className="text-stone-600 text-sm mb-6 line-clamp-2 leading-relaxed">{course.description}</p>
                
                <div className="flex items-center justify-between text-xs text-stone-400 mb-6">
                  <div className="flex items-center gap-1"><Clock className="h-3 w-3" /> {course.duration}</div>
                  <div className="flex items-center gap-1"><Users className="h-3 w-3" /> {course.instructor}</div>
                </div>

                <div className="flex gap-3">
                  <a 
                    href={(course as any).cdsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-emerald-600 text-white py-3 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                  >
                    <PlayCircle className="h-4 w-4" />
                    Start Learning (CDS Portal)
                  </a>
                  <button className="bg-stone-50 text-stone-600 p-3 rounded-xl hover:bg-stone-100 transition-all">
                    <FileText className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
