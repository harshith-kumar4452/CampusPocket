const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://lwoahalttiywfozilnts.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3b2FoYWx0dGl5d2ZvemlsbnRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwMDUzMjcsImV4cCI6MjA5MjU4MTMyN30.0lDx_VpkW5bjhPCTXT1jTYYg5yfKRYQsnxXArhkmX78';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createTestUser() {
  console.log('Creating test user...');
  
  const email = 'test@campus.com';
  const password = 'password123';
  const fullName = 'Test Student';
  const role = 'student';

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: role,
      },
    },
  });

  if (error) {
    if (error.message.includes('already registered')) {
      console.log('User already exists. You can use:');
      console.log('Email:', email);
      console.log('Password:', password);
    } else {
      console.error('Error creating user:', error.message);
    }
  } else {
    console.log('User created successfully!');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('NOTE: If you have email confirmation enabled, you might need to confirm it in the Supabase Dashboard (or disable it in Settings > Auth).');
  }
}

createTestUser();
