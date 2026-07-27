/**
 * Deterministic lesson rules engine (NO AI / NO LLM).
 *
 * Takes plain text extracted from a parent's textbook pages and turns it into
 * playable `GameConfig`s for the existing game templates. Everything here is
 * pure, rule-based text processing so it runs entirely inside the website.
 */
import type {
  GameConfig,
  PictureQuizQuestion,
  TrueFalseQuestion,
  WordPicturePair,
  MemoryMatchPair,
  DragSortData,
  SequenceStep,
} from "../types";
import { emojiFor, hasEmoji, categoryFor, STOPWORDS } from "./lexicon";

export interface GeneratedLesson {
  games: GameConfig[];
  keywords: string[];
  facts: string[];
  warnings: string[];
}

export interface GenerateOptions {
  idPrefix: string;
  title?: string;
  theme?: string;
  subject?: string;
  /** Zone id used only for theming the game shell. */
  zoneId?: string;
}

// ── Text utilities ────────────────────────────────────────────────────────────

/**
 * Removes OCR clutter (viewer chrome, margin icons, decorative headers/badges) by
 * keeping only lines that read like real printed sentences. Deterministic, no AI.
 *
 * A line is kept if it has enough "word-like" tokens (>= 3 letters and containing a
 * vowel) or is a real numbered/number-list line; symbol soup and stray single
 * characters are dropped.
 */
