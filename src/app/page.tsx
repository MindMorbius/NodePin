'use client';

import { useEffect, useState } from 'react';
import { SubscriptionInfo, Node } from '@/types/clash';
import NodeDialog from '@/components/NodeDialog';

interface SubscriptionData {
  url: string;
  info: SubscriptionInfo;
  nodes: Node[];
}

export default function Home() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionData[]>([]);
  const [selectedSub, setSelectedSub] = useState<string | null>(null);
  const [selectedNodes, setSelectedNodes] = useState<Node[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetch('/api/nodes')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setSubscriptions(data);
        } else {
          console.error('Expected array but got:', data);
          setSubscriptions([]);
        }
      })
      .catch(error => {
        console.error(error);
        setSubscriptions([]);
      });
  }, []);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const handleShowNodes = (sub: SubscriptionData) => {
    setSelectedNodes(sub.nodes);
    setIsDialogOpen(true);
  };

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
        订阅信息
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subscriptions.map(sub => (
          <div key={sub.url} className="bg-[var(--card)] p-6 rounded-xl ring-1 ring-black/5 hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                订阅 {subscriptions.indexOf(sub) + 1}
              </h2>
              <button 
                onClick={() => handleShowNodes(sub)}
                className="px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-lg transition-colors font-medium"
              >
                {sub.info?.nodeCount ?? 0} 个节点
              </button>
            </div>

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
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <span className="opacity-75">到期</span>
                  <span className="font-medium">{new Date(sub.info.expire * 1000).toLocaleDateString()}</span>
                </div>
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
          </div>
        ))}
      </div>

      <NodeDialog 
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        nodes={selectedNodes}
      />
    </main>
  );
}