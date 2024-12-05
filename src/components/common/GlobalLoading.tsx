'use client';

import { useStore } from '@/stores';

export default function GlobalLoading() {
  const { isSyncing } = useStore();

  if (!isSyncing) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center">
      <div className="bg-[var(--card)] p-6 rounded-xl shadow-xl flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
        <p className="text-lg">正在同步用户数据...</p>
      </div>
    </div>
  );
} 