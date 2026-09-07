import type { CurriculumSection, GameConfig } from "../../types";
import { plantsGames } from "./plants";
import { animalsGames } from "./animals";
import { aboutMeGames } from "./aboutMe";
import { othersGames } from "./others";
import { foodGames } from "./food";
import { waterGames } from "./water";
import { shelterGames } from "./shelter";
import { clothingGames } from "./clothing";
import { airGames } from "./air";
import { healthSafetyGames } from "./healthSafety";
import { neighbourhoodGames } from "./neighbourhood";
import { transportGames } from "./transport";
import { communicationGames } from "./communication";
import { sunMoonStarsGames } from "./sunMoonStars";
import { timeSpaceDirectionGames } from "./timeSpaceDirection";
import { computerSections, computersGames } from "./computers";
import { adventureGamesByZone } from "./adventures";

function withAdventures(zoneId: string, games: GameConfig[]): GameConfig[] {
  const extras = adventureGamesByZone[zoneId] ?? [];
  return [...games, ...extras];
}

export const allEvsGames: Record<string, GameConfig[]> = {
  plants: withAdventures("plants", plantsGames),
  animals: withAdventures("animals", animalsGames),
  "about-me": withAdventures("about-me", aboutMeGames),
  "others-in-my-world": withAdventures("others-in-my-world", othersGames),
  food: withAdventures("food", foodGames),
  water: withAdventures("water", waterGames),
  shelter: withAdventures("shelter", shelterGames),
  clothing: withAdventures("clothing", clothingGames),
  air: withAdventures("air", airGames),
  "health-safety": withAdventures("health-safety", healthSafetyGames),
  neighbourhood: withAdventures("neighbourhood", neighbourhoodGames),
  transport: withAdventures("transport", transportGames),
  communication: withAdventures("communication", communicationGames),
  "sun-moon-stars": withAdventures("sun-moon-stars", sunMoonStarsGames),
  "time-space-direction": withAdventures("time-space-direction", timeSpaceDirectionGames),
  computers: withAdventures("computers", computersGames),
};

export function getGamesForZone(zoneId: string): GameConfig[] {
  return allEvsGames[zoneId] ?? [];
}

const curriculumSectionsByZone: Record<string, CurriculumSection[]> = {
  computers: computerSections,
};

export function getCurriculumSectionsForZone(zoneId: string): CurriculumSection[] {
  return curriculumSectionsByZone[zoneId] ?? [];
}

export {
  plantsGames,
  animalsGames,
  aboutMeGames,
  othersGames,
  foodGames,
  waterGames,
  shelterGames,
  clothingGames,
  airGames,
  healthSafetyGames,
  neighbourhoodGames,
  transportGames,
  communicationGames,
  sunMoonStarsGames,
  timeSpaceDirectionGames,
  computersGames,
};
