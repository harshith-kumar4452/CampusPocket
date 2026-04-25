const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://lwoahalttiywfozilnts.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3b2FoYWx0dGl5d2ZvemlsbnRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwMDUzMjcsImV4cCI6MjA5MjU4MTMyN30.0lDx_VpkW5bjhPCTXT1jTYYg5yfKRYQsnxXArhkmX78';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testFullAuthFlow() {
  console.log('Testing Full Auth Flow...');
  
  const email = `test_${Date.now()}@campus.com`;
  const password = 'password123';
  const fullName = 'Test Student';
  const role = 'student';

  console.log(`1. Attempting to Sign Up with ${email}`);
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: role,
      },
    },
  });

  if (signUpError) {
    console.error('Sign Up Error:', signUpError.message);
    return;
  }

  console.log('Sign Up Response received.');
  if (signUpData.session) {
    console.log('SUCCESS: Session exists! The auto-confirm trigger is working perfectly.');
  } else {
    console.log('WARNING: No session returned. Email confirmation might still be required by Supabase settings.');
  }

  if (signUpData.user) {
    console.log(`2. Attempting to insert into 'profiles' for user ${signUpData.user.id}...`);
    // Simulate what ensureProfile does
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: signUpData.user.id,
        full_name: fullName,
        email: email,
        role: role,
      })
      .select('*')
      .single();

    if (profileError) {
      console.error('Profile Insert Error:', profileError.message);
    } else {
      console.log('SUCCESS: Profile created successfully! RLS INSERT policy is working.');
      console.log('Profile Data:', profileData);
    }
  }
}

testFullAuthFlow();
