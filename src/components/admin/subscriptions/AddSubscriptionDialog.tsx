import { useState, useEffect } from 'react';
import { XMarkIcon, CheckIcon, ListBulletIcon } from '@heroicons/react/24/outline';
import { api } from '@/utils/api';
import { toast } from 'sonner';
import NodeDialog from './NodeDialog';
import { Node, SubscriptionInfo } from '@/types/clash';
import { useStore } from '@/stores';
import { Dialog } from '@headlessui/react';

interface AddSubscriptionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (subscription: {
    name: string;
    url: string;
    info?: SubscriptionInfo;
    nodes?: Node[];
  }) => void;
  initialData?: { name: string; url: string };
  title?: string;
}

export default function AddSubscriptionDialog({ 
  isOpen, 
  onClose, 
  onSubmit,
  initialData = { name: '', url: '' },
  title = '添加订阅'
}: AddSubscriptionDialogProps) {
  const [form, setForm] = useState(initialData);
  const [checking, setChecking] = useState(false);
  const [checked, setChecked] = useState(false);
  const [subInfo, setSubInfo] = useState<SubscriptionInfo | null>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [showNodes, setShowNodes] = useState(false);
  const { checkSubscriptions } = useStore();

  useEffect(() => {
    if (isOpen) {
      setForm(initialData);
      setChecked(false);
      setSubInfo(null);
      setNodes([]);
    }
  }, [isOpen, JSON.stringify(initialData)]);

  const handleCheck = async () => {
    if (!form.url) {
      toast.error('请输入订阅地址');
      return;
    }
  
    setChecking(true);
    try {
      const response = await checkSubscriptions(form.url);
      setSubInfo(response.info);
      setNodes(response.nodes);
      setChecked(true);
      toast.success('订阅检查成功');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setChecking(false);
    }
  };

  const handleSubmit = () => {
    if (!form.name || !form.url) {
      toast.error('请填写完整信息');
      return;
    }
    onSubmit({
      ...form,
      info: subInfo || undefined,
      nodes: nodes || undefined
    });
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatExpireDate = (timestamp: number) => {
    if (!timestamp) return '永久';
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-[var(--card)] rounded-xl p-6 w-full max-w-lg">
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="text-lg font-bold">{title}</Dialog.Title>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-[var(--card-hover)] rounded-full transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">订阅名称</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                className="w-full p-2 border rounded"
                placeholder="为订阅起个名字"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">订阅地址</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={form.url}
                  onChange={e => setForm(prev => ({ ...prev, url: e.target.value }))}
                  className="flex-1 p-2 border rounded"
                  placeholder="输入订阅地址"
                />
                <button
                  onClick={handleCheck}
                  disabled={checking}
                  className="px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  <CheckIcon className="w-4 h-4" />
                  检查
                </button>
              </div>
            </div>

            {/* 订阅信息 */}
            {checked && subInfo && (
              <div className="mt-6 space-y-4">
                <div className="bg-[var(--card-hover)] rounded-lg p-4 space-y-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">总流量</div>
                      <div className="font-medium">{formatBytes(subInfo.total)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">已用流量</div>
                      <div className="font-medium">{formatBytes(subInfo.upload + subInfo.download)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">过期时间</div>
                      <div className="font-medium">{formatExpireDate(subInfo.expire)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">节点数量</div>
                      <div className="font-medium">{nodes.length}</div>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowNodes(true)}
                    className="w-full mt-2 px-4 py-2 bg-[var(--card)] hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    <ListBulletIcon className="w-4 h-4" />
                    查看节点列表
                  </button>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-[var(--card)] hover:bg-[var(--card-hover)] rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                disabled={!checked}
                className="px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {title.includes('编辑') ? '保存' : '添加'}
              </button>
            </div>
          </div>
        </Dialog.Panel>
      </div>

      <NodeDialog
        isOpen={showNodes}
        onClose={() => setShowNodes(false)}
        nodes={nodes}
      />
    </Dialog>
  );
} 