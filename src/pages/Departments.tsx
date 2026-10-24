import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Monitor, 
  Palette, 
  Briefcase, 
  Dumbbell, 
  Music, 
  Utensils, 
  Sparkles,
  Home,
  ArrowRight,
  PlayCircle,
  BookOpen,
  Clock,
  X,
  Bot,
  ShieldCheck,
  Zap,
  RefreshCw,
  Play
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "../lib/utils";
import { LoadingOverlay } from "../components/LoadingOverlay";

const DEPARTMENTS = [
  {
    id: "computer-science",
    name: "Interactive Game Room",
    description: "Focus on engagement, puzzle-solving, and cognitive stimulation using high-energy digital interfaces.",
    icon: Monitor,
    color: "bg-blue-50 text-blue-600",
    features: ["Engagement", "Puzzle-solving", "Cognitive Stimulation"],
    training: {
      videoUrl: null,
      outline: ["CosmoCode Navigation", "Hardware Basics", "Software Safety", "Assistive Controls"],
      sop: "Maintain a luminous, high-energy environment. Ensure all digital interfaces and puzzle stations are functioning before clients arrive. Facilitate teamwork and cognitive engagement over passive consumption.",
      briefings: [
        {
          title: "Standard of Excellence",
          content: "Maintain a luminous, high-energy environment. Ensure all digital interfaces and puzzle stations are functioning before clients arrive. Facilitate teamwork and cognitive engagement over passive consumption."
        },
        {
          title: "DSP Expectations & Oversight",
          content: "DSPs must maintain line of sight on all clients engaging with interactive screens. Monitor frustration levels during difficult puzzles and intervene with guidance. Sanitize touch screens and joysticks between split sessions."
        },
        {
          title: "AI Integration",
          content: "The AI Agent logs engagement metrics automatically via room sensors. Observe the AI dashboard for real-time alerts on client overstimulation. Collaborate with the AI to adjust game difficulty dynamically based on client performance."
        }
      ],
      dailySchedule: [
        { time: "09:00 AM", activity: "CosmoCode Free Play" },
        { time: "10:30 AM", activity: "Guided Digital Learning" },
        { time: "01:00 PM", activity: "Interactive Group Games" }
      ]
    }
  },
  {
    id: "art-studio",
    name: "Visual Arts Studio",
    description: "A mature space for vibrant self-expression and modern art creations, from digital tablets to physical media.",
    icon: Palette,
    color: "bg-purple-50 text-purple-600",
    features: ["Painting & Drawing", "Digital Art Tablets", "Therapeutic Art"],
    training: {
      videoUrl: null,
      outline: ["Medium Selection", "Safety with Tools", "Creative Expression", "Cleanup SOP"],
      sop: "Avoid treating this as standard 'arts and crafts.' Frame activities as professional artistic expression. Keep the studio aesthetically pleasing; clean spills but leave harmonious artistic marks.",
      briefings: [
        {
          title: "Standard of Excellence",
          content: "Avoid treating this as standard 'arts and crafts.' Frame activities as professional artistic expression. Keep the studio aesthetically pleasing; clean spills but leave harmonious artistic marks. Ensure high-quality materials are accessible."
        },
        {
          title: "DSP Expectations & Oversight",
          content: "Guide clients in using digital art tablets as well as physical paint. Ensure safe usage of non-toxic paints and artistic tools. Encourage autonomy; do not do the art for them."
        },
        {
          title: "Therapeutic Value",
          content: "Art is used here to improve fine motor skills and emotional regulation. Document breakthroughs in client expression. Prepare selected pieces for the facility's digital gallery showcase."
        }
      ],
      dailySchedule: [
        { time: "09:30 AM", activity: "Morning Sketching" },
        { time: "11:00 AM", activity: "Main Project Work" },
        { time: "02:00 PM", activity: "Digital Art Session" }
      ]
    }
  },
  {
    id: "vocational",
    name: "Workplace Readiness Center",
    description: "Simulated workplace environment focusing on professional etiquette, resume building, and tech-literacy.",
    icon: Briefcase,
    color: "bg-emerald-50 text-emerald-600",
    features: ["Vocational Training", "Resume Building", "Professional Etiquette"],
    training: {
      videoUrl: null,
      outline: ["Professional Attire", "Time Management", "Customer Service", "Conflict Resolution"],
      sop: "Maintain strict professional etiquette within this room to simulate a real workplace. Keep digital smart boards ready with resume templates. Dress code and manners should be emphasized positively.",
      briefings: [
        {
          title: "Standard of Excellence",
          content: "Maintain strict professional etiquette within this room to simulate a real workplace. Keep digital smart boards ready with resume templates. Dress code and manners should be emphasized positively."
        },
        {
          title: "DSP Expectations & Oversight",
          content: "A DSP acts as a 'manager' or 'mentor,' not just a caretaker. Assist clients in basic computer literacy and typing practice. Lead mock interviews with supportive, constructive feedback."
        },
        {
          title: "AI Integration",
          content: "The AI Agent processes mock interview speech patterns to suggest improvements. Use AI-generated resume templates populated with the client's strengths. Review the weekly progress reports generated by the AI on typing speed and focus."
        }
      ],
      dailySchedule: [
        { time: "09:00 AM", activity: "Morning Briefing" },
        { time: "10:00 AM", activity: "Task Rotation" },
        { time: "01:30 PM", activity: "Mock Interviews" }
      ]
    }
  },
  {
    id: "fitness",
    name: "Physical Training Gym",
    description: "Adaptive mobility awareness and strength building in a bright, motivating environment.",
    icon: Dumbbell,
    color: "bg-amber-50 text-amber-600",
    features: ["Adaptive Fitness", "Mobility Training", "Strength Building"],
    training: {
      videoUrl: null,
      outline: ["Warm-up Routines", "Equipment Safety", "Hydration Importance", "Cool-down"],
      sop: "A clean, vibrant, and motivating atmosphere must be maintained. Ensure all adaptive mobility mechanisms (ramps, rails) are unobstructed. Celebrate small physical milestones consistently.",
      briefings: [
        {
          title: "Standard of Excellence",
          content: "A clean, vibrant, and motivating atmosphere must be maintained. Ensure all adaptive mobility mechanisms (ramps, rails) are unobstructed. Celebrate small physical milestones consistently."
        },
        {
          title: "DSP Expectations & Oversight",
          content: "Safety is priority #1. Never leave a client unattended on gym equipment. Assist only as needed with supportive rails and weight adjustments. Maintain proper biomechanical form to protect both clients and yourself."
        },
        {
          title: "Holistic Health",
          content: "Focus on adaptive mobility, not just heavy strength training. Encourage water breaks and monitor heart rates. Log physical exertion levels to track fatigue throughout the day."
        }
      ],
      dailySchedule: [
        { time: "10:00 AM", activity: "Group Mobility" },
        { time: "11:30 AM", activity: "Individual Circuits" },
        { time: "02:00 PM", activity: "Cool-down Yoga" }
      ]
    }
  },
  {
    id: "music-dance",
    name: "Music Hall",
    description: "Dance therapy, breathing exercises, and rhythmic expression in a balanced acoustic environment.",
    icon: Music,
    color: "bg-red-50 text-red-600",
    features: ["Instrumental Training", "Dance Therapy", "Performance Skills"],
    training: {
      videoUrl: null,
      outline: ["Instrument Care", "Rhythm Exercises", "Stage Presence", "Group Harmony"],
      sop: "Keep the acoustic environment balanced—capable of upbeat energy or zen calming. Instruments should be tuned, organized, and inviting. Respect the flow of dance therapy; avoid interruptions.",
      briefings: [
        {
          title: "Standard of Excellence",
          content: "Keep the acoustic environment balanced—capable of upbeat energy or zen calming. Instruments should be tuned, organized, and inviting. Respect the flow of dance therapy; avoid interruptions."
        },
        {
          title: "DSP Expectations & Oversight",
          content: "Participate! DSPs should model the breathing exercises and dance movements. Monitor clients for sensory overload during high-volume sessions. Ensure the hardwood floors remain clear of slipping hazards."
        },
        {
          title: "Therapeutic Methods",
          content: "Use deep diaphragmatic breathing prior to active musical sessions. Encourage non-verbal expression through percussion. Transition smoothly between upbeat activity and cool-down meditative states."
        }
      ],
      dailySchedule: [
        { time: "10:00 AM", activity: "Vocal Warm-ups" },
        { time: "11:00 AM", activity: "Ensemble Practice" },
        { time: "02:00 PM", activity: "Dance Therapy" }
      ]
    }
  },
  {
    id: "culinary",
    name: "Home Ec Kitchen",
    description: "Highly accessible culinary setup for meal prep, kitchen safety, and nutrition education.",
    icon: Utensils,
    color: "bg-orange-50 text-orange-600",
    features: ["Nutrition Education", "Meal Preparation", "Kitchen Safety"],
    training: {
      videoUrl: null,
      outline: ["Kitchen Safety", "Food Handling", "Recipe Reading", "Dishwashing SOP"],
      sop: "Maintain a spotless, state-of-the-art kitchen. Cleanliness is paramount. Ensure all accessible counter heights are properly utilized. Demonstrate premium culinary hygiene and safety standards at all times.",
      briefings: [
        {
          title: "Standard of Excellence",
          content: "Maintain a spotless, state-of-the-art kitchen. Cleanliness is paramount. Ensure all accessible counter heights are properly utilized. Demonstrate premium culinary hygiene and safety standards at all times."
        },
        {
          title: "DSP Expectations & Oversight",
          content: "Directly supervise any engagement with heat sources or sharp utensils. Teach steps sequentially: personal hygiene (hand washing), prep, cooking, cleaning. Encourage independence in safe tasks like mixing or measuring."
        },
        {
          title: "AI Integration",
          content: "The AI Agent provides step-by-step visual recipes on smart screens. AI alerts DSPs if the stove is left unattended or temperatures exceed safety norms. Track nutritional understanding through AI-assisted pop quizzes."
        }
      ],
      dailySchedule: [
        { time: "10:00 AM", activity: "Prep Work" },
        { time: "11:30 AM", activity: "Cooking Session" },
        { time: "02:00 PM", activity: "Clean-up Skills" }
      ]
    }
  },
  {
    id: "sensory",
    name: "Sensory Integration Room",
    description: "Calming sanctuary with soft lighting and tactical integration for de-escalation and comfort.",
    icon: Sparkles,
    color: "bg-cyan-50 text-cyan-600",
    features: ["Sensory Regulation", "Equipment Care", "De-escalation Techniques"],
    training: {
      videoUrl: null,
      outline: ["Sensory Regulation", "Equipment Care", "De-escalation Techniques", "Environment Control"],
      sop: "Preserve the tranquility of the room. Keep voices low and movements slow. Ensure fiber optic lighting and tactile walls are functioning correctly. Treat this space as a sanctuary for de-escalation and comfort.",
      briefings: [
        {
          title: "Standard of Excellence",
          content: "Preserve the tranquility of the room. Keep voices low and movements slow. Ensure fiber optic lighting and tactile walls are functioning correctly. Treat this space as a sanctuary for de-escalation and comfort."
        },
        {
          title: "DSP Expectations & Oversight",
          content: "Monitor clients for signs of calming vs. withdrawal. Do not force interaction with the tactile structures; let the client guide. Limit the number of clients in the room to maintain a peaceful aura."
        },
        {
          title: "AI Integration",
          content: "The AI system automatically adjusts lighting and ambient noise based on the user's biometric responses. Review the AI reports on which tactile inputs provide the most relief for specific clients. Use the AI dashboard to schedule cool-down periods efficiently."
        }
      ],
      dailySchedule: [
        { time: "09:00 AM", activity: "Open Exploration" },
        { time: "01:00 PM", activity: "Guided Relaxation" },
        { time: "03:00 PM", activity: "Sensory Integration" }
      ]
    }
  },
  {
    id: "life-skills",
    name: "Life Skills Lab",
    description: "Room 8: Simulating home environments to teach independent living and daily management.",
    icon: Home,
    color: "bg-indigo-50 text-indigo-600",
    features: ["Independent Living", "Money Management", "Personal Care"],
    training: {
      videoUrl: null,
      outline: ["Laundry Basics", "Budgeting", "Personal Hygiene", "Home Safety"],
      sop: "Simulated tasks must be practical and repeatable. Staff should encourage independence while providing 'just-in-time' support for complex tasks like budgeting or appliance safety.",
      dailySchedule: [
        { time: "09:30 AM", activity: "Morning Routine" },
        { time: "11:00 AM", activity: "Household Tasks" },
        { time: "02:00 PM", activity: "Financial Literacy" }
      ]
    }
  }
];

