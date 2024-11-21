import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { StoreState } from './types';
import { createAuthSlice } from './slices/authSlice';
import { createI18nSlice } from './slices/i18nSlice';
import { createSubscriptionSlice } from './slices/subscriptionSlice';

export const useStore = create<StoreState>()(
  persist(
    (...a) => ({
      ...createAuthSlice(...a),
      ...createI18nSlice(...a),
      ...createSubscriptionSlice(...a)
    }),
    {
      name: 'app-store',
      // 可选：部分持久化
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