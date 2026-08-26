import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createWorker } from "tesseract.js";
import {
  assessOcrPageQuality,
  buildLessonQualityMetrics,
  cleanLessonText,
  generateLesson,
} from "@funberry/game-engine";

type FixBurden = "none" | "minor" | "major";

interface HumanReview {
  file: string;
  groundedInPage: boolean | null;
  answersCorrect: boolean | null;
  ageSuitability: number | null;
  usefulness: number | null;
  fixBurden: FixBurden | null;
  notes: string;
}

interface CliOptions {
  input?: string;
  score?: string;
  output?: string;
  files?: string[];
  reviews?: string;
  count: number;
  seed: number;
}

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".bmp"]);

function usage(): never {
  throw new Error(
    [
      "Usage: npm run eval:packs -- --input <image-directory> [options]",
      "       npm run eval:packs -- --score <existing-evaluation-directory>",
      "",
      "Options:",
      "  --files page1.jpg,page2.jpg   Evaluate explicit files (otherwise first sorted images)",
      "  --count 10                    Number of pages when --files is omitted",
      "  --seed 20260826               Reproducible generator seed",
      "  --output <directory>          Override private report destination",
      "  --reviews <review.json>       Override the review file used with --score",
    ].join("\n"),
  );
}

function parseArgs(args: string[]): CliOptions {
  const values = new Map<string, string>();
  for (let index = 0; index < args.length; index += 2) {
    const key = args[index];
    const value = args[index + 1];
    if (!key?.startsWith("--") || value == null) usage();
    values.set(key.slice(2), value);
  }

  const input = values.get("input");
  const score = values.get("score");
  if ((!input && !score) || (input && score)) usage();
  const count = Number(values.get("count") ?? "10");
  const seed = Number(values.get("seed") ?? "20260826");
  if (!Number.isInteger(count) || count < 1) throw new Error("--count must be a positive integer");
  if (!Number.isInteger(seed)) throw new Error("--seed must be an integer");

  return {
    input: input ? path.resolve(input) : undefined,
    score: score ? path.resolve(score) : undefined,
    output: values.get("output") ? path.resolve(values.get("output")!) : undefined,
    files: values.get("files")?.split(",").map((file) => file.trim()).filter(Boolean),
    reviews: values.get("reviews") ? path.resolve(values.get("reviews")!) : undefined,
    count,
    seed,
  };
}

function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function safePageId(file: string): string {
  return path.basename(file, path.extname(file)).replace(/[^a-zA-Z0-9_-]/g, "-");
}

function isCompletedReview(review: HumanReview): boolean {
  return (
    review.groundedInPage != null &&
    review.answersCorrect != null &&
    review.ageSuitability != null &&
    review.usefulness != null &&
    review.fixBurden != null
  );
}

function isTrustedReview(review: HumanReview): boolean {
  return (
    review.groundedInPage === true &&
    review.answersCorrect === true &&
    (review.ageSuitability ?? 0) >= 4 &&
    (review.usefulness ?? 0) >= 4 &&
    (review.fixBurden === "none" || review.fixBurden === "minor")
  );
}

async function loadReviews(file: string | undefined): Promise<HumanReview[] | null> {
  if (!file) return null;
  const parsed: unknown = JSON.parse(await readFile(file, "utf8"));
  if (!Array.isArray(parsed)) throw new Error("--reviews must contain a JSON array");
  return parsed as HumanReview[];
}

