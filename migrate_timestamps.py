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
        cur.execute(f"ALTER TABLE {table} ADD COLUMN {column} {type} DEFAULT NOW()")
        print(f"Added column {column} to {table}")
    except psycopg2.errors.DuplicateColumn:
        print(f"Column {column} already exists in {table}")
    except Exception as e:
        print(f"Error adding {column}: {e}")

# Add missing timestamp columns
table = 'resource_submissions'
add_column(table, 'created_at', 'TIMESTAMP WITHOUT TIME ZONE')
add_column(table, 'updated_at', 'TIMESTAMP WITHOUT TIME ZONE')

print("Timestamp migration completed.")
conn.close()
