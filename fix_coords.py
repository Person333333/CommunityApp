import psycopg2

DB_URL = 'postgresql://neondb_owner:npg_blPQ09vgTLiI@ep-lucky-glitter-afuy9gkd-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require'

# Pacific Northwest bounding box (covers WA, OR, ID, and parts of BC)
LAT_MIN, LAT_MAX = 42.0, 51.5
LON_MIN, LON_MAX = -125.0, -114.0

conn = psycopg2.connect(dsn=DB_URL)
cur = conn.cursor()

# Count how many are outside PNW
cur.execute("""
    SELECT COUNT(*) FROM curated_resources
    WHERE latitude IS NOT NULL AND longitude IS NOT NULL
    AND NOT (
        latitude BETWEEN %s AND %s
        AND longitude BETWEEN %s AND %s
    )
""", (LAT_MIN, LAT_MAX, LON_MIN, LON_MAX))
outside = cur.fetchone()[0]
print(f"Resources with non-PNW coordinates: {outside}")

# Null out the coordinates for resources outside PNW (don't delete them)
cur.execute("""
    UPDATE curated_resources
    SET latitude = NULL, longitude = NULL
    WHERE latitude IS NOT NULL AND longitude IS NOT NULL
    AND NOT (
        latitude BETWEEN %s AND %s
        AND longitude BETWEEN %s AND %s
    )
""", (LAT_MIN, LAT_MAX, LON_MIN, LON_MAX))
print(f"Cleared coordinates for {cur.rowcount} out-of-region resources (data kept, just lat/lng removed).")

conn.commit()
cur.close()
conn.close()
