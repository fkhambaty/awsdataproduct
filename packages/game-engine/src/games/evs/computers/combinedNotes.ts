import type { CurriculumSection } from "../../../types";
import { ipoCategories, quiz, sequence, sorter, truths } from "./helpers";

export const combinedNotesSection: CurriculumSection = {
  metadata: {
    id: "combined-notes",
    title: "Computer & AI Mega Notes",
    emoji: "📘",
    order: 2,
    sourceLabel: "Lesson 1 + Lesson 3 Notes",
    totalSourceItems: 42,
  },
  entries: [
    quiz(
      { id: "computers-notes-smart-machines", title: "Smart Machines Recall", description: "Remember the key facts from your notes.", sourceItemIds: [1, 2, 3, 4, 5, 6, 7, 8, 9] },
      [
        { prompt: "What does a smart vacuum cleaner help do?", choices: [["Clean the floor", "🧹"], ["Wash clothes", "👕"], ["Print paper", "🖨️"]], answerIndex: 0, explanation: "The notes say a smart vacuum cleaner helps clean the floor." },
        { prompt: "In this lesson, what helps a smart door work automatically?", choices: [["A sensor and smart technology", "📡"], ["A pencil", "✏️"], ["A paper book", "📕"]], answerIndex: 0, explanation: "In this lesson, the smart door uses a sensor and smart technology." },
        { prompt: "What does computer memory do?", choices: [["Remembers and stores data", "🧠"], ["Makes food", "🍲"], ["Cleans floors", "🧹"]], answerIndex: 0, explanation: "Computer memory remembers and stores data." },
        { prompt: "What can a pen drive store?", choices: [["A large amount of data", "💾"], ["Only air", "🌬️"], ["Only one number", "1️⃣"]], answerIndex: 0, explanation: "A pen drive is a small storage device for lots of data." },
        { prompt: "What are the parts that make up a computer called?", choices: [["Devices", "💻"], ["Vegetables", "🥕"], ["Planets", "🪐"]], answerIndex: 0, explanation: "A computer is made of many parts called devices." },
        { prompt: "What does AI mean?", choices: [["Artificial Intelligence", "🤖"], ["Automatic Internet", "🌐"], ["Animal Ideas", "🐾"]], answerIndex: 0, explanation: "AI is short for Artificial Intelligence." },
        { prompt: "What does AI help machines become in this lesson?", choices: [["Smart", "💡"], ["Hungry", "🍽️"], ["Sleepy", "😴"]], answerIndex: 0, explanation: "The notes say AI makes machines smart." },
        { prompt: "In this lesson, how does a smart door know a person is near?", choices: [["A sensor detects the person", "📡"], ["The door reads a book", "📕"], ["A printer tells it", "🖨️"]], answerIndex: 0, explanation: "In this lesson, a sensor detects a nearby person before the door opens." },
        { prompt: "How can AI work like humans in this lesson?", choices: [["It can learn and think", "🧠"], ["It eats lunch", "🍱"], ["It grows leaves", "🌿"]], answerIndex: 0, explanation: "The notes describe AI as learning, thinking and working like humans." },
      ],
    ),
    sequence(
      { id: "computers-notes-ipo-mission", title: "IPO Builder", description: "Build the computer's three-step work cycle.", sourceItemIds: [10, 23] },
      [
        { id: "input", label: "Input", emoji: "⌨️", order: 1 },
        { id: "process", label: "Process", emoji: "⚙️", order: 2 },
        { id: "output", label: "Output", emoji: "🖥️", order: 3 },
      ],
    ),
    quiz(
      { id: "computers-notes-ipo-meaning", title: "Inside the IPO Cycle", description: "Understand what each IPO step means.", sourceItemIds: [11, 12, 13] },
      [
        { prompt: "What is input?", choices: [["What we give to the computer", "⌨️"], ["The result we get", "🖥️"], ["A storage box", "📦"]], answerIndex: 0, explanation: "Input is the information or instruction we give to a computer." },
        { prompt: "What is output?", choices: [["The result we get from a computer", "🖥️"], ["A click we give", "🖱️"], ["The computer's desk", "🪑"]], answerIndex: 0, explanation: "Output is the result the computer gives us." },
        { prompt: "What happens during processing?", choices: [["The computer works on the input", "⚙️"], ["The computer goes to sleep", "😴"], ["The printer stores water", "💧"]], answerIndex: 0, explanation: "During processing, the computer works on the input." },
      ],
    ),
    quiz(
      { id: "computers-notes-core-quiz", title: "Computer Core Quiz", description: "Master inputs, processing and storage.", sourceItemIds: [14, 15, 16, 17, 18, 19] },
      [
        { prompt: "What is an instruction given to a computer called?", choices: [["Input", "⌨️"], ["Output", "🖥️"], ["Poster", "🪧"]], answerIndex: 0, explanation: "An instruction we give to the computer is input." },
        { prompt: "Which is the main processing device?", choices: [["CPU", "🧠"], ["Mouse", "🖱️"], ["Printer", "🖨️"]], answerIndex: 0, explanation: "The CPU is the computer's main processing device." },
        { prompt: "Which storage device is faster than a hard disk?", choices: [["SSD", "⚡"], ["CD/DVD", "💿"], ["Pen drive", "💾"]], answerIndex: 0, explanation: "The notes identify SSD as the faster storage device." },
        { prompt: "A computer works on which cycle?", choices: [["IPO", "🔁"], ["ABC", "🔤"], ["123", "🔢"]], answerIndex: 0, explanation: "Computers follow the Input–Process–Output cycle." },
        { prompt: "Which device takes input, processes it and sends the result?", choices: [["Processing device", "⚙️"], ["Output-only device", "🖥️"], ["Paper device", "📄"]], answerIndex: 0, explanation: "A processing device works on input and helps produce output." },
        { prompt: "Which device can transfer data to another computer?", choices: [["Pen drive", "💾"], ["Projector", "📽️"], ["Speaker", "🔊"]], answerIndex: 0, explanation: "A pen drive can carry files from one computer to another." },
      ],
    ),
    truths(
      { id: "computers-notes-device-facts", title: "Device Fact Check", description: "Decide whether each device fact is correct.", sourceItemIds: [20, 21, 22] },
      [
        { statement: "A mouse is an output device.", isTrue: false, explanation: "A mouse is an input device because it sends clicks to the computer.", emoji: "🖱️" },
        { statement: "The CPU processes data in a computer.", isTrue: true, explanation: "Processing data is the CPU's main job.", emoji: "🧠" },
        { statement: "A joystick can be used to play games.", isTrue: true, explanation: "A joystick is an input device used to control many games.", emoji: "🕹️" },
      ],
    ),
    sorter(
      { id: "computers-notes-ipo-sort", title: "2 + 5 IPO Lab", description: "Follow one sum through input, process and output.", sourceItemIds: [25, 26, 27] },
      ipoCategories,
      [
        { id: "sum-input", label: "Type 2 + 5 on the keyboard", emoji: "⌨️", category: "input" },
        { id: "sum-process", label: "System unit works out 2 + 5", emoji: "⚙️", category: "process" },
        { id: "sum-output", label: "Monitor shows 7", emoji: "🖥️", category: "output" },
      ],
    ),
    quiz(
      { id: "computers-notes-input-pair", title: "Input Device Pair", description: "Choose two devices that send information in.", sourceItemIds: [24] },
      [{ prompt: "Which pair contains two input devices?", choices: [["Keyboard and mouse", "⌨️"], ["Monitor and printer", "🖥️"], ["Projector and speaker", "📽️"]], answerIndex: 0, explanation: "A keyboard and mouse both send information to the computer." }],
    ),
    quiz(
      { id: "computers-notes-ai-quiz", title: "AI Helper Quiz", description: "Find sensors, smart speakers and helpful AI actions.", sourceItemIds: [28, 29, 30, 31, 32] },
      [
        { prompt: "In this lesson, what helps a smart door know when someone is near?", choices: [["Sensor", "📡"], ["Printer", "🖨️"], ["Pen drive", "💾"]], answerIndex: 0, explanation: "In this lesson, a sensor detects a nearby person." },
        { prompt: "Which one is an example of AI in this lesson?", choices: [["Smart speaker", "🔊"], ["Pencil", "✏️"], ["Book", "📕"]], answerIndex: 0, explanation: "The lesson marks a smart speaker as using AI." },
        { prompt: "AI _____, thinks and works like us.", choices: [["learns", "🧠"], ["sleeps", "😴"], ["jumps", "🤸"]], answerIndex: 0, explanation: "The missing word from the notes is “learns.”" },
        { prompt: "A smart vacuum cleaner helps _____ the floor.", choices: [["clean", "🧹"], ["print", "🖨️"], ["paint", "🎨"]], answerIndex: 0, explanation: "A smart vacuum cleaner helps clean the floor." },
        { prompt: "The notes say AI can talk to us and play _____ with us.", choices: [["games", "🎮"], ["rain", "🌧️"], ["chairs", "🪑"]], answerIndex: 0, explanation: "The missing word on the sheet is “games.”" },
      ],
    ),
    truths(
      { id: "computers-notes-ai-boss", title: "Mega Notes Challenge", description: "Recap computer work, storage, devices and AI.", sourceItemIds: [1, 10, 15, 16, 24, 28, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42], role: "challenge" },
      [
        { statement: "The IPO cycle is Input, Process and Output.", isTrue: true, explanation: "Those are the computer's three work steps.", emoji: "🔁" },
        { statement: "The CPU is the main processing device.", isTrue: true, explanation: "The CPU processes the computer's data.", emoji: "🧠" },
        { statement: "A keyboard and mouse are input devices.", isTrue: true, explanation: "Both send information into the computer.", emoji: "⌨️" },
        { statement: "AI stands for Animal Intelligence.", isTrue: false, explanation: "AI stands for Artificial Intelligence.", emoji: "🔤" },
        { statement: "In this lesson, a smart door uses smart technology and a sensor.", isTrue: true, explanation: "That is how the lesson describes its automatic smart door.", emoji: "🚪" },
        { statement: "AI is smart technology that can help computers learn and think.", isTrue: true, explanation: "That is the child-friendly definition given in the notes.", emoji: "🤖" },
        { statement: "The notes name a smart vacuum cleaner and smart AC as machines that use AI.", isTrue: true, explanation: "Those are the two examples written in the notes.", emoji: "🧹" },
        { statement: "An ordinary door uses AI by itself.", isTrue: false, explanation: "An ordinary door has no smart system by itself.", emoji: "🚪" },
        { statement: "The worksheet marks an automatic smart door as an AI example.", isTrue: true, explanation: "This is the worksheet's classification for the smart door in its lesson.", emoji: "🚪" },
        { statement: "A robot vacuum can use AI.", isTrue: true, explanation: "Some robot vacuums use AI to help move and clean.", emoji: "🤖" },
        { statement: "A smart speaker can use AI.", isTrue: true, explanation: "A smart speaker can listen and respond using AI.", emoji: "🔊" },
        { statement: "A normal chair uses AI by itself.", isTrue: false, explanation: "A normal chair has no computer or AI system.", emoji: "🪑" },
      ],
    ),
  ],
};
