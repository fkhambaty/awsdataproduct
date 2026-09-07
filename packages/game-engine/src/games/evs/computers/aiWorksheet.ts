import type { CurriculumSection } from "../../../types";
import { quiz, truths } from "./helpers";

export const aiWorksheetSection: CurriculumSection = {
  metadata: {
    id: "ai-worksheet",
    title: "AI Challenge",
    emoji: "✨",
    order: 7,
    sourceLabel: "Lesson 3: Learning with AI Worksheet 1",
    totalSourceItems: 5,
  },
  entries: [
    quiz(
      { id: "computers-ai-ws-fill-ups", title: "AI Word Bank", description: "Complete three AI sentences.", sourceItemIds: [1, 2, 3] },
      [
        { prompt: "AI makes machines _____.", choices: [["smart", "💡"], ["sleepy", "😴"], ["hungry", "🍽️"]], answerIndex: 0, explanation: "The word-bank answer is smart." },
        { prompt: "The worksheet says AI can do some things like _____.", choices: [["humans", "🧑"], ["rocks", "🪨"], ["pencils", "✏️"]], answerIndex: 0, explanation: "The word-bank answer is humans." },
        { prompt: "A smart speaker is an example of _____ Intelligence.", choices: [["Artificial", "🤖"], ["Animal", "🐾"], ["Artistic", "🎨"]], answerIndex: 0, explanation: "AI means Artificial Intelligence." },
      ],
    ),
    truths(
      { id: "computers-ai-ws-boss", title: "AI Challenge", description: "Recap all the worksheet's AI ideas.", sourceItemIds: [1, 2, 3, 4, 5], role: "challenge" },
      [
        { statement: "AI makes machines smart in this lesson.", isTrue: true, explanation: "That is the worksheet's word-bank answer.", emoji: "💡" },
        { statement: "The worksheet says AI can do some things like humans.", isTrue: true, explanation: "That is the worksheet's completed sentence.", emoji: "🧑" },
        { statement: "A smart speaker is an example of Artificial Intelligence.", isTrue: true, explanation: "That is the worksheet's AI example.", emoji: "🔊" },
        { statement: "Smart machines can learn, think and work in human-like ways.", isTrue: true, explanation: "This is the true statement expected by the worksheet.", emoji: "🧠" },
        { statement: "A robot is not an example of AI.", isTrue: false, explanation: "The worksheet treats a robot as AI. In real life, robots may or may not use AI.", emoji: "🤖" },
      ],
    ),
  ],
};
