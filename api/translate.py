from http.server import BaseHTTPRequestHandler
import json
import sys
import os
import time
from deep_translator import GoogleTranslator

# Persistent Cache Configuration
CACHE_FILE = 'translation_cache.json'
translation_cache = {}

def load_cache():
    global translation_cache
    if os.path.exists(CACHE_FILE):
        try:
            with open(CACHE_FILE, 'r', encoding='utf-8') as f:
                translation_cache = json.load(f)
            print(f"Loaded {sum(len(v) for v in translation_cache.values())} cached translations", file=sys.stderr)
        except Exception as e:
            print(f"Failed to load cache: {e}", file=sys.stderr)
            translation_cache = {}

def save_cache():
    try:
        with open(CACHE_FILE, 'w', encoding='utf-8') as f:
            json.dump(translation_cache, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"Failed to save cache: {e}", file=sys.stderr)

# Load cache on startup
load_cache()

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        data = json.loads(post_data.decode('utf-8'))

        text = data.get('text')
        dest = data.get('target_lang', 'en')
        src = data.get('source_lang', 'auto')

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
        missing_indices = []
        missing_texts = []

        # 1. Check Cache
        for i, original in enumerate(inputs):
            if original in translation_cache[cache_key_group]:
                results[i] = translation_cache[cache_key_group][original]
            else:
                missing_indices.append(i)
                missing_texts.append(original)

        # 2. Translate Missing Items
        if missing_texts:
            print(f"Translating {len(missing_texts)} new items to {dest} (Cached: {len(inputs) - len(missing_texts)})...", file=sys.stderr)
            
            # Map languages for deep-translator
            lang_map = {'zh': 'zh-CN', 'zh-cn': 'zh-CN', 'zh-tw': 'zh-TW', 'he': 'iw'}
            target = lang_map.get(dest.lower(), dest)
            
            try:
                translator = GoogleTranslator(source=src, target=target)
                
                # Batch process missing items
                batch_size = 10
                translated_batch_results = []
                
                for i in range(0, len(missing_texts), batch_size):
                    # Rate limit protection
                    if i > 0: 
                        time.sleep(1) # 1s delay between batches
                    
                    batch = missing_texts[i:i+batch_size]
                    try:
                        batch_trans = translator.translate_batch(batch)
                        translated_batch_results.extend(batch_trans)
                    except Exception as e:
                        print(f"Batch translation failed: {e}", file=sys.stderr)
                        # Fallback: return original text for failed items to prevent crash
                        translated_batch_results.extend(batch)

                # Update Results and Cache
                for idx, t_text in enumerate(translated_batch_results):
                    original_idx = missing_indices[idx]
                    original_text = missing_texts[idx]
                    
                    results[original_idx] = t_text
                    translation_cache[cache_key_group][original_text] = t_text
                
                # Save cache after updating
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
