import type { ComponentType } from "react";
import type { GameResult, GameType } from "./types";

/** Shared props every template accepts. Data is narrowed by the caller’s game type. */
export type GameTemplateProps = {
  data: unknown;
  onComplete: (result: GameResult) => void;
  accentColor?: string;
  onNextGame?: () => void;
};

export type GameTemplateComponent = ComponentType<GameTemplateProps>;

/**
 * Load one game template (and its deps, e.g. PixiJS) only when that type is played.
 * Static barrel re-exports would pull every template into the play shell chunk.
 */
export async function loadGameTemplate(type: GameType): Promise<GameTemplateComponent> {
  switch (type) {
    case "picture_quiz":
      return (await import("./templates/PictureQuiz")).PictureQuiz as GameTemplateComponent;
    case "drag_sort":
      return (await import("./templates/DragSort")).DragSort as GameTemplateComponent;
    case "memory_match":
      return (await import("./templates/MemoryMatch")).MemoryMatch as GameTemplateComponent;
    case "sequence_builder":
      return (await import("./templates/SequenceBuilder")).SequenceBuilder as GameTemplateComponent;
    case "spot_difference":
      return (await import("./templates/SpotDifference")).SpotDifference as GameTemplateComponent;
    case "odd_one_out":
      return (await import("./templates/OddOneOut")).OddOneOut as GameTemplateComponent;
    case "true_false":
      return (await import("./templates/TrueFalse")).TrueFalse as GameTemplateComponent;
    case "color_activity":
      return (await import("./templates/ColorActivity")).ColorActivity as GameTemplateComponent;
    case "word_picture_link":
      return (await import("./templates/WordPictureLink")).WordPictureLink as GameTemplateComponent;
    case "interactive_story":
      return (await import("./templates/InteractiveStory")).InteractiveStory as GameTemplateComponent;
    case "bubble_pop":
      return (await import("./templates/BubblePopAdventure")).BubblePopAdventure as GameTemplateComponent;
    case "star_catcher":
      return (await import("./templates/StarCatcher")).StarCatcher as GameTemplateComponent;
    case "pixi_lab":
      return (await import("./templates/PixiLab")).PixiLab as GameTemplateComponent;
    default: {
      const exhaustive: never = type;
      throw new Error(`Unhandled game type: ${String(exhaustive)}`);
    }
  }
}
