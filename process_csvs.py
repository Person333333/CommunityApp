import os
import csv
import psycopg2
import pandas as pd
import time
import re
from dotenv import load_dotenv

# Optional: DuckDuckGo search for missing info
try:
    from duckduckgo_search import DDGS
except ImportError:
    DDGS = None

load_dotenv(".env.local")

# Hardcoded Neon URL as .env.local didn't have it
DB_URL = 'postgresql://neondb_owner:npg_blPQ09vgTLiI@ep-lucky-glitter-afuy9gkd-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require'

FOOD_CSV = "datasets/Emergency_Food_and_Meals_Seattle_and_King_County.csv"
SHELTER_CSV = "datasets/shelter - Sheet1.csv"

def get_db_connection():
    return psycopg2.connect(dsn=DB_URL)

def normalize_string(s):
    if not isinstance(s, str):
        return ""
    return re.sub(r'[^a-z0-9]', '', s.lower().strip())

def fetch_existing_resources(conn):
    cur = conn.cursor()
    cur.execute("SELECT id, title, address, phone, website, zip, description FROM resources;")
    rows = cur.fetchall()
    cur.close()
    
    existing = []
    for r in rows:
        existing.append({
            'id': r[0],
            'title': r[1] or "",
            'address': r[2] or "",
            'phone': r[3] or "",
            'website': r[4] or "",
            'zip': r[5] or "",
            'description': r[6] or "",
            'norm_name': normalize_string(r[1]),
            'norm_addr': normalize_string(r[2])
        })
    return existing

def find_match(resource, existing_list):
    r_norm_name = normalize_string(resource['title'])
    r_norm_addr = normalize_string(resource['address'])
    
    for ex in existing_list:
        if ex['norm_name'] == r_norm_name:
            # Check address if both exist
            if r_norm_addr and ex['norm_addr']:
                if r_norm_addr == ex['norm_addr'] or (r_norm_addr in ex['norm_addr']) or (ex['norm_addr'] in r_norm_addr):
                    return ex
            else:
                return ex  # Match by name if address is missing
    return None

def research_missing_info(name, city):
    if not DDGS:
        return {}
    
    query = f"{name} {city} Washington contact phone address"
    try:
        with DDGS() as ddgs:
            results = list(ddgs.text(query, max_results=3))
            
        if not results:
            return {}
            
        combined_text = " ".join([r['title'] + " " + r['body'] for r in results])
        
        info = {}
        # Try finding a phone number
        phone_match = re.search(r'\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}', combined_text)
        if phone_match:
            info['phone'] = phone_match.group(0)
            
        # Try finding a zip code
        zip_match = re.search(r'\b98\d{3}\b', combined_text)
        if zip_match:
            info['zip'] = zip_match.group(0)
            
        # Try finding a website
        website_match = re.search(r'https?://[^\s]+', combined_text)
        if website_match:
            info['website'] = website_match.group(0)
            
        return info
    except Exception as e:
        print(f"Error researching {name}: {e}")
        return {}

def merge_and_save(conn, new_res, existing_match):
    # If match, keep existing but fill empty from new source
    cur = conn.cursor()
    if existing_match:
        updates = []
        params = []
        for field in ['phone', 'website', 'zip', 'description', 'address', 'city', 'latitude', 'longitude', 'hours', 'audience', 'services', 'tags']:
            # If existing is empty but new has it, update
            ex_val = existing_match.get(field)
            new_val = new_res.get(field)
            if not ex_val and new_val and new_val not in ["Unclear", "N/A", ""]:
                updates.append(f"{field} = %s")
                params.append(new_val)
                
        # Handle Category Cross-check (multiple categories)
        # Note: the user asked to "create separate entries OR use a tagging system so it appears in both"
        # Since 'category' is a string column, let's append tags to services or description for dual mapping
        
        if updates:
            params.append(existing_match['id'])
            query = f"UPDATE resources SET {', '.join(updates)} WHERE id = %s"
            cur.execute(query, params)
            print(f"Updated existing resource {existing_match['id']} ({existing_match['title']})")
    else:
        # Insert new
        cols = []
        vals = []
        placeholders = []
        for k, v in new_res.items():
            if v and v not in ["Unclear", "N/A", ""]:
                cols.append(k)
                vals.append(v)
                placeholders.append("%s")
        
        if cols:
            query = f"INSERT INTO resources ({', '.join(cols)}) VALUES ({', '.join(placeholders)})"
            cur.execute(query, vals)
            print(f"Inserted new resource: {new_res.get('title')}")
    
    conn.commit()
    cur.close()

