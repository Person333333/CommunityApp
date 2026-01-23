from http.server import HTTPServer, BaseHTTPRequestHandler
from api.translate import handler as TranslateHandler
from api.submissions import handler as SubmissionsHandler
from api.delete_resource import handler as DeleteResourceHandler
from api.my_submissions import handler as MySubmissionsHandler
from api.ai import handler as AIHandler
import sys
import json

class RouterHandler(BaseHTTPRequestHandler):
    def send_json_response(self, data):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))

    def send_error(self, code, message):
        self.send_response(code)
        self.send_header('Content-subtype', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps({'error': message}).encode('utf-8'))

    def do_POST(self):
        print(f"DEBUG: RouterHandler received POST request for {self.path}", file=sys.stderr)
        try:
            path = self.path.split('?')[0]
            # Normalize path: remove trailing slash but keep it if it's just '/'
            if len(path) > 1:
                path = path.rstrip('/')
            
            print(f"DEBUG: Normalized path: '{path}'", file=sys.stderr)
            
            if path == '/api/translate':
                return TranslateHandler.do_POST(self)
            elif path == '/api/submissions':
                return SubmissionsHandler.do_POST(self)
            elif path == '/api/delete_resource':
                return DeleteResourceHandler.do_POST(self)
            elif path == '/api/my_submissions':
                return MySubmissionsHandler.do_POST(self)
            elif path == '/api/ai':
                return AIHandler.do_POST(self)
            else:
                print(f"404 Not Found: '{path}' (original: '{self.path}')", file=sys.stderr)
                self.send_response(404)
                self.end_headers()
                self.wfile.write(b'Not Found')
        except Exception as e:
            print(f"CRITICAL API ERROR: {e}", file=sys.stderr)
            import traceback
            traceback.print_exc(file=sys.stderr)
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': str(e)}).encode('utf-8'))

    def do_OPTIONS(self):
        path = self.path.split('?')[0].rstrip('/')
        if path == '/api/translate':
            return TranslateHandler.do_OPTIONS(self)
        elif path == '/api/submissions':
            return SubmissionsHandler.do_OPTIONS(self)
        elif path == '/api/delete_resource':
            return DeleteResourceHandler.do_OPTIONS(self)
        elif path == '/api/my_submissions':
            return MySubmissionsHandler.do_OPTIONS(self)
        elif path == '/api/ai':
            return AIHandler.do_OPTIONS(self)
        else:
            self.send_response(200)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            self.end_headers()

class ThreadedHTTPServer(HTTPServer):
    allow_reuse_address = True

if __name__ == '__main__':
    port = 3002
    server = ThreadedHTTPServer(('localhost', port), RouterHandler)
    print(f"Local API server running on port {port}...")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        server.shutdown()
