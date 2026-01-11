import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://iehammweecbeylxmiqzx.supabase.co";

const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImllaGFtbXdlZWNiZXlseG1pcXp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyOTc5MzAsImV4cCI6MjA3ODg3MzkzMH0.2OW3srbonatseVreC4tTuPnXvmtLud1RQAJ05kiLvlM";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
  },
});