function renderReport(
  runId: string,
  pages: Array<{
    file: string;
    ocr: { confidence: number; wordCount: number; qualityOk: boolean; qualityReason?: string };
    metrics: ReturnType<typeof buildLessonQualityMetrics>;
  }>,
  reviews: HumanReview[],
): string {
  const completed = reviews.filter(isCompletedReview);
  const trusted = completed.filter(isTrustedReview);
  const required = Math.ceil(pages.length * 0.8);
  const gate =
    completed.length < pages.length
      ? `PENDING — complete all ${pages.length} human reviews`
      : trusted.length >= required
        ? `PASS — ${trusted.length}/${pages.length} trusted pages`
        : `FAIL — ${trusted.length}/${pages.length} trusted pages; ${required} required`;

  const rows = pages
    .map((page) => {
      const review = reviews.find((item) => item.file === page.file);
      const status = review && isCompletedReview(review) ? (isTrustedReview(review) ? "trusted" : "not trusted") : "pending";
      return `| ${page.file} | ${page.ocr.confidence.toFixed(1)} | ${page.ocr.qualityOk ? "yes" : "no"} | ${page.metrics.gameCount} | ${page.metrics.totalItems} | ${page.metrics.warningCount} | ${status} |`;
    })
    .join("\n");

  return `# Learning Pack evidence gate — ${runId}

## Gate result

**${gate}**

Automated metrics diagnose OCR and generator behavior. They do not prove factual correctness.
Open each source image beside \`evaluation.json\`, then complete \`human-review.json\`.

## Page summary

| Page | OCR confidence | OCR quality | Games | Items | Warnings | Human verdict |
|------|----------------|-------------|-------|-------|----------|---------------|
${rows}

## Human trust rubric

A page is **trusted** only when all are true:

1. Every question and answer is grounded in the photographed page.
2. Every marked answer is correct.
3. Age suitability is at least 4/5 for a child aged 5–8.
4. Usefulness is at least 4/5.
5. Fix burden is \`none\` or \`minor\` (not \`major\`).

The gate passes at ${required}/${pages.length} trusted pages. Edit \`human-review.json\`, then run
\`npm run eval:packs -- --score <this-directory>\` to calculate the final result without repeating OCR.

## Privacy

This directory contains OCR text derived from textbook photos. It is intentionally gitignored.
Do not upload it, child data, or source images to issues or public repositories.
`;
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  if (options.score) {
    const evaluation = JSON.parse(
      await readFile(path.join(options.score, "evaluation.json"), "utf8"),
    ) as {
      runId: string;
      pages: Array<{
        file: string;
        ocr: { confidence: number; wordCount: number; qualityOk: boolean; qualityReason?: string };
        metrics: ReturnType<typeof buildLessonQualityMetrics>;
      }>;
    };
    const reviewFile = options.reviews ?? path.join(options.score, "human-review.json");
    const reviews = await loadReviews(reviewFile);
    if (!reviews) throw new Error(`Missing reviews: ${reviewFile}`);
    await writeFile(
      path.join(options.score, "REPORT.md"),
      renderReport(evaluation.runId, evaluation.pages, reviews),
    );
    process.stdout.write(`Scored report: ${path.join(options.score, "REPORT.md")}\n`);
    return;
  }

  const input = options.input;
  if (!input) usage();
  const available = (await readdir(input))
    .filter((file) => IMAGE_EXTENSIONS.has(path.extname(file).toLowerCase()))
    .sort();
  const selected = options.files ?? available.slice(0, options.count);
  if (selected.length !== options.count && !options.files) {
    throw new Error(`Expected ${options.count} images in ${input}; found ${selected.length}`);
  }
  if (selected.length === 0) throw new Error("No image files selected");
  for (const file of selected) {
    if (!available.includes(file)) throw new Error(`Image not found in input directory: ${file}`);
  }

  const runId = new Date().toISOString().replace(/[:.]/g, "-");
  const output = options.output ?? path.resolve(".local/learning-pack-evals", runId);
  await mkdir(output, { recursive: true });

  const worker = await createWorker("eng", 1);
  const pages = [];
  try {
    for (const [index, file] of selected.entries()) {
      const imagePath = path.join(input, file);
      process.stdout.write(`[${index + 1}/${selected.length}] OCR ${file} ... `);
      const { data } = await worker.recognize(imagePath);
      const rawText = (data.text ?? "").trim();
      const quality = assessOcrPageQuality({
        text: rawText,
        confidence: typeof data.confidence === "number" ? data.confidence : 0,
      });
      const lesson = generateLesson(rawText, {
        idPrefix: `eval-${safePageId(file)}`,
        random: seededRandom(options.seed + index),
      });
      const metrics = buildLessonQualityMetrics(rawText, lesson);
      pages.push({
        file,
        sourcePath: imagePath,
        ocr: {
          confidence: typeof data.confidence === "number" ? data.confidence : 0,
          wordCount: quality.wordCount,
          qualityOk: quality.ok,
          qualityReason: quality.reason,
          rawText,
          cleanedText: cleanLessonText(rawText),
        },
        lesson,
        metrics,
      });
      process.stdout.write(`${metrics.gameCount} games, ${metrics.warningCount} warnings\n`);
    }
  } finally {
    await worker.terminate();
  }

  const suppliedReviews = await loadReviews(options.reviews);
  const reviews: HumanReview[] =
    suppliedReviews ??
    pages.map((page) => ({
      file: page.file,
      groundedInPage: null,
      answersCorrect: null,
      ageSuitability: null,
      usefulness: null,
      fixBurden: null,
      notes: "",
    }));

  await writeFile(
    path.join(output, "evaluation.json"),
    `${JSON.stringify({ runId, seed: options.seed, input, pages }, null, 2)}\n`,
  );
  await writeFile(path.join(output, "human-review.json"), `${JSON.stringify(reviews, null, 2)}\n`);
  await writeFile(path.join(output, "REPORT.md"), renderReport(runId, pages, reviews));

  process.stdout.write(`\nPrivate review bundle: ${output}\n`);
  process.stdout.write(`Open ${path.join(output, "REPORT.md")}\n`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
});
