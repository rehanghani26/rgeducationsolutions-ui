import { useState, useEffect, useRef, useCallback } from "react";
import "regenerator-runtime/runtime";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";

/**
 * Strips markdown symbols, code blocks, URLs, and emojis so speech synthesis
 * sounds natural and human-like.
 */
export function cleanTextForSpeech(raw) {
  if (!raw) return "";
  let text = String(raw);

  // Remove code blocks
  text = text.replace(/```[\s\S]*?```/g, " Code block omitted. ");

  // Remove inline code
  text = text.replace(/`([^`]+)`/g, "$1");

  // Remove images
  text = text.replace(/!\[.*?\]\(.*?\)/g, "");

  // Convert links [text](url) -> text
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");

  // Remove headers
  text = text.replace(/^#{1,6}\s+/gm, "");

  // Remove bold & italic markdown
  text = text.replace(/(\*\*|__)(.*?)\1/g, "$2");
  text = text.replace(/(\*|_)(.*?)\1/g, "$2");

  // Remove blockquotes and horizontal lines
  text = text.replace(/^\s*>\s*/gm, "");
  text = text.replace(/^(-{3,}|\*{3,}|_{3,})$/gm, "");

  // Remove table bars and dashes
  text = text.replace(/\|/g, " ");

  // Remove bullet points and numbered list items
  text = text.replace(/^\s*[-*+]\s+/gm, "");
  text = text.replace(/^\s*\d+\.\s+/gm, "");

  // Remove emojis and special icons
  text = text.replace(
    /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
    ""
  );

  // Normalize whitespace & newlines to natural pauses
  text = text.replace(/\n+/g, ". ");
  text = text.replace(/\s{2,}/g, " ");

  return text.trim();
}

/**
 * Breaks long text into chunks for continuous speech without browser timeouts.
 */
function splitIntoChunks(text, maxLength = 180) {
  const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [text];
  const chunks = [];
  let current = "";

  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (!trimmed) continue;
    if ((current + " " + trimmed).length <= maxLength) {
      current = current ? current + " " + trimmed : trimmed;
    } else {
      if (current) chunks.push(current);
      if (trimmed.length > maxLength) {
        const words = trimmed.split(" ");
        let sub = "";
        for (const w of words) {
          if ((sub + " " + w).length <= maxLength) {
            sub = sub ? sub + " " + w : w;
          } else {
            if (sub) chunks.push(sub);
            sub = w;
          }
        }
        current = sub;
      } else {
        current = trimmed;
      }
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

const STORAGE_KEY_VOICE_MODE = "rges_ai_voice_mode_enabled";

export function useVoiceAssistant({
  onSpeechInput,
  onSpeechFinal,
  isLoading = false,
}) {
  // Use react-speech-recognition hook
  const {
    transcript,
    interimTranscript,
    finalTranscript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable,
  } = useSpeechRecognition({
    clearTranscriptOnListen: true,
  });

  const isSpeechSynSupported =
    typeof window !== "undefined" && "speechSynthesis" in window;

  // Voice Assistant Mode Toggle (persisted)
  const [isVoiceMode, setIsVoiceMode] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_VOICE_MODE) === "true";
    } catch {
      return false;
    }
  });

  // TTS State
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState(null);
  const [voiceError, setVoiceError] = useState(null);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);

  // Refs
  const silenceTimerRef = useRef(null);
  const isVoiceModeRef = useRef(isVoiceMode);
  const isSpeakingRef = useRef(false);
  const isLoadingRef = useRef(isLoading);
  const chunkQueueRef = useRef([]);
  const currentChunkIndexRef = useRef(0);
  const lastTranscriptRef = useRef("");

  // Keep refs synchronized
  useEffect(() => {
    isVoiceModeRef.current = isVoiceMode;
    try {
      localStorage.setItem(STORAGE_KEY_VOICE_MODE, String(isVoiceMode));
    } catch {}
  }, [isVoiceMode]);

  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
  }, [isSpeaking]);

  useEffect(() => {
    isLoadingRef.current = isLoading;
  }, [isLoading]);

  // Request browser microphone permissions if needed
  const ensureMicrophonePermission = useCallback(async () => {
    if (navigator?.mediaDevices?.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Close audio track immediately, SpeechRecognition will open its own session
        stream.getTracks().forEach((track) => track.stop());
        setVoiceError(null);
        return true;
      } catch (err) {
        console.warn("Microphone access error:", err);
        setVoiceError(
          "Microphone permission was denied. Please allow microphone access in your browser settings (look for the lock/camera icon in the address bar)."
        );
        return false;
      }
    }
    return true;
  }, []);

  // Load available voices for TTS
  useEffect(() => {
    if (!isSpeechSynSupported) return;

    const updateVoices = () => {
      const voices = window.speechSynthesis.getVoices() || [];
      setAvailableVoices(voices);

      const preferred =
        voices.find(
          (v) =>
            v.lang.startsWith("en") &&
            (v.name.includes("Google") ||
              v.name.includes("Natural") ||
              v.name.includes("Samantha") ||
              v.name.includes("Jenny"))
        ) ||
        voices.find((v) => v.lang.startsWith("en")) ||
        voices[0] ||
        null;

      setSelectedVoice(preferred);
    };

    updateVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, [isSpeechSynSupported]);

  // Handle browser support checks
  useEffect(() => {
    if (!browserSupportsSpeechRecognition) {
      setVoiceError(
        "Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge."
      );
    } else if (isMicrophoneAvailable === false) {
      setVoiceError(
        "Microphone is currently unavailable. Please allow microphone permissions in your browser."
      );
    }
  }, [browserSupportsSpeechRecognition, isMicrophoneAvailable]);

  // Handle transcript changes from react-speech-recognition
  useEffect(() => {
    if (!transcript) return;

    lastTranscriptRef.current = transcript;

    // Update input box with real-time transcribed words
    if (onSpeechInput) {
      onSpeechInput(transcript);
    }

    // Reset silence timer on new speech fragment
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }

    // When Voice Assistant mode is ON, detect pause (~1.5s) to auto-send
    if (isVoiceModeRef.current) {
      silenceTimerRef.current = setTimeout(() => {
        const textToSend = lastTranscriptRef.current.trim();
        if (textToSend) {
          lastTranscriptRef.current = "";
          if (onSpeechFinal) {
            onSpeechFinal(textToSend);
          }
          // Do not call resetTranscript right away; clear on next listen
        }
      }, 1500);
    }
  }, [transcript, onSpeechInput, onSpeechFinal]);

  // Start listening safely
  const startListening = useCallback(async () => {
    if (!browserSupportsSpeechRecognition) {
      setVoiceError("Speech recognition is not supported in this browser.");
      return;
    }
    if (isSpeakingRef.current || isLoadingRef.current) {
      return;
    }

    const hasPermission = await ensureMicrophonePermission();
    if (!hasPermission) return;

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    try {
      SpeechRecognition.startListening({
        continuous: true,
        language: "en-US",
      });
    } catch (err) {
      console.warn("Failed to start speech recognition:", err);
    }
  }, [browserSupportsSpeechRecognition, ensureMicrophonePermission]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    try {
      SpeechRecognition.stopListening();
    } catch {}
  }, []);

  // Auto-resume continuous listening when Voice Assistant mode is active
  useEffect(() => {
    if (
      isVoiceMode &&
      !listening &&
      !isSpeaking &&
      !isLoading &&
      browserSupportsSpeechRecognition
    ) {
      const timer = setTimeout(() => {
        if (
          isVoiceModeRef.current &&
          !isSpeakingRef.current &&
          !isLoadingRef.current
        ) {
          startListening();
        }
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [
    isVoiceMode,
    listening,
    isSpeaking,
    isLoading,
    browserSupportsSpeechRecognition,
    startListening,
  ]);

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    if (isSpeechSynSupported) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
    chunkQueueRef.current = [];
    currentChunkIndexRef.current = 0;
    setIsSpeaking(false);
    isSpeakingRef.current = false;
    setSpeakingMessageId(null);

    // If voice mode is on and not loading, restart listening after speech canceled
    if (isVoiceModeRef.current && !isLoadingRef.current) {
      setTimeout(() => {
        if (isVoiceModeRef.current && !isSpeakingRef.current && !isLoadingRef.current) {
          startListening();
        }
      }, 300);
    }
  }, [isSpeechSynSupported, startListening]);

  // Start speech synthesis for given text
  const speak = useCallback(
    (rawText, messageId = null) => {
      if (!isSpeechSynSupported || !rawText) return;

      const cleanText = cleanTextForSpeech(rawText);
      if (!cleanText) return;

      // Stop listening while speaking so mic does not capture assistant voice
      stopListening();

      // Cancel any ongoing speech
      try {
        window.speechSynthesis.cancel();
      } catch {}

      const chunks = splitIntoChunks(cleanText);
      if (chunks.length === 0) return;

      chunkQueueRef.current = chunks;
      currentChunkIndexRef.current = 0;
      setIsSpeaking(true);
      isSpeakingRef.current = true;
      setSpeakingMessageId(messageId);

      const playNextChunk = () => {
        if (!isSpeakingRef.current) return;

        const idx = currentChunkIndexRef.current;
        if (idx >= chunkQueueRef.current.length) {
          // Finished all chunks
          setIsSpeaking(false);
          isSpeakingRef.current = false;
          setSpeakingMessageId(null);

          // If voice assistant mode is active, resume listening for user's next command!
          if (isVoiceModeRef.current && !isLoadingRef.current) {
            setTimeout(() => {
              if (isVoiceModeRef.current && !isSpeakingRef.current && !isLoadingRef.current) {
                startListening();
              }
            }, 400);
          }
          return;
        }

        const chunk = chunkQueueRef.current[idx];
        const utterance = new SpeechSynthesisUtterance(chunk);

        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
        utterance.rate = 1.02;
        utterance.pitch = 1.0;

        utterance.onend = () => {
          currentChunkIndexRef.current += 1;
          playNextChunk();
        };

        utterance.onerror = (e) => {
          if (e.error !== "canceled" && e.error !== "interrupted") {
            console.warn("SpeechSynthesis error:", e);
          }
          currentChunkIndexRef.current += 1;
          playNextChunk();
        };

        window.__rges_current_utterance = utterance;
        window.speechSynthesis.speak(utterance);
      };

      playNextChunk();
    },
    [isSpeechSynSupported, selectedVoice, stopListening, startListening]
  );

  // Toggle Voice Mode (The master toggle)
  const toggleVoiceMode = useCallback(
    (forcedState) => {
      const nextState =
        typeof forcedState === "boolean" ? forcedState : !isVoiceMode;
      setIsVoiceMode(nextState);

      if (nextState) {
        if (!isSpeakingRef.current && !isLoadingRef.current) {
          startListening();
        }
      } else {
        stopListening();
        stopSpeaking();
      }
    },
    [isVoiceMode, startListening, stopListening, stopSpeaking]
  );

  // Toggle standalone push-to-talk mic dictation
  const toggleListening = useCallback(() => {
    if (listening) {
      stopListening();
    } else {
      startListening();
    }
  }, [listening, stopListening, startListening]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      try {
        SpeechRecognition.abortListening();
      } catch {}
      if (isSpeechSynSupported) {
        try {
          window.speechSynthesis.cancel();
        } catch {}
      }
    };
  }, [isSpeechSynSupported]);

  return {
    isSpeechRecSupported: browserSupportsSpeechRecognition,
    isSpeechSynSupported,
    isVoiceMode,
    toggleVoiceMode,
    isListening: listening,
    toggleListening,
    startListening,
    stopListening,
    isSpeaking,
    speakingMessageId,
    speak,
    stopSpeaking,
    interimTranscript: interimTranscript || transcript,
    voiceError,
    setVoiceError,
    availableVoices,
    selectedVoice,
    setSelectedVoice,
    resetTranscript,
  };
}
