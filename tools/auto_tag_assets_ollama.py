import argparse, base64, json, os, re, sys, time
from pathlib import Path
from typing import List, Set
import requests
from tqdm import tqdm
import spacy
import nltk
import inflect
from readne_generator import ReadmeGenerator

try:
    from nltk.corpus import wordnet as wn
except Exception:
    nltk.download("wordnet"); nltk.download("omw-1.4")
    from nltk.corpus import wordnet as wn

OLLAMA_URL = os.environ.get("OLLAMA_URL", "http://127.0.0.1:11434")
MODEL = os.environ.get("OLLAMA_MODEL", "llava:7b")
CONNECT_TIMEOUT = 10
READ_TIMEOUT = 300
STREAM_IDLE_TIMEOUT = 30

IMAGE_PATTERNS = [
    r"^thumb(nail)?\.(png|jpe?g|webp)$",
    r"^preview\.(png|jpe?g|webp)$",
    r".*\.(png|jpe?g|webp)$",
]

def create_prompt(asset_name, type):
    if type == "description":
        print("creating propt for description")
        return f"Describe the object in the image in one concise sentence. This image is a thumbnail of a 3D asset, so it should be a description of the asset, leaving aside it's background and that is a 3D model. The name of the asset is: {asset_name}, take it into consideration."
    else:
        print("creating prompt for tags")
        return f"List 18 short keywords (lowercase, nouns/adjectives, comma-separated) describing this 3D asset. It's name is: {asset_name}."

def find_thumbnail(asset_dir: Path) -> Path | None:
    candidates = []
    for pat in IMAGE_PATTERNS[:-1]:
        rx = re.compile(pat, re.IGNORECASE)
        for f in asset_dir.rglob("*"):
            if f.is_file() and rx.match(f.name):
                return f
    for f in asset_dir.rglob("*"):
        if f.is_file() and f.suffix.lower() in {".png", ".jpg", ".jpeg", ".webp"}:
            candidates.append(f)
    return candidates[0] if candidates else None

def probe_server() -> bool:
    try:
        r = requests.get(f"{OLLAMA_URL}/api/version", timeout=(CONNECT_TIMEOUT, 5))
        r.raise_for_status()
        return True
    except Exception:
        return False

def ollama_generate(prompt: str, image_path: Path, temperature: float = 0.6) -> str:
    with open(image_path, "rb") as fh:
        img_b64 = base64.b64encode(fh.read()).decode("utf-8")
    payload = {
        "model": MODEL,
        "messages": [
            {"role": "user", "content": prompt, "images": [img_b64]},
        ],
        "stream": False,
        "options": {"temperature": temperature},
    }
    for attempt in range(5):
        try:
            with requests.post(
                f"{OLLAMA_URL}/api/chat",
                json=payload,
                stream=True,
                timeout=(CONNECT_TIMEOUT, STREAM_IDLE_TIMEOUT),
            ) as r:
                r.raise_for_status()
                chunks = []
                start_time = time.time()
                got_data = False
                for line in r.iter_lines():
                    if line:
                        got_data = True
                        start_time = time.time()
                        try:
                            data = json.loads(line.decode("utf-8"))
                            if "message" in data:
                                chunks.append(data["message"]["content"])
                            elif "response" in data:
                                chunks.append(data["response"])
                        except Exception:
                            continue
                    if time.time() - start_time > STREAM_IDLE_TIMEOUT:
                        print(f"[WARN] Stream idle >{STREAM_IDLE_TIMEOUT}s, cortando...")
                        break
                if not got_data:
                    print(f"[WARN] No recibí nada del servidor para prompt='{prompt[:50]}...'")
                text = "".join(chunks).strip()
                return text
        except Exception:
            time.sleep(15 if attempt == 0 else 5 * (attempt + 1))
    return ""

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
    return {c for c in cands if c and len(c) >= 3}

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
    readme_generator = ReadmeGenerator()

    ap = argparse.ArgumentParser()
    ap.add_argument("--assets-root", required=True)
    ap.add_argument("--max-tags", type=int, default=24)
    ap.add_argument("--syns-per-term", type=int, default=4)
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--limit", type=int, default=0)
    args = ap.parse_args()

    if not probe_server():
        print("Ollama server not responding at", OLLAMA_URL, file=sys.stderr)
        sys.exit(1)

    root = Path(args.assets_root).expanduser().resolve()
    data_files = list(root.rglob("data.json"))
    asset_dirs = []
    for p in data_files:
        try:
            if p.parent.parent.name == "assets":
                asset_dirs.append(p.parent)
        except Exception:
            continue
    asset_dirs = sorted(set(asset_dirs))

    first_img = None
    for ad in asset_dirs:
        t = find_thumbnail(ad)
        if t:
            first_img = t
            break
    if first_img:
        try:
            ollama_generate("ready?", first_img, temperature=0.0)
        except Exception:
            pass

    processed = 0
    for ad in tqdm(asset_dirs, desc="Auto-tagging (ollama/llava)"):
        if args.limit and processed >= args.limit:
            break
        thumb = find_thumbnail(ad)
        if not thumb:
            continue
        data_json = ad / "data.json"
        if not data_json.exists():
            continue

        try:
            caption = ollama_generate(
                create_prompt(str(thumb).split('assets/')[1].split("/thumbnail")[0], type="description"), 
                thumb, 
                temperature=0.2
            )
            print("generated description")
            csv_keys = ollama_generate(
                create_prompt(str(thumb).split('assets/')[1].split("/thumbnail")[0], type="tags"), 
                thumb, 
                temperature=0.2,
            )
            print("generated tags")
        except Exception as e:
            print(f"ollama error on {thumb}: {e}", file=sys.stderr)
            continue

        print("*******************************")
        print(caption)
        print("*******************************")
        print(csv_keys)

        base_terms = parse_csv_keywords(csv_keys)
        expanded = expand_synonyms_wordnet(base_terms, max_syns_per_term=args.syns_per_term)
        final_tags = list(dict.fromkeys([t for t in expanded if t]))[:args.max_tags]

        obj = load_json(data_json)
        existing = [str(t).strip() for t in (obj.get("tags") or []) if str(t).strip()]
        merged = existing + [t for t in final_tags if t not in existing]
        obj["tags"] = merged

        if args.dry_run:
            print(f"[DRY] {data_json.name}: +{final_tags}  description='" + caption + "'")
            readme_generator.add_asset(
                data_json.name, 
                thumb,
                final_tags, 
                caption,
            )
            readme_generator.renderize_readme()
        else:
            save_json(data_json, obj)
        processed += 1

        time.sleep(1)

if __name__ == "__main__":
    main()