def process_food(conn, existing_list):
    df = pd.read_csv(FOOD_CSV).fillna("")
    print(f"Processing Food CSV: {len(df)} rows")
    added = 0
    enriched = 0
    
    for _, row in df.iterrows():
        title = row['Location'] if row['Location'] else row['Agency']
        if not title:
            continue
            
        res = {
            'title': title,
            'category': 'Food',
            'address': row['Address'],
            'latitude': row['Latitude'] if row['Latitude'] != "" else None,
            'longitude': row['Longitude'] if row['Longitude'] != "" else None,
            'phone': row['Phone Number'],
            'website': row['Website'],
            'hours': row['Days/Hours'],
            'audience': row['Who They Serve'],
            'services': row['Food Resource Type'],
            'description': f"Agency: {row['Agency']}. Operational Status: {row['Operational Status']}. Type: {row['Food Resource Type']}",
            'is_approved': True
        }
        
        # Parse City and Zip from address
        addr = str(res['address'])
        if "WA" in addr:
            parts = addr.split(",")
            if len(parts) >= 3:
                res['city'] = parts[-2].strip()
                zip_match = re.search(r'\b98\d{3}\b', addr)
                if zip_match:
                    res['zip'] = zip_match.group(0)
                    
        match = find_match(res, existing_list)
        
        # Enrichment Check (skip if DB match already has phone/site)
        already_has_phone = match and match.get('phone')
        already_has_web = match and match.get('website')
        did_search = False
        if not (res['phone'] or already_has_phone) or not (res['website'] or already_has_web):
            info = research_missing_info(res['title'], res.get('city', 'Seattle'))
            if 'phone' in info and not res['phone']:
                res['phone'] = info['phone']
                enriched += 1
            if 'website' in info and not res['website']:
                res['website'] = info['website']
                enriched += 1
            did_search = True
                
        merge_and_save(conn, res, match)
        added += 1
        if did_search: time.sleep(1) # Rate limit protection for DDG
        
    print(f"Food complete: Processed {added}, Enriched {enriched}")
    return added, enriched

def process_shelter(conn, existing_list):
    print("Processing Shelter CSV...")
    added = 0
    enriched = 0
    
    with open(SHELTER_CSV, 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        for row in reader:
            if not row or len(row) < 14:
                continue
            name = row[0] or row[2]
            if not name: continue
            
            res = {
                'title': name,
                'category': 'Housing / Shelter',
                'description': f"Agency: {row[1]}. Type: {row[5]}. Capacity: {row[11] if len(row)>11 else 'Unknown'}. Focus: {row[13] if len(row)>13 else 'Unknown'}.",
                'city': row[3],
                'audience': row[12] if len(row)>12 else "",
                'tags': row[13] if len(row)>13 else "",
                'is_approved': True,
                'address': "",
                'phone': "",
                'website': "",
                'zip': ""
            }
            
            match = find_match(res, existing_list)
            
            already_has_phone = match and match.get('phone')
            already_has_web = match and match.get('website')
            already_has_zip = match and match.get('zip')
            
            did_search = False
            if not (res['phone'] or already_has_phone) or not (res['website'] or already_has_web):
                info = research_missing_info(res['title'], res['city'])
                if 'phone' in info and not res['phone']:
                    res['phone'] = info['phone']
                    enriched += 1
                if 'website' in info and not res['website']:
                    res['website'] = info['website']
                if 'zip' in info and not res['zip']:
                    res['zip'] = info['zip']
                did_search = True
                    
            merge_and_save(conn, res, match)
            added += 1
            if did_search: time.sleep(1)
            
    print(f"Shelter complete: Processed {added}, Enriched {enriched}")
    return added, enriched

if __name__ == "__main__":
    conn = get_db_connection()
    existing = fetch_existing_resources(conn)
    process_food(conn, existing)
    process_shelter(conn, existing)
    conn.close()
