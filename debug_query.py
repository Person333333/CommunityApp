import os
import psycopg2
from dotenv import load_dotenv

load_dotenv('.env.local')

db_url = os.getenv('VITE_NEON_DATABASE_URL')
conn = psycopg2.connect(db_url)
cur = conn.cursor()

# Mimic the query from database.ts
query = """
    SELECT 
        id, title, description, category, email as contact_email, phone, website,
        address, city, state, zip, image_url, latitude, longitude,
        audience, hours, services, tags,
        is_approved, is_featured,
        created_at, updated_at, user_id 
    FROM curated_resources 
    UNION ALL
    SELECT 
        id, title, description, category, contact_email, phone, website,
        address, city, state, zip, image_url, latitude, longitude,
        audience, hours, services, tags,
        CASE WHEN status = 'approved' THEN true ELSE false END as is_approved,
        false as is_featured,
        created_at, updated_at, user_id
    FROM resource_submissions
    ORDER BY is_featured DESC, created_at DESC, title ASC
    LIMIT 10
"""

try:
    print("Executing query...")
    cur.execute(query)
    rows = cur.fetchall()
    print(f"Success! Retrieved {len(rows)} rows.")
    for row in rows:
        print(f"ID: {row[0]}, Title: {row[1]}")
except Exception as e:
    print(f"Query FAILED: {e}")

conn.close()
