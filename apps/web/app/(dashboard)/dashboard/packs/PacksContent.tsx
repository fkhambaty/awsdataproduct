"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  getChildren,
  getLearningPacks,
  createLearningPack,
  deleteLearningPack,
  setPackAssignments,
  type Child,
  type LearningPackWithMeta,
} from "@funberry/supabase";
import { generateLesson, type GeneratedLesson } from "@funberry/game-engine";
import { createOcrRunner, fileToDataUrl } from "./ocr";

const THEMES = [
  { id: "jungle", label: "Jungle", emoji: "🌴" },
  { id: "space", label: "Space", emoji: "🚀" },
  { id: "ocean", label: "Ocean", emoji: "🌊" },
  { id: "candy", label: "Candy", emoji: "🍭" },
  { id: "dino", label: "Dino", emoji: "🦕" },
] as const;

const GAME_TYPE_LABEL: Record<string, string> = {
  picture_quiz: "Fill in the Blank",
  true_false: "True or False",
  drag_sort: "Sort into Groups",
  word_picture_link: "Word Match",
  memory_match: "Memory Match",
  sequence_builder: "Put It in Order",
};

interface WizardPage {
  id: string;
  dataUrl: string;
  ocrText: string;
  editedText: string;
  status: "idle" | "running" | "done" | "error";
  progress: number;
}

function generatedGameCount(pack: LearningPackWithMeta): number {
  const g = pack.generated as { games?: unknown[] } | null;
  return Array.isArray(g?.games) ? g!.games!.length : 0;
}

export default function PacksContent() {
  const router = useRouter();
  const [view, setView] = useState<"list" | "wizard">("list");
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState<Child[]>([]);
  const [packs, setPacks] = useState<LearningPackWithMeta[]>([]);
  const [assignEditor, setAssignEditor] = useState<LearningPackWithMeta | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [kids, list] = await Promise.all([getChildren(), getLearningPacks()]);
      setChildren(kids);
      setPacks(list);
    } catch {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_20%_10%,#eef2ff_0,#faf5ff_45%,#ecfeff_100%)] px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <header className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-black text-indigo-950 sm:text-3xl">Learning Packs</h1>
            <p className="mt-1 text-sm font-semibold text-indigo-800/70">
              Turn textbook pages into games your child learns by playing.
            </p>
          </div>
          <a
            href="/dashboard"
            className="kid-glass-btn kid-glass-muted shrink-0 rounded-2xl px-4 py-2 text-sm font-bold"
          >
            ← Dashboard
          </a>
        </header>

        {view === "list" ? (
          <PackList
            loading={loading}
            packs={packs}
            children={children}
            onNew={() => setView("wizard")}
            onDelete={async (id) => {
              await deleteLearningPack(id);
              await loadAll();
            }}
            onEditAssign={(pack) => setAssignEditor(pack)}
          />
        ) : (
          <PackWizard
            children={children}
            onCancel={() => setView("list")}
            onSaved={async () => {
              setView("list");
              await loadAll();
            }}
          />
        )}
      </div>

      <AnimatePresence>
        {assignEditor && (
          <AssignModal
            pack={assignEditor}
            children={children}
            onClose={() => setAssignEditor(null)}
            onSaved={async () => {
              setAssignEditor(null);
              await loadAll();
            }}
          />
        )}
      </AnimatePresence>
    </main>
  );
}

// ── Pack list ─────────────────────────────────────────────────────────────────

