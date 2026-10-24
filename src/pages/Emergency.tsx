import React from "react";
import { motion } from "motion/react";
import { 
  ShieldAlert, 
  PhoneCall, 
  MapPin, 
  Clock, 
  AlertTriangle, 
  HeartPulse,
  Users,
  Building2,
  ArrowRight,
  Activity,
  CheckCircle
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "../lib/utils";

export default function Emergency() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      {/* Emergency Header */}
      <div className="bg-red-50 border-2 border-red-100 rounded-3xl p-8 md:p-16 mb-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <ShieldAlert className="h-64 w-64 text-red-600" />
        </div>
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-full text-sm font-bold mb-6 animate-pulse">
            <AlertTriangle className="h-4 w-4" />
            24/7 Emergency Services
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-red-900 mb-6">
            Off-Site Emergency Respite Program
          </h1>
          <p className="text-red-800/80 text-lg mb-8 leading-relaxed">
            Providing immediate, specialized support for individuals with developmental disabilities during crisis situations. Our off-site respite program ensures safety and professional care when you need it most.
          </p>
          <div className="flex flex-wrap gap-4">
            <a href="tel:5559112273" className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg shadow-red-900/20 flex items-center gap-2">
              <PhoneCall className="h-5 w-5" />
              Call Emergency Line
            </a>
            <Link to="/booking" className="bg-white text-red-900 px-8 py-4 rounded-xl font-bold hover:bg-red-50 transition-all border border-red-200">
              Request Respite Care
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Program Details */}
        <div className="lg:col-span-2 space-y-12">
          <section>
            <h2 className="text-3xl font-bold text-emerald-900 mb-6">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  title: "Immediate Assessment",
                  description: "Our team performs a rapid clinical assessment to determine the level of care required.",
                  icon: Activity
                },
                {
                  title: "Safe Transport",
                  description: "We provide secure transportation to our specialized off-site respite facilities.",
                  icon: Building2
                },
                {
                  title: "Professional Supervision",
                  description: "24/7 monitoring by trained DSPs and medical professionals.",
                  icon: Users
                },
                {
                  title: "Crisis Stabilization",
                  description: "Focus on de-escalation and stabilization in a therapeutic environment.",
                  icon: HeartPulse
                }
              ].map((step, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl border border-emerald-50 shadow-sm">
                  <div className="bg-emerald-50 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                    <step.icon className="h-6 w-6 text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-bold text-emerald-900 mb-2">{step.title}</h3>
                  <p className="text-stone-600 text-sm">{step.description}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-emerald-900 text-white p-8 md:p-12 rounded-3xl">
            <h2 className="text-2xl font-bold mb-6">Eligibility & Intake</h2>
            <p className="text-emerald-100/80 mb-8">
              Our emergency respite program is available to residents of New Jersey with a documented developmental disability. Intake can be initiated by family members, legal guardians, or medical professionals.
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="bg-emerald-800 p-2 rounded-lg mt-1"><CheckCircle className="h-5 w-5 text-emerald-400" /></div>
                <div>
                  <h4 className="font-bold">Required Documentation</h4>
                  <p className="text-sm opacity-70">Recent medical history, IEP/ISP documents, and insurance information.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-emerald-800 p-2 rounded-lg mt-1"><CheckCircle className="h-5 w-5 text-emerald-400" /></div>
                <div>
                  <h4 className="font-bold">Duration of Stay</h4>
                  <p className="text-sm opacity-70">Respite stays typically range from 24 hours to 14 days depending on the situation.</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Contact & Locations */}
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-3xl border border-emerald-50 shadow-sm">
            <h3 className="text-xl font-bold text-emerald-900 mb-6">Emergency Contacts</h3>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="bg-red-50 p-3 rounded-xl text-red-600">
                  <PhoneCall className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-xs text-stone-400 uppercase font-bold">Main Emergency Line</div>
                  <div className="text-lg font-bold text-red-900">(555) 911-CARE</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-emerald-50 p-3 rounded-xl text-emerald-600">
                  <PhoneCall className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-xs text-stone-400 uppercase font-bold">Intake Coordinator</div>
                  <div className="text-lg font-bold text-emerald-900">(555) 123-INTK</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-emerald-50 shadow-sm">
            <h3 className="text-xl font-bold text-emerald-900 mb-6">Respite Locations</h3>
            <div className="space-y-4">
              {[
                { name: "North NJ Respite Center", address: "456 Highland Ave, Newark, NJ", status: "Available" },
                { name: "Central NJ Respite Center", address: "789 Pine St, Princeton, NJ", status: "Limited" },
                { name: "South NJ Respite Center", address: "101 Ocean Dr, Cherry Hill, NJ", status: "Full" }
              ].map((loc, i) => (
                <div key={i} className="p-4 bg-stone-50 rounded-2xl border border-stone-100">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-emerald-900 text-sm">{loc.name}</h4>
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full",
                      loc.status === "Available" ? "bg-emerald-100 text-emerald-700" :
                      loc.status === "Limited" ? "bg-amber-100 text-amber-700" :
                      "bg-red-100 text-red-700"
                    )}>
                      {loc.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-stone-500">
                    <MapPin className="h-3 w-3" />
                    {loc.address}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
