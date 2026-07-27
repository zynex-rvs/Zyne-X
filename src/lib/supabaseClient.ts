import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

// Initialize the Supabase client. 
// Note: This will throw an error if the URL or KEY is missing, so we check for them to provide a helpful error message.
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables. Please check your .env.local file.");
}

export const supabase = createClient(
  supabaseUrl || "https://placeholder-url.supabase.co", 
  supabaseAnonKey || "placeholder-key"
);
