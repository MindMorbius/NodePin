import { useState } from 'react';
import { TrashIcon, PencilIcon, ChevronDownIcon, ChevronUpIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { format, formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { toast } from 'sonner';

interface TokenCardProps {
  token: {
    token: string;
    expire_time: number;
    user_limit: number;
    duration_limit: number;
    trust_level_limit: number;
    created_at: string;
    user_count: number;
    last_used_at: string | null;
    type?: 'local' | 'cloud';
    status?: 'active' | 'hide' | 'delete' | 'expired';
  };
  onDelete: (token: string) => void;
  onRestore: (token: string) => void;
  onEdit: (token: TokenCardProps['token']) => void;
}

export default function TokenCard({ token, onDelete, onRestore, onEdit }: TokenCardProps) {
  const [expanded, setExpanded] = useState(false);

  const formatDate = (date: string | number | null) => {
    if (!date) return '从未使用';
    const d = typeof date === 'number' ? new Date(date) : new Date(date);
    return `${format(d, 'yyyy-MM-dd HH:mm')} (${formatDistanceToNow(d, { locale: zhCN, addSuffix: true })})`;
  };

  const handleCopyToken = async () => {
    try {
      await navigator.clipboard.writeText(token.token);
      toast.success('令牌已复制到剪贴板');
    } catch (error) {
      toast.error('复制失败');
    }
  };

  return (
    <div className="bg-[var(--card-hover)] p-4 rounded-lg space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <button 
              onClick={handleCopyToken}
              className="font-mono text-sm truncate block w-full text-left hover:text-[var(--primary)] transition-colors"
            >
              {token.token}
            </button>
            {token.status === 'delete' && (
              <span className="px-2 py-0.5 bg-red-50 text-red-600 text-xs rounded-full">
                已删除
              </span>
            )}
          </div>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors ml-4"
        >
          {expanded ? (
            <>
              <ChevronUpIcon className="w-4 h-4" />
              收起详情
            </>
          ) : (
            <>
              <ChevronDownIcon className="w-4 h-4" />
              查看详情
            </>
          )}
        </button>
      </div>

      {!expanded && (
        <div className="flex items-center gap-6 text-sm">
          <div>
            <span className="text-gray-500">使用次数: </span>
            <span>{token.user_count}</span>
          </div>
          <div>
            <span className="text-gray-500">最后使用: </span>
            <span>{formatDate(token.last_used_at) || '从未使用'}</span>
          </div>
        </div>
      )}

      {expanded && (
        <>


          <div className="grid grid-cols-4 gap-4 text-sm pt-2">
            <div>
              <div className="text-gray-500">过期时间</div>
              <div>{token.expire_time ? formatDate(token.expire_time) : '永不过期'}</div>
            </div>
            
            <div>
              <div className="text-gray-500">使用限制</div>
              <div>{token.user_limit ? `${token.user_count}/${token.user_limit}` : '无限制'}</div>
            </div>
            
            <div>
              <div className="text-gray-500">信任等级</div>
              <div>≥ Level {token.trust_level_limit}</div>
            </div>
            
            <div>
              <div className="text-gray-500">使用期限</div>
              <div>{token.duration_limit ? `${token.duration_limit}天` : '永久有效'}</div>
            </div>
            
            <div>
              <div className="text-gray-500">创建时间</div>
              <div>{formatDate(token.created_at)}</div>
            </div>

            <div>
              <div className="text-gray-500">使用次数</div>
              <div>{token.user_count}</div>
            </div>

            <div className="col-span-2">
              <div className="text-gray-500">最后使用</div>
              <div>{formatDate(token.last_used_at)}</div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <button
              onClick={() => onEdit(token)}
              className="p-1.5 text-gray-500 hover:bg-gray-500/10 rounded-lg transition-colors flex items-center gap-1"
            >
              <PencilIcon className="w-4 h-4" />
              编辑
            </button>
            {token.status === 'delete' ? (
              <button
                onClick={() => onRestore(token.token)}
                className="p-1.5 text-green-500 hover:bg-green-500/10 rounded-lg transition-colors flex items-center gap-1"
              >
                <ArrowPathIcon className="w-4 h-4" />
                恢复
              </button>
            ) : (
              <button
                onClick={() => onDelete(token.token)}
                className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors flex items-center gap-1"
              >
                <TrashIcon className="w-4 h-4" />
                删除
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}