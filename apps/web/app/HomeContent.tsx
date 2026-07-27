"use client";

import { brand, pricing } from "@funberry/config";
import { motion, useReducedMotion } from "framer-motion";
import { FunBerryLogo } from "./components/FunBerryLogo";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
  transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
};

const zones = [
  { emoji: "🌱", name: "Plants", hint: "Nature & growth", tone: "from-emerald-200/80 to-teal-200/70 border-emerald-300/80" },
  { emoji: "🐾", name: "Animals", hint: "Creatures big & small", tone: "from-amber-200/80 to-orange-200/70 border-amber-300/80" },
  { emoji: "🚗", name: "Transport", hint: "How we move", tone: "from-sky-200/80 to-blue-200/70 border-sky-300/80" },
  { emoji: "💧", name: "Water", hint: "Sources & care", tone: "from-cyan-200/80 to-sky-200/70 border-cyan-300/80" },
  { emoji: "🍎", name: "Food", hint: "Healthy choices", tone: "from-rose-200/80 to-red-200/70 border-rose-300/80" },
  { emoji: "🏠", name: "Shelter", hint: "Homes & safety", tone: "from-violet-200/80 to-purple-200/70 border-violet-300/80" },
  { emoji: "⭐", name: "Space", hint: "Sky & beyond", tone: "from-indigo-200/80 to-violet-200/70 border-indigo-300/80" },
  { emoji: "🕐", name: "Time", hint: "Days & routines", tone: "from-slate-200/90 to-zinc-200/80 border-slate-300/80" },
  { emoji: "👋", name: "About Me", hint: "Self & feelings", tone: "from-fuchsia-200/80 to-pink-200/70 border-fuchsia-300/80" },
  { emoji: "🌍", name: "& more", hint: "ICSE-aligned themes", tone: "from-green-200/80 to-emerald-200/70 border-green-300/80" },
];

const games = [
  { icon: "🎯", title: "Drag & Sort", desc: "Sort into the right groups", glow: "shadow-emerald-400/40" },
  { icon: "🃏", title: "Memory Match", desc: "Find pairs that belong together", glow: "shadow-pink-400/40" },
  { icon: "❓", title: "Picture Quiz", desc: "Choose from friendly visuals", glow: "shadow-sky-400/40" },
  { icon: "📋", title: "Sequence", desc: "Put steps in order", glow: "shadow-amber-400/40" },
  { icon: "🔍", title: "Spot Difference", desc: "Notice what changed", glow: "shadow-violet-400/40" },
  { icon: "🎨", title: "Color Activity", desc: "Creative, guided coloring", glow: "shadow-orange-400/40" },
  { icon: "🔗", title: "Word–picture", desc: "Link words to images", glow: "shadow-lime-400/40" },
  { icon: "📖", title: "Story Time", desc: "Stories with light choices", glow: "shadow-rose-400/40" },
];

