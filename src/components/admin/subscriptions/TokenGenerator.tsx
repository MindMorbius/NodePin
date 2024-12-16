import { useState, useEffect } from 'react';
import { PlusIcon, TrashIcon, PencilIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';
import { db } from '@/utils/db';
import TokenCard from './TokenCard';
import AddTokenDialog from './AddTokenDialog';

interface TokenGeneratorProps {
  subscriptionId: string;
}

export default function TokenGenerator({ subscriptionId }: TokenGeneratorProps) {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingToken, setEditingToken] = useState(null);
  const [showDeleted, setShowDeleted] = useState(false);

  const fetchTokens = async () => {
    try {
      setLoading(true);
      const tokens = await db.getSubscriptionTokens(subscriptionId);
      setTokens(tokens);
    } catch (error) {
      toast.error('获取令牌失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTokens();
  }, [subscriptionId]);

  const handleGenerate = async (data) => {
    try {
      if (data.token) {
        await db.updateSubscriptionToken(subscriptionId, data.token, data);
        toast.success('令牌更新成功');
      } else {
        await db.createSubscriptionToken(subscriptionId, data);
        toast.success('令牌生成成功');
      }
      setShowAddDialog(false);
      setEditingToken(null);
      await fetchTokens();
    } catch (error) {
      throw error;
    }
  };

  const handleEdit = (token) => {
    setEditingToken(token);
    setShowAddDialog(true);
  };

  const handleDelete = async (tokenId: string) => {
    try {
      const token = tokens.find(t => t.token === tokenId);
      if (!token) return;

      if (token.type === 'local') {
        const updatedTokens = tokens.filter(t => t.token !== tokenId);
        await db.updateSubscription(subscriptionId, {
          tokens: updatedTokens,
          sync_status: 'pending'
        });
      } else {
        await db.updateSubscriptionToken(subscriptionId, tokenId, {
          status: 'delete'
        });
      }
      await fetchTokens();
      toast.success('令牌删除成功');
    } catch (error) {
      toast.error('令牌删除失败');
    }
  };

  const handleRestore = async (tokenId: string) => {
    try {
      await db.updateSubscriptionToken(subscriptionId, tokenId, {
        status: 'active'
      });
      await fetchTokens();
      toast.success('令牌恢复成功');
    } catch (error) {
      toast.error('令牌恢复失败');
    }
  };

  const filteredTokens = tokens.filter(token => 
    showDeleted ? true : token.status !== 'delete'
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h3 className="font-medium">订阅令牌</h3>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showDeleted}
              onChange={(e) => setShowDeleted(e.target.checked)}
              className="rounded text-[var(--primary)]"
            />
            显示已删除数据
          </label>
        </div>
        <button
          onClick={() => setShowAddDialog(true)}
          className="px-3 py-1.5 bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] rounded-lg transition-colors flex items-center gap-1.5"
        >
          <PlusIcon className="w-4 h-4" />
          生成令牌
        </button>
      </div>

      <AddTokenDialog
        isOpen={showAddDialog}
        onClose={() => {
          setShowAddDialog(false);
          setEditingToken(null);
        }}
        onSubmit={handleGenerate}
        initialData={editingToken}
      />

      <div className="space-y-2">
        {filteredTokens.map((token) => (
          <TokenCard
            key={token.token}
            token={token}
            onDelete={handleDelete}
            onRestore={handleRestore}
            onEdit={handleEdit}
          />
        ))}
      </div>
    </div>
  );
} 