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
            },
            "smoke_test": {}
        }
        
        # Test Gemini
        try:
            import google.generativeai as genai
            key = os.environ.get('GEMINI_API_KEY') or os.environ.get('VITE_GEMINI_API_KEY')
            if not key:
                diagnostics["smoke_test"]["status"] = "Skipped: No Key"
            else:
                genai.configure(api_key=key, transport='rest')
                model = genai.GenerativeModel('gemini-1.5-flash')
                # Try a very simple prompt
                response = model.generate_content("Say hello", request_options={"timeout": 10})
                diagnostics["smoke_test"]["status"] = "Success"
                diagnostics["smoke_test"]["response"] = response.text
        except Exception as e:
            diagnostics["smoke_test"]["status"] = f"Failed: {type(e).__name__}"
            diagnostics["smoke_test"]["error"] = str(e)

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
