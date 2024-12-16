import { useRouter } from 'next/navigation';
import { create } from 'zustand';

interface NavigationStore {
  isNavigating: boolean;
  startNavigation: () => void;
  endNavigation: () => void;
}

export const useNavigationStore = create<NavigationStore>((set) => ({
  isNavigating: false,
  startNavigation: () => set({ isNavigating: true }),
  endNavigation: () => set({ isNavigating: false })
}));

export function useCustomRouter() {
  const router = useRouter();
  const { startNavigation, endNavigation } = useNavigationStore();

  const customPush = async (path: string) => {
    startNavigation();
    
    try {
      router.push(path);
      const response = await fetch(`${path}?_rsc=16juu`);
      if (!response.ok) {
        throw new Error('Navigation failed');
      }
      
      setTimeout(endNavigation, 100);
    } catch (error) {
      console.error('Navigation error:', error);
      endNavigation();
    }
  };

  const customReplace = async (path: string) => {
    startNavigation();
    
    try {
      router.replace(path);
      const response = await fetch(`${path}?_rsc=16juu`);
      if (!response.ok) {
        throw new Error('Navigation failed');
      }
      
      setTimeout(endNavigation, 100);
    } catch (error) {
      console.error('Navigation error:', error);
      endNavigation();
    }
  };

  const customBack = () => {
    startNavigation();
    router.back();
    setTimeout(endNavigation, 100);
  };

  return { 
    ...router, 
    push: customPush,
    replace: customReplace,
    back: customBack
  };
}

// 直接导出增强版的 useRouter
export { useCustomRouter as useRouter } from '@/hooks/useRouter'; 