import psycopg2
import time
from duckduckgo_search import DDGS

DB_URL = 'postgresql://neondb_owner:npg_blPQ09vgTLiI@ep-lucky-glitter-afuy9gkd-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require'

def fix_and_migrate():
    conn = psycopg2.connect(dsn=DB_URL)
    cur = conn.cursor()

    print("Migrating from resources to curated_resources...")
    # First, let's copy everything from resources to curated_resources
    # We'll use a unique constraint or just check by title to avoid duplicates
    cur.execute("""
        INSERT INTO curated_resources (
            title, description, category, phone, website,
            address, city, state, zip, latitude, longitude,
            audience, hours, services, tags
        )
        SELECT 
            title, description, category, phone, website,
            address, city, 'WA', zip, latitude, longitude,
            audience, hours, services, tags
        FROM resources
        WHERE title NOT IN (SELECT title FROM curated_resources)
    """)
    print(f"Migrated {cur.rowcount} new rows into curated_resources.")
    conn.commit()
    cur.close()
    conn.close()

if __name__ == '__main__':
    fix_and_migrate()
