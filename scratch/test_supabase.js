const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://lwoahalttiywfozilnts.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3b2FoYWx0dGl5d2ZvemlsbnRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwMDUzMjcsImV4cCI6MjA5MjU4MTMyN30.0lDx_VpkW5bjhPCTXT1jTYYg5yfKRYQsnxXArhkmX78';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkConnection() {
  console.log('Testing connection to:', supabaseUrl);
  
  // Just try to get the table list via a simple query
  // We don't know the table names, but we can try 'todos' which is common in starters
  const { data, error } = await supabase.from('todos').select('count', { count: 'exact', head: true });

  if (error) {
    console.log('API responded, but encountered an error:', error.message);
    console.log('This usually means the connection is WORKING but the specific table "todos" might not exist or RLS is blocking access.');
  } else {
    console.log('Connection SUCCESSFUL! API is reachable and responded correctly.');
  }
}

checkConnection();
