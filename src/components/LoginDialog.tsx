'use client';

import { Dialog } from '@headlessui/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useStore } from '@/stores';

export default function LoginDialog() {
  const { t } = useTranslation();
  const router = useRouter();
  const { isAuthenticated, login } = useStore();
  
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
      setError(t('login.error'));
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
        className="px-4 py-2 bg-[var(--card)] hover:bg-[var(--card-hover)] rounded-lg transition-colors"
      >
        {t('login.manage')}
      </button>

      <Dialog 
        open={isOpen} 
        onClose={() => setIsOpen(false)} 
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-[var(--card)] rounded-xl p-6 w-full max-w-sm ring-1 ring-black/5">
            <Dialog.Title className="text-lg font-bold mb-4">{t('login.title')}</Dialog.Title>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder={t('login.username')}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-2 border rounded"
                autoComplete="username"
              />
              <input
                type="password"
                placeholder={t('login.password')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded"
                autoComplete="current-password"
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 bg-[var(--card)] hover:bg-[var(--card-hover)] rounded-lg transition-colors"
                >
                  {t('login.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-lg transition-colors"
                >
                  {t('login.submit')}
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
} 