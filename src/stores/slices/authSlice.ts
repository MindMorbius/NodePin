import { StateCreator } from 'zustand';
import { api } from '@/utils/api';
import { StoreState } from '../types';
import { getSession, signIn, signOut } from 'next-auth/react';

export interface AuthSlice {
  isAuthenticated: boolean;
  setAuthenticated: (status: boolean) => void;
  login: () => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
}

export const createAuthSlice: StateCreator<
  StoreState,
  [],
  [],
  AuthSlice
> = (set) => ({
  isAuthenticated: false,

  setAuthenticated: (status) => {
    set({ isAuthenticated: status });
  },

  login: async () => {
    try {
      const result = await signIn('linuxdo', { redirect: false });
      const success = !result?.error;
      set({ isAuthenticated: success });
      return success;
    } catch (error) {
      set({ isAuthenticated: false });
      return false;
    }
  },

  logout: async () => {
    await signOut({ redirect: false });
    set({ isAuthenticated: false });
  },

  checkAuth: async () => {
    try {
      const session = await getSession();
      if (!session?.user) {
        set({ isAuthenticated: false });
        return false;
      }

      const response = await fetch('/api/auth/check');
      const data = await response.json();
      
      const isAuth = response.ok && data.authenticated;
      set({ isAuthenticated: isAuth });
      return isAuth;
    } catch (error) {
      console.error('Auth check failed:', error);
      set({ isAuthenticated: false });
      return false;
    }
  }
}); 