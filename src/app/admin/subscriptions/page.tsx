'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

interface Subscription {
  name: string;
  url: string;
  isEnv?: boolean;  // 标记是否来自环境变量
}

export default function SubscriptionManagement() {
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [newSub, setNewSub] = useState({ name: '', url: '' });
  const [editingSub, setEditingSub] = useState<Subscription | null>(null);
  const [showEnvSubs, setShowEnvSubs] = useState(false);
  const router = useRouter();

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

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">订阅管理</h1>
        <button
          onClick={() => router.push('/')}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
        >
          返回
        </button>
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
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            添加
          </button>
        </div>

        <div className="space-y-2">
          {dbSubs.map((sub) => (
            <div key={sub.url} className="flex justify-between items-center p-4 bg-gray-50 rounded">
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
                      className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      保存
                    </button>
                    <button
                      onClick={() => setEditingSub(null)}
                      className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
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
                    </div>
                    <div className="text-xs text-gray-400">
                      通过环境变量设置
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 