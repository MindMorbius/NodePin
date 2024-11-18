import { Node } from '@/types/clash';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface NodeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  nodes: Node[];
}

export default function NodeDialog({ isOpen, onClose, nodes }: NodeDialogProps) {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />
      
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-5xl rounded-2xl bg-[var(--card)] p-6 shadow-2xl ring-1 ring-black/5">
            <div className="flex items-center justify-between mb-6">
              <Dialog.Title className="text-xl font-semibold">节点列表</Dialog.Title>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-[var(--card-hover)] transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[70vh] overflow-y-auto px-1">
              {nodes.map((node, idx) => (
                <div 
                  key={idx} 
                  className="group relative bg-[var(--card-hover)] rounded-xl p-4 ring-1 ring-black/10 
                    hover:shadow-lg hover:ring-[var(--primary)] transition-all duration-200 hover:-translate-y-0.5"
                >
                  <div className="font-medium truncate mb-3">{node.name}</div>
                  <div className="text-sm opacity-75 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-2 h-2 rounded-full bg-[var(--primary)]"></span>
                      {node.type}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
} 