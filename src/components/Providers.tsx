'use client';

import { PropsWithChildren } from 'react';
import { I18nextProvider } from 'react-i18next';
import { SessionProvider } from 'next-auth/react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import i18n from '@/i18n';

export default function Providers({ children }: PropsWithChildren) {
  return (
    <SessionProvider>
      <I18nextProvider i18n={i18n}>
        {children}
        <Analytics />
        <SpeedInsights />
      </I18nextProvider>
    </SessionProvider>
  );
}