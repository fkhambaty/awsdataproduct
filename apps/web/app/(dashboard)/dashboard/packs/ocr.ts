"use client";

import type { Worker } from "tesseract.js";

export interface OcrRunner {
  run: (image: string, onProgress?: (p: number) => void) => Promise<string>;
  terminate: () => Promise<void>;
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
    async run(image: string, onProgress?: (p: number) => void): Promise<string> {
      progressCb = onProgress;
      const { data } = await worker.recognize(image);
      progressCb = undefined;
      return (data.text ?? "").trim();
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
