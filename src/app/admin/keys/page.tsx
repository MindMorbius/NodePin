'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/stores';
import { api } from '@/utils/api';
import { toast } from 'sonner';

interface Key {
  id: string;
  name: string;
  value: string;
  created_at: string;
  expires_at: string | null;
}

export default function KeysManagement() {
  const router = useRouter();
  const {  } = useStore();
  const [keys, setKeys] = useState<Key[]>([]);
  const [newKey, setNewKey] = useState({ name: '', value: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    setLoading(true);
    try {
      const response = await api.get<{ success: boolean; data: Key[] }>('/admin/keys');
      if (response.data.success) {
        setKeys(response.data.data);
      }
    } catch (error) {
      toast.error('获取密钥失败');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!newKey.name) {
      toast.error('请输入密钥名称');
      return;
    }

    try {
      const response = await api.post<{ success: boolean; data: Key }>('/admin/keys', newKey);
      if (response.data.success) {
        setKeys(prev => [...prev, response.data.data]);
        setNewKey({ name: '', value: '' });
        toast.success('生成密钥成功');
      }
    } catch (error) {
      toast.error('生成密钥失败');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个密钥吗？')) return;

    try {
      const response = await api.delete<{ success: boolean }>(`/admin/keys/${id}`);
      if (response.data.success) {
        setKeys(prev => prev.filter(key => key.id !== id));
        toast.success('删除密钥成功');
      }
    } catch (error) {
      toast.error('删除密钥失败');
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('zh-CN');
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">密钥管理</h1>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newKey.name}
            onChange={(e) => setNewKey(prev => ({ ...prev, name: e.target.value }))}
            placeholder="密钥名称"
            className="flex-1 p-2 border rounded"
          />
          <button
            onClick={handleGenerate}
            className="px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-lg transition-colors"
          >
            生成密钥
          </button>
        </div>

        <div className="space-y-2">
          {keys.map((key) => (
            <div key={key.id} className="flex justify-between items-center p-4 bg-[var(--card)] hover:bg-[var(--card-hover)] rounded-lg transition-colors">
              <div className="flex-1 min-w-0">
                <div className="font-medium">{key.name}</div>
                <div className="text-sm text-gray-500 break-all">{key.value}</div>
                <div className="text-xs text-gray-400 mt-1">
                  创建时间: {formatDate(key.created_at)}
                  {key.expires_at && ` | 过期时间: ${formatDate(key.expires_at)}`}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(key.value);
                    toast.success('已复制到剪贴板');
                  }}
                  className="px-3 py-1 text-blue-500 hover:bg-blue-50 rounded"
                >
                  复制
                </button>
                <button
                  onClick={() => handleDelete(key.id)}
                  className="px-3 py-1 text-red-500 hover:bg-red-50 rounded"
                >
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
