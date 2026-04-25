import os
from supabase import create_client

url = os.environ.get("EXPO_PUBLIC_SUPABASE_URL")
key = os.environ.get("EXPO_PUBLIC_SUPABASE_KEY")
supabase = create_client(url, key)

res = supabase.table("report_cards").select("*").limit(1).execute()
if res.data:
    print("Columns:", res.data[0].keys())
else:
    print("No data in report_cards table yet.")
