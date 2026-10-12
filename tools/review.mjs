/*
  Translation review utils by Marioalexsan
  CC0 license, do whatever you want with it

  Compare a locale with EN.json:
    node tools/review.mjs diff [version, or latest for the EN.json in root] [locale code] [0-2 for how detailed the report should be]
  Example:
    node tools/review.mjs diff latest demo/es-419 2
    node tools/review.mjs diff 7.0.1 demo/uk-UA 1

  (NOT IMPLEMENTED FULLY) Randomly (but uniformly) compare lines from a locale with EN.json:
    node tools/review.mjs randomlines [version, or latest for the EN.json in root] [locale code] [roughly how many lines to review]
  Example:
    node tools/review.mjs randomlines latest demo/es-419 100

  You will need Node.js 24 installed to run this script.
  Please note that this utility will fetch some GitHub files for past EN versions under the "tools/" directory.
*/

import fs from "node:fs/promises";
import fsPath from "node:path";
import readline from "node:readline/promises";
import process from "node:process";
import child_process from "node:child_process";
import crypto from "node:crypto";

const versions = [
  "vlatest",
  // Demo versions
  "v5.1", "v6.0", "v6.1", "v7.0.1", "v7.7.9",
  // Release versions
  "v1.0-pre3",
];

const versionDb = {
  "v5.1": { path: "EN.json", hash: "927B81F087664C8DFF06B1EF5011E9EB8B29581C8B489B5B26E29FBAE86E920B" },
  "v6.0": { path: "EN.json", hash: "754728144B867B5348E94F4124AF3F9491C6527E03032660E901A7F5896521CA" },
  "v6.1": { path: "EN.json", hash: "3FEC04F51139DF1B9312D8B10AE508E40DF68B2D00CB2BBC96A38DC7A0D62980" },
  "v7.0.1": { path: "EN.json", hash: "CD0D1C61FE202E532DA26FF3678852C60833A0AFEA8CEE04273B9424B000E080" },
  "v7.7.9": { path: "EN.json", hash: "02A53AC258EAAAE9072511EBA5170F07DF2AD391BAC55CBBD5082F7D228F2F43" }, // PS: Doesn't have the survivor note changes
  "v1.0-pre3": { path: "release/EN.json", hash: "3D804E7491A5FC961D6C0A9D3D63CE168ADA1D70D0716B30DCB738A6E9436AAE" },
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function flattenPaths(target, basePath = '')
{
  if (typeof target !== "object")
    return [ `${basePath}` ];

  const paths = [];

  for (const [key, value] of Object.entries(target))
  {
    paths.push(...flattenPaths(value, basePath === '' ? key : `${basePath}.${key}`));
  }

  return paths;
}

function getPath(target, path)
{
  const parts = path.split(".");
  const key = parts[0];
  const value = target != null ? target[key] : null;

  if (parts.length == 1)
    return value;

  else
    return getPath(value, parts.slice(1).join('.'));
}

async function fetchEnVersion(version) {
  if (!versionDb[version] || !versionDb[version].hash) {
    console.log(`Unknown version ${version}! Cannot fetch it.`);
    return null;
  }

  const url = `https://raw.githubusercontent.com/orsoniks/scavgame-locale/${version}/${versionDb[version].path}`;

  try {
    const response = await fetch(url);
    const data = await response.text();
    const dataHash = crypto.createHash('sha256').update(data, 'utf-8').digest('hex').toUpperCase();

    console.log(`Fetched version ${version} with hash ${dataHash}`);
    if (dataHash != versionDb[version].hash)
    {
      console.log(`Hash did not match! Expected to get hash ${versionDb[version].hash}`);
      return null;
    }

    return data;
  }
  catch (e) {
    console.log(`Couldn't fetch EN version ${version}: ${e.message}`);
    return null;
  }
}

async function getEnVersion(version)
{
  const enPath = version === "vlatest" ? 'release/EN.json' : fsPath.join("tools", `EN-${version}.json`);

  if (version != "vlatest") {
    if (await fs.stat(enPath, { throwIfNoEntry: false }) !== undefined) {
      console.log(`Found cached EN version ${version}.`);
    } else {
      console.log(`Fetching EN version ${version}...`);
      const data = await fetchEnVersion(version);
      if (data != null) {
        try {
          await fs.writeFile(enPath, data);
        }
        catch (e) {
          console.log(`Couldn't save fetched EN version ${version} to ${enPath}: ${e.message}`);
        }
      }
    }
  }

  try
  {
    return JSON.parse(await fs.readFile(enPath, 'utf-8'))
  }
  catch (e)
  {
    console.log(`Couldn't read EN version ${version} from ${enPath}: ${e.message}`);
    return null;
  }
}

function shouldRemainTheSame(path, origText) {
  if (path.startsWith('notes.') && (path.endsWith('.Item2') || path.endsWith('.Item3')))
    return true;

  if (path.startsWith('pdaNotes.') && (path.endsWith('.Item2')))
    return true;

  if (origText == '<spoiler>')
    return true;

  if (path == 'version')
    return true; // If present, it should be identical to EN.json's field

  // Most likely no actual symbols to translate here
  if (/^[\s.,;:?!\-_0-9\/\\'"{}[\]=+@~#]*$/.test(origText))
    return true;

  return false;
}

// Most checks won't matter for these fields
function isCustomText(path) {
  if (path == 'description')
    return true;

  if (path == 'name')
    return true;

  return false;
}

// Matches stuff like <color> and \n
const formatElementRegex = /(?:<\/?[^>]*>|\n)/gm;

function getMissingFormatElements(originalText, translatedText) {
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

async function main()
{
  if (await fs.stat(fsPath.join("tools", "review.mjs"), { throwIfNoEntry: false }) === undefined)
  {
    console.log("Please run this from the repo root!");
    process.exit(0);
  }

  if (process.argv.length < 3)
  {
    console.log("Specify what to do as the first argument (options: diff, randomlines).");
    process.exit(0);
  }

  if (!["diff", "randomlines"].includes(process.argv[2]))
  {
    console.log(`Action '${process.argv[2]}' was not recognized, should be "diff" or "randomlines".`);
    process.exit(0);
  }

  let targetVersion = process.argv.length >= 4 ? process.argv[3] : await rl.question('Game version to check against (empty for latest from repo): ');
  let targetLocale = process.argv.length >= 5 ? process.argv[4] : await rl.question('Locale code to check (e.g. ko-KR): ');

  if (!targetLocale.endsWith(".json"))
    targetLocale += ".json";

  if (targetVersion == "")
    targetVersion = "vlatest";

  if (!targetVersion.startsWith("v"))
    targetVersion = "v" + targetVersion;

  if (process.argv[2] == "diff")
  {
    let detailLevel = parseInt(process.argv.length >= 6 ? process.argv[5] : await rl.question('Detail level (0-2): '));

    if (Number.isNaN(detailLevel) || detailLevel < 0 || detailLevel > 2)
      detailLevel = 0;

    await diff(targetVersion, targetLocale, detailLevel);
  }
  else if (process.argv[2] == "randomlines")
  {
    let numLines = parseInt(process.argv.length >= 6 ? process.argv[5] : await rl.question('Number of lines to review: '));

    if (Number.isNaN(numLines) || numLines < 1)
      numLines = 1;

    await randomLines(targetVersion, targetLocale, numLines);
  }
}

async function randomLines(targetVersion, targetLocale, numLines)
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

  const enPaths = flattenPaths(enJson).filter(enPath => !shouldRemainTheSame(enPath, getPath(enJson, enPath)));

  const advance = Math.max(Math.floor(enPaths.length / numLines), 1);

  for (let i = 0; i < enPaths.length; i += advance)
  {
    const index = Math.min(Math.max(i + crypto.randomInt(0, advance), 0), enPaths.length - 1);
    const originalText = getPath(enJson, enPaths[index]);
    const translatedText = getPath(targetJson, enPaths[index]);

    console.log(`== ${enPaths[index]} (line ${index + 1} / ${enPaths.length}) ==`);
    console.log("");
    console.log(originalText);
    console.log("");
    console.log(translatedText);
    console.log("");

    if (process.platform === "linux")
    {
      child_process.spawn("wl-copy", [translatedText]); // Assumes Wayland for now
      await rl.question("Press Enter for next line (current translated text was copied to clipboard).");
    }
    else
    {
      await rl.question("Press Enter for next line.");
    }
    console.clear();
  }

  console.log("Done with all lines!");
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
