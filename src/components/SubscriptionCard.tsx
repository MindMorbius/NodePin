import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon, KeyIcon, TrashIcon } from '@heroicons/react/24/outline';
import { api } from '@/utils/api';
import { toast } from 'sonner';

interface Token {
  id: string;
  name: string;
  code: string;
  expires_at: string | null;
  max_uses: number | null;
  min_trust_level: number;
  usage_period_days: number | null;
  created_at: string;
  used_count: number;
}

interface SubscriptionCardProps {
  subscription: {
    id: string;
    name: string;
    encrypted_url: string;
    created_at: string;
    tokens: Token[];
    users: {
      id: string;
      name: string;
      trust_level: number;
      imported_at: string;
    }[];
  };
  onUpdate: () => void;
}

export default function SubscriptionCard({ subscription, onUpdate }: SubscriptionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showTokenDialog, setShowTokenDialog] = useState(false);
  const [newToken, setNewToken] = useState({
    name: '',
    expires_at: '', // YYYY-MM-DD
    max_uses: '',
    min_trust_level: '1',
    usage_period_days: ''
  });

  const handleCreateToken = async () => {
    if (!newToken.name || !newToken.min_trust_level) {
      toast.error('请填写必填项');
      return;
    }

    try {
      const response = await api.post<{success: boolean; data: Token}>(
        `/admin/subscriptions/${subscription.id}/tokens`,
        {
          ...newToken,
          max_uses: newToken.max_uses ? parseInt(newToken.max_uses) : null,
          usage_period_days: newToken.usage_period_days ? parseInt(newToken.usage_period_days) : null
        }
      );

      if (response.data.success) {
        toast.success('创建令牌成功');
        setShowTokenDialog(false);
        setNewToken({
          name: '',
          expires_at: '',
          max_uses: '',
          min_trust_level: '1',
          usage_period_days: ''
        });
        onUpdate();
      }
    } catch (error) {
      toast.error('创建令牌失败');
    }
  };

  const handleRevokeToken = async (tokenId: string) => {
    try {
      const response = await api.delete(`/admin/subscriptions/${subscription.id}/tokens/${tokenId}`);
      if (response.data.success) {
        toast.success('撤销令牌成功');
        onUpdate();
      }
    } catch (error) {
      toast.error('撤销令牌失败');
    }
  };

  return (
    <div className="bg-[var(--card)] rounded-lg shadow-sm overflow-hidden">
      <div 
        className="p-4 flex justify-between items-center cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="space-y-1">
          <h3 className="font-medium">{subscription.name}</h3>
          <div className="text-sm text-gray-500">
            创建于: {new Date(subscription.created_at).toLocaleString('zh-CN')}
          </div>
        </div>
        {expanded ? (
          <ChevronUpIcon className="w-5 h-5" />
        ) : (
          <ChevronDownIcon className="w-5 h-5" />
        )}
      </div>

      {expanded && (
        <div className="border-t border-gray-100 p-4 space-y-4">
          {/* 订阅信息 */}
          <div className="space-y-2">
            <div className="text-sm font-medium">加密后的订阅地址</div>
            <div className="text-sm bg-gray-50 p-2 rounded font-mono break-all">
              {subscription.encrypted_url}
            </div>
          </div>

          {/* 令牌管理 */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="text-sm font-medium">令牌管理</div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTokenDialog(true);
                }}
                className="px-3 py-1.5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-lg text-sm flex items-center gap-1.5"
              >
                <KeyIcon className="w-4 h-4" />
                生成令牌
              </button>
            </div>

            <div className="grid gap-2">
              {subscription.tokens.map(token => (
                <div 
                  key={token.id}
                  className="bg-gray-50 p-3 rounded-lg space-y-2"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{token.name}</div>
                      <div className="text-sm font-mono mt-1">{token.code}</div>
                    </div>
                    <button
                      onClick={() => handleRevokeToken(token.id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-500">
                    <div>使用次数: {token.used_count}/{token.max_uses || '∞'}</div>
                    <div>最低信任等级: {token.min_trust_level}</div>
                    {token.expires_at && (
                      <div>过期时间: {new Date(token.expires_at).toLocaleDateString()}</div>
                    )}
                    {token.usage_period_days && (
                      <div>使用期限: {token.usage_period_days}天</div>
                    )}
                  </div>
                </div>
              ))}

              {subscription.tokens.length === 0 && (
                <div className="text-sm text-gray-500 text-center py-2">
                  暂无令牌
                </div>
              )}
            </div>
          </div>

          {/* 使用者列表 */}
          <div className="space-y-2">
            <div className="text-sm font-medium">使用者列表</div>
            {subscription.users.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {subscription.users.map(user => (
                  <div key={user.id} className="text-sm bg-gray-50 p-2 rounded flex justify-between items-center">
                    <span>{user.name}</span>
                    <span className="text-xs text-gray-500">
                      导入于 {new Date(user.imported_at).toLocaleString('zh-CN')}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500">暂无使用者</div>
            )}
          </div>
        </div>
      )}

      {/* 生成令牌对话框 */}
      {showTokenDialog && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50" onClick={() => setShowTokenDialog(false)}>
          <div className="bg-[var(--card)] rounded-xl p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">生成访问令牌</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">令牌名称 *</label>
                <input
                  type="text"
                  value={newToken.name}
                  onChange={e => setNewToken(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-2 border rounded"
                  placeholder="为令牌起个名字"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">过期时间</label>
                <input
                  type="date"
                  value={newToken.expires_at}
                  onChange={e => setNewToken(prev => ({ ...prev, expires_at: e.target.value }))}
                  className="w-full p-2 border rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">最大使用次数</label>
                <input
                  type="number"
                  value={newToken.max_uses}
                  onChange={e => setNewToken(prev => ({ ...prev, max_uses: e.target.value }))}
                  className="w-full p-2 border rounded"
                  placeholder="留空表示不限制"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">最低信任等级 *</label>
                <select
                  value={newToken.min_trust_level}
                  onChange={e => setNewToken(prev => ({ ...prev, min_trust_level: e.target.value }))}
                  className="w-full p-2 border rounded"
                >
                  <option value="1">Level 1</option>
                  <option value="2">Level 2</option>
                  <option value="3">Level 3</option>
                  <option value="4">Level 4</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">使用期限(天)</label>
                <input
                  type="number"
                  value={newToken.usage_period_days}
                  onChange={e => setNewToken(prev => ({ ...prev, usage_period_days: e.target.value }))}
                  className="w-full p-2 border rounded"
                  placeholder="留空表示永久有效"
                  min="1"
                />
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => setShowTokenDialog(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleCreateToken}
                  className="px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-lg transition-colors"
                >
                  生成
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 