function PackList({
  loading,
  packs,
  children,
  onNew,
  onDelete,
  onEditAssign,
}: {
  loading: boolean;
  packs: LearningPackWithMeta[];
  children: Child[];
  onNew: () => void;
  onDelete: (id: string) => Promise<void>;
  onEditAssign: (pack: LearningPackWithMeta) => void;
}) {
  const childName = (id: string) => children.find((c) => c.id === id)?.name ?? "Child";

  return (
    <div>
      <motion.button
        whileHover={{ scale: 1.01, y: -2 }}
        whileTap={{ scale: 0.99 }}
        onClick={onNew}
        className="kid-glass-btn kid-glass-violet mb-5 w-full rounded-kid px-6 py-4 text-base font-black"
      >
        + Create a new Learning Pack
      </motion.button>

      {loading ? (
        <div className="space-y-3">
          {[0, 1].map((i) => (
            <div key={i} className="glass-card h-24 animate-pulse rounded-kid" />
          ))}
        </div>
      ) : packs.length === 0 ? (
        <div className="glass-card rounded-kid p-8 text-center">
          <p className="mb-2 text-4xl">📚</p>
          <p className="font-display text-lg font-bold text-slate-700">No packs yet</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
            Snap a few pages from your child&apos;s textbook, and we&apos;ll turn them into games that
            teach exactly those pages.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {packs.map((pack) => {
            const theme = THEMES.find((t) => t.id === pack.theme) ?? THEMES[0];
            return (
              <div key={pack.id} className="glass-card rounded-kid p-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl" aria-hidden>{theme.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-base font-black text-slate-800">{pack.title}</p>
                    <p className="text-xs font-bold text-slate-500">
                      {pack.subject} • {pack.pageCount} page{pack.pageCount === 1 ? "" : "s"} • {generatedGameCount(pack)} games
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      onClick={() => onEditAssign(pack)}
                      className="kid-glass-btn kid-glass-sky rounded-xl px-3 py-2 text-xs font-bold"
                    >
                      Assign
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete "${pack.title}"? This cannot be undone.`)) onDelete(pack.id);
                      }}
                      className="kid-glass-btn kid-glass-danger rounded-xl px-3 py-2 text-xs font-bold"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  {pack.assignedChildIds.length === 0 ? (
                    <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-700">
                      Not assigned yet — tap Assign
                    </span>
                  ) : (
                    pack.assignedChildIds.map((cid) => (
                      <span key={cid} className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                        🎮 {childName(cid)}
                      </span>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Assign modal ──────────────────────────────────────────────────────────────

function AssignModal({
  pack,
  children,
  onClose,
  onSaved,
}: {
  pack: LearningPackWithMeta;
  children: Child[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set(pack.assignedChildIds));
  const [saving, setSaving] = useState(false);

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-kid bg-white p-6 shadow-2xl"
      >
        <h3 className="font-display text-lg font-black text-slate-800">Assign &ldquo;{pack.title}&rdquo;</h3>
        <p className="mt-1 text-sm text-slate-500">Pick which children play this pack.</p>
        <div className="mt-4 space-y-2">
          {children.length === 0 && <p className="text-sm text-slate-500">Add a child first from the dashboard.</p>}
          {children.map((c) => {
            const on = selected.has(c.id);
            return (
              <button
                key={c.id}
                onClick={() => toggle(c.id)}
                className={`flex w-full items-center justify-between rounded-2xl border-2 px-4 py-3 text-left transition ${
                  on ? "border-emerald-400 bg-emerald-50" : "border-slate-200 bg-white"
                }`}
              >
                <span className="font-bold text-slate-700">{c.name}</span>
                <span className="text-lg">{on ? "✅" : "⬜"}</span>
              </button>
            );
          })}
        </div>
        <div className="mt-5 flex gap-2">
          <button onClick={onClose} className="kid-glass-btn kid-glass-muted flex-1 rounded-2xl px-4 py-2.5 text-sm font-bold">
            Cancel
          </button>
          <button
            disabled={saving}
            onClick={async () => {
              setSaving(true);
              try {
                await setPackAssignments(pack.id, [...selected]);
                onSaved();
              } finally {
                setSaving(false);
              }
            }}
            className="kid-glass-btn kid-glass-violet flex-1 rounded-2xl px-4 py-2.5 text-sm font-black"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Create wizard ─────────────────────────────────────────────────────────────

function PackWizard({
  children,
  onCancel,
  onSaved,
}: {
  children: Child[];
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [step, setStep] = useState(1);
  const [pages, setPages] = useState<WizardPage[]>([]);
  const [ocrBusy, setOcrBusy] = useState(false);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("Science");
  const [theme, setTheme] = useState<string>("jungle");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [generated, setGenerated] = useState<GeneratedLesson | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const combinedText = useMemo(
    () => pages.map((p) => p.editedText).filter((t) => t.trim()).join("\n"),
    [pages],
  );

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files) return;
    const newPages: WizardPage[] = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      const dataUrl = await fileToDataUrl(file);
      newPages.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        dataUrl,
        ocrText: "",
        editedText: "",
        status: "idle",
        progress: 0,
      });
    }
    setPages((prev) => [...prev, ...newPages]);
  }, []);

  const runOcr = useCallback(async () => {
    const targets = pages.filter((p) => p.status === "idle" || p.status === "error");
    if (targets.length === 0) return;
    setOcrBusy(true);
    let runner;
    try {
      runner = await createOcrRunner();
      for (const page of targets) {
        setPages((prev) => prev.map((p) => (p.id === page.id ? { ...p, status: "running", progress: 0 } : p)));
        try {
          const text = await runner.run(page.dataUrl, (prog) =>
            setPages((prev) => prev.map((p) => (p.id === page.id ? { ...p, progress: prog } : p))),
          );
          setPages((prev) =>
            prev.map((p) =>
              p.id === page.id
                ? { ...p, ocrText: text, editedText: p.editedText || text, status: "done", progress: 1 }
                : p,
            ),
          );
        } catch {
          setPages((prev) => prev.map((p) => (p.id === page.id ? { ...p, status: "error" } : p)));
        }
      }
    } catch {
      setPages((prev) => prev.map((p) => (p.status === "running" ? { ...p, status: "error" } : p)));
    } finally {
      if (runner) await runner.terminate();
      setOcrBusy(false);
    }
  }, [pages]);

  const doGenerate = useCallback(() => {
    const result = generateLesson(combinedText, {
      idPrefix: "preview",
      title: title || "My Lesson",
      subject,
      theme,
    });
    setGenerated(result);
  }, [combinedText, title, subject, theme]);

  const toggleChild = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const handleSave = useCallback(async () => {
    if (!generated) return;
    setSaving(true);
    try {
      const pack = await createLearningPack({
        title: title || "My Lesson",
        subject,
        theme,
        sourceText: combinedText,
        status: "ready",
        generated: { games: generated.games, keywords: generated.keywords, generatedAt: new Date().toISOString() },
        pages: pages.map((p) => ({ ocrText: p.ocrText, editedText: p.editedText, imageDataUrl: p.dataUrl })),
      });
      if (selected.size > 0) {
        await setPackAssignments(pack.id, [...selected]);
      }
      onSaved();
    } finally {
      setSaving(false);
    }
  }, [generated, title, subject, theme, combinedText, pages, selected, onSaved]);

  const anyDone = pages.some((p) => p.status === "done");

  return (
    <div className="glass-card rounded-kid p-4 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={`h-2 flex-1 rounded-full ${s <= step ? "bg-violet-500" : "bg-slate-200"}`}
          />
        ))}
      </div>

      {/* Step 1: Upload */}
      {step === 1 && (
        <div>
          <h2 className="font-display text-xl font-black text-slate-800">1. Add textbook pages</h2>
          <p className="mt-1 text-sm text-slate-500">
            Take clear, well-lit photos of the pages (straight, not blurry). Add as many as you like.
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="kid-glass-btn kid-glass-sky mt-4 w-full rounded-kid px-6 py-4 text-base font-black"
          >
            📷 Choose / take photos
          </button>

          {pages.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
              {pages.map((p) => (
                <div key={p.id} className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.dataUrl} alt="" className="h-24 w-full rounded-xl border-2 border-white object-cover shadow" />
                  <button
                    onClick={() => setPages((prev) => prev.filter((x) => x.id !== p.id))}
                    className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-xs font-black text-white shadow"
                    aria-label="Remove page"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 flex justify-between">
            <button onClick={onCancel} className="kid-glass-btn kid-glass-muted rounded-2xl px-5 py-2.5 text-sm font-bold">
              Cancel
            </button>
            <button
              disabled={pages.length === 0}
              onClick={() => setStep(2)}
              className="kid-glass-btn kid-glass-violet rounded-2xl px-6 py-2.5 text-sm font-black disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* Step 2: OCR + review */}
      {step === 2 && (
        <div>
          <h2 className="font-display text-xl font-black text-slate-800">2. Read &amp; fix the text</h2>
          <p className="mt-1 text-sm text-slate-500">
            We read the words from your photos here in your browser. Check each page and fix any mistakes —
            the games are built from this text.
          </p>

          <button
            onClick={runOcr}
            disabled={ocrBusy}
            className="kid-glass-btn kid-glass-sky mt-4 w-full rounded-kid px-6 py-3 text-sm font-black disabled:opacity-50"
          >
            {ocrBusy ? "Reading pages…" : anyDone ? "Read remaining pages" : "✨ Read text from photos"}
          </button>

          <div className="mt-4 space-y-4">
            {pages.map((p, i) => (
              <div key={p.id} className="rounded-2xl border border-slate-200 bg-white/70 p-3">
                <div className="mb-2 flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.dataUrl} alt="" className="h-14 w-14 rounded-lg border object-cover" />
                  <div className="flex-1">
                    <p className="text-xs font-black text-slate-600">Page {i + 1}</p>
                    <p className="text-[11px] font-bold text-slate-400">
                      {p.status === "running" && `Reading… ${Math.round(p.progress * 100)}%`}
                      {p.status === "done" && "Read ✓ — edit if needed"}
                      {p.status === "error" && "Couldn't read — type the text or retry"}
                      {p.status === "idle" && "Not read yet"}
                    </p>
                  </div>
                </div>
                <textarea
                  value={p.editedText}
                  onChange={(e) =>
                    setPages((prev) => prev.map((x) => (x.id === p.id ? { ...x, editedText: e.target.value } : x)))
                  }
                  placeholder="Text from this page will appear here…"
                  rows={4}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2 text-sm text-slate-700 outline-none focus:border-violet-400"
                />
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-between">
            <button onClick={() => setStep(1)} className="kid-glass-btn kid-glass-muted rounded-2xl px-5 py-2.5 text-sm font-bold">
              ← Back
            </button>
            <button
              disabled={combinedText.trim().length < 20}
              onClick={() => setStep(3)}
              className="kid-glass-btn kid-glass-violet rounded-2xl px-6 py-2.5 text-sm font-black disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* Step 3: details + theme + assign */}
      {step === 3 && (
        <div>
          <h2 className="font-display text-xl font-black text-slate-800">3. Name it &amp; choose a theme</h2>
          <label className="mt-4 block text-sm font-bold text-slate-600">Pack name</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Science — Plant World (pages 4–8)"
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700 outline-none focus:border-violet-400"
          />

          <label className="mt-4 block text-sm font-bold text-slate-600">Subject</label>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Science, EVS, English…"
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700 outline-none focus:border-violet-400"
          />

          <label className="mt-4 block text-sm font-bold text-slate-600">Theme for your child</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`flex items-center gap-1.5 rounded-2xl border-2 px-4 py-2 text-sm font-bold transition ${
                  theme === t.id ? "border-violet-400 bg-violet-50 text-violet-700" : "border-slate-200 bg-white text-slate-600"
                }`}
              >
                <span className="text-lg">{t.emoji}</span> {t.label}
              </button>
            ))}
          </div>

          <label className="mt-5 block text-sm font-bold text-slate-600">Assign to (optional now)</label>
          <div className="mt-2 space-y-2">
            {children.length === 0 && <p className="text-sm text-slate-400">Add a child from the dashboard to assign.</p>}
            {children.map((c) => {
              const on = selected.has(c.id);
              return (
                <button
                  key={c.id}
                  onClick={() => toggleChild(c.id)}
                  className={`flex w-full items-center justify-between rounded-2xl border-2 px-4 py-3 text-left transition ${
                    on ? "border-emerald-400 bg-emerald-50" : "border-slate-200 bg-white"
                  }`}
                >
                  <span className="font-bold text-slate-700">{c.name}</span>
                  <span className="text-lg">{on ? "✅" : "⬜"}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex justify-between">
            <button onClick={() => setStep(2)} className="kid-glass-btn kid-glass-muted rounded-2xl px-5 py-2.5 text-sm font-bold">
              ← Back
            </button>
            <button
              disabled={title.trim().length === 0}
              onClick={() => {
                doGenerate();
                setStep(4);
              }}
              className="kid-glass-btn kid-glass-violet rounded-2xl px-6 py-2.5 text-sm font-black disabled:opacity-40"
            >
              Preview games →
            </button>
          </div>
        </div>
      )}

      {/* Step 4: preview + save */}
      {step === 4 && (
        <div>
          <h2 className="font-display text-xl font-black text-slate-800">4. Your games are ready!</h2>
          <p className="mt-1 text-sm text-slate-500">
            These games were built from your pages. Your child plays them like any other game.
          </p>

          {generated && generated.games.length > 0 ? (
            <div className="mt-4 space-y-2">
              {generated.games.map((g) => (
                <div key={g.id} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/80 p-3">
                  <span className="text-2xl">🎮</span>
                  <div>
                    <p className="font-display text-sm font-black text-slate-800">{g.title}</p>
                    <p className="text-[11px] font-bold text-slate-400">{GAME_TYPE_LABEL[g.type] ?? g.type}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">
              We couldn&apos;t build games from this text. Go back and add clearer pages or a bit more text.
            </div>
          )}

          {generated && generated.warnings.length > 0 && (
            <details className="mt-3 rounded-2xl border border-slate-200 bg-white/70 p-3 text-xs text-slate-500">
              <summary className="cursor-pointer font-bold">Why not more games?</summary>
              <ul className="mt-2 list-disc pl-5">
                {generated.warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </details>
          )}

          <div className="mt-6 flex justify-between">
            <button onClick={() => setStep(3)} className="kid-glass-btn kid-glass-muted rounded-2xl px-5 py-2.5 text-sm font-bold">
              ← Back
            </button>
            <button
              disabled={saving || !generated || generated.games.length === 0}
              onClick={handleSave}
              className="kid-glass-btn kid-glass-leaf rounded-2xl px-6 py-2.5 text-sm font-black disabled:opacity-40"
            >
              {saving ? "Saving…" : "Save pack ✓"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
