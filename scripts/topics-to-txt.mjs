/**
 * Regenerates public/topics.txt from public/topics.json.
 * Run: npm run export-topics-txt
 * (After editing JSON, run this so the client-facing .txt stays in sync.)
 */
import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const jsonPath = join(root, "public", "topics.json");
const txtPath = join(root, "public", "topics.txt");

const raw = JSON.parse(readFileSync(jsonPath, "utf-8"));
const topics = Array.isArray(raw) ? raw : raw.topics;
if (!Array.isArray(topics)) {
  console.error("topics.json must be an array or { topics: [] }");
  process.exit(1);
}

const header = [
  "# SpeakUp — topics for client review (one per line)",
  "# Format: Topic text - Mood",
  "# Mood must be exactly: Casual, Deep, Professional, or Personal",
  "# IDs and speaking hints live only in topics.json — update JSON after you settle wording here",
  "",
].join("\n");

const lines = topics.map((t) => {
  const text = String(t.text).replace(/\r?\n/g, " ").trim();
  const mood = String(t.mood).trim();
  return `${text} - ${mood}`;
});

writeFileSync(txtPath, header + lines.join("\n") + "\n", "utf-8");
console.log("Wrote", txtPath, `(${topics.length} topics)`);
