import { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';

interface UserCardProps {
  user: {
    name: string | null;
    username: string | null;
    avatar_url: string | null;
    trust_level: number;
  };
}

export default function UserCard({ user }: UserCardProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div 
        onClick={() => setIsOpen(true)}
        className="w-16 h-16 rounded-xl ring-1 ring-black/5 
          hover:shadow-xl transition-all duration-200 hover:-translate-y-1 
          cursor-pointer overflow-hidden bg-[var(--card)] p-2"
      >
        {user.avatar_url ? (
          <img 
            src={user.avatar_url} 
            alt={user.name || user.username || 'User'} 
            className="w-full h-full rounded-full hover:scale-110 transition-transform duration-200"
          />
        ) : (
          <UserCircleIcon className="w-full h-full text-gray-400" />
        )}
      </div>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog 
          as="div" 
          className="relative z-50" 
          onClose={() => setIsOpen(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="transform overflow-hidden rounded-2xl bg-[var(--card)] p-6 shadow-xl transition-all relative max-w-sm w-full">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="absolute right-4 top-4 rounded-lg p-1.5 hover:bg-black/5 transition-colors"
                  >
                    <XMarkIcon className="w-5 h-5 opacity-50" />
                  </button>

                  <div className="flex flex-col items-center text-center">
                    {user.avatar_url ? (
                      <img 
                        src={user.avatar_url} 
                        alt={user.name || user.username || 'User'} 
                        className="w-20 h-20 rounded-full"
                      />
                    ) : (
                      <UserCircleIcon className="w-20 h-20 text-gray-400" />
                    )}

                    <div className="mt-4 space-y-3 text-sm">
                      <div className="flex items-center gap-2 justify-center flex-wrap">
                        <span className="opacity-75">{t('user.name')}: </span>
                        <span className="font-medium break-all">{user.name}</span>
                      </div>
                      <div className="flex items-center gap-2 justify-center flex-wrap">
                        <span className="opacity-75">{t('user.username')}: </span>
                        <span className="font-medium break-all">{user.username}</span>
                      </div>
                      <div className="flex items-center gap-2 justify-center flex-wrap">
                        <span className="opacity-75">{t('user.trustLevel')}: </span>
                        <div className={`w-2 h-2 rounded-full ${getTrustLevelColor(user.trust_level)}`} />
                        <span className="font-mono text-sm opacity-75">{user.trust_level}</span>
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}

function getTrustLevelColor(level: number): string {
  switch (level) {
    case 4: return 'bg-purple-500';
    case 3: return 'bg-blue-500';
    case 2: return 'bg-green-500';
    case 1: return 'bg-yellow-500';
    default: return 'bg-gray-500';
  }
} 