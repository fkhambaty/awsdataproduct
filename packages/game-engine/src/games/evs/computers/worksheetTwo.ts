import type { CurriculumSection } from "../../../types";
import { quiz, truths } from "./helpers";

export const worksheetTwoSection: CurriculumSection = {
  metadata: {
    id: "worksheet-two",
    title: "Computer Jobs 2",
    emoji: "💾",
    order: 6,
    sourceLabel: "Lesson 1 Worksheet 2",
    totalSourceItems: 6,
  },
  entries: [
    quiz(
      { id: "computers-ws2-fill-ups", title: "Storage & Output Quiz", description: "Use the word bank to complete every sentence.", sourceItemIds: [1, 2, 3, 4] },
      [
        { prompt: "_____ stores a large amount of data.", choices: [["Hard disk", "💽"], ["Plotter", "🖨️"], ["Output", "🖥️"]], answerIndex: 0, explanation: "A hard disk stores a large amount of data." },
        { prompt: "The result we get from a computer is called _____.", choices: [["Output", "🖥️"], ["Processing", "⚙️"], ["Hard disk", "💽"]], answerIndex: 0, explanation: "The result from a computer is output." },
        { prompt: "Which special printer makes big pictures and posters?", choices: [["Plotter", "🖨️"], ["Mouse", "🖱️"], ["SSD", "💾"]], answerIndex: 0, explanation: "A plotter prints large pictures and posters." },
        { prompt: "CPU is the main _____ device.", choices: [["processing", "⚙️"], ["input", "⌨️"], ["output", "🖥️"]], answerIndex: 0, explanation: "The CPU is the main processing device." },
      ],
    ),
    truths(
      { id: "computers-ws2-fact-boss", title: "Computer Jobs 2 Challenge", description: "Recap storage, output, processing and the IPO cycle.", sourceItemIds: [1, 2, 3, 4, 5, 6], role: "challenge" },
      [
        { statement: "A hard disk stores a large amount of data.", isTrue: true, explanation: "A hard disk is a storage device.", emoji: "💽" },
        { statement: "Output is the result we get from a computer.", isTrue: true, explanation: "Output is the computer's result.", emoji: "🖥️" },
        { statement: "A plotter can print large pictures and posters.", isTrue: true, explanation: "A plotter is made for large prints.", emoji: "🖨️" },
        { statement: "The CPU is the main processing device.", isTrue: true, explanation: "The CPU processes data.", emoji: "🧠" },
        { statement: "A computer follows the IPO cycle.", isTrue: true, explanation: "IPO means Input, Process and Output.", emoji: "🔁" },
        { statement: "A light pen is an output device.", isTrue: false, explanation: "A light pen sends a choice to the computer, so it is an input device.", emoji: "🖊️" },
      ],
    ),
  ],
};
