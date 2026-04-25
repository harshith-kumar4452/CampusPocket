import urllib.request
import urllib.error
import json
import sys

url = "https://api.supabase.com/v1/projects/lwoahalttiywfozilnts/config/auth"
headers = {
    "Authorization": "Bearer sbp_587f374e60e187cca4f194bee3cdccc63873016b",
    "Content-Type": "application/json"
}

req = urllib.request.Request(url, headers=headers)

try:
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode('utf-8'))
        print(json.dumps(data, indent=2))
        
        # Save to file
        with open('auth_config.json', 'w') as f:
            json.dump(data, f, indent=2)
except urllib.error.URLError as e:
    print(f"Error: {e}", file=sys.stderr)
    if hasattr(e, 'read'):
        print(e.read().decode('utf-8'), file=sys.stderr)
