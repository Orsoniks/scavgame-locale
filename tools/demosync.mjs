/*
 * Translation review utils by Marioalexsan
 * CC0 license, do whatever you want with it
 *
 * This will map and sync translated lines from the release version of the game ("release/") back to demo ("demo/").
 * It will only update lines where the English texts are identical. This means that some lines may need to be updated manually.
 * The script will log lines that have not been updated in the demo file.
 *   node tools/randomlines.mjs [locale code]
 * Example:
 *   node tools/demosync.mjs ru-RU
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
    setPath,
    shouldRemainTheSame,
    isCustomText
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
    if (await fs.stat(fsPath.join("tools", "demosync.mjs"), { throwIfNoEntry: false }) === undefined)
    {
        console.log("Please run this from the repo root!");
        process.exit(0);
    }

    let targetLocale = process.argv.length >= 3 ? process.argv[2] : await rl.question('Specify locale code to sync (e.g. ko-KR): ');

    await sync(targetLocale);
}

async function sync(targetLocale)
{
    for (const folder of ["demo", "release"])
    {
        for (const locale of ["EN", targetLocale])
        {
            const path = fsPath.join(folder, `${locale}.json`);
            if (!await fs.stat(path, { throwIfNoEntry: false }))
            {
                console.log(`Couldn't find ${path}!`);
                return;
            }
        }
    }

    const demoEn = JSON.parse(await fs.readFile(fsPath.join("demo", "EN.json"), 'utf-8'));
    const releaseEn = JSON.parse(await fs.readFile(fsPath.join("release", "EN.json"), 'utf-8'));

    const demoLocale = JSON.parse(await fs.readFile(fsPath.join("demo", `${targetLocale}.json`), 'utf-8'));
    const releaseLocale = JSON.parse(await fs.readFile(fsPath.join("release", `${targetLocale}.json`), 'utf-8'));

    const pathsToSync = flattenPaths(demoLocale);
    const remaps = getIdenticalPathMap(demoEn, releaseEn);

    //console.log(remaps);

    const untouchedDemoLocalePaths = [];
    const missingReleaseTexts = [];

    let pathsSynced = 0;
    let pathsIdentical = 0;

    for (let pathToSync of pathsToSync)
    {
        if (isCustomText(pathToSync) || pathToSync == "version")
        {
            continue;
        }

        const releasePath = remaps[pathToSync] ?? pathToSync;

        const demoEnText = getPath(demoEn, pathToSync);
        const releaseEnText = getPath(releaseEn, releasePath);

        if (demoEnText == null || releaseEnText == null || demoEnText != releaseEnText)
        {
            untouchedDemoLocalePaths.push(pathToSync);
            continue;
        }

        const releaseLocaleText = getPath(releaseLocale, releasePath);

        if (releaseLocaleText == null)
        {
            missingReleaseTexts.push(pathToSync);
            continue;
        }

        if (releaseLocaleText == getPath(demoLocale, pathToSync))
        {
            pathsIdentical++;
            continue;
        }

        setPath(demoLocale, pathToSync, releaseLocaleText);
        pathsSynced++;
    }

    console.log(`Texts synced: ${pathsSynced}.`);
    console.log(`Texts without updates: ${pathsIdentical}.`);
    console.log(`Texts that weren't synced: ${untouchedDemoLocalePaths.length} (might be removed or has different text in release).`);

    for (let localePath of untouchedDemoLocalePaths)
    {
        console.log(`  - ${localePath}`);
    }

    console.log(`Missing release texts: ${missingReleaseTexts.length} (no translation available).`);

    for (let localePath of missingReleaseTexts)
    {
        console.log(`  - ${localePath}`);
    }

    // Suffix with "-sync" if you don't want to overwrite your stuff
    const savePath = fsPath.join("demo", `${targetLocale}.json`);

    await fs.writeFile(savePath, JSON.stringify(demoLocale, null, 4));
    console.log(`Results written under ${savePath}.`);
}

function getIdenticalPathMap(firstLocale, secondLocale)
{
    const firstLocalePairs = flattenPaths(firstLocale).map(path => [path, getPath(firstLocale, path)]);
    const secondLocalePairs = flattenPaths(secondLocale).map(path => [path, getPath(secondLocale, path)]);

    const remaps = {};

    for (let [firstPath, firstText] of firstLocalePairs)
    {
        if (!shouldSyncRemap(firstPath))
            continue;

        if (getPath(secondLocale, firstPath) == firstText)
            continue;

        for (let [secondPath, secondText] of secondLocalePairs)
        {
            if (firstText != null && secondText != null && firstText == secondText)
            {
                remaps[firstPath] = secondPath;
            }
        }
    }

    return remaps;
}

function shouldSyncRemap(path)
{
    // These were changed to use conditions as part of 1.0-pre3
    if (path.startsWith("pauseQuotes"))
        return true;

    return false;
}
