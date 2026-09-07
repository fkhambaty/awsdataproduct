export type GameType =
  | "drag_sort"
  | "memory_match"
  | "picture_quiz"
  | "sequence_builder"
  | "spot_difference"
  | "odd_one_out"
  | "true_false"
  | "color_activity"
  | "word_picture_link"
  | "interactive_story"
  | "bubble_pop"
  | "star_catcher"
  /** WebGL labs (PixiJS): drag physics, wind glide, multi-step touch missions */
  | "pixi_lab";

/** Metadata for one ordered folder in a curriculum-driven world. */
export interface CurriculumSectionMetadata {
  id: string;
  title: string;
  emoji: string;
  order: number;
  sourceLabel: string;
  totalSourceItems: number;
}

export type CurriculumEntryRole = "practice" | "challenge";

/** Curriculum-only layout. GameConfig stays reusable and source-agnostic. */
export interface CurriculumSection {
  metadata: CurriculumSectionMetadata;
  entries: {
    game: GameConfig;
    sourceItemIds: number[];
    role: CurriculumEntryRole;
  }[];
}

export interface GameConfig {
  id: string;
  zoneId: string;
  type: GameType;
  title: string;
  description: string;
  difficulty: 1 | 2 | 3;
  maxStars: number;
  timeLimit?: number;
  /** Textbook page image under web `public/book-pages/` (e.g. `/book-pages/20260328_104740.jpg`). */
  bookPageSrc?: string;
  data:
    | DragSortData
    | MemoryMatchData
    | PictureQuizData
    | SequenceBuilderData
    | SpotDifferenceData
    | OddOneOutData
    | TrueFalseData
    | ColorActivityData
    | WordPictureLinkData
    | InteractiveStoryData
    | BubblePopData
    | StarCatcherData
    | PixiLabData;
}

/* ── Drag & Sort ── */
export interface DragSortItem {
  id: string;
  label: string;
  emoji: string;
  category: string;
}
export interface DragSortData {
  type: "drag_sort";
  instruction: string;
  categories: { id: string; label: string; emoji: string }[];
  items: DragSortItem[];
}

/* ── Memory Match ── */
export interface MemoryMatchPair {
  id: string;
  front: string;
  emoji: string;
}
export interface MemoryMatchData {
  type: "memory_match";
  instruction: string;
  pairs: MemoryMatchPair[];
}

/* ── Picture Quiz ── */
export interface PictureQuizQuestion {
  id: string;
  question: string;
  options: { id: string; label: string; emoji: string }[];
  correctId: string;
  explanation: string;
}
export interface PictureQuizData {
  type: "picture_quiz";
  instruction: string;
  questions: PictureQuizQuestion[];
}

/* ── Sequence Builder ── */
export interface SequenceStep {
  id: string;
  label: string;
  emoji: string;
  order: number;
}
export interface SequenceBuilderData {
  type: "sequence_builder";
  instruction: string;
  steps: SequenceStep[];
}

/* ── Spot Difference ── */
export interface DifferencePoint {
  id: string;
  x: number;
  y: number;
  radius: number;
  label: string;
}
export interface SpotDifferenceData {
  type: "spot_difference";
  instruction: string;
  imageA: string;
  imageB: string;
  differences: DifferencePoint[];
}

/* ── Odd One Out ── */
export interface OddOneOutRound {
  id: string;
  items: { id: string; label: string; emoji: string }[];
  oddId: string;
  category: string;
  explanation: string;
}
export interface OddOneOutData {
  type: "odd_one_out";
  instruction: string;
  rounds: OddOneOutRound[];
}

/* ── True / False ── */
export interface TrueFalseQuestion {
  id: string;
  statement: string;
  emoji: string;
  isTrue: boolean;
  explanation: string;
}
export interface TrueFalseData {
  type: "true_false";
  instruction: string;
  questions: TrueFalseQuestion[];
}

