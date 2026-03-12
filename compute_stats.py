import json
import os

SOURCE_FILE = 'translations/EN.json' 
LANG_DIR = 'translations/'
METADATA_FILE = os.path.join(LANG_DIR, 'metadata.json')
OUTPUT_FILE = 'translation-stats.json'

def get_completion_pct(source, target, lang_code, metadata):
    total = len(source.keys())
    if total == 0: return 0
    
    # Some keys are considered "valid" even if they are identical to English, because they are listed in metadata.json as "untranslatable", "contextual" or just the same in both languages.
    valid_ids = metadata.get(lang_code, [])
    
    translated = 0
    for key, source_val in source.items():
        if key in target:
            target_val = target[key]
            # We count it as translated if it's not empty and either different from English or listed as valid in metadata.
            if target_val != "" and (target_val != source_val or key in valid_ids):
                translated += 1
                
    return int((translated / total) * 100)

def main():
    source_filename = os.path.basename(SOURCE_FILE)
    
    with open(SOURCE_FILE, 'r', encoding='utf-8') as f:
        source_data = json.load(f)
        
    metadata = {}
    if os.path.exists(METADATA_FILE):
        with open(METADATA_FILE, 'r', encoding='utf-8') as f:
            metadata = json.load(f)

    stats = {}
    for filename in os.listdir(LANG_DIR):
        if filename.endswith('.json') and filename not in [source_filename, 'metadata.json']:
            lang_code = filename.replace('.json', '')
            with open(os.path.join(LANG_DIR, filename), 'r', encoding='utf-8') as f:
                target_data = json.load(f)
            
            stats[lang_code] = get_completion_pct(source_data, target_data, lang_code, metadata)

    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(stats, f, indent=4)

if __name__ == "__main__":
    main()