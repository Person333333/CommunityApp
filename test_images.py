import psycopg2
import time
from duckduckgo_search import DDGS

DB_URL = 'postgresql://neondb_owner:npg_blPQ09vgTLiI@ep-lucky-glitter-afuy9gkd-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require'

def add_images():
    conn = psycopg2.connect(dsn=DB_URL)
    cur = conn.cursor()

    cur.execute("SELECT id, title, city, category FROM curated_resources WHERE image_url IS NULL LIMIT 5")
    rows = cur.fetchall()
    
    with DDGS() as ddgs:
        for row in rows:
            r_id, title, city, category = row
            query = f"{title} {city} Washington logo OR building photo"
            print(f"Searching: {query}")
            try:
                results = list(ddgs.images(query, max_results=1))
                if results and 'image' in results[0]:
                    img_url = results[0]['image']
                    print(f"Found: {img_url}")
            except Exception as e:
                print(f"Error: {e}")
            time.sleep(2)
            
    cur.close()
    conn.close()

if __name__ == '__main__':
    add_images()
