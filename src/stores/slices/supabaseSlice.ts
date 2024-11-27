import { StateCreator } from 'zustand';
import { StoreState } from '../types';
import { toast } from 'sonner';
import { api } from '@/utils/api'

export interface SupabaseSlice {
  syncStatus: 'idle' | 'syncing' | 'success' | 'error';
  syncError: string | null;
  syncUserData: () => Promise<void>;
  fetchUserData: (userId: string) => Promise<any>;
  updateUserData: (userId: string, data: any) => Promise<void>;
  getTokenInfo: (userId: string) => Promise<TokenInfo>;
}

interface TokenInfo {
  userId: string;
  exp: number;
  nbf: number;
  iat: number;
  signature: string;
}

export const createSupabaseSlice: StateCreator<
  StoreState,
  [],
  [],
  SupabaseSlice
> = (set) => ({
  syncStatus: 'idle',
  syncError: null,

  syncUserData: async () => {
    try {
      set({ syncStatus: 'syncing', syncError: null });
      await api.post('/auth/sync');
      set({ syncStatus: 'success' });
      toast.success('同步成功');
      setTimeout(() => {
        set({ syncStatus: 'idle' });
      }, 15000);
    } catch (error) {
      set({ 
        syncStatus: 'error',
        syncError: error instanceof Error ? error.message : 'Unknown error'
      });
      toast.error('同步失败: ' + (error instanceof Error ? error.message : '未知错误'));
    }
  },

  fetchUserData: async (userId: string) => {
    const { data } = await api.get(`/users/${userId}`);
    return data;
  },

  updateUserData: async (userId: string, userData: any) => {
    await api.put(`/users/${userId}`, userData);
  },

  getTokenInfo: async (discourseId: string): Promise<TokenInfo> => {
    try {
      set({ syncStatus: 'syncing', syncError: null });
      toast.info('正在获取 access token...');
      
      const { data } = await api.get<{ accessToken: string }>('/auth/session', {

      });
      
      const [header, payload, signature] = data.accessToken.split('.');
      const decodedPayload = JSON.parse(atob(payload));
      
      set({ syncStatus: 'success' });
      toast.success('获取 access token 成功');
      setTimeout(() => {
        set({ syncStatus: 'idle' });
      }, 3000);
      
      return {
        userId: decodedPayload.sub,
        exp: decodedPayload.exp,
        nbf: decodedPayload.nbf,
        iat: decodedPayload.iat,
        signature
      };
    } catch (error) {
      set({ 
        syncStatus: 'error',
        syncError: error instanceof Error ? error.message : 'Unknown error'
      });
      toast.error('获取 access token 失败: ' + (error instanceof Error ? error.message : '未知错误'));
      throw error;
    }
  },
}); 