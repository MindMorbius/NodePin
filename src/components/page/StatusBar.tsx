'use client';

import { useTranslation } from 'react-i18next';

interface StatusBarProps {
  subscriptions: Array<{
    fetch_status: string | null;
    data_update_time: string | null;
  }>;
  loading?: boolean;
  onRefresh?: () => void;
}

export default function StatusBar({ subscriptions, loading, onRefresh }: StatusBarProps) {
  const { t } = useTranslation();
  
  const total = subscriptions.length;
  const loading_count = subscriptions.filter(s => s.fetch_status === 'loading').length;
  const success_count = subscriptions.filter(s => s.fetch_status === 'success').length;
  const failed_count = subscriptions.filter(s => s.fetch_status === 'failed').length;
  
  const lastUpdate = subscriptions
    .map(s => s.data_update_time)
    .filter(Boolean)
    .sort()
    .reverse()[0];

  if (loading) {
    return (
      <div className="mb-6 p-4 bg-[var(--card)] rounded-xl ring-1 ring-black/5">
        <div className="flex items-center space-x-4">
          <div className="h-4 w-24 bg-[var(--card-hover)] animate-pulse rounded" />
          <div className="h-4 w-16 bg-[var(--card-hover)] animate-pulse rounded" />
          <div className="h-4 w-20 bg-[var(--card-hover)] animate-pulse rounded" />
        </div>
        {/* 进度条骨架 */}
        <div className="mt-3 h-1 bg-[var(--card-hover)] rounded-full overflow-hidden">
          <div className="h-full w-2/3 bg-[var(--card-hover)] animate-pulse" />
        </div>
      </div>
    );
  }

  if (total === 0) return null;

  return (
    <div className="mb-6 p-4 bg-[var(--card)] rounded-xl ring-1 ring-black/5 hover:shadow-lg transition-all">
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"></div>
          <span className="opacity-75">{t('statusBar.total')}</span>
          <span className="font-medium">{total}</span>
        </div>
        
        {loading_count > 0 && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
            <span className="opacity-75">{t('statusBar.loading')}</span>
            <span className="font-medium">{loading_count}</span>
          </div>
        )}

        {success_count > 0 && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="opacity-75">{t('statusBar.valid')}</span>
            <span className="font-medium">{success_count}</span>
          </div>
        )}

        {failed_count > 0 && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <span className="opacity-75">{t('statusBar.invalid')}</span>
            <span className="font-medium">{failed_count}</span>
          </div>
        )}

        {loading && (
          <div className="flex-1 flex justify-end">
            <span className="opacity-75">{t('statusBar.updating')}</span>
          </div>
        )}
      </div>

      {/* 进度条 */}
      <div className="mt-3 h-1 bg-[var(--card-hover)] rounded-full overflow-hidden">
        <div className="h-full flex">
          <div 
            className="bg-gradient-to-r from-green-500 to-green-400 transition-all duration-300"
            style={{ width: `${(success_count / total) * 100}%` }}
          />
          <div 
            className="bg-gradient-to-r from-yellow-500 to-yellow-400 animate-pulse transition-all duration-300"
            style={{ width: `${(loading_count / total) * 100}%` }}
          />
          <div 
            className="bg-gradient-to-r from-red-500 to-red-400 transition-all duration-300"
            style={{ width: `${(failed_count / total) * 100}%` }}
          />
        </div>
      </div>

      {/* 加载状态提示 */}
      {loading_count > 0 && !loading && (
        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="text-yellow-500">
            {t('statusBar.incompleteLoading')}
          </span>
          <button
            onClick={onRefresh}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {t('statusBar.reload')}
          </button>
        </div>
      )}
    </div>
  );
} 