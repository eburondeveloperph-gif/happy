import { useState, useEffect, useRef, useCallback } from 'react';

interface SpeechRecognitionHook {
  isListening: boolean;
  transcript: string;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  error: string | null;
}

export const useSpeechRecognition = (
  languageCode: string,
  onFinalTranscript?: (text: string) => void
): SpeechRecognitionHook => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  // Update language dynamically if it changes while listening
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = languageCode;
    }
  }, [languageCode]);

  useEffect(() => {
    // Check browser support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setError("Web Speech API is not supported in this browser. Try Chrome or Edge.");
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true; // Keep listening
    recognitionRef.current.interimResults = true; // Show typing effect
    recognitionRef.current.lang = languageCode;

    recognitionRef.current.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognitionRef.current.onend = () => {
      // Auto-restart if it stops but state says listening (unless explicitly stopped)
      // For simplicity in this hook, we just sync state
      setIsListening(false);
    };

    recognitionRef.current.onError = (event: any) => {
      console.warn("Speech recognition error", event.error);
      if (event.error === 'not-allowed') {
        setError("Microphone access denied.");
        setIsListening(false);
      }
    };

    recognitionRef.current.onresult = (event: any) => {
      let finalTranscriptChunk = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscriptChunk += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      setTranscript(interimTranscript);

      if (finalTranscriptChunk && onFinalTranscript) {
        onFinalTranscript(finalTranscriptChunk.trim());
        setTranscript(''); // Clear interim after final is processed
      }
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onFinalTranscript]); // Re-init if callback changes, usually stable. Language change handled in separate effect.

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error("Start error", e);
      }
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) { // Allow stopping even if isListening false (force stop)
      recognitionRef.current.stop();
    }
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
  }, []);

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
    error
  };
};