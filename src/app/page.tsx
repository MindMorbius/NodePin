'use client';

import { useEffect, useState } from 'react';
import { SubscriptionInfo } from '@/types/clash';
import LoginDialog from '@/components/LoginDialog';
import { api } from '@/utils/api';
import { useSubscriptionStore } from '@/hooks/useSubscriptionStore';
import StatusBar from '@/components/StatusBar';
import { useTranslation } from 'react-i18next';
import LanguageSwitch from '@/components/LanguageSwitch';
import Link from 'next/link';

interface SubscriptionData {
  id: number;
  name: string;
  info: SubscriptionInfo;
  error?: string | null;
  nodeCount: number;
  loading: boolean;
  status: 'loading' | 'show' | 'hide';
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const store = useSubscriptionStore();
  const { subscriptions, initialized } = store;

  // 获取单条订阅数据
  const fetchSingleSubscription = async (sub: SubscriptionData) => {
    try {
      const response = await api.post<ApiResponse<{
        info: SubscriptionInfo;
        nodeCount: number;
      }>>('/public/subscriptions', { id: sub.id });

      if (response.data.success && response.data.data.nodeCount > 0) {
        store.updateSubscription(sub.id, {
          ...sub,
          info: response.data.data.info,
          nodeCount: response.data.data.nodeCount,
          status: 'show'
        });
      } else {
        store.updateSubscription(sub.id, {
          ...sub,
          status: 'hide'
        });
      }
    } catch (error) {
      store.updateSubscription(sub.id, {
        ...sub,
        status: 'hide'
      });
    }
  };

  // 获取数据
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get<ApiResponse<{
        total: number;
        items: SubscriptionData[];
      }>>('/public/subscriptions');
      
      if (response.data.success) {
        const items = response.data.data.items.map(item => ({
          ...item,
          status: 'loading' as const
        }));
        
        store.saveToStorage(items);
        
        // 处理所有订阅
        for (const sub of items) {
          await fetchSingleSubscription(sub);
        }
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : t('subscription.subscriptionError'));
    } finally {
      setLoading(false);
    }
  };

  // 初始加载
  useEffect(() => {
    if (initialized && store.subscriptions.length === 0) {
      fetchData();
    }
  }, [initialized]);

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
        <div className="flex flex-col items-end gap-2">
          <div className="flex gap-4">
            <button
              onClick={fetchData}
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {loading ? t('subscription.refreshing') : t('subscription.refresh')}
            </button>
            {/* <LanguageSwitch /> */}
            <LoginDialog />
          </div>
        </div>
      </div>

      <StatusBar 
        subscriptions={subscriptions} 
        loading={loading}
        onRefresh={fetchData}
      />

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-500 rounded-lg flex justify-between items-center">
          <span>{error}</span>
          <button
            onClick={fetchData}
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
      
      <footer className="mt-8 text-center text-sm opacity-60">
        <Link href="/disclaimer" className="hover:underline">
          @ {t('common.disclaimer')}
        </Link>
      </footer>
    </main>
  );
}
