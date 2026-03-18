from http.server import BaseHTTPRequestHandler
import json
import sys
import os
import time
import psycopg2
from deep_translator import GoogleTranslator
from dotenv import load_dotenv

load_dotenv('.env.local')
load_dotenv()

# Persistent Cache Configuration
CACHE_FILE = 'translation_cache.json'
translation_cache = {}

def load_cache():
    global translation_cache
    if os.path.exists(CACHE_FILE):
        try:
            with open(CACHE_FILE, 'r', encoding='utf-8') as f:
                full_cache = json.load(f)
            # ONLY PERSIST ENGLISH TO LOCAL FILE (to keep default loading fast)
            # Everything else stays in Neon
            translation_cache = {k: v for k, v in full_cache.items() if k.endswith(':en')}
            print(f"Loaded {sum(len(v) for v in translation_cache.values())} English translations from local cache", file=sys.stderr)
        except Exception as e:
            print(f"Failed to load cache: {e}", file=sys.stderr)
            translation_cache = {}

def save_cache():
    try:
        # Only save English translations to the local JSON file
        english_only = {k: v for k, v in translation_cache.items() if k.endswith(':en')}
        if english_only:
            with open(CACHE_FILE, 'w', encoding='utf-8') as f:
                json.dump(english_only, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"Failed to save English local cache: {e}", file=sys.stderr)


def get_db_connection():
    db_url = os.getenv('VITE_NEON_DATABASE_URL') or os.getenv('DATABASE_URL') or os.getenv('NEON_DATABASE_URL')
    if not db_url:
        return None
    try:
        return psycopg2.connect(db_url)
    except:
        return None

def fetch_from_db(src, dest, texts):
    conn = get_db_connection()
    if not conn:
        return {}
    
    results = {}
    try:
        cur = conn.cursor()
        if texts:
            # Query for all texts in the batch at once
            # Support fallback: if searching for 'auto', also check 'en' since most site content is English
            query = """
                SELECT original_text, translated_text 
                FROM translations 
                WHERE dest_lang = %s AND original_text = ANY(%s)
                AND (src_lang = %s OR (%s = 'auto' AND src_lang = 'en'))
            """
            cur.execute(query, (dest, texts, src, src))
            
            for orig, trans in cur.fetchall():
                results[orig] = trans
            
        cur.close()
        conn.close()
    except Exception as e:
        print(f"DB Fetch Error: {e}", file=sys.stderr)
    return results

def save_to_db(src, dest, translations):
    conn = get_db_connection()
    if not conn:
        return
    
    try:
        cur = conn.cursor()
        # Use execute_values or a batch insert for better performance
        from psycopg2.extras import execute_values
        
        data_to_insert = [(src, dest, orig, trans) for orig, trans in translations.items()]
        
        execute_values(cur, """
            INSERT INTO translations (src_lang, dest_lang, original_text, translated_text)
            VALUES %s
            ON CONFLICT (src_lang, dest_lang, original_text) DO NOTHING
        """, data_to_insert)
        
        conn.commit()
        cur.close()
        conn.close()
    except Exception as e:
        print(f"DB Save Error: {e}", file=sys.stderr)

# Load cache on startup
load_cache()

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        data = json.loads(post_data.decode('utf-8'))

        text = data.get('text')
        dest = data.get('target_lang', 'en').lower()
        src = data.get('source_lang', 'auto').lower()

        if not text:
            self.send_response(400)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': 'No text provided'}).encode('utf-8'))
            return

        # Prepare structure for response
        if isinstance(text, str):
            inputs = [text]
            is_single = True
        else:
            inputs = text
            is_single = False

        # Cache key group
        cache_key_group = f"{src}:{dest}"
        if cache_key_group not in translation_cache:
            translation_cache[cache_key_group] = {}

        results = [None] * len(inputs)
        missing_indices: list[int] = []
        missing_texts: list[str] = []

        # 1. Check In-Memory Cache
        for i, original in enumerate(inputs):
            if original in translation_cache[cache_key_group]:
                results[i] = translation_cache[cache_key_group][original]
            else:
                missing_indices.append(i)
                missing_texts.append(original)

        # 2. Check Database Cache for items not in memory
        if missing_texts:
            db_results = fetch_from_db(src, dest, missing_texts)
            still_missing_indices = []
            still_missing_texts = []
            
            for i, idx in enumerate(missing_indices):
                original = missing_texts[i]
                if original in db_results:
                    translated = db_results[original]
                    results[idx] = translated
                    # Update memory cache
                    translation_cache[cache_key_group][original] = translated
                else:
                    still_missing_indices.append(idx)
                    still_missing_texts.append(original)
            
            missing_indices = still_missing_indices
            missing_texts = still_missing_texts

        # 3. Translate Missing Items via AI
        if missing_texts:
            print(f"Translating {len(missing_texts)} new items to {dest} (Cached: {len(inputs) - len(missing_texts)})...", file=sys.stderr)
            
            # Map languages for deep-translator
            lang_map = {'zh': 'zh-CN', 'zh-cn': 'zh-CN', 'zh-tw': 'zh-TW', 'he': 'iw'}
            target = lang_map.get(dest.lower(), dest)
            
            try:
                translator = GoogleTranslator(source=src, target=target)
                
                # Batch process missing items
                batch_size = 50
                translated_batch_results = []
                
                for i in range(0, len(missing_texts), batch_size):
                    # Rate limit protection - reduced for better responsiveness
                    if i > 0: 
                        time.sleep(0.1) 
                    
                    batch = missing_texts[i:i+batch_size]
                    try:
                        batch_trans = translator.translate_batch(batch)
                        translated_batch_results.extend(batch_trans)
                    except Exception as e:
                        print(f"Batch translation failed: {e}", file=sys.stderr)
                        # Fallback: return original text for failed items to prevent crash
                        translated_batch_results.extend(batch)

                # Update Results, Database, and Memory Cache
                new_translations_to_save = {}
                for idx, t_text in enumerate(translated_batch_results):
                    original_idx = missing_indices[idx]
                    original_text = missing_texts[idx]
                    
                    results[original_idx] = t_text
                    translation_cache[cache_key_group][original_text] = t_text
                    new_translations_to_save[original_text] = t_text
                
                # Save to Database
                save_to_db(src, dest, new_translations_to_save)
                
                # Save local file cache as backup
                save_cache()
                
            except Exception as e:
                print(f"Translation error: {e}", file=sys.stderr)
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'error': str(e)}).encode('utf-8'))
                return
        else:
            print(f"All {len(inputs)} items found in cache for {dest}.", file=sys.stderr)

        # Format Response
        final_output = []
        for i, res in enumerate(results):
            final_output.append({
                'original': inputs[i],
                'translated': res,
                'src': src
            })

        response_data = {
            'data': final_output[0] if is_single else final_output
        }

        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(response_data).encode('utf-8'))
        sys.stderr.flush()

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
