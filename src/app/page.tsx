'use client';

import { useEffect, useState } from 'react';
import { SubscriptionInfo } from '@/types/clash';
import LoginDialog from '@/components/LoginDialog';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface SubscriptionData {
  id: number;
  name: string;
  info: SubscriptionInfo;
  error?: string | null;
  nodeCount: number;
}

function SubscriptionCard({ sub, loading }: { 
  sub: SubscriptionData;
  loading: boolean;
}) {
  const hasError = !loading && (!sub.nodeCount || sub.error);
  const hasValidInfo = sub.info.total > 0;

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  return (
    <div 
      className={`bg-[var(--card)] p-6 rounded-xl ring-1 
        ${hasError ? 'ring-red-500/30' : 'ring-black/5'}
        hover:shadow-xl transition-all duration-200 hover:-translate-y-1
        ${loading ? 'animate-pulse' : ''}`}
    >
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
          {sub.name}
        </h2>
        <div className="px-4 py-2 rounded-lg font-medium text-white bg-[var(--primary)]">
          {`${sub.nodeCount} 个节点`}
        </div>
      </div>

      {hasError ? (
        <div className="text-sm text-red-500/80 mt-4">
          无法获取节点信息，请检查订阅是否有效或已过期
        </div>
      ) : (
        <>
          {hasValidInfo ? (
            <>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="opacity-75">已用流量</span>
                    <span className="font-medium">{formatBytes(sub.info.upload + sub.info.download)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="opacity-75">上传</span>
                    <span className="font-medium">{formatBytes(sub.info.upload)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                    <span className="opacity-75">下载</span>
                    <span className="font-medium">{formatBytes(sub.info.download)}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    <span className="opacity-75">总量</span>
                    <span className="font-medium">{formatBytes(sub.info.total)}</span>
                  </div>
                  {sub.info.expire > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      <span className="opacity-75">到期</span>
                      <span className="font-medium">
                        {new Date(sub.info.expire * 1000).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

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
            </>
          ) : (
            <div className="text-sm opacity-75 mt-4">
              订阅未提供流量信息
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const { isLoginOpen, openLogin, closeLogin } = useAuth();
  const [subscriptions, setSubscriptions] = useState<SubscriptionData[]>([]);
  const [loading, setLoading] = useState<Record<number, boolean>>({});

  useEffect(() => {
    setLoading(prev => ({ ...prev, all: true }));

    fetch('/api/public/subscriptions')
      .then(res => res.json())
      .then(results => {
        if (Array.isArray(results)) {
          setSubscriptions(results);
        }
      })
      .catch(error => {
        console.error('Failed to fetch subscriptions:', error);
      })
      .finally(() => {
        setLoading({});
      });
  }, []);

  return (
    <main className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
          订阅信息
        </h1>
        <LoginDialog />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subscriptions.map((sub) => (
          <SubscriptionCard 
            key={sub.id}
            sub={sub}
            loading={loading[sub.id]}
          />
        ))}
      </div>
    </main>
  );
}
