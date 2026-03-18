import os
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

# Hardcoded Neon URL
DB_URL = 'postgresql://neondb_owner:npg_blPQ09vgTLiI@ep-lucky-glitter-afuy9gkd-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require'

LEGAL_CSV = "datasets/Legal - Legal, Utility, and WorkSource Data.csv"
UTILITY_CSV = "datasets/Data Resources for Utility - Data Resources for Legal, Utility, WorkSource.csv"
SCHOOLS_CSV = "datasets/WashingtonStatePublicSchools.csv"
HOSPITALS_CSV = "datasets/Hospitals_Hospitals.csv"
PHARMACIES_CSV = "datasets/pharmacies_pharmacies.csv"
WIC_CSV = "datasets/wic_clinics_wic_clinics.csv"

def get_db_connection():
    return psycopg2.connect(dsn=DB_URL)

def normalize_string(s):
    if not isinstance(s, str): return ""
    return re.sub(r'[^a-z0-9]', '', s.lower().strip())

def fetch_existing_resources(conn):
    cur = conn.cursor()
    cur.execute("SELECT id, title, address, phone, website, zip, description, services, tags FROM resources;")
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
            'services': r[7] or "",
            'tags': r[8] or "",
            'norm_name': normalize_string(r[1]),
            'norm_addr': normalize_string(r[2])
        })
    return existing

def find_match(resource, existing_list):
    r_norm_name = normalize_string(resource['title'])
    r_norm_addr = normalize_string(resource['address'])
    
    for ex in existing_list:
        if ex['norm_name'] == r_norm_name:
            if r_norm_addr and ex['norm_addr']:
                if r_norm_addr == ex['norm_addr'] or (r_norm_addr in ex['norm_addr']) or (ex['norm_addr'] in r_norm_addr):
                    return ex
            else:
                return ex
    return None

def research_missing_info(name, city):
    if not DDGS: return {}
    query = f"{name} {city} Washington contact phone address"
    try:
        with DDGS() as ddgs:
            results = list(ddgs.text(query, max_results=3))
        if not results: return {}
        combined_text = " ".join([r['title'] + " " + r['body'] for r in results])
        info = {}
        phone_match = re.search(r'\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}', combined_text)
        if phone_match: info['phone'] = phone_match.group(0)
        zip_match = re.search(r'\b98\d{3}\b', combined_text)
        if zip_match: info['zip'] = zip_match.group(0)
        website_match = re.search(r'https?://[^\s()"]+', combined_text)
        if website_match: info['website'] = website_match.group(0)
        return info
    except Exception as e:
        print(f"Error researching {name}: {e}")
        return {}

def merge_and_save(conn, new_res, existing_match):
    cur = conn.cursor()
    if existing_match:
        updates = []
        params = []
        for field in ['phone', 'website', 'zip', 'description', 'address', 'city', 'latitude', 'longitude', 'hours', 'audience', 'services', 'tags', 'category']:
            ex_val = existing_match.get(field)
            new_val = new_res.get(field)
            if not ex_val and new_val and new_val not in ["Unclear", "N/A", ""]:
                updates.append(f"{field} = %s")
                params.append(new_val)
        
        # User explicitly requested category cross-check: appending tag if in multiple categories.
        # e.g. If exists as Food, but now adding as Utility, add "Utility" to tags or services.
        if existing_match.get('category') != new_res.get('category') and new_res.get('category'):
            ex_tags = existing_match.get('tags', '')
            new_cat = new_res.get('category')
            if new_cat.lower() not in ex_tags.lower():
                combined_tags = f"{ex_tags}, {new_cat}" if ex_tags else new_cat
                updates.append("tags = %s")
                params.append(combined_tags)

        if updates:
            params.append(existing_match['id'])
            query = f"UPDATE resources SET {', '.join(updates)} WHERE id = %s"
            cur.execute(query, params)
            print(f"Updated existing resource {existing_match['id']} ({existing_match['title']})")
    else:
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

