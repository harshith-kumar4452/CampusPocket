import urllib.request
import json
import sys

URL = "https://lwoahalttiywfozilnts.supabase.co/auth/v1/token?grant_type=password"
ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3b2FoYWx0dGl5d2ZvemlsbnRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwMDUzMjcsImV4cCI6MjA5MjU4MTMyN30.0lDx_VpkW5bjhPCTXT1jTYYg5yfKRYQsnxXArhkmX78"

payload = {
    "email": "smith@parent.com",
    "password": "password123"
}
data = json.dumps(payload).encode('utf-8')

req = urllib.request.Request(URL, data=data, method='POST')
req.add_header('apikey', ANON_KEY)
req.add_header('Content-Type', 'application/json')

try:
    with urllib.request.urlopen(req) as response:
        result = json.loads(response.read().decode())
        with open('login_result.json', 'w') as f:
            json.dump(result, f, indent=2)
        print("Login succeeded. See login_result.json")
except urllib.error.HTTPError as e:
    error_info = e.read().decode()
    print(f"HTTPError: {e.code}")
    print(f"Details: {error_info}")
    with open('login_error.json', 'w') as f:
        f.write(error_info)
