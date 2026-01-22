from http.server import BaseHTTPRequestHandler
import json
import os
import psycopg2
import sys
from datetime import datetime
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

            print(f"DEBUG: Received submission data (keys): {list(data.keys())}", file=sys.stderr)

            db_url = os.getenv('VITE_NEON_DATABASE_URL') or os.getenv('DATABASE_URL') or os.getenv('NEON_DATABASE_URL')
            if not db_url:
                self.send_error_response(500, "Database URL not configured")
                return

            conn = psycopg2.connect(db_url)
            cur = conn.cursor()
            
            # 1. Insert into curated_resources (the live directory table)
            query_curated = """
                INSERT INTO curated_resources (
                    title, description, category, email, phone, website, 
                    address, city, state, zip, image_url, latitude, longitude,
                    audience, hours, services, tags, user_id,
                    is_approved, is_featured
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id
            """
            
            values_curated = (
                data.get('title'),
                data.get('description'),
                data.get('category'),
                data.get('contact_email'),
                data.get('phone'),
                data.get('website'),
                data.get('address'),
                data.get('city'),
                data.get('state'),
                data.get('zip'),
                data.get('image_url'),
                data.get('latitude'),
                data.get('longitude'),
                data.get('audience'),
                data.get('hours'),
                data.get('services'), # Should be string or JSON? Text matches DB schema.
                data.get('tags'),     # Should be string or JSON? Text matches DB schema.
                data.get('user_id'),
                data.get('is_approved', True),
                data.get('is_featured', False)
            )
            
            cur.execute(query_curated, values_curated)
            resource_id = cur.fetchone()[0]

            # 2. Also insert into resource_submissions (as requested by user)
            query_subs = """
                INSERT INTO resource_submissions (
                    title, description, category, contact_name, contact_email, 
                    phone, website, address, city, state, 
                    status, submitted_at
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            values_subs = (
                data.get('title'),
                data.get('description'),
                data.get('category'),
                data.get('contact_name'),
                data.get('contact_email'),
                data.get('phone'),
                data.get('website'),
                data.get('address'),
                data.get('city'),
                data.get('state'),
                'approved', # Default to approved based on user's preference
                datetime.now()
            )
            cur.execute(query_subs, values_subs)

            conn.commit()
            cur.close()
            conn.close()

            print(f"DEBUG: Successfully saved submission with ID: {resource_id}", file=sys.stderr)
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({'success': True, 'id': resource_id}).encode('utf-8'))

        except Exception as e:
            print(f"ERROR: Submission failure: {str(e)}", file=sys.stderr)
            import traceback
            traceback.print_exc(file=sys.stderr)
            self.send_error_response(500, str(e))

    def send_error_response(self, code, message):
        self.send_response(code)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps({'error': {'general': message}}).encode('utf-8'))

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
