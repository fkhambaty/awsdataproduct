export interface OcrQualityInput {
  text: string;
  confidence: number;
  wordCount?: number;
}

export interface OcrPageQuality {
  ok: boolean;
  score: number;
  wordCount: number;
  reason?: string;
}

export const OCR_MIN_TEXT_LENGTH = 40;
export const OCR_MIN_WORD_COUNT = 10;
export const OCR_MIN_CONFIDENCE = 65;

export function countReadableWords(text: string): number {
  return (text.match(/[A-Za-z]{3,}/g) ?? []).length;
}

/** Shared quality threshold for the product wizard and offline evidence gate. */
export function assessOcrPageQuality(input: OcrQualityInput): OcrPageQuality {
  const score = Math.round(input.confidence);
  const wordCount = input.wordCount ?? countReadableWords(input.text);

  if (input.text.trim().length < OCR_MIN_TEXT_LENGTH || wordCount < OCR_MIN_WORD_COUNT) {
    return {
      ok: false,
      score,
      wordCount,
      reason: "We couldn't read enough text. Move closer so the page fills the frame, then retake.",
    };
  }
  if (input.confidence < OCR_MIN_CONFIDENCE) {
    return {
      ok: false,
      score,
      wordCount,
      reason: "This photo looks blurry or dim. Retake it in good light, holding the camera flat and steady.",
    };
  }
  return { ok: true, score, wordCount };
}
