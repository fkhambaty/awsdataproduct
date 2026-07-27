// Core engine
export { calculateStars, buildGameResult, getEncouragementMessage } from "./core/scoring";
export { useGameState } from "./core/useGameState";
export {
  generateConfetti,
  fireConfetti,
  fireStarExplosion,
  fireFireworks,
  fireEmojiBurst,
  fireSparkleAt,
  fireMiniBurst,
  fireGlitterStorm,
  fireRainbow,
  fireBubbleBurst,
} from "./core/confetti";
export {
  playTap, playCorrect, playWrong, playStar, playComplete, playVictory,
  playFlip, playMatch, playDrop, playStreak, playPageTurn,
  playPaint, playSparkle, playBubblePop, playCollect, playMiss,
  playJump, playTick, isMuted, setMuted, toggleMute,
} from "./core/sound";
export { getZoneTheme, defaultTheme } from "./core/themes";
export type { ZoneTheme } from "./core/themes";

// Rank context (for leaderboard integration)
export { RankProvider, useRankInfo } from "./core/RankContext";

// Shared components
export { StarReveal } from "./components/StarReveal";
export { StreakCounter } from "./components/StreakCounter";
export { FloatingEmojis } from "./components/FloatingEmojis";
export { GameShell } from "./components/GameShell";

// Templates
export { PictureQuiz } from "./templates/PictureQuiz";
export { DragSort } from "./templates/DragSort";
export { MemoryMatch } from "./templates/MemoryMatch";
export { SequenceBuilder } from "./templates/SequenceBuilder";
export { SpotDifference } from "./templates/SpotDifference";
export { ColorActivity } from "./templates/ColorActivity";
export { WordPictureLink } from "./templates/WordPictureLink";
export { InteractiveStory } from "./templates/InteractiveStory";
export { BubblePopAdventure } from "./templates/BubblePopAdventure";
export { StarCatcher } from "./templates/StarCatcher";
export { OddOneOut } from "./templates/OddOneOut";
export { TrueFalse } from "./templates/TrueFalse";
export { PixiLab } from "./templates/PixiLab";

// Progression
export {
  getZoneUnlockStatuses,
  isZoneUnlocked,
  getNextLockedZone,
  starMilestones,
  getEarnedMilestones,
  getNextMilestone,
} from "./core/progression";

// Game data
export { allEvsGames, getGamesForZone } from "./games/evs";
export { BOOK_PAGE_FILES, bookPageUrl } from "./data/bookPages";
export type { BookPageFile } from "./data/bookPages";
export {
  SYLLABUS_PHOTO_FILES,
  SYLLABUS_PHOTO_LINKS,
  syllabusPhotoUrl,
  getSyllabusPhotoRouting,
} from "./data/syllabusManifest";
export type { SyllabusPhotoFile, SyllabusZoneId } from "./data/syllabusManifest";

// Lesson rules engine (textbook text -> games, no AI)
export { generateLesson, splitSentences } from "./lesson/rulesEngine";
export type { GeneratedLesson, GenerateOptions } from "./lesson/rulesEngine";
export { emojiFor, hasEmoji, categoryFor } from "./lesson/lexicon";

// Types
export type * from "./types";
