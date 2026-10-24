import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, arrayUnion, onSnapshot } from "firebase/firestore";
import { auth, db } from "./firebase";
import { UserProfile, UserRole } from "./types";
import { cn } from "./lib/utils";
import { 
  LayoutGrid, 
  LayoutDashboard, 
  Calendar, 
  Users, 
  FileText, 
  GraduationCap, 
  ShieldAlert, 
  LogOut, 
  LogIn, 
  Menu, 
  X,
  MessageSquare,
  Building2,
  HeartPulse,
  Heart,
  PhoneCall,
  Settings,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { VoiceProvider, useVoice } from "./lib/voice";
import { Volume2, VolumeX } from "lucide-react";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import Booking from "./pages/Booking";
import Departments from "./pages/Departments";
import Emergency from "./pages/Emergency";
import Staff from "./pages/Staff";
import Forms from "./pages/Forms";
import Education from "./pages/Education";
import LeadCapture from "./pages/LeadCapture";
import VirtualTour from "./pages/VirtualTour";
import Consent from "./pages/Consent";
import Apply from "./pages/Apply";
import IncidentReport from "./pages/IncidentReport";
import FamilyPortal from "./pages/FamilyPortal";
import TrainingPortal from "./pages/TrainingPortal";

import { SecurityMonitor } from "./components/SecurityMonitor";

const Navbar = ({ user, profile }: { user: User | null, profile: UserProfile | null }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  const navLinks = [
    { name: "Home", path: "/", icon: Building2 },
    { name: "Activity Rooms", path: "/departments", icon: LayoutGrid },
    { name: "Emergency", path: "/emergency", icon: ShieldAlert },
    { name: "Staff", path: "/staff", icon: Users },
  ];

  if (user) {
    navLinks.push({ name: "Dashboard", path: "/dashboard", icon: LayoutDashboard });
    navLinks.push({ name: "Training Portal", path: "/training-portal", icon: GraduationCap });
    const isAdmin = profile?.role === UserRole.ADMIN || 
                   profile?.email === "tiny.rassmann@gmail.com" || 
                   profile?.email === "tiny.rasman@gmail.com";
    
    if (isAdmin) {
      navLinks.push({ name: "Admin", path: "/admin", icon: ShieldCheck });
    }
    if (profile?.role === UserRole.FAMILY) {
      navLinks.push({ name: "Family Portal", path: "/family-portal", icon: Heart });
    }
  }

  const { isVoiceEnabled, setIsVoiceEnabled } = useVoice();

  return (
    <nav className="bg-emerald-800 text-stone-50 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-3">
              <div className="bg-emerald-400 p-1.5 rounded-lg">
                <HeartPulse className="h-6 w-6 text-emerald-900" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-lg leading-none tracking-tighter">GENESIS</span>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.2em] leading-none">Revitalization Group - GRG</span>
              </div>
            </Link>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <button
                onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
                className="p-2 rounded-md hover:bg-emerald-700 text-emerald-100 transition-colors"
                title={isVoiceEnabled ? "Disable Voice" : "Enable Voice"}
              >
                {isVoiceEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
              </button>
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2",
                    location.pathname === link.path 
                      ? "bg-emerald-900 text-white" 
                      : "hover:bg-emerald-700 text-emerald-100"
                  )}
                >
                  <link.icon className="h-4 w-4" />
                  {link.name}
                </Link>
              ))}
              {user ? (
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-emerald-700 text-emerald-100 flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              ) : (
                <Link
                  to="/login"
                  className="bg-emerald-500 hover:bg-emerald-400 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <LogIn className="h-4 w-4" />
                  Login
                </Link>
              )}
            </div>
          </div>
          
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-emerald-100 hover:text-white hover:bg-emerald-700 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-emerald-900"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-emerald-100 hover:text-white hover:bg-emerald-700 flex items-center gap-2"
                >
                  <link.icon className="h-5 w-5" />
                  {link.name}
                </Link>
              ))}
              {user ? (
                <button
                  onClick={() => { handleLogout(); setIsOpen(false); }}
                  className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-emerald-100 hover:text-white hover:bg-emerald-700 flex items-center gap-2"
                >
                  <LogOut className="h-5 w-5" />
                  Logout
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-white bg-emerald-500 hover:bg-emerald-400 flex items-center gap-2"
                >
                  <LogIn className="h-5 w-5" />
                  Login
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const ChatBot = ({ user }: { user: User | null }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "ai", text: string, timestamp?: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [proactiveTip, setProactiveTip] = useState<string | null>(null);

  const tips = [
    "Did you know you can install this app on your phone for instant access? Click 'Install App' in the dashboard.",
    "Excellence Standard: Always review the Operating Manual for your role to stay ahead of the curve.",
    "Safety First: Ensure your geolocation is enabled for mandatory safety fail-safes.",
    "Impact Goal: Try to make at least one 'Spectacular' interaction today to erase the average."
  ];

  useEffect(() => {
    if (isOpen) {
      setProactiveTip(tips[Math.floor(Math.random() * tips.length)]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!user || !isOpen) return;

    const chatRef = doc(db, "chatHistory", user.uid + "_concierge");
    const unsubscribe = onSnapshot(chatRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setMessages(data.messages || []);
      } else {
        setMessages([
          { role: "ai", text: "Hello! I'm your Genesis Revitalization assistant. How can I help you today?", timestamp: new Date().toISOString() }
        ]);
      }
    });

    return unsubscribe;
  }, [user, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || !user) return;
    const userMsg = input;
    const timestamp = new Date().toISOString();
    setInput("");
    
    // Optimistic update
    const newMessage = { role: "user" as const, text: userMsg, timestamp };
    setMessages(prev => [...prev, newMessage]);
    setLoading(true);

    try {
      const chatRef = doc(db, "chatHistory", user.uid + "_concierge");
      const chatSnap = await getDoc(chatRef);
      
      if (!chatSnap.exists()) {
        await setDoc(chatRef, {
          userId: user.uid,
          agentType: "concierge",
          messages: [newMessage],
          updatedAt: timestamp
        });
      } else {
        await updateDoc(chatRef, {
          messages: arrayUnion(newMessage),
          updatedAt: timestamp
        });
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: userMsg,
          history: messages.map(m => ({
            role: m.role === "user" ? "user" : "model",
            parts: [{ text: m.text }]
          }))
        })
      });
      const data = await response.json();
      if (data.success) {
        const aiMsg = { role: "ai" as const, text: data.text, timestamp: new Date().toISOString() };
        await updateDoc(chatRef, {
          messages: arrayUnion(aiMsg),
          updatedAt: new Date().toISOString()
        });
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      console.error("Chat Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="bg-white rounded-2xl shadow-2xl w-80 sm:w-96 h-[500px] flex flex-col mb-4 overflow-hidden border border-emerald-100"
          >
            <div className="bg-emerald-700 p-4 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                <span className="font-semibold">AI Medical Assistant</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-emerald-600 p-1 rounded">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50">
              {proactiveTip && (
                <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl flex gap-2 items-start relative">
                  <Sparkles className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div className="pr-4">
                    <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Proactive Excellence</div>
                    <p className="text-xs text-emerald-800 italic">"{proactiveTip}"</p>
                  </div>
                  <button onClick={() => setProactiveTip(null)} className="absolute top-2 right-2 text-emerald-300 hover:text-emerald-600">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              {messages.map((msg, i) => (
                <div key={i} className={cn(
                  "max-w-[80%] p-3 rounded-2xl text-sm",
                  msg.role === "user" 
                    ? "bg-emerald-600 text-white ml-auto rounded-tr-none" 
                    : "bg-white text-stone-800 border border-emerald-100 rounded-tl-none"
                )}>
                  {msg.text}
                </div>
              ))}
              {loading && (
                <div className="bg-white text-stone-800 border border-emerald-100 rounded-2xl rounded-tl-none p-4 shadow-sm max-w-[80%]">
                  <div className="flex gap-1.5 items-center">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest ml-2">Genesis AI is thinking...</span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t bg-white flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask me anything..."
                className="flex-1 border border-stone-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                onClick={handleSend}
                disabled={loading}
                className="bg-emerald-600 text-white p-2 rounded-full hover:bg-emerald-700 disabled:opacity-50"
              >
                <MessageSquare className="h-5 w-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-emerald-600 text-white p-4 rounded-full shadow-xl hover:bg-emerald-700 transition-transform hover:scale-110"
      >
        <MessageSquare className="h-6 w-6" />
      </button>
    </div>
  );
};

export default function App() {
  return (
    <VoiceProvider>
      <AppContent />
    </VoiceProvider>
  );
}

function AppContent() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { speak } = useVoice();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const docRef = doc(db, "users", firebaseUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile);
        } else {
          // Create default profile if not exists
          const newProfile: UserProfile = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || "",
            displayName: firebaseUser.displayName || "User",
            role: UserRole.PATIENT,
            createdAt: new Date().toISOString(),
          };
          await setDoc(docRef, newProfile);
          setProfile(newProfile);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const hasGreeted = React.useRef(false);

  useEffect(() => {
    if (!loading && !user && !hasGreeted.current) {
      // speak("Welcome to Genesis Revitalization Group. Please log in to access your secure portal.");
      hasGreeted.current = true;
    }
  }, [loading, user, speak]);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-stone-50 text-stone-900 font-sans">
        <Navbar user={user} profile={profile} />
        <main className="pb-20">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/consent" element={<Consent />} />
            <Route path="/apply" element={<Apply />} />
            <Route path="/departments" element={<Departments />} />
            <Route path="/emergency" element={<Emergency />} />
            <Route path="/staff" element={<Staff />} />
            <Route path="/dashboard" element={<Dashboard user={user} profile={profile} />} />
            <Route path="/training-portal" element={<TrainingPortal user={user} profile={profile} />} />
            <Route path="/admin" element={<Admin user={user} profile={profile} />} />
            <Route path="/booking" element={<Booking user={user} profile={profile} />} />
            <Route path="/forms" element={<Forms user={user} profile={profile} />} />
            <Route path="/education" element={<Education user={user} profile={profile} />} />
            <Route path="/lead-capture" element={<LeadCapture />} />
            <Route path="/virtual-tour" element={<VirtualTour />} />
            <Route path="/incident-report" element={<IncidentReport user={user} profile={profile} />} />
            <Route path="/family-portal" element={<FamilyPortal user={user} profile={profile} />} />
          </Routes>
        </main>
        <ChatBot user={user} />
        <SecurityMonitor user={user} profile={profile} />
        
        <footer className="bg-emerald-900 text-emerald-100 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-white">
                <HeartPulse className="h-6 w-6 text-emerald-400" />
                <span className="font-bold text-lg text-emerald-400">Genesis Revitalization Group-GRG</span>
              </div>
              <p className="text-sm opacity-80">
                Providing compassionate care and specialized activity programs for developmental disabilities in New Jersey.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Staff & Compliance</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/staff" className="hover:text-white">Our Staff</Link></li>
                <li><Link to="/training-portal" className="hover:text-white">Training Portal</Link></li>
                <li><Link to="/education" className="hover:text-white">Continuing Education</Link></li>
                <li><Link to="/apply" className="hover:text-emerald-400 font-bold text-emerald-400">Join Our Team (Apply)</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Facility & Support</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/departments" className="hover:text-white">Activity Rooms</Link></li>
                <li><Link to="/emergency" className="hover:text-white">Emergency Services</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Patient Portal</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/dashboard" className="hover:text-white">My Dashboard</Link></li>
                <li><Link to="/booking" className="hover:text-white">Book Appointment</Link></li>
                <li><Link to="/forms" className="hover:text-white">Intake Forms</Link></li>
                <li><Link to="/virtual-tour" className="hover:text-white">Virtual Tour</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Contact & Headquarters</h3>
              <ul className="space-y-4 text-sm">
                <li className="flex items-start gap-2">
                  <Building2 className="h-5 w-5 text-emerald-400 shrink-0" />
                  <div className="flex flex-col">
                    <span className="font-bold text-white">Atlantic City HQ</span>
                    <span className="opacity-80">16 S. Rhode Island Ave</span>
                    <span className="opacity-80">Atlantic City, NJ 08401</span>
                  </div>
                </li>
                <li className="flex items-center gap-2 text-emerald-400 font-bold">
                  <ShieldAlert className="h-4 w-4" /> Emergency: 911
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Executive Leadership</h3>
              <ul className="space-y-2 text-sm">
                <li className="opacity-80"><span className="font-bold text-emerald-400">Executive Director:</span> William Rassmann</li>
                <li className="opacity-80"><span className="font-bold text-emerald-400">Partnerships:</span> info@genesisrevitalization.com</li>
                <li className="flex items-center gap-2 mt-4"><PhoneCall className="h-4 w-4" /> (555) 123-4567</li>
              </ul>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-emerald-800 text-center text-xs opacity-60">
            © 2026 Genesis Revitalization Group-GRG. HIPAA Compliant. All Rights Reserved.
          </div>
        </footer>
      </div>
    </Router>
  );
}
