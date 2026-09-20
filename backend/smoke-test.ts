import { supabase } from './src/lib/supabase';

async function testConnection() {
  console.log('Testing Supabase connection...');
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Supabase connection failed:', error.message);
      process.exit(1);
    }
    
    console.log('Successfully connected to Supabase.');
  } catch (err: any) {
    console.error('Exception during connection test:', err.message || err);
    process.exit(1);
  }
}

testConnection();
