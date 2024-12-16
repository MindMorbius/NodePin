'use client';

import { useTranslation } from 'react-i18next';
import { useRouter } from '@/hooks/useRouter';

export default function Disclaimer() {
  const { t } = useTranslation();
  const router = useRouter();
  
  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
        {t('disclaimer.title')}
      </h1>
      
      <div className="space-y-4 text-sm leading-relaxed">
        <section className="bg-[var(--card)] p-6 rounded-xl ring-1 ring-black/5">
          <h2 className="font-bold mb-3">{t('disclaimer.usage')}</h2>
          <p className="opacity-80">{t('disclaimer.usageContent')}</p>
        </section>

        <section className="bg-[var(--card)] p-6 rounded-xl ring-1 ring-black/5">
          <h2 className="font-bold mb-3">{t('disclaimer.responsibility')}</h2>
          <p className="opacity-80">{t('disclaimer.responsibilityContent')}</p>
        </section>

        <section className="bg-[var(--card)] p-6 rounded-xl ring-1 ring-black/5">
          <h2 className="font-bold mb-3">{t('disclaimer.privacy')}</h2>
          <p className="opacity-80">{t('disclaimer.privacyContent')}</p>
        </section>

        <div className="text-center mt-8">
          <button 
            onClick={() => router.push('/')}
            className="inline-flex px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            {t('common.backToHome')}
          </button>
        </div>
      </div>
    </main>
  );
} 