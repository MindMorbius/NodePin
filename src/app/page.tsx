'use client';

import { useEffect, useState } from 'react';
import { SubscriptionInfo, Node } from '@/types/clash';
import NodeDialog from '@/components/NodeDialog';
import LoginDialog from '@/components/LoginDialog';
import { useRouter, useSearchParams } from 'next/navigation';

interface SubscriptionData {
  url: string;
  name?: string;
  info: SubscriptionInfo;
  nodes: Node[];
  error?: string | null;
}

interface LoadingState {
  [url: string]: boolean;
}

function SubscriptionCard({ sub, loading, onShowNodes, index }: { 
  sub: SubscriptionData & { name?: string, error?: string | null }; 
  loading: boolean;
  onShowNodes: (sub: SubscriptionData & { error?: string | null }) => void;
  index: number;
}) {
  const hasError = !loading && (!sub.nodes.length || sub.error);
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
          {sub.name || `订阅 ${index + 1}`}
        </h2>
        <button 
          onClick={() => onShowNodes(sub)}
          className={`px-4 py-2 rounded-lg transition-colors font-medium
            ${hasError 
              ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' 
              : 'bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white'}`}
        >
          {hasError ? '查看错误' : `${sub.nodes.length} 个节点`}
        </button>
      </div>

      {hasError ? (
        <div className="text-sm text-red-500/80 mt-4">
          无法获取节点信息，请检查订阅地址是否有效
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
  const [subscriptions, setSubscriptions] = useState<SubscriptionData[]>([]);
  const [loading, setLoading] = useState<LoadingState>({});
  const [selectedSub, setSelectedSub] = useState<string | null>(null);
  const [selectedNodes, setSelectedNodes] = useState<Node[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // 设置所有订阅的初始加载状态
    setLoading(prev => ({ ...prev, all: true }));

    fetch('/api/urls')
      .then(res => res.json())
      .then(subscriptions => {
        const placeholders = subscriptions.map((sub: { name: string, url: string }) => ({
          url: sub.url,
          name: sub.name,
          info: {
            upload: 0,
            download: 0,
            total: 0,
            expire: 0,
            nodeCount: 0
          },
          nodes: []
        }));
        setSubscriptions(placeholders);
        
        fetch('/api/nodes')
          .then(res => res.json())
          .then(results => {
            if (Array.isArray(results)) {
              setSubscriptions(prev => 
                prev.map(sub => {
                  const matchingResult = results.find(r => r.url === sub.url);
                  return matchingResult ? { 
                    ...matchingResult,
                    name: sub.name || matchingResult.name 
                  } : sub;
                })
              );
            }
          })
          .catch(error => {
            console.error('Failed to fetch nodes:', error);
          })
          .finally(() => {
            // 更新所有订阅的加载状态
            setLoading({});
          });
      });
  }, []);

  useEffect(() => {
    if (searchParams.get('showLogin') === 'true') {
      setIsLoginOpen(true);
    }
  }, [searchParams]);

  const handleShowNodes = (sub: SubscriptionData & { error?: string | null }) => {
    if (sub.error || !sub.nodes.length) {
      setError(
        `订阅地址: ${sub.url}\n` +
        (sub.error 
          ? `错误信息: ${sub.error}` 
          : '获取失败，请检查订阅地址是否有效或已过期')
      );
    } else {
      setError(undefined);
    }
    setSelectedNodes(sub.nodes);
    setIsDialogOpen(true);
  };

  return (
    <main className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
          订阅信息
        </h1>
        <button
          onClick={() => setIsLoginOpen(true)}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          管理订阅
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subscriptions.map((sub, index) => (
          <SubscriptionCard 
            key={sub.url}
            sub={sub}
            loading={loading[sub.url]}
            onShowNodes={handleShowNodes}
            index={index}
          />
        ))}
      </div>

      <NodeDialog 
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setError(undefined);
        }}
        nodes={selectedNodes}
        error={error}
      />

      <LoginDialog 
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLogin={(success) => {
          if (success) {
            router.push('/admin/subscriptions');
          }
        }}
      />
    </main>
  );
}