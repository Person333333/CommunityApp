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
            "build_info": {
                "timestamp": "2026-01-23 17:45:00 UTC",
                "version": "v1.2",
                "id": "debug-smoke-test-v2"
            },
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
                
                # List available models
                models = []
                try:
                    for m in genai.list_models():
                        if 'generateContent' in m.supported_generation_methods:
                            models.append(m.name)
                    diagnostics["available_models"] = models[:10] # Show first 10
                except Exception as e:
                    diagnostics["available_models"] = f"Error listing: {str(e)}"

                # Try the most likely valid model names
                test_models = ['gemini-1.5-flash-latest', 'gemini-1.5-flash', 'gemini-pro']
                last_err = ""
                for m_name in test_models:
                    try:
                        model = genai.GenerativeModel(m_name)
                        response = model.generate_content("Ping", request_options={"timeout": 5})
                        diagnostics["smoke_test"]["status"] = "Success"
                        diagnostics["smoke_test"]["model_used"] = m_name
                        diagnostics["smoke_test"]["response_text"] = response.text
                        break
                    except Exception as e:
                        last_err = f"{m_name}: {str(e)}"
                        continue
                
                if diagnostics["smoke_test"].get("status") != "Success":
                    diagnostics["smoke_test"]["status"] = "Failed all attempts"
                    diagnostics["smoke_test"]["last_error"] = last_err

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
