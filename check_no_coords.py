import psycopg2
conn = psycopg2.connect(dsn='postgresql://neondb_owner:npg_blPQ09vgTLiI@ep-lucky-glitter-afuy9gkd-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require')
cur = conn.cursor()
cur.execute("SELECT COUNT(*) FROM curated_resources WHERE latitude IS NOT NULL AND longitude IS NOT NULL")
with_coords = cur.fetchone()[0]
cur.execute("SELECT COUNT(*) FROM curated_resources WHERE latitude IS NULL OR longitude IS NULL")
without_coords = cur.fetchone()[0]
print(f"With coordinates: {with_coords}")
print(f"Without coordinates (won't show on map): {without_coords}")
cur.execute("SELECT category, COUNT(*) FROM curated_resources WHERE latitude IS NULL GROUP BY category ORDER BY COUNT(*) DESC LIMIT 10")
for row in cur.fetchall():
    print(f"  {row[0]}: {row[1]} missing coords")
cur.close()
conn.close()
