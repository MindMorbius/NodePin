'use client';

import { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { useSession, signOut } from 'next-auth/react';
import { useTranslation } from 'react-i18next';
import Image from 'next/image';
import { UserCircleIcon, XMarkIcon, LanguageIcon, CheckCircleIcon, ArrowPathIcon, TicketIcon} from '@heroicons/react/24/solid';
import { useRouter } from 'next/navigation';
import LoginDialog from './LoginDialog';
import LanguageSwitch from './LanguageSwitch';
import { useStore } from '@/stores';
import { toast } from 'sonner';
import { format } from 'date-fns';

const SESSION_TOKEN_KEY = 'last-session-token';

interface TokenInfo {
  userId: string;
  exp: number;
  nbf: number;
  iat: number;
  signature: string;
}

export default function UserAvatar() {
  const router = useRouter();
  const { data: session } = useSession();
  const { t } = useTranslation();
  const { setAuthenticated, syncUserData, syncStatus, syncError, getTokenInfo } = useStore();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    const USER_ID_KEY = `user-id`;
    return localStorage.getItem(USER_ID_KEY);
  });
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);

  useEffect(() => {
    setAuthenticated(!!session);
  }, [session, setAuthenticated]);

  useEffect(() => {
    if (session?.user) {
      const lastToken = localStorage.getItem(SESSION_TOKEN_KEY);
      const currentToken = session.accessToken as string;

      if (lastToken !== currentToken) {
        localStorage.setItem(SESSION_TOKEN_KEY, currentToken);
        syncUserData();
        handleManualSync();
      }
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
      if (!session?.user?.id) return;
      const info = await getTokenInfo(session.user.id);
      setTokenInfo(info);
      setUserId(info.userId);
    } catch (error) {
      toast.error('Sync failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return format(new Date(timestamp * 1000), 'yyyy-MM-dd HH:mm:ss');
  };

  const getAvatarRingColor = () => {
    switch (syncStatus) {
      case 'syncing': return 'ring-blue-500 animate-pulse';
      case 'success': return 'ring-green-500';
      case 'error': return 'ring-red-500';
      default: return 'ring-[var(--primary)] hover:ring-[var(--primary-hover)]';
    }
  };

  return (
    <>
      <button
        onClick={handleAvatarClick}
        className={`relative w-10 h-10 rounded-full overflow-hidden ring-2 ${getAvatarRingColor()} transition-all`}
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
                  <div className={`relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0 ring-2 ${getAvatarRingColor()}`}>
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
                  <div className="flex items-center gap-2">
                    <span className="text-sm px-3 py-1 bg-gray-100 text-gray-700 rounded-full flex flex-col flex-grow">
                      <div className="flex items-center gap-1">
                        <TicketIcon className="w-4 h-4 flex-shrink-0 text-center" />
                        <span className="truncate" title={tokenInfo?.signature}>
                          {tokenInfo?.signature ? `${tokenInfo.signature.slice(0,25)}...` : 'Not synced'}
                        </span>
                      </div>
                    </span>
                    <button
                      onClick={handleManualSync}
                      className={`p-2 rounded-full hover:bg-gray-100 ${
                        syncStatus === 'syncing' ? 'animate-spin' : ''
                      }`}
                      disabled={syncStatus === 'syncing'}
                    >
                      <ArrowPathIcon className={`w-5 h-5 ${getSyncStatusColor()}`} />
                    </button>
                  </div>
                  {tokenInfo && (
                    <div className="space-y-2 text-sm">
                      <p>过期时间: {formatTimestamp(tokenInfo.exp)}</p>
                      <p>生效时间: {formatTimestamp(tokenInfo.nbf)}</p>
                      {/* <p>发行时间: {formatTimestamp(tokenInfo.iat)}</p> */}
                    </div>
                  )}
                  {syncStatus === 'error' && (
                    <p className="text-sm text-red-500">{syncError}</p>
                  )}
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