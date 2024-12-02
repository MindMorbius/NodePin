'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/stores';
import { ClockIcon } from '@heroicons/react/24/outline';
import { formatDistanceStrict } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export default function SessionTimer() {
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const { checkSession } = useStore();

  useEffect(() => {
    const initSession = async () => {
      try {
        const { serverTime, expiresAt } = await checkSession();
        localStorage.setItem('sessionServerTime', serverTime.toString());
        localStorage.setItem('sessionExpiresAt', expiresAt.toString());
        
        setExpiresAt(expiresAt);
        setCurrentTime(serverTime);
      } catch (e) {
        setTimeLeft('无有效会话，请登录');
        setExpiresAt(null);
        setCurrentTime(null);
        localStorage.removeItem('sessionServerTime');
        localStorage.removeItem('sessionExpiresAt');
      }
    };
    initSession();
  }, []);

  useEffect(() => {
    if (currentTime) {
      const interval = setInterval(() => {
        setCurrentTime(prev => prev ? prev + 1000 : null);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [currentTime]);

  useEffect(() => {
    if (currentTime && expiresAt) {
      const diff = expiresAt - currentTime;
      if (diff <= 0) {
        const expiredDiff = currentTime - expiresAt;
        setTimeLeft(`已过期${formatDistanceStrict(
          new Date(currentTime - expiredDiff), 
          new Date(currentTime), 
          { locale: zhCN, addSuffix: true }
        )}`);
      } else {
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        const displayHours = hours > 0 ? `${hours}小时` : '';
        const displayMinutes = minutes % 60 > 0 ? `${minutes % 60}分钟` : '';
        const displaySeconds = `${seconds % 60}秒`;
        
        setTimeLeft(`将在${displayHours}${displayMinutes}${displaySeconds}后过期`);
      }
    }
  }, [currentTime, expiresAt]);

  if (!timeLeft) return null;

  return (
    <div className="flex items-center gap-1 text-sm text-gray-500">
      <ClockIcon className="w-4 h-4" />
      <span>会话{timeLeft}</span>
    </div>
  );
}