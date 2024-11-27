'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/stores';
import { api } from '@/utils/api';
import { toast } from 'sonner';
import { ClipboardIcon, TrashIcon } from '@heroicons/react/24/outline';

interface Token {
  id: string;
  name: string;
  token: string;
  created_at: string;
  expires_at: string | null;
  last_used_at: string | null;
  status: 'active' | 'expired' | 'revoked';
}

export default function TokenManagement() {
  const router = useRouter();
  const { checkAuth } = useStore();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [newToken, setNewToken] = useState({ name: '', expiresIn: '30' }); // 默认30天
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkAuth().then(isAuth => {
      if (!isAuth) {
        router.push('/');
      } else {
        fetchTokens();
      }
    });
  }, []);

  const fetchTokens = async () => {
    setLoading(true);
    try {
      const response = await api.get<{ success: boolean; data: Token[] }>('/admin/tokens');
      if (response.data.success) {
        setTokens(response.data.data);
      }
    } catch (error) {
      toast.error('获取令牌失败');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!newToken.name) {
      toast.error('请输入令牌名称');
      return;
    }

    try {
      const response = await api.post<{ success: boolean; data: Token }>('/admin/tokens', newToken);
      if (response.data.success) {
        setTokens(prev => [...prev, response.data.data]);
        setNewToken({ name: '', expiresIn: '30' });
        toast.success('生成令牌成功');
      }
    } catch (error) {
      toast.error('生成令牌失败');
    }
  };

  const handleRevoke = async (id: string) => {
    if (!confirm('确定要撤销这个令牌吗？此操作不可恢复。')) return;

    try {
      const response = await api.delete<{ success: boolean }>(`/admin/tokens/${id}`);
      if (response.data.success) {
        setTokens(prev => prev.map(token => 
          token.id === id ? { ...token, status: 'revoked' as const } : token
        ));
        toast.success('撤销令牌成功');
      }
    } catch (error) {
      toast.error('撤销令牌失败');
    }
  };

  const getStatusBadge = (status: Token['status']) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      expired: 'bg-yellow-100 text-yellow-800',
      revoked: 'bg-red-100 text-red-800'
    };
    const labels = {
      active: '生效中',
      expired: '已过期',
      revoked: '已撤销'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const formatDate = (date: string | null) => {
    if (!date) return '从未使用';
    return new Date(date).toLocaleString('zh-CN');
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">令牌管理</h1>
      </div>

      <div className="space-y-6">
        {/* 生成新令牌 */}
        <div className="bg-[var(--card)] p-4 rounded-lg space-y-4">
          <h2 className="font-medium">生成新令牌</h2>
          <div className="flex gap-4">
            <input
              type="text"
              value={newToken.name}
              onChange={(e) => setNewToken(prev => ({ ...prev, name: e.target.value }))}
              placeholder="令牌名称"
              className="flex-1 p-2 border rounded"
            />
            <select
              value={newToken.expiresIn}
              onChange={(e) => setNewToken(prev => ({ ...prev, expiresIn: e.target.value }))}
              className="p-2 border rounded"
            >
              <option value="7">7天</option>
              <option value="30">30天</option>
              <option value="90">90天</option>
              <option value="365">365天</option>
            </select>
            <button
              onClick={handleGenerate}
              className="px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-lg transition-colors"
            >
              生成令牌
            </button>
          </div>
        </div>

        {/* 令牌列表 */}
        <div className="space-y-4">
          {tokens.map((token) => (
            <div 
              key={token.id} 
              className="bg-[var(--card)] hover:bg-[var(--card-hover)] p-4 rounded-lg transition-colors"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{token.name}</span>
                    {getStatusBadge(token.status)}
                  </div>
                  <div className="text-sm text-gray-500 break-all font-mono">
                    {token.token}
                  </div>
                  <div className="text-xs text-gray-400 space-y-1">
                    <div>创建时间: {formatDate(token.created_at)}</div>
                    <div>过期时间: {token.expires_at ? formatDate(token.expires_at) : '永不过期'}</div>
                    <div>最后使用: {formatDate(token.last_used_at)}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(token.token);
                      toast.success('已复制到剪贴板');
                    }}
                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                    title="复制令牌"
                  >
                    <ClipboardIcon className="w-5 h-5" />
                  </button>
                  {token.status === 'active' && (
                    <button
                      onClick={() => handleRevoke(token.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="撤销令牌"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {tokens.length === 0 && !loading && (
            <div className="text-center py-12 text-gray-500">
              暂无令牌数据
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
