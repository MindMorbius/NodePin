'use client';

import { useTranslation } from 'react-i18next';
import { usePathname } from 'next/navigation';
import { useRouter } from '@/hooks/useRouter';
import UserAvatar from './UserAvatar';
import { Cog6ToothIcon } from '@heroicons/react/24/solid';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useStore } from '@/stores';
import StatusDisplay from './StatusDisplay';

export default function Navbar() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();
  const {  } = useStore();

  const isAdmin = pathname.startsWith('/admin');

  return (
    <nav className="sticky top-0 z-50 bg-[var(--card)] backdrop-blur-xl bg-opacity-80 border-b border-black/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* 左侧区域: Logo + 状态显示 */}
          <div className="flex flex-col items-start">
            <div className="ml-3">
              <button 
                onClick={() => router.push('/')} 
                className="text-xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent"
              >
                NodePin
              </button>
            </div>
            <StatusDisplay />
          </div>

          {/* 右侧区域: 管理面板按钮和头像 */}
          <div className="flex-shrink-0 flex items-center gap-4">
            {!isAdmin && (
              <button
                onClick={() => router.push('/admin')}
                className="px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-lg transition-colors flex items-center gap-2">
                <Cog6ToothIcon className="w-5 h-5" />
                {t('common.adminPanel')}
              </button>
            )}
            {isAdmin && (
              <button
                onClick={() => router.back()}
                className="group flex items-center gap-2 px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-lg transition-colors"
                title={t('common.back')}
              >
                <ArrowLeftIcon className="w-5 h-5" />
                {t('common.back')}
              </button>
            )}
            <UserAvatar />
          </div>
        </div>
      </div>
    </nav>
  );
} 