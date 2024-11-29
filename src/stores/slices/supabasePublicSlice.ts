import { StateCreator } from 'zustand';
import { StoreState } from '../types';
import { api } from '@/utils/api';

export interface UserPublic {
  name: string | null;
  username: string | null;
  avatar_url: string | null;
  trust_level: number | null;
  created_at: string | null;
}

export interface SubscriptionPublic {
  name: string | null;
  data_update_time: string | null;
  fetch_status: string | null;
  node_count: number | null;
  upload_traffic: number | null;
  download_traffic: number | null;
  total_traffic: number | null;
  expire_time: string | null;
  updated_at: string | null;
  created_at: string | null;
}

export interface SupabasePublicSlice {
  usersPublic: UserPublic[];
  usersPublicLoading: boolean;
  usersPublicError: string | null;
  fetchUsersPublic: () => Promise<void>;
  subscriptionsPublic: SubscriptionPublic[];
  subscriptionsPublicLoading: boolean;
  subscriptionsPublicError: string | null;
  fetchSubscriptionsPublic: () => Promise<void>;
}

export const createSupabasePublicSlice: StateCreator<
  StoreState,
  [],
  [],
  SupabasePublicSlice
> = (set) => ({
  usersPublic: [],
  usersPublicLoading: false,
  usersPublicError: null,

  fetchUsersPublic: async () => {
    try {
      set({ usersPublicLoading: true, usersPublicError: null });
      const { data } = await api.get<UserPublic[]>('/public/users');
      set({ usersPublic: data, usersPublicLoading: false });
      console.log(data);
    } catch (error) {
      set({ 
        usersPublicError: error instanceof Error ? error.message : '获取用户列表失败',
        usersPublicLoading: false 
      });
    }
  },

  subscriptionsPublic: [],
  subscriptionsPublicLoading: false,
  subscriptionsPublicError: null,

  fetchSubscriptionsPublic: async () => {
    try {
      set({ subscriptionsPublicLoading: true, subscriptionsPublicError: null });
      const { data } = await api.get<SubscriptionPublic[]>('/public/subscriptions');
      set({ subscriptionsPublic: data, subscriptionsPublicLoading: false });
    } catch (error) {
      set({ 
        subscriptionsPublicError: error instanceof Error ? error.message : '获取订阅列表失败',
        subscriptionsPublicLoading: false 
      });
    }
  },

}); 