import React from "react";
import { motion } from "motion/react";
import { RefreshCw } from "lucide-react";

interface LoadingOverlayProps {
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ message = "Processing..." }) => {
  return (
    <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-[2px] z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl p-8 shadow-2xl flex flex-col items-center gap-4 max-w-xs w-full border border-emerald-100"
      >
        <div className="bg-emerald-50 p-4 rounded-2xl">
          <RefreshCw className="h-8 w-8 text-emerald-600 animate-spin" />
        </div>
        <p className="text-emerald-900 font-bold text-center">{message}</p>
        <div className="w-full h-1 bg-stone-100 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="h-full bg-emerald-500"
          />
        </div>
      </motion.div>
    </div>
  );
};

export const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`animate-pulse bg-stone-200 rounded-lg ${className}`} />
);
