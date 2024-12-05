import { StateCreator } from 'zustand';
import { api } from '@/utils/api';
import { StoreState } from '../types';
import { Subscription } from '@/utils/db';

interface SubscriptionInfo {
  total: number;
  upload: number;
  download: number;
  expire: number;
}


export interface SubscriptionSlice {

  checkSubscriptions: (url: string) => Promise<{ info: SubscriptionInfo; nodes: Node[] }>;
  syncSubscription: (subscription: Subscription) => Promise<{
    data: {
      action: 'kept_db_version' | 'updated_db';
      data: Subscription;
    }
  }>;
  fetchSubscriptions: () => Promise<Subscription[]>;
  fetchAllSubscriptions: () => Promise<{
    data: Array<{
      id: string;
      name: string;
      url: string;
      // ... other fields
      updated_at: string;
    }>;
  }>;
  decryptSubscriptionUrl: (encrypted_url: string) => Promise<{
    success: boolean;
    url: string;
  }>;
}

export const createSubscriptionSlice: StateCreator<
  StoreState,
  [],
  [],
  SubscriptionSlice
> = (set, get) => ({


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
  },

  syncSubscription: async (subscription) => {
    try {
      const response = await api.post('/admin/subscriptions/sync', subscription);
      if (response.data.error) {
        throw new Error(response.data.error);
      }
      return response;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : '同步订阅失败');
    }
  },

  fetchSubscriptions: async () => {
    try {
      const response = await api.get('/api/admin/subscriptions/sync');
      if (response.data.error) {
        throw new Error(response.data.error);
      }
      return response.data.data;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : '获取订阅失败');
    }
  },

  fetchAllSubscriptions: async () => {
    try {
      const response = await api.get('/admin/subscriptions/sync');
      if (response.data.error) {
        throw new Error(response.data.error);
      }
      return response;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : '获取订阅失败');
    }
  },

  decryptSubscriptionUrl: async (encrypted_url: string) => {
    try {
      const response = await api.post('/admin/subscriptions/decrypt', {
        encrypted_url
      });
      
      if (response.data.error) {
        throw new Error(response.data.error);
      }
      
      return response.data;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : '解密订阅失败');
    }
  }
}); 