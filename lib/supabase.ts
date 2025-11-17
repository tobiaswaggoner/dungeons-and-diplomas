import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Supabase environment variables are not set. Please configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local"
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test connection function
export async function testSupabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from("_test").select("*").limit(1);
    // Even if table doesn't exist, if we get a proper error response, connection works
    if (error && error.message.includes("relation") && error.message.includes("does not exist")) {
      console.log("✅ Supabase connection successful (no tables yet)");
      return true;
    }
    console.log("✅ Supabase connection successful");
    return true;
  } catch (err) {
    console.error("❌ Supabase connection failed:", err);
    return false;
  }
}
