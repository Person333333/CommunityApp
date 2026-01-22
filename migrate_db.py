import os
import psycopg2
from dotenv import load_dotenv

load_dotenv('.env.local')

db_url = os.getenv('VITE_NEON_DATABASE_URL')
conn = psycopg2.connect(db_url)
conn.autocommit = True
cur = conn.cursor()

def add_column(table, column, type):
    try:
        cur.execute(f"ALTER TABLE {table} ADD COLUMN {column} {type}")
        print(f"Added column {column} to {table}")
    except psycopg2.errors.DuplicateColumn:
        print(f"Column {column} already exists in {table}")
    except Exception as e:
        print(f"Error adding {column}: {e}")

# Add missing columns to resource_submissions
table = 'resource_submissions'
add_column(table, 'zip', 'TEXT')
add_column(table, 'user_id', 'TEXT')
add_column(table, 'image_url', 'TEXT')
add_column(table, 'latitude', 'FLOAT')
add_column(table, 'longitude', 'FLOAT')
add_column(table, 'services', 'TEXT')
add_column(table, 'tags', 'TEXT')
add_column(table, 'hours', 'TEXT')
add_column(table, 'audience', 'TEXT')

print("Migration completed.")
conn.close()
