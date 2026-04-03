import "server-only";

import fs from "fs";
import path from "path";
import type { Mood, Topic } from "./speakup-data";

const MOODS = new Set<Mood>(["Casual", "Deep", "Professional", "Personal"]);

/**
 * Loads practice topics from `public/topics.json`.
 * Edit that file to add, remove, or change prompts (also served at /topics.json in dev/production).
 * Shape: a JSON array, or `{ "topics": [ ... ] }`.
 */
export function loadTopicsFromDisk(): Topic[] {
  const filePath = path.join(process.cwd(), "public", "topics.json");
  let parsed: unknown;
  try {
    parsed = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    throw new Error(
      `SpeakUp: could not read or parse public/topics.json (cwd: ${process.cwd()})`
    );
  }

  const list = Array.isArray(parsed)
    ? parsed
    : (parsed as { topics?: unknown }).topics;
  if (!Array.isArray(list)) {
    throw new Error(
      'SpeakUp: topics.json must be a JSON array or { "topics": [ ... ] }'
    );
  }

  for (const item of list) {
    if (typeof item !== "object" || item === null) {
      throw new Error("SpeakUp: each topic must be an object");
    }
    const o = item as Record<string, unknown>;
    if (
      typeof o.id !== "number" ||
      typeof o.text !== "string" ||
      typeof o.mood !== "string" ||
      !Array.isArray(o.hints) ||
      !o.hints.every((h) => typeof h === "string")
    ) {
      throw new Error(
        `SpeakUp: invalid topic (need id: number, text, mood, hints: string[]) — id was ${String(o.id)}`
      );
    }
    if (!MOODS.has(o.mood as Mood)) {
      throw new Error(
        `SpeakUp: invalid mood "${o.mood}" for topic id ${o.id}. Use: Casual | Deep | Professional | Personal`
      );
    }
  }

  return list as Topic[];
}
