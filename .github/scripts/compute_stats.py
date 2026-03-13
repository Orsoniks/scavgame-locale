import json
import os

# --- CONFIGURATION ---
DEBUG_MODE = False  # You can change this to True for more verbose output during development, or if you have doubts about the logic. It will print detailed info about each key processed.
SOURCE_FILE = 'translations/EN.json'
LANG_DIR = 'translations/'
METADATA_FILE = 'translations/metadata.json'
REPORT_DIR = '.github/reports'
REPORT_FILE = os.path.join(REPORT_DIR, 'translation_report.json')

def flatten_dict(d, parent_key='', sep='.'):
    """ Flattens the nested dictionnaries. It manages 3 cases."""
    items = []
    
    # Case 1: Dictionnary (Object)
    if isinstance(d, dict):
        for k, v in d.items():
            new_key = f"{parent_key}{sep}{k}" if parent_key else k
            items.extend(flatten_dict(v, new_key, sep=sep).items())
            
    # Case 2: List (Array)
    elif isinstance(d, list):
        # If it's a list of objects, we flatten each object with an index to keep unique keys (character.0, character.1...)
        if len(d) > 0 and isinstance(d[0], dict):
            for i, obj in enumerate(d):
                items.extend(flatten_dict(obj, f"{parent_key}{sep}{i}", sep=sep).items())
        
        # If it's a list of strings (internal dialogues for example), we keep it as is for comparison, but we still add the parent key to the report.
        else:
            items.append((parent_key, d))
            
    # Case 3: Final Value (String, int, etc.)
    else:
        items.append((parent_key, d))
        
    return dict(items)

def analyze_translation(source, target, lang_code, metadata):
    report = {
        "percentage": 0, "color": "red", "found_keys": 0, "total_expected": 0,
        "missing_keys": [], "mismatched_arrays": [], "dirty_keys": [], "untranslated": []
    }
    
    dirty_global = metadata.get("dirty_global", [])
    cleaned = metadata.get("cleaned", {}).get(lang_code, [])
    verified = metadata.get("verified", {}).get(lang_code, [])

    if DEBUG_MODE:
        print(f"\n--- [STEP 1: Flattening EN.json] ---")
    source_flat = flatten_dict(source)
    
    if DEBUG_MODE:
        print(f"\n--- [STEP 2: Flattening {lang_code}.json] ---")
    target_flat = flatten_dict(target)
    
    ignored_keys = ["name", "replaceAllFonts", "replaceSpecialFonts", "outdated"]
    total_keys = 0
    translated_count = 0

    if DEBUG_MODE:
        print(f"\n--- [STEP 3: Comparison Logic for {lang_code}] ---")

    for key, s_val in source_flat.items():
        if any(ignored == key.split('.')[-1] for ignored in ignored_keys):
            continue
        
        total_keys += 1
        
        if key not in target_flat:
            if DEBUG_MODE: print(f"{key}: MISSING")
            report["missing_keys"].append(key)
            continue

        report["found_keys"] += 1
        t_val = target_flat[key]

        if key in dirty_global and key not in cleaned:
            if DEBUG_MODE: print(f"{key}: DIRTY")
            report["dirty_keys"].append(key)
            continue

        if isinstance(s_val, list):
            s_len = len(s_val)
            t_len = len(t_val) if isinstance(t_val, list) else "TYPE_ERROR"
            
            if s_len != t_len:
                if DEBUG_MODE: print(f"{key}: MISMATCH ({s_len} vs {t_len})")
                if key not in cleaned:
                    report["mismatched_arrays"].append(f"{key} (expected {s_len}, got {t_len})")
                    continue
            elif DEBUG_MODE:
                print(f"{key}: ARRAY MATCH ({s_len})")
            
            if t_val == s_val and key not in verified:
                if DEBUG_MODE: print(f"{key}: UNTRANSLATED ARRAY")
                report["untranslated"].append(key)
                continue
        else:
            if t_val == "" or (t_val == s_val and key not in verified):
                if DEBUG_MODE: print(f"{key}: UNTRANSLATED STRING")
                report["untranslated"].append(key)
                continue

        translated_count += 1

    percent = int((translated_count / total_keys) * 100) if total_keys > 0 else 0
    report["percentage"] = percent
    report["total_expected"] = total_keys
    
    print(f"Result for {lang_code}: {percent}% ({translated_count}/{total_keys})")
    
    if percent >= 100: report["color"] = "brightgreen"
    elif percent >= 80: report["color"] = "green"
    elif percent >= 50: report["color"] = "yellow"
    elif percent >= 20: report["color"] = "orange"
    else: report["color"] = "red"

    return report

def main():
    if not os.path.exists(SOURCE_FILE):
        print(f"FATAL: Source {SOURCE_FILE} not found.")
        return

    with open(SOURCE_FILE, 'r', encoding='utf-8') as f:
        source_data = json.load(f)
    
    metadata = {}
    if os.path.exists(METADATA_FILE):
        with open(METADATA_FILE, 'r', encoding='utf-8') as f:
            metadata = json.load(f)

    full_report = {}
    for filename in sorted(os.listdir(LANG_DIR)):
        if filename.endswith('.json') and filename not in ['EN.json', 'metadata.json']:
            lang_code = filename.replace('.json', '')
            
            header = f"ANALYZING: {lang_code}"
            print(f"\n" + "="*len(header))
            print(header)
            print("="*len(header))
            
            with open(os.path.join(LANG_DIR, filename), 'r', encoding='utf-8') as f:
                try:
                    target_data = json.load(f)
                    lang_report = analyze_translation(source_data, target_data, lang_code, metadata)
                    full_report[lang_code] = lang_report
                except json.JSONDecodeError as e:
                    print(f"[ERROR]: Failed to parse {filename}: {e}")

    os.makedirs(REPORT_DIR, exist_ok=True)
    with open(REPORT_FILE, 'w', encoding='utf-8') as f:
        json.dump(full_report, f, indent=4, ensure_ascii=False)
    print(f"\n[SUCCESS]: Report saved to {REPORT_FILE}")

if __name__ == "__main__":
    main()