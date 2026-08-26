"use client";

import { useEffect, useState } from "react";
import type { GameConfig, GameResult, GameTemplateComponent } from "@funberry/game-engine";
import { loadGameTemplate } from "@funberry/game-engine";

type GamePlayerProps = {
  game: GameConfig;
  accentColor: string;
  onComplete: (result: GameResult) => void;
  onNextGame: () => void;
};

export function GamePlayer({ game, accentColor, onComplete, onNextGame }: GamePlayerProps) {
  const [Template, setTemplate] = useState<GameTemplateComponent | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setTemplate(null);
    setFailed(false);

    loadGameTemplate(game.type)
      .then((Comp) => {
        if (!cancelled) setTemplate(() => Comp);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [game.id, game.type]);

  if (failed) {
    return (
      <div className="px-6 py-16 text-center">
        <p className="font-display text-lg font-bold text-slate-700">This game could not load.</p>
        <p className="mt-2 text-sm font-semibold text-slate-500">Check your connection and try again.</p>
      </div>
    );
  }

  if (!Template) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
        <p className="mt-4 font-display text-base font-bold text-slate-600">Getting the game ready…</p>
      </div>
    );
  }

  return (
    <Template
      data={game.data}
      onComplete={onComplete}
      accentColor={accentColor}
      onNextGame={onNextGame}
    />
  );
}
