import psycopg2
conn = psycopg2.connect(dsn='postgresql://neondb_owner:npg_blPQ09vgTLiI@ep-lucky-glitter-afuy9gkd-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require')
cur = conn.cursor()
cur.execute("SELECT title, category, image_url FROM curated_resources WHERE image_url IS NOT NULL LIMIT 5")
for row in cur.fetchall():
    print(row)
cur.close()
conn.close()
