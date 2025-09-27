import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env'; // <-- correct import

console.log('Supabase URL:', SUPABASE_URL);
console.log('Supabase ANON Key:', SUPABASE_ANON_KEY);

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  SUPABASE_URL = "https://qlxwzpnslabmckzogqit.supabase.co"
  SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFseHd6cG5zbGFibWNrem9ncWl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3MDI5MzAsImV4cCI6MjA3NDI3ODkzMH0.IXiess17sPAh9XA6rcV6yijUNxyySLIS4hisJTMbTCg"
  throw new Error('Supabase environment variables not set!');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
