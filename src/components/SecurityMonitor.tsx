import React, { useEffect, useState } from "react";
import { User } from "firebase/auth";
import { collection, addDoc, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { UserProfile, SecurityAlert, PHIAccessLog } from "../types";
import { ShieldAlert, ShieldCheck, Lock, Monitor, Smartphone, Globe, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";

interface SecurityMonitorProps {
  user: User | null;
  profile: UserProfile | null;
}

export const SecurityMonitor: React.FC<SecurityMonitorProps> = ({ user, profile }) => {
  const [deviceFingerprint, setDeviceFingerprint] = useState("");
  const [isAuthorizedDevice, setIsAuthorizedDevice] = useState(true);
  const [showViolationWarning, setShowViolationWarning] = useState(false);
  const [violationType, setViolationType] = useState("");

  // Simple fingerprinting
  useEffect(() => {
    const fingerprint = `${navigator.userAgent}-${navigator.language}-${screen.width}x${screen.height}`;
    setDeviceFingerprint(fingerprint);

    if (user && profile) {
      checkDeviceAuthorization(fingerprint);
    }
  }, [user, profile]);

  const checkDeviceAuthorization = async (fingerprint: string) => {
    if (!profile) return;

    // Check if this is a known device
    // In a real app, we'd have a 'devices' collection or field in profile
    const knownDevices = (profile as any).authorizedDevices || [];
    
    if (knownDevices.length === 0) {
      // First login, register this device
      try {
        const userRef = doc(db, "users", profile.uid);
        await updateDoc(userRef, {
          authorizedDevices: [fingerprint]
        });
      } catch (e) {
        console.error("Failed to register device:", e);
      }
    } else if (!knownDevices.includes(fingerprint) && profile.accessType === "restricted") {
      setIsAuthorizedDevice(false);
      triggerSecurityAlert("unauthorized_device", `Unauthorized device access detected: ${fingerprint}`);
    }
  };

  const triggerSecurityAlert = async (type: SecurityAlert["type"], details: string) => {
    if (!user) return;

    try {
      const alertData: Omit<SecurityAlert, "id"> = {
        type,
        severity: "critical",
        timestamp: new Date().toISOString(),
        userId: user.uid,
        userEmail: user.email || "unknown",
        details,
        deviceFingerprint,
        notifiedUplines: true,
        notifiedExecutive: true,
        resolved: false
      };

      await addDoc(collection(db, "securityAlerts"), alertData);

      // Notify backend to alert executive staff
      await fetch("/api/security/alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(alertData)
      });

      setViolationType(type);
      setShowViolationWarning(true);
    } catch (e) {
      console.error("Security Alert Broadcast Failed:", e);
    }
  };

  // Monitor for PHI export attempts (e.g., printing, copying large amounts of text)
  useEffect(() => {
    const handleBeforePrint = () => {
      if (profile?.role !== "admin") {
        triggerSecurityAlert("phi_export", "Print attempt detected on page containing PHI.");
      }
    };

    const handleCopy = (e: ClipboardEvent) => {
      const selectedText = window.getSelection()?.toString() || "";
      // Simple heuristic: if text looks like a Medicaid ID or multiple SSN-like patterns
      if (selectedText.length > 100 && (profile?.role === "staff" || profile?.role === "patient")) {
        triggerSecurityAlert("phi_export", "Bulk data copy attempt detected.");
      }
    };

    window.addEventListener("beforeprint", handleBeforePrint);
    window.addEventListener("copy", handleCopy as any);

    return () => {
      window.removeEventListener("beforeprint", handleBeforePrint);
      window.removeEventListener("copy", handleCopy as any);
    };
  }, [profile]);

  if (!user || !profile) return null;

  return (
    <>
      {/* Stealth Monitor UI (Miniature HUD) */}
      <div className="fixed bottom-4 left-4 z-40">
        <div className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md border text-[10px] font-black uppercase tracking-tighter transition-all duration-500",
          isAuthorizedDevice 
            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600" 
            : "bg-red-500/10 border-red-500/20 text-red-600 animate-pulse"
        )}>
          {isAuthorizedDevice ? <ShieldCheck className="h-3 w-3" /> : <ShieldAlert className="h-3 w-3" />}
          Shield Mode: {isAuthorizedDevice ? "Active" : "BREACH"}
        </div>
      </div>

      {/* Violation Warning Modal */}
      <AnimatePresence>
        {showViolationWarning && (
          <div className="fixed inset-0 bg-red-950/95 backdrop-blur-xl z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-[3rem] w-full max-w-xl p-12 text-center relative overflow-hidden"
            >
              {/* Emergency Background Pattern */}
              <div className="absolute top-0 left-0 w-full h-1 bg-red-600 animate-pulse" />
              
              <div className="bg-red-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
                <AlertTriangle className="h-12 w-12 text-red-600" />
              </div>

              <h2 className="text-4xl font-black text-red-950 mb-4 tracking-tight uppercase">Security Intercept</h2>
              <p className="text-stone-500 text-lg mb-8 leading-relaxed">
                Shield Mode has identified a critical protocol violation: 
                <span className="block font-black text-red-600 mt-2 uppercase tracking-widest">{violationType.replace(/_/g, ' ')}</span>
              </p>

              <div className="bg-red-50 border border-red-100 rounded-3xl p-6 mb-8 flex items-center gap-4 text-left">
                <Lock className="h-6 w-6 text-red-600 flex-shrink-0" />
                <p className="text-xs font-bold text-red-900 leading-normal uppercase">
                  Executive Uplines and the Digital Architect have been notified. This account is currently under review for PHI Integrity compliance.
                </p>
              </div>

              <button 
                onClick={() => setShowViolationWarning(false)}
                className="w-full bg-red-600 text-white py-5 rounded-2xl font-bold text-lg hover:bg-red-700 transition-all shadow-xl shadow-red-600/20"
              >
                Acknowledge Protocol
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
