import http.server
import urllib.request
import urllib.error
import os

PORT = 4200
DIST_DIR = os.path.join(os.path.dirname(__file__), "dist", "frontend", "browser")

class ProxyHTTPHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIST_DIR, **kwargs)

    def do_GET(self):
        if self.path.startswith("/api/"):
            target_url = "http://127.0.0.1:5000" + self.path[4:]
            try:
                with urllib.request.urlopen(target_url) as resp:
                    self.send_response(resp.status)
                    for k, v in resp.headers.items():
                        self.send_header(k, v)
                    self.end_headers()
                    self.wfile.write(resp.read())
            except urllib.error.HTTPError as e:
                self.send_response(e.code)
                for k, v in e.headers.items():
                    self.send_header(k, v)
                self.end_headers()
                self.wfile.write(e.read())
            except Exception as e:
                self.send_error(502, f"Bad Gateway: {str(e)}")
        else:
            requested_path = os.path.join(DIST_DIR, self.path.lstrip("/").split("?")[0])
            if not os.path.exists(requested_path) and not self.path.startswith("/favicon"):
                self.path = "/index.html"
            super().do_GET()

    def do_POST(self):
        if self.path.startswith("/api/"):
            target_url = "http://127.0.0.1:5000" + self.path[4:]
            length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(length)
            req = urllib.request.Request(
                target_url,
                data=body,
                headers={"Content-Type": self.headers.get("Content-Type", "application/json")}
            )
            try:
                with urllib.request.urlopen(req) as resp:
                    self.send_response(resp.status)
                    for k, v in resp.headers.items():
                        self.send_header(k, v)
                    self.end_headers()
                    self.wfile.write(resp.read())
            except urllib.error.HTTPError as e:
                self.send_response(e.code)
                for k, v in e.headers.items():
                    self.send_header(k, v)
                self.end_headers()
                self.wfile.write(e.read())
            except Exception as e:
                self.send_error(502, f"Bad Gateway: {str(e)}")
        else:
            self.send_error(405, "Method Not Allowed")

if __name__ == "__main__":
    server = http.server.ThreadingHTTPServer(("127.0.0.1", PORT), ProxyHTTPHandler)
    print(f"[*] Serving Angular frontend at http://localhost:{PORT} with /api reverse proxy...")
    server.serve_forever()
