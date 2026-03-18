from http.server import BaseHTTPRequestHandler
import json
import sys
import os

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.run_diagnostics()

    def do_POST(self):
        self.run_diagnostics()

    def run_diagnostics(self):
        diagnostics: dict = {
            "status": "I AM ALIVE",
            "build_info": {
                "timestamp": "2026-01-24 10:25:00 UTC",
                "id": "global-translation-check-v8"
            },
            "environment_variables": {
                "GEMINI_API_KEY_PRESENT": "GEMINI_API_KEY" in os.environ or "VITE_GEMINI_API_KEY" in os.environ,
                "NEON_DATABASE_URL_PRESENT": "NEON_DATABASE_URL" in os.environ or "VITE_NEON_DATABASE_URL" in os.environ
            },
            "database_status": "PENDING",
            "python_version": sys.version
        }

        # Test Database for Translations
        try:
            import psycopg2
            db_url = os.environ.get('NEON_DATABASE_URL') or os.environ.get('VITE_NEON_DATABASE_URL')
            if not db_url:
                diagnostics["database_status"] = "Skipped: No URL"
            else:
                conn = psycopg2.connect(db_url)
                cur = conn.cursor()
                # List all tables
                cur.execute("""
                    SELECT table_name 
                    FROM information_schema.tables 
                    WHERE table_schema = 'public'
                """)
                tables = [row[0] for row in cur.fetchall()]
                
                # Check columns for resource tables
                table_info = {}
                for t_name in ['curated_resources', 'resource_submissions']:
                    if t_name in tables:
                        cur.execute(f"SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '{t_name}'")
                        table_info[t_name] = {row[0]: row[1] for row in cur.fetchall()}
                
                # Check specifics for translations if it exists
                trans_count = 0
                if 'translations' in tables:
                    cur.execute("SELECT COUNT(*) FROM translations")
                    trans_count = cur.fetchone()[0]
                
                diagnostics["database_status"] = {
                    "status": "Success",
                    "all_tables": tables,
                    "table_schemas": table_info,
                    "translations_count": trans_count
                }
                cur.close()
                conn.close()
        except Exception as e:
            diagnostics["database_status"] = {
                "status": f"Failed: {type(e).__name__}",
                "error": str(e)
            }

        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(diagnostics, indent=2).encode('utf-8'))
