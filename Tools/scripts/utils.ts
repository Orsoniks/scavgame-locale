import fs from "node:fs";
import path from "node:path";
import fg from "fast-glob";
import micromatch from "micromatch";

// Absolute path to the repo root from Tools/scripts
export const REPO_ROOT = path.resolve(__dirname, "..", "..");

// Filesystem path to the locales (for reading/writing from Node)
export const LOCALES_DIR_FS = path.join(REPO_ROOT, "Runtime", "Locales");

// Markdown path to the locales (for links in README at repo root)
export const LOCALES_DIR_MD = "Runtime/Locales";

// The locale we consider "reference / source of truth"
export const REF_LOCALE = "en";

const IMG_EXT = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".PNG",
  ".JPG",
  ".JPEG",
]);

export function readJson<T = any>(p: string): T {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

export function writeJson(p: string, obj: any) {
  fs.writeFileSync(p, JSON.stringify(obj, null, 2) + "\n");
}

export function listLocaleDirs(): string[] {
  const root = path.resolve(LOCALES_DIR_FS);
  if (!fs.existsSync(root)) return [];
  return fs
    .readdirSync(root)
    .filter((d) => fs.statSync(path.join(root, d)).isDirectory());
}

export function globAll(dir: string): string[] {
  return fg
    .sync(["**/*"], {
      cwd: dir,
      dot: false,
      onlyFiles: true,
      followSymbolicLinks: true,
    })
    .map((p) => p.replaceAll("\\", "/"));
}

export function isJson(p: string) {
  return p.toLowerCase().endsWith(".json");
}

export function isImage(p: string) {
  return IMG_EXT.has(path.extname(p));
}

export function loadExclusions(): string[] {
  const p = path.resolve(__dirname, "analysis-exclusion-list.json");
  if (!fs.existsSync(p)) return [];
  try {
    const j = JSON.parse(fs.readFileSync(p, "utf8"));
    return Array.isArray(j.paths) ? j.paths : [];
  } catch {
    return [];
  }
}

export function filterExcluded(files: string[], patterns: string[]) {
  if (!patterns.length) return files;
  return files.filter((f) => !micromatch.isMatch(f, patterns));
}

export function relJoin(...parts: string[]) {
  return parts.join("/").replaceAll("//", "/");
}
