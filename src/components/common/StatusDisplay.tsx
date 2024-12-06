import { useState, useEffect } from 'react';
import { ArrowTopRightOnSquareIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { CloudIcon, CommandLineIcon } from '@heroicons/react/24/solid';
import { useStore } from '@/stores';

export default function StatusDisplay() {
  const { serverTime, fetchServerTime } = useStore();
  const [latency, setLatency] = useState<number | null>(null);
  const [hasError, setHasError] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const checkStatus = async () => {
    try {
      const start = Date.now();
      await fetchServerTime();
      const end = Date.now();
      setLatency(end - start);
      setHasError(false);
    } catch (error) {
      setHasError(true);
      setLatency(null);
    }
  };

  // 初始加载时检测一次
  useEffect(() => {
    checkStatus();
  }, []);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.status-display')) {
        setExpanded(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const getStatusColor = (latencyMs: number | null) => {
    if (hasError) return 'text-red-500';
    if (latencyMs === null) return 'text-gray-500 animate-pulse';
    if (latencyMs < 300) return 'text-green-500';
    if (latencyMs < 1000) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="relative status-display">
      <div className="flex items-start gap-4 text-sm">
        <div 
          className="flex items-center gap-1.5 cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <div className={`w-2 h-2 rounded-full ${getStatusColor(latency)}`} />
          <CloudIcon className="w-4 h-4 opacity-75" />
          <span className="opacity-75">DB</span>
        </div>
        <a
          href="https://status.linux.do"
          target="_blank"
          rel="noopener noreferrer" 
          className="flex items-center gap-1.5 text-[var(--primary)] hover:text-[var(--primary-hover)]"
        >
          <CommandLineIcon className="w-4 h-4 opacity-75" />
          <span>Linux.do</span>
          <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
        </a>
      </div>

      {expanded && (
        <div className="absolute top-full mt-2 bg-[var(--card)] rounded-lg shadow-lg ring-1 ring-black/5 p-4 min-w-[200px]">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="opacity-75">Supabase</span>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  checkStatus();
                }}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <ArrowPathIcon className="w-3.5 h-3.5 opacity-50" />
              </button>
            </div>
            {serverTime && (
              <span className="text-xs opacity-50">
                {new Date(serverTime).toLocaleTimeString('zh-CN')}
              </span>
            )}
            {latency && (
              <span className="text-xs opacity-50">
                延迟: {latency}ms
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 