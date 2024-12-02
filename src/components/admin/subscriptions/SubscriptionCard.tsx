import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon, ArrowPathIcon, PencilIcon, XMarkIcon, CheckIcon, ListBulletIcon, CloudArrowUpIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { api } from '@/utils/api';
import { toast } from 'sonner';
import { db } from '@/utils/db';
import NodeDialog from './NodeDialog';
import { Node } from '@/types/clash';
import { useStore } from '@/stores';
import AddSubscriptionDialog from './AddSubscriptionDialog';
import { SubscriptionInfo } from '@/types/clash';
import { format, formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface SubscriptionCardProps {
  subscription: {
    id: string;
    name: string;
    url: string;
    upload_traffic?: number;
    download_traffic?: number;
    total_traffic?: number;
    node_count?: number;
    expire_time?: number;
    sync_status?: 'pending' | 'synced' | 'failed';
    created_at: string;
    updated_at: string;
  };
  onUpdate: () => void;
}

export default function SubscriptionCard({ subscription, onUpdate }: SubscriptionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [checking, setChecking] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [showNodes, setShowNodes] = useState(false);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [nodeError, setNodeError] = useState<string>();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { checkSubscriptions } = useStore();
  const [showUrl, setShowUrl] = useState(false);

  const formatBytes = (bytes?: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatExpireDate = (timestamp?: number) => {
    if (!timestamp) return '永久';
    const date = new Date(timestamp * 1000);
    return `${format(date, 'yyyy-MM-dd', { locale: zhCN })} (${formatDistanceToNow(date, { 
      locale: zhCN,
      addSuffix: true 
    })})`;
  };

  const handleCheck = async () => {
    try {
      setChecking(true);
      const response = await checkSubscriptions(subscription.url);

      await db.updateSubscription(subscription.id, {
        upload_traffic: response.info.upload,
        download_traffic: response.info.download,
        total_traffic: response.info.total,
        node_count: response.nodes.length,
        expire_time: response.info.expire,
        data_update_time: new Date().toISOString(),
        fetch_status: 'success',
        nodes: response.nodes.map(node => ({
          name: node.name,
          type: node.type
        }))
      });

      onUpdate();
      toast.success('订阅信息更新成功');
    } catch (error) {
      toast.error(error.message);
      await db.updateSubscription(subscription.id, {
        fetch_status: 'failed',
        data_update_time: new Date().toISOString()
      });
    } finally {
      setChecking(false);
    }
  };

  const handleSubmit = async (data: { 
    name: string; 
    url: string; 
    info?: SubscriptionInfo;
    nodes?: Node[];
  }) => {
    try {
      await db.updateSubscription(subscription.id, {
        name: data.name,
        url: data.url,
        upload_traffic: data.info?.upload || subscription.upload_traffic,
        download_traffic: data.info?.download || subscription.download_traffic,
        total_traffic: data.info?.total || subscription.total_traffic,
        node_count: data.nodes?.length || subscription.node_count,
        expire_time: data.info?.expire || subscription.expire_time,
        data_update_time: new Date().toISOString(),
        fetch_status: 'success',
        nodes: data.nodes?.map(node => ({
          name: node.name,
          type: node.type
        })) || subscription.nodes,
        sync_status: 'pending'
      });
      
      setShowAddDialog(false);
      onUpdate();
      toast.success('更新成功');
    } catch (error) {
      toast.error('更新失败');
    }
  };

  const handleShowNodes = async () => {
    try {
      setNodeError(undefined);
      const cached = await db.getSubscription(subscription.id);
      if (cached?.nodes && cached.nodes.length > 0) {
        setNodes(cached.nodes);
        setShowNodes(true);
      } else {
        toast.info('请先检查订阅以获取节点信息');
      }
    } catch (error) {
      setNodeError('获取节点列表失败');
      setShowNodes(true);
    }
  };

  const handleSync = async () => {
    try {
      // setSyncing(true);
      toast.success('同步未实现');
      // await db.updateSubscription(subscription.id, {
      //   sync_status: 'synced'
      // });
      onUpdate();
    } catch (error) {
      toast.error('同步失败');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <>
      <div className="bg-[var(--card)] rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 space-y-4">
          {/* 头部信息 */}
          <div className="flex justify-between items-start">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2 max-w-[1000px]">
                <h3 className="font-medium truncate">{subscription.name}</h3>
              </div>
              <div className="text-sm text-gray-500">
                创建于: {formatDistanceToNow(new Date(subscription.created_at), { 
                  locale: zhCN,
                  addSuffix: true 
                })} 更新于: {formatDistanceToNow(new Date(subscription.updated_at), { 
                  locale: zhCN,
                  addSuffix: true 
                })}
              </div>
              <div className="text-sm text-gray-500 flex items-center gap-1.5">
                <span className="cursor-pointer flex items-center gap-1" onClick={() => setShowUrl(!showUrl)}>
                  {showUrl ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                  订阅地址({showUrl ? '点击隐藏' : '点击显示'}): 
                </span>
                {showUrl && <span className="font-mono break-all">{subscription.url}</span>}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowAddDialog(true)}
                className="px-3 py-1.5 bg-[var(--card)] hover:bg-[var(--card-hover)] rounded-lg transition-colors flex items-center gap-1.5"
              >
                <PencilIcon className="w-4 h-4" />
                编辑
              </button>
              <button
                onClick={handleCheck}
                disabled={checking}
                className="px-3 py-1.5 bg-[var(--card)] hover:bg-[var(--card-hover)] rounded-lg transition-colors flex items-center gap-1.5"
              >
                <ArrowPathIcon className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
                检查订阅
              </button>
            </div>
          </div>

          {/* 订阅信息 */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 bg-[var(--card-hover)] rounded-lg p-4">
            <div>
              <div className="text-sm text-gray-500">总流量</div>
              <div className="font-medium">{formatBytes(subscription.total_traffic)}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">已用流量</div>
              <div className="font-medium">
                {formatBytes(subscription.upload_traffic + (subscription.download_traffic || 0))}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">过期时间</div>
              <div className="font-medium">{formatExpireDate(subscription.expire_time)}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">节点数量</div>
              <div
                className="font-medium cursor-pointer text-blue-500 hover:text-blue-600 flex items-center gap-1"
                onClick={handleShowNodes}
              >
                {subscription.node_count || 0}
                <span className="text-xs text-gray-500">(点击查看)</span>
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">同步状态</div>
              <div className="font-medium flex items-center gap-2">
                {subscription.sync_status === 'pending' ? (
                  <span className="text-yellow-600">待同步</span>
                ) : (
                  <span className="text-green-600">已同步</span>
                )}
                <button
                  onClick={handleSync}
                  disabled={syncing || subscription.sync_status === 'synced'}
                  className="text-sm px-2 py-0.5 bg-[var(--card)] hover:bg-[var(--card-hover)] rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50"
                >
                  <CloudArrowUpIcon className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                  {subscription.sync_status === 'synced' ? '已同步' : '同步'}
                </button>
              </div>
            </div>
          </div>

          {/* 展开/收起内容 */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-center gap-1 text-sm text-gray-500 hover:text-gray-700"
          >
            {expanded ? (
              <>
                <ChevronUpIcon className="w-4 h-4" />
                收起详情
              </>
            ) : (
              <>
                <ChevronDownIcon className="w-4 h-4" />
                查看详情
              </>
            )}
          </button>

          {expanded && (
            <div className="space-y-2 pt-2 border-t border-gray-100">
              待实现
            </div>
          )}
        </div>
      </div>

      <NodeDialog
        isOpen={showNodes}
        onClose={() => setShowNodes(false)}
        nodes={nodes}
        error={nodeError}
      />

      <AddSubscriptionDialog
        isOpen={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onSubmit={handleSubmit}
        initialData={{
          name: subscription.name,
          url: subscription.url
        }}
        title="编辑订阅"
      />
    </>
  );
} 