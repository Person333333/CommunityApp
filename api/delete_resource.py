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

            resource_id = data.get('id')
            user_id = data.get('user_id')

            if not resource_id or not user_id:
                self.send_error_response(400, "Missing id or user_id")
                return

            db_url = os.getenv('VITE_NEON_DATABASE_URL') or os.getenv('DATABASE_URL') or os.getenv('NEON_DATABASE_URL')
            if not db_url:
                self.send_error_response(500, "Database URL not configured")
                return

            conn = psycopg2.connect(db_url)
            cur = conn.cursor()
            
            # Check if resource exists and belongs to user
            cur.execute("SELECT user_id FROM curated_resources WHERE id = %s", (resource_id,))
            row = cur.fetchone()
            
            if not row:
                self.send_error_response(404, "Resource not found")
                cur.close()
                conn.close()
                return
            
            if row[0] != user_id:
                self.send_error_response(403, "Not authorized to delete this resource")
                cur.close()
                conn.close()
                return

            # Perform deletion
            cur.execute("DELETE FROM curated_resources WHERE id = %s", (resource_id,))
            conn.commit()
            cur.close()
            conn.close()

            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({'success': True}).encode('utf-8'))

        except Exception as e:
            print(f"ERROR: Deletion failure: {str(e)}", file=sys.stderr)
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
