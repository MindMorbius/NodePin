'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { HomeIcon } from '@heroicons/react/24/outline';

export default function NotFound() {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-9xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
        404
      </h1>
      
      <p className="mt-6 text-xl opacity-60">
        {t('error.pageNotFound')}
      </p>
      
      <Link 
        href="/"
        className="mt-8 px-6 py-3 bg-[var(--primary)] hover:bg-[var(--primary-hover)] 
          text-white rounded-xl transition-colors flex items-center gap-2 group"
      >
        <HomeIcon className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
        {t('common.backToHome')}
      </Link>
    </div>
  );
}