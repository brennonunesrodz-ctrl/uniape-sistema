// Direct Supabase client — reads/writes to the kv_store table.
// No edge function deployment needed.
import { createClient } from '@supabase/supabase-js';

const PROJECT_ID = 'huxpgbxfuxkjgjdhpxfc';
const ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1eHBnYnhmdXhramdqZGhweGZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcwMTY2NzYsImV4cCI6MjEwMjU5MjY3Nn0.079yVKyWC_vOzZOBPN_pRnMPZwTJHqeHyOjXWvi19e0';

const TABLE = 'kv_store_c43c87bf';

const supabase = createClient(`https://${PROJECT_ID}.supabase.co`, ANON_KEY);

export type Collection = 'users' | 'members' | 'events' | 'attendances' | 'folders' | 'files';

export async function apiGet<T>(collection: Collection): Promise<T | null> {
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select('value')
      .eq('key', 'uniape_' + collection)
      .maybeSingle();
    if (error) {
      console.warn('[Supabase] GET error:', collection, error.message);
      return null;
    }
    return (data?.value as T) ?? null;
  } catch (e) {
    console.warn('[Supabase] GET exception:', collection, e);
    return null;
  }
}

export async function apiSet<T>(collection: Collection, value: T): Promise<boolean> {
  try {
    const { error } = await supabase
      .from(TABLE)
      .upsert({ key: 'uniape_' + collection, value });
    if (error) {
      console.warn('[Supabase] SET error:', collection, error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.warn('[Supabase] SET exception:', collection, e);
    return false;
  }
}

// Test write capability — used by the connection status indicator.
export async function testWrite(): Promise<boolean> {
  try {
    const { error } = await supabase
      .from(TABLE)
      .upsert({ key: 'uniape_healthcheck', value: { ts: Date.now() } });
    return !error;
  } catch {
    return false;
  }
}
