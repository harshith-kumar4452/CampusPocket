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
-- Add SELECT policies to all tables so the authenticated users can read the demo data
CREATE POLICY "Public student_parents view" ON public.student_parents FOR SELECT USING (true);
CREATE POLICY "Public attendance view" ON public.attendance FOR SELECT USING (true);
CREATE POLICY "Public quizzes view" ON public.quizzes FOR SELECT USING (true);
CREATE POLICY "Public quiz_results view" ON public.quiz_results FOR SELECT USING (true);
CREATE POLICY "Public student_classes view" ON public.student_classes FOR SELECT USING (true);
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

print("Adding RLS policies...")
stdout, stderr = talk_to_mcp(cmd, execute_sql_req)

with open('add_policies_result.json', 'w', encoding='utf-8') as f:
    f.write(stdout)

if stderr:
    print("STDERR:", stderr, file=sys.stderr)
else:
    print("Policies added. See add_policies_result.json")
