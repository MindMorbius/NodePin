import { StateCreator } from 'zustand';
import i18n from '@/i18n';
import { StoreState } from '../types';

export interface I18nSlice {
  language: string;
  setLanguage: (lang: string) => void;
}

export const createI18nSlice: StateCreator<
  StoreState,
  [],
  [],
  I18nSlice
> = (set) => ({
  language: i18n.language,
  
  setLanguage: (lang) => {
    i18n.changeLanguage(lang);
    set({ language: lang });
  }
}); 