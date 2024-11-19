'use client';

import { useEffect, useState } from 'react';
import { SubscriptionInfo } from '@/types/clash';
import LoginDialog from '@/components/LoginDialog';
import { api } from '@/utils/api';

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
          无法获取节点信息，请检查订阅是否有效或已过期
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-orange-500"></div>
            <span className="opacity-75">节点数</span>
            <span className="font-medium">{sub.nodeCount}</span>
          </div>
          {hasValidInfo ? (
            <>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <span className="opacity-75">总量</span>
                <span className="font-medium">{formatBytes(sub.info.total)}</span>
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
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="opacity-75">已用</span>
                <span className="font-medium">{formatBytes(sub.info.upload + sub.info.download)}</span>
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
            </>
          ) : (
            <div className="col-span-1 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gray-500"></div>
              <span className="opacity-75">无流量信息</span>
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
  const [subscriptions, setSubscriptions] = useState<SubscriptionData[]>([]);
  const [loading, setLoading] = useState<Record<number, boolean>>({});

  useEffect(() => {
    setLoading(prev => ({ ...prev, all: true }));

    api.get<SubscriptionData[]>('/public/subscriptions')
      .then(response => {
        if (Array.isArray(response.data)) {
          setSubscriptions(response.data);
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
