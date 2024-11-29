import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface SubscriptionPublicData {
  id: number;
  name: string;
  info: {
    total: number;
    upload: number;
    download: number;
    expire: number;
  };
  nodeCount: number;
  loading: boolean;
  status: 'loading' | 'show' | 'hide';
  error: boolean;
  dataUpdateTime: string | null;
  updatedAt: string | null;
  createdAt: string | null;
}

export default function SubscriptionPublicCard({ sub, loading }: {
  sub: SubscriptionPublicData;
  loading: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();
  const hasError = !loading && (!sub.nodeCount || sub.error);
  const hasValidInfo = sub.info.total > 0;

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB'];
    const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return null;
    try {
      return formatDistanceToNow(new Date(timeString), { 
        addSuffix: true, 
        locale: zhCN 
      });
    } catch {
      return null;
    }
  };

  const formatExpireTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const relativeTime = formatDistanceToNow(date, { 
      addSuffix: true, 
      locale: zhCN 
    });
    return {
      date: date.toLocaleDateString(),
      relative: relativeTime
    };
  };

  return (
    <>
      {/* 简洁卡片视图 */}
      <div
        onClick={() => !loading && setIsOpen(true)}
        className={`bg-[var(--card)] p-6 rounded-xl ring-1 cursor-pointer
          ${hasError ? 'ring-red-500/30' : 'ring-black/5'}
          hover:shadow-xl transition-all duration-200 hover:-translate-y-1
          ${loading ? 'animate-pulse' : ''}`}
      >
        <h2 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent
            line-clamp-2 hover:line-clamp-none" title={sub.name}>
          {sub.name}
        </h2>

        {!hasError && (
          <>
            <div className="text-sm mt-4 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="opacity-75">{t('subscription.lastUpdate')}</span>
              <span className="font-medium">{formatTime(sub.dataUpdateTime)}</span>
            </div>
            {sub.info.expire > 0 && (
                      <div className="text-sm mt-4 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        <span className="opacity-75">{t('subscription.expire')}</span>
                        <span className="font-medium">
                          {formatExpireTime(sub.info.expire).date}
                          <span className="ml-1 opacity-75">
                            ({formatExpireTime(sub.info.expire).relative})
                          </span>
                        </span>
            </div>
          )}
            {hasValidInfo && (
              <div className="mt-4">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-300"
                    style={{
                      width: `${Math.min(((sub.info.upload + sub.info.download) / sub.info.total) * 100, 100)}%`
                    }}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* 详细信息对话框 */}
      <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-[var(--card)] rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto
            ring-1 ring-black/5 shadow-xl">
            <div className="flex justify-between items-center mb-5">
              <Dialog.Title className="text-xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                {sub.name}
              </Dialog.Title>
              <button 
                onClick={() => setIsOpen(false)} 
                className="p-1.5 rounded-lg hover:bg-black/5 transition-colors"
              >
                <XMarkIcon className="w-5 h-5 opacity-60" />
              </button>
            </div>

            {hasError ? (
              <div className="text-sm text-red-500/80 mt-4">
                {t('subscription.nodeError')}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                  <span className="opacity-75">{t('subscription.nodes')}</span>
                  <span className="font-medium">{sub.nodeCount}</span>
                </div>
                {hasValidInfo ? (
                  <>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                      <span className="opacity-75">{t('subscription.total')}</span>
                      <span className="font-medium">{formatBytes(sub.info.total)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <span className="opacity-75">{t('subscription.upload')}</span>
                      <span className="font-medium">{formatBytes(sub.info.upload)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                      <span className="opacity-75">{t('subscription.download')}</span>
                      <span className="font-medium">{formatBytes(sub.info.download)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="opacity-75">{t('subscription.used')}</span>
                      <span className="font-medium">{formatBytes(sub.info.upload + sub.info.download)}</span>
                    </div>
                    {sub.info.expire > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        <span className="opacity-75">{t('subscription.expire')}</span>
                        <span className="font-medium">
                          {formatExpireTime(sub.info.expire).date}
                          <span className="ml-1 opacity-75">
                            ({formatExpireTime(sub.info.expire).relative})
                          </span>
                        </span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="col-span-1 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                    <span className="opacity-75">{t('subscription.noTrafficInfo')}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                  <span className="opacity-75">{t('subscription.lastUpdate')}</span>
                  <span className="font-medium">{formatTime(sub.dataUpdateTime)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                  <span className="opacity-75">{t('subscription.modified')}</span>
                  <span className="font-medium">{formatTime(sub.updatedAt)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-pink-500"></div>
                  <span className="opacity-75">{t('subscription.created')}</span>
                  <span className="font-medium">{formatTime(sub.createdAt)}</span>
                </div>
              </div>
            )}

            {hasValidInfo && (
              <div className="mt-6">
                <div className="h-2 bg-black/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-300"
                    style={{
                      width: `${Math.min(((sub.info.upload + sub.info.download) / sub.info.total) * 100, 100)}%`
                    }}
                  />
                </div>
              </div>
            )}
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
}