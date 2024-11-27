import { StateCreator } from 'zustand';
import { StoreState } from '../types';
import { api } from '@/utils/api';

export interface User {
  name: string | null;
  username: string | null;
  avatar_url: string | null;
  trust_level: number;
  created_at: string;
}

export interface SupabasePublicSlice {
  users: User[];
  usersLoading: boolean;
  usersError: string | null;
  fetchUsers: () => Promise<void>;
}

export const createSupabasePublicSlice: StateCreator<
  StoreState,
  [],
  [],
  SupabasePublicSlice
> = (set) => ({
  users: [],
  usersLoading: false,
  usersError: null,

  fetchUsers: async () => {
    try {
      set({ usersLoading: true, usersError: null });
      const { data } = await api.get<User[]>('/public/users');
      set({ users: data, usersLoading: false });
      console.log(data);
    } catch (error) {
      set({ 
        usersError: error instanceof Error ? error.message : '获取用户列表失败',
        usersLoading: false 
      });
    }
  },
}); 