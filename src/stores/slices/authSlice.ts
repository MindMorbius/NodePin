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
  syncStatus: 'idle' | 'syncing' | 'success' | 'error';
  syncError: string | null;
  syncUserData: () => Promise<void>;
  getTokenInfo: (userId: string) => Promise<TokenInfo>;
  isLoginDialogOpen: boolean;
  setLoginDialogOpen: (open: boolean) => void;
  checkSession: () => Promise<SessionInfo>;
  handleAuthFailure: (message: string) => Promise<void>;
}

interface TokenInfo {
  userId: string;
  exp: number;
  nbf: number;
  iat: number;
  signature: string;
}

interface SessionInfo {
  serverTime: number;
  expiresAt: number;
}

export const createAuthSlice: StateCreator<
  StoreState,
  [],
  [],
  AuthSlice
> = (set) => ({
  isAuthenticated: false,
  syncStatus: 'idle',
  syncError: null,
  isLoginDialogOpen: false,

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

  setAuthenticated: (status) => {
    set({ isAuthenticated: status });
  },

  setLoginDialogOpen: (open) => set({ isLoginDialogOpen: open }),

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
        set({ isAuthenticated: false, isLoginDialogOpen: true });
        await signOut({ redirect: false });
        toast.error('登录已过期，请重新登录');
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
        set({ isAuthenticated: false, isLoginDialogOpen: true });
        await signOut({ redirect: false });
        toast.error('登录已过期，请重新登录');
      }
      
      return isAuth;
    } catch (error) {
      console.error('Auth check failed:', error);
      set({ isAuthenticated: false, isLoginDialogOpen: true });
      await signOut({ redirect: false });
      toast.error('验证失败，请重新登录');
      return false;
    }
  },

  getTokenInfo: async (): Promise<TokenInfo> => {
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

  checkSession: async (): Promise<SessionInfo> => {
    try {
      set({ syncStatus: 'syncing', syncError: null });
      toast.info('正在检查会话状态...');
      
      const [timeResponse, sessionResponse] = await Promise.all([
        api.get<{ time: number }>('/public/time'),
        api.get<{ accessToken: string }>('/auth/session')
      ]);
      
      const [, payload] = sessionResponse.data.accessToken.split('.');
      const decodedPayload = JSON.parse(atob(payload));
      
      set({ syncStatus: 'success' });
      toast.success('会话状态正常');
      setTimeout(() => {
        set({ syncStatus: 'idle' });
      }, 3000);

      return {
        serverTime: timeResponse.data.time,
        expiresAt: decodedPayload.exp * 1000 // 转换为毫秒
      };
    } catch (error) {
      set({ 
        syncStatus: 'error',
        syncError: error instanceof Error ? error.message : 'Unknown error'
      });
      // toast.error('会话检查失败: ' + (error instanceof Error ? error.message : '未知错误'));
      throw error;
    }
  },

  handleAuthFailure: async (message: string) => {
    await signOut({ redirect: false });
    set({ isAuthenticated: false, isLoginDialogOpen: true });
    toast.error(message);
  },
}); 