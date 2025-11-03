# Contributing to the Locales

We welcome contributions to the localization files! Make sure you are in touch with the community on the [discord channel](https://discord.com/channels/955738554129063947/1298240970764324914).
Different threads are available for different languages. Here are some guidelines to help you get started:

1. [Repository Structure](#repository-structure)
2. [Guidelines for Editing Localization Files](#guidelines-for-editing-localization-files)
3. [Getting Started](#getting-started)
4. [How the Localization Audit Works](#how-the-localization-audit-works)

## Repository Structure

You will find the localization files in the `Locales` directory. The reference locale is `en` (English). Each language has its own subdirectory named according to its locale code, where the first two letters represent the language, and the capitalized ones the country (e.g., `pt-BR` for Brazilian Portuguese `es-ES` for Spain Spanish).

The structure of each locale directory mirrors that of the reference locale. The files should have _exactly the same names and structure as those in the `en` directory_. For media files (images), be careful to keep the same file specifications (format, dimensions, transparency, etc.) as the reference files.

## Guidelines for Editing Localization Files

1. Do **not** edit:

   -  The `en` (English) locale files. They serve as the reference for all other locales.
   - The `README.md` and the `index.json` files. These are automatically generated.

2. While translating in json files:

   - **Never change keys** in the JSON (the left-hand identifiers). Only change values.
   - **Preserve placeholders exactly**: `<>`, `<1>`, `<color=\"grey\">`, `<limb>` etc.
   - **Keep sentence meaning**: do not invent or remove context.
   - **Spacing / punctuation**: apply your normal rules but be consistent with the project style.
   - **Short strings caution**: game UI may truncate very long text. Prefer translations with the approximate same amount of characters where possible, particularly with UI text.
   - **Keep the json entries sorted** similarly to the reference locale (`en`).
   - Don't try to '*improve*' the game, just make it your language.

3. Use a text editor or IDE that supports JSON formatting and validation to avoid syntax errors.

4. You can run the audit script locally to check your changes before pushing them. Instructions are in the [Commands And Procedures](./.github/COMMANDS.md) document.

5. Avoid using automatic translation tools for entire files, as they tend to fail to capture the context accurately. We recommend soliciting help from the community for specific terms or phrases. The [discord channel](https://discord.com/channels/955738554129063947/1298240970764324914) is for all general locale discussions, but use the specific threads for your language if available.

## Getting Started

If you don't know where to start, you might want to consult the [Commands And Procedures](./.github/COMMANDS.md) document, which explains how to clone the repository, make changes, and submit your contributions via pull requests.

### Existing Locales

> But there is already a locale for my language!

Great! Your insights and contributions are still very welcome. You can help by:

- **Getting in touch with the locale's team on the [discord channel](https://discord.com/channels/955738554129063947/1298240970764324914)**, that way they can tell you where your help’s needed most.

- **Reviewing and improving existing translations**: Even if the locale is marked as 'complete', that only means that the files are compatible, no that the translation is finalized. Translations only worked on by one person deserve to be proofread and revised.

### Creating a New Locale

> There is no locale for my language yet!

If you have read the guidelines and are ready to start translating, you can create a new locale by :

- **Getting in touch with the community on the [discord channel](https://discord.com/channels/955738554129063947/1298240970764324914)**, to see if others are interested in helping you or are already working on it.

- Creating a new directory in the `Locales` folder, named according to your locale code.

- Starting to work on the `strings.json` file.

## How the Localization Audit Works
You can see in the [README](../README.md) that a table summarizes the status of each locale, keeping track of:
- The number of files that are OK (compatible with the game)
- The number of files that have mismatches (incompatible with the game)
- The number of missing files (compared to the reference locale `en`).

A more detailed report is generated as a GitHub Actions artifact, which you can access from the "Actions" tab of the repository.
This is done every time a commit is pushed to the repository, helping you track the progress of your localization efforts.

> You should NEVER feel pressured to have a complete locale. Even partial contributions are valuable and appreciated! Also, you should not pressure others to contribute. Everyone contributes in their own time and way.

Structure checks are an indication of progress and compatibility with the game, but they do not guarantee translation quality. There are many aspects of a good translation that are not captured by these checks, such as fluency, cultural appropriateness, and context accuracy. We encourage you to seek feedback from fellow native speakers, and do tests with the community to ensure high-quality translations.

Should this audit process cease to work, please open an issue or contact one of the maintainers. You can always manually check the files against the reference locale using a JSON diff tool such as [jsondiff.com](https://jsondiff.com/).




