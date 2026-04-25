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
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';
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

print("Getting tables...")
stdout, stderr = talk_to_mcp(cmd, execute_sql_req)

with open('tables_result.json', 'w', encoding='utf-8') as f:
    f.write(stdout)

if stderr:
    print("STDERR:", stderr, file=sys.stderr)
else:
    print("Tables fetched. Check tables_result.json")
