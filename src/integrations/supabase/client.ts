// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://urswdfnawlhoyjbflcbx.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyc3dkZm5hd2xob3lqYmZsY2J4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3OTQxMDIsImV4cCI6MjA2MjM3MDEwMn0.9Ql-ADv-9wlMkvf0AI6w9mOXH4NG6JmM91ScOtdBP5U";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);