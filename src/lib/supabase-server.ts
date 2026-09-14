import { createClient } from "@supabase/supabase-js";

// This is the server-side Supabase client (using service_role key)
// ONLY use this in Server Actions or API routes, never expose to the client!
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
