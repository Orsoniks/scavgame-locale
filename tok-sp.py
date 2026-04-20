import json
import re

START_CARTOUCHE = "\U000F1990"
END_CARTOUCHE = "\U000F1991"

DICTIONARY = {
    "a": "\U000F1900", "akesi": "\U000F1901", "ala": "\U000F1902", "alasa": "\U000F1903",
    "ale": "\U000F1904", "anpa": "\U000F1905", "ante": "\U000F1906", "anu": "\U000F1907",
    "awen": "\U000F1908", "e": "\U000F1909", "en": "\U000F190A", "esun": "\U000F190B",
    "ijo": "\U000F190C", "ike": "\U000F190D", "ilo": "\U000F190E", "insa": "\U000F190F",
    "jaki": "\U000F1910", "jan": "\U000F1911", "jelo": "\U000F1912", "jo": "\U000F1913",
    "kala": "\U000F1914", "kalama": "\U000F1915", "kama": "\U000F1916", "kasi": "\U000F1917",
    "ken": "\U000F1918", "kepeken": "\U000F1919", "kili": "\U000F191A", "kiwen": "\U000F191B",
    "ko": "\U000F191C", "kon": "\U000F191D", "kule": "\U000F191E", "kulupu": "\U000F191F",
    "kute": "\U000F1920", "la": "\U000F1921", "lape": "\U000F1922", "laso": "\U000F1923",
    "lawa": "\U000F1924", "len": "\U000F1925", "lete": "\U000F1926", "li": "\U000F1927",
    "lili": "\U000F1928", "linja": "\U000F1929", "lipu": "\U000F192A", "loje": "\U000F192B",
    "lon": "\U000F192C", "luka": "\U000F192D", "lukin": "\U000F192E", "lupa": "\U000F192F",
    "ma": "\U000F1930", "mama": "\U000F1931", "mani": "\U000F1932", "meli": "\U000F1933",
    "mi": "\U000F1934", "mije": "\U000F1935", "moku": "\U000F1936", "moli": "\U000F1937",
    "monsi": "\U000F1938", "mu": "\U000F1939", "mun": "\U000F193A", "musi": "\U000F193B",
    "mute": "\U000F193C", "nanpa": "\U000F193D", "nasa": "\U000F193E", "nasin": "\U000F193F",
    "nena": "\U000F1940", "ni": "\U000F1941", "nimi": "\U000F1942", "noka": "\U000F1943",
    "o": "\U000F1944", "olin": "\U000F1945", "ona": "\U000F1946", "open": "\U000F1947",
    "pakala": "\U000F1948", "pali": "\U000F1949", "palisa": "\U000F194A", "pan": "\U000F194B",
    "pana": "\U000F194C", "pi": "\U000F194D", "pilin": "\U000F194E", "pimeja": "\U000F194F",
    "pini": "\U000F1950", "pipi": "\U000F1951", "poka": "\U000F1952", "poki": "\U000F1953",
    "pona": "\U000F1954", "pu": "\U000F1955", "sama": "\U000F1956", "seli": "\U000F1957",
    "selo": "\U000F1958", "seme": "\U000F1959", "sewi": "\U000F195A", "sijelo": "\U000F195B",
    "sike": "\U000F195C", "sin": "\U000F195D", "sina": "\U000F195E", "sinpin": "\U000F195F",
    "sitelen": "\U000F1960", "sona": "\U000F1961", "soweli": "\U000F1962", "suli": "\U000F1963",
    "suno": "\U000F1964", "supa": "\U000F1965", "suwi": "\U000F1966", "tan": "\U000F1967",
    "taso": "\U000F1968", "tawa": "\U000F1969", "telo": "\U000F196A", "tenpo": "\U000F196B",
    "toki": "\U000F196C", "tomo": "\U000F196D", "tu": "\U000F196E", "unpa": "\U000F196F",
    "uta": "\U000F1970", "utala": "\U000F1971", "walo": "\U000F1972", "wan": "\U000F1973",
    "waso": "\U000F1974", "wawa": "\U000F1975", "weka": "\U000F1976", "wile": "\U000F1977",
    "namako": "\U000F1978", "kin": "\U000F1979", "oko": "\U000F197A", "kipisi": "\U000F197B",
    "leko": "\U000F197C", "monsuta": "\U000F197D", "tonsi": "\U000F197E", "jasima": "\U000F197F",
    "kijetesantakalu": "\U000F1980", "soko": "\U000F1981", "meso": "\U000F1982", 
    "epiku": "\U000F1983", "kokosila": "\U000F1984", "lanpan": "\U000F1985", "n": "\U000F1986",
    "misikeke": "\U000F1987", "ku": "\U000F1988",
    "pake": "\U000F19A0", "apeja": "\U000F19A1", "majuna": "\U000F19A2", "powe": "\U000F19A3"
}

