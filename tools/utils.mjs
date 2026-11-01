import fs from "node:fs/promises";
import fsPath from "node:path";
import readline from "node:readline/promises";
import process from "node:process";
import child_process from "node:child_process";
import crypto from "node:crypto";

export const versions = [
    "latest",
    // Demo versions
    "v5.1", "v6.0", "v6.1", "v7.0.1", "v7.7.9",
    // Release versions
    "v1.0-pre3",
    "bccaab7bc33581c79f22139f11c3bd8201129bfc", // v1.0-pre3 with additions
];

const versionDb = {
    "v5.1": { path: "EN.json", hash: "927B81F087664C8DFF06B1EF5011E9EB8B29581C8B489B5B26E29FBAE86E920B" },
    "v6.0": { path: "EN.json", hash: "754728144B867B5348E94F4124AF3F9491C6527E03032660E901A7F5896521CA" },
    "v6.1": { path: "EN.json", hash: "3FEC04F51139DF1B9312D8B10AE508E40DF68B2D00CB2BBC96A38DC7A0D62980" },
    "v7.0.1": { path: "EN.json", hash: "CD0D1C61FE202E532DA26FF3678852C60833A0AFEA8CEE04273B9424B000E080" },
    "v7.7.9": { path: "EN.json", hash: "02A53AC258EAAAE9072511EBA5170F07DF2AD391BAC55CBBD5082F7D228F2F43" }, // PS: Doesn't have the survivor note changes
    "v1.0-pre3": { path: "release/EN.json", hash: "3D804E7491A5FC961D6C0A9D3D63CE168ADA1D70D0716B30DCB738A6E9436AAE" },
    "bccaab7bc33581c79f22139f11c3bd8201129bfc": { path: "release/EN.json", hash: "3A6B49732F01D1FCA228E10A5EB4E5ECEF2FC66AFD241B68E520226E4B03AB5E" },
}

export function flattenPaths(target, basePath = '')
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

export function getPath(target, path)
{
    const parts = path.split(".");
    const key = parts[0];
    const value = target != null ? target[key] : null;

    if (parts.length == 1)
        return value;

    else
        return getPath(value, parts.slice(1).join('.'));
}

export function setPath(target, path, value)
{
    const parts = path.split(".");
    const key = Array.isArray(target) ? parseInt(parts[0]) : parts[0];

    if (parts.length == 1)
        target[key] = value;

    else
        return setPath(target[key], parts.slice(1).join('.'), value);
}


export function shouldRemainTheSame(path, origText) {
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
export function isCustomText(path) {
    if (path == 'description')
        return true;

    if (path == 'name')
        return true;

    return false;
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

export async function getEnVersion(version)
{
    const enPath = version === "latest" ? 'release/EN.json' : fsPath.join("tools", `EN-${version}.json`);

    if (version != "latest") {
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
