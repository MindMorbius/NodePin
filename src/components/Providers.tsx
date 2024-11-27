'use client';

import { PropsWithChildren } from 'react';
import { I18nextProvider } from 'react-i18next';
import { SessionProvider } from 'next-auth/react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Toaster } from 'sonner';
import i18n from '@/i18n';

export default function Providers({ children }: PropsWithChildren) {
  return (
    <SessionProvider
      refetchOnWindowFocus={false}
      refetchWhenOffline={false}
    >
      <I18nextProvider i18n={i18n}>
        {children}
        <Analytics />
        <SpeedInsights />
        <Toaster 
          position="top-left" // 位置：top-left, top-center, top-right, bottom-left, bottom-center, bottom-right
          expand={true} // 是否展开显示
          richColors={true} // 使用丰富的预设颜色
          duration={2000} // 显示时长(ms)
          closeButton={true} // 显示关闭按钮
          theme="system" // light, dark, system
        />
      </I18nextProvider>
    </SessionProvider>
  );
}