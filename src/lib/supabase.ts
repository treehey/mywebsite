import { createClient } from '@supabase/supabase-js';

const url  = process.env.NEXT_PUBLIC_SUPABASE_URL  ?? '';
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const supabase = url && anon ? createClient(url, anon) : null;

/** One visitor submission — maps to `guestbook` table */
export interface GuestEntry {
  id: number;
  danmaku_title: string;   // short, shown in hero scroll
  message: string | null;  // long, shown in guestbook wall
  nickname: string | null; // display name
  color: string;           // random accent colour
  created_at: string;
}
