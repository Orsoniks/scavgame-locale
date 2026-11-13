/*
 * Translation review utils by Marioalexsan
 * CC0 license, do whatever you want with it
 *
 * Display diffs for every demo and release file as if you ran `node tools/diff.mjs <latest/latestdemo> <locale> -1` on it
 *   node tools/diffall.mjs
 *
 * You will need Node.js 24 installed to run this script.
 * Please note that this utility will fetch some GitHub files for past EN versions under the "tools/" directory.
 */

import { diff } from './diff.mjs';
import fs from "node:fs/promises";
import fsPath from "node:path";

if (import.meta.main) {
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
}

async function main()
{
    if (await fs.stat(fsPath.join("tools", "diffall.mjs"), { throwIfNoEntry: false }) === undefined)
    {
        console.log("Please run this from the repo root!");
        process.exit(0);
    }

    console.log("=== Release files ===");

    for await (const releaseFile of fs.glob("release/**/*.json", {
        exclude: ["release/EN.json"]
    }))
    {
        await diff("latest", releaseFile, -1);
    }

    console.log("=== Demo files ===");

    for await (const demoFile of fs.glob("demo/**/*.json", {
        exclude: ["demo/EN.json"]
    }))
    {
        await diff("latestdemo", demoFile, -1);
    }
}
