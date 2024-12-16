import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon, ArrowPathIcon, PencilIcon, XMarkIcon, CheckIcon, ListBulletIcon, CloudArrowUpIcon, EyeIcon, EyeSlashIcon, TrashIcon } from '@heroicons/react/24/outline';
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
import { decrypt } from '@/utils/crypto';
import TokenGenerator from './TokenGenerator';

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
    data_update_time?: string;
    fetch_status?: 'success' | 'failed';
    sync_status?: 'pending' | 'synced' | 'failed';
    created_at: string;
    updated_at: string;
    user_subscriptions_id?: string;
    encrypted_url?: string;
    status?: 'delete';
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
  const { checkSubscriptions, syncSubscription, decryptSubscriptionUrl } = useStore();
  const [showUrl, setShowUrl] = useState(false);
  const [decrypting, setDecrypting] = useState(false);

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

      // console.log('Response:', response);

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
      toast.info("请检查订阅地址是否已正确解密，如果未解密，请先点击加密地址来获取订阅地址");
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
        updated_at: new Date().toISOString(),
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
      setSyncing(true);
      const response = await syncSubscription({
        id: subscription.id,
        user_subscriptions_id: subscription.user_subscriptions_id,
        name: subscription.name,
        url: subscription.url,
        upload_traffic: subscription.upload_traffic,
        download_traffic: subscription.download_traffic,
        total_traffic: subscription.total_traffic,
        node_count: subscription.node_count,
        expire_time: subscription.expire_time,
        data_update_time: subscription.data_update_time,
        fetch_status: subscription.fetch_status,
        status: subscription.status,
        updated_at: subscription.updated_at
      });

      console.log('Sync response:', response);

      if (response.data.action === 'kept_db_version') {
        await db.updateSubscription(subscription.id, {
          ...response.data.data,
          user_subscriptions_id: response.data.data.id,
          sync_status: 'synced'
        });
        toast.success('已更新为数据库版本');
      } else if (response.data.action === 'updated_db') {
        await db.updateSubscription(subscription.id, {
          user_subscriptions_id: response.data.data.id,
          sync_status: 'synced',
          updated_at: new Date().toISOString()
        });
        toast.success('同步成功');
      } else {
        throw new Error('Unexpected action type');
      }

      onUpdate();
    } catch (error) {
      console.error('Sync error:', error);
      toast.error('同步失败');
      await db.updateSubscription(subscription.id, {
        sync_status: 'failed',
        updated_at: new Date().toISOString()
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleDecrypt = async () => {
    try {
      setDecrypting(true);
      if (!subscription.encrypted_url) {
        toast.error('没有加密地址');
        return;
      }

      const result = await decryptSubscriptionUrl(subscription.encrypted_url);

      await db.updateSubscription(subscription.id, {
        url: result.url,
        sync_status: 'synced'
      });

      toast.success('解密成功');
      onUpdate();
    } catch (error) {
      console.error('Decrypt error:', error);
      toast.error('解密失败');
    } finally {
      setDecrypting(false);
    }
  };

  const handleDelete = async () => {
    try {
      if (subscription.type === 'local') {
        await db.deleteSubscription(subscription.id);
        toast.success('订阅已删除');
      } else {
        await db.updateSubscription(subscription.id, {
          status: 'delete',
          sync_status: 'pending'
        });
        toast.success('订阅已标记为删除');
      }
      onUpdate();
    } catch (error) {
      toast.error('删除失败');
    }
  };

  const handleRestore = async () => {
    try {
      await db.updateSubscription(subscription.id, {
        status: 'active',
        sync_status: 'pending'
      });
      toast.success('订阅已恢复');
      onUpdate();
    } catch (error) {
      toast.error('恢复失败');
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
                {subscription.status === 'delete' && (
                  <span className="px-2 py-0.5 bg-red-50 text-red-600 text-xs rounded-full">
                    已删除
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-500 flex items-center gap-2">
                <span>创建于: {formatDistanceToNow(new Date(subscription.created_at), {locale: zhCN, addSuffix: true})}</span>
                <span>·</span>
                <span>上次更新: {formatDistanceToNow(new Date(subscription.updated_at), {locale: zhCN, addSuffix: true})}</span>
              </div>
              <div className="text-sm text-gray-500 flex items-center gap-1.5">
                {subscription.url ? (
                  <>
                    <span className="cursor-pointer flex items-center gap-1" onClick={() => setShowUrl(!showUrl)}>
                      {showUrl ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                      订阅地址({showUrl ? '点击复制' : '点击显示'}): 
                    </span>
                    {showUrl && (
                      <span 
                        className="font-mono text-blue-500 hover:text-blue-600 break-all cursor-pointer"
                        onClick={() => {
                          navigator.clipboard.writeText(subscription.url);
                          toast.success('已复制到剪贴板');
                        }}
                      >
                        {subscription.url}
                      </span>
                    )}
                  </>
                ) : subscription.encrypted_url ? (
                  <button
                    onClick={handleDecrypt}
                    disabled={decrypting}
                    className="text-blue-500 hover:text-blue-600 flex items-center gap-1"
                  >
                    <span>{decrypting ? '解密中...' : '加密地址'}</span>
                    {decrypting && (
                      <ArrowPathIcon className="w-4 h-4 animate-spin" />
                    )}
                  </button>
                ) : (
                  <span className="text-gray-400">无地址</span>
                )}
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
                <span>检查订阅</span>
                {subscription.data_update_time && (
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(subscription.data_update_time), {
                      locale: zhCN,
                      addSuffix: true
                    })}
                  </span>
                )}
              </button>
              {subscription.status === 'delete' ? (
                <button
                  onClick={handleRestore}
                  className="px-3 py-1.5 bg-[var(--card)] hover:bg-[var(--card-hover)] rounded-lg transition-colors flex items-center gap-1.5 text-green-500 hover:text-green-600"
                >
                  <ArrowPathIcon className="w-4 h-4" />
                  恢复
                </button>
              ) : (
                <button
                  onClick={handleDelete}
                  className="px-3 py-1.5 bg-[var(--card)] hover:bg-[var(--card-hover)] rounded-lg transition-colors flex items-center gap-1.5 text-red-500 hover:text-red-600"
                >
                  <TrashIcon className="w-4 h-4" />
                  删除
                </button>
              )}
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
                {formatBytes((subscription.upload_traffic || 0) + (subscription.download_traffic || 0))}
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
                收起界面
              </>
            ) : (
              <>
                <ChevronDownIcon className="w-4 h-4" />
                令牌管理
              </>
            )}
          </button>

          {expanded && (
            <div className="space-y-4 pt-2 border-t border-gray-100">
              <TokenGenerator subscriptionId={subscription.id} />
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