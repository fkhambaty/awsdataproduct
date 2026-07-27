"use client";

import { useState } from "react";
import type { GameConfig } from "@funberry/game-engine";

const GAME_TYPE_LABEL: Record<string, string> = {
  picture_quiz: "Fill in the Blank",
  true_false: "True or False",
  drag_sort: "Sort into Groups",
  word_picture_link: "Word Match",
  memory_match: "Memory Match",
  sequence_builder: "Put It in Order",
};

/** Deep-clone helper so edits never mutate the generated source. */
function clone<T>(v: T): T {
  return typeof structuredClone === "function"
    ? structuredClone(v)
    : (JSON.parse(JSON.stringify(v)) as T);
}

/**
 * Drops empty/invalid items so only clean, playable games are saved. This is the
 * quality gate: the parent reviews, fixes or removes, and nothing weak ships.
 */
function validateGame(game: GameConfig): GameConfig | null {
  const g = clone(game);
  switch (g.data.type) {
    case "picture_quiz": {
      g.data.questions = g.data.questions
        .map((q) => ({ ...q, options: q.options.filter((o) => o.label.trim()) }))
        .filter((q) => q.question.trim() && q.options.length >= 2 && q.options.some((o) => o.id === q.correctId));
      return g.data.questions.length >= 1 ? g : null;
    }
    case "true_false": {
      g.data.questions = g.data.questions.filter((q) => q.statement.trim());
      return g.data.questions.length >= 1 ? g : null;
    }
    case "word_picture_link": {
      g.data.pairs = g.data.pairs.filter((p) => p.word.trim());
      return g.data.pairs.length >= 3 ? g : null;
    }
    case "memory_match": {
      g.data.pairs = g.data.pairs.filter((p) => p.front.trim());
      return g.data.pairs.length >= 3 ? g : null;
    }
    case "sequence_builder": {
      g.data.steps = g.data.steps
        .filter((s) => s.label.trim())
        .map((s, i) => ({ ...s, order: i + 1 }));
      return g.data.steps.length >= 3 ? g : null;
    }
    case "drag_sort": {
      const d = g.data;
      d.items = d.items.filter((it) => it.label.trim() && d.categories.some((c) => c.id === it.category));
      return d.items.length >= 4 && d.categories.length >= 2 ? g : null;
    }
    default:
      return g;
  }
}

