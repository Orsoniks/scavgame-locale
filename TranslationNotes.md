# Translation Notes

This document contains extra notes about some of the texts present in the English locale, like context to take into consideration while translating, or specific references used.

- [General notes](#general-notes)
  - [Translation style](#translation-style)
  - [Survivor notes](#survivor-notes)
- [Notes on specific texts](#notes-on-specific-texts)
  - [Main](#main)
  - [Moodles](#moodles)
  - [Other](#other)
  - [Pause Quotes](#pause-quotes)

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

| Text | Notes |
| ---- | ----- |
| `musarmdsc` | Usually, Wrapvine (Musharm) will decay before you get the chance to use it on multiple limbs, which is why the description mentions `one-time`. However, it is still possible to use it on multiple limbs if used sparingly. |
| `helluce` | `Helluce` is a portmanteau of "hell" and "lettuce" - *"hell cause hot and lettuce cause it's a leaf-looking herb"*. |
| `mushpear` | `Numberry` is a portmanteau of "numb" and "berry". The translation key `mushpear` currently refers to the previous name this plant had. |
| `hydreed` | `Hydreed` is a portmanteau of either "hydra" and "weed" (due to the multiple arms), or "hydrate" and "weed" (due to the water content). |
| `aquapple` | `Aquapple` is a portmanteau of "aqua" and "apple". |
| `lockpickingkitdsc` | `Main inventory` refers to any of the six inventory slots the character has. It doesn't need to be in the main hand to be used. |

### Moodles

| Text | Notes |
| ---- | ----- |
| `bleeding4dsc` | `As your life gushes out behind you, you remember that you are mortal.` may be a reference to ["Memento mori"](https://en.wikipedia.org/wiki/Memento_mori) (latin for "remember [that you have] to die"). |
| `thirst4dsc` | `Your dust is becoming one with the earth...` may be a reference to [Ecclesiastes 12:7](https://en.wikipedia.org/wiki/Ecclesiastes_12#Verse_7). |
| `sepsis3dsc` | `You couldn't stop for death, so death has kindly stopped by for you.` may be a reference to the poem ["Because I could not stop for Death"](https://en.wikipedia.org/wiki/Because_I_could_not_stop_for_Death) by Emily Dickinson. |
| `irradiated4dsc` | `Not going gently into that good night...` may be a reference to the poem ["Do not go gentle into that good night"](https://en.wikipedia.org/wiki/Do_not_go_gentle_into_that_good_night) by Dylan Thomas. |

### Other

| Text | Notes |
| ---- | ----- |
| `hpsickness` | `Sickness` in the context of the game mechanic specifically refers to "the feeling that you are likely to vomit" |

### Pause quotes

Pause quotes are from the point of view of the "Observer", who is a "paranormal entity that oversees everything and is driven by curiosity". As such, certain texts like `"Human" is not the only thing watching.`, `You're gonna give me a headache. Or, you would, if I could feel pain.`, `I am still here.`, and others, are likely the Observer referring to itself.