ACROPHONY = {}
for word, code in DICTIONARY.items():
    if word[0] not in ACROPHONY: ACROPHONY[word[0]] = code

def is_word_dirty(word):
    return bool(re.search(r'[0-9bcdfg hqr vxz]', word.lower()))

def convert_single_word(word):
    if not word or is_word_dirty(word): return word
    word = re.sub(r'^(([a-z])-)+\2', r'\2', word, flags=re.IGNORECASE)
    match = re.search(r'^([^a-zA-Z]*)([a-zA-Z]+)([^a-zA-Z]*)$', word)
    if not match: return word
    prefix, main, suffix = match.groups()
    if main.lower() in DICTIONARY:
        converted = DICTIONARY[main.lower()]
    elif not main.islower() and not main.isupper():
        inner = "".join(ACROPHONY.get(c.lower(), "") for c in main)
        converted = f"{START_CARTOUCHE}{inner}{END_CARTOUCHE}"
    else:
        return word
    return f"{prefix}{converted}{suffix}"

def latin_to_sitelen_pona(text):
    if not isinstance(text, str): return text
    text = re.sub(r'\b(n{2,})\b', lambda m: " ".join(list(m.group(1))), text, flags=re.IGNORECASE)
    text = re.sub(r'\b(a{2,})\b', lambda m: " ".join(list(m.group(1))), text, flags=re.IGNORECASE)
    tokens = re.split(r'(\s+|--|—|;|:)', text)
    processed_tokens = []
    for t in tokens:
        if re.match(r'\s+', t):
            continue 
        elif re.match(r'(--|—|;|:)', t):
            processed_tokens.append(t)
        else:
            processed_tokens.append(convert_single_word(t))
    return "".join(processed_tokens)

def recursive_convert(en_val, tok_val):
    if isinstance(tok_val, dict) and isinstance(en_val, dict):
        new_dict = {}
        for key in tok_val:
            if key in en_val:
                res = recursive_convert(en_val[key], tok_val[key])
                if res is not None: new_dict[key] = res
        return new_dict if new_dict else None
    elif isinstance(tok_val, list) and isinstance(en_val, list):
        new_list = []
        for i in range(len(tok_val)):
            en_item = en_val[i] if i < len(en_val) else None
            res = recursive_convert(en_item, tok_val[i])
            if res is not None: new_list.append(res)
        return new_list if new_list else None
    elif isinstance(tok_val, str) and isinstance(en_val, str):
        if tok_val == "" and en_val == "":
            return ""
        if tok_val != en_val:
            return latin_to_sitelen_pona(tok_val)
    elif tok_val != en_val:
        return tok_val
    return None

def process_json_files():
    try:
        with open('EN.JSON', 'r', encoding='utf-8') as f:
            en_data = json.load(f)
        with open('TOK.JSON', 'r', encoding='utf-8') as f:
            tok_data = json.load(f)
            
        tok_sp_data = recursive_convert(en_data, tok_data)

        with open('TOK-SP.JSON', 'w', encoding='utf-8') as f:
            json.dump(tok_sp_data if tok_sp_data else {}, f, ensure_ascii=False, indent=4)
        print("sitelen pona li lon.")
        
    except Exception as e:
        print(f"mi pakala: {e}")

if __name__ == "__main__":
    process_json_files()