export function PackReviewEditor({
  games,
  saving,
  onBack,
  onSave,
}: {
  games: GameConfig[];
  saving: boolean;
  onBack: () => void;
  onSave: (games: GameConfig[]) => void;
}) {
  const [items, setItems] = useState<GameConfig[]>(() => clone(games));
  const [included, setIncluded] = useState<Set<string>>(() => new Set(games.map((g) => g.id)));

  const patch = (idx: number, updater: (g: GameConfig) => void) =>
    setItems((prev) => {
      const next = clone(prev);
      updater(next[idx]);
      return next;
    });

  const toggleInclude = (id: string) =>
    setIncluded((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const finalGames = items
    .filter((g) => included.has(g.id))
    .map(validateGame)
    .filter((g): g is GameConfig => g !== null);

  return (
    <div>
      <h2 className="font-display text-xl font-black text-slate-800">4. Review &amp; approve</h2>
      <p className="mt-1 text-sm text-slate-500">
        You are the quality check. Edit any wording, fix the correct answer, or remove anything you
        don&apos;t like. Only what you approve reaches your child.
      </p>

      <div className="mt-4 space-y-4">
        {items.map((game, gi) => {
          const on = included.has(game.id);
          return (
            <div
              key={game.id}
              className={`rounded-2xl border p-3 ${on ? "border-slate-200 bg-white/80" : "border-slate-200 bg-slate-50 opacity-60"}`}
            >
              <div className="mb-2 flex items-center gap-2">
                <label className="flex flex-1 items-center gap-2">
                  <input type="checkbox" checked={on} onChange={() => toggleInclude(game.id)} className="h-4 w-4" />
                  <input
                    value={game.title}
                    onChange={(e) => patch(gi, (g) => { g.title = e.target.value; })}
                    className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm font-black text-slate-800 outline-none focus:border-violet-400"
                  />
                </label>
                <span className="shrink-0 rounded-full bg-indigo-100 px-2.5 py-1 text-[10px] font-black text-indigo-700">
                  {GAME_TYPE_LABEL[game.type] ?? game.type}
                </span>
              </div>

              {on && <GameEditor game={game} onPatch={(u) => patch(gi, u)} />}
            </div>
          );
        })}
      </div>

      {finalGames.length === 0 && (
        <p className="mt-4 rounded-xl bg-amber-50 p-2.5 text-center text-xs font-bold text-amber-700">
          Approve at least one game (with a question) to save this pack.
        </p>
      )}

      <div className="mt-6 flex justify-between">
        <button onClick={onBack} className="kid-glass-btn kid-glass-muted rounded-2xl px-5 py-2.5 text-sm font-bold">
          ← Back
        </button>
        <button
          disabled={saving || finalGames.length === 0}
          onClick={() => onSave(finalGames)}
          className="kid-glass-btn kid-glass-leaf rounded-2xl px-6 py-2.5 text-sm font-black disabled:opacity-40"
        >
          {saving ? "Saving…" : `Save ${finalGames.length} game${finalGames.length === 1 ? "" : "s"} ✓`}
        </button>
      </div>
    </div>
  );
}

// ── Per-type editors ──────────────────────────────────────────────────────────

const inputCls =
  "w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-700 outline-none focus:border-violet-400";

function GameEditor({ game, onPatch }: { game: GameConfig; onPatch: (u: (g: GameConfig) => void) => void }) {
  const data = game.data;

  if (data.type === "picture_quiz") {
    return (
      <div className="space-y-3">
        {data.questions.map((q, qi) => (
          <div key={q.id} className="rounded-xl border border-slate-100 bg-slate-50/60 p-2.5">
            <div className="mb-1.5 flex items-center gap-2">
              <span className="text-[11px] font-black text-slate-400">Q{qi + 1}</span>
              <button
                onClick={() => onPatch((g) => { if (g.data.type === "picture_quiz") g.data.questions.splice(qi, 1); })}
                className="ml-auto rounded-lg bg-rose-100 px-2 py-0.5 text-[11px] font-bold text-rose-600"
              >
                Remove
              </button>
            </div>
            <textarea
              value={q.question}
              onChange={(e) => onPatch((g) => { if (g.data.type === "picture_quiz") g.data.questions[qi].question = e.target.value; })}
              rows={2}
              className={inputCls}
            />
            <div className="mt-2 space-y-1.5">
              {q.options.map((o, oi) => (
                <div key={o.id} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`correct-${q.id}`}
                    checked={q.correctId === o.id}
                    onChange={() => onPatch((g) => { if (g.data.type === "picture_quiz") g.data.questions[qi].correctId = o.id; })}
                    title="Mark as correct answer"
                  />
                  <input
                    value={o.label}
                    onChange={(e) => onPatch((g) => { if (g.data.type === "picture_quiz") g.data.questions[qi].options[oi].label = e.target.value; })}
                    className={`${inputCls} ${q.correctId === o.id ? "border-emerald-400 bg-emerald-50" : ""}`}
                  />
                </div>
              ))}
            </div>
            <p className="mt-1.5 text-[10px] font-bold text-slate-400">Green = correct answer. Tap a circle to change it.</p>
          </div>
        ))}
      </div>
    );
  }

  if (data.type === "true_false") {
    return (
      <div className="space-y-2">
        {data.questions.map((q, qi) => (
          <div key={q.id} className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/60 p-2">
            <input
              value={q.statement}
              onChange={(e) => onPatch((g) => { if (g.data.type === "true_false") g.data.questions[qi].statement = e.target.value; })}
              className={inputCls}
            />
            <div className="flex shrink-0 overflow-hidden rounded-lg border border-slate-200">
              {[true, false].map((val) => (
                <button
                  key={String(val)}
                  onClick={() => onPatch((g) => { if (g.data.type === "true_false") g.data.questions[qi].isTrue = val; })}
                  className={`px-2.5 py-1.5 text-xs font-black ${q.isTrue === val ? (val ? "bg-emerald-500 text-white" : "bg-rose-500 text-white") : "bg-white text-slate-500"}`}
                >
                  {val ? "True" : "False"}
                </button>
              ))}
            </div>
            <button
              onClick={() => onPatch((g) => { if (g.data.type === "true_false") g.data.questions.splice(qi, 1); })}
              className="shrink-0 rounded-lg bg-rose-100 px-2 py-1 text-[11px] font-bold text-rose-600"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    );
  }

  if (data.type === "sequence_builder") {
    return (
      <div className="space-y-1.5">
        {data.steps.map((s, si) => (
          <div key={s.id} className="flex items-center gap-2">
            <span className="w-6 shrink-0 text-center text-xs font-black text-slate-400">{si + 1}</span>
            <span className="text-lg">{s.emoji}</span>
            <input
              value={s.label}
              onChange={(e) => onPatch((g) => { if (g.data.type === "sequence_builder") g.data.steps[si].label = e.target.value; })}
              className={inputCls}
            />
            <button
              onClick={() => onPatch((g) => { if (g.data.type === "sequence_builder") g.data.steps.splice(si, 1); })}
              className="shrink-0 rounded-lg bg-rose-100 px-2 py-1 text-[11px] font-bold text-rose-600"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    );
  }

  if (data.type === "word_picture_link" || data.type === "memory_match") {
    const pairs = data.type === "word_picture_link" ? data.pairs : data.pairs;
    return (
      <div className="space-y-1.5">
        {pairs.map((p, pi) => (
          <div key={p.id} className="flex items-center gap-2">
            <span className="text-xl">{p.emoji}</span>
            <input
              value={data.type === "word_picture_link" ? (p as { word: string }).word : (p as { front: string }).front}
              onChange={(e) =>
                onPatch((g) => {
                  if (g.data.type === "word_picture_link") g.data.pairs[pi].word = e.target.value;
                  else if (g.data.type === "memory_match") g.data.pairs[pi].front = e.target.value;
                })
              }
              className={inputCls}
            />
            <button
              onClick={() =>
                onPatch((g) => {
                  if (g.data.type === "word_picture_link" || g.data.type === "memory_match") g.data.pairs.splice(pi, 1);
                })
              }
              className="shrink-0 rounded-lg bg-rose-100 px-2 py-1 text-[11px] font-bold text-rose-600"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    );
  }

  if (data.type === "drag_sort") {
    return (
      <div className="space-y-1.5">
        <p className="text-[11px] font-bold text-slate-400">
          Groups: {data.categories.map((c) => `${c.emoji} ${c.label}`).join(", ")}
        </p>
        {data.items.map((it, ii) => (
          <div key={it.id} className="flex items-center gap-2">
            <span className="text-lg">{it.emoji}</span>
            <input
              value={it.label}
              onChange={(e) => onPatch((g) => { if (g.data.type === "drag_sort") g.data.items[ii].label = e.target.value; })}
              className={inputCls}
            />
            <select
              value={it.category}
              onChange={(e) => onPatch((g) => { if (g.data.type === "drag_sort") g.data.items[ii].category = e.target.value; })}
              className="shrink-0 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs"
            >
              {data.categories.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
            <button
              onClick={() => onPatch((g) => { if (g.data.type === "drag_sort") g.data.items.splice(ii, 1); })}
              className="shrink-0 rounded-lg bg-rose-100 px-2 py-1 text-[11px] font-bold text-rose-600"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    );
  }

  return null;
}
