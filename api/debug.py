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
        # NO EXTERNAL CALLS - JUST ENVIRONMENT CHECK
        diagnostics = {
            "status": "I AM ALIVE",
            "build_info": {
                "timestamp": "2026-01-23 18:05:00 UTC",
                "id": "final-heartbeat-v7"
            },
            "environment_variables": {
                "GEMINI_API_KEY_PRESENT": "GEMINI_API_KEY" in os.environ,
                "VITE_GEMINI_API_KEY_PRESENT": "VITE_GEMINI_API_KEY" in os.environ,
                "DATABASE_URL_PRESENT": "DATABASE_URL" in os.environ or "VITE_NEON_DATABASE_URL" in os.environ
            },
            "python_version": sys.version,
            "path": sys.path
        }

        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(diagnostics, indent=2).encode('utf-8'))
