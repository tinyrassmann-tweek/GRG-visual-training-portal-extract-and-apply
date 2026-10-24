import React from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { 
  ArrowRight, 
  LayoutGrid, 
  ShieldAlert, 
  Users, 
  Calendar, 
  Video, 
  ClipboardList,
  GraduationCap,
  HeartPulse,
  Activity,
  Microscope,
  Baby,
  PhoneCall,
  ShieldCheck,
  Briefcase
} from "lucide-react";
import { OPEN_POSITIONS } from "../lib/staffData";
import { HomepageAgent } from "../components/HomepageAgent";

const FeatureCard = ({ icon: Icon, title, description, link }: any) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-50 hover:shadow-md transition-all"
  >
    <div className="bg-emerald-50 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
      <Icon className="h-6 w-6 text-emerald-600" />
    </div>
    <h3 className="text-lg font-bold text-emerald-900 mb-2">{title}</h3>
    <p className="text-stone-600 text-sm mb-4 leading-relaxed">{description}</p>
    <Link to={link} className="text-emerald-600 font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all">
      Learn more <ArrowRight className="h-4 w-4" />
    </Link>
  </motion.div>
);

export default function Home() {
  return (
    <div className="space-y-24">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center overflow-hidden bg-emerald-900">
        <div className="absolute inset-0 opacity-20">
          <img 
            src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=2000" 
            alt="Hospital background" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="max-w-2xl text-white"
          >
            <div className="inline-flex items-center gap-2 bg-emerald-800/50 px-4 py-2 rounded-full text-emerald-300 text-sm font-semibold mb-6">
              <ShieldAlert className="h-4 w-4" />
              Genesis Revitalization Group-GRG
            </div>
            <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
              Compassionate Care for <span className="text-emerald-400">Every Journey.</span>
            </h1>
            <p className="text-lg text-emerald-100/80 mb-8 leading-relaxed">
              NJ D&D Medical Center provides specialized healthcare, respite programs, and educational resources for individuals with developmental disabilities.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/booking" className="bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg shadow-emerald-900/20">
                Book Appointment
              </Link>
              <Link to="/virtual-tour" className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-md px-8 py-4 rounded-xl font-bold transition-all border border-white/20">
                Take a Virtual Tour
              </Link>
            </div>

            {/* Open Positions Marquee */}
            <div className="mt-12 pt-8 border-t border-white/10">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4">
                <Briefcase className="h-4 w-4" />
                Open Positions Available
              </div>
              <div className="relative overflow-hidden h-12">
                <motion.div 
                  animate={{ x: ["0%", "-50%"] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="flex gap-8 whitespace-nowrap absolute left-0"
                >
                  {[...OPEN_POSITIONS, ...OPEN_POSITIONS].map((job, i) => (
                    <div key={i} className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-lg border border-white/10">
                      <span className="text-sm font-bold text-white">{job.title}</span>
                      <span className="text-[10px] text-emerald-400 uppercase font-bold">{job.department}</span>
                    </div>
                  ))}
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { label: "Patients/Clients Served", value: "1,000+ and counting" },
            { label: "Specialized Staff (Licensed Users)", value: "120+" },
            { label: "Excellence", value: "One year of excellence, infinity to go." },
          ].map((stat, i) => (
            <div key={i} className="text-center p-6 bg-white rounded-2xl shadow-sm border border-emerald-50">
              <div className="text-3xl font-bold text-emerald-600 mb-2">{stat.value}</div>
              <div className="text-stone-500 text-xs font-medium uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Services Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-emerald-900 mb-4">Our Specialized Services</h2>
          <p className="text-stone-600 max-w-3xl mx-auto leading-relaxed">
            We offer a wide range of known and practiced D.D.D. support services and new and innovative AI accompanied supports, in-house apps, personalized AI employee co-workers and staff, and an exclusive, all-in-one service center, family center, client portal, staff portal, all AI autonomous and mobile app-based, web-friendly.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={LayoutGrid}
            title="Activity Rooms"
            description="From computer science to culinary arts, our 8 dedicated rooms are equipped for specialized client growth."
            link="/departments"
          />
          <FeatureCard 
            icon={ShieldAlert}
            title="Emergency Respite"
            description="Off-site emergency respite programs providing immediate support during critical times."
            link="/emergency"
          />
          <FeatureCard 
            icon={GraduationCap}
            title="Continuing Education"
            description="Courses and training programs for staff, clients, and families to ensure ongoing growth."
            link="/education"
          />
          <FeatureCard 
            icon={ClipboardList}
            title="Intake & Onboarding"
            description="Streamlined digital onboarding for new patients and staff with HIPAA compliance."
            link="/forms"
          />
          <FeatureCard 
            icon={Video}
            title="Virtual Consultations"
            description="Connect with our specialists from the comfort of your home via secure video links."
            link="/booking"
          />
          <FeatureCard 
            icon={Users}
            title="Community Programs"
            description="Partnerships and affiliations that strengthen our support network across New Jersey."
            link="/staff"
          />
        </div>
      </section>

      {/* Emergency CTA */}
      <section className="bg-stone-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-emerald-800 rounded-3xl p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8 text-white">
            <div className="max-w-xl">
              <h2 className="text-3xl font-bold mb-4">Need Immediate Assistance?</h2>
              <p className="text-emerald-100/80 mb-6">
                Our emergency respite program is available 24/7. If you are in a crisis or need immediate support for a loved one, we are here to help.
              </p>
              <div className="flex items-center gap-4">
                <div className="bg-emerald-700 p-3 rounded-full">
                  <PhoneCall className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-sm opacity-70">24/7 Emergency Line</div>
                  <div className="text-xl font-bold">(555) 911-CARE</div>
                </div>
              </div>
            </div>
            <Link to="/emergency" className="bg-white text-emerald-800 px-10 py-4 rounded-xl font-bold hover:bg-emerald-50 transition-all whitespace-nowrap">
              Emergency Services
            </Link>
          </div>
        </div>
      </section>

      {/* Careers Section */}
      <section className="bg-emerald-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-xs font-bold mb-6">
                <Briefcase className="h-4 w-4" />
                Work with Excellence
              </div>
              <h2 className="text-4xl font-bold text-emerald-900 mb-6">Build a Career of Impact.</h2>
              <p className="text-emerald-800/80 mb-8 leading-relaxed">
                We are looking for dedicated professionals who believe in "Excellence as a Standard." 
                Our AI-assisted merit-based hiring ensures a bias-free experience where your skills and heart for service are the only metrics.
              </p>
              <div className="flex gap-4">
                <Link to="/apply" className="bg-emerald-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-900/10">
                  View Open Positions
                </Link>
                <Link to="/staff" className="bg-white border border-emerald-100 text-emerald-900 px-8 py-4 rounded-xl font-bold hover:bg-stone-50 transition-all">
                  Meet the Team
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
              <div className="space-y-4">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-emerald-100">
                  <div className="text-2xl font-bold text-emerald-600 mb-1">3</div>
                  <div className="text-[10px] text-stone-400 uppercase font-bold">New Hires Pending</div>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-emerald-100 mt-8">
                  <div className="text-2xl font-bold text-emerald-600 mb-1">Audit</div>
                  <div className="text-[10px] text-stone-400 uppercase font-bold">Ready Workflow</div>
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="bg-emerald-900 p-6 rounded-3xl shadow-xl text-white">
                  <div className="text-2xl font-bold mb-1">100%</div>
                  <div className="text-[10px] opacity-60 uppercase font-bold">Bias-Free Hiring</div>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-emerald-100">
                  <div className="text-2xl font-bold text-emerald-600 mb-1">1099</div>
                  <div className="text-[10px] text-stone-400 uppercase font-bold">Partner Slots</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lead Capture Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-bold text-emerald-900 mb-6">Join Our Community</h2>
            <p className="text-stone-600 mb-8 leading-relaxed">
              Stay updated with the latest medical advancements, community events, and resources for developmental disabilities. Sign up for our newsletter and resource guide.
            </p>
            <ul className="space-y-4">
              {[
                { icon: ShieldCheck, text: "HIPAA Protected Data" },
                { icon: Activity, text: "Monthly Health Insights" },
                { icon: HeartPulse, text: "Priority Event Access" },
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-stone-700 font-medium">
                  <item.icon className="h-5 w-5 text-emerald-600" />
                  {item.text}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-emerald-50">
            <h3 className="text-2xl font-bold text-emerald-900 mb-6">Request Information</h3>
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="First Name" className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none" />
                <input type="text" placeholder="Last Name" className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <input type="email" placeholder="Email Address" className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none" />
              <select className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none bg-white">
                <option>I am a...</option>
                <option>Patient</option>
                <option>Family Member</option>
                <option>Medical Professional</option>
                <option>Staff Applicant</option>
              </select>
              <button className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700 transition-all">
                Get Started
              </button>
            </form>
          </div>
        </div>
      </section>
      <HomepageAgent />
    </div>
  );
}
