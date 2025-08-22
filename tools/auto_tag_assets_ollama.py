import argparse, base64, json, os, re, sys
from pathlib import Path
from typing import List, Set
import requests
from tqdm import tqdm
import spacy
import nltk
import inflect

try:
    from nltk.corpus import wordnet as wn
except Exception:
    nltk.download("wordnet"); nltk.download("omw-1.4")
    from nltk.corpus import wordnet as wn

OLLAMA_URL = os.environ.get("OLLAMA_URL", "http://localhost:11434")
MODEL = os.environ.get("OLLAMA_MODEL", "llava")

IMAGE_PATTERNS = [
    r"^thumb(nail)?\.(png|jpe?g|webp)$",
    r"^preview\.(png|jpe?g|webp)$",
    r".*\.(png|jpe?g|webp)$",
]

def find_thumbnail(asset_dir: Path) -> Path | None:
    files = [f for f in asset_dir.iterdir() if f.is_file()]
    for pat in IMAGE_PATTERNS:
        rx = re.compile(pat, re.IGNORECASE)
        for f in files:
            if rx.match(f.name):
                return f
    return None

def ollama_generate(prompt: str, image_path: Path, temperature: float = 0.6) -> str:
    with open(image_path, "rb") as fh:
        img_b64 = base64.b64encode(fh.read()).decode("utf-8")
    payload = {
        "model": MODEL,
        "prompt": prompt,
        "images": [img_b64],
        "stream": False,
        "options": {"temperature": temperature}
    }
    r = requests.post(f"{OLLAMA_URL}/api/generate", json=payload, timeout=120)
    r.raise_for_status()
    data = r.json()
    return (data.get("response") or "").strip()

def normalize_phrase(s: str) -> str:
    s = s.lower().strip()
    s = re.sub(r"[-_/]+", " ", s)
    s = re.sub(r"[^\w\s]", "", s)
    s = re.sub(r"\s+", " ", s)
    return s.strip()

def extract_keywords_spacy(nlp, text: str) -> Set[str]:
    cands: Set[str] = set()
    doc = nlp(text)
    for np in doc.noun_chunks:
        t = normalize_phrase(np.text)
        if len(t) >= 3:
            cands.add(t)
    for tok in doc:
        if tok.pos_ in {"NOUN", "PROPN", "ADJ"}:
            cands.add(normalize_phrase(tok.lemma_))
    cands = {c for c in cands if c and len(c) >= 3}
    return cands

def parse_csv_keywords(s: str) -> Set[str]:
    parts = re.split(r"[,\n;]", s)
    return {normalize_phrase(p) for p in parts if normalize_phrase(p)}

def expand_synonyms_wordnet(cands: Set[str], max_syns_per_term: int = 4) -> Set[str]:
    p = inflect.engine()
    out: Set[str] = set(cands)
    for term in list(cands):
        bases = [term.split()[-1]] if " " in term else [term]
        acc: Set[str] = set()
        for base in bases:
            syns = set()
            for syn in wn.synsets(base, pos=wn.NOUN) + wn.synsets(base, pos=wn.ADJ):
                for lemma in syn.lemmas():
                    w = normalize_phrase(lemma.name())
                    if w and w != base:
                        syns.add(w)
            for s in list(syns)[:max_syns_per_term]:
                acc.add(s)
                singular = p.singular_noun(s)
                if singular:
                    acc.add(singular)
                else:
                    acc.add(p.plural(s))
        out.update(acc)
    return {t for t in out if t}

def load_json(p: Path) -> dict:
    try:
        with open(p, "r", encoding="utf-8") as fh:
            return json.load(fh)
    except Exception:
        return {}

def save_json(p: Path, obj: dict):
    with open(p, "w", encoding="utf-8") as fh:
        json.dump(obj, fh, ensure_ascii=False, indent=2)
        fh.write("\n")

def main():
    print(os.getcwd())
    ap = argparse.ArgumentParser()
    # ap.add_argument("--assets-root", required=True)
    ap.add_argument("--max-tags", type=int, default=24)
    ap.add_argument("--syns-per-term", type=int, default=4)
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    nlp = spacy.load("en_core_web_sm", disable=["ner", "parser", "textcat"])

    #root = Path("/Users/juanpasutti/documents/asset-packs/packs/").expanduser().resolve()
    #print(root)
    #asset_dirs = [p for p in root.iterdir() if p.is_dir()]

    #for ad in tqdm(sorted(asset_dirs), desc="Auto-tagging (ollama/llava)"):
    for x in range(1):
        # thumb = find_thumbnail(ad)
        thumb = "/Users/juanpasutti/documents/asset-packs/packs/cyberpunk/assets/arcade_machine_blue/thumbnail.png"
        #if not thumb:
        #   continue
        #data_json = ad / "data.json"
        #if not data_json.exists():
        #    continue

        # 1) Caption and raw keywords from llava
        try:
            caption = ollama_generate(
                "Describe this image in one concise sentence.", thumb, temperature=0.2
            )

        except Exception as e:
            print(f"ollama error on {thumb}: {e}", file=sys.stderr)
            continue

        print("*******************************")
        print(caption)
        print("*******************************")
        print(csv_keys)

        # 2) NLP keyword extraction + CSV parsing
        k_from_caption = extract_keywords_spacy(nlp, caption)
        k_from_csv = parse_csv_keywords(csv_keys)
        base_terms = k_from_caption.union(k_from_csv)

        # 3) Synonym expansion
        expanded = expand_synonyms_wordnet(base_terms, max_syns_per_term=args.syns_per_term)

        # 4) Trim and write
        final_tags = list(dict.fromkeys([t for t in expanded if t]))[:args.max_tags]

        obj = load_json(data_json)
        existing = [str(t).strip() for t in (obj.get("tags") or []) if str(t).strip()]
        merged = existing + [t for t in final_tags if t not in existing]
        obj["tags"] = merged

        if args.dry_run:
            print(f"[DRY] {data_json.name}: caption='{caption}' -> +{final_tags}")
            continue

        save_json(data_json, obj)

        break

if __name__ == "__main__":
    main()