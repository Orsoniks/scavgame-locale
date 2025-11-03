import fs from "node:fs";
import path from "node:path";
import {
  REPO_ROOT,
  LOCALES_DIR_FS,
  LOCALES_DIR_MD,
  REF_LOCALE,
  listLocaleDirs,
  globAll,
  isJson,
  isImage,
  loadExclusions,
  filterExcluded,
  relJoin,
  readJson,
  writeJson,
} from "./utils";
import { checkJsonPair } from "./json_compare";
import { checkImagePair } from "./media_compare";

type FileResult = {
  validText: number;
  invalidText: number;
  validMedia: number;
  invalidMedia: number;
  missing: string[];
  extra: string[];
  jsonErrors: Record<string, string[]>;
  mediaErrors: Record<string, string[]>;
  totals: { textInRef: number; mediaInRef: number };
};

type IndexStructure = {
  completeLocales: string[];
  validTextLocales: string[];
  allLocales: string[];
};

const REPORT_DIR_FS = path.join(REPO_ROOT, "reports");
const REPORT_DIR = "../reports";
const REPORT_MD_FS  = path.join(REPORT_DIR_FS, "workflow-report.md");
const REPORT_MD_HREF = "reports/workflow-report.md";
const INDEX_JSON = path.join(`${LOCALES_DIR_FS}`, "index.json");
const README_MD = "../README.md";
const README_HEADER_PATH = "../Tools/templates/README.header.md";
const README_FOOTER_PATH = "../Tools/templates/README.footer.md";
const INDEX_TEMPLATE_PATH = "../Tools/templates/index.template.json";

const IS_CI =
  process.env.CI === "true" || process.env.GITHUB_ACTIONS === "true";
const GH_SERVER = process.env.GITHUB_SERVER_URL;
const GH_REPO = process.env.GITHUB_REPOSITORY;
const GH_RUN_ID = process.env.GITHUB_RUN_ID;
const RUN_ARTIFACTS_URL =
  GH_SERVER && GH_REPO && GH_RUN_ID
    ? `${GH_SERVER}/${GH_REPO}/actions/runs/${GH_RUN_ID}`
    : null;

(async function main() {
  if (!fs.existsSync(REPORT_DIR)) fs.mkdirSync(REPORT_DIR, { recursive: true });

  const exclusions = loadExclusions();

  const allLocalesDirs = listLocaleDirs()
    .filter((d) => d !== ".git")
    .sort();
  if (!allLocalesDirs.includes(REF_LOCALE)) {
    console.error(
      `Reference locale '${REF_LOCALE}' not found at ${LOCALES_DIR_FS}/${REF_LOCALE}`
    );
    process.exit(1);
  }

  const refRoot = path.resolve(LOCALES_DIR_FS, REF_LOCALE);
  let refFiles = globAll(refRoot);
  refFiles = filterExcluded(refFiles, exclusions);

  const refJson = refFiles.filter(isJson);
  const refMedia = refFiles.filter(isImage);
  const hasRefText = refJson.length > 0;
  const hasRefMedia = refMedia.length > 0;

  const results: Record<string, FileResult> = {};
  const locales = allLocalesDirs.filter((l) => l !== REF_LOCALE);

  for (const locale of [REF_LOCALE, ...locales]) {
    const locRoot = path.resolve(LOCALES_DIR_FS, locale);
    let locFiles = globAll(locRoot);
    locFiles = filterExcluded(locFiles, exclusions);

    const res: FileResult = {
      validText: 0,
      invalidText: 0,
      validMedia: 0,
      invalidMedia: 0,
      missing: [],
      extra: [],
      jsonErrors: {},
      mediaErrors: {},
      totals: { textInRef: refJson.length, mediaInRef: refMedia.length },
    };

    // Compare against ref only for non-en; for en we only “validate” en files internally
    const compareAgainst = (p: string) => relJoin(LOCALES_DIR_FS, REF_LOCALE, p);
    const inRefSet = new Set(refFiles.map((p) => p));

    // Walk union of (ref files) and (locale files) so we catch missing/extra
    const relSet = new Set<string>(
      [...refFiles, ...locFiles].map((absOrRel) => {
        // store RELATIVE to locale folder (normalized)
        // refFiles are relative to REF root; locFiles to locale root
        return absOrRel;
      })
    );

    // Missing/extra by path relative to ref
    // We’ll iterate reference files to check pairs
    for (const refRel of refFiles) {
      const refAbs = path.join(refRoot, refRel);
      const locCandidate = path.join(locRoot, refRel);
      const exists = fs.existsSync(locCandidate);

      if (!exists) {
        if (locale !== REF_LOCALE) res.missing.push(refRel);
        continue;
      }

      if (isJson(refRel)) {
        try {
          const { valid, mismatches } = checkJsonPair(refAbs, locCandidate);
          if (valid) res.validText++;
          else {
            res.invalidText++;
            res.jsonErrors[refRel] = mismatches.map(
              (m) => `\`${m.path}\` → ${m.reason}`
            );
          }
        } catch (e: any) {
          res.invalidText++;
          res.jsonErrors[refRel] = [`parse error: ${e?.message ?? e}`];
        }
      } else if (isImage(refRel)) {
        try {
          const { valid, mismatches } = await checkImagePair(
            refAbs,
            locCandidate
          );
          if (valid) res.validMedia++;
          else {
            res.invalidMedia++;
            res.mediaErrors[refRel] = mismatches.map(
              (m) => `${m.reason}${m.detail ? ` (${m.detail})` : ""}`
            );
          }
        } catch (e: any) {
          res.invalidMedia++;
          res.mediaErrors[refRel] = [`read error: ${e?.message ?? e}`];
        }
      }
    }

    // Extra files: files present in locale but not in ref
    if (locale !== REF_LOCALE) {
      for (const locRel of locFiles) {
        const refAbs = path.join(refRoot, locRel);
        if (!fs.existsSync(refAbs)) {
          res.extra.push(locRel);
        }
      }
    }

    results[locale] = res;
  }

  // ---- Build condensed report (per-locale sections)
  const lines: string[] = [];
  const todayTimeUtc =
    new Date().toLocaleString("en-GB", {
      timeZone: "UTC",
      dateStyle: "short",
      timeStyle: "short",
      hour12: false,
    }) + " UTC";

  lines.push(`# Locale Audit Report`);
  lines.push(`Generated on ${todayTimeUtc}`);
  lines.push("");

  for (const locale of locales) {
    const r = results[locale];
    const textStatusLine =
      hasRefText
        ? statusFor(r, "text", hasRefText)
        : "_(no text in reference)_";

    const mediaStatusLine =
      hasRefMedia
        ? statusFor(r, "media", hasRefMedia)
        : "_(no media in reference)_";
    const missingCount = r.missing.length;
    const mismatchCount = r.invalidText + r.invalidMedia;

    lines.push(`## ${locale}`);
    lines.push(`- Text: ${textStatusLine}`);
    lines.push(`- Media: ${mediaStatusLine}`);
    lines.push("");

    if (Object.keys(r.jsonErrors).length) {
      lines.push(
        `<details><summary><strong>JSON mismatches</strong> (${Object.values(r.jsonErrors || {}).reduce((a, e) => a + e.length, 0)})</summary>`, ""
      );
      for (const f of Object.keys(r.jsonErrors || {}).sort()) {
        lines.push(`- \`${f}\``);
        for (const e of r.jsonErrors[f]) lines.push(`  - ${e}`);
      }
      lines.push("</details>", "");
    }
    if (Object.keys(r.mediaErrors).length) {
      lines.push(
        `<details><summary><strong>Media mismatches</strong> (${Object.keys(r.mediaErrors).length})</summary>`, ""
      );
      for (const f of Object.keys(r.mediaErrors).sort()) {
        lines.push(`- \`${f}\``);
        for (const e of r.mediaErrors[f]) lines.push(`  - ${e}`);
      }
      lines.push("</details>", "");
    }

    if (r.missing.length) {
      lines.push("", `<details><summary><strong>Missing files</strong> (${r.missing.length})</summary>`, "");
      for (const f of r.missing.sort()) lines.push(`- \`${f}\``);
      lines.push("</details>", "");
    }
    if (r.extra.length) {
      lines.push("", `<details><summary><strong>Extra files</strong> (${r.extra.length})</summary>`, "");
      for (const f of r.extra.sort()) lines.push(`- \`${f}\``);
      lines.push("</details>", "");
    }
  }

  fs.writeFileSync(REPORT_MD_FS, lines.join("\n") + "\n");

  // ---- Compute index.json
  const index: IndexStructure = fs.existsSync(INDEX_JSON)
    ? readJson<IndexStructure>(INDEX_JSON)
    : fs.existsSync(INDEX_TEMPLATE_PATH)
      ? readJson<IndexStructure>(INDEX_TEMPLATE_PATH)
      : { completeLocales: [], validTextLocales: [], allLocales: [] };

  const completeLocales: string[] = [];
  const validTextLocales: string[] = [];
  const allLocales = [REF_LOCALE, ...locales];

  for (const locale of allLocales) {
    const r = results[locale];

    const textComplete =
      r.totals.textInRef === 0 ||
      (r.invalidText === 0 &&
        r.missing.filter((f) => f.endsWith(".json")).length === 0);
    const mediaComplete =
      r.totals.mediaInRef === 0 ||
      (r.invalidMedia === 0 &&
        r.missing.filter((f) => /\.(png|jpe?g)$/i.test(f)).length === 0);

    if (textComplete) validTextLocales.push(locale);
    if (
      textComplete &&
      mediaComplete &&
      r.missing.length === 0 &&
      r.invalidText === 0 &&
      r.invalidMedia === 0
    ) {
      completeLocales.push(locale);
    }
  }

  index.completeLocales = Array.from(new Set(completeLocales)).sort();
  index.validTextLocales = Array.from(new Set(validTextLocales)).sort();
  index.allLocales = Array.from(new Set(allLocales)).sort();

  writeJson(INDEX_JSON, index);

  // ---- Update README.md (table between markers)
  const readmeHeader = fs.existsSync(README_HEADER_PATH)
    ? fs.readFileSync(README_HEADER_PATH, "utf8")
    : "";
  const readmeFooter = fs.existsSync(README_FOOTER_PATH)
    ? fs.readFileSync(README_FOOTER_PATH, "utf8")
    : "";

  /**
   * Tries to find the friendly locale name from strings.json's "name" field and formats it for markdown
   * @param locale locale code like `en` or `fr-FR`
   * @returns a string like `[English](Locales/en)` or just `[en](Locales/en)` if not found
   */
  function findLocaleName(locale: string): string {
    const p = path.join(LOCALES_DIR_FS, locale, "strings.json");
    if (!fs.existsSync(p)) return `[${locale}](${LOCALES_DIR_MD}/${locale})`;
    try {
      const data = JSON.parse(fs.readFileSync(p, "utf8"));
      if (
        data &&
        typeof data === "object" &&
        typeof data.name === "string" &&
        data.name.trim().length > 0
      ) {
        return `[${data.name.trim()}](${LOCALES_DIR_MD}/${locale})`;
      }
    } catch {
      /* ignore */
    }
    return locale;
  }

  type StatusInput = {
    show: boolean;           // whether we display this column/section at all
    totalsInRef: number;     // how many files in the reference for this type
    invalidCount: number;    // mismatches for this type
    validCount: number;      // valid for this type
  };

  function printStatusLabel({ show, totalsInRef, invalidCount, validCount }: StatusInput): string {
    if (!show) return "";
    if (totalsInRef === 0) return ""; // no reference files should not happen if show=true
    if (invalidCount > 0) return "🔘 Mismatch";
    const ok = validCount === totalsInRef;
    if (ok) return "🟢 Complete";
    if (validCount === 0) return "   -   ";
    return `🟡 Partial *(${validCount}/${totalsInRef})*`;
  }

  function statusFor(r: FileResult, kind: "text" | "media", show: boolean): string {
    const totalsInRef = kind === "text" ? r.totals.textInRef : r.totals.mediaInRef;
    const invalidCount = kind === "text" ? r.invalidText : r.invalidMedia;
    const validCount = kind === "text" ? r.validText : r.validMedia;
    return printStatusLabel({ show, totalsInRef, invalidCount, validCount });
  }

  // credits: Locales/<locale>/credits.json = ["githubUser","..."] or [{ "name":"", "url":"" }]
  function creditsFor(locale: string): string {
    const p = path.join(LOCALES_DIR_FS, locale, "credits.json");
    if (!fs.existsSync(p)) return "*no `credits.json` found*";
    try {
      const data = JSON.parse(fs.readFileSync(p, "utf8"));
      const arr = Array.isArray(data)
        ? data
        : Array.isArray(data.contributors)
          ? data.contributors
          : [];
      const render = (x: any) => {
        if (typeof x === "string") return `[${x}](https://github.com/${x})`;
        if (x && typeof x === "object") {
          const name = x.name ?? x.username ?? x.url ?? "Contributor";
          const url =
            x.url ?? (x.username ? `https://github.com/${x.username}` : "");
          return url ? `[${name}](${url})` : name;
        }
        return "Contributor";
      };
      return arr.map(render).join(", ") || "*no contributors listed*";
    } catch {
      return "*invalid `credits.json`*";
    }
  }

  const headerCols = ["Locale"];
  if (hasRefText) headerCols.push("Text");
  if (hasRefMedia) headerCols.push("Media");
  headerCols.push("Ok", "Mismatch", "Missing", "Contributors");

  const align = [":---"];
  if (hasRefText) align.push(":----------:");
  if (hasRefMedia) align.push(":----------:");
  align.push(":---:", " :------: ", " :-----: ", " :-- ");

  const rows: string[] = [];
  for (const locale of locales) {
    const r = results[locale];
    const ok = r.validText + r.validMedia;
    const mm = r.invalidText + r.invalidMedia;
    const miss = r.missing.length;
    const friendlyName = findLocaleName(locale);
    const cols: string[] = [
      `${friendlyName}`,
    ];
    if (hasRefText) cols.push(statusFor(r, "text", hasRefText) || "");
    if (hasRefMedia) cols.push(statusFor(r, "media", hasRefMedia) || "");
    cols.push(
      ok ? `**${ok}**` : "0",
      mm ? `**${mm}**` : "0",
      miss ? `**${miss}**` : "0",
      creditsFor(locale)
    );
    rows.push(`| ${cols.join(" | ")} |`);
  }

  const table: string[] = [];
  table.push(`| ${headerCols.join(" | ")} |`);
  table.push(`| ${align.join(" | ")} |`);
  table.push(...rows);

  const WORKFLOW_REPORT_LINK = (() => {
    if (IS_CI && RUN_ARTIFACTS_URL) {
      return `[📄workflow report](${RUN_ARTIFACTS_URL})`;
    }
    if (IS_CI) {
      return "📄workflow report (available as an artifact on the run page)";
    }
    return `[📄workflow report](${REPORT_MD_HREF})`;
  })();
  const legendLines = [
    "**Legend**",
    `- 🔘 Mismatch (≥1 files incompatible with the game, check the ${WORKFLOW_REPORT_LINK} for details)`,
    `- 🟡 Partial (≥1 missing files compared to [\`${LOCALES_DIR_MD}/${REF_LOCALE}\`](${LOCALES_DIR_MD}/${REF_LOCALE}))`,
    "- 🟢 Complete (Elements have the correct structure and can be imported in the game)",
    "",
  ];

  const finalReadme =
    `${readmeHeader}
## Locales

${table.join("\n")}

Last updated on ${todayTimeUtc}

${legendLines.join("\n")}
${readmeFooter}`.trim() + "\n";

  fs.writeFileSync(README_MD, finalReadme, "utf8");

  console.log("Audit complete.");
})();
