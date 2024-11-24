'use client';

import { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { useSession, signOut } from 'next-auth/react';
import { useTranslation } from 'react-i18next';
import Image from 'next/image';
import { UserCircleIcon, XMarkIcon, LanguageIcon, CheckCircleIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
import { useRouter } from 'next/navigation';
import LoginDialog from './LoginDialog';
import LanguageSwitch from './LanguageSwitch';
import { useStore } from '@/stores';
import { toast } from 'sonner';

export default function UserAvatar() {
  const router = useRouter();
  const { data: session } = useSession();
  const { t } = useTranslation();
  const { setAuthenticated, syncUserData, syncStatus, syncError} = useStore();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  useEffect(() => {
    setAuthenticated(!!session);
  }, [session, setAuthenticated]);

  useEffect(() => {
    if (session?.user) {
      fetch('/api/auth/sync', { method: 'POST' })
        .then(async (res) => {
          toast.info('正在同步账号数据...');
          if (res.ok) {
            toast.success('账号数据同步成功');
          } else {
            const data = await res.json();
            throw new Error(data.error || '同步失败');
          }
        })
        .catch((error) => {
          toast.error(`账号数据同步失败: ${error.message}`);
        });
    }
  }, [session?.user?.id]);

  const handleAvatarClick = () => {
    if (session) {
      setIsProfileOpen(true);
    } else {
      setIsLoginOpen(true);
    }
  };

  const getSyncStatusColor = () => {
    switch (syncStatus) {
      case 'syncing': return 'text-blue-500';
      case 'success': return 'text-green-500';
      case 'error': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getSyncStatusText = () => {
    switch (syncStatus) {
      case 'syncing': return t('sync.syncing');
      case 'success': return t('sync.success');
      case 'error': return syncError || t('sync.error');
      default: return '';
    }
  };

  const handleManualSync = async () => {
    try {
      await syncUserData();
    } catch (error) {
    }
  };

  return (
    <>
      <button
        onClick={handleAvatarClick}
        className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-[var(--primary)] hover:ring-[var(--primary-hover)] transition-all"
      >
        {session?.user?.image ? (
          <Image
            src={session.user.image}
            alt="User Avatar"
            fill
            className="object-cover"
          />
        ) : (
          <UserCircleIcon className="w-full h-full text-[var(--primary)]" />
        )}
      </button>

      <Dialog 
        open={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-[var(--card)] rounded-xl p-6 w-full max-w-sm ring-1 ring-black/5 relative">
            <button
              onClick={() => setIsProfileOpen(false)}
              className="absolute right-3 top-3 p-1 text-gray-500 hover:text-gray-700 transition-colors rounded-lg hover:bg-gray-100"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>

            {session ? (
              <>
                <div className="flex items-start gap-4 mb-6 pt-2">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-[var(--primary)]">
                    {session.user?.image ? (
                      <Image
                        src={session.user.image}
                        alt="User Avatar"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <UserCircleIcon className="w-full h-full text-[var(--primary)]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 pt-1">
                    <h3 className="font-bold text-lg truncate">
                      {session.user?.name}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">
                      @{session.user?.username}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {session.user?.email}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <span className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded-full flex items-center gap-1">
                      <UserCircleIcon className="w-4 h-4" />
                      {t('user.trustLevel')} {session.user?.trustLevel}
                    </span>
                    {session.user?.active && (
                      <span className="text-sm px-3 py-1 bg-green-100 text-green-700 rounded-full flex items-center gap-1">
                        <CheckCircleIcon className="w-4 h-4" />
                        {t('user.active')}
                      </span>
                    )}
                    {session.user?.silenced && (
                      <span className="text-sm px-3 py-1 bg-red-100 text-red-700 rounded-full flex items-center gap-1">
                        <XMarkIcon className="w-4 h-4" />
                        {t('user.silenced')}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 text-white">
                    <div className="flex items-center gap-2 text-gray-500 text-white">
                      <LanguageIcon className="w-5 h-5" />
                      <LanguageSwitch />
                    </div>
                    <button
                      onClick={() => {
                        signOut();
                        setIsProfileOpen(false);
                      }}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                      
                      {t('login.logout')}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={handleManualSync}
                    disabled={syncStatus === 'syncing'}
                    className={`px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                      syncStatus === 'syncing' ? 'animate-pulse' : ''
                    }`}
                  >
                    {syncStatus === 'syncing' ? (
                      <>
                        <ArrowPathIcon className="w-4 h-4 animate-spin" />
                        {t('sync.syncing')}
                      </>
                    ) : (
                      <>
                        <ArrowPathIcon className="w-4 h-4" />
                        {t('sync.sync')}
                      </>
                    )}
                  </button>
                  
                  {syncStatus !== 'idle' && (
                    <span className={`text-sm ${getSyncStatusColor()}`}>
                      {getSyncStatusText()}
                    </span>
                  )}
                </div>
                
              </>
            ) : (
              <div className="text-center py-8">
                <p className="mb-4 text-gray-600">{t('login.required')}</p>
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    setIsLoginOpen(true);
                  }}
                  className="px-6 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-lg transition-colors"
                >
                  {t('login.title')}
                </button>
              </div>
            )}
          </Dialog.Panel>
        </div>
      </Dialog>

      <LoginDialog 
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
      />
    </>
  );
}