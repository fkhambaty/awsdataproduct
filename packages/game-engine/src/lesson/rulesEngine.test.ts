import assert from "node:assert/strict";
import test from "node:test";
import type { GameConfig } from "../types";
import {
  assessOcrPageQuality,
  buildLessonQualityMetrics,
  cleanLessonText,
  generateLesson,
} from "../index";

const FACTUAL_PAGE = `
Plants need sunlight, clean water, fresh air, and healthy soil to grow.
Roots absorb water from the soil and hold the plant firmly.
Leaves prepare food for the plant using sunlight and air.
Flowers make seeds that can grow into new plants.
Farmers water plants and protect them from harmful insects.
`;

function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function assertGameAnswersAreValid(game: GameConfig): void {
  switch (game.data.type) {
    case "picture_quiz":
      for (const question of game.data.questions) {
        assert.ok(question.options.length >= 2);
        assert.ok(question.options.some((option) => option.id === question.correctId));
      }
      return;
    case "true_false":
      for (const question of game.data.questions) assert.ok(question.statement.trim());
      return;
    case "drag_sort": {
      const categories = new Set(game.data.categories.map((category) => category.id));
      for (const item of game.data.items) assert.ok(categories.has(item.category));
      return;
    }
    case "memory_match":
      assert.ok(game.data.pairs.length >= 3);
      return;
    case "word_picture_link":
      assert.ok(game.data.pairs.length >= 3);
      return;
    case "sequence_builder":
      assert.deepEqual(
        game.data.steps.map((step) => step.order),
        game.data.steps.map((_, index) => index + 1),
      );
      return;
    case "spot_difference":
    case "odd_one_out":
    case "color_activity":
    case "interactive_story":
    case "bubble_pop":
    case "star_catcher":
    case "pixi_lab":
      return;
    default: {
      const exhaustive: never = game.data;
      return exhaustive;
    }
  }
}

test("cleanLessonText removes OCR symbol noise but keeps factual lines", () => {
  const cleaned = cleanLessonText(`© [BS] ~~\nPlants need water and sunlight to grow.\n@@@\nRoots hold a plant in the soil.`);
  assert.match(cleaned, /Plants need water and sunlight to grow/);
  assert.match(cleaned, /Roots hold a plant in the soil/);
  assert.doesNotMatch(cleaned, /©|@@@|\[BS\]/);
});

test("the same seed produces the same generated lesson", () => {
  const first = generateLesson(FACTUAL_PAGE, {
    idPrefix: "eval-page",
    random: seededRandom(42),
  });
  const second = generateLesson(FACTUAL_PAGE, {
    idPrefix: "eval-page",
    random: seededRandom(42),
  });

  assert.deepEqual(first, second);
  assert.ok(first.games.length > 0);
});

test("weak input returns warnings instead of invalid games", () => {
  const lesson = generateLesson("Plants.", {
    idPrefix: "weak-page",
    random: seededRandom(1),
  });

  assert.equal(lesson.games.length, 0);
  assert.equal(lesson.warnings.length, 6);
});

test("generated games have valid answer structures and useful metrics", () => {
  const lesson = generateLesson(FACTUAL_PAGE, {
    idPrefix: "quality-page",
    random: seededRandom(7),
  });
  for (const game of lesson.games) assertGameAnswersAreValid(game);

  const metrics = buildLessonQualityMetrics(FACTUAL_PAGE, lesson);
  assert.equal(metrics.gameCount, lesson.games.length);
  assert.ok(metrics.cleanedCharacterCount < metrics.rawCharacterCount);
  assert.ok(metrics.factCount >= 3);
  assert.ok(metrics.totalItems > 0);
  assert.deepEqual(metrics.generatedGameIds, lesson.games.map((game) => game.id));
});

test("OCR quality gate rejects unreadable and low-confidence pages", () => {
  assert.equal(assessOcrPageQuality({ text: "Too short", confidence: 95 }).ok, false);
  assert.equal(
    assessOcrPageQuality({
      text: "Plants need water sunlight healthy soil fresh air roots leaves flowers seeds.",
      confidence: 50,
    }).ok,
    false,
  );
  assert.equal(
    assessOcrPageQuality({
      text: "Plants need clean water and bright sunlight because healthy roots absorb nutrients from the soil.",
      confidence: 90,
    }).ok,
    true,
  );
});
