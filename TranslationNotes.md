# Translation Notes

This document contains extra notes about some of the texts present in the English locale, like context to take into consideration while translating, or specific references used.

- [General notes](#general-notes)
  - [Survivor notes](#survivor-notes)
- [Notes on specific texts](#notes-on-specific-texts)
  - [Main](#main)
  - [Moodles](#moodles)
  - [Other](#other)
  - [Pause Quotes](#pause-quotes)

## General notes

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
| `helluce` | `Helluce` is a portmanteau of "hell" and "lettuce" - *"hell cause hot and lettuce cause it's a leaf-looking herb"*. |
| `mushpear` | `Numberry` is a portmanteau of "numb" and "berry". The translation key `mushpear` currently refers to the previous name this plant had. |
| `hydreed` | `Hydreed` is a portmanteau of "hydra" and "weed". |
| `aquapple` | `Aquapple` is a portmanteau of "aqua" and "apple". |

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
