'use client';

import { useEffect } from 'react';
import { useStore } from '@/stores';
import { useTranslation } from 'react-i18next';
import StatusBar from '@/components/page/StatusBar';
import Link from 'next/link';
import UserCard from '@/components/page/UserCard';
import SubscriptionPublicCard from '@/components/page/SubscriptionPublicCard';

export default function Home() {
  const { t } = useTranslation();
  const { 
    subscriptionsPublic,
    subscriptionsPublicLoading,
    subscriptionsPublicError,
    fetchSubscriptionsPublic,
    usersPublic,
    usersPublicLoading, 
    usersPublicError, 
    fetchUsersPublic
  } = useStore();

  useEffect(() => {
    fetchSubscriptionsPublic();
  }, [fetchSubscriptionsPublic]);

  useEffect(() => {
    fetchUsersPublic();
  }, [fetchUsersPublic]);

  return (
    <main className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
          {t('subscription.title')}
        </h1>
      </div>

      <StatusBar 
        subscriptions={subscriptionsPublic} 
        loading={subscriptionsPublicLoading}
        onRefresh={fetchSubscriptionsPublic}
      />

      {subscriptionsPublicError && (
        <div className="mb-6 p-4 bg-red-50 text-red-500 rounded-lg flex justify-between items-center">
          <span>{subscriptionsPublicError}</span>
          <button
            onClick={() => fetchSubscriptionsPublic()}
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
          >
            {t('subscription.retry')}
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subscriptionsPublic
          .filter(sub => sub.fetch_status !== 'failed')
          .map((sub) => (
            <SubscriptionPublicCard 
              key={sub.id}
              sub={{
                id: sub.id,
                name: sub.name || '',
                info: {
                  total: sub.total_traffic || 0,
                  upload: sub.upload_traffic || 0, 
                  download: sub.download_traffic || 0,
                  expire: sub.expire_time ? new Date(sub.expire_time).getTime() : 0  // 删除 /1000
                },
                nodeCount: sub.node_count || 0,
                loading: sub.fetch_status === 'loading',
                status: sub.fetch_status as 'loading' | 'show' | 'hide',
                error: sub.fetch_status === 'failed',
                dataUpdateTime: sub.data_update_time,
                updatedAt: sub.updated_at,
                createdAt: sub.created_at
              }}
              loading={sub.fetch_status === 'loading'}
            />
          ))}
      </div>
      
      <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent mt-12 mb-6">
        {t('user.users')}
      </h2>

      {usersPublicError && (
        <div className="mb-6 text-red-500">
          {usersPublicError}
        </div>  
      )}

      {usersPublicLoading ? (
        <div className="flex overflow-x-auto pb-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div 
              key={`skeleton-${i}`}
              className="w-[85px] flex-shrink-0 animate-pulse bg-gray-200 h-24 rounded-xl mr-4" 
            />
          ))}
        </div>
      ) : (
        <div className="flex overflow-x-auto pb-4">
          {usersPublic.map((user, index) => (
            <div key={`user-${user.id}-${index}`} className="w-[85px] flex-shrink-0">
              <UserCard user={user} />
            </div>
          ))}
        </div>
      )}

      <footer className="mt-8 text-center text-sm opacity-60">
        <Link href="/disclaimer" className="hover:underline">
          @ {t('common.disclaimer')}
        </Link>
      </footer>
    </main>
  );
}
