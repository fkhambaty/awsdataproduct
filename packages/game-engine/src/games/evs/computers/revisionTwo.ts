import type { CurriculumSection } from "../../../types";
import { ipoCategories, sorter, truths } from "./helpers";

export const revisionTwoSection: CurriculumSection = {
  metadata: {
    id: "revision-two",
    title: "Device Detective",
    emoji: "🔎",
    order: 3,
    sourceLabel: "Computer Revision Worksheet",
    totalSourceItems: 10,
  },
  entries: [
    sorter(
      { id: "computers-revision-device-detective", title: "Device Detective Lab", description: "Sort all six computer pictures by their jobs.", sourceItemIds: [1, 2, 3, 4, 5, 6] },
      ipoCategories,
      [
        { id: "monitor", label: "Monitor", emoji: "🖥️", category: "output" },
        { id: "system-unit", label: "CPU / system unit", emoji: "🧠", category: "process" },
        { id: "mouse", label: "Mouse", emoji: "🖱️", category: "input" },
        { id: "printer", label: "Printer", emoji: "🖨️", category: "output" },
        { id: "speakers", label: "Speakers", emoji: "🔊", category: "output" },
        { id: "keyboard", label: "Keyboard", emoji: "⌨️", category: "input" },
      ],
    ),
    truths(
      { id: "computers-revision-ai-detective", title: "Device & AI Challenge", description: "Recap device jobs and the lesson's AI examples.", sourceItemIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], role: "challenge" },
      [
        { statement: "A keyboard and mouse are input devices.", isTrue: true, explanation: "They send information and choices into the computer.", emoji: "⌨️" },
        { statement: "A monitor, printer and speakers are output devices.", isTrue: true, explanation: "They show, print or play the computer's results.", emoji: "🖥️" },
        { statement: "The CPU processes information.", isTrue: true, explanation: "Processing is the CPU's main job.", emoji: "🧠" },
        { statement: "Alexa, a smart voice helper, uses AI.", isTrue: true, explanation: "Alexa listens and responds using AI.", emoji: "🔊" },
        { statement: "A normal eraser uses AI by itself.", isTrue: false, explanation: "An eraser has no computer or AI system.", emoji: "🧽" },
        { statement: "A tree uses AI by itself.", isTrue: false, explanation: "A tree is living, but it is not an AI machine.", emoji: "🌳" },
        { statement: "The worksheet marks the smart phone as using AI.", isTrue: true, explanation: "The worksheet marks the smart phone as using AI.", emoji: "📱" },
      ],
    ),
  ],
};
