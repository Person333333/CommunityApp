import psycopg2
conn = psycopg2.connect(dsn='postgresql://neondb_owner:npg_blPQ09vgTLiI@ep-lucky-glitter-afuy9gkd-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require')
cur = conn.cursor()
cur.execute("SELECT COUNT(*) FROM curated_resources")
print("Total rows in curated_resources:", cur.fetchone()[0])
cur.close()
conn.close()
