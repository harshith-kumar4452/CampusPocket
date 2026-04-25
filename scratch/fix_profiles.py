import json, subprocess

def mcp(query):
    cmd = 'npx -y @supabase/mcp-server-supabase@latest --access-token sbp_587f374e60e187cca4f194bee3cdccc63873016b'
    req = {"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"execute_sql","arguments":{"project_id":"lwoahalttiywfozilnts","query":query}}}
    p = subprocess.Popen(cmd, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, shell=True)
    out, _ = p.communicate(input=json.dumps(req)+'\n', timeout=60)
    return out

print("Adding class_level column...")
mcp("ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS class_level INTEGER DEFAULT 5;")

print("Assigning random class levels to students...")
mcp("""
UPDATE public.profiles 
SET class_level = floor(random() * 10 + 1)::int 
WHERE role = 'student';
""")

print("DONE!")