def process_legal(conn, existing_list):
    df = pd.read_csv(LEGAL_CSV).fillna("")
    print(f"Processing Legal CSV: {len(df)} rows")
    added = 0
    
    for _, row in df.iterrows():
        name = row['Organization Name']
        if not name: continue
        res = {
            'title': name,
            'category': 'Legal Assistance',
            'phone': row['Phone'],
            'city': "Seattle" if "Seattle" in str(row['Location']) else row['Location'].replace(', WA', ''),
            'services': row['Focus Area'],
            'description': f"Focus: {row['Focus Area']}. Serves: {row['Location']}",
            'is_approved': True,
            'audience': 'Everyone' if 'LGBTQ' not in row['Focus Area'] else 'LGBTQ+, Low-Income'
        }
        match = find_match(res, existing_list)
        
        # Enrichment
        already_has_phone = match and match.get('phone')
        already_has_web = match and match.get('website')
        did_search = False
        if not (res['phone'] or already_has_phone) or not (res.get('website') or already_has_web):
            info = research_missing_info(name, res['city'])
            if 'phone' in info and not res['phone']: res['phone'] = info['phone']
            if 'website' in info: res['website'] = info['website']
            if 'zip' in info: res['zip'] = info['zip']
            did_search = True
            
        merge_and_save(conn, res, match)
        added += 1
        if did_search: time.sleep(1) # DDGS limit
        
    print(f"Legal complete: {added} rows processed")

def process_utility(conn, existing_list):
    df = pd.read_csv(UTILITY_CSV).fillna("")
    print(f"Processing Utility CSV: {len(df)} rows")
    added = 0
    
    for _, row in df.iterrows():
        name = row['Provider Name']
        if not name: continue
        res = {
            'title': name,
            'category': 'Utilities & Financial',
            'phone': row['Phone'],
            'city': "Seattle" if "City of Seattle" in row['Region Served'] else "King County",
            'services': row['Program Type'],
            'description': f"Type: {row['Program Type']}. Serves: {row['Region Served']}",
            'is_approved': True,
            'audience': 'Low-Income / Needs Assistance'
        }
        match = find_match(res, existing_list)
        
        # Enrichment
        already_has_phone = match and match.get('phone')
        already_has_web = match and match.get('website')
        did_search = False
        if not (res['phone'] or already_has_phone) or not (res.get('website') or already_has_web):
            info = research_missing_info(name, res['city'])
            if 'phone' in info and not res['phone']: res['phone'] = info['phone']
            if 'website' in info: res['website'] = info['website']
            did_search = True
            
        merge_and_save(conn, res, match)
        added += 1
        if did_search: time.sleep(1) 
        
    print(f"Utility complete: {added} rows processed")

def process_schools(conn, existing_list):
    df = pd.read_csv(SCHOOLS_CSV).fillna("")
    # Because there are so many, let's filter just to the relevant King/Snohomish County to match current database
    # Assuming user's dataset is statewide, we'll limit to King County for safety.
    if 'County' in df.columns:
        df = df[df['County'] == 'King']
    
    print(f"Processing OSPI Schools (King County): {len(df)} rows")
    added = 0
    
    for _, row in df.iterrows():
        name = row['School']
        if not name: continue
        addr = row['PhysicalAddress']
        city = addr.split(',')[-2].strip() if ',' in str(addr) else 'Seattle'
        res = {
            'title': name,
            'category': 'Education',
            'address': addr,
            'city': city,
            'latitude': row['BldgLatitude'] if hasattr(row, 'BldgLatitude') and row['BldgLatitude'] else None,
            'longitude': row['BldgLongitude'] if hasattr(row, 'BldgLongitude') and row['BldgLongitude'] else None,
            'audience': 'Youth / Families',
            'services': f"Grades {row['LowestGrade']} to {row['HighestGrade']}",
            'description': f"Public School in {row.get('LEAName', '')}",
            'is_approved': True
        }
        
        match = find_match(res, existing_list)
        merge_and_save(conn, res, match)
        added += 1
        
    print(f"Schools complete: {added} rows processed")

