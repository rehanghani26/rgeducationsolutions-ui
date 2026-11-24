import React, { memo, useState, useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import AITextResponse from "./AITextResponse.jsx";

/* ── Global registry to ensure each message types only once across re-renders ── */
const completedMessageIds = new Set();

/* ── Warm Sunset Star SVG Icon with Brand Gradient ── */
export const WarmSunsetStarSvg = memo(function WarmSunsetStarSvg({
  className = "w-3.5 h-3.5",
  id = "warm_sunset_star_grad",
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M4.5 22V17M4.5 7V2M2 4.5H7M2 19.5H7M13 3L11.2658 7.50886C10.9838 8.24209 10.8428 8.60871 10.6235 8.91709C10.4292 9.1904 10.1904 9.42919 9.91709 9.62353C9.60871 9.8428 9.24209 9.98381 8.50886 10.2658L4 12L8.50886 13.7342C9.24209 14.0162 9.60871 14.1572 9.91709 14.3765C10.1904 14.5708 10.4292 14.8096 10.6235 15.0829C10.8428 15.3913 10.9838 15.7579 11.2658 16.4911L13 21L14.7342 16.4911C15.0162 15.7579 15.1572 15.3913 15.3765 15.0829C15.5708 14.8096 15.8096 14.5708 16.0829 14.3765C16.3913 14.1572 16.7579 14.0162 17.4911 13.7342L22 12L17.4911 10.2658C16.7579 9.98381 16.3913 9.8428 16.0829 9.62353C15.8096 9.42919 15.5708 9.1904 15.3765 8.91709C15.1572 8.60871 15.0162 8.24209 14.7342 7.50886L13 3Z"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.5 22V17M4.5 7V2M2 4.5H7M2 19.5H7M13 3L11.2658 7.50886C10.9838 8.24209 10.8428 8.60871 10.6235 8.91709C10.4292 9.1904 10.1904 9.42919 9.91709 9.62353C9.60871 9.8428 9.24209 9.98381 8.50886 10.2658L4 12L8.50886 13.7342C9.24209 14.0162 9.60871 14.1572 9.91709 14.3765C10.1904 14.5708 10.4292 14.8096 10.6235 15.0829C10.8428 15.3913 10.9838 15.7579 11.2658 16.4911L13 21L14.7342 16.4911C15.0162 15.7579 15.1572 15.3913 15.3765 15.0829C15.5708 14.8096 15.8096 14.5708 16.0829 14.3765C16.3913 14.1572 16.7579 14.0162 17.4911 13.7342L22 12L17.4911 10.2658C16.7579 9.98381 16.3913 9.8428 16.0829 9.62353C15.8096 9.42919 15.5708 9.1904 15.3765 8.91709C15.1572 8.60871 15.0162 8.24209 14.7342 7.50886L13 3Z"
        stroke={`url(#${id})`}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient
          id={id}
          x1="-0.04"
          y1="2"
          x2="25"
          y2="3"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FF7900" />
          <stop offset="1" stopColor="#FFA000" />
        </linearGradient>
      </defs>
    </svg>
  );
});

/* ── Spinning Animated Sparkles Icon shown while AI is generating / typing ── */
export const AiGeneratingIcon = memo(function AiGeneratingIcon({
  size = 19,
  className = "",
}) {
  return (
    <motion.span
      initial={{ scale: 0.85, opacity: 0.8, rotate: 0 }}
      animate={{ scale: [1, 1.18, 1], opacity: [0.85, 1, 0.85], rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1.6, ease: "linear" }}
      className={`inline-flex items-center justify-center align-middle ml-1.5 ${className}`}
      style={{
        width: size,
        height: size,
        background: "linear-gradient(135deg, #FF7900 0%, #FFA000 100%)",
        border: "1.5px solid rgba(255, 255, 255, 0.35)",
        borderRadius: "50%",
        boxShadow: "0 0 10px 2px rgba(255, 121, 0, 0.45)",
        verticalAlign: "middle",
        flexShrink: 0,
      }}
    >
      <Sparkles className="w-2.5 h-2.5 text-white fill-white" />
    </motion.span>
  );
});

/**
 * Calculates adaptive typing cadence based on text length.
 * Divides response into ~20 progress parts:
 * - If length is small: slow, conversational typing.
 * - If length is long: fast, rapid streaming so user doesn't wait.
 */
function calculateTypingCadence(totalLength) {
  if (totalLength <= 80) {
    // Short response: slow, thoughtful pace
    return {
      charsPerTick: 1,
      tickDelayMs: 42,
    };
  }
  if (totalLength <= 240) {
    // Medium-short response
    return {
      charsPerTick: Math.max(1, Math.ceil(totalLength / 35)),
      tickDelayMs: 28,
    };
  }
  if (totalLength <= 650) {
    // Medium-long response: divided across ~20 parts
    return {
      charsPerTick: Math.max(2, Math.ceil(totalLength / 22)),
      tickDelayMs: 20,
    };
  }
  // Long response / Tables: rapid streaming across 20 swift ticks
  return {
    charsPerTick: Math.max(6, Math.ceil(totalLength / 20)),
    tickDelayMs: 14,
  };
}

export default function AiTypewriterResponse({
  text = "",
  messageId,
  isNew = false,
  onDone,
}) {
  const fullText = text || "";
  const totalLength = fullText.length;

  // Check if message was already typed previously
  const isAlreadyCompleted = useMemo(() => {
    if (!messageId) return !isNew;
    return completedMessageIds.has(messageId) || !isNew;
  }, [messageId, isNew]);

  const [visibleChars, setVisibleChars] = useState(() =>
    isAlreadyCompleted ? totalLength : 0
  );
  const [isTyping, setIsTyping] = useState(() => !isAlreadyCompleted && totalLength > 0);

  const rafIdRef = useRef(null);
  const lastTickTsRef = useRef(0);
  const currentCharsRef = useRef(isAlreadyCompleted ? totalLength : 0);

  const cadence = useMemo(
    () => calculateTypingCadence(totalLength),
    [totalLength]
  );

  // Mark done handler
  const completeTyping = () => {
    setVisibleChars(totalLength);
    currentCharsRef.current = totalLength;
    setIsTyping(false);
    if (messageId) completedMessageIds.add(messageId);
    if (onDone) onDone();
  };

  useEffect(() => {
    if (isAlreadyCompleted || totalLength === 0) {
      completeTyping();
      return;
    }

    setIsTyping(true);
    currentCharsRef.current = 0;
    setVisibleChars(0);
    lastTickTsRef.current = 0;

    const tick = (timestamp) => {
      if (lastTickTsRef.current === 0) {
        lastTickTsRef.current = timestamp;
      }

      const elapsed = timestamp - lastTickTsRef.current;

      if (elapsed >= cadence.tickDelayMs) {
        const nextChars = Math.min(
          totalLength,
          currentCharsRef.current + cadence.charsPerTick
        );
        currentCharsRef.current = nextChars;
        setVisibleChars(nextChars);
        lastTickTsRef.current = timestamp;

        if (nextChars >= totalLength) {
          completeTyping();
          return;
        }

        // Keep newly typed content in view smoothly
        const endAnchor = document.getElementById("ai-chat-messages-end");
        if (endAnchor && nextChars % Math.max(1, cadence.charsPerTick * 2) === 0) {
          endAnchor.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      }

      rafIdRef.current = requestAnimationFrame(tick);
    };

    rafIdRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [fullText, totalLength, cadence, isAlreadyCompleted]);

  // Click to skip typing animation and immediately reveal all text
  const handleClickSkip = () => {
    if (isTyping) {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      completeTyping();
    }
  };

  const displayText = isTyping
    ? fullText.slice(0, visibleChars)
    : fullText;

  return (
    <div
      onClick={handleClickSkip}
      className={`relative ${isTyping ? "cursor-pointer" : ""}`}
      title={isTyping ? "Click to reveal complete response" : undefined}
    >
      <AITextResponse text={displayText} />

      {/* Animated glowing star indicator shown while typing */}
      {isTyping && (
        <span className="inline-flex items-center ml-1">
          <AiGeneratingIcon size={18} />
        </span>
      )}
    </div>
  );
}
