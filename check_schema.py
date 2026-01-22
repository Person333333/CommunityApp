import os
import psycopg2
from dotenv import load_dotenv

load_dotenv('.env.local')

db_url = os.getenv('VITE_NEON_DATABASE_URL')
conn = psycopg2.connect(db_url)
cur = conn.cursor()

def get_columns(table_name):
    cur.execute(f"SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '{table_name}'")
    columns = cur.fetchall()
    print(f"--- Columns for {table_name} ---")
    for col in columns:
        print(f"{col[0]}: {col[1]}")

get_columns('curated_resources')
get_columns('resource_submissions')

conn.close()
