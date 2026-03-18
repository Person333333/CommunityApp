import psycopg2

DB_URL = 'postgresql://neondb_owner:npg_blPQ09vgTLiI@ep-lucky-glitter-afuy9gkd-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require'

conn = psycopg2.connect(dsn=DB_URL)
cur = conn.cursor()

placeholders = {
    'Food': 'https://images.unsplash.com/photo-1593113565694-c6c747f52dbb?q=80&w=1000&auto=format&fit=crop',
    'Housing / Shelter': 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?q=80&w=1000&auto=format&fit=crop',
    'Housing': 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1000&auto=format&fit=crop',
    'Food Assistance': 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1000&auto=format&fit=crop',
    'Healthcare': 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=1000&auto=format&fit=crop',
    'Employment': 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=1000&auto=format&fit=crop',
    'Legal Assistance': 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=1000&auto=format&fit=crop',
    'Utilities & Financial': 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=1000&auto=format&fit=crop',
    'Education': 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1000&auto=format&fit=crop',
    'Default': 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1000&auto=format&fit=crop'
}

cur.execute("SELECT id, category FROM curated_resources WHERE image_url IS NULL;")
rows = cur.fetchall()

for r_id, category in rows:
    img = placeholders.get(category, placeholders['Default'])
    cur.execute("UPDATE curated_resources SET image_url = %s WHERE id = %s;", (img, r_id))

conn.commit()
print(f"Assigned placeholder images to {len(rows)} resources.")

cur.close()
conn.close()
