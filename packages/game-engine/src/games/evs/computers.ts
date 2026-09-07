import type { CurriculumSection, GameConfig } from "../../types";
import { aiNotesSection } from "./computers/aiNotes";
import { aiWorksheetSection } from "./computers/aiWorksheet";
import { combinedNotesSection } from "./computers/combinedNotes";
import { revisionTwoSection } from "./computers/revisionTwo";
import { termRevisionSection } from "./computers/termRevision";
import { worksheetOneSection } from "./computers/worksheetOne";
import { worksheetTwoSection } from "./computers/worksheetTwo";

/** Ordered Computer Lab layout and the single source of runtime grouping metadata. */
export const computerSections: CurriculumSection[] = [
  termRevisionSection,
  combinedNotesSection,
  revisionTwoSection,
  worksheetOneSection,
  aiNotesSection,
  worksheetTwoSection,
  aiWorksheetSection,
];

/** Flat compatibility view used by the existing zone game registry. */
export const computersGames: GameConfig[] = computerSections.flatMap((section) =>
  section.entries.map((entry) => entry.game),
);
