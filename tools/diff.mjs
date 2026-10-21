/*
 * Translation review utils by Marioalexsan
 * CC0 license, do whatever you want with it
 *
 * Compare a locale with EN.json:
 *   node tools/diff.mjs [version, or latest for the EN.json in root] [locale code] [0-2 for how detailed the report should be]
 * Example:
 *   node tools/diff.mjs latest demo/es-419 2
 *   node tools/diff.mjs v7.0.1 demo/uk-UA 1
 *
 * You will need Node.js 24 installed to run this script.
 * Please note that this utility will fetch some GitHub files for past EN versions under the "tools/" directory.
 */

import fs from "node:fs/promises";
import fsPath from "node:path";
import readline from "node:readline/promises";
import process from "node:process";
import child_process from "node:child_process";
import crypto from "node:crypto";

import {
  flattenPaths,
  getPath,
  shouldRemainTheSame,
  isCustomText,
  getEnVersion,
  versions
} from "./utils.mjs";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

main().then(() => {
  console.log();
  process.exit(0);
}).catch(err => {
  if (err instanceof Error && err.code == 'ABORT_ERR')
  {
    console.log();
    process.exit(0);
  }

  throw err;
});

async function main()
{
  if (await fs.stat(fsPath.join("tools", "diff.mjs"), { throwIfNoEntry: false }) === undefined)
  {
    console.log("Please run this from the repo root!");
    process.exit(0);
  }

  let targetVersion = process.argv.length >= 3 ? process.argv[2] : await rl.question('Game version to check against (empty for latest from repo): ');
  let targetLocale = process.argv.length >= 4 ? process.argv[3] : await rl.question('Path to locale (e.g. demo/ko-KR.json): ');
  let detailLevel = parseInt(process.argv.length >= 5 ? process.argv[4] : await rl.question('Detail level (0-2): '));

  if (!targetLocale.endsWith(".json"))
    targetLocale += ".json";

  if (targetVersion == "")
    targetVersion = "latest";

  if (Number.isNaN(detailLevel) || detailLevel < 0 || detailLevel > 2)
    detailLevel = 0;

  await diff(targetVersion, targetLocale, detailLevel);
}

async function diff(targetVersion, targetLocale, detailLevel)
{
  const versionedEnJson = {};

  for (const version of versions)
  {
    const enVersioned = await getEnVersion(version);

    if (enVersioned != null)
      versionedEnJson[version] = enVersioned;
  }

  console.log("");

  const enJson = versionedEnJson[targetVersion];

  if (enJson == null)
    throw new Error(`Given version does not exist: ${targetVersion}`);

  const targetJson = JSON.parse(await fs.readFile(targetLocale, 'utf-8'));

  const enPaths = new Set(flattenPaths(enJson));
  const targetPaths = new Set(flattenPaths(targetJson));

  const missing = enPaths.difference(targetPaths);
  const extra = targetPaths.difference(enPaths);

  const identicalKeys = [];

  for (const enJsonVersion of Object.values(versionedEnJson))
  {
    const versionedPaths = new Set(flattenPaths(enJsonVersion));
    for (const versionPath of versionedPaths)
    {
      if (isCustomText(versionPath))
        continue; // These can have any text in them

        const truePath = versionPath;
      const original = getPath(enJsonVersion, truePath);
      const translation = getPath(targetJson, truePath);
      if (original != null)
      {
        if (original == translation) {
          if (shouldRemainTheSame(truePath, original))
            continue;

          if (!identicalKeys.includes(truePath))
            identicalKeys.push(truePath);
        }
      }
    }
  }

  const matchingPaths = enPaths.intersection(targetPaths);

  const keysWithFormatIssues = [];

  for (const matchingPath of matchingPaths)
  {
    if (isCustomText(matchingPath))
      continue; // These can have any text in them

      const original = getPath(enJson, matchingPath);
    const translation = getPath(targetJson, matchingPath);
    const formatDiff = getMissingFormatElements(original, translation);
    if (formatDiff != "")
      keysWithFormatIssues.push([matchingPath, formatDiff]);
  }

  const incorrectTypes = new Set([...missing]).intersection(new Set([...extra]));
  const missingItems = [...missing].filter(x => !incorrectTypes.has(x));
  const extraItems = [...extra].filter(x => !incorrectTypes.has(x));
  const incorrectKeys = [...enPaths].filter(x => shouldRemainTheSame(x, getPath(enJson, x)) && (getPath(enJson, x) != getPath(targetJson, x)));

  if (detailLevel >= 1) {
    const ellipsis = (text, len) => text == null ? "<null>" : (text.length > len ? text.slice(0, len) + "..." : text).replace(/\r/g, "\\r").replace(/\n/g, "\\n");
    const details = (path, targetLength) => detailLevel >= 2 ? `${path.padEnd(targetLength, ' ')} | "${ellipsis(getPath(enJson, path), 100)}"` : path;
    const detailsTarget = (path, targetLength) => detailLevel >= 2 ? `${path.padEnd(targetLength, ' ')} | "${ellipsis(getPath(targetJson, path), 100)}"` : path;
    const detailsDiff = (path, targetLength) => detailLevel >= 2 ? `${path.padEnd(targetLength, ' ')} | "${ellipsis(getPath(enJson, path), 50)}" => "${ellipsis(getPath(targetJson, path), 50)}"` : path;
    const formatDiff = (pair, targetLength) => detailLevel >= 2 ? `${pair[0].padEnd(targetLength, ' ')} | ${ellipsis(pair[1], 400)}` : pair[0];
    const detailsSection = (sectionName, items, detailsMapper, pathMapper) => {
      if (pathMapper == null)
        pathMapper = (item) => item;
      const maxLength = Math.max(...items.map(pathMapper).map(x => x.length));
      console.log(`############## ${sectionName}: ${items.length} ##############`);
      if (items.length > 0) {
        console.log(`${items.map(x => detailsMapper(x, maxLength)).join('\n')}\n`);
      }
    };

    detailsSection('Missing items', missingItems, detailsDiff);
    detailsSection('Extra items', extraItems, detailsDiff);
    detailsSection('Incorrect types', [...incorrectTypes], detailsDiff);
    detailsSection('Incorrect keys', [...incorrectKeys], detailsDiff);
    detailsSection('Similar to EN.json (or previous versions of it)', [...identicalKeys], detailsTarget);
    detailsSection('Potential format issues', keysWithFormatIssues, formatDiff, (item) => item[0]);
  }
  else {
    console.log('Missing items: ' + missingItems.length);
    console.log('Extra items: ' + extraItems.length);
    console.log('Incorrect types: ' + [...incorrectTypes].length);
    console.log('Incorrect keys: ' + [...incorrectKeys].length);
    console.log('Similar to EN.json (or previous versions of it): ' + identicalKeys.length);
    console.log('Potential format issues: ' + keysWithFormatIssues.length);
  }

  let charLength = 0;
  let keysTotal = 0;
  let approxWords = 0;

  for (const path of enPaths)
  {
    charLength += getPath(enJson, path)?.length ?? 0;
    keysTotal++;
    approxWords += getPath(enJson, path).split(" ").filter(x => x.length > 0).length;
  }

  console.log("EN.json keys: " + keysTotal + ", character length:", charLength, "words:" + approxWords);
}

