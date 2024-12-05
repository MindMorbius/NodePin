'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PlusIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { SubscriptionInfo, Node } from '@/types/clash';
import { api } from '@/utils/api';
import { useStore } from '@/stores';
import AddSubscriptionDialog from '@/components/admin/subscriptions/AddSubscriptionDialog';
import { toast } from 'sonner';
import SubscriptionCard from '@/components/admin/subscriptions/SubscriptionCard';
import { db } from '@/utils/db';

interface Subscription {
  name: string;
  url: string;
  isEnv?: boolean;
  info?: SubscriptionInfo;
  nodes?: Node[];
  loading?: boolean;
  created_at?: Date;
}

interface PaginatedResponse<T> {
  success: boolean;
  total: number;
  page: number;
  pageSize: number;
  data: T[];
}

export default function SubscriptionManagement() {
  const { } = useStore();
  const router = useRouter();
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [newSub, setNewSub] = useState({ name: '', url: '' });
  const [editingSub, setEditingSub] = useState<Subscription | null>(null);
  const [showEnvSubs, setShowEnvSubs] = useState(false);
  const [selectedNodes, setSelectedNodes] = useState<Node[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const subs = await db.getSubscriptions();
      setSubs(subs);
    } catch (error) {
      toast.error('获取订阅失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const handleAdd = async (subscription: { 
    name: string; 
    url: string; 
    info?: SubscriptionInfo;
    nodes?: Node[];
  }) => {
    try {
      if (!subscription.info || !subscription.nodes) {
        toast.error('请先检查订阅');
        return;
      }

      console.log(subscription);
  
      await db.addSubscription({
        name: subscription.name,
        url: subscription.url,
        status: 'active',
        // 使用检查结果中的数据
        upload_traffic: subscription.info.upload,
        download_traffic: subscription.info.download,
        total_traffic: subscription.info.total,
        node_count: subscription.nodes.length,
        expire_time: subscription.info.expire,
        data_update_time: new Date().toISOString(),
        fetch_status: 'success',
        sync_status: 'pending',
        // 保存完整的节点信息
        nodes: subscription.nodes.map(node => ({
          name: node.name,
          type: node.type
        })),
      });
      
      await fetchSubscriptions();
      setShowAddDialog(false);
      toast.success('添加订阅成功');
    } catch (error) {
      toast.error('添加订阅失败');
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      const pendingSubs = await db.getPendingSyncs();
      if (pendingSubs.length === 0) {
        toast.info('没有需要同步的数据');
        return;
      }

      // TODO: 实现远程同步逻辑
      // const response = await api.post('/admin/subscriptions/sync', { subscriptions: pendingSubs });
      toast.success(`${pendingSubs.length} 条数据等待同步`);
    } catch (error) {
      toast.error('同步失败');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">订阅管理</h1>
        <div className="flex gap-2">
          <button
            onClick={handleSync}
            disabled={syncing}
            className="px-4 py-2 bg-[var(--card)] hover:bg-[var(--card-hover)] rounded-lg transition-colors flex items-center gap-2"
          >
            <ArrowPathIcon className={`w-5 h-5 ${syncing ? 'animate-spin' : ''}`} />
            同步数据
          </button>
          <button
            onClick={() => setShowAddDialog(true)}
            className="px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            添加订阅
          </button>
        </div>
      </div>

      {/* 订阅列表 */}
      <div className="space-y-4">
        {subs.map((sub) => (
          <SubscriptionCard 
            key={sub.id}
            subscription={sub}
            onUpdate={fetchSubscriptions}
          />
        ))}

        {subs.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-500">
            暂无订阅数据
          </div>
        )}
      </div>

      <AddSubscriptionDialog
        isOpen={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onSubmit={handleAdd}
        title="添加订阅"
      />
    </div>
  );
} 