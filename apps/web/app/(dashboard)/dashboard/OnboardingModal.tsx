"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Slide {
  emoji: string;
  title: string;
  body: string;
}

const SLIDES: Slide[] = [
  {
    emoji: "🍓",
    title: "Welcome to FunBerryKids!",
    body: "Kids think they're winning levels. Parents know they're winning report cards. Here's a 20-second tour of what you can do.",
  },
  {
    emoji: "🎮",
    title: "Play colorful worlds",
    body: "Your child explores worlds like Plants, Animals and Space, playing quizzes, sorting, memory and more. Every finished game earns stars.",
  },
  {
    emoji: "📚",
    title: "Turn textbooks into games",
    body: "Snap photos of a few textbook pages and we build games from them — so your child learns those exact pages by playing. You review and approve every question first.",
  },
  {
    emoji: "📈",
    title: "See real progress",
    body: "Your Growth & Smarts report shows what your child is practising, their strengths, and simple tips to help at home.",
  },
  {
    emoji: "⏰",
    title: "Safe and focused",
    body: "Set a play timer before handing over the device. When time's up, the app locks until you enter your 4-digit parent PIN. Kid-safe, no ads.",
  },
];

export function OnboardingModal({
  parentName,
  onSkip,
  onAddChild,
}: {
  parentName?: string | null;
  onSkip: () => void;
  onAddChild: () => void;
}) {
  const [index, setIndex] = useState(0);
  const isLast = index === SLIDES.length; // final "add child" step
  const total = SLIDES.length + 1;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, y: 24, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        className="relative w-full max-w-md overflow-hidden rounded-kid bg-white p-7 shadow-2xl"
      >
        {/* Skip is always available */}
        <button
          onClick={onSkip}
          className="absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-bold text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
        >
          Skip tour
        </button>

        <AnimatePresence mode="wait">
          {!isLast ? (
            <motion.div
              key={`slide-${index}`}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.25 }}
              className="pt-6 text-center"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
                className="mx-auto mb-4 text-7xl"
              >
                {SLIDES[index].emoji}
              </motion.div>
              <h2 className="font-display text-2xl font-black text-slate-800">
                {index === 0 && parentName ? `Hi ${parentName}! ` : ""}
                {SLIDES[index].title}
              </h2>
              <p className="mx-auto mt-3 max-w-sm text-[15px] leading-relaxed text-slate-600">
                {SLIDES[index].body}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="final"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.25 }}
              className="pt-6 text-center"
            >
              <motion.div
                initial={{ scale: 0, rotate: -15 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-violet-100 text-6xl"
              >
                👶
              </motion.div>
              <h2 className="font-display text-2xl font-black text-slate-800">Add your first child</h2>
              <p className="mx-auto mt-3 max-w-sm text-[15px] leading-relaxed text-slate-600">
                Create a profile so your child can start playing and earning stars. It only takes a moment.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress dots */}
        <div className="mt-6 flex items-center justify-center gap-1.5">
          {Array.from({ length: total }).map((_, i) => (
            <span
              key={i}
              className={`h-2 rounded-full transition-all ${i === index ? "w-6 bg-violet-500" : "w-2 bg-slate-200"}`}
            />
          ))}
        </div>

        {/* Controls */}
        <div className="mt-6 flex items-center justify-between gap-3">
          {index > 0 ? (
            <button
              onClick={() => setIndex((i) => Math.max(0, i - 1))}
              className="kid-glass-btn kid-glass-muted rounded-2xl px-5 py-2.5 text-sm font-bold"
            >
              ← Back
            </button>
          ) : (
            <button
              onClick={onSkip}
              className="rounded-2xl px-4 py-2.5 text-sm font-bold text-slate-400 hover:text-slate-600"
            >
              I&apos;ll explore on my own
            </button>
          )}

          {!isLast ? (
            <button
              onClick={() => setIndex((i) => i + 1)}
              className="kid-glass-btn kid-glass-violet rounded-2xl px-6 py-2.5 text-sm font-black"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={onAddChild}
              className="kid-glass-btn kid-glass-leaf rounded-2xl px-6 py-2.5 text-sm font-black"
            >
              + Add my child
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
