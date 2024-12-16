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
  const { fetchAllSubscriptions } = useStore();
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
  const [showDeleted, setShowDeleted] = useState(false);

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
      const response = await fetchAllSubscriptions();
      const remoteSubscriptions = response.data.data;

      if (!Array.isArray(remoteSubscriptions)) {
        throw new Error('Invalid response format');
      }

      // 2. 获取本地数据
      const localSubscriptions = await db.getSubscriptions();
      const needsManualSync: string[] = []; // 存储需要手动同步的订阅名称

      // 3. 处理每个远程订阅
      for (const remoteSub of remoteSubscriptions) {
        const localSub = localSubscriptions.find(
          local => local.user_subscriptions_id === remoteSub.id
        );

        if (localSub) {
          const remoteDate = new Date(remoteSub.updated_at);
          const localDate = new Date(localSub.updated_at);

          if (remoteDate > localDate) {
            // 远程数据更新，更新本地数据
            await db.updateSubscription(localSub.id, {
              name: remoteSub.name,
              encrypted_url: remoteSub.encrypted_url,
              user_subscriptions_id: remoteSub.id,
              upload_traffic: remoteSub.upload_traffic,
              download_traffic: remoteSub.download_traffic,
              total_traffic: remoteSub.total_traffic,
              node_count: remoteSub.node_count,
              expire_time: remoteSub.expire_time,
              data_update_time: remoteSub.data_update_time,
              fetch_status: remoteSub.fetch_status,
              status: remoteSub.status,
              sync_status: 'synced',
              updated_at: remoteSub.updated_at
            });
          } else if (localDate > remoteDate) {
            // 本地数据更新，标记为待同步
            needsManualSync.push(localSub.name);
            await db.updateSubscription(localSub.id, {
              sync_status: 'pending'  // 将状态改为待同步
            });
          }
        } else {
          // 不存在对应的本地数据，创建新数据
          await db.addSubscription({
            name: remoteSub.name,
            encrypted_url: remoteSub.encrypted_url,
            url: '',
            user_subscriptions_id: remoteSub.id,
            upload_traffic: remoteSub.upload_traffic,
            download_traffic: remoteSub.download_traffic,
            total_traffic: remoteSub.total_traffic,
            node_count: remoteSub.node_count,
            expire_time: remoteSub.expire_time,
            data_update_time: remoteSub.data_update_time,
            fetch_status: remoteSub.fetch_status,
            status: remoteSub.status,
            sync_status: 'synced',
            nodes: remoteSub.nodes || []
          });
        }
      }

      // 4. 检查本地是否有未同步的数据
      const unsyncedSubs = localSubscriptions.filter(
        local => !local.user_subscriptions_id
      );
      if (unsyncedSubs.length > 0) {
        toast.info(`发现 ${unsyncedSubs.length} 个未同步的本地订阅，请手动同步`);
      }

      // 显示需要手动同步的订阅
      if (needsManualSync.length > 0) {
        toast.info(
          `以下订阅本地版本更新，需要手动同步：${needsManualSync.join(', ')}`
        );
      }

      await fetchSubscriptions(); // 刷新列表
      toast.success('同步完成');
    } catch (error) {
      console.error('Sync error:', error);
      toast.error('同步失败');
    } finally {
      setSyncing(false);
    }
  };

  // 在渲染列表时过滤数据
  const filteredSubs = subs.filter(sub => 
    showDeleted ? true : sub.status !== 'delete'
  );

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
        <div className="flex gap-4 items-center">
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
        {filteredSubs.map((sub) => (
          <SubscriptionCard 
            key={sub.id}
            subscription={sub}
            onUpdate={fetchSubscriptions}
          />
        ))}

        {filteredSubs.length === 0 && !loading && (
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