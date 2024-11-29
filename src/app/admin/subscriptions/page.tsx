'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PlusIcon } from '@heroicons/react/24/outline';
import { SubscriptionInfo, Node } from '@/types/clash';
import { api } from '@/utils/api';
import { useStore } from '@/stores';
import AddSubscriptionDialog from '@/components/admin/subscriptions/AddSubscriptionDialog';
import { toast } from 'sonner';
import SubscriptionCard from '@/components/admin/subscriptions/SubscriptionCard';

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
  const { checkAuth, logout } = useStore();
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

  useEffect(() => {
    checkAuth().then(isAuth => {
      if (!isAuth) {
        router.push('/');
      } else {
        // fetchSubscriptions();
      }
    });
  }, []);

  const handleAdd = async (subscription: { name: string; url: string }) => {
    try {
      const response = await api.post<{success: boolean; data: Subscription}>('/admin/subscriptions', subscription);
      if (response.data.success) {
        setSubs(prev => [...prev, response.data.data]);
        setShowAddDialog(false);
        toast.success('添加订阅成功');
      }
    } catch (error) {
      toast.error('添加订阅失败');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">订阅管理</h1>
        <button
          onClick={() => setShowAddDialog(true)}
          className="px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-lg transition-colors flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          添加订阅
        </button>
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
        onAdd={handleAdd}
      />
    </div>
  );
} 