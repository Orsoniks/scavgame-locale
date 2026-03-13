import json5
import json
import os

# --- CONFIGURATION ---
SOURCE_FILE = 'translations/EN.json'
LANG_DIR = 'translations/'
IGNORED_FILE = 'translations/ignored.json' 
REPORT_DIR = '.github/reports'
REPORT_FILE = os.path.join(REPORT_DIR, 'translation_report.json')
SUMMARY_FILE = os.path.join(REPORT_DIR, 'summary.json') # For badges

def flatten_dict(d, parent_key='', sep='.'):
    """
    Deeply flattens dictionaries and nested lists.
    Handles lists of lists of objects (e.g., notes) by indexing every level.
    """
    items = []
    
    if isinstance(d, dict):
        for k, v in d.items():
            new_key = f"{parent_key}{sep}{k}" if parent_key else k
            items.extend(flatten_dict(v, new_key, sep=sep).items())
            
    elif isinstance(d, list):
        for i, v in enumerate(d):
            new_key = f"{parent_key}[{i}]"
            items.extend(flatten_dict(v, new_key, sep=sep).items())
            
    else:
        items.append((parent_key, d))
        
    return dict(items)

def analyze_translation(source, target, lang_code, ignored):
    report = {
        "percentage": 0, "color": "red", "found_keys": 0, "total_expected": 0,
        "missing_keys": [], "untranslated": []
    }
    
    verified = ignored.get("verified", {}).get(lang_code, [])

    source_flat = flatten_dict(source)
    target_flat = flatten_dict(target)
    
    ignored_keys = ["name", "replaceAllFonts", "replaceSpecialFonts", "outdated"]
    total_keys = 0
    translated_count = 0

    for key, s_val in source_flat.items():
        if any(ignored == key.split('.')[-1] for ignored in ignored_keys):
            continue
        
        total_keys += 1
        
        if key not in target_flat:
            report["missing_keys"].append(key)
            continue

        report["found_keys"] += 1
        t_val = target_flat[key]

        if t_val == "" or (t_val == s_val and key not in verified):
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
        source_data = json5.load(f)
    
    ignored = {}
    if os.path.exists(IGNORED_FILE):
        with open(IGNORED_FILE, 'r', encoding='utf-8') as f:
            ignored = json5.load(f)

    full_report = {}
    for filename in sorted(os.listdir(LANG_DIR)):
        if filename.endswith('.json') and filename not in [os.path.basename(SOURCE_FILE), os.path.basename(IGNORED_FILE)]:
            lang_code = filename.replace('.json', '')
            print(f"Analyzing: {lang_code}")
            
            with open(os.path.join(LANG_DIR, filename), 'r', encoding='utf-8') as f:
                try:
                    target_data = json5.load(f)
                    full_report[lang_code] = analyze_translation(source_data, target_data, lang_code, ignored)
                except Exception as e:
                    print(f"[ERROR]: Failed to parse {filename}: {e}")

    os.makedirs(REPORT_DIR, exist_ok=True)
    
    # 1. Detailed Report (For Artifacts)
    with open(REPORT_FILE, 'w', encoding='utf-8') as f:
        json.dump(full_report, f, indent=4, ensure_ascii=False)

    # 2. Minimal Summary (For Repo/Badges)
    # This keeps ONLY the essentials to avoid repo bloating
    summary = {
        code: {"percentage": data["percentage"], "color": data["color"]} 
        for code, data in full_report.items()
    }
    with open(SUMMARY_FILE, 'w', encoding='utf-8') as f:
        json.dump(summary, f, indent=2)

if __name__ == "__main__":
    main()