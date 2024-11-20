'use client';

import { useTranslation } from 'react-i18next';

export default function LanguageSwitch() {
  const { i18n } = useTranslation();

  return (
    <select
      value={i18n.language}
      onChange={(e) => i18n.changeLanguage(e.target.value)}
      className="px-3 py-2 bg-white rounded-lg border border-gray-200 hover:border-blue-500 transition-colors"
    >
      <option value="zh">中文</option>
      <option value="en">English</option>
      <option value="magic">魔法列车</option>
    </select>
  );
} 