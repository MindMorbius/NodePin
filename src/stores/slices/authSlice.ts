import { StateCreator } from 'zustand';
import { api } from '@/utils/api';
import { StoreState } from '../types';
import { getSession, signIn, signOut } from 'next-auth/react';
import { toast } from 'sonner';

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
        await signOut({ redirect: false });
        toast.error('登录已过期，请重新登录');
        await signIn('linuxdo', { redirect: false });
        return false;
      }

      const response = await fetch('/api/auth/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          accessToken: session.accessToken
        })
      });
      const data = await response.json();
      
      const isAuth = response.ok && data.valid;
      set({ isAuthenticated: isAuth });
      
      if (!isAuth) {
        await signOut({ redirect: false });
        toast.error('登录已过期，请重新登录');
        await signIn('linuxdo', { redirect: false });
      }
      
      return isAuth;
    } catch (error) {
      console.error('Auth check failed:', error);
      set({ isAuthenticated: false });
      await signOut({ redirect: false });
      toast.error('验证失败，请重新登录');
      await signIn('linuxdo', { redirect: false });
      return false;
    }
  }
}); 