def process_hospitals(conn, existing_list):
    df = pd.read_csv(HOSPITALS_CSV).fillna("")
    print(f"Processing Hospitals CSV: {len(df)} rows")
    added = 0
    for _, row in df.iterrows():
        name = row['NAME']
        if not name: continue
        
        # Address and City
        address = row['ADDRESS']
        city = row['CITY']
        state = 'WA'
        zip_code = str(row['ZIP'])
        phone = str(row['PHONE'])
        website = str(row['Weblink'])
        
        # Extract lat/lon if they exist
        lat = row.get('latitude', row.get('Y_coord', ''))
        lon = row.get('longitude', row.get('X_coord', ''))
        # Fix the swap if JS swapped them
        if lat and lon and float(lat) < 0 and float(lon) > 0:
            lat, lon = lon, lat
            
        res = {
            'title': name,
            'category': 'Healthcare',
            'address': address,
            'city': city,
            'zip': zip_code,
            'phone': phone,
            'website': website,
            'latitude': float(lat) if lat else None,
            'longitude': float(lon) if lon else None,
            'audience': 'Everyone',
            'services': f"Hospital. Total Beds: {row.get('Beds_Total', 'Unknown')}. Acute: {row.get('ACUTE', 'No')}",
            'description': f"Hospital located in {city}.",
            'is_approved': True
        }
        match = find_match(res, existing_list)
        merge_and_save(conn, res, match)
        added += 1
    print(f"Hospitals complete: {added} rows processed")

def process_pharmacies(conn, existing_list):
    df = pd.read_csv(PHARMACIES_CSV).fillna("")
    print(f"Processing Pharmacies CSV: {len(df)} rows")
    added = 0
    for _, row in df.iterrows():
        name = row.get('inFacility', row.get('acAddress1', 'Pharmacy'))
        if not name or name == 'Pharmacy': continue
        
        address = row.get('inAddress1', '')
        city = row.get('inCity', '')
        zip_code = str(row.get('inZip', ''))
        
        # Exact geocoords from JS processing
        lat = row.get('latitude', row.get('Y_coord', ''))
        lon = row.get('longitude', row.get('X_coord', ''))
        if lat and lon and float(lat) < 0 and float(lon) > 0:
            lat, lon = lon, lat
            
        res = {
            'title': name,
            'category': 'Healthcare',
            'address': address,
            'city': city,
            'zip': zip_code,
            'latitude': float(lat) if lat else None,
            'longitude': float(lon) if lon else None,
            'audience': 'Everyone',
            'services': 'Pharmacy Services / Medication',
            'description': f"Pharmacy located in {city}.",
            'is_approved': True
        }
        match = find_match(res, existing_list)
        merge_and_save(conn, res, match)
        added += 1
    print(f"Pharmacies complete: {added} rows processed")

def process_wic(conn, existing_list):
    df = pd.read_csv(WIC_CSV).fillna("")
    print(f"Processing WIC Clinics CSV: {len(df)} rows")
    added = 0
    for _, row in df.iterrows():
        name = row.get('Clinic', row.get('Agency', 'WIC Clinic'))
        address = row.get('Address', '')
        city = row.get('City', '')
        zip_code = str(row.get('ZipCode', ''))
        
        lat = row.get('latitude', row.get('Latitude', ''))
        lon = row.get('longitude', row.get('Longitude', ''))
        if lat and lon and float(lat) < 0 and float(lon) > 0:
            lat, lon = lon, lat
            
        res = {
            'title': name,
            'category': 'Food Assistance',
            'address': address,
            'city': city,
            'zip': zip_code,
            'latitude': float(lat) if lat else None,
            'longitude': float(lon) if lon else None,
            'audience': 'Low-Income / Families with Children',
            'services': 'WIC Clinic, Nutrition Education, Food Assistance',
            'description': f"WIC Clinic operated by {row.get('Agency', 'local agency')}.",
            'is_approved': True
        }
        match = find_match(res, existing_list)
        merge_and_save(conn, res, match)
        added += 1
    print(f"WIC Clinics complete: {added} rows processed")

if __name__ == "__main__":
    conn = get_db_connection()
    existing = fetch_existing_resources(conn)
    process_legal(conn, existing)
    process_utility(conn, existing)
    process_schools(conn, existing)
    process_hospitals(conn, existing)
    process_pharmacies(conn, existing)
    process_wic(conn, existing)
    conn.close()
