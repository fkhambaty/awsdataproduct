import type {
  CurriculumEntryRole,
  CurriculumSection,
  DragSortData,
  GameConfig,
  PictureQuizQuestion,
  SequenceStep,
  TrueFalseQuestion,
} from "../../../types";

export type CurriculumEntry = CurriculumSection["entries"][number];
export type Choice = readonly [label: string, emoji: string];
export type QuizSeed = {
  prompt: string;
  choices: readonly Choice[];
  answerIndex: number;
  explanation: string;
};
export type TruthSeed = {
  statement: string;
  isTrue: boolean;
  explanation: string;
  emoji: string;
};

type EntryOptions = {
  id: string;
  title: string;
  description: string;
  sourceItemIds: number[];
  role?: CurriculumEntryRole;
};

function entry(game: GameConfig, sourceItemIds: number[], role: CurriculumEntryRole): CurriculumEntry {
  return { game, sourceItemIds, role };
}

function baseGame(
  options: EntryOptions,
  type: GameConfig["type"],
  data: GameConfig["data"],
): CurriculumEntry {
  const role = options.role ?? "practice";
  return entry(
    {
      id: options.id,
      zoneId: "computers",
      type,
      title: options.title,
      description: options.description,
      difficulty: role === "challenge" ? 2 : 1,
      maxStars: 3,
      data,
    },
    options.sourceItemIds,
    role,
  );
}

export function quiz(options: EntryOptions, seeds: QuizSeed[]): CurriculumEntry {
  const questions: PictureQuizQuestion[] = seeds.map((seed, questionIndex) => ({
    id: `${options.id}-q${questionIndex + 1}`,
    question: seed.prompt,
    options: seed.choices.map(([label, emoji], optionIndex) => ({
      id: `${options.id}-q${questionIndex + 1}-o${optionIndex + 1}`,
      label,
      emoji,
    })),
    correctId: `${options.id}-q${questionIndex + 1}-o${seed.answerIndex + 1}`,
    explanation: seed.explanation,
  }));

  return baseGame(options, "picture_quiz", {
    type: "picture_quiz",
    instruction: "Choose the best answer. You can do it!",
    questions,
  });
}

export function truths(options: EntryOptions, seeds: TruthSeed[]): CurriculumEntry {
  const questions: TrueFalseQuestion[] = seeds.map((seed, index) => ({
    id: `${options.id}-q${index + 1}`,
    statement: seed.statement,
    isTrue: seed.isTrue,
    explanation: seed.explanation,
    emoji: seed.emoji,
  }));

  return baseGame(options, "true_false", {
    type: "true_false",
    instruction: "Is each computer fact true or false?",
    questions,
  });
}

export function sorter(
  options: EntryOptions,
  categories: DragSortData["categories"],
  items: DragSortData["items"],
): CurriculumEntry {
  return baseGame(options, "drag_sort", {
    type: "drag_sort",
    instruction: "Pick up each card, then tap its correct group.",
    categories,
    items,
  });
}

export function sequence(options: EntryOptions, steps: SequenceStep[]): CurriculumEntry {
  return baseGame(options, "sequence_builder", {
    type: "sequence_builder",
    instruction: "Put the computer steps in the correct order.",
    steps,
  });
}

export function wordUnscramble(
  options: EntryOptions,
  rounds: { id: string; emoji: string; word: string }[],
): CurriculumEntry {
  return baseGame(options, "pixi_lab", {
    type: "pixi_lab",
    mode: "word_unscramble",
    instruction: "Drag the letters into place to build each computer word!",
    rounds,
  });
}

export const ipoCategories: DragSortData["categories"] = [
  { id: "input", label: "Input", emoji: "⌨️" },
  { id: "process", label: "Processing", emoji: "🧠" },
  { id: "output", label: "Output", emoji: "🖥️" },
];