// Matches stuff like <color> and \n
const formatElementRegex = /(?:<\/?[^>]*>|\n)/gm;

export function getMissingFormatElements(originalText, translatedText) {
  const originalElements = [... originalText.matchAll(formatElementRegex)].map((x, i) => [x, i]);
  const translatedElements = [... translatedText.matchAll(formatElementRegex)].map((x, i) => [x, i]);

  // Setting this to false will create a more compact diff,
  // but it might miss position changes
  const checkByPlace = true;

  if (checkByPlace) {
    for (let i = 0; i < originalElements.length && i < translatedElements.length; i++) {
      if (originalElements[i][0][0] == translatedElements[i][0][0])
      {
        originalElements.splice(i, 1);
        translatedElements.splice(i, 1);
        i--;
      }
    }
  }
  else {
    for (let i = 0; i < originalElements.length; i++)
    {
      for (let j = 0; j < translatedElements.length; j++)
      {
        if (originalElements[i][0][0] == translatedElements[j][0][0])
        {
          originalElements.splice(i, 1);
          translatedElements.splice(j, 1);
          i--;
          break;
        }
      }
    }
  }

  let formatDiff = "";
  let startRefText = "";
  let endRefText = "";

  const leftRightDiff = 10;

  if (originalElements.length > 0)
  {
    const startRef = Math.max(originalElements[0][0].index - leftRightDiff, 0);
    const endRef = Math.min(originalElements[0][0].index + leftRightDiff, originalText.length);
    startRefText = `[${originalText.substring(startRef, endRef)}]`;
  }

  for (const missingElement of originalElements)
    formatDiff += `-${missingElement[1]}(${missingElement[0]}) `;

  if (translatedElements.length > 0)
  {
    const startRef = Math.max(translatedElements[0][0].index - leftRightDiff, 0);
    const endRef = Math.min(translatedElements[0][0].index + leftRightDiff, translatedText.length);
    endRefText = `[${translatedText.substring(startRef, endRef)}]`;
  }

  for (const addedElement of translatedElements)
    formatDiff += `+${addedElement[1]}(${addedElement[0]}) `;

  if (startRefText != '' || endRefText != '')
    formatDiff += `${startRefText}=>${endRefText}`;

  return formatDiff;
}
