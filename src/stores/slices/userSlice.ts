import { StateCreator } from 'zustand';
import { StoreState } from '../types';
import { api } from '@/utils/api';

export interface User {
  name: string | null;
  username: string | null;
  avatar_url: string | null;
  trust_level: number;
}

export interface UserSlice {
  users: User[];
  usersLoading: boolean;
  usersError: string | null;
  fetchUsers: () => Promise<void>;
}

export const createUserSlice: StateCreator<
  StoreState,
  [],
  [],
  UserSlice
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