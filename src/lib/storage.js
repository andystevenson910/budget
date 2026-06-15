import { supabase, isSupabaseEnabled } from './supabase';
import { DEFAULT_CATEGORIES, SEED_TRANSACTIONS } from '../data/defaults';

const LOCAL_KEY = 'spending_tracker_data';

function defaultData() {
  return {
    transactions: SEED_TRANSACTIONS,
    categories: DEFAULT_CATEGORIES,
    settings: { startYear: new Date().getFullYear() },
  };
}

export async function loadData(userId) {
  if (isSupabaseEnabled && userId) {
    const { data, error } = await supabase
      .from('user_data')
      .select('transactions, categories, settings')
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !data) return defaultData();
    return {
      transactions: data.transactions ?? [],
      categories: data.categories?.length ? data.categories : DEFAULT_CATEGORIES,
      settings: data.settings ?? { startYear: new Date().getFullYear() },
    };
  }

  try {
    const stored = localStorage.getItem(LOCAL_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return defaultData();
}

export async function saveData(data, userId) {
  if (isSupabaseEnabled && userId) {
    await supabase.from('user_data').upsert({
      user_id: userId,
      transactions: data.transactions,
      categories: data.categories,
      settings: data.settings,
      updated_at: new Date().toISOString(),
    });
    return;
  }
  localStorage.setItem(LOCAL_KEY, JSON.stringify(data));
}
