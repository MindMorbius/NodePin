import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { StoreState } from './types';
import { createAuthSlice } from './slices/authSlice';
import { createI18nSlice } from './slices/i18nSlice';
import { createSubscriptionSlice } from './slices/subscriptionSlice';
import { createSupabaseSlice } from './slices/supabaseSlice';
import { createSupabasePublicSlice } from './slices/supabasePublicSlice';

export const useStore = create<StoreState>()(
  persist(
    (...a) => ({
      ...createAuthSlice(...a),
      ...createI18nSlice(...a),
      ...createSubscriptionSlice(...a),
      ...createSupabaseSlice(...a),
      ...createSupabasePublicSlice(...a)
    }),
    {
      name: 'app-store',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        language: state.language
      })
    }
  )
);

// 导出便捷的 hooks
export const useAuth = () => {
  return useStore((state) => ({
    isAuthenticated: state.isAuthenticated,
    login: state.login,
    logout: state.logout,
    checkAuth: state.checkAuth
  }));
};

export const useI18n = () => {
  return useStore((state) => ({
    language: state.language,
    setLanguage: state.setLanguage
  }));
};

export const useSubscription = () => {
  return useStore((state) => ({
    subscriptions: state.subscriptions,
    loading: state.loading,
    error: state.error,
    initialized: state.initialized,
    fetchSubscriptions: state.fetchSubscriptions,
    updateSubscription: state.updateSubscription,
    clearSubscriptions: state.clearSubscriptions
  }));
};

export const useSupabase = () => {
  return useStore((state) => ({
    syncStatus: state.syncStatus,
    syncError: state.syncError,
    syncUserData: state.syncUserData,
    fetchUserData: state.fetchUserData,
    updateUserData: state.updateUserData,
    getTokenInfo: state.getTokenInfo
  }));
};

export const useSupabasePublic = () => {
  return useStore((state) => ({
    users: state.users,
    usersLoading: state.usersLoading,
    usersError: state.usersError,
    fetchUsers: state.fetchUsers
  }));
}; 