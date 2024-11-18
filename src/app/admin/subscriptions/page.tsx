'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import NodeDialog from '@/components/NodeDialog';
import { SubscriptionInfo, Node } from '@/types/clash';

interface Subscription {
  name: string;
  url: string;
  isEnv?: boolean;  // 标记是否来自环境变量
  info?: SubscriptionInfo;
  nodes?: Node[];
  loading?: boolean;
}

export default function SubscriptionManagement() {
  const { checkAuth, logout } = useAuth();
  const router = useRouter();
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [newSub, setNewSub] = useState({ name: '', url: '' });
  const [editingSub, setEditingSub] = useState<Subscription | null>(null);
  const [showEnvSubs, setShowEnvSubs] = useState(false);
  const [selectedNodes, setSelectedNodes] = useState<Node[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    // 进入页面时重新检查登录状态
    checkAuth().then(isAuth => {
      if (!isAuth) {
        router.push('/');
      }
    });
  }, []);

  useEffect(() => {
    fetch('/api/urls')
      .then(res => res.json())
      .then(data => {
        // 区分环境变量和数据库的订阅
        const processed = data.map((sub: Subscription) => ({
          ...sub,
          isEnv: sub.name.startsWith('订阅 ') && /^\d+$/.test(sub.name.split(' ')[1])
        }));
        setSubs(processed);
      })
      .catch(() => router.push('/'));
  }, []);

  // 分离环境变量和数据库的订阅
  const envSubs = subs.filter(sub => sub.isEnv);
  const dbSubs = subs.filter(sub => !sub.isEnv);

  function isValidUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }

  const handleAdd = async () => {
    if (!newSub.name) {
      alert("名称不能为空");
      return;
    }
    
    if (!isValidUrl(newSub.url)) {
      alert("请输入有效的网址");
      return;
    }
    
    const res = await fetch('/api/admin/urls', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSub)
    });

    if (res.ok) {
      setSubs(prev => [...prev, newSub]);
      setNewSub({ name: '', url: '' });
    }
  };

  const handleUpdate = async (oldUrl: string) => {
    if (!editingSub) return;
    
    const res = await fetch('/api/admin/urls', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        oldUrl,
        ...editingSub
      })
    });

    if (res.ok) {
      setSubs(prev => prev.map(sub => 
        sub.url === oldUrl ? editingSub : sub
      ));
      setEditingSub(null);
    }
  };

  const handleDelete = async (url: string) => {
    const res = await fetch('/api/admin/urls', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });

    if (res.ok) {
      setSubs(prev => prev.filter(sub => sub.url !== url));
    }
  };

  const handleFetchInfo = async (sub: Subscription) => {
    // 首先更新loading状态
    setSubs(currentSubs => {
      const newSubs = [...currentSubs];
      const index = newSubs.findIndex(s => s.url === sub.url);
      if (index !== -1) {
        newSubs[index] = { ...newSubs[index], loading: true };
      }
      return newSubs;
    });

    try {
      const res = await fetch('/api/nodes/single', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: sub.url })
      });
      const data = await res.json();
      
      // 使用函数式更新来确保基于最新状态
      setSubs(currentSubs => {
        const newSubs = [...currentSubs];
        const index = newSubs.findIndex(s => s.url === sub.url);
        
        if (index === -1) return currentSubs;

        if (data.error || !data.nodes?.length) {
          // 处理错误情况
          newSubs[index] = { ...newSubs[index], loading: false };
          alert(data.error || '未获取到节点数据');
          return newSubs;
        }

        // 更新成功情况
        newSubs[index] = {
          ...newSubs[index],
          loading: false,
          info: data.info,
          nodes: data.nodes
        };
        return newSubs;
      });
    } catch (error) {
      // 处理请求失败情况
      setSubs(currentSubs => {
        const newSubs = [...currentSubs];
        const index = newSubs.findIndex(s => s.url === sub.url);
        if (index !== -1) {
          newSubs[index] = { ...newSubs[index], loading: false };
        }
        return newSubs;
      });
      alert('获取信息失败');
    }
  };

  const handleShowNodes = (sub: Subscription) => {
    if (sub.nodes?.length) {
      setSelectedNodes(sub.nodes);
      setIsDialogOpen(true);
    }
  };

  // 添加 formatBytes 辅助函数
  function formatBytes(bytes: number) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">订阅管理</h1>
        <div className="flex gap-2">
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-[var(--card)] hover:bg-[var(--card-hover)] rounded-lg transition-colors"
          >
            返回
          </button>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors"
          >
            登出
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newSub.name}
            onChange={(e) => setNewSub(prev => ({ ...prev, name: e.target.value }))}
            placeholder="订阅名称"
            className="flex-1 p-2 border rounded"
          />
          <input
            type="text"
            value={newSub.url}
            onChange={(e) => setNewSub(prev => ({ ...prev, url: e.target.value }))}
            placeholder="订阅链接"
            className="flex-1 p-2 border rounded"
          />
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-lg transition-colors"
          >
            添加
          </button>
        </div>

        <div className="space-y-2">
          {dbSubs.map((sub) => (
            <div key={sub.url} className="flex justify-between items-center p-4 bg-[var(--card)] hover:bg-[var(--card-hover)] rounded-lg transition-colors">
              {editingSub?.url === sub.url ? (
                <>
                  <div className="flex gap-2 flex-1 mr-2">
                    <input
                      type="text"
                      value={editingSub.name}
                      onChange={(e) => setEditingSub(prev => ({ ...prev!, name: e.target.value }))}
                      className="flex-1 p-2 border rounded"
                    />
                    <input
                      type="text"
                      value={editingSub.url}
                      onChange={(e) => setEditingSub(prev => ({ ...prev!, url: e.target.value }))}
                      className="flex-1 p-2 border rounded"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdate(sub.url)}
                      className="px-3 py-1 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-lg transition-colors"
                    >
                      保存
                    </button>
                    <button
                      onClick={() => setEditingSub(null)}
                      className="px-3 py-1 bg-[var(--card)] hover:bg-[var(--card-hover)] rounded-lg transition-colors"
                    >
                      取消
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <div className="font-medium">{sub.name}</div>
                    <div className="text-sm text-gray-500">{sub.url}</div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingSub(sub)}
                      className="px-3 py-1 text-blue-500 hover:bg-blue-50 rounded"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleDelete(sub.url)}
                      className="px-3 py-1 text-red-500 hover:bg-red-50 rounded"
                    >
                      删除
                    </button>
                    <button
                      onClick={() => handleFetchInfo(sub)}
                      className={`px-3 py-1 rounded ${
                        sub.loading 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-blue-500 text-white hover:bg-blue-600'
                      }`}
                      disabled={sub.loading}
                    >
                      {sub.loading ? '获取中...' : '获取信息'}
                    </button>
                    <button
                      onClick={() => handleShowNodes(sub)}
                      className={`px-3 py-1 rounded ${
                        sub.nodes?.length
                          ? 'bg-green-500 text-white hover:bg-green-600'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                      disabled={!sub.nodes?.length}
                    >
                      查看节点
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {envSubs.length > 0 && (
          <div className="mt-8">
            <button
              onClick={() => setShowEnvSubs(!showEnvSubs)}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
            >
              {showEnvSubs ? (
                <ChevronUpIcon className="w-4 h-4" />
              ) : (
                <ChevronDownIcon className="w-4 h-4" />
              )}
              环境变量订阅 ({envSubs.length})
            </button>
            
            {showEnvSubs && (
              <div className="space-y-2 mt-2">
                {envSubs.map((sub) => (
                  <div key={sub.url} className="flex justify-between items-center p-4 bg-gray-50/50 rounded">
                    <div>
                      <div className="font-medium">{sub.name}</div>
                      <div className="text-sm text-gray-500">{sub.url}</div>
                      {sub.info && (
                        <div className="text-xs text-gray-400 mt-1">
                          节点数: {sub.nodes?.length || 0} | 
                          已用: {formatBytes(sub.info.upload + sub.info.download)} / {formatBytes(sub.info.total)}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 items-center">
                      <button
                        onClick={() => handleFetchInfo(sub)}
                        className={`px-3 py-1 rounded ${
                          sub.loading 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
                        disabled={sub.loading}
                      >
                        {sub.loading ? '获取中...' : '获取信息'}
                      </button>
                      <button
                        onClick={() => handleShowNodes(sub)}
                        className={`px-3 py-1 rounded ${
                          sub.nodes?.length
                            ? 'bg-green-500 text-white hover:bg-green-600'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                        disabled={!sub.nodes?.length}
                      >
                        查看节点
                      </button>
                      <div className="text-xs text-gray-400">
                        通过环境变量设置
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <NodeDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        nodes={selectedNodes}
      />
    </div>
  );
} 