import psycopg2
conn = psycopg2.connect(dsn='postgresql://neondb_owner:npg_blPQ09vgTLiI@ep-lucky-glitter-afuy9gkd-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require')
cur = conn.cursor()
cur.execute("SELECT id, title, category, is_approved, image_url FROM resources ORDER BY id DESC LIMIT 10;")
for row in cur.fetchall():
    print(row)
cur.close()
conn.close()
