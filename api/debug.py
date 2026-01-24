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
        diagnostics = {
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
                # Check for translations table
                cur.execute("SELECT COUNT(*) FROM translations")
                count = cur.fetchone()[0]
                diagnostics["database_status"] = {
                    "status": "Success",
                    "translation_count": count
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
