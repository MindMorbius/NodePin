'use client';

interface StatusBarProps {
  subscriptions: Array<{
    id: number;
    status: 'loading' | 'show' | 'hide';
  }>;
  loading?: boolean;
  onRefresh?: () => void;
}

export default function StatusBar({ subscriptions, loading, onRefresh }: StatusBarProps) {
  const total = subscriptions.length;
  const loading_count = subscriptions.filter(s => s.status === 'loading').length;
  const success_count = subscriptions.filter(s => s.status === 'show').length;
  const failed_count = subscriptions.filter(s => s.status === 'hide').length;

  if (total === 0) return null;

  return (
    <div className="mb-6 p-4 bg-[var(--card)] rounded-xl ring-1 ring-black/5 hover:shadow-lg transition-all">
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"></div>
          <span className="opacity-75">订阅总数</span>
          <span className="font-medium">{total}</span>
        </div>
        
        {loading_count > 0 && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
            <span className="opacity-75">正在获取</span>
            <span className="font-medium">{loading_count}</span>
          </div>
        )}

        {success_count > 0 && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="opacity-75">有效订阅</span>
            <span className="font-medium">{success_count}</span>
          </div>
        )}

        {failed_count > 0 && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <span className="opacity-75">失效订阅</span>
            <span className="font-medium">{failed_count}</span>
          </div>
        )}

        {loading && (
          <div className="flex-1 flex justify-end">
            <span className="opacity-75">更新中...</span>
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
            检测到未完成的加载任务
          </span>
          <button
            onClick={onRefresh}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            点击重新加载
          </button>
        </div>
      )}
    </div>
  );
} 