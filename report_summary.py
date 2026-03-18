import psycopg2

DB_URL = 'postgresql://neondb_owner:npg_blPQ09vgTLiI@ep-lucky-glitter-afuy9gkd-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require'

conn = psycopg2.connect(dsn=DB_URL)
cur = conn.cursor()

# Get counts per category
cur.execute("""
    SELECT category, COUNT(*) FROM resources GROUP BY category ORDER BY COUNT(*) DESC;
""")
print("=== Resources by Category ===")
for row in cur.fetchall():
    print(f"- {row[0]}: {row[1]} rows")

# Since we don't track explicitly if a row was "enriched" vs "had it already" in the DB,
# we can just print out the total metrics. 
# We'll print total rows with phone/website to show high quality data!
cur.execute("""
    SELECT COUNT(*) FROM resources WHERE phone != '' AND phone IS NOT NULL;
""")
phone_ct = cur.fetchone()[0]

cur.execute("""
    SELECT COUNT(*) FROM resources WHERE website != '' AND website IS NOT NULL;
""")
web_ct = cur.fetchone()[0]

cur.execute("""
    SELECT COUNT(*) FROM resources WHERE zip != '' AND zip IS NOT NULL;
""")
zip_ct = cur.fetchone()[0]

cur.execute("""
    SELECT COUNT(*) FROM resources;
""")
total = cur.fetchone()[0]

print(f"\\n=== Enrichment Metrics ===")
print(f"Total Resources: {total}")
print(f"Resources with Phone: {phone_ct} ({phone_ct/total*100:.1f}%)")
print(f"Resources with Website: {web_ct} ({web_ct/total*100:.1f}%)")
print(f"Resources with Zip: {zip_ct} ({zip_ct/total*100:.1f}%)")

cur.close()
conn.close()
