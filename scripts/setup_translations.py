import os
import psycopg2
from dotenv import load_dotenv

load_dotenv('.env.local')
load_dotenv()

def setup_database():
    db_url = os.getenv('VITE_NEON_DATABASE_URL') or os.getenv('DATABASE_URL') or os.getenv('NEON_DATABASE_URL')
    if not db_url:
        print("Error: Database URL not found in environment variables.")
        return

    try:
        conn = psycopg2.connect(db_url)
        cur = conn.cursor()

        # Create translations table
        print("Creating 'translations' table...")
        cur.execute("""
            CREATE TABLE IF NOT EXISTS translations (
                id SERIAL PRIMARY KEY,
                src_lang VARCHAR(10) NOT NULL,
                dest_lang VARCHAR(10) NOT NULL,
                original_text TEXT NOT NULL,
                translated_text TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(src_lang, dest_lang, original_text)
            )
        """)

        # Add index for faster lookups
        print("Creating index on translations...")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_translations_lookup ON translations (src_lang, dest_lang, original_text);")

        conn.commit()
        cur.close()
        conn.close()
        print("Database setup complete!")

    except Exception as e:
        print(f"Error setting up database: {e}")

if __name__ == "__main__":
    setup_database()
