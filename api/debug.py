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
                "timestamp": "2026-01-23 17:55:00 UTC",
                "id": "emergency-isolation-v4"
            },
            "environment_variables": {
                "GEMINI_API_KEY_PRESENT": "GEMINI_API_KEY" in os.environ,
                "VITE_GEMINI_API_KEY_PRESENT": "VITE_GEMINI_API_KEY" in os.environ,
            },
            "python_version": sys.version,
            "smoke_test": "PENDING"
        }
        
        # Test Gemini
        try:
            import google.generativeai as genai
            key = os.environ.get('GEMINI_API_KEY') or os.environ.get('VITE_GEMINI_API_KEY')
            if not key:
                diagnostics["smoke_test"] = "Skipped: No Key"
            else:
                # Test both v1 and v1beta
                for api_ver in ['v1', 'v1beta']:
                    try:
                        genai.configure(api_key=key, transport='rest')
                        # Try listing models to see what we CAN use
                        models = []
                        for m in genai.list_models():
                            models.append(m.name)
                        
                        diagnostics[f"models_{api_ver}"] = models
                        
                        # Try a generic model that usually exists
                        model = genai.GenerativeModel('gemini-pro')
                        response = model.generate_content("Ping", request_options={"timeout": 5})
                        diagnostics["smoke_test"] = {
                            "status": "Success",
                            "api_version": api_ver,
                            "model": "gemini-pro",
                            "response": response.text
                        }
                        break # Found one that works
                    except Exception as e:
                        diagnostics[f"err_{api_ver}"] = f"{type(e).__name__}: {str(e)}"
        except Exception as e:
            diagnostics["critical_error"] = f"{type(e).__name__}: {str(e)}"

        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(diagnostics, indent=2).encode('utf-8'))
