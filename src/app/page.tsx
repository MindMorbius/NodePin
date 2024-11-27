'use client';

import { useEffect } from 'react';
import { useStore } from '@/stores';
import { useTranslation } from 'react-i18next';
import StatusBar from '@/components/StatusBar';
import Link from 'next/link';
import { SubscriptionInfo } from '@/types/clash';
import UserCard from '@/components/UserCard';

interface SubscriptionData {
  id: number;
  name: string;
  info: SubscriptionInfo;
  error?: string | null;
  nodeCount: number;
  loading: boolean;
  status: 'loading' | 'show' | 'hide';
}

function SubscriptionCard({ sub, loading }: { 
  sub: SubscriptionData;
  loading: boolean;
}) {
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

  const formatName = (name: string) => {
    const linuxDoMatch = name.match(/https?:\/\/linux\.do\/t\/topic\/(\d+)/);
    if (linuxDoMatch) {
      const id = linuxDoMatch[1];
      return {
        display: `🌐 linux.do`,
        href: `https://linux.do/t/topic/${id}`
      };
    }
    return { display: name, href: null };
  };

  const { display, href } = formatName(sub.name);

  return (
    <div 
      className={`bg-[var(--card)] p-6 rounded-xl ring-1 
        ${hasError ? 'ring-red-500/30' : 'ring-black/5'}
        hover:shadow-xl transition-all duration-200 hover:-translate-y-1
        ${loading ? 'animate-pulse' : ''}`}
    >
      <div className="flex justify-between items-center mb-5">
        {href ? (
          <a 
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent
              line-clamp-2 hover:line-clamp-none hover:underline"
            title={sub.name}
          >
            {display}
          </a>
        ) : (
          <h2 
            className="text-xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent
              line-clamp-2 hover:line-clamp-none"
            title={sub.name}
          >
            {display}
          </h2>
        )}
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
                    {new Date(sub.info.expire * 1000).toLocaleDateString()}
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
    </div>
  );
}

export default function Home() {
  const { t } = useTranslation();
  const { 
    subscriptions, 
    loading, 
    error,
    initialized,
    fetchSubscriptions,
    checkAuth,
    users,
    usersLoading, 
    usersError, 
    fetchUsers
  } = useStore();

  // 初始加载
  useEffect(() => {
    if (!initialized) {
      fetchSubscriptions();
    }
  }, [initialized, fetchSubscriptions]);

  // 初始加载用户数据
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // 在初始化完成前不渲染内容
  if (!initialized) {
    return null;
  }



  return (
    <main className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
          {t('subscription.title')}
        </h1>
      </div>

      <StatusBar 
        subscriptions={subscriptions} 
        loading={loading}
        onRefresh={fetchSubscriptions}
      />

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-500 rounded-lg flex justify-between items-center">
          <span>{error}</span>
          <button
            onClick={() => fetchSubscriptions()}
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
          >
            {t('subscription.retry')}
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subscriptions
          .filter(sub => sub.status !== 'hide')
          .map((sub) => (
            <SubscriptionCard 
              key={sub.id}
              sub={sub}
              loading={sub.status === 'loading'}
            />
          ))}
      </div>
      
      <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent mt-12 mb-6">
        {t('user.users')}
      </h2>

      {usersError && (
        <div className="mb-6 text-red-500">
          {usersError}
        </div>
      )}
      
      {usersLoading ? (
        <div className="flex overflow-x-auto pb-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div 
              key={`skeleton-${i}`}
              className="w-[85px] flex-shrink-0 animate-pulse bg-gray-200 h-24 rounded-xl mr-4" 
            />
          ))}
        </div>
      ) : (
        <div className="flex overflow-x-auto pb-4">
          {users.map((user, index) => (
            <div key={`user-${user.id}-${index}`} className="w-[85px] flex-shrink-0">
              <UserCard user={user} />
            </div>
          ))}
        </div>
      )}

      <footer className="mt-8 text-center text-sm opacity-60">
        <Link href="/disclaimer" className="hover:underline">
          @ {t('common.disclaimer')}
        </Link>
      </footer>
    </main>
  );
}
