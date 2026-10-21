/*
 * Translation review utils by Marioalexsan
 * CC0 license, do whatever you want with it
 *
 * (NOT IMPLEMENTED FULLY)
 *
 * Randomly (but uniformly) compare lines from a locale with EN.json:
 *   node tools/randomlines.mjs [version, or latest for the EN.json in root] [locale path] [roughly how many lines to review]
 * Example:
 *   node tools/randomlines.mjs latest demo/es-419.json 100
 *
 * You will need Node.js 24 installed to run this script.
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
    if (await fs.stat(fsPath.join("tools", "randomlines.mjs"), { throwIfNoEntry: false }) === undefined)
    {
        console.log("Please run this from the repo root!");
        process.exit(0);
    }

    let targetVersion = process.argv.length >= 3 ? process.argv[2] : await rl.question('Game version to check against (empty for latest from repo): ');
    let targetLocale = process.argv.length >= 4 ? process.argv[3] : await rl.question('Path to locale (e.g. demo/ko-KR.json): ');
    let numLines = parseInt(process.argv.length >= 5 ? process.argv[4] : await rl.question('Number of lines to review: '));

    if (!targetLocale.endsWith(".json"))
        targetLocale += ".json";

    if (targetVersion == "")
        targetVersion = "latest";

    if (Number.isNaN(numLines) || numLines < 1)
        numLines = 1;

    await randomLines(targetVersion, targetLocale, numLines);
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
