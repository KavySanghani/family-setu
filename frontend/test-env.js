import { loadEnv } from 'vite';
const env = loadEnv('development', process.cwd(), '');
if (env.VITE_SUPABASE_URL && env.VITE_SUPABASE_PUBLISHABLE_KEY) {
  console.log("Frontend env successfully loaded.");
} else {
  console.log("Frontend env failed to load.", env.VITE_SUPABASE_URL ? "URL present" : "URL missing", env.VITE_SUPABASE_PUBLISHABLE_KEY ? "Key present" : "Key missing");
}
