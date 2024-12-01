import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { StoreState } from './types';
import { createAuthSlice } from './slices/authSlice';
import { createI18nSlice } from './slices/i18nSlice';
import { createSubscriptionSlice } from './slices/subscriptionSlice';
import { createSupabasePublicSlice } from './slices/supabasePublicSlice';

export const useStore = create<StoreState>()(
  persist(
    (...a) => ({
      ...createAuthSlice(...a),
      ...createI18nSlice(...a),
      ...createSubscriptionSlice(...a),
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
    checkAuth: state.checkAuth,
    syncStatus: state.syncStatus,
    syncError: state.syncError,
    syncUserData: state.syncUserData,
    checkSession: state.checkSession
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

export const useSupabasePublic = () => {
  return useStore((state) => ({
    usersPublic: state.usersPublic,
    usersPublicLoading: state.usersPublicLoading,
    usersPublicError: state.usersPublicError,
    fetchUsersPublic: state.fetchUsersPublic,
    subscriptionsPublic: state.subscriptionsPublic,
    subscriptionsPublicLoading: state.subscriptionsPublicLoading,
    subscriptionsPublicError: state.subscriptionsPublicError,
    fetchSubscriptionsPublic: state.fetchSubscriptionsPublic,
    serverTime: state.serverTime,
    fetchServerTime: state.fetchServerTime
  }));
}; 