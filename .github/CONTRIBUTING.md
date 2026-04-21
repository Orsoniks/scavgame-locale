# Contributing to the Locales

We welcome contributions to the localization files! Make sure you are in touch with the community on the [discord channel](https://discord.com/channels/955738554129063947/1298240970764324914).
Different threads are available for different languages. Here are some guidelines to help you get started:

1. [Repository Structure](#repository-structure)
2. [Guidelines for Editing Localization Files](#guidelines-for-editing-localization-files)
3. [Getting Started](#getting-started)
4. [Pull Request Guide](#pull-request-guide)

## Repository Structure

You will find the localization files in the root directory. The reference locale is `en.json` (English). Each language has its own json file named according to its locale code, where the first two letters represent the language, and the capitalized ones the country (e.g., `pt-BR.json` for Brazilian Portuguese `es-ES.json` for Spain Spanish).

## Guidelines for Editing Localization Files

1. Do **not** edit:

   -  The `en.json` (English) locale file, as it serves as the reference for all other locales. Should you correct a typo present in the reference, it should berforehand be discussed with @Orsoniks.

2. While translating in json files:

   - **Never change keys** in the JSON (the left-hand identifiers). Only change values.
   - **Preserve placeholders exactly**: `<>`, `<1>`, `<color=\"grey\">`, `<limb>` etc.
   - **Keep sentence meaning**: do not invent or remove context.
   - **Spacing/punctuation**: apply normal rules but be consistent with the project style.
   - **Short strings caution**: game UI may truncate very long text. Prefer translations with the approximate same amount of characters where possible, particularly with UI text.
   - **Keep the json entries sorted** similarly to the reference locale (`en.json`).
   - Don't try to '*improve*' the game, just make it your language.

3. Use a text editor or IDE that supports JSON formatting and validation to avoid syntax errors(avoid editing within GitHub as an example).

4. Avoid using automatic translation tools for entire files, as they tend to fail to capture context accurately. We recommend soliciting help from the community for specific terms or phrases. The [discord channel](https://discord.com/channels/955738554129063947/1298240970764324914) is for all general locale discussions, but use the specific threads for your language if available.

## Getting Started

### Existing Locales

> But there is already a locale for my language!

Great! Your insights and contributions are still very welcome. You can help by:

- **Getting in touch with the locale's team on the [discord channel](https://discord.com/channels/955738554129063947/1298240970764324914)**, that way they can tell you where your help’s needed most.

- **Reviewing and improving existing translations**: Even if the locale is present, it does not necessarly mean it is finalized. Translations only worked on by one person deserve to be proofread and revised. Also, if the `en.json` file is more recent than a locale file, it usually means that it is outdated and changes need to be brought to the locale.

### Creating a New Locale

> There is no locale for my language yet!

If you have read the guidelines and are ready to start translating, you can create a new locale by :

- **Getting in touch with the community on the [discord channel](https://discord.com/channels/955738554129063947/1298240970764324914)**, to see if others are interested in helping you or are already working on it.

- Creating a fork of this repository.

- Adding your new locale file, committing regularly to save your progression on your side.

- Credit yourself, your potential co-tranlators and register your locale with a new line in the `README.md`.

- Creating a pull request (PR) on the main repository.

> You should NEVER feel pressured to have a complete locale. Even partial contributions are valuable and appreciated! Also, you should not pressure others to contribute. Everyone contributes in their own time and way.

## Pull Request Guide

Make sure your pull request follows these rules to increase speed and chances of approval:

1. The locale file must be **fully up-to-date with `en.json`**.
   - No lines may be missing (missing entries cause display errors).
   - If submitting a partial translation, keep untranslated lines in **English**.

2. When updating an existing locale, **use the current translation as a base**.
   - Add any new keys introduced in `en.json`.
   - Only rewrite everything if the translation is severely outdated (>1 year) or clearly low quality.

3. Translations must be reviewed and approved by **at least one native speaker** of the target language. Two heads are better than one!

4. Credit yourself and any co-translators, and add make sure your locale is present in `README.md`.

5. Add a descriptive message to your pull request.