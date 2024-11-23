'use client';

import { Dialog } from '@headlessui/react';
import { signIn } from 'next-auth/react';
import { useTranslation } from 'react-i18next';
import { CommandLineIcon } from '@heroicons/react/24/solid';
import { useStore } from '@/stores';

interface LoginDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginDialog({ isOpen, onClose }: LoginDialogProps) {
  const { t } = useTranslation();
  const { login } = useStore();

  const handleLogin = async () => {
    await login();
    onClose();
  };

  return (
    <Dialog 
      open={isOpen} 
      onClose={onClose}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-[var(--card)] rounded-xl p-6 w-full max-w-sm ring-1 ring-black/5">
          <Dialog.Title className="text-lg font-bold mb-4">
            {t('login.title')}
          </Dialog.Title>
          
          <button
            onClick={handleLogin}
            className="w-full px-4 py-3 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <CommandLineIcon className="w-6 h-6" />
            {t('login.withLinuxDo')}
          </button>

          <div className="mt-4 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[var(--card)] hover:bg-[var(--card-hover)] rounded-lg transition-colors"
            >
              {t('login.cancel')}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
} 