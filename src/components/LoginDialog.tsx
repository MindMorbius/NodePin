import { Dialog } from '@headlessui/react';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function LoginDialog() {
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(username, password);
    
    if (success) {
      setIsOpen(false);
      router.push('/admin/subscriptions');
    } else {
      setError('用户名或密码错误');
    }
  };

  const handleManageClick = () => {
    if (isAuthenticated) {
      router.push('/admin/subscriptions');
    } else {
      setIsOpen(true);
    }
  };

  return (
    <>
      <button
        onClick={handleManageClick}
        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
      >
        管理订阅
      </button>

      <Dialog 
        open={isOpen} 
        onClose={() => setIsOpen(false)} 
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-xl p-6 w-full max-w-sm">
            <Dialog.Title className="text-lg font-bold mb-4">管理员登录</Dialog.Title>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="用户名"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-2 border rounded"
              />
              <input
                type="password"
                placeholder="密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded"
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  登录
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
} 