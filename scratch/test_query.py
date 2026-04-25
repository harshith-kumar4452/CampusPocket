import urllib.request
import json
import sys

URL = "https://lwoahalttiywfozilnts.supabase.co/rest/v1/student_classes?select=class_id,class:classes(*)&student_id=eq.1bc63d81-95f6-42a7-a36a-4d47b7b7c03f"
ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3b2FoYWx0dGl5d2ZvemlsbnRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwMDUzMjcsImV4cCI6MjA5MjU4MTMyN30.0lDx_VpkW5bjhPCTXT1jTYYg5yfKRYQsnxXArhkmX78"

req = urllib.request.Request(URL)
req.add_header('apikey', ANON_KEY)
req.add_header('Authorization', f'Bearer {ANON_KEY}')

try:
    with urllib.request.urlopen(req) as response:
        result = json.loads(response.read().decode())
        with open('query_result.json', 'w') as f:
            json.dump(result, f, indent=2)
        print("Query succeeded. See query_result.json")
except urllib.error.HTTPError as e:
    error_info = e.read().decode()
    print(f"HTTPError: {e.code}")
    print(f"Details: {error_info}")
    with open('query_error.json', 'w') as f:
        f.write(error_info)
