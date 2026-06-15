import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { DEFAULT_CATEGORIES } from '../data/defaults';
import { loadData, saveData } from '../lib/storage';
import { isSupabaseEnabled } from '../lib/supabase';

const SpendingContext = createContext(null);

export function SpendingProvider({ userId, children }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const saveTimer = useRef(null);
  const initialLoad = useRef(true);

  useEffect(() => {
    setLoading(true);
    loadData(userId).then(d => {
      setData(d);
      setLoading(false);
      initialLoad.current = false;
    });
  }, [userId]);

  useEffect(() => {
    if (!data || initialLoad.current) return;

    if (isSupabaseEnabled && userId) {
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => saveData(data, userId), 800);
      return () => clearTimeout(saveTimer.current);
    }

    saveData(data, userId);
  }, [data, userId]);

  function addTransaction(tx) {
    setData(d => ({ ...d, transactions: [...d.transactions, { ...tx, id: crypto.randomUUID() }] }));
  }

  function deleteTransaction(id) {
    setData(d => ({ ...d, transactions: d.transactions.filter(t => t.id !== id) }));
  }

  function addCategory(cat) {
    setData(d => ({ ...d, categories: [...d.categories, { ...cat, id: crypto.randomUUID() }] }));
  }

  function updateCategory(id, updates) {
    setData(d => ({
      ...d,
      categories: d.categories.map(c => c.id === id ? { ...c, ...updates } : c),
    }));
  }

  function deleteCategory(id) {
    setData(d => ({ ...d, categories: d.categories.filter(c => c.id !== id) }));
  }

  function importData(newData, mode) {
    if (mode === 'replace') {
      setData(newData);
    } else {
      setData(d => {
        const existingIds = new Set(d.transactions.map(t => t.id));
        const added = newData.transactions.filter(t => !existingIds.has(t.id));
        const catMap = new Map(d.categories.map(c => [c.id, c]));
        for (const cat of (newData.categories ?? [])) catMap.set(cat.id, cat);
        return { ...d, transactions: [...d.transactions, ...added], categories: Array.from(catMap.values()) };
      });
    }
  }

  function clearData() {
    setData({ transactions: [], categories: DEFAULT_CATEGORIES, settings: { startYear: new Date().getFullYear() } });
  }

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-3 animate-pulse">💰</div>
          <p className="text-gray-500">Loading your data…</p>
        </div>
      </div>
    );
  }

  return (
    <SpendingContext.Provider value={{
      ...data,
      addTransaction, deleteTransaction,
      addCategory, updateCategory, deleteCategory,
      importData, clearData,
    }}>
      {children}
    </SpendingContext.Provider>
  );
}

export function useSpending() {
  return useContext(SpendingContext);
}
