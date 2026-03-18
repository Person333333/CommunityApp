import os
import psycopg2

db_url = 'postgresql://neondb_owner:npg_blPQ09vgTLiI@ep-lucky-glitter-afuy9gkd-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require'

conn = psycopg2.connect(dsn=db_url)
cur = conn.cursor()

cur.execute("""
SELECT column_name, data_type, character_maximum_length, is_nullable
FROM information_schema.columns 
WHERE table_name = 'resources';
""")
print("Columns in 'resources' table:")
for row in cur.fetchall():
    print(row)

cur.execute("""
SELECT conname, pg_get_constraintdef(c.oid)
FROM pg_constraint c
JOIN pg_namespace n ON n.oid = c.connamespace
WHERE conrelid = 'public.resources'::regclass;
""")
print("\nConstraints:")
for row in cur.fetchall():
    print(row)

cur.close()
conn.close()
