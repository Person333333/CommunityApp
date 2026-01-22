from http.server import BaseHTTPRequestHandler
import json
import os
import psycopg2
import sys
from urllib.parse import parse_qs, urlparse
from dotenv import load_dotenv

# Load environment variables for local development
load_dotenv('.env.local')
load_dotenv()

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            if content_length == 0:
                self.send_error_response(400, "Empty request body")
                return

            post_data = self.rfile.read(content_length)
            try:
                data = json.loads(post_data.decode('utf-8'))
            except json.JSONDecodeError as e:
                self.send_error_response(400, f"Invalid JSON: {str(e)}")
                return

            user_id = data.get('user_id')

            if not user_id:
                self.send_error_response(400, "Missing user_id")
                return

            db_url = os.getenv('VITE_NEON_DATABASE_URL') or os.getenv('DATABASE_URL') or os.getenv('NEON_DATABASE_URL')
            if not db_url:
                self.send_error_response(500, "Database URL not configured")
                return

            conn = psycopg2.connect(db_url)
            cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) if hasattr(psycopg2.extras, 'RealDictCursor') else None
            
            # Use RealDictCursor if available, otherwise manual map
            if not cur:
                from psycopg2.extras import RealDictCursor
                cur = conn.cursor(cursor_factory=RealDictCursor)

            query = "SELECT * FROM curated_resources WHERE user_id = %s ORDER BY created_at DESC"
            cur.execute(query, (user_id,))
            rows = cur.fetchall()
            
            # Helper to convert datetimes to strings for JSON
            def serialize(obj):
                if isinstance(obj, bytes):
                    return obj.decode('utf-8')
                if hasattr(obj, 'isoformat'):
                    return obj.isoformat()
                return obj

            results = []
            for row in rows:
                results.append({k: serialize(v) for k, v in row.items()})

            cur.close()
            conn.close()

            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(results).encode('utf-8'))

        except Exception as e:
            print(f"ERROR: My submissions fetch failure: {str(e)}", file=sys.stderr)
            import traceback
            traceback.print_exc(file=sys.stderr)
            self.send_error_response(500, str(e))

    def send_error_response(self, code, message):
        self.send_response(code)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps({'error': message}).encode('utf-8'))

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