export function cleanLessonText(raw: string): string {
  const lines = raw.replace(/\r/g, "\n").split("\n");
  const kept: string[] = [];

  const isListMarker = (t: string) => /^\(?\d+[.)]$/.test(t);
  const SHORT_WORDS = /^(a|i|is|in|we|if|of|to|it|he|an|as|at|on|or|no|so|be|do|my|up|us|the)$/i;
  const isNoiseToken = (t: string) => {
    if (isListMarker(t)) return false;
    if (/[[\]{}|©®~^_<>*=]/.test(t)) return true; // bracket/symbol soup from OCR
    const digits = t.replace(/[^0-9]/g, "");
    if (digits.length) return false; // keep tokens with numbers (examples like 45)
    const letters = t.replace(/[^A-Za-z]/g, "");
    if (letters.length === 0) return true; // pure symbols
    if (letters.length <= 2 && !SHORT_WORDS.test(letters)) return true; // stray glyphs (BS, je)
    if (letters.length >= 3 && !/[aeiou]/i.test(letters)) return true; // no vowel = garbage (llr, ror)
    return false;
  };

  for (const original of lines) {
    // Collapse spaces and strip leading junk symbols (icons, bullets, quotes).
    let line = original.replace(/\s+/g, " ").trim();
    line = line.replace(/^[^A-Za-z0-9(]+/, "").trim();
    if (line.length < 3) continue;

    let tokens = line.split(/\s+/);
    // Drop a stray glyph sitting before a list marker, e.g. "BS 1." / "a 4." -> "1." / "4.".
    if (tokens.length >= 2 && isListMarker(tokens[1]) && !isListMarker(tokens[0]) && tokens[0].length <= 2) {
      tokens = tokens.slice(1);
    }
    // Trim leading/trailing noise tokens (margin icons like BS, i, v, @, je, [ror).
    while (tokens.length && isNoiseToken(tokens[0])) tokens = tokens.slice(1);
    while (tokens.length && isNoiseToken(tokens[tokens.length - 1])) tokens = tokens.slice(0, -1);
    line = tokens.join(" ").trim();
    if (line.length < 3) continue;

    const wordlike = tokens.filter((t) => {
      const w = t.replace(/[^A-Za-z]/g, "");
      return w.length >= 3 && /[aeiou]/i.test(w);
    });
    // Real digit lists like "(0, 1, 2, 3 ...)" are meaningful content.
    const hasNumberList = /\d\s*,\s*\d/.test(line);

    // Fraction of characters that are letters — very low means symbol soup.
    const letters = (line.match(/[A-Za-z]/g) ?? []).length;
    const letterRatio = letters / line.length;

    const keep =
      wordlike.length >= 3 ||
      (hasNumberList && wordlike.length >= 1) ||
      (wordlike.length >= 2 && letterRatio >= 0.6 && line.length >= 12);

    if (keep) kept.push(line);
  }

  return kept.join("\n");
}

function normalize(raw: string): string {
  return raw
    .replace(/\r/g, "\n")
    // join words broken across a line by a hyphen: "photo-\nsynthesis"
    .replace(/([a-z])-\s*\n\s*([a-z])/gi, "$1$2")
    .replace(/[\t ]+/g, " ")
    .replace(/\u2019/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\n{2,}/g, "\n")
    .trim();
}

function cleanWord(w: string): string {
  return w.toLowerCase().replace(/[^a-z]/g, "");
}

function titleCase(w: string): string {
  const c = cleanWord(w);
  return c ? c[0].toUpperCase() + c.slice(1) : w;
}

function capitalize(s: string): string {
  const t = s.trim();
  return t ? t[0].toUpperCase() + t.slice(1) : t;
}

function stripEnd(s: string): string {
  return s.replace(/[.!?]+\s*$/, "").trim();
}

function hasVowel(w: string): boolean {
  return /[aeiou]/i.test(w);
}

/** Verb/aux words that signal a real statement (vs. a heading or badge). */
const VERB_HINTS = new Set([
  "is", "are", "was", "were", "be", "being", "been", "has", "have", "had",
  "use", "uses", "used", "form", "forms", "formed", "make", "makes", "made",
  "called", "call", "include", "includes", "need", "needs", "grow", "grows",
  "live", "lives", "help", "helps", "can", "will", "do", "does", "get", "gets",
  "give", "gives", "come", "comes", "means", "mean", "learn", "learns", "see",
  "eat", "eats", "drink", "drinks", "breathe", "move", "moves", "become",
  "becomes", "found", "find", "finds", "contain", "contains", "show", "shows",
  "keep", "keeps", "help", "protect", "protects", "carry", "carries",
]);

/** OCR garbage token: bracket/symbol soup, or a 3+ letter run with no vowel. */
function isJunkToken(t: string): boolean {
  if (/[[\]{}|©®~^_<>*=]/.test(t)) return true;
  const letters = t.replace(/[^A-Za-z]/g, "");
  if (letters.length >= 3 && !hasVowel(letters)) return true;
  return false;
}

/**
 * A sentence usable for questions: no OCR-junk tokens, contains a verb-ish word,
 * and has several real content words. This blocks headers, badges, captions, and
 * garbled lines from ever becoming a game question.
 */
function isFactSentence(s: string): boolean {
  const tokens = s.split(/\s+/).filter(Boolean);
  if (tokens.length < 4 || tokens.length > 26) return false;
  if (tokens.some(isJunkToken)) return false;
  const clean = tokens.map(cleanWord).filter(Boolean);
  if (!clean.some((w) => VERB_HINTS.has(w))) return false;
  const contentWords = clean.filter((w) => w.length >= 3 && hasVowel(w));
  return contentWords.length >= 3;
}

export function splitSentences(text: string): string[] {
  const byLine = text.split(/\n+/);
  const out: string[] = [];
  for (const line of byLine) {
    // Split each line on sentence terminators, keeping reasonable chunks.
    const parts = line.split(/(?<=[.!?])\s+/);
    for (const p of parts) {
      const s = p.trim();
      const words = s.split(/\s+/).filter(Boolean);
      const alpha = (s.match(/[a-zA-Z]/g) ?? []).length;
      // Keep sentence-like chunks: enough words, mostly letters, not too long.
      if (words.length >= 4 && words.length <= 26 && alpha >= 12 && s.length <= 180) {
        out.push(s.replace(/\s+/g, " "));
      }
    }
  }
  return out;
}

function scoreKeywords(sentences: string[]): string[] {
  const counts = new Map<string, number>();
  for (const s of sentences) {
    for (const raw of s.split(/\s+/)) {
      const w = cleanWord(raw);
      if (w.length < 3 || STOPWORDS.has(w) || !hasVowel(w)) continue;
      counts.set(w, (counts.get(w) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((a, b) => {
      // Prefer words that have an emoji, then by frequency, then longer words.
      const ea = hasEmoji(a[0]) ? 1 : 0;
      const eb = hasEmoji(b[0]) ? 1 : 0;
      if (eb !== ea) return eb - ea;
      if (b[1] !== a[1]) return b[1] - a[1];
      return b[0].length - a[0].length;
    })
    .map(([w]) => w);
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function uniq<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}

/** Treats singular/plural (plant/plants) as the same word to avoid confusing options. */
function isVariant(a: string, b: string): boolean {
  if (a === b) return true;
  const [short, long] = a.length <= b.length ? [a, b] : [b, a];
  return long === `${short}s` || long === `${short}es`;
}

/** Keep only one word per emoji so match games stay unambiguous. */
function uniqByEmoji(words: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const w of words) {
    const e = emojiFor(w);
    if (seen.has(e)) continue;
    seen.add(e);
    out.push(w);
  }
  return out;
}

// ── Generators ────────────────────────────────────────────────────────────────

/** Fill-in-the-blank quiz built from real sentences (robust on any factual text). */
function makeClozeQuiz(sentences: string[], keywords: string[], opts: GenerateOptions): GameConfig | null {
  const pool = keywords.slice(0, 30);
  const questions: PictureQuizQuestion[] = [];
  const usedAnswers = new Set<string>();

  for (const s of sentences) {
    if (questions.length >= 6) break;
    const words = s.split(/\s+/);
    let answerIdx = -1;
    for (let i = 0; i < words.length; i += 1) {
      // Only blank a clean, whole word (skip "3-digit", "456.", punctuation, etc.).
      const bare = words[i].replace(/[.,!?;:]+$/, "");
      if (!/^[A-Za-z]+$/.test(bare)) continue;
      const w = cleanWord(bare);
      if (w.length >= 4 && hasVowel(w) && !STOPWORDS.has(w) && pool.includes(w) && !usedAnswers.has(w)) {
        answerIdx = i;
        break;
      }
    }
    if (answerIdx < 0) continue;
    const answer = cleanWord(words[answerIdx].replace(/[.,!?;:]+$/, ""));
    const sentenceWords = new Set(words.map((x) => cleanWord(x)));
    const distractors = pool.filter(
      (k) => k.length >= 3 && hasVowel(k) && !isVariant(k, answer) && !sentenceWords.has(k),
    );
    // Need a full set of real, distinct options — otherwise skip (no junk questions).
    if (distractors.length < 3) continue;
    usedAnswers.add(answer);

    const chosen = shuffle(distractors).slice(0, 3);
    const blanked = words
      .map((w, i) => (i === answerIdx ? "_____" : w))
      .join(" ");
    const options = shuffle([answer, ...chosen]).map((w) => ({
      id: w,
      label: titleCase(w),
      emoji: emojiFor(w),
    }));
    questions.push({
      id: `q${questions.length}`,
      question: capitalize(stripEnd(blanked)) + ".",
      options,
      correctId: answer,
      explanation: `From your page: "${capitalize(stripEnd(s))}."`,
    });
  }

  if (questions.length < 3) return null;
  return {
    id: `${opts.idPrefix}-cloze`,
    zoneId: opts.zoneId ?? "lesson",
    type: "picture_quiz",
    title: "Fill in the Blank",
    description: "Complete the sentences from your pages.",
    difficulty: 1,
    maxStars: 3,
    data: {
      type: "picture_quiz",
      instruction: "Pick the word that completes each sentence!",
      questions,
    },
  };
}

function swapKeyword(sentence: string, keywords: string[]): { text: string; replacement: string } | null {
  const words = sentence.split(/\s+/);
  for (let i = 0; i < words.length; i += 1) {
    const w = cleanWord(words[i]);
    if (w.length < 3 || !keywords.includes(w)) continue;
    const replacement = keywords.find((k) => k !== w && !sentence.toLowerCase().includes(k));
    if (!replacement) continue;
    const swapped = [...words];
    // Preserve trailing punctuation on the swapped token.
    const trailing = words[i].match(/[.,!?;:]+$/)?.[0] ?? "";
    swapped[i] = titleCase(replacement).toLowerCase() + trailing;
    return { text: swapped.join(" "), replacement };
  }
  return null;
}

function sentenceEmoji(sentence: string, keywords: string[]): string {
  for (const raw of sentence.split(/\s+/)) {
    const w = cleanWord(raw);
    if (w && hasEmoji(w)) return emojiFor(w);
  }
  for (const k of keywords) if (hasEmoji(k)) return emojiFor(k);
  return "📖";
}

/** True/False built from real sentences (true) and keyword-swapped ones (false). */
function makeTrueFalse(sentences: string[], keywords: string[], opts: GenerateOptions): GameConfig | null {
  const usable = sentences.filter((s) => s.length <= 150);
  const questions: TrueFalseQuestion[] = [];

  for (const s of usable) {
    if (questions.length >= 6) break;
    const wantFalse = questions.length % 2 === 1;
    if (wantFalse) {
      const swapped = swapKeyword(s, keywords);
      if (swapped) {
        questions.push({
          id: `t${questions.length}`,
          statement: capitalize(stripEnd(swapped.text)) + ".",
          emoji: emojiFor(swapped.replacement),
          isTrue: false,
          explanation: "Tricky one — your page does not say this!",
        });
        continue;
      }
    }
    questions.push({
      id: `t${questions.length}`,
      statement: capitalize(stripEnd(s)) + ".",
      emoji: sentenceEmoji(s, keywords),
      isTrue: true,
      explanation: "Yes! This matches your page.",
    });
  }

  const hasBoth = questions.some((q) => q.isTrue) && questions.some((q) => !q.isTrue);
  if (questions.length < 3 || !hasBoth) return null;
  return {
    id: `${opts.idPrefix}-tf`,
    zoneId: opts.zoneId ?? "lesson",
    type: "true_false",
    title: "True or False?",
    description: "Decide what your pages really say.",
    difficulty: 1,
    maxStars: 3,
    data: {
      type: "true_false",
      instruction: "Read each sentence and tap True or False!",
      questions,
    },
  };
}

function makeWordPicture(keywords: string[], opts: GenerateOptions): GameConfig | null {
  const withEmoji = uniqByEmoji(uniq(keywords.filter(hasEmoji))).slice(0, 6);
  if (withEmoji.length < 3) return null;
  const pairs: WordPicturePair[] = withEmoji.map((w) => ({
    id: w,
    word: titleCase(w),
    emoji: emojiFor(w),
  }));
  return {
    id: `${opts.idPrefix}-wpl`,
    zoneId: opts.zoneId ?? "lesson",
    type: "word_picture_link",
    title: "Word Match",
    description: "Match words from your pages to pictures.",
    difficulty: 1,
    maxStars: 3,
    data: {
      type: "word_picture_link",
      instruction: "Tap a word, then tap its matching picture!",
      pairs,
    },
  };
}

function makeMemory(keywords: string[], opts: GenerateOptions): GameConfig | null {
  const withEmoji = uniqByEmoji(uniq(keywords.filter(hasEmoji))).slice(0, 6);
  if (withEmoji.length < 3) return null;
  const pairs: MemoryMatchPair[] = withEmoji.map((w) => ({
    id: w,
    front: titleCase(w),
    emoji: emojiFor(w),
  }));
  return {
    id: `${opts.idPrefix}-mem`,
    zoneId: opts.zoneId ?? "lesson",
    type: "memory_match",
    title: "Memory Match",
    description: "Find the matching pairs from your pages.",
    difficulty: 1,
    maxStars: 3,
    data: {
      type: "memory_match",
      instruction: "Flip cards and find matching pairs!",
      pairs,
    },
  };
}

/** Drag & sort using the coarse category map (living/animals/plants/food/etc). */
function makeDragSort(keywords: string[], opts: GenerateOptions): GameConfig | null {
  const buckets = new Map<string, { label: string; emoji: string; items: string[] }>();
  for (const w of uniq(keywords)) {
    const cat = categoryFor(w);
    if (!cat) continue;
    const b = buckets.get(cat.cat) ?? { label: cat.label, emoji: cat.emoji, items: [] };
    if (b.items.length < 3 && !b.items.includes(w)) b.items.push(w);
    buckets.set(cat.cat, b);
  }
  const active = [...buckets.entries()].filter(([, b]) => b.items.length >= 2);
  if (active.length < 2) return null;

  const categories = active.map(([id, b]) => ({ id, label: b.label, emoji: b.emoji }));
  const items: DragSortData["items"] = [];
  for (const [id, b] of active) {
    for (const w of b.items) {
      items.push({ id: w, label: titleCase(w), emoji: emojiFor(w), category: id });
    }
  }
  if (items.length < 4) return null;

  return {
    id: `${opts.idPrefix}-sort`,
    zoneId: opts.zoneId ?? "lesson",
    type: "drag_sort",
    title: "Sort into Groups",
    description: "Sort words from your pages into the right groups.",
    difficulty: 2,
    maxStars: 3,
    data: {
      type: "drag_sort",
      instruction: "Tap a word, then tap the group it belongs to!",
      categories,
      items,
    },
  };
}

function makeSequence(text: string, keywords: string[], opts: GenerateOptions): GameConfig | null {
  // Only build an ordering game when the text describes a REAL process, signalled by
  // ordinal cue words. A plain numbered list of facts is NOT a sequence (its order is
  // arbitrary), so we deliberately do not treat "1. 2. 3." as steps.
  const cueRegex = /\b(first|then|next|after that|afterwards|finally|lastly|step\s+\d)\b/i;
  if (!cueRegex.test(text)) return null;

  const chunks = text
    .split(/\b(?:first(?:ly)?|then|next|after that|afterwards|finally|lastly)\b/i)
    .map((c) => c.replace(/^[,:;\s]+/, "").split(/[.\n]/)[0].trim())
    // Keep short, clean step phrases only.
    .filter((c) => c.length >= 4 && c.length <= 44 && !c.split(/\s+/).some(isJunkToken));
  const steps = uniq(chunks).slice(0, 6);

  if (steps.length < 3) return null;
  const stepConfigs: SequenceStep[] = steps.map((label, i) => ({
    id: `s${i}`,
    label: capitalize(label),
    emoji: sentenceEmoji(label, keywords),
    order: i + 1,
  }));

  return {
    id: `${opts.idPrefix}-seq`,
    zoneId: opts.zoneId ?? "lesson",
    type: "sequence_builder",
    title: "Put It in Order",
    description: "Arrange the steps from your pages.",
    difficulty: 2,
    maxStars: 3,
    data: {
      type: "sequence_builder",
      instruction: "Put the steps in the correct order!",
      steps: stepConfigs,
    },
  };
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Turn textbook page text into a set of playable games. Always returns whatever
 * can be produced; `warnings` explains anything that could not be generated.
 */
export function generateLesson(rawText: string, opts: GenerateOptions): GeneratedLesson {
  const text = normalize(cleanLessonText(rawText));
  // Only real, verb-bearing statements become questions — headers, badges, captions
  // and garbled OCR lines are excluded so nothing "stupid" reaches the child.
  const sentences = splitSentences(text).filter(isFactSentence);
  const keywords = scoreKeywords(sentences);
  const warnings: string[] = [];

  const games: GameConfig[] = [];
  const add = (g: GameConfig | null, missing: string) => {
    if (g) games.push(g);
    else warnings.push(missing);
  };

  add(makeClozeQuiz(sentences, keywords, opts), "Not enough clear sentences for a fill-in-the-blank quiz.");
  add(makeTrueFalse(sentences, keywords, opts), "Not enough sentences for a True/False game.");
  add(makeDragSort(keywords, opts), "No sortable groups were found in the text.");
  add(makeWordPicture(keywords, opts), "Not enough picture words for a Word Match game.");
  add(makeMemory(keywords, opts), "Not enough picture words for a Memory game.");
  add(makeSequence(text, keywords, opts), "No ordered steps (first/then/next) were found.");

  return {
    games,
    keywords: keywords.slice(0, 40),
    facts: sentences.slice(0, 20),
    warnings,
  };
}
