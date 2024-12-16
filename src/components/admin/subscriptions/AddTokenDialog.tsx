import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { QuestionMarkCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface AddTokenDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    token?: string;
    expire_time?: number;
    user_limit?: number;
    trust_level_limit: number;
    duration_limit?: number;
  }) => Promise<void>;
  initialData?: {
    token?: string;
    expire_time?: number;
    user_limit?: number;
    trust_level_limit: number;
    duration_limit?: number;
  };
}

export default function AddTokenDialog({ isOpen, onClose, onSubmit, initialData }: AddTokenDialogProps) {
  const [formData, setFormData] = useState({
    expireTime: '',
    userLimit: '',
    trustLevelLimit: '1',
    durationLimit: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        expireTime: initialData.expire_time ? format(new Date(initialData.expire_time), "yyyy-MM-dd'T'HH:mm") : '',
        userLimit: initialData.user_limit?.toString() || '',
        trustLevelLimit: initialData.trust_level_limit?.toString() || '1',
        durationLimit: initialData.duration_limit?.toString() || ''
      });
    } else {
      handleReset();
    }
  }, [initialData]);

  const handleSubmit = async () => {
    try {
      await onSubmit({
        token: initialData?.token,
        expire_time: formData.expireTime ? new Date(formData.expireTime).getTime() : undefined,
        user_limit: formData.userLimit ? parseInt(formData.userLimit) : undefined,
        trust_level_limit: parseInt(formData.trustLevelLimit || '1'),
        duration_limit: formData.durationLimit ? parseInt(formData.durationLimit) : undefined
      });
      
      handleReset();
      onClose();
    } catch (error) {
      toast.error(initialData ? '更新令牌失败' : '生成令牌失败');
    }
  };

  const handleReset = () => {
    setFormData({
      expireTime: '',
      userLimit: '',
      trustLevelLimit: '1',
      durationLimit: ''
    });
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-lg bg-[var(--card)] p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-center mb-4">
                  <Dialog.Title as="h3" className="text-lg font-medium">
                    {initialData ? '编辑订阅令牌' : '生成订阅令牌'}
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded-full transition-colors"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>

                <div className="bg-[var(--card-hover)] p-4 rounded-lg space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center gap-1">
                        <label className="block text-sm mb-1">过期时间</label>
                        <button
                          onClick={() => toast.info('设置令牌的过期时间，过期后令牌将无法使用。留空表示永不过期。')}
                          className="p-1 text-gray-400 hover:text-gray-600 rounded-full transition-colors"
                        >
                          <QuestionMarkCircleIcon className="w-4 h-4" />
                        </button>
                      </div>
                      <input
                        type="datetime-local"
                        value={formData.expireTime}
                        onChange={(e) => setFormData(prev => ({ ...prev, expireTime: e.target.value }))}
                        className="w-full px-3 py-1.5 rounded-lg bg-[var(--card)] border border-gray-200"
                        placeholder="永不过期"
                      />
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-1">
                        <label className="block text-sm mb-1">使用人数限制</label>
                        <button
                          onClick={() => toast.info('限制令牌可以被多少用户使用。达到限制后，其他用户将无法使用此令牌。留空表示不限制。')}
                          className="p-1 text-gray-400 hover:text-gray-600 rounded-full transition-colors"
                        >
                          <QuestionMarkCircleIcon className="w-4 h-4" />
                        </button>
                      </div>
                      <input
                        type="number"
                        value={formData.userLimit}
                        onChange={(e) => setFormData(prev => ({ ...prev, userLimit: e.target.value }))}
                        className="w-full px-3 py-1.5 rounded-lg bg-[var(--card)] border border-gray-200"
                        min="0"
                        placeholder="无限制"
                      />
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-1">
                        <label className="block text-sm mb-1">信任等级限制</label>
                        <button
                          onClick={() => toast.info('设置导入的信任等级限制。建议设置为 level 1 以上，以防止滥用。')}
                          className="p-1 text-gray-400 hover:text-gray-600 rounded-full transition-colors"
                        >
                          <QuestionMarkCircleIcon className="w-4 h-4" />
                        </button>
                      </div>
                      <select
                        value={formData.trustLevelLimit}
                        onChange={(e) => setFormData(prev => ({ ...prev, trustLevelLimit: e.target.value }))}
                        className="w-full px-3 py-1.5 rounded-lg bg-[var(--card)] border border-gray-200"
                      >
                        <option value="0">≥ level 0 (不建议)</option>
                        <option value="1">≥ level 1</option>
                        <option value="2">≥ level 2</option>
                        <option value="3">≥ level 3</option>
                      </select>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-1">
                        <label className="block text-sm mb-1">使用期限 (天)</label>
                        <button
                          onClick={() => toast.info('设置用户导入后可以使用的时间。留空表示永久有效。')}
                          className="p-1 text-gray-400 hover:text-gray-600 rounded-full transition-colors"
                        >
                          <QuestionMarkCircleIcon className="w-4 h-4" />
                        </button>
                      </div>
                      <input
                        type="number"
                        value={formData.durationLimit}
                        onChange={(e) => setFormData(prev => ({ ...prev, durationLimit: e.target.value }))}
                        className="w-full px-3 py-1.5 rounded-lg bg-[var(--card)] border border-gray-200"
                        min="0"
                        placeholder="永久有效"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-2">
                  <button
                    onClick={handleReset}
                    className="px-4 py-2 bg-[var(--card)] hover:bg-[var(--card-hover)] rounded-lg transition-colors"
                  >
                    重置
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="px-4 py-2 bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] rounded-lg transition-colors"
                  >
                    确定
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}