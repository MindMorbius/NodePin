'use client';

import { useRouter } from 'next/navigation';
import { useStore } from '@/stores';
import { useEffect } from 'react';
import {
  DocumentDuplicateIcon,
  KeyIcon,
  AdjustmentsHorizontalIcon,
  QueueListIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import UserAvatar from '@/components/common/UserAvatar';

const adminMenus = [
  {
    name: '订阅管理',
    description: '管理订阅源和节点信息',
    icon: DocumentDuplicateIcon,
    href: '/admin/subscriptions'
  },
  {
    name: '令牌导入',
    description: '导入和管理访问令牌',
    icon: KeyIcon,
    href: '/admin/tokens'
  },
  {
    name: '密钥生成',
    description: '生成和管理加密密钥',
    icon: QueueListIcon,
    href: '/admin/keys'
  },
  {
    name: '节点规则',
    description: '配置节点过滤和分组规则',
    icon: AdjustmentsHorizontalIcon,
    href: '/admin/rules'
  }
];

export default function AdminPanel() {
  const router = useRouter();
  const { checkAuth } = useStore();

  useEffect(() => {
    checkAuth().then(isAuth => {
      if (!isAuth) {
        router.push('/');
      }
    });
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">管理面板</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {adminMenus.map((menu) => (
          <button
            key={menu.name}
            onClick={() => router.push(menu.href)}
            className="group p-6 bg-[var(--card)] hover:bg-[var(--card-hover)] rounded-xl ring-1 ring-black/5 
              transition-all duration-200 hover:-translate-y-1 hover:shadow-xl text-left"
          >
            <menu.icon className="w-8 h-8 mb-4 text-[var(--primary)] group-hover:text-[var(--primary-hover)] transition-colors" />
            <h3 className="text-lg font-semibold mb-2">{menu.name}</h3>
            <p className="text-sm opacity-60">{menu.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
