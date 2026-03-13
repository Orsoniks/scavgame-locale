# Technical: The Stats Engine

This document outlines the logic behind `compute_stats.py` and the automation pipeline.

## Data Pipeline Flow
`translations/*.json` -> `compute_stats.py` -> `.github/reports/summary.json` -> `Shields.io Badges`

## Engine Logic (The `analyze_translation` function)
The engine flattens nested JSON structures into a dot-notation dictionary (e.g., `character.0.cold`) to perform a precise audit.

### 1. The Validation Hierarchy
For every key found in `EN.json`, the engine follows these rules:

| Step | Check | Logic | Result if True |
| :--- | :--- | :--- | :--- |
| **1** | **Dirty Check** | Is key in `dirty_global` AND NOT in `cleaned[lang]`? | **Dirty** (0% progress) |
| **2** | **Array Guard** | Is it a list? Does `len(source) != len(target)`? | **Mismatch** (0% progress) |
| **3** | **Empty Check** | Is the value an empty string `""`? | **Untranslated** |
| **4** | **Identity Check**| Is `Value_EN == Value_Target` AND NOT in `verified[lang]`? | **Untranslated** |
| **5** | **Success** | None of the above? | **Translated** (+1 count) |

### 2. "Dirty" vs. "Cleaned" Workflow
This system handles **Context Drift**. 
- `cleaned`: Acts as a "Validation Stamp." It acknowledges that a specific language has addressed the global change.

### 3. Array Integrity
To prevent disastrous mismatches in character dialogues or notes, the engine strictly enforces array lengths. If an English array is updated with new lines, the translation is considered broken until the indexes are aligned.

## GitHub Action Configuration
- **Permissions**: The workflow requires `contents: write` to allow the `github-actions[bot]` to push the generated report.
- **Optimization**: The `paths` filter ensures the script only runs when translation files or metadata are modified.
- **Skip Logic**: The commit message includes `[skip ci]` to prevent an infinite loop of bot-generated commits.
- **Report details :** The Reports details are uploaded as Github Actions artifacts.

## Badge Integration
Badges in the README are **Dynamic Shields**. They query the raw GitHub URL of `translation_report.json` using JSONPath:
- **Percentage**: `$.[LANG].percentage`

*i'd like to add automated colors too, but i failed to do so for now - Natpol50*