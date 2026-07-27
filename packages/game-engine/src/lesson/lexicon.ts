/**
 * Small, deterministic word → emoji lexicon used by the lesson rules engine to
 * illustrate keywords pulled from a parent's textbook pages. This is intentionally
 * curated (no AI): unknown words fall back to a neutral glyph.
 */
export const WORD_EMOJI: Record<string, string> = {
  // Plants & nature
  plant: "🌱", plants: "🌱", tree: "🌳", trees: "🌳", leaf: "🍃", leaves: "🍃",
  flower: "🌸", flowers: "🌸", root: "🌱", roots: "🌱", stem: "🌿", seed: "🫘",
  seeds: "🫘", fruit: "🍎", fruits: "🍎", grass: "🌾", forest: "🌲", garden: "🪴",
  soil: "🟤", sunlight: "☀️", sun: "☀️", photosynthesis: "🍃",
  // Animals
  animal: "🐾", animals: "🐾", dog: "🐶", cat: "🐱", cow: "🐄", cows: "🐄",
  goat: "🐐", sheep: "🐑", hen: "🐔", chicken: "🐔", bird: "🐦", birds: "🐦",
  fish: "🐟", frog: "🐸", lion: "🦁", tiger: "🐯", elephant: "🐘", monkey: "🐵",
  horse: "🐴", rabbit: "🐰", snake: "🐍", bee: "🐝", butterfly: "🦋", ant: "🐜",
  spider: "🕷️", duck: "🦆", pig: "🐷",
  // Body & health
  body: "🧍", bone: "🦴", bones: "🦴", muscle: "💪", muscles: "💪", teeth: "🦷",
  tooth: "🦷", eye: "👁️", eyes: "👁️", ear: "👂", nose: "👃", hand: "✋",
  brain: "🧠", heart: "❤️", skin: "🧑", health: "🩺", doctor: "🧑‍⚕️", medicine: "💊",
  // Food
  food: "🍎", milk: "🥛", water: "💧", rice: "🍚", bread: "🍞", egg: "🥚",
  eggs: "🥚", apple: "🍎", banana: "🍌", mango: "🥭", vegetable: "🥕",
  vegetables: "🥕", carrot: "🥕", potato: "🥔", honey: "🍯", sugar: "🧂",
  // Home, shelter, clothing
  home: "🏠", house: "🏠", shelter: "🏠", clothes: "👕", shirt: "👔", dress: "👗",
  shoe: "👟", shoes: "👟", bed: "🛏️", chair: "🪑", table: "🪑", door: "🚪",
  // Transport & communication
  car: "🚗", bus: "🚌", train: "🚆", boat: "⛵", ship: "🚢", plane: "✈️",
  aeroplane: "✈️", cycle: "🚲", bicycle: "🚲", truck: "🚚", rocket: "🚀",
  letter: "✉️", phone: "📞", radio: "📻", computer: "💻", book: "📖", books: "📖",
  // Sky, weather, time, earth
  moon: "🌙", star: "⭐", stars: "⭐", cloud: "☁️", clouds: "☁️", rain: "🌧️",
  wind: "🌬️", air: "💨", sky: "🌤️", earth: "🌍", fire: "🔥", ice: "🧊",
  rock: "🪨", rocks: "🪨", mountain: "⛰️", river: "🏞️", sea: "🌊", ocean: "🌊",
  day: "🌞", night: "🌛", clock: "🕐", time: "⏰",
  // Misc kid-friendly
  school: "🏫", teacher: "🧑‍🏫", friend: "🧒", family: "👨‍👩‍👧", toy: "🧸",
  ball: "⚽", music: "🎵", color: "🎨", colours: "🎨", colors: "🎨", number: "🔢",
  numbers: "🔢", shape: "🔷", light: "💡", shadow: "🌑", energy: "⚡", magnet: "🧲",
};

/** Category-name → emoji, used when building drag-sort buckets. */
export const CATEGORY_EMOJI: Record<string, string> = {
  plant: "🌱", plants: "🌱", animal: "🐾", animals: "🐾", food: "🍎", fruit: "🍎",
  fruits: "🍎", vegetable: "🥕", vegetables: "🥕", bird: "🐦", birds: "🐦",
  transport: "🚗", clothes: "👕", body: "🧍", water: "💧", home: "🏠", homes: "🏠",
  living: "🐾", nonliving: "🪨", wild: "🦁", domestic: "🐄", tame: "🐄",
};

const DEFAULT_EMOJI = "⭐";

export function emojiFor(word: string): string {
  const key = word.trim().toLowerCase().replace(/[^a-z]/g, "");
  return WORD_EMOJI[key] ?? CATEGORY_EMOJI[key] ?? DEFAULT_EMOJI;
}

export function hasEmoji(word: string): boolean {
  const key = word.trim().toLowerCase().replace(/[^a-z]/g, "");
  return Boolean(WORD_EMOJI[key]);
}

/** Coarse semantic category for lexicon words — powers deterministic drag-sort buckets. */
export interface WordCategory {
  cat: string;
  label: string;
  emoji: string;
}

const CAT_PLANT: WordCategory = { cat: "plant", label: "Plants", emoji: "🌱" };
const CAT_ANIMAL: WordCategory = { cat: "animal", label: "Animals", emoji: "🐾" };
const CAT_FOOD: WordCategory = { cat: "food", label: "Food", emoji: "🍎" };
const CAT_BODY: WordCategory = { cat: "body", label: "Body", emoji: "🧍" };
const CAT_TRANSPORT: WordCategory = { cat: "transport", label: "Transport", emoji: "🚗" };
const CAT_HOME: WordCategory = { cat: "home", label: "Home", emoji: "🏠" };
const CAT_SKY: WordCategory = { cat: "sky", label: "Sky & Space", emoji: "🌤️" };
const CAT_WATER: WordCategory = { cat: "water", label: "Water & Earth", emoji: "💧" };

export const WORD_CATEGORY: Record<string, WordCategory> = {
  tree: CAT_PLANT, trees: CAT_PLANT, leaf: CAT_PLANT, leaves: CAT_PLANT,
  flower: CAT_PLANT, flowers: CAT_PLANT, root: CAT_PLANT, stem: CAT_PLANT,
  seed: CAT_PLANT, grass: CAT_PLANT, plant: CAT_PLANT, forest: CAT_PLANT,
  dog: CAT_ANIMAL, cat: CAT_ANIMAL, cow: CAT_ANIMAL, goat: CAT_ANIMAL,
  sheep: CAT_ANIMAL, hen: CAT_ANIMAL, bird: CAT_ANIMAL, fish: CAT_ANIMAL,
  frog: CAT_ANIMAL, lion: CAT_ANIMAL, tiger: CAT_ANIMAL, elephant: CAT_ANIMAL,
  monkey: CAT_ANIMAL, horse: CAT_ANIMAL, rabbit: CAT_ANIMAL, snake: CAT_ANIMAL,
  bee: CAT_ANIMAL, butterfly: CAT_ANIMAL, ant: CAT_ANIMAL, duck: CAT_ANIMAL, pig: CAT_ANIMAL,
  milk: CAT_FOOD, rice: CAT_FOOD, bread: CAT_FOOD, egg: CAT_FOOD, apple: CAT_FOOD,
  banana: CAT_FOOD, mango: CAT_FOOD, carrot: CAT_FOOD, potato: CAT_FOOD, honey: CAT_FOOD,
  bone: CAT_BODY, bones: CAT_BODY, muscle: CAT_BODY, teeth: CAT_BODY, tooth: CAT_BODY,
  eye: CAT_BODY, ear: CAT_BODY, nose: CAT_BODY, hand: CAT_BODY, brain: CAT_BODY, heart: CAT_BODY,
  car: CAT_TRANSPORT, bus: CAT_TRANSPORT, train: CAT_TRANSPORT, boat: CAT_TRANSPORT,
  ship: CAT_TRANSPORT, plane: CAT_TRANSPORT, aeroplane: CAT_TRANSPORT, cycle: CAT_TRANSPORT,
  bicycle: CAT_TRANSPORT, truck: CAT_TRANSPORT, rocket: CAT_TRANSPORT,
  house: CAT_HOME, home: CAT_HOME, bed: CAT_HOME, chair: CAT_HOME, table: CAT_HOME, door: CAT_HOME,
  moon: CAT_SKY, star: CAT_SKY, stars: CAT_SKY, cloud: CAT_SKY, sun: CAT_SKY, sky: CAT_SKY,
  water: CAT_WATER, river: CAT_WATER, sea: CAT_WATER, ocean: CAT_WATER, rock: CAT_WATER,
  mountain: CAT_WATER, earth: CAT_WATER,
};

export function categoryFor(word: string): WordCategory | null {
  const key = word.trim().toLowerCase().replace(/[^a-z]/g, "");
  return WORD_CATEGORY[key] ?? null;
}

/** Common English stopwords to ignore when pulling keywords. */
export const STOPWORDS = new Set<string>([
  "the", "a", "an", "and", "or", "but", "if", "of", "to", "in", "on", "at", "for",
  "with", "as", "by", "from", "is", "are", "was", "were", "be", "been", "being",
  "it", "its", "this", "that", "these", "those", "they", "them", "their", "we",
  "our", "you", "your", "he", "she", "his", "her", "him", "i", "me", "my", "can",
  "will", "would", "should", "could", "do", "does", "did", "has", "have", "had",
  "not", "no", "yes", "so", "than", "then", "there", "here", "when", "where",
  "which", "who", "what", "why", "how", "all", "some", "any", "each", "every",
  "many", "much", "more", "most", "other", "into", "out", "up", "down", "over",
  "under", "again", "also", "very", "too", "only", "just", "like", "make", "makes",
  "made", "get", "got", "use", "used", "using", "one", "two", "three", "called",
  "call", "us", "about", "because", "while", "such", "own", "same", "also",
]);
