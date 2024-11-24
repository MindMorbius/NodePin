import { StateCreator } from 'zustand';
import { StoreState } from '../types';
import { supabaseClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

export interface SupabaseSlice {
  syncStatus: 'idle' | 'syncing' | 'success' | 'error';
  syncError: string | null;
  syncUserData: () => Promise<void>;
  fetchUserData: (userId: string) => Promise<any>;
  updateUserData: (userId: string, data: any) => Promise<void>;
  getDiscourseUserId: (discourseId: string) => Promise<string>;
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
      
      const response = await fetch('/api/auth/sync', {
        method: 'POST'
      });
      
      if (!response.ok) throw new Error('Sync failed');
      
      set({ syncStatus: 'success' });
      toast.success('同步成功');
      
      setTimeout(() => {
        set({ syncStatus: 'idle' });
      }, 3000);
    } catch (error) {
      set({ 
        syncStatus: 'error',
        syncError: error instanceof Error ? error.message : 'Unknown error'
      });
      toast.error('同步失败: ' + (error instanceof Error ? error.message : '未知错误'));
    }
  },

  fetchUserData: async (userId: string) => {
    const { data, error } = await supabaseClient
      .from('discourse_users')
      .select('*')
      .eq('discourse_id', userId)
      .single();
      
    if (error) throw error;
    return data;
  },

  updateUserData: async (userId: string, data: any) => {
    const { error } = await supabaseClient
      .from('discourse_users')
      .update(data)
      .eq('discourse_id', userId);

    if (error) throw error;
  },

  getDiscourseUserId: async (discourseId: string) => {
    try {
      set({ syncStatus: 'syncing', syncError: null });
      toast.info('正在获取 Discourse 用户 ID...');
      const { data, error } = await supabaseClient
        .from('discourse_users')
        .select('id')
        .eq('discourse_id', discourseId)
        .single();
        
      if (error) throw error;
      
      set({ syncStatus: 'success' });
      toast.success('获取 Discourse 用户 ID 成功');
      setTimeout(() => {
        set({ syncStatus: 'idle' });
      }, 3000);
      
      return data.id;
    } catch (error) {
      set({ 
        syncStatus: 'error',
        syncError: error instanceof Error ? error.message : 'Unknown error'
      });
      toast.error('获取 Discourse 用户 ID 失败: ' + (error instanceof Error ? error.message : '未知错误'));
      throw error;
    }
  },
}); 