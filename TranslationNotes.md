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

You should follow the guidelines from [CONTRIBUTING.md](./CONTRIBUTING.md#guidelines-for-editing-localization-files) regarding the editing of translation files.

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
- 9: Geothermal Vents

The game will randomly pick between a generic note and a layer-specific note when spawning one.

There are three fields per note entry, out of which the last two should remain unchanged:
- `Item1` - represents the text that will be displayed in-game.
- `Item2` - represents the sprite that will be rendered alongside the note on the right - should remain unchanged.
- `Item3` - represents which character wrote the note and which font will be used as a result - should remain unchanged.

## Formating elements

Some texts make use of TextMeshPro's [Rich Text tags](https://docs.unity3d.com/Packages/com.unity.textmeshpro@3.2/manual/RichText.html), like `<color=\"grey\">Okay</color>` to render text with specific colors or styles. Ideally, these should be preserved or adapted so that the text is stylized in the same way as part of locales. For example, `epdalearn` in English uses `Gained <color=\"green\">35 INT exp.`, which highlights "35 INT exp." in green. In Korean, `<color=\"green\">35 지성 경험치</color> 획득.` adds a `</color>` closing tag to make sure the rest of the text after "35 지성 경험치" is colored normally.

As part of specific texts, the `<>` sequence has special meaning, and causes a "Click to continue..." prompt to appear instead. This applies to the following texts:
- all survivor notes
- all PDA entries
- scrolling lore texts, like:
  - `other.surfacebreachnote`
  - `other.labenternote`
  - `other.biopodnote`
  - `other.biopodnotealt`
  - `other.biopodnotealt2`
  - `other.escapenote1`
  - `other.escapenote2`
  - `other.mercnote1`
  - `other.mercnote2`
  - `other.mercnote3`
  - `other.startlorenote`

## Notes on specific texts

- When translating items that refer to `mush` (i.e. `Antiseptic mush`, `Mushlight`, `Clotting mush`, etc.), translate it as "a soft, thick mass or mixture". Do not translate it as "fungi" unless it is explicitly described as a fungi, or is visually made out of fungi in-game.

### Main

Covers lines 5 through 610 in the `"main"` section.

| Text | Notes |
| ---- | ----- |
| `musharmdsc` | Usually, Wrapvine (Musharm) will decay before you get the chance to use it on multiple limbs, which is why the description mentions `one-time`. However, it is still possible to use it on multiple limbs if used sparingly. |
| `geofruit` | `Geofruit` is a portmanteau of "geometric" and "fruit" |
| `mushpear` | `Numberry` is a portmanteau of "numb" and "berry". The translation key `mushpear` currently refers to the previous name this plant had. |
| `aquapple` | `Aquapple` is a portmanteau of "aqua" and "apple". |
| `scarfdsc` | `Makes you feel like a mercenary...` is related to the M.E.R.C scarf, one of the endings of the game, as well as the Mercenary character from Gunsaw. |
| `helluce` | `Helluce` is a portmanteau of "hell" and "lettuce" - *"hell cause hot and lettuce cause it's a leaf-looking herb"*. |

### Buildings

Covers lines 611 through 873 in the `"buildings"` section.

| Text | Notes |
| ---- | ----- |
| `lifepodbuttonheatdsc` | `<>` is replaced with one of `heaterhot`, `heatercold` or `heateroff` when toggling the lifepod's temperature. |
| `hydreed` | `Hydreed` is a portmanteau of either "hydra" and "weed" (due to the multiple arms), or "hydrate" and "weed" (due to the water content). |
| `scrapeaterdsc` | `<>` is replaced with a number in the range 0-100, representing the current percentage of scrap given to the scrap eater. |

### Moodles

Covers lines 874 through 1221 in the `"moodles"` section.

For moodles that have dynamic values in their description, `<>` is replaced with the related value:
- `exertion` - current stamina percentage
- `dirty` - current dirtiness percentage
- `encumbered` - current overencumbrance percentage
- `keratinbooster` - buff time in `h:m:ss` format
- `energized` - buff time in `hh:mm:ss` format
- `rnrs` - debuff time in `hh:mm:ss` format

| Text | Notes |
| ---- | ----- |
| `bleeding4dsc` | `As your life gushes out behind you, you remember that you are mortal.` may be a reference to ["Memento mori"](https://en.wikipedia.org/wiki/Memento_mori) (latin for "remember [that you have] to die"). |
| `sepsis3dsc` | `You couldn't stop for death, so death has kindly stopped by for you.` may be a reference to the poem ["Because I could not stop for Death"](https://en.wikipedia.org/wiki/Because_I_could_not_stop_for_Death) by Emily Dickinson. |
| `thirst4dsc` | `Your dust is becoming one with the earth...` may be a reference to [Ecclesiastes 12:7](https://en.wikipedia.org/wiki/Ecclesiastes_12#Verse_7). |
| `irradiated4dsc` | `Not going gently into that good night...` may be a reference to the poem ["Do not go gentle into that good night"](https://en.wikipedia.org/wiki/Do_not_go_gentle_into_that_good_night) by Dylan Thomas. |

### Other

Covers lines 1222 through 2425 in the `"other"` section.

Texts related to the end screen stats (like `endscreenstatus`, `endscreendeceased`, etc.) are limited in space. You should expect to have at most 25-30 characters available to you, so you may need to adjust your translations accordingly.

| Text | Notes |
| ---- | ----- |
| `skillup` | `<>` is the skill that got increased (`strength`, `resilience` or `intelligence`), `<1>` is the previous level, `<2>` is the new level. |
| `damagereduction` | The damage reduction percentage is appended to the right. |
| `bodyinsulation` | The body insulation percentage is appended to the right. |
| `watchbleedout` | The estimated time before full bleedout is appended to the right. |
| `watchinfected` | The full names of the limbs that are infected are appended to the right. |
| `watchlimbheal` | The full name of the limb is appended to the left, and the time for it to heal its fracture or dislocation is appended to the right. | 
| `watchweight` | `watchweightlost` or `watchweightgained`, then the weight gained or lost is appended to the right separated by ": ". If translating is inconvenient, you may choose to keep `watchweightlost` empty and to add the text directly to `watchweightlost` or `watchweightgained`. |
| `watchruntime` | The current run time is appended to the right. |
| `watchtemperature` | The current ambient temperature is appended to the right. |
| `watchfibrillation` | The current fibrillation progress percentage is appended to the right. |
| `craftingredientsdsc` | `<>` is the current keybind used for adding items to favorites. |
| `craftexample` | `<>` is the item that can be used for this recipe (`campfire`, `firestarter`, etc.) |
| `craftitemquality` | `<1>` is the quality amount required, `<2>` is the quality name (`cqproduce`, `cqdressing`, etc.) |
| `craftliquidquality` | `<1>` is the quality amount required, `<2>` is the quality name (`cqwater`, `cqfat`, etc.) |
| `craftcondition` | `<>` is the minimum condition required for the item. |
| `craftml` | `<>` is the minimum volume of liquid required. |
| `craftinfoint` | `<1>` is the INT required to craft the recipe, `<2>` is the current INT of the character. |
| `napinfo` | `<>` is one of `sleepquality0` through `sleepquality3` |
| `hpsickness` | `Sickness` in the context of the game mechanic specifically refers to "the feeling that you are likely to vomit" |
| `alertalreadywearing` | `<1>` is the item the player tries to wear, `<2>` is the item they are already wearing that is conflicting by wearable slot. | 
| `alertlimbmissing` | `<1>` is the **short name** of the missing (amputated) limb, `<2>` is the item the player is trying to wear that requires the given limb. |
| `nanotechdepthinitialleft` | `<>` is replaced with the depth of the chip (e.g. 1850m) |
| `nanotechdepthinitialright` | Same as `nanotechdepthinitialright` from above. |
| `alertprosthesisfail` | `<>` is replaced with the specific INT required for the given prosthesis type. |
| `hasbattery` | `<>` is the name of the battery inserted into the item. |
| `nobattery` | `<>` is the name of the maximum battery size that can be inserted into the item (one of `small`, `medium` or `large` in the `other` section). |
| `lockprecision` | The precision in degrees is appended to the right, followed by a space and one of `degree` or `degrees` for the unit. |
| `endsc1` | `<>` is replaced with the character's specimen number from the health panel. |
| `endsc2` | Same as `endsc1` from above. |

### Character

Covers lines 2426 through 6207 in the `"character"` section.

Some texts might make use of the `<limb>` placeholder. This placeholder is replaced with the **short name** of the limb the character is referring to.

Due to differences in grammar between languages, it may be hard to translate those texts correctly while accounting for changes in gender and case of the various limb translations that can be inserted.

Some specific lines from the `braindamaged` sections are texts written in Draconic. You may leave those in their "untranslated" form.

#### Experiment

| Text | Notes |
| ---- | ----- |
| `seeGravel` | `My parent would be proud...` - Due to the specific, genderless biology of the Sawians, they generally have one single parent. |

#### Dune

| Text | Notes |
| ---- | ----- |
| `wwmrwrongway` | Try to translate `No wa-y.` as if it were "Wrong way". |

### Survivor notes

Generally, survivor notes follow a specific writing pattern based on the character that wrote the note. It is strongly recommended to preserve this style in translated text:
- Milkys use proper grammar and punctuation in writing.
- Experiments tend to omit capitals and punctuation.
- Dunes have bad grammar, omit capitals, and have uneven spacing in notes. They refer to themselves in third person, similar to how they do it during speech.
  - One exception is the note at line 4780, which is written with all capitals.

### PDA notes

| PDA Entry | Notes |
| --------- | ----- |
| PDA #9 (line 6784) | `I'm just here for the free radicals` can be interpreted as a chemistry joke version of `I'm just here for the free pizza` and [free radicals](https://en.wikipedia.org/wiki/Free_radical). You can use a different chemistry joke if the translated version doesn't work well in your language. |

### Pause quotes

Pause quotes are from the point of view of the "Observer", who is a "paranormal entity that oversees everything and is driven by curiosity".

The quotes are split into categories based on the situation in which they're used, i.e. "normal" for generic quotes, "dying" for when the player is in a dire health state, etc.

| Text | Notes |
| ---- | ----- |
| Happy entry #3 | `Overconfidence is a slow and insidious killer.` is a reference to [one of the Ancestor's quotes](https://darkestdungeon.wiki.gg/wiki/File:Vo_narr_good_victoryfirst_02.ogg) in Darkest Dungeon. |
