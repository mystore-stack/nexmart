import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl);
  console.log('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:', supabaseKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function getOrganizationId() {
  try {
    // First check what tables exist
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_tables');
    
    if (tablesError) {
      console.log('Cannot check tables, trying organizations directly...');
    } else {
      console.log('Existing tables:', tables);
    }
    
    const { data, error } = await supabase
      .from('organizations')
      .select('id, name, slug')
      .limit(1);
    
    if (error) {
      console.error('Error fetching organization:', error);
      console.log('The organizations table may not exist yet.');
      console.log('You need to create the full database schema first.');
      return;
    }
    
    if (data && data.length > 0) {
      console.log('Organization ID:', data[0].id);
      console.log('Organization Name:', data[0].name);
      console.log('Organization Slug:', data[0].slug);
    } else {
      console.log('No organizations found. You may need to create one first.');
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

getOrganizationId();
