'use client';

import { useStore } from '@/stores';
import { useNavigationStore } from '@/hooks/useRouter';

export default function GlobalLoading() {
  const { isSyncing } = useStore();
  const { isNavigating } = useNavigationStore();

  if (!isSyncing && !isNavigating) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center">
      <div className="bg-[var(--card)] p-6 rounded-xl shadow-xl flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
        <p className="text-lg">
          {isSyncing ? '正在同步用户数据...' : '正在跳转...'}
        </p>
      </div>
    </div>
  );
} 