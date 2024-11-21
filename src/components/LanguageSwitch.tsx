'use client';

import { useStore } from '@/stores';

export default function LanguageSwitch() {
  const { language, setLanguage } = useStore();

  return (
    <select
      value={language}
      onChange={(e) => setLanguage(e.target.value)}
      className="px-3 py-2 bg-[var(--card)] rounded-lg border border-gray-200 hover:border-blue-500 transition-colors"
    >
      <option value="zh">中文</option>
      <option value="en">English</option>
      <option value="magic">魔法列车</option>
    </select>
  );
} 