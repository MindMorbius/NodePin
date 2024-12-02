import { StateCreator } from 'zustand';
import { api } from '@/utils/api';
import { StoreState } from '../types';

interface SubscriptionInfo {
  total: number;
  upload: number;
  download: number;
  expire: number;
}

interface Subscription {
  id: number;
  name: string;
  info: SubscriptionInfo;
  nodeCount: number;
  status: 'loading' | 'show' | 'hide';
}

export interface SubscriptionSlice {
  subscriptions: Subscription[];
  loading: boolean;
  error: string | null;
  initialized: boolean;
  fetchSubscriptions: () => Promise<void>;
  fetchSingleSubscription: (sub: Subscription) => Promise<void>;
  updateSubscription: (id: number, data: Partial<Subscription>) => void;
  clearSubscriptions: () => void;
  checkSubscriptions: (url: string) => Promise<{ info: SubscriptionInfo; nodes: Node[] }>;
}

export const createSubscriptionSlice: StateCreator<
  StoreState,
  [],
  [],
  SubscriptionSlice
> = (set, get) => ({
  subscriptions: [],
  loading: false,
  error: null,
  initialized: false,

  fetchSubscriptions: async () => {
    const state = get();
    if (state.loading) return;
    
    set({ loading: true, error: null });
    
    try {
      const response = await api.get<{
        success: boolean;
        data: { items: Subscription[] };
      }>('/public/subscriptions');
      
      if (response.data.success) {
        const items = response.data.data.items.map(item => ({
          ...item,
          status: 'loading' as const
        }));
        
        set({ subscriptions: items });
        
        // 处理单个订阅
        for (const sub of items) {
          await get().fetchSingleSubscription(sub);
        }
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '获取订阅失败' });
    } finally {
      set({ loading: false, initialized: true });
    }
  },

  fetchSingleSubscription: async (sub) => {
    try {
      const response = await api.post<{
        success: boolean;
        data: {
          info: SubscriptionInfo;
          nodeCount: number;
        };
      }>('/public/subscriptions', { id: sub.id });

      if (response.data.success && response.data.data.nodeCount > 0) {
        get().updateSubscription(sub.id, {
          ...sub,
          info: response.data.data.info,
          nodeCount: response.data.data.nodeCount,
          status: 'show'
        });
      } else {
        get().updateSubscription(sub.id, {
          ...sub,
          status: 'hide'
        });
      }
    } catch (error) {
      get().updateSubscription(sub.id, {
        ...sub,
        status: 'hide'
      });
    }
  },

  updateSubscription: (id, data) => {
    set(state => ({
      subscriptions: state.subscriptions.map(sub =>
        sub.id === id ? { ...sub, ...data } : sub
      )
    }));
  },

  clearSubscriptions: () => {
    set({ subscriptions: [], initialized: false });
  },

  checkSubscriptions: async (url: string) => {
    try {
      const response = await api.post<{ error?: string; info: SubscriptionInfo; nodes: Node[] }>('/check/subscriptions', { url });
      if (response.data.error) {
        throw new Error(response.data.error);
      }
      return response.data;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : '订阅检查失败');
    }
  }
}); 