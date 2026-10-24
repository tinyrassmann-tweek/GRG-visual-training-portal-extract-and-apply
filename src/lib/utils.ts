import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { OnboardingProgress } from "../types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateOnboardingProgress(progress?: OnboardingProgress): number {
  if (!progress) return 0;
  
  const fields = [
    progress.trainingCompleted,
    progress.fingerprintsDone,
    progress.npiVerified,
    progress.backgroundCheck,
    progress.sopReviewed,
    progress.passwordChanged,
    progress.ndaSigned,
    progress.aiConsentSigned,
    progress.danielleLawCompleted,
    progress.komninosLawCompleted,
    progress.incidentReportingCompleted,
    progress.orientationCompleted
  ];
  
  const completed = fields.filter(Boolean).length;
  const total = fields.length;
  
  return Math.round((completed / total) * 100);
}