export default function Departments() {
  const [selectedRoom, setSelectedRoom] = React.useState<string | null>(null);
  const [showTraining, setShowTraining] = React.useState(false);
  const [isOpening, setIsOpening] = React.useState(false);
  const [currentSlide, setCurrentSlide] = React.useState(0);

  const currentRoom = selectedRoom ? DEPARTMENTS.find(r => r.id === selectedRoom) : null;

  const handleOpenTraining = (id: string) => {
    setIsOpening(true);
    setSelectedRoom(id);
    setCurrentSlide(0);
    setTimeout(() => {
      setIsOpening(false);
      setShowTraining(true);
    }, 600);
  };

  const getRoomImage = (id: string) => {
    const seeds: Record<string, string> = {
      "computer-science": "gaming",
      "art-studio": "art",
      "vocational": "office",
      "fitness": "gym",
      "music-dance": "music",
      "culinary": "kitchen",
      "sensory": "nature",
      "independent-living": "home"
    };
    return `https://picsum.photos/seed/${seeds[id] || "room"}/1200/800`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      {isOpening && <LoadingOverlay message="Loading AI SOP Briefing..." />}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-emerald-900 mb-4">Our Activity Rooms</h1>
        <p className="text-stone-600 max-w-2xl mx-auto">
          Genesis Revitalization Group features 8 dedicated activity rooms, each designed to foster specific skills and personal growth for our clients.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {DEPARTMENTS.map((dept, i) => (
          <motion.div
            key={dept.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-3xl p-8 border border-emerald-50 shadow-sm hover:shadow-xl transition-all group"
          >
            <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110", dept.color)}>
              <dept.icon className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold text-emerald-900 mb-4">{dept.name}</h2>
            <p className="text-stone-600 mb-6 text-sm leading-relaxed">
              {dept.description}
            </p>
            <ul className="space-y-3 mb-8">
              {dept.features.map((feature, j) => (
                <li key={j} className="flex items-center gap-2 text-stone-700 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                  {feature}
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-3">
              {dept.id === "interactive-game-room" && (
                <button 
                  onClick={() => alert("CosmoCode Integration: Please provide the game code to enable this feature. We're ready to host it!")}
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all text-sm shadow-lg shadow-blue-100"
                >
                  <Sparkles className="h-4 w-4" />
                  Launch CosmoCode (Beta)
                </button>
              )}
              <button 
                onClick={() => handleOpenTraining(dept.id)}
                className="w-full bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all text-sm"
              >
                <PlayCircle className="h-4 w-4" />
                View Trainings & SOPs
              </button>
              <Link 
                to="/booking" 
                className="w-full bg-white border-2 border-emerald-600 text-emerald-600 px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-50 transition-all text-sm"
              >
                Book a session <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showTraining && currentRoom && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-emerald-50">
                <div className="flex items-center gap-3">
                  <currentRoom.icon className="h-6 w-6 text-emerald-600" />
                  <h2 className="text-xl font-bold text-emerald-900">{currentRoom.name} - Training & Operations</h2>
                </div>
                <button 
                  onClick={() => setShowTraining(false)}
                  className="p-2 hover:bg-white rounded-full transition-colors"
                >
                  <X className="h-6 w-6 text-stone-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-bold text-emerald-900 mb-4 flex items-center gap-2">
                        <Bot className="h-5 w-5 text-emerald-600" />
                        AI SOP Briefing
                      </h3>
                      {currentRoom.training.videoUrl ? (
                        <div className="aspect-video bg-stone-100 rounded-2xl overflow-hidden border border-stone-200">
                          <iframe 
                            width="100%" 
                            height="100%" 
                            src={currentRoom.training.videoUrl} 
                            title="Training Video"
                            frameBorder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowFullScreen
                          ></iframe>
                        </div>
                      ) : (
                        <div className="bg-emerald-900 rounded-2xl overflow-hidden text-white relative group min-h-[400px] flex flex-col">
                          <div className="absolute inset-0 opacity-40">
                            <img 
                              src={getRoomImage(currentRoom.id)} 
                              alt={currentRoom.name}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-emerald-950/60 to-transparent"></div>
                          
                          <div className="relative p-8 mt-auto">
                            <div className="flex items-center gap-2 mb-4">
                              <Bot className="h-5 w-5 text-emerald-400" />
                              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Digital SOP Manual</span>
                            </div>
                            
                            <AnimatePresence mode="wait">
                              <motion.div
                                key={currentSlide}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-4"
                              >
                                <h4 className="text-2xl font-bold">
                                  {currentRoom.training.briefings ? currentRoom.training.briefings[currentSlide].title : "SOP Overview"}
                                </h4>
                                <div 
                                  className="text-emerald-100/80 text-sm leading-relaxed font-mono briefing-content"
                                  dangerouslySetInnerHTML={{ 
                                    __html: currentRoom.training.briefings ? currentRoom.training.briefings[currentSlide].content : currentRoom.training.sop 
                                  }}
                                />
                              </motion.div>
                            </AnimatePresence>

                            <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
                              <div className="flex gap-2">
                                {currentRoom.training.briefings?.map((_, i) => (
                                  <div 
                                    key={i} 
                                    className={cn(
                                      "h-1.5 rounded-full transition-all",
                                      currentSlide === i ? "w-8 bg-emerald-400" : "w-2 bg-white/20"
                                    )}
                                  />
                                ))}
                              </div>
                              <div className="flex gap-3">
                                <button 
                                  disabled={currentSlide === 0}
                                  onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
                                  className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl font-bold transition-all disabled:opacity-30 text-xs"
                                >
                                  Previous
                                </button>
                                <button 
                                  onClick={() => {
                                    if (currentRoom.training.briefings && currentSlide < currentRoom.training.briefings.length - 1) {
                                      setCurrentSlide(prev => prev + 1);
                                    } else {
                                      // Final slide action
                                      alert("Interactive Simulation Initialized. Please proceed to the physical station.");
                                    }
                                  }}
                                  className="bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-2 rounded-xl font-bold transition-all flex items-center gap-2 text-xs"
                                >
                                  {currentRoom.training.briefings && currentSlide === currentRoom.training.briefings.length - 1 ? "Start Simulation" : "Next Slide"}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="mt-6">
                        <a 
                          href={`/dsp-training-portal/index.html?module=${
                            currentRoom.id === "computer-science" ? "interactive-game" :
                            currentRoom.id === "art-studio" ? "visual-arts" :
                            currentRoom.id === "vocational" ? "workplace-readiness" :
                            currentRoom.id === "fitness" ? "physical-training" :
                            currentRoom.id === "music-dance" ? "music-hall" :
                            currentRoom.id === "culinary" ? "home-ec" :
                            currentRoom.id === "sensory" ? "sensory-room" : ""
                          }`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full bg-stone-900 text-white px-6 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-stone-800 transition-all shadow-lg"
                        >
                          <Play className="h-5 w-5 text-emerald-400" />
                          Launch Full Interactive Training Portal
                        </a>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-emerald-900 mb-4 flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-emerald-600" />
                        Training Outline (SOP)
                      </h3>
                      <ul className="space-y-3">
                        {currentRoom.training.outline.map((item, i) => (
                          <li key={i} className="flex items-start gap-3 text-stone-600 text-sm">
                            <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                              {i + 1}
                            </div>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100">
                      <h3 className="text-lg font-bold text-emerald-900 mb-4 flex items-center gap-2">
                        <Clock className="h-5 w-5 text-emerald-600" />
                        Daily Activity Outline
                      </h3>
                      <div className="space-y-4">
                        {currentRoom.training.dailySchedule.map((item, i) => (
                          <div key={i} className="flex gap-4">
                            <div className="text-xs font-bold text-emerald-600 w-20 shrink-0">{item.time}</div>
                            <div className="text-sm text-stone-600">{item.activity}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-emerald-900 text-white p-6 rounded-2xl">
                      <h4 className="font-bold mb-2">Staff Note</h4>
                      <p className="text-sm opacity-80 leading-relaxed">
                        All activity coordinators must complete the full training module before supervising sessions in the {currentRoom.name}.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="mt-20 bg-emerald-900 rounded-3xl p-8 md:p-16 text-white text-center">
        <h2 className="text-3xl font-bold mb-6">Not sure which room is right?</h2>
        <p className="text-emerald-100/80 mb-8 max-w-2xl mx-auto">
          Our activity coordinators can help match your interests and goals with the perfect room. Take a virtual tour or contact us for a consultation.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/forms" className="bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-4 rounded-xl font-bold transition-all">
            Start Intake Process
          </Link>
          <button className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-md px-8 py-4 rounded-xl font-bold transition-all border border-white/20">
            Contact Main Line
          </button>
        </div>
      </div>
    </div>
  );
}
