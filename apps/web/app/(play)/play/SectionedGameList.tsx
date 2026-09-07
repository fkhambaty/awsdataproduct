"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { CurriculumSection, GameConfig } from "@funberry/game-engine";

const GAME_ICONS: Record<GameConfig["type"], string> = {
  picture_quiz: "❓",
  drag_sort: "🎯",
  memory_match: "🃏",
  sequence_builder: "📋",
  spot_difference: "🔍",
  odd_one_out: "🔍",
  true_false: "🤔",
  color_activity: "🎨",
  word_picture_link: "🔗",
  interactive_story: "📖",
  bubble_pop: "🫧",
  star_catcher: "⭐",
  pixi_lab: "🧪",
};

type SectionedGameListProps<TSection extends CurriculumSection> = {
  sections: readonly TSection[];
  completedGames: Record<string, number>;
  expandedSectionId: string | null;
  isLocked: (id: string) => boolean;
  onToggleSection: (sectionId: string) => void;
  onOpenGame: (game: GameConfig) => void;
  accentColor: string;
};

export function SectionedGameList<TSection extends CurriculumSection>({
  sections,
  completedGames,
  expandedSectionId,
  isLocked,
  onToggleSection,
  onOpenGame,
  accentColor,
}: SectionedGameListProps<TSection>) {
  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-indigo-100 bg-white/75 px-4 py-3 text-center backdrop-blur">
        <p className="font-display text-sm font-black text-indigo-900">{sections.length} folders</p>
        <p className="mt-0.5 text-xs font-semibold text-slate-500">
          Open a folder, collect stars, then try its final challenge.
        </p>
      </div>

      {sections.map((section, sectionIndex) => {
        const { metadata, entries } = section;
        const panelId = `curriculum-panel-${metadata.id}`;
        const buttonId = `curriculum-button-${metadata.id}`;
        const earnedStars = entries.reduce(
          (sum, entry) => sum + Math.min(completedGames[entry.game.id] ?? 0, entry.game.maxStars),
          0,
        );
        const maxStars = entries.reduce((sum, entry) => sum + entry.game.maxStars, 0);
        const completedCount = entries.filter((entry) => (completedGames[entry.game.id] ?? 0) > 0).length;
        const complete = entries.length > 0 && completedCount === entries.length;
        const practiceComplete = entries
          .filter((entry) => entry.role === "practice")
          .every((entry) => (completedGames[entry.game.id] ?? 0) > 0);
        const open = expandedSectionId === metadata.id;
        const lockedSection = entries.length > 0 && entries.every((entry) => isLocked(entry.game.id));
        const progressPercent = maxStars > 0 ? (earnedStars / maxStars) * 100 : 0;

        return (
          <motion.section
            key={metadata.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sectionIndex * 0.04 }}
            className="overflow-hidden rounded-[24px] border-2 border-white/80 bg-white/85 shadow-[0_12px_28px_-18px_rgba(30,41,59,0.45)] backdrop-blur"
          >
            <button
              id={buttonId}
              type="button"
              onClick={() => lockedSection ? onOpenGame(entries[0].game) : onToggleSection(metadata.id)}
              aria-expanded={lockedSection ? undefined : open}
              aria-controls={lockedSection ? undefined : panelId}
              className="flex w-full items-center gap-3 p-4 text-left sm:p-5"
            >
              <span
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl"
                style={{ background: complete ? "#dcfce7" : lockedSection ? "#fef3c7" : "#eef2ff" }}
                aria-hidden
              >
                {complete ? "🏅" : lockedSection ? "🔒" : metadata.emoji}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs font-black uppercase tracking-[0.12em] text-indigo-500">
                    Folder {sectionIndex + 1} of {sections.length}
                  </span>
                  {complete && (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-black text-emerald-700">
                      MASTERED
                    </span>
                  )}
                </span>
                <span className="mt-0.5 block font-display text-base font-black leading-tight text-slate-800 sm:text-lg">
                  {metadata.title}
                </span>
                {lockedSection ? (
                  <span className="mt-2 block text-xs font-black text-amber-700">
                    🔒 Ask a grown-up to unlock this folder
                  </span>
                ) : (
                  <span
                    className="mt-2 block h-2 overflow-hidden rounded-full bg-slate-100"
                    role="progressbar"
                    aria-label={`${metadata.title} star progress`}
                    aria-valuemin={0}
                    aria-valuemax={maxStars}
                    aria-valuenow={earnedStars}
                    aria-valuetext={`${earnedStars} of ${maxStars} stars`}
                  >
                    <motion.span
                      className="block h-full rounded-full"
                      style={{ background: complete ? "#22c55e" : accentColor }}
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </span>
                )}
              </span>
              <span className="shrink-0 text-right">
                {!lockedSection && (
                  <span className="block text-xs font-black text-amber-600">⭐ {earnedStars}/{maxStars}</span>
                )}
                {!lockedSection && (
                  <span className="mt-1 block text-lg text-slate-400" aria-hidden>{open ? "▴" : "▾"}</span>
                )}
              </span>
            </button>

            <AnimatePresence initial={false}>
              {open && !lockedSection && (
                <motion.div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-indigo-100/80 bg-indigo-50/35 p-3 sm:p-4">
                    <p className="mb-3 text-right text-xs font-black text-indigo-600">
                      {completedCount}/{entries.length} games
                    </p>
                    <div className="space-y-2.5">
                      {entries.map((entry, gameIndex) => {
                        const { game, role } = entry;
                        const stars = completedGames[game.id] ?? 0;
                        const locked = isLocked(game.id);
                        const challengeLocked = role === "challenge" && !practiceComplete;
                        return (
                          <motion.button
                            key={game.id}
                            type="button"
                            whileHover={{ scale: 1.015, x: 3 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onOpenGame(game)}
                            disabled={challengeLocked}
                            aria-label={
                              locked
                                ? `${game.title}. Grown-up unlock required.`
                                : challengeLocked
                                  ? `${game.title}. Finish the practice games to unlock this final challenge.`
                                : `${role === "challenge" ? "Final challenge. " : ""}${game.title}. ${stars} of ${game.maxStars} stars.`
                            }
                            className="flex min-h-14 w-full items-center gap-3 rounded-2xl border border-white bg-white p-3 text-left shadow-sm sm:p-4"
                            style={{ opacity: locked || challengeLocked ? 0.88 : 1 }}
                          >
                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-2xl">
                              {locked || challengeLocked ? "🔒" : GAME_ICONS[game.type]}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block text-xs font-black uppercase tracking-wider text-indigo-500">
                                {role === "challenge" ? "Final challenge" : `Game ${gameIndex + 1}`}
                              </span>
                              <span className="block font-display text-sm font-black leading-tight text-slate-800 sm:text-base">
                                {game.title}
                              </span>
                              <span className="block text-xs font-semibold leading-tight text-slate-500">
                                {game.description}
                              </span>
                            </span>
                            {locked ? (
                              <span className="rounded-full bg-amber-300 px-2 py-1 text-xs font-black text-amber-950">
                                GROWN-UP
                              </span>
                            ) : challengeLocked ? (
                              <span className="max-w-24 rounded-full bg-indigo-100 px-2 py-1 text-center text-xs font-black leading-tight text-indigo-700">
                                FINISH GAMES
                              </span>
                            ) : (
                              <span className="flex shrink-0 gap-0.5">
                                {Array.from({ length: game.maxStars }, (_, starIndex) => starIndex + 1).map((star) => (
                                  <span key={star} className={`text-sm ${star <= stars ? "" : "opacity-35 grayscale"}`}>⭐</span>
                                ))}
                              </span>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>
        );
      })}
    </div>
  );
}
