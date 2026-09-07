import type { CurriculumSection } from "../../../types";
import { quiz, truths } from "./helpers";

export const worksheetOneSection: CurriculumSection = {
  metadata: {
    id: "worksheet-one",
    title: "Computer Jobs 1",
    emoji: "⚙️",
    order: 4,
    sourceLabel: "Lesson 1 Worksheet 1",
    totalSourceItems: 6,
  },
  entries: [
    quiz(
      { id: "computers-ws1-device-quiz", title: "Working Computer Quiz", description: "Choose the right job for each computer device.", sourceItemIds: [1, 2, 3, 4] },
      [
        { prompt: "An instruction given to a computer is called _____.", choices: [["input", "⌨️"], ["output", "🖥️"], ["processing", "⚙️"]], answerIndex: 0, explanation: "The worksheet's answer is input." },
        { prompt: "CPU is the main _____ device.", choices: [["processing", "⚙️"], ["input", "⌨️"], ["output", "🖥️"]], answerIndex: 0, explanation: "The CPU processes data." },
        { prompt: "A keyboard is an _____ device.", choices: [["input", "⌨️"], ["processing", "⚙️"], ["output", "🖥️"]], answerIndex: 0, explanation: "A keyboard sends letters and numbers into the computer." },
        { prompt: "A scanner is an _____ device.", choices: [["input", "📠"], ["processing", "⚙️"], ["output", "🖥️"]], answerIndex: 0, explanation: "A scanner sends a picture or document into the computer." },
      ],
    ),
    truths(
      { id: "computers-ws1-fact-boss", title: "Computer Jobs 1 Challenge", description: "Recap input, processing, output and storage.", sourceItemIds: [1, 2, 3, 4, 5, 6], role: "challenge" },
      [
        { statement: "An instruction given to a computer is input.", isTrue: true, explanation: "Input is what we give to a computer.", emoji: "⌨️" },
        { statement: "The CPU is the main processing device.", isTrue: true, explanation: "The CPU processes data.", emoji: "🧠" },
        { statement: "A keyboard and scanner are input devices.", isTrue: true, explanation: "Both send information into the computer.", emoji: "📠" },
        { statement: "A pen drive is a storage device.", isTrue: true, explanation: "A pen drive stores digital files and data.", emoji: "💾" },
        { statement: "A monitor is an input device.", isTrue: false, explanation: "A monitor shows results, so it is an output device.", emoji: "🖥️" },
      ],
    ),
  ],
};
