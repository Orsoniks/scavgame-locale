# Translation Notes

This document contains extra notes about some of the texts present in the English locale, like context to take into consideration while translating, or specific references used.

- [General notes](#general-notes)
  - [Translation style](#translation-style)
  - [Survivor notes](#survivor-notes)
- [Notes on specific texts](#notes-on-specific-texts)
  - [Main](#main)
  - [Buildings](#buildings)
  - [Moodles](#moodles)
  - [Other](#other)
  - [Character](#character)
    - [Experiment](#experiment)
  - [Survivor notes](#survivor-notes-1)
  - [PDA notes](#pda-notes)
  - [Pause quotes](#pause-quotes)

## General notes

### Translation style

You should follow the guidelines from [CONTRIBUTING.md](./.github/CONTRIBUTING.md#guidelines-for-editing-localization-files) regarding the editing of translation files.

Some translation choices are discouraged:
- **Avoid adding references that aren't present in the source material.** If you cannot say for sure that a text in the game references a different video game, book, movie, etc., then it would be best to avoid translating it with such a reference in mind.
  - For example, referencing Space Marines for `dropcapsuledsc`'s text is not acceptable, given the original text doesn't involve anything related to it at all.
  - If unsure, check [Notes on specific texts](#notes-on-specific-texts) if it explicitly mentions a text being a reference.
- **Pay attention to how swears and insults are translated.** Swears and insults should still preserve their meaning and intent from English.
  - **Avoid slurs.** It might be tempting to translate some words using slurs since they are commonly used in languages like Russian, but slurs are *not* present in the source material, and their usage is generally not acceptable.
  - **Avoid swears and insults relating to sexual stuff.** The source material doesn't use swears in that way, and it will likely not fit the game's characters and the lore behind them.

Some other things to keep in mind while translating:
- UI elements may refer to either the player, or the playable character, as many strings contain references to meta actions (e.g. pressing keyboard buttons) that only the player can perform. If you're looking to treat texts differently depending on the addressee (e.g. formal/informal grammar), keep that distinction in mind.
- If possible, liquid containers should be named and described in a way that informs the player of its original contents *without* implying that those are still present in the container. Most liquids may get substituted with others throughout gameplay.
  - For example, `chocolatemilkdsc` mentions `A large plastic bottle that holds up to a liter of liquid.`. During gameplay, the player may choose to drain the bottle and fill it with water, in which case the UI will show that it is filled with clean water instead of chocolate milk. Due to this, translating the description in a way that implies it is still filled with chocolate milk wouldn't be advisable.

### Survivor notes

Survivor notes are stored under the `notes` array in EN.json. Each inner array (numbered starting from 0) contains notes that can be found in a specific layer:
- 0: Generic notes
- 1: Gravel lands
- 2: Deeper gravel lands
- 3: Dried desert
- 4: Wasteland
- 5: Overgrown depths
- 6: Frozen chasm
- 7: Fungal pools
- 8: Crystalline hollow

The game will randomly pick between a generic note and a layer-specific note when spawning one.

There are three fields per note entry, out of which the last two should remain unchanged:
- `Item1` - represents the text that will be displayed in-game.
- `Item2` - represents the sprite that will be rendered alongside the note on the right - should remain unchanged.
- `Item3` - represents which character wrote the note and which font will be used as a result - should remain unchanged.

## Notes on specific texts

### Main

| Line | Text | Notes |
| ---- | ---- | ----- |
| 22 | `musharmdsc` | Usually, Wrapvine (Musharm) will decay before you get the chance to use it on multiple limbs, which is why the description mentions `one-time`. However, it is still possible to use it on multiple limbs if used sparingly. |
| 143 | `geofruit` | `Geofruit` is a portmanteau of "geometric" and "fruit" |
| 301 | `mushpear` | `Numberry` is a portmanteau of "numb" and "berry". The translation key `mushpear` currently refers to the previous name this plant had. |
| 305 | `aquapple` | `Aquapple` is a portmanteau of "aqua" and "apple". |
| 326 | `scarfdsc` | `Makes you feel like a mercenary...` is a reference to the main character from Gunsaw, who wears a scarf. |
| 410 | `lockpickingkitdsc` | `Main inventory` refers to any of the six inventory slots the character has. It doesn't need to be in the main hand to be used. |
| 451 | `helluce` | `Helluce` is a portmanteau of "hell" and "lettuce" - *"hell cause hot and lettuce cause it's a leaf-looking herb"*. |
| 681 | `hydreed` | `Hydreed` is a portmanteau of either "hydra" and "weed" (due to the multiple arms), or "hydrate" and "weed" (due to the water content). |

### Buildings

| Line | Text | Notes |
| ---- | ---- | ----- |
| 656 | `lifepodbuttonheatdsc` | `<>` is replaced with one of `heaterhot`, `heatercold` or `heateroff` when toggling the lifepod's temperature. |
| 704 | `scrapeaterdsc` | `<>` is replaced with a number in the range 0-100, representing the current percentage of scrap given to the scrap eater. |


### Moodles

| Line | Text | Notes |
| ---- | ---- | ----- |
| 993 | `bleeding4dsc` | `As your life gushes out behind you, you remember that you are mortal.` may be a reference to ["Memento mori"](https://en.wikipedia.org/wiki/Memento_mori) (latin for "remember [that you have] to die"). |
| 1015 | `sepsis3dsc` | `You couldn't stop for death, so death has kindly stopped by for you.` may be a reference to the poem ["Because I could not stop for Death"](https://en.wikipedia.org/wiki/Because_I_could_not_stop_for_Death) by Emily Dickinson. |
| 1036 | `thirst4dsc` | `Your dust is becoming one with the earth...` may be a reference to [Ecclesiastes 12:7](https://en.wikipedia.org/wiki/Ecclesiastes_12#Verse_7). |
| 1087 | `irradiated4dsc` | `Not going gently into that good night...` may be a reference to the poem ["Do not go gentle into that good night"](https://en.wikipedia.org/wiki/Do_not_go_gentle_into_that_good_night) by Dylan Thomas. |

### Other

Texts related to the end screen stats (like `endscreenstatus`, `endscreendeceased`, etc.) are limited in space. You should expect to have at most 25-30 characters available to you.

| Line | Text | Notes |
| ---- | ---- | ----- |
| 1169 | `skillup` | `<>` is the skill that got increased (`strength`, `resilience` or `intelligence`), `<1>` is the previous level, `<2>` is the new level. |
| 1642 | `damagereduction` | The damage reduction percentage is appended to the right. |
| 1643 | `bodyinsulation` | The body insulation percentage is appended to the right. |
| 1685 | `watchbleedout` | The estimated time before full bleedout is appended to the right. |
| 1686 | `watchinfected` | The full names of the lumbs that are infected are appended to the right. |
| 1687 | `watchlimbheal` | The full name of the limb is appended to the left, and the time for it to heal its fracture or dislocation is appended to the right. | 
| 1688 | `watchweight` | `watchweightlost` or `watchweightgained`, then the weight gained or lost is appended to the right separated by ": ". If translating is inconvenient, you may choose to keep `watchweightlost` empty and to add the text directly to `watchweightlost` or `watchweightgained`. |
| 1691 | `watchruntime` | The current run time is appended to the right. |
| 1692 | `watchtemperature` | The current ambient temperature is appended to the right. |
| 1693 | `watchfibrillation` | The current fibrillation progress percentage is appended to the right. |
| 1703 | `craftingredientsdsc` | `<>` is the current keybind used for adding items to favorites. |
| 1709 | `craftexample` | `<>` is the item that can be used for this recipe (`campfire`, `firestarter`, etc.) |
| 1711 | `craftitemquality` | `<1>` is the quality amount required, `<2>` is the quality name (`cqproduce`, `cqdressing`, etc.) |
| 1712 | `craftliquidquality` | `<1>` is the quality amount required, `<2>` is the quality name (`cqwater`, `cqfat`, etc.) |
| 1713 | `craftcondition` | `<>` is the minimum condition required for the item. |
| 1714 | `craftml` | `<>` is the minimum volume of liquid required. |
| 1718 | `craftinfoint` | `<1>` is the INT required to craft the recipe, `<2>` is the current INT of the character. |
| 1766 | `napinfo` | `<>` is one of `sleepquality0` through `sleepquality3` |
| 1809 | `hpsickness` | `Sickness` in the context of the game mechanic specifically refers to "the feeling that you are likely to vomit" |
| 1854 | `alertalreadywearing` | `<1>` is the item the player tries to wear, `<2>` is the item they are already wearing that is conflicting by wearable slot. | 
| 1858 | `alertlimbmissing` | `<1>` is the **short name** of the missing (amputated) limb, `<2>` is the item the player is trying to wear that requires the given limb. |
| 1871 | `hasbattery` | `<>` is the name of the battery inserted into the item. |
| 1872 | `nobattery` | `<>` is the name of the maximum battery size that can be inserted into the item (one of `small`, `medium` or `large` in the `other` section). |
| 1891 | `lockprecision` | The precision in degrees is appended to the right, followed by a space and one of `degree` or `degrees` for the unit. |

### Character

Some texts might make use of the `<limb>` placeholder. This placeholder is replaced with the **short name** of the limb the character is referring to.

Due to differences in grammar between languages, it may be hard to translate those texts correctly while accounting for changes in gender and case of the various limb translations that can be inserted.

#### Experiment

| Line | Text | Notes |
| ---- | ---- | ----- |
| 2202 | `seeGravel` | `My parent would be proud...` is related to the specific, genderless biology of the Sawians. They generally have one single parent as a result. |

### Survivor notes

Generally, survivor notes follow a specific writing pattern based on the character that wrote the note. It is strongly recommended to preserve this style in translated text:
- Milkys use proper grammar and punctuation in writing.
- Experiments tend to omit capitals and punctuation.
- Dunes have bad grammar, omit capitals, and have uneven spacing in notes. They refer to themselves in third person, similar to how they do it during speech.
  - One exception is the note at line 4780, which is written with all capitals.

### PDA notes

***Note that PDA notes are likely to be rewritten entirely before the 1.0 release.***

When corrupt data sequences like `<corrupt:0xFA05F2>` appear in PDA notes, the same hexadecimal value is used when referring to the same "subject" that got corrupted. This allows identifying speakers in some cases.

For example, `<corrupt:0xFA05F2>` is supposed to be the project director in the PDA note at line 5006, `<corrupt:0xFFFFD9>` identifies the doctor that is in favor of the Sawian project, and so on.

### Pause quotes

Pause quotes are from the point of view of the "Observer", who is a "paranormal entity that oversees everything and is driven by curiosity". As such, certain texts like `"Human" is not the only thing watching.`, `You're gonna give me a headache. Or, you would, if I could feel pain.`, `I am still here.`, and others, are likely the Observer referring to itself.
