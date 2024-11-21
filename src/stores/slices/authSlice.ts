import { StateCreator } from 'zustand';
import { api } from '@/utils/api';
import { StoreState } from '../types';

export interface AuthSlice {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
}

export const createAuthSlice: StateCreator<
  StoreState,
  [],
  [],
  AuthSlice
> = (set) => ({
  isAuthenticated: false,

  login: async (username, password) => {
    try {
      const response = await api.post('/auth/login', { username, password });
      const success = response.status === 200;
      set({ isAuthenticated: success });
      return success;
    } catch (error) {
      return false;
    }
  },

  logout: () => {
    set({ isAuthenticated: false });
  },

  checkAuth: async () => {
    try {
      const response = await api.get('/auth/check');
      const isAuth = response.status === 200;
      set({ isAuthenticated: isAuth });
      return isAuth;
    } catch (error) {
      set({ isAuthenticated: false });
      return false;
    }
  }
}); 