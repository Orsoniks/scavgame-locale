import json
import os
from collections import OrderedDict

# Configuration
SOURCE_FILE = 'translations/EN.json'
LANG_DIR = 'translations/'
EXCLUDED_FILES = [os.path.basename(SOURCE_FILE), 'metadata.json']

def sync():
    if not os.path.exists(SOURCE_FILE):
        print(f"Error: {SOURCE_FILE} not found. Check the path.")
        return

    # Load English reference with OrderedDict to preserve the game's original order
    with open(SOURCE_FILE, 'r', encoding='utf-8') as f:
        source_data = json.load(f, object_pairs_hook=OrderedDict)

    print(f"Source loaded: {SOURCE_FILE} ({len(source_data)} keys)")

    for filename in os.listdir(LANG_DIR):
        # We only process .json files that are not English or Metadata
        if filename.endswith('.json') and filename not in EXCLUDED_FILES:
            file_path = os.path.join(LANG_DIR, filename)
            
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    target_data = json.load(f)
            except json.JSONDecodeError as e:
                print(f"::error file={file_path}::Invalid JSON format in {filename}")
                raise Exception(f"CRITICAL: {filename} contains invalid JSON. Fix it to resume sync.") from e

            # Create a new dictionary following the exact order of EN.json
            new_data = OrderedDict()
            for key, default_value in source_data.items():
                # If the key exists in the translation, we keep it. 
                # Otherwise, we add the English value as a placeholder. The idea is to make it obvious which keys are missing translations when translators open the file, and ease the process of adding the translations in the game.
                new_data[key] = target_data.get(key, default_value)

            # Write the cleaned and sorted file
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(new_data, f, indent=2, ensure_ascii=False)
            
            print(f"[SUCCESS] {filename} is now synced and sorted.")

if __name__ == "__main__":
    sync()