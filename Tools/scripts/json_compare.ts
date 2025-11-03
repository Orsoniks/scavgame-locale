import fs from "node:fs";
import path from "node:path";

export type JsonMismatch = { path: string; reason: string };
export type JsonCheckResult = { valid: boolean; mismatches: JsonMismatch[] };

function loadJson(p: string): any {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function isObject(v: any): boolean {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

export function compareJsonStructure(
  refObj: any,
  testObj: any,
  currentPath = ""
): JsonMismatch[] {
  const mismatches: JsonMismatch[] = [];

  const tRef = Array.isArray(refObj)
    ? "array"
    : isObject(refObj)
    ? "object"
    : typeof refObj;

  const tTest = Array.isArray(testObj)
    ? "array"
    : isObject(testObj)
    ? "object"
    : typeof testObj;

  // --- type mismatch ---
  if (tRef !== tTest) {
    mismatches.push({
      path: currentPath || ".",
      reason: `❌ type mismatch: ${tRef} vs ${tTest}`,
    });
    return mismatches;
  }

  // --- array case ---
  if (Array.isArray(refObj) && Array.isArray(testObj)) {
    const lenRef = refObj.length;
    const lenTest = testObj.length;

    if (lenRef !== lenTest) {
      const arrow = lenTest > lenRef ? "🔺" : "🔻";
      mismatches.push({
        path: currentPath || ".",
        reason: `${arrow} expected ${lenRef} elements, got ${lenTest}`,
      });
    }

    // Always recurse into items to check structure
    const minLen = Math.min(lenRef, lenTest);
    for (let i = 0; i < minLen; i++) {
      mismatches.push(
        ...compareJsonStructure(refObj[i], testObj[i], `${currentPath}[${i}]`)
      );
    }

    return mismatches;
  }

  // --- object case ---
  if (isObject(refObj) && isObject(testObj)) {
    const refKeys = Object.keys(refObj);
    const testKeys = Object.keys(testObj);

    // Missing / extra keys
    for (const k of refKeys) {
      if (!testKeys.includes(k)) {
        mismatches.push({
          path: path.posix.join(currentPath, k),
          reason: "▫️ missing key",
        });
      }
    }
    for (const k of testKeys) {
      if (!refKeys.includes(k)) {
        mismatches.push({
          path: path.posix.join(currentPath, k),
          reason: "🔸 extra key",
        });
      }
    }

    // Common keys — recurse
    const common = refKeys.filter((k) => testKeys.includes(k));
    for (const k of common) {
      mismatches.push(
        ...compareJsonStructure(refObj[k], testObj[k], path.posix.join(currentPath, k))
      );
    }

    return mismatches;
  }
  return mismatches;
}

export function checkJsonPair(refPath: string, testPath: string): JsonCheckResult {
  const ref = loadJson(refPath);
  const tst = loadJson(testPath);
  const mismatches = compareJsonStructure(ref, tst, "");
  return { valid: mismatches.length === 0, mismatches };
}
