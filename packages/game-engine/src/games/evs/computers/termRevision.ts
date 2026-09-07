import type { CurriculumSection } from "../../../types";
import { quiz, sequence, sorter, truths, wordUnscramble } from "./helpers";

const inputOutputCategories = [
  { id: "input", label: "Input", emoji: "⌨️" },
  { id: "output", label: "Output", emoji: "🖥️" },
];

export const termRevisionSection: CurriculumSection = {
  metadata: {
    id: "term-revision",
    title: "First Term Power-Up",
    emoji: "🏆",
    order: 1,
    sourceLabel: "Term I Revision Worksheet",
    totalSourceItems: 23,
  },
  entries: [
    quiz(
      {
        id: "computers-term-quick-quiz",
        title: "Computer Quick Quiz",
        description: "Warm up with CPU, projectors, AI, storage and input.",
        sourceItemIds: [1, 2, 6, 8, 9, 15, 16, 17, 18],
      },
      [
        { prompt: "What is the main processing device of a computer?", choices: [["CPU", "🧠"], ["Keyboard", "⌨️"], ["Monitor", "🖥️"]], answerIndex: 0, explanation: "The CPU is the computer's main processing device." },
        { prompt: "Which output device can show a presentation to a whole auditorium?", choices: [["Projector", "📽️"], ["Joystick", "🕹️"], ["Scanner", "📠"]], answerIndex: 0, explanation: "A projector shows the computer's picture on a large screen." },
        { prompt: "AI can _____, think and work like humans.", choices: [["learn", "🧠"], ["sleep", "😴"], ["eat", "🍎"]], answerIndex: 0, explanation: "The lesson says AI can learn, think and work like humans." },
        { prompt: "Which device prints your work on paper?", choices: [["Printer", "🖨️"], ["Mouse", "🖱️"], ["Speaker", "🔊"]], answerIndex: 0, explanation: "A printer makes a paper copy of computer work." },
        { prompt: "I am the main processing device. Who am I?", choices: [["CPU", "🧠"], ["Pen drive", "💾"], ["Projector", "📽️"]], answerIndex: 0, explanation: "CPU is the answer because it processes the computer's data." },
        { prompt: "A pen drive can store _____.", choices: [["a large amount of data", "💾"], ["only one letter", "✉️"], ["water", "💧"]], answerIndex: 0, explanation: "A pen drive stores a large amount of digital data." },
        { prompt: "What does a smart vacuum cleaner help do?", choices: [["Clean the floor", "🧹"], ["Print posters", "🖨️"], ["Water plants", "🌱"]], answerIndex: 0, explanation: "A smart vacuum cleaner moves around to help clean the floor." },
        { prompt: "What is input?", choices: [["What we give to a computer", "⌨️"], ["The result from a computer", "🖥️"], ["A paper printout", "📄"]], answerIndex: 0, explanation: "Input is the information or instruction we give to a computer." },
        { prompt: "What does AI do in this lesson?", choices: [["Makes machines smart", "🤖"], ["Turns books into food", "📚"], ["Stops all computers", "⛔"]], answerIndex: 0, explanation: "In this lesson, Artificial Intelligence helps machines do smart tasks." },
      ],
    ),
    sorter(
      {
        id: "computers-term-device-sort",
        title: "Device Sorting Lab",
        description: "Sort each device by the job it does.",
        sourceItemIds: [3, 4, 5],
      },
      inputOutputCategories,
      [
        { id: "monitor", label: "Monitor", emoji: "🖥️", category: "output" },
        { id: "printer", label: "Printer", emoji: "🖨️", category: "output" },
        { id: "scanner", label: "Scanner", emoji: "📠", category: "input" },
      ],
    ),
    truths(
      {
        id: "computers-term-true-false",
        title: "Smart or Not?",
        description: "Check device and AI facts.",
        sourceItemIds: [10, 11, 12, 13, 14],
      },
      [
        { statement: "A mouse is an output device.", isTrue: false, explanation: "A mouse sends our clicks to the computer, so it is an input device.", emoji: "🖱️" },
        { statement: "AI helps a smart door know when someone is near.", isTrue: true, explanation: "The worksheet marks this AI fact as true.", emoji: "🚪" },
        { statement: "The worksheet marks the smart phone as using AI.", isTrue: true, explanation: "The worksheet marks the smart phone as using AI.", emoji: "📱" },
        { statement: "A printed book uses AI by itself.", isTrue: false, explanation: "A normal printed book has no computer system or AI inside it.", emoji: "📕" },
        { statement: "A normal door uses AI by itself.", isTrue: false, explanation: "A normal door is opened by a person and has no smart system.", emoji: "🚪" },
      ],
    ),
    sequence(
      {
        id: "computers-term-ipo-cycle",
        title: "Build the IPO Cycle",
        description: "Arrange the three jobs a computer performs.",
        sourceItemIds: [7],
      },
      [
        { id: "input", label: "Input — we give data or instructions", emoji: "⌨️", order: 1 },
        { id: "process", label: "Process — the computer works on it", emoji: "🧠", order: 2 },
        { id: "output", label: "Output — we get the result", emoji: "🖥️", order: 3 },
      ],
    ),
    wordUnscramble(
      {
        id: "computers-term-word-grid",
        title: "Computer Word Grid",
        description: "Unscramble five useful computer words.",
        sourceItemIds: [19, 20, 21, 22, 23],
      },
      [
        { id: "drive", emoji: "💾", word: "DRIVE" },
        { id: "memory", emoji: "🧠", word: "MEMORY" },
        { id: "process", emoji: "⚙️", word: "PROCESS" },
        { id: "input", emoji: "⌨️", word: "INPUT" },
        { id: "device", emoji: "💻", word: "DEVICE" },
      ],
    ),
    quiz(
      {
        id: "computers-term-recap-challenge",
        title: "First Term Challenge",
        description: "Bring every computer skill together.",
        sourceItemIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
        role: "challenge",
      },
      [
        { prompt: "Which device does the computer's main processing?", choices: [["CPU", "🧠"], ["Monitor", "🖥️"], ["Scanner", "📠"]], answerIndex: 0, explanation: "The CPU is the main processing device." },
        { prompt: "Which output device shows a presentation to a whole auditorium?", choices: [["Projector", "📽️"], ["Joystick", "🕹️"], ["Scanner", "📠"]], answerIndex: 0, explanation: "A projector makes the computer picture large for everyone to see." },
        { prompt: "Which pair has one input and one output device?", choices: [["Scanner and printer", "💻"], ["Monitor and printer", "🖥️"], ["Mouse and scanner", "🖱️"]], answerIndex: 0, explanation: "A scanner gives input and a printer gives output." },
        { prompt: "AI can _____, think and work like humans.", choices: [["learn", "🧠"], ["sleep", "😴"], ["eat", "🍎"]], answerIndex: 0, explanation: "The worksheet's missing word is “learn.”" },
        { prompt: "What is the correct computer work cycle?", choices: [["Input, Process, Output", "🔁"], ["Output, Input, Sleep", "😴"], ["Process, Eat, Input", "🍎"]], answerIndex: 0, explanation: "A computer follows the Input–Process–Output cycle." },
        { prompt: "Which sentence about a mouse is correct?", choices: [["It is an input device", "🖱️"], ["It is an output device", "🖥️"], ["It prints on paper", "🖨️"]], answerIndex: 0, explanation: "A mouse sends our clicks into the computer." },
        { prompt: "Which line matches the worksheet's AI pictures?", choices: [["Smart phone: yes; book and normal door: no", "📱"], ["Book: yes; smart phone: no", "📕"], ["Normal door: yes; book: yes", "🚪"]], answerIndex: 0, explanation: "The worksheet marks only the smart phone as using AI." },
        { prompt: "Which pair of facts is correct?", choices: [["Pen drive stores data; smart vacuum cleans floors", "💾"], ["Pen drive prints; smart vacuum stores books", "🖨️"], ["Pen drive cleans; smart vacuum projects slides", "📽️"]], answerIndex: 0, explanation: "A pen drive stores data, and a smart vacuum helps clean the floor." },
        { prompt: "What is input?", choices: [["What we give to a computer", "⌨️"], ["Only the result we get", "🖥️"], ["A printed poster", "📄"]], answerIndex: 0, explanation: "Input is what we give to the computer." },
        { prompt: "What does AI do in this worksheet?", choices: [["Helps make machines smart", "🤖"], ["Makes every door smart", "🚪"], ["Turns books into computers", "📕"]], answerIndex: 0, explanation: "The worksheet says AI helps make machines smart." },
        { prompt: "Which row contains only words from the word grid?", choices: [["DRIVE, MEMORY, PROCESS, INPUT, DEVICE", "🔤"], ["MOUSE, PRINTER, BOOK, DOOR, FLOOR", "🖱️"], ["SMART, ROBOT, SENSOR, PHONE, AI", "🤖"]], answerIndex: 0, explanation: "Those are the five words hidden in the worksheet grid." },
      ],
    ),
  ],
};
