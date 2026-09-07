import type { CurriculumSection } from "../../../types";
import { quiz, truths } from "./helpers";

export const aiNotesSection: CurriculumSection = {
  metadata: {
    id: "ai-notes",
    title: "AI Smart Notes",
    emoji: "🤖",
    order: 5,
    sourceLabel: "Lesson 3: Learn with AI Notes",
    totalSourceItems: 6,
  },
  entries: [
    truths(
      { id: "computers-ai-notes-facts", title: "AI Helper Facts", description: "Check two smart-machine facts.", sourceItemIds: [1, 2] },
      [
        { statement: "A smart vacuum cleaner helps clean the floor.", isTrue: true, explanation: "That is the completed fact in the notes.", emoji: "🧹" },
        { statement: "In this lesson, the smart door uses smart technology to work.", isTrue: true, explanation: "The lesson describes a sensor helping its smart door work.", emoji: "🚪" },
      ],
    ),
    quiz(
      { id: "computers-ai-notes-boss", title: "AI Notes Challenge", description: "Recap every smart-machine idea from the notes.", sourceItemIds: [1, 2, 3, 4, 5, 6], role: "challenge" },
      [
        { prompt: "What does AI mean?", choices: [["Artificial Intelligence", "🤖"], ["Automatic Input", "⌨️"], ["Animal Internet", "🐾"]], answerIndex: 0, explanation: "AI means Artificial Intelligence." },
        { prompt: "What does AI do in this lesson?", choices: [["Makes machines smart", "💡"], ["Makes paper wet", "💧"], ["Turns off every device", "⛔"]], answerIndex: 0, explanation: "The notes say AI makes machines smart." },
        { prompt: "In this lesson, how does the smart door work?", choices: [["A sensor detects people and opens it", "📡"], ["A printer pulls it open", "🖨️"], ["A book moves it", "📕"]], answerIndex: 0, explanation: "In this lesson, its sensor detects a person before the door opens." },
        { prompt: "How can AI work like us in this lesson?", choices: [["It can learn and think", "🧠"], ["It eats breakfast", "🥣"], ["It grows like a tree", "🌳"]], answerIndex: 0, explanation: "The notes say AI can learn, think and work like humans." },
        { prompt: "Which smart machine helps clean a floor?", choices: [["Smart vacuum cleaner", "🧹"], ["Printer", "🖨️"], ["Projector", "📽️"]], answerIndex: 0, explanation: "A smart vacuum cleaner helps clean the floor." },
      ],
    ),
  ],
};
