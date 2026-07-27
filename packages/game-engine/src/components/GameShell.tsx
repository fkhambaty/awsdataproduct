"use client";

import React from "react";
import { motion } from "framer-motion";
import type { ZoneTheme } from "../core/themes";
import { FloatingEmojis } from "./FloatingEmojis";
import { StreakCounter } from "./StreakCounter";
import { isMuted, toggleMute } from "../core/sound";

interface GameShellProps {
  theme: ZoneTheme;
  title: string;
  subtitle?: string;
  progress?: number;
  score?: number;
  streak?: number;
  /** Cumulative stars for the active child (from DB `children.total_stars`). */
  lifetimeStars?: number;
  /** Kid-friendly line that play is saved (e.g. for parent dashboard) — keep short; optional. */
  progressSavesHint?: string;
  /** Optional textbook page photo (`/book-pages/…`). */
  bookPageSrc?: string;
  onClose: () => void;
  onNextGame?: () => void;
  children: React.ReactNode;
}

export function GameShell({
  theme,
  title,
  subtitle,
  progress = 0,
  score,
  streak = 0,
  lifetimeStars,
  progressSavesHint,
  bookPageSrc,
  onClose,
  onNextGame,
  children,
}: GameShellProps) {
  const [muted, setMuted] = React.useState(isMuted());

  return (
    <div
      style={{
        minHeight: "100vh",
        background: theme.bgGradient,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          backgroundImage: theme.pattern,
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
        }}
      />
      <FloatingEmojis emojis={theme.emojis} count={6} />

      {/* ── Sticky Header ── */}
      <div
        className="kid-header-bar"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 30,
          display: "flex",
          flexDirection: "column",
          gap: 0,
          padding: "3px 10px 6px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
        <motion.button
          className="kid-glass-btn kid-glass-berry"
          whileHover={{ scale: 1.1, y: -2 }}
          whileTap={{ scale: 0.88 }}
          onClick={onClose}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "8px 14px",
            borderRadius: 16,
            cursor: "pointer",
            gap: 1,
            minWidth: 66,
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 22, lineHeight: 1 }}>🏠</span>
          <span
            style={{
              fontSize: 10,
              fontWeight: 900,
              color: "white",
              fontFamily: "Fredoka, sans-serif",
              letterSpacing: 0.5,
              lineHeight: 1.2,
            }}
          >
            HOME
          </span>
        </motion.button>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              fontWeight: 800,
              fontSize: 15,
              color: "#1c498c",
              fontFamily: "Fredoka, sans-serif",
              margin: 0,
              lineHeight: 1.2,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {title}
          </p>
          {subtitle && (
            <p
              style={{
                fontSize: 11,
                color: "#9ca3af",
                margin: 0,
                textTransform: "capitalize",
              }}
            >
              {subtitle.replace(/_/g, " ")}
            </p>
          )}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexShrink: 0,
          }}
        >
          {lifetimeStars !== undefined && (
            <motion.div
              key={lifetimeStars}
              initial={{ scale: 1.12 }}
              animate={{ scale: 1 }}
              className="kid-glass-stat kid-glass-stat--stars"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: "5px 10px",
                borderRadius: 14,
                fontWeight: 800,
                fontSize: 13,
                color: "#b45309",
                fontFamily: "Fredoka, sans-serif",
              }}
              title="Your total stars"
            >
              <span style={{ fontSize: 16, lineHeight: 1 }}>⭐</span>
              <span style={{ fontVariantNumeric: "tabular-nums" }}>{lifetimeStars}</span>
            </motion.div>
          )}

          {streak > 0 && <StreakCounter count={streak} />}

          {score !== undefined && (
            <motion.div
              key={score}
              initial={{ scale: 1.4 }}
              animate={{ scale: 1 }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                padding: "6px 12px",
                borderRadius: 16,
                backgroundColor: theme.accentLight,
                fontWeight: 700,
                fontSize: 14,
                color: theme.accentColor,
                fontFamily: "Fredoka, sans-serif",
              }}
            >
              ⭐ {score}
            </motion.div>
          )}

          <motion.button
            className={
              muted ? "kid-glass-btn kid-glass-danger" : "kid-glass-btn kid-glass-leaf"
            }
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.88 }}
            onClick={() => {
              toggleMute();
              setMuted(!muted);
            }}
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              cursor: "pointer",
              fontSize: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
            }}
            title={muted ? "Unmute sounds" : "Mute sounds"}
          >
            {muted ? "🔇" : "🔊"}
          </motion.button>
        </div>
        </div>
        {progressSavesHint ? (
          <p
            style={{
              margin: "6px auto 0",
              padding: "4px 10px",
              textAlign: "center",
              fontSize: 10,
              fontWeight: 800,
              color: "#334155",
              lineHeight: 1.35,
              fontFamily: "Nunito, system-ui, sans-serif",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              background: "rgba(255,255,255,0.84)",
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.92)",
              maxWidth: "fit-content",
            }}
          >
            {progressSavesHint}
          </p>
        ) : null}
      </div>

      {bookPageSrc ? (
        <div
          style={{
            position: "relative",
            zIndex: 8,
            padding: "0 12px 8px",
            maxWidth: 720,
            margin: "0 auto",
          }}
        >
          <img
            src={bookPageSrc}
            alt=""
            style={{
              width: "100%",
              maxHeight: 120,
              objectFit: "contain",
              borderRadius: 12,
              border: "2px solid rgba(255,255,255,0.85)",
              boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
            }}
          />
          <p
            style={{
              margin: "4px auto 0",
              fontSize: 10,
              fontWeight: 800,
              color: "#334155",
              textAlign: "center",
              fontFamily: "Nunito, system-ui, sans-serif",
              background: "rgba(255,255,255,0.86)",
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.94)",
              maxWidth: "fit-content",
              padding: "2px 8px",
            }}
          >
            From your textbook
          </p>
        </div>
      ) : null}

      {progress > 0 && (
        <div style={{ position: "relative", zIndex: 10, padding: "0 16px" }}>
          <div
            style={{
              height: 8,
              backgroundColor: "rgba(0,0,0,0.07)",
              borderRadius: 4,
              overflow: "hidden",
              marginTop: 6,
            }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progress * 100, 100)}%` }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              style={{
                height: "100%",
                borderRadius: 4,
                background: `linear-gradient(90deg, ${theme.accentColor}, ${theme.accentColor}dd)`,
                boxShadow: `0 0 12px ${theme.accentColor}55`,
              }}
            />
          </div>
        </div>
      )}

      <div
        style={{
          position: "relative",
          zIndex: 5,
          padding: "16px 0",
          paddingBottom: onNextGame ? 88 : 20,
        }}
      >
        {children}
      </div>

      {onNextGame && (
        <motion.button
          className="kid-glass-btn kid-glass-violet"
          whileHover={{ scale: 1.1, y: -4 }}
          whileTap={{ scale: 0.92 }}
          onClick={onNextGame}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, type: "spring", stiffness: 200, damping: 18 }}
          style={{
            position: "fixed",
            bottom: "calc(24px + env(safe-area-inset-bottom, 0px))",
            right: "calc(20px + env(safe-area-inset-right, 0px))",
            zIndex: 40,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "10px 18px",
            borderRadius: 20,
            cursor: "pointer",
            gap: 2,
          }}
        >
          <span style={{ fontSize: 22 }}>🔀</span>
          <span
            style={{
              fontSize: 10,
              fontWeight: 900,
              color: "white",
              fontFamily: "Fredoka, sans-serif",
            }}
          >
            SWITCH
          </span>
        </motion.button>
      )}
    </div>
  );
}
