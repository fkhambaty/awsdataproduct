import assert from "node:assert/strict";
import test from "node:test";
import { countGameItems } from "../../lesson/rulesEngine";
import { computerSections, computersGames } from "./computers";
import { getCurriculumSectionsForZone } from "./index";

test("Computer Lab has seven ordered folders and 98 source items", () => {
  assert.equal(computerSections.length, 7);
  assert.equal(new Set(computerSections.map((section) => section.metadata.id)).size, 7);
  assert.deepEqual(
    computerSections.map((section) => section.metadata.order),
    [1, 2, 3, 4, 5, 6, 7],
  );
  assert.equal(
    computerSections.reduce((sum, section) => sum + section.metadata.totalSourceItems, 0),
    98,
  );
});

test("the catalog is the single source for flat registry order and grouping", () => {
  const catalogGames = computerSections.flatMap((section) =>
    section.entries.map((entry) => entry.game),
  );
  assert.deepEqual(computersGames, catalogGames);
  assert.deepEqual(
    computersGames.map((game) => game.id),
    catalogGames.map((game) => game.id),
  );
  assert.equal(getCurriculumSectionsForZone("computers"), computerSections);
  assert.deepEqual(getCurriculumSectionsForZone("plants"), []);
});

test("every source item is covered and each folder has one final challenge", () => {
  for (const section of computerSections) {
    assert.ok(section.entries.length > 0, `${section.metadata.id} has no games`);
    const covered = new Set(section.entries.flatMap((entry) => entry.sourceItemIds));
    const expected = Array.from(
      { length: section.metadata.totalSourceItems },
      (_, index) => index + 1,
    );
    assert.deepEqual(
      [...covered].sort((a, b) => a - b),
      expected,
      `${section.metadata.id} coverage mismatch`,
    );
    assert.equal(
      section.entries.filter((entry) => entry.role === "challenge").length,
      1,
      `${section.metadata.id} must have exactly one final challenge`,
    );
    assert.equal(
      section.entries.at(-1)?.role,
      "challenge",
      `${section.metadata.id} challenge must be last`,
    );
  }
});

test("computer games have stable IDs and valid answer structures", () => {
  assert.equal(new Set(computersGames.map((game) => game.id)).size, computersGames.length);

  for (const section of computerSections) {
    for (const { game, sourceItemIds } of section.entries) {
      assert.equal(game.zoneId, "computers");
      assert.ok(sourceItemIds.length > 0);
      assert.ok(countGameItems(game) > 0, `${game.id} has no playable items`);

      switch (game.data.type) {
        case "picture_quiz":
          for (const question of game.data.questions) {
            assert.ok(question.options.some((option) => option.id === question.correctId));
            assert.equal(new Set(question.options.map((option) => option.id)).size, question.options.length);
            assert.ok(question.explanation.trim());
          }
          break;
        case "true_false":
          for (const question of game.data.questions) assert.ok(question.explanation.trim());
          break;
        case "drag_sort": {
          assert.ok(game.data.categories.length > 0);
          const categories = new Set(game.data.categories.map((category) => category.id));
          for (const item of game.data.items) assert.ok(categories.has(item.category));
          for (const category of categories) {
            assert.ok(
              game.data.items.some((item) => item.category === category),
              `${game.id} has empty category ${category}`,
            );
          }
          break;
        }
        case "sequence_builder":
          assert.deepEqual(
            game.data.steps.map((step) => step.order),
            game.data.steps.map((_, index) => index + 1),
          );
          break;
        case "pixi_lab":
          assert.equal(game.data.mode, "word_unscramble");
          break;
        case "memory_match":
        case "spot_difference":
        case "odd_one_out":
        case "color_activity":
        case "word_picture_link":
        case "interactive_story":
        case "bubble_pop":
        case "star_catcher":
          break;
        default: {
          const exhaustive: never = game.data;
          return exhaustive;
        }
      }
    }
  }
});

test("corrected worksheet facts and sorter categories remain source-faithful", () => {
  const robotBoss = computersGames.find((game) => game.id === "computers-ai-ws-boss");
  assert.equal(robotBoss?.data.type, "true_false");
  if (robotBoss?.data.type === "true_false") {
    const itemFive = robotBoss.data.questions[4];
    assert.equal(itemFive.statement, "A robot is not an example of AI.");
    assert.equal(itemFive.isTrue, false);
  }

  const termSorter = computersGames.find((game) => game.id === "computers-term-device-sort");
  assert.equal(termSorter?.data.type, "drag_sort");
  if (termSorter?.data.type === "drag_sort") {
    assert.deepEqual(termSorter.data.categories.map((category) => category.label), ["Input", "Output"]);
  }

  const termTruths = computersGames.find((game) => game.id === "computers-term-true-false");
  assert.equal(termTruths?.data.type, "true_false");
  if (termTruths?.data.type === "true_false") {
    assert.equal(termTruths.data.questions[1].statement, "AI helps a smart door know when someone is near.");
  }

  const termChallenge = computerSections[0].entries.find((entry) => entry.role === "challenge");
  assert.deepEqual(
    [...(termChallenge?.sourceItemIds ?? [])].sort((a, b) => a - b),
    Array.from({ length: 23 }, (_, index) => index + 1),
  );
  assert.equal(termChallenge?.game.data.type, "picture_quiz");
  if (termChallenge?.game.data.type === "picture_quiz") {
    assert.ok(termChallenge.game.data.questions.length >= 10);
  }
});
