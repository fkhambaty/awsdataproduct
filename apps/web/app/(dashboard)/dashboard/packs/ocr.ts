"use client";

import type { Worker } from "tesseract.js";
import { assessOcrPageQuality, countReadableWords } from "@funberry/game-engine";

export interface OcrResult {
  text: string;
  /** Mean OCR confidence (0-100). Higher = clearer, printed text. */
  confidence: number;
  /** Count of readable alphabetic words (>= 3 letters). */
  wordCount: number;
}

export interface OcrRunner {
  run: (image: string, onProgress?: (p: number) => void) => Promise<OcrResult>;
  terminate: () => Promise<void>;
}

/**
 * Clarity benchmark for a printed textbook page. If a photo is blurry, dim, or
 * too low-resolution, the extracted text and confidence drop below these bars and
 * we ask the parent to re-upload a clearer photo.
 */
export function assessPageQuality(result: OcrResult): { ok: boolean; score: number; reason?: string } {
  return assessOcrPageQuality(result);
}

/**
 * Creates an on-device OCR runner backed by tesseract.js.
 *
 * tesseract.js is a large, browser-only engine, so it is loaded with a dynamic
 * import() purely for lazy code-splitting — it only downloads when a parent
 * actually extracts text. All recognition happens locally in the browser; no
 * external AI service is used.
 */
export async function createOcrRunner(): Promise<OcrRunner> {
  const mod = await import("tesseract.js");
  const createWorker = mod.createWorker;

  let progressCb: ((p: number) => void) | undefined;
  const worker: Worker = await createWorker("eng", 1, {
    logger: (m: { status: string; progress: number }) => {
      if (m.status === "recognizing text" && progressCb) progressCb(m.progress);
    },
  });

  return {
    async run(image: string, onProgress?: (p: number) => void): Promise<OcrResult> {
      progressCb = onProgress;
      const { data } = await worker.recognize(image);
      progressCb = undefined;
      const text = (data.text ?? "").trim();
      return {
        text,
        confidence: typeof data.confidence === "number" ? data.confidence : 0,
        wordCount: countReadableWords(text),
      };
    },
    async terminate(): Promise<void> {
      await worker.terminate();
    },
  };
}

/** Read a File as a data URL for OCR + optional storage upload. */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
