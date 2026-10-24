import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { GoogleGenAI, Modality } from "@google/genai";
import Vapi from "@vapi-ai/web";

interface VoiceContextType {
  isVoiceEnabled: boolean;
  setIsVoiceEnabled: (enabled: boolean) => void;
  speak: (text: string) => Promise<void>;
  isSpeaking: boolean;
  isListening: boolean;
  startListening: (onResult: (text: string) => void) => void;
  stopListening: () => void;
  stopSpeaking: () => void;
  startVapiCall: () => void;
  stopVapiCall: () => void;
  isVapiActive: boolean;
  voiceName: string;
  setVoiceName: (name: string) => void;
  speed: number;
  setSpeed: (speed: number) => void;
}

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const VoiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false); // Disabled by default per user request
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isVapiActive, setIsVapiActive] = useState(false);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const audioChunksRef = React.useRef<Blob[]>([]);
  const [voiceName, setVoiceName] = useState('Kore'); // Default professional voice
  const [speed, setSpeed] = useState(1.0);
  const audioContextRef = React.useRef<AudioContext | null>(null);
  const currentSourceRef = React.useRef<AudioBufferSourceNode | null>(null);
  const recognitionRef = React.useRef<any>(null);
  const vapiRef = React.useRef<Vapi | null>(null);

  const [isGeminiExhausted, setIsGeminiExhausted] = useState(false);
  const speechCounts = React.useRef<Record<string, number>>({});

  useEffect(() => {
    const vapiPublicKey = (import.meta as any).env.VITE_VAPI_PUBLIC_KEY;
    if (vapiPublicKey) {
      vapiRef.current = new Vapi(vapiPublicKey);
      
      vapiRef.current.on("call-start", () => setIsVapiActive(true));
      vapiRef.current.on("call-end", () => setIsVapiActive(false));
      vapiRef.current.on("error", (e) => {
        console.error("Vapi Error:", e);
        setIsVapiActive(false);
      });
    }
  }, []);

  const startVapiCall = useCallback(() => {
    if (vapiRef.current) {
      vapiRef.current.start({
        name: "Genesis Assistant",
        transcriber: {
          provider: "deepgram",
          model: "nova-2",
          language: "en-US",
        },
        model: {
          provider: "openai",
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: "You are the Genesis Revitalization Group AI Assistant. You help staff and clients with services, licensing, and applications. Be professional, efficient, and warm.",
            },
          ],
        },
        voice: {
          provider: "playht",
          voiceId: "s3://voice-training-east-1-219/6ad4f9f0-1fcd-4013-9457-7c3133f8c141/rendered.mp3", // A professional voice
        },
      });
    } else {
      console.warn("Vapi Public Key not configured.");
    }
  }, []);

  const stopVapiCall = useCallback(() => {
    if (vapiRef.current) {
      vapiRef.current.stop();
    }
  }, []);

  const stopSpeaking = useCallback(() => {
    if (currentSourceRef.current) {
      try {
        currentSourceRef.current.stop();
      } catch (e) {
        // Source might have already stopped
      }
      currentSourceRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  const startListening = useCallback(async (onResult: (text: string) => void) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = (reader.result as string).split(',')[1];
          try {
            const response = await fetch("/api/transcribe", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ audio: base64Audio })
            });
            const data = await response.json();
            if (data.success) {
              onResult(data.text);
            }
          } catch (err) {
            console.error("Transcription error:", err);
          }
        };
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsListening(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
    }
  }, []);

  const stopListening = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    setIsListening(false);
  }, []);

  const speak = useCallback(async (text: string) => {
    if (!text || !isVoiceEnabled) return; // Respect enabled flag

    // Repetition limit: max 2 times per session for any specific instruction
    const count = speechCounts.current[text] || 0;
    if (count >= 2) {
      console.info(`Speech repetition limit reached for: "${text.substring(0, 30)}..."`);
      return;
    }
    speechCounts.current[text] = count + 1;

    // Helper for browser fallback
    const useBrowserSpeech = () => {
      if ('speechSynthesis' in window) {
        stopSpeaking();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = speed;
        
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          const isFemale = voiceName === 'Aoede';
          const preferredVoice = voices.find(v => 
            v.name.toLowerCase().includes(isFemale ? 'female' : 'male') ||
            v.name.toLowerCase().includes(isFemale ? 'google us english' : 'google uk english male')
          );
          if (preferredVoice) utterance.voice = preferredVoice;
        }

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        
        window.speechSynthesis.speak(utterance);
      } else {
        setIsSpeaking(false);
      }
    };

    // If Gemini is known to be exhausted, skip to browser speech immediately
    if (isGeminiExhausted) {
      useBrowserSpeech();
      return;
    }

    try {
      setIsSpeaking(true);
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { 
                voiceName: voiceName as any,
              },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        const ctx = audioContextRef.current;

        if (ctx.state === 'suspended') {
          await ctx.resume();
        }

        const binaryString = atob(base64Audio);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        const audioBuffer = await ctx.decodeAudioData(bytes.buffer);
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        
        source.onended = () => {
          setIsSpeaking(false);
          if (currentSourceRef.current === source) {
            currentSourceRef.current = null;
          }
        };

        stopSpeaking();
        currentSourceRef.current = source;
        source.start(0);
        setIsSpeaking(true);
      } else {
        throw new Error("No audio data received from Gemini TTS");
      }
    } catch (error: any) {
      // Check if it's a quota error
      const isQuotaError = error?.message?.includes("429") || error?.message?.includes("RESOURCE_EXHAUSTED") || error?.status === "RESOURCE_EXHAUSTED";
      
      if (isQuotaError) {
        console.info("Gemini TTS quota reached. Switching to high-performance browser speech fallback.");
        setIsGeminiExhausted(true);
        // Reset exhaustion status after 1 minute to try again
        setTimeout(() => setIsGeminiExhausted(false), 60000);
      } else {
        console.warn("Gemini TTS encountered an issue, using browser fallback:", error);
      }
      
      useBrowserSpeech();
    }
  }, [voiceName, speed, stopSpeaking, isGeminiExhausted]);

  return (
    <VoiceContext.Provider value={{ 
      isVoiceEnabled, 
      setIsVoiceEnabled, 
      speak, 
      isSpeaking, 
      isListening,
      startListening,
      stopListening,
      stopSpeaking,
      startVapiCall,
      stopVapiCall,
      isVapiActive,
      voiceName,
      setVoiceName,
      speed,
      setSpeed
    }}>
      {children}
    </VoiceContext.Provider>
  );
};

export const useVoice = () => {
  const context = useContext(VoiceContext);
  if (!context) {
    throw new Error('useVoice must be used within a VoiceProvider');
  }
  return context;
};
