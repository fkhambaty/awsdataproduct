"use client";

import type { ParentCoachingReport } from "@funberry/supabase";

function barTone(pct: number) {
  if (pct >= 72) return "bg-emerald-500";
  if (pct >= 40) return "bg-sky-500";
  if (pct > 0) return "bg-amber-500";
  return "bg-slate-200";
}

export function StrandMasteryChart({ report }: { report: ParentCoachingReport }) {
  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm sm:p-5">
      <h2 className="font-display text-lg font-bold text-slate-800">Learning themes — mastery map</h2>
      <p className="mb-4 text-xs text-slate-500">Each bar = stars vs max for games touched in that theme.</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {report.strandInsights.map((s) => {
          const pct = s.gamesPlayed > 0 ? (s.masteryPercent ?? 0) : 0;
          return (
            <div key={s.zoneId} className="rounded-xl bg-slate-50/80 p-3">
              <div className="mb-1 flex items-center justify-between gap-2 text-xs font-bold text-slate-700">
                <span className="flex min-w-0 items-center gap-1 truncate">
                  <span className="shrink-0">{s.emoji}</span>
                  <span className="truncate">{s.strandTitle}</span>
                </span>
                <span className="shrink-0 tabular-nums text-slate-500">{s.gamesPlayed ? `${pct}%` : "—"}</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-200/90">
                <div
                  className={`h-3 rounded-full transition-all ${barTone(pct)}`}
                  style={{ width: `${Math.min(100, pct)}%` }}
                />
              </div>
              <p className="mt-1 text-[10px] text-slate-400">
                {s.gamesPlayed}/{s.gamesInZone} games · ⭐ {s.starsEarned}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function SkillsBarGrid({ report }: { report: ParentCoachingReport }) {
  return (
    <div className="rounded-2xl border border-violet-200/80 bg-gradient-to-br from-violet-50/60 to-white p-4 sm:p-5">
      <h2 className="font-display text-lg font-bold text-violet-950">Skills behind the games</h2>
      <p className="mb-3 text-xs text-violet-900/70">How strongly each habit shows up in play (from stars × game type).</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {report.skillInsights.map((sk) => (
          <details key={sk.axisId} className="rounded-xl border border-violet-100 bg-white/90 p-3 [&_summary]:list-none [&_summary::-webkit-details-marker]:hidden">
            <summary className="cursor-pointer">
              <div className="flex items-center justify-between gap-2 text-sm font-bold text-slate-800">
                <span className="leading-tight">{sk.title}</span>
                <span className="font-display tabular-nums text-violet-700">
                  {sk.score !== null ? `${sk.score}%` : "—"}
                </span>
              </div>
              <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-violet-100">
                {sk.score !== null ? (
                  <div className="h-2.5 rounded-full bg-violet-600" style={{ width: `${sk.score}%` }} />
                ) : (
                  <div className="h-2.5 w-1/4 rounded-full bg-violet-200" />
                )}
              </div>
            </summary>
            {sk.parentDescription ? <p className="mt-2 text-xs text-slate-600">{sk.parentDescription}</p> : null}
            <p className="mt-1 text-xs text-slate-700">{sk.interpretation}</p>
            {sk.supportTip ? (
              <p className="mt-1 text-[11px] font-semibold text-emerald-800">At home: {sk.supportTip}</p>
            ) : null}
          </details>
        ))}
      </div>
    </div>
  );
}

const BEHAVIOR_WIDTH: Record<string, number> = {
  high: 100,
  moderate: 62,
  low: 28,
  unknown: 8,
};

export function BehaviorMeters({ report }: { report: ParentCoachingReport }) {
  if (!report.learningBehaviors?.length) return null;
  return (
    <div className="rounded-2xl border border-sky-200/80 bg-sky-50/40 p-4 sm:p-5">
      <h2 className="font-display text-lg font-bold text-sky-950">Learning habits</h2>
      <p className="mb-3 text-xs text-sky-900/75">Practice shape — not grades.</p>
      <div className="space-y-3">
        {report.learningBehaviors.map((b, i) => (
          <div key={`${b.label}-${i}`}>
            <div className="mb-0.5 flex justify-between text-xs font-bold text-slate-700">
              <span>{b.label}</span>
              <span className="uppercase text-slate-500">{b.signalStrength}</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-white/80">
              <div
                className="h-2.5 rounded-full bg-sky-500"
                style={{ width: `${BEHAVIOR_WIDTH[b.signalStrength] ?? 8}%` }}
              />
            </div>
            <p className="mt-1 line-clamp-2 text-[10px] leading-snug text-sky-950/80">{b.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CapabilityBars({ report }: { report: ParentCoachingReport }) {
  if (!report.coreCapabilityInsights?.length) return null;
  return (
    <div className="rounded-2xl border border-fuchsia-200/80 bg-fuchsia-50/30 p-4 sm:p-5">
      <h2 className="font-display text-lg font-bold text-fuchsia-950">Core capabilities</h2>
      <p className="mb-3 text-xs text-fuchsia-900/75">Tap a row below for tips; bars = model strength from play.</p>
      <div className="space-y-2">
        {report.coreCapabilityInsights.map((cap) => (
          <details
            key={cap.capabilityId}
            className="group rounded-xl border border-fuchsia-100 bg-white/90 px-3 py-2"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-2 font-bold text-fuchsia-950 [&::-webkit-details-marker]:hidden">
              <span className="min-w-0 flex-1 text-sm leading-tight">{cap.title}</span>
              <span className="shrink-0 font-display text-sm tabular-nums text-fuchsia-800">
                {cap.score !== null ? `${cap.score}%` : "—"}
              </span>
            </summary>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-fuchsia-100">
              {cap.score !== null ? (
                <div className="h-2 rounded-full bg-fuchsia-600" style={{ width: `${Math.min(100, cap.score)}%` }} />
              ) : null}
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">{cap.lensSummary}</p>
            <p className="mt-1 text-xs font-semibold text-fuchsia-900">{cap.interpretation}</p>
            <div className="mt-2 grid gap-2 border-t border-fuchsia-100 pt-2 text-[11px] sm:grid-cols-2">
              <p>
                <span className="font-bold text-emerald-800">Going well:</span> {cap.whatStrongSignals}
              </p>
              <p>
                <span className="font-bold text-amber-900">Watch:</span> {cap.whatToWatch}
              </p>
            </div>
            <p className="mt-2 rounded-lg bg-fuchsia-50/80 p-2 text-[11px] font-medium text-slate-800">
              <span className="font-bold text-fuchsia-900">Try at home:</span> {cap.parentInterventions}
            </p>
          </details>
        ))}
      </div>
    </div>
  );
}
