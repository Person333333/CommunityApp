from http.server import BaseHTTPRequestHandler
import json
import sys
import os
import subprocess

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.run_diagnostics()

    def do_POST(self):
        self.run_diagnostics()

    def run_diagnostics(self):
        diagnostics = {
            "python_version": sys.version,
            "environment_variables": {
                "GEMINI_API_KEY_PRESENT": "GEMINI_API_KEY" in os.environ,
                "VITE_GEMINI_API_KEY_PRESENT": "VITE_GEMINI_API_KEY" in os.environ,
                "DATABASE_URL_PRESENT": "DATABASE_URL" in os.environ,
                "VITE_NEON_DATABASE_URL_PRESENT": "VITE_NEON_DATABASE_URL" in os.environ,
            },
            "installed_packages": [],
            "imports": {}
        }
        
        # Check imports
        try:
            import google.generativeai
            diagnostics["imports"]["google-generativeai"] = "Success"
        except Exception as e:
            diagnostics["imports"]["google-generativeai"] = f"Failed: {str(e)}"

        try:
            import psycopg2
            diagnostics["imports"]["psycopg2"] = "Success"
        except Exception as e:
            diagnostics["imports"]["psycopg2"] = f"Failed: {str(e)}"

        # Try pip freeze
        try:
            diagnostics["installed_packages"] = subprocess.check_output([sys.executable, "-m", "pip", "freeze"]).decode().split("\n")
        except Exception as e:
            diagnostics["installed_packages"] = f"Error running pip freeze: {str(e)}"

        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(diagnostics, indent=2).encode('utf-8'))
