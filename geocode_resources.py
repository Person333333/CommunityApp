import psycopg2
import requests
import time

DB_URL = 'postgresql://neondb_owner:npg_blPQ09vgTLiI@ep-lucky-glitter-afuy9gkd-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require'

HEADERS = {'User-Agent': 'CommunityApp/1.0 (community-app-geocoder@example.com)'}

def geocode(address, city, state='WA', zip_code=''):
    query = f"{address}, {city}, {state} {zip_code}".strip().strip(',')
    url = 'https://nominatim.openstreetmap.org/search'
    params = {'q': query, 'format': 'json', 'limit': 1, 'countrycodes': 'us,ca'}
    try:
        r = requests.get(url, params=params, headers=HEADERS, timeout=5)
        data = r.json()
        if data:
            lat, lon = float(data[0]['lat']), float(data[0]['lon'])
            # PNW bounding box sanity check
            if 42.0 <= lat <= 51.5 and -125.0 <= lon <= -114.0:
                return lat, lon
    except Exception as e:
        pass
    return None, None

def geocode_all():
    conn = None
    while True:
        try:
            if conn is None:
                conn = psycopg2.connect(dsn=DB_URL)
            
            cur = conn.cursor()

            cur.execute("""
                SELECT id, title, address, city, state, zip 
                FROM curated_resources 
                WHERE (latitude IS NULL OR longitude IS NULL)
                AND address IS NOT NULL AND address != ''
                ORDER BY id
            """)
            rows = cur.fetchall()
            print(f"Need to geocode: {len(rows)} resources")
            if not rows:
                break

            updated = 0
            skipped = 0
            for i, (r_id, title, address, city, state, zip_code) in enumerate(rows):
                try:
                    lat, lon = geocode(address or '', city or 'Seattle', state or 'WA', zip_code or '')
                    if lat and lon:
                        cur.execute(
                            "UPDATE curated_resources SET latitude = %s, longitude = %s WHERE id = %s",
                            (lat, lon, r_id)
                        )
                        updated += 1
                        if updated % 10 == 0:
                            conn.commit()
                            print(f"  Progress: {updated} geocoded ({i+1}/{len(rows)})...")
                    else:
                        skipped += 1
                    
                    time.sleep(1.2)  # Nominatim rate limit: 1 request/sec + safety
                except psycopg2.OperationalError:
                    print("Connection lost, reconnecting...")
                    conn = None
                    break # Break inner loop to reconnect
            
            if conn:
                conn.commit()
                cur.close()
                print(f"\nBatch Done! Geocoded: {updated}, Could not geocode: {skipped}")
                # If we processed all rows without breaking, we're done
                if updated + skipped >= len(rows):
                    break

        except Exception as e:
            print(f"Error: {e}")
            time.sleep(5)
    
    if conn:
        conn.close()

if __name__ == '__main__':
    geocode_all()