export default function HomeContent() {
  const reduceMotion = useReducedMotion();

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_20%_10%,#fce7f3_0,#eff6ff_36%,#ecfeff_72%,#f8fafc_100%)] text-slate-800 antialiased">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-slate-900 focus:px-4 focus:py-2 focus:text-sm focus:text-white focus:outline-none focus:ring-2 focus:ring-sky-400"
      >
        Skip to content
      </a>

      <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/50 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <a href="/" className="rounded-lg outline-none ring-sky-400/50 focus-visible:ring-2">
            <FunBerryLogo size="sm" variant="editorial" />
          </a>
          <nav className="flex items-center gap-2" aria-label="Primary">
            <a href="/login" className="rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-[0_4px_0_#cbd5e1] transition hover:-translate-y-0.5 hover:shadow-[0_6px_0_#cbd5e1]">Log in</a>
            <a href="/signup" className="rounded-full bg-gradient-to-b from-fuchsia-500 to-pink-600 px-5 py-2 text-sm font-bold text-white shadow-[0_6px_0_#9d174d] transition hover:-translate-y-0.5 hover:shadow-[0_8px_0_#9d174d]">Get started</a>
          </nav>
        </div>
      </header>

      <section id="main" className="relative flex min-h-[80dvh] flex-col justify-center px-4 pb-10 pt-24 sm:px-6 sm:pt-24">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <div className="absolute -left-24 top-16 h-64 w-64 rounded-full bg-fuchsia-300/30 blur-3xl" />
          <div className="absolute -right-20 top-20 h-72 w-72 rounded-full bg-sky-300/35 blur-3xl" />
          <div className="absolute bottom-8 left-1/2 h-56 w-[82vw] -translate-x-1/2 rounded-full bg-violet-300/20 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-5xl text-center">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-4 text-[11px] font-black uppercase tracking-[0.2em] text-violet-700"
          >
            ICSE-aligned · Ages 4–8 · Learn through play
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-5 flex justify-center"
          >
            <div className="flex items-center justify-center rounded-[32px] border border-white/80 bg-white/55 p-4 shadow-[0_16px_40px_rgba(99,102,241,0.2)] backdrop-blur-xl sm:p-6">
              <FunBerryLogo size="hero" variant="editorial" animate priority responsive className="w-[280px] sm:w-[400px] md:w-[520px]" />
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.52, delay: 0.05 }}
            className="font-display mx-auto max-w-4xl text-[2rem] font-extrabold leading-[1.12] tracking-tight text-slate-900 [text-shadow:0_2px_0_#fff] sm:text-5xl md:text-6xl"
          >
            Kids think they&apos;re winning levels.
            <span className="block text-violet-700 [text-shadow:0_2px_0_rgba(255,255,255,0.95)]">
              Parents know they&apos;re winning report cards.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.12 }}
            className="mx-auto mt-4 max-w-2xl text-base font-medium leading-relaxed text-slate-700 sm:text-lg"
          >
            {brand.tagline}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.2 }}
            className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <a href="/signup" className="inline-flex min-w-[190px] items-center justify-center rounded-full bg-gradient-to-b from-rose-500 to-fuchsia-600 px-8 py-3.5 text-base font-extrabold text-white shadow-[0_7px_0_#9d174d] transition hover:-translate-y-0.5 hover:shadow-[0_9px_0_#9d174d]">Start free</a>
            <a href="/login" className="inline-flex min-w-[190px] items-center justify-center rounded-full bg-gradient-to-b from-sky-400 to-blue-600 px-8 py-3.5 text-base font-extrabold text-white shadow-[0_7px_0_#1e40af] transition hover:-translate-y-0.5 hover:shadow-[0_9px_0_#1e40af]">Parent login</a>
          </motion.div>

          <p className="mt-5 text-xs font-semibold text-slate-600">No credit card needed for free plan</p>
        </div>
      </section>

      <section id="zones" className="border-t border-white/70 bg-gradient-to-b from-white/80 to-cyan-50/70 px-4 py-12 sm:px-6 sm:py-14">
        <div className="mx-auto max-w-6xl">
          <motion.div {...fadeUp} className="mx-auto max-w-3xl text-center">
            <h2 className="font-display text-3xl font-extrabold text-slate-900 sm:text-4xl [text-shadow:0_2px_0_#fff]">A colorful world of learning zones</h2>
            <p className="mt-3 text-slate-700 sm:text-lg">Every zone feels like play first, learning second - exactly how kids stay curious.</p>
          </motion.div>

          <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {zones.map((zone, i) => (
              <motion.article
                key={zone.name}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.03, duration: 0.38 }}
                whileHover={reduceMotion ? undefined : { y: -4, scale: 1.02 }}
                className={`rounded-2xl border bg-gradient-to-br p-4 shadow-[0_8px_0_rgba(148,163,184,0.35)] transition ${zone.tone}`}
              >
                <div className="text-3xl">{zone.emoji}</div>
                <h3 className="mt-2 font-display text-sm font-extrabold text-slate-900 sm:text-base">{zone.name}</h3>
                <p className="text-xs font-medium text-slate-700 sm:text-sm">{zone.hint}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/70 bg-gradient-to-b from-fuchsia-50/70 to-sky-50/70 px-4 py-12 sm:px-6 sm:py-14">
        <div className="mx-auto max-w-6xl">
          <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-extrabold text-slate-900 sm:text-4xl [text-shadow:0_2px_0_#fff]">Eight game types, zero boredom</h2>
          </motion.div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {games.map((game, i) => (
              <motion.article
                key={game.title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.03, duration: 0.35 }}
                whileHover={reduceMotion ? undefined : { y: -5 }}
                className={`rounded-2xl border border-white/90 bg-white/90 p-5 shadow-[0_10px_0_rgba(148,163,184,0.35),0_18px_24px_-14px_rgba(14,116,144,0.4)] ${game.glow}`}
              >
                <div className="text-3xl">{game.icon}</div>
                <h3 className="mt-2 font-display text-base font-extrabold text-slate-900">{game.title}</h3>
                <p className="mt-1 text-sm font-medium text-slate-700">{game.desc}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/70 bg-gradient-to-b from-white to-rose-50/70 px-4 py-12 sm:px-6 sm:py-14">
        <div className="mx-auto max-w-6xl">
          <motion.div {...fadeUp} className="text-center">
            <h2 className="font-display text-3xl font-extrabold text-slate-900 sm:text-4xl [text-shadow:0_2px_0_#fff]">Choose your plan</h2>
            <p className="mx-auto mt-2 max-w-2xl font-medium text-slate-700">Weekly and monthly are separate plans. Pick one and start instantly.</p>
          </motion.div>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            <motion.div {...fadeUp} className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-[0_10px_0_rgba(203,213,225,0.8)]">
              <p className="text-xs font-black uppercase tracking-wider text-slate-500">{pricing.free.name}</p>
              <p className="mt-2 font-display text-4xl font-extrabold text-slate-900">₹0</p>
              <p className="mt-1 text-sm font-medium text-slate-600">Forever free</p>
              <ul className="mt-5 space-y-2.5 text-sm font-medium text-slate-700">
                {pricing.free.features.map((f) => (
                  <li key={f} className="flex gap-2"><span className="text-emerald-600">✓</span>{f}</li>
                ))}
              </ul>
              <a href="/signup" className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-gradient-to-b from-slate-200 to-slate-300 py-3 font-extrabold text-slate-800 shadow-[0_5px_0_#94a3b8] transition hover:-translate-y-0.5">Create free account</a>
            </motion.div>

            <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.05 }} className="rounded-3xl border border-fuchsia-200 bg-gradient-to-br from-fuchsia-100 via-white to-rose-100 p-6 shadow-[0_10px_0_rgba(192,38,211,0.35)]">
              <p className="text-xs font-black uppercase tracking-wider text-fuchsia-700">Premium Weekly</p>
              <p className="mt-2 font-display text-4xl font-extrabold text-slate-900">₹{pricing.premiumWeeklyInr.priceInr}<span className="text-base font-bold text-slate-600">/week</span></p>
              <p className="mt-1 text-sm font-medium text-slate-700">Auto-renews weekly</p>
              <ul className="mt-5 space-y-2.5 text-sm font-medium text-slate-800">
                {pricing.premiumWeeklyInr.features.map((f) => (
                  <li key={f} className="flex gap-2"><span className="text-fuchsia-600">✓</span>{f}</li>
                ))}
                <li className="flex gap-2"><span className="text-fuchsia-600">✓</span>Up to 4 child profiles · Parent timer</li>
              </ul>
              <a href="/signup" className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-gradient-to-b from-fuchsia-500 to-fuchsia-700 py-3 font-extrabold text-white shadow-[0_6px_0_#86198f] transition hover:-translate-y-0.5">Start weekly plan</a>
            </motion.div>

            <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }} className="rounded-3xl border border-sky-200 bg-gradient-to-br from-sky-100 via-white to-indigo-100 p-6 shadow-[0_10px_0_rgba(2,132,199,0.35)]">
              <p className="text-xs font-black uppercase tracking-wider text-sky-700">Premium Monthly</p>
              <p className="mt-2 font-display text-4xl font-extrabold text-slate-900">₹{pricing.premiumMonthlyInr.priceInr}<span className="text-base font-bold text-slate-600">/month</span></p>
              <p className="mt-1 text-sm font-medium text-slate-700">Auto-renews monthly</p>
              <ul className="mt-5 space-y-2.5 text-sm font-medium text-slate-800">
                {pricing.premiumMonthlyInr.features.map((f) => (
                  <li key={f} className="flex gap-2"><span className="text-sky-600">✓</span>{f}</li>
                ))}
                <li className="flex gap-2"><span className="text-sky-600">✓</span>Up to 4 child profiles · Parent timer</li>
              </ul>
              <a href="/signup" className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-gradient-to-b from-sky-500 to-blue-700 py-3 font-extrabold text-white shadow-[0_6px_0_#1e3a8a] transition hover:-translate-y-0.5">Start monthly plan</a>
            </motion.div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-800 bg-slate-950 px-4 py-10 text-slate-400 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="text-center sm:text-left">
              <FunBerryLogo size="lg" variant="editorial" />
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-slate-500">{brand.tagline}</p>
            </div>
            <div className="flex flex-col items-center gap-3 sm:items-end">
              <div className="flex gap-6 text-sm font-semibold">
                <a href="/privacy" className="text-slate-400 transition hover:text-white">Privacy</a>
                <a href="/terms" className="text-slate-400 transition hover:text-white">Terms</a>
                <a href="/pricing" className="text-slate-400 transition hover:text-white">Pricing</a>
              </div>
              <p className="text-center text-xs text-slate-600 sm:text-right">© {new Date().getFullYear()} {brand.name}. Crafted for little learners and proud parents.</p>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
