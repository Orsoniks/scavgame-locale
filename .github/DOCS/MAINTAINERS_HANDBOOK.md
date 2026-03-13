# A Maintainer's Handbook: Localization Management

This guide explains how to manage the translation lifecycle with the new automated translation sizing system.

## The automated System
To keep the dashboard updated, we use an automated system (GitHub Action).
1. **The Pickup**: Every push to `/translations` triggers the workflow defined in `./github/workflow/main.yml` .
2. **The Engine**: The Python script (`compute_stats.py`) then analyzes the files.
3. **The Drop-off**: Finally, a report is generated at `.github/reports/translation_report.json`, which then will be used by shields.io to make the badges in the README.

## Advanced Validation with `metadata.json`
Since a simple "key-exists" check isn't enough for quality localization, `compute_stats.py` uses `metadata.json` to handle complex scenarios.

### 1. Global Context Changes (`dirty_global`)
When a source string in `EN.json` is modified (e.g., changing the meaning of a sentence), the existing translations become "Stale" or "Dirty."
- **How to flag**: Add the key to `dirty_global`.
- **Result**: All languages will see their percentage drop.
- **How to clear**: Once a translator updates their file, add their language code to the `cleaned` object for that key.

**Example : in ```translations/metadata.json```**

```json
{
  "dirty_global": ["buildings.shuttledoordsc","main.liquidpouch","main.liquidpouchdsc","moodles.cold4"], // Theses 4 keys have a new meaning.
  "cleaned": {
    "FR": ["buildings.shuttledoordsc"], // French had it's shuttledoors desc validated
    "RU": ["main.liquidpouch","main.liquidpouchdsc"] // Russians have updated their translations for the pouch, but didn't update the shuttledoor description, nor the cold 4 mood.
  }
}
```

***Result :*** The % have dropped for all, but a bit less for French and especially Russian.

### 2. Identical but Correct (`verified`)
By default, the engine flags values identical to English as "Untranslated." If a word is intentionally the same (e.g., "OK", "Pixel", "Orsoniks"):
- **Action**: Add the key to the `verified` list for that specific language.
- **Result**: The engine will count it as a valid translation.

**Example : in ```translations/metadata.json```**

```json
{
  "verified": {
    "FR": ["other.lrd", "other.steak"] 
    // The names for lrd and steak are the same in french and english
  }
}
```
**Without this:** French would be stuck at 98% because it looks "untranslated."

**With this:** The Engine sees the keys in the FR list and grants the full 100%.


### 3. Array Protection (`mismatched_arrays`)
The engine protects against "Index Shifting." If you add a line to an array in `EN.json` (like a list of dialogue), the engine checks if the translation has the exact same number of lines.
- **If they don't match**: The key is flagged as a mismatch and excluded from the completion stats until fixed by a human.

**Scenario:**

*new  `en.json`* <br>
```json
"cold": [
    "It's cold in here.",
    "It's chilly!", 
    "It's nippy in here!", 
    "I feel cold."
]
```
*`ja-JP`* <br>
```json
"cold": [
    "koko ha samui",
    "samu sugiru!",
    "samui kamo.",
]
```


**The Result in `.github/reports/translation_report.json`:**

The script generates this automatically (you don't write this, you read it to debug):

```json
"ja-JP": {
    "percentage": 85,
    "mismatched_arrays": [
        "character.0.cold (expected 4, got 3)"
    ]
}
```

### 4. Comprehensive `metadata.json` example :

Here's what a "busy" metadata file could look like :

```json
{
  "dirty_global": [
    "main.lrddsc",
    "main.morphinedsc",
    "character.0.seeGravel",
    "main.gravbagdsc"
  ],
  "cleaned": {
    "FR": [
      "main.lrddsc",
      "main.morphinedsc"
    ],
    "RU": [
      "main.lrddsc",
      "character.0.seeGravel"
    ],
    "UA": [
      "main.lrddsc"
    ]
  },
  "verified": {
    "FR": [
      "main.lrd",
      "main.steak",
      "main.morphine",
      "main.fentanyl",
      "main.cereal",
      "main.burger",
    ],
    "ZH": [
      "main.lrd",
      "main.morphine",
      "ui.ok"
    ],
    "KO": [
      "main.lrd",
      "main.morphine"
    ],
    "DE": [
      "main.steak",
      "main.fentanyl",
      "main.burger"
    ]
  }
}
```

## Adding a New Language
1. Create `translations/CODE.json`. [Example : translations/ca-FR.json for canada]
2. Add a new row to the `README.md` table using the dynamic badge template.
3. Ensure the `query` parameters in the badge URL match your new `CODE`.

---
*For technical details on the Python logic, see [TECHNICAL_DETAILS.md](./TECHNICAL_DETAILS.md).*