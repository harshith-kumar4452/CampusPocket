import json
import subprocess
import sys

def talk_to_mcp(command, input_json):
    process = subprocess.Popen(
        command,
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        shell=True
    )
    
    stdout, stderr = process.communicate(input=json.dumps(input_json) + '\n', timeout=60)
    return stdout, stderr

cmd = 'npx -y @supabase/mcp-server-supabase@latest --access-token sbp_587f374e60e187cca4f194bee3cdccc63873016b'

sql_query = """
-- Force PostgREST schema cache reload by altering the authenticator role
ALTER ROLE authenticator SET statement_timeout = '15s';
NOTIFY pgrst, 'reload schema';

-- And do it for anon and authenticated just in case
ALTER ROLE anon SET statement_timeout = '15s';
ALTER ROLE authenticated SET statement_timeout = '15s';
"""

# Call execute_sql
execute_sql_req = {
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
        "name": "execute_sql",
        "arguments": {
            "project_id": "lwoahalttiywfozilnts",
            "query": sql_query
        }
    }
}

print("Reloading PostgREST cache forcefully...")
stdout, stderr = talk_to_mcp(cmd, execute_sql_req)

with open('reload_result.json', 'w', encoding='utf-8') as f:
    f.write(stdout)

if stderr:
    print("STDERR:", stderr, file=sys.stderr)
else:
    print("Cache reloaded. Check reload_result.json")
