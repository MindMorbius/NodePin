'use client';

import { useState, useCallback, useEffect } from 'react';

interface StoredSubscription {
  id: number;
  name: string;
  info: {
    total: number;
    upload: number;
    download: number;
    expire: number;
  };
  nodeCount: number;
  status: 'loading' | 'show' | 'hide';
}

const STORAGE_KEY = 'subscription_data';

export function useSubscriptionStore() {
  const [subscriptions, setSubscriptions] = useState<StoredSubscription[]>([]);
  const [initialized, setInitialized] = useState(false);

  // 在组件挂载后初始化数据
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setSubscriptions(JSON.parse(stored));
    }
    setInitialized(true);
  }, []);

  const loadFromStorage = useCallback((): StoredSubscription[] => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const data = stored ? JSON.parse(stored) : [];
    setSubscriptions(data);
    return data;
  }, []);

  const saveToStorage = useCallback((data: StoredSubscription[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setSubscriptions(data);
  }, []);

  const updateSubscription = useCallback((id: number, data: Partial<StoredSubscription>) => {
    const stored = loadFromStorage();
    const index = stored.findIndex(s => s.id === id);
    
    if (index > -1) {
      const newData = [...stored];
      newData[index] = { ...newData[index], ...data };
      saveToStorage(newData);
    }
  }, [loadFromStorage, saveToStorage]);

  const clearStorage = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setSubscriptions([]);
  }, []);

  return {
    subscriptions,
    initialized,
    loadFromStorage,
    saveToStorage,
    updateSubscription,
    clearStorage
  };
} 