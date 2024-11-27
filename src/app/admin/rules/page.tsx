'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/stores';
import { api } from '@/utils/api';
import { toast } from 'sonner';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface Rule {
  id: string;
  name: string;
  type: 'filter' | 'group';
  pattern: string;
  action: string;
  priority: number;
  enabled: boolean;
  created_at: string;
}

type RuleType = Rule['type'];
type ActionType = 'include' | 'exclude' | 'group';

export default function RuleManagement() {
  const router = useRouter();
  const { checkAuth } = useStore();
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingRule, setEditingRule] = useState<Partial<Rule> | null>(null);

  useEffect(() => {
    checkAuth().then(isAuth => {
      if (!isAuth) {
        router.push('/');
      } else {
        fetchRules();
      }
    });
  }, []);

  const fetchRules = async () => {
    setLoading(true);
    try {
      const response = await api.get<{ success: boolean; data: Rule[] }>('/admin/rules');
      if (response.data.success) {
        setRules(response.data.data);
      }
    } catch (error) {
      toast.error('获取规则失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editingRule?.name || !editingRule?.pattern) {
      toast.error('请填写完整规则信息');
      return;
    }

    try {
      if (editingRule.id) {
        // 更新现有规则
        const response = await api.put<{ success: boolean; data: Rule }>(
          `/admin/rules/${editingRule.id}`,
          editingRule
        );
        if (response.data.success) {
          setRules(prev => prev.map(rule => 
            rule.id === editingRule.id ? response.data.data : rule
          ));
          toast.success('更新规则成功');
        }
      } else {
        // 创建新规则
        const response = await api.post<{ success: boolean; data: Rule }>(
          '/admin/rules',
          editingRule
        );
        if (response.data.success) {
          setRules(prev => [...prev, response.data.data]);
          toast.success('创建规则成功');
        }
      }
      setEditingRule(null);
    } catch (error) {
      toast.error('保存规则失败');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这条规则吗？')) return;

    try {
      const response = await api.delete<{ success: boolean }>(`/admin/rules/${id}`);
      if (response.data.success) {
        setRules(prev => prev.filter(rule => rule.id !== id));
        toast.success('删除规则成功');
      }
    } catch (error) {
      toast.error('删除规则失败');
    }
  };

  const handleToggle = async (rule: Rule) => {
    try {
      const response = await api.patch<{ success: boolean; data: Rule }>(
        `/admin/rules/${rule.id}`,
        { enabled: !rule.enabled }
      );
      if (response.data.success) {
        setRules(prev => prev.map(r => 
          r.id === rule.id ? response.data.data : r
        ));
        toast.success(`${response.data.data.enabled ? '启用' : '禁用'}规则成功`);
      }
    } catch (error) {
      toast.error('更新规则状态失败');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">节点规则</h1>
        <button
          onClick={() => setEditingRule({ type: 'filter', action: 'include', priority: 0, enabled: true })}
          className="px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-lg transition-colors flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          添加规则
        </button>
      </div>

      {/* 规则编辑对话框 */}
      {editingRule && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-[var(--card)] rounded-xl p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">
                {editingRule.id ? '编辑规则' : '新建规则'}
              </h2>
              <button
                onClick={() => setEditingRule(null)}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">规则名称</label>
                <input
                  type="text"
                  value={editingRule.name || ''}
                  onChange={e => setEditingRule(prev => ({ ...prev!, name: e.target.value }))}
                  className="w-full p-2 border rounded"
                  placeholder="输入规则名称"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">规则类型</label>
                <select
                  value={editingRule.type}
                  onChange={e => setEditingRule(prev => ({ ...prev!, type: e.target.value as RuleType }))}
                  className="w-full p-2 border rounded"
                >
                  <option value="filter">过滤规则</option>
                  <option value="group">分组规则</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">匹配模式</label>
                <input
                  type="text"
                  value={editingRule.pattern || ''}
                  onChange={e => setEditingRule(prev => ({ ...prev!, pattern: e.target.value }))}
                  className="w-full p-2 border rounded"
                  placeholder="支持正则表达式"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">动作</label>
                <select
                  value={editingRule.action}
                  onChange={e => setEditingRule(prev => ({ ...prev!, action: e.target.value as ActionType }))}
                  className="w-full p-2 border rounded"
                >
                  <option value="include">包含</option>
                  <option value="exclude">排除</option>
                  {editingRule.type === 'group' && <option value="group">分组</option>}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">优先级</label>
                <input
                  type="number"
                  value={editingRule.priority || 0}
                  onChange={e => setEditingRule(prev => ({ ...prev!, priority: parseInt(e.target.value) }))}
                  className="w-full p-2 border rounded"
                  min="0"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editingRule.enabled}
                  onChange={e => setEditingRule(prev => ({ ...prev!, enabled: e.target.checked }))}
                  className="rounded"
                />
                <label className="text-sm">启用规则</label>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => setEditingRule(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-lg transition-colors"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 规则列表 */}
      <div className="space-y-4">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className={`bg-[var(--card)] hover:bg-[var(--card-hover)] p-4 rounded-lg transition-colors ${
              !rule.enabled ? 'opacity-60' : ''
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{rule.name}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    rule.type === 'filter' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                  }`}>
                    {rule.type === 'filter' ? '过滤' : '分组'}
                  </span>
                </div>
                <div className="text-sm text-gray-500 font-mono">
                  {rule.pattern}
                </div>
                <div className="text-xs text-gray-400 space-x-2">
                  <span>动作: {rule.action}</span>
                  <span>优先级: {rule.priority}</span>
                  <span>创建于: {new Date(rule.created_at).toLocaleString('zh-CN')}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleToggle(rule)}
                  className={`px-3 py-1 rounded ${
                    rule.enabled
                      ? 'text-green-600 hover:bg-green-50'
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {rule.enabled ? '已启用' : '已禁用'}
                </button>
                <button
                  onClick={() => setEditingRule(rule)}
                  className="px-3 py-1 text-blue-500 hover:bg-blue-50 rounded"
                >
                  编辑
                </button>
                <button
                  onClick={() => handleDelete(rule.id)}
                  className="px-3 py-1 text-red-500 hover:bg-red-50 rounded"
                >
                  删除
                </button>
              </div>
            </div>
          </div>
        ))}

        {rules.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-500">
            暂无规则数据
          </div>
        )}
      </div>
    </div>
  );
}
