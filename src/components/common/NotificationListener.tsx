'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useStore } from '@/stores';
import { useTranslation } from 'react-i18next';

export default function NotificationListener() {
  const searchParams = useSearchParams();
  const { handleAuthFailure } = useStore();
  const { t } = useTranslation();

  useEffect(() => {
    requestAnimationFrame(() => {
      const authError = searchParams.get('auth_error');
      if (authError) {
        // 清除 URL 参数
        const url = new URL(window.location.href);
        url.searchParams.delete('auth_error');
        window.history.replaceState({}, '', url);

        // 使用 i18next 翻译错误消息
        const translatedError = t(authError);
        handleAuthFailure(translatedError);
      }
    });
  }, [searchParams, handleAuthFailure, t]);

  return null;
}