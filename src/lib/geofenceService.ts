import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { GeofenceAlert } from "../types";

export const logGeofenceAlert = async (alert: Omit<GeofenceAlert, "id" | "timestamp" | "resolved">) => {
  try {
    const alertData = {
      ...alert,
      timestamp: new Date().toISOString(),
      resolved: false,
      createdAt: serverTimestamp(), // For firestore ordering if needed
    };
    
    const docRef = await addDoc(collection(db, "geofenceAlerts"), alertData);
    
    // Also trigger executive notification via simulation
    await fetch("/api/security/alert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...alertData,
        alertId: docRef.id,
        executiveNotified: true,
      })
    });
    
    return docRef.id;
  } catch (error) {
    console.error("Error logging geofence alert:", error);
    return null;
  }
};