/* ── Color Activity ── */
export interface ColorRegion {
  id: string;
  label: string;
  correctColor: string;
  path: string;
}
export interface ColorActivityData {
  type: "color_activity";
  instruction: string;
  palette: string[];
  regions: ColorRegion[];
}

/* ── Word-Picture Link ── */
export interface WordPicturePair {
  id: string;
  word: string;
  emoji: string;
  /** If set, show this on the word side until matched (e.g. scrambled letters from the textbook). */
  wordDisplay?: string;
}
export interface WordPictureLinkData {
  type: "word_picture_link";
  instruction: string;
  pairs: WordPicturePair[];
  /** Replaces the default “Tap a word…” playing hint when set. */
  matchHint?: string;
}

/* ── Interactive Story ── */
export interface StoryPage {
  id: string;
  text: string;
  emoji: string;
  choices?: { id: string; label: string; nextPageId: string; correct: boolean }[];
}
export interface InteractiveStoryData {
  type: "interactive_story";
  instruction: string;
  pages: StoryPage[];
}

/* ── Game State ── */
export interface GameState {
  status: "idle" | "playing" | "paused" | "completed";
  score: number;
  maxScore: number;
  starsEarned: number;
  timeElapsed: number;
  timeLimit: number | null;
  currentQuestion: number;
  totalQuestions: number;
  answers: Record<string, boolean>;
}

export interface GameResult {
  score: number;
  maxScore: number;
  starsEarned: number;
  timeSpent: number;
  accuracy: number;
}

/* ── Bubble Pop Adventure ── */
export interface BubbleItem {
  id: string;
  label: string;
  emoji: string;
  isTarget: boolean;
  color: string;
}
export interface BubblePopData {
  type: "bubble_pop";
  instruction: string;
  question: string;
  character: string;
  targetHint: string;
  bubbles: BubbleItem[];
}

/* ── Star Catcher ── */
export interface CatchItem {
  id: string;
  label: string;
  emoji: string;
  isTarget: boolean;
}
export interface StarCatcherData {
  type: "star_catcher";
  instruction: string;
  question: string;
  character: string;
  targetCategory: string;
  items: CatchItem[];
  lives: number;
}

/* ── Pixi lab (WebGL) — syllabus-aligned missions, high interaction ── */

export type PixiLabBin = { id: string; label: string; emoji: string };
export type PixiLabCreature = {
  id: string;
  emoji: string;
  label: string;
  correctBinId: string;
};

/** Textbook “Animals that help us” style: drag each animal to what it gives. */
export interface PixiLabAnimalProductData {
  type: "pixi_lab";
  mode: "animal_product";
  instruction: string;
  bins: PixiLabBin[];
  creatures: PixiLabCreature[];
}

/** Air / wind chapter: glide collector, fresh-air vs smog (variable reward loop). */
export interface PixiLabWindGlideData {
  type: "pixi_lab";
  mode: "wind_glide";
  instruction: string;
  /** Round length seconds */
  durationSec: number;
  /** Good collects needed for “perfect” bonus scoring */
  targetGood: number;
}

/** Rocks & minerals worksheet style: hard vs soft (tap zones, immediate feedback). */
export interface PixiLabRockTapData {
  type: "pixi_lab";
  mode: "rock_tap";
  instruction: string;
  rounds: { id: string; emoji: string; label: string; answer: "H" | "S" }[];
}

/** MI “Word Smart” style: drag letter tiles into slots to spell the animal name. */
export interface PixiLabWordUnscrambleData {
  type: "pixi_lab";
  mode: "word_unscramble";
  instruction: string;
  rounds: { id: string; emoji: string; /** Answer word (any case); shown scrambled in the bank */ word: string }[];
}

export type PixiLabData =
  | PixiLabAnimalProductData
  | PixiLabWindGlideData
  | PixiLabRockTapData
  | PixiLabWordUnscrambleData